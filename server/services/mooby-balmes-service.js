/**
 * Mooby Balmes Service
 * Handles fetching and parsing Mooby Balmes cinema data
 */

import fetch from 'node-fetch';
import { MoobyParser } from '../parsers/mooby-parser.js';
import { DataStore } from '../utils/data-store.js';
import { TMDBService } from './tmdb-service.js';

export class MoobyBalmesService {
    constructor() {
        this.parser = new MoobyParser('BAL-BALMES', 'Mooby Balmes');
        this.dataStore = new DataStore('mooby-balmes');
        this.tmdbService = new TMDBService();
        this.baseUrl = 'https://www.moobycinemas.com';
    }

    /**
     * Fetch and parse Mooby Balmes data for a given month
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
                    console.log(`Using cached Mooby Balmes data for ${month}`);
                    return cachedData.movies;
                }
            }

            console.log(`Fetching fresh data from Mooby Balmes...`);

            // Fetch the main page
            const response = await fetch(this.baseUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch Mooby page: ${response.status}`);
            }

            const html = await response.text();

            // Parse movies
            const parsedMovies = this.parser.parseString(html);
            console.log(`Parsed ${parsedMovies.length} events from Mooby Balmes`);

            // Format movies and filter by month
            let allMovies = this.parser.formatMovies(parsedMovies);
            const movies = allMovies.filter(movie => movie.date && movie.date.startsWith(month));

            // Group movies to combine duplicate entries
            const groupedMovies = this.parser.groupMovies(movies);

            // Enrich with TMDB metadata
            console.log(`Enriching ${groupedMovies.length} Mooby Balmes movies with metadata...`);
            const enrichedMovies = await this.tmdbService.enrichMovies(groupedMovies);

            // Save to storage
            this.dataStore.saveMonthData(month, enrichedMovies, 'Mooby Balmes');

            console.log(`Parsed and enriched ${enrichedMovies.length} Mooby Balmes movies for ${month}`);
            return enrichedMovies;
        } catch (error) {
            console.error(`Error fetching Mooby Balmes data for ${month}:`, error);

            // Try to return cached data even if expired
            const cachedData = this.dataStore.getMonthData(month);
            if (cachedData) {
                console.log('Returning stale cached Mooby Balmes data due to error');
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
