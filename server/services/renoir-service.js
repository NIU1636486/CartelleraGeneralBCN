/**
 * Renoir Floridablanca Service
 * Handles fetching and parsing Renoir cinema data using JSON-LD
 */

import fetch from 'node-fetch';
import { RenoirParser } from '../parsers/renoir-parser.js';
import { DataStore } from '../utils/data-store.js';
import { TMDBService } from './tmdb-service.js';

export class RenoirService {
    constructor() {
        this.parser = new RenoirParser();
        this.dataStore = new DataStore('renoir');
        this.tmdbService = new TMDBService();
        this.baseUrl = 'https://www.cinesrenoir.com';
        this.carteleraUrl = `${this.baseUrl}/cine/renoir-floridablanca/cartelera/`;
    }

    /**
     * Fetch and parse Renoir data for a given month
     * @param {string} month - Month in YYYY-MM format
     * @param {boolean} forceRefresh - Force refresh even if data exists
     * @returns {Promise<Array>} Array of movie objects
     */
    async getMoviesForMonth(month, forceRefresh = false) {
        try {
            // Check if we already have this data and it's recent
            if (!forceRefresh) {
                const cachedData = this.dataStore.getMonthData(month);
                if (cachedData) {
                    console.log(`Using cached Renoir data for ${month}`);
                    return cachedData.movies;
                }
            }

            console.log(`Fetching fresh data from Renoir Floridablanca...`);

            // Fetch the cartelera page
            const carteleraResponse = await fetch(this.carteleraUrl);
            if (!carteleraResponse.ok) {
                throw new Error(`Failed to fetch cartelera: ${carteleraResponse.status}`);
            }

            const carteleraHtml = await carteleraResponse.text();

            // Extract movie URLs
            const movieUrls = this.parser.parseString(carteleraHtml);
            console.log(`Found ${movieUrls.length} movies, fetching details...`);

            // Fetch and parse each movie page
            const parsedMovies = [];
            for (const url of movieUrls) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const html = await response.text();
                        const parsed = this.parser.parseMoviePage(html, url);

                        if (parsed.title && Object.keys(parsed.showtimesByDate).length > 0) {
                            parsedMovies.push(parsed);
                        }
                    }

                    // Rate limiting - be nice to the server
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (err) {
                    console.error(`Error fetching ${url}:`, err.message);
                }
            }

            // Format movies and filter by month
            let allMovies = this.parser.formatMovies(parsedMovies);
            const movies = allMovies.filter(movie => movie.date && movie.date.startsWith(month));

            // Group movies to combine duplicate entries
            const groupedMovies = this.parser.groupMovies(movies);

            // Enrich with TMDB metadata
            console.log(`Enriching ${groupedMovies.length} Renoir movies with metadata...`);
            const enrichedMovies = await this.tmdbService.enrichMovies(groupedMovies);

            // Save to storage
            this.dataStore.saveMonthData(month, enrichedMovies, 'Renoir Floridablanca');

            console.log(`Parsed and enriched ${enrichedMovies.length} Renoir movies for ${month}`);
            return enrichedMovies;
        } catch (error) {
            console.error(`Error fetching Renoir data for ${month}:`, error);

            // Try to return cached data even if expired
            const cachedData = this.dataStore.getMonthData(month);
            if (cachedData) {
                console.log('Returning stale cached Renoir data due to error');
                return cachedData.movies;
            }

            throw error;
        }
    }

    /**
     * Get movies for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {boolean} forceRefresh - Force refresh
     * @returns {Promise<Array>} Array of movie objects for that date
     */
    async getMoviesForDate(date, forceRefresh = false) {
        const month = date.substring(0, 7); // Extract YYYY-MM
        const allMovies = await this.getMoviesForMonth(month, forceRefresh);
        return allMovies.filter(movie => movie.date === date);
    }

    /**
     * Get all movies from storage
     * @returns {Array} All movies
     */
    getAllMovies() {
        return this.dataStore.getAllMovies();
    }

    /**
     * Check if cache is still valid (less than 6 hours old)
     */
    isCacheValid(lastUpdated) {
        const SIX_HOURS = 6 * 60 * 60 * 1000;
        const cacheAge = Date.now() - new Date(lastUpdated).getTime();
        return cacheAge < SIX_HOURS;
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.dataStore.clearAll();
    }
}
