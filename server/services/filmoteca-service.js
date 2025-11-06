/**
 * Filmoteca Service
 * Handles fetching and parsing Filmoteca data
 */

import fetch from 'node-fetch';
import { FilmotecaParser } from '../parsers/filmoteca-parser.js';
import { DataStore } from '../utils/data-store.js';
import { TMDBService } from './tmdb-service.js';

export class FilmotecaService {
    constructor() {
        this.parser = new FilmotecaParser();
        this.dataStore = new DataStore();
        this.tmdbService = new TMDBService();
        this.baseUrl = 'https://www.filmoteca.cat/web/ca/view-agenda-mensual';
    }

    /**
     * Fetch and parse Filmoteca data for a given month
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
                    console.log(`Using cached data for ${month}`);
                    return cachedData.movies;
                }
            }

            console.log(`Fetching fresh data for ${month} from Filmoteca...`);

            // Fetch HTML from Filmoteca
            const url = `${this.baseUrl}?m=${month}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();

            // Parse the HTML
            let movies = this.parser.parseString(html, month);

            // Enrich with TMDB metadata (posters, runtime, directors)
            console.log(`Enriching ${movies.length} movies with metadata...`);
            movies = await this.tmdbService.enrichMovies(movies);

            // Save to storage
            this.dataStore.saveMonthData(month, movies, 'Filmoteca de Catalunya');

            console.log(`Parsed and enriched ${movies.length} movies for ${month}`);
            return movies;
        } catch (error) {
            console.error(`Error fetching Filmoteca data for ${month}:`, error);

            // Try to return cached data even if expired
            const cachedData = this.dataStore.getMonthData(month);
            if (cachedData) {
                console.log('Returning stale cached data due to error');
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
