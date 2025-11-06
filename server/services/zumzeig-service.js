/**
 * Zumzeig Service
 * Handles fetching and parsing Zumzeig cinema data
 */

import fetch from 'node-fetch';
import { ZumzeigParser } from '../parsers/zumzeig-parser.js';
import { DataStore } from '../utils/data-store.js';
import { TMDBService } from './tmdb-service.js';

export class ZumzeigService {
    constructor() {
        this.parser = new ZumzeigParser();
        this.dataStore = new DataStore('zumzeig');
        this.tmdbService = new TMDBService();
        this.baseUrl = 'https://zumzeigcine.coop/cinema/sessions/';
    }

    /**
     * Fetch and parse Zumzeig data for a given month
     * Note: Zumzeig shows all upcoming sessions on one page, we filter by month
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
                    console.log(`Using cached Zumzeig data for ${month}`);
                    return cachedData.movies;
                }
            }

            console.log(`Fetching fresh data from Zumzeig...`);

            // Fetch HTML from Zumzeig
            const response = await fetch(this.baseUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();

            // Parse the HTML
            let allMovies = this.parser.parseString(html);

            // Filter movies for the requested month
            const movies = allMovies.filter(movie => movie.date && movie.date.startsWith(month));

            // Enrich with TMDB metadata (posters, runtime, directors)
            console.log(`Enriching ${movies.length} Zumzeig movies with metadata...`);
            const enrichedMovies = await this.tmdbService.enrichMovies(movies);

            // Save to storage
            this.dataStore.saveMonthData(month, enrichedMovies, 'Zumzeig');

            console.log(`Parsed and enriched ${enrichedMovies.length} Zumzeig movies for ${month}`);
            return enrichedMovies;
        } catch (error) {
            console.error(`Error fetching Zumzeig data for ${month}:`, error);

            // Try to return cached data even if expired
            const cachedData = this.dataStore.getMonthData(month);
            if (cachedData) {
                console.log('Returning stale cached Zumzeig data due to error');
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
