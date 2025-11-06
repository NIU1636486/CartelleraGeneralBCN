/**
 * Data Store
 * Simple file-based storage for movie data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DataStore {
    constructor(theaterSlug = 'filmoteca') {
        this.theaterSlug = theaterSlug;
        this.dataDir = path.join(__dirname, '../data');
        this.ensureDataDir();
    }

    /**
     * Ensure data directory exists
     */
    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * Get file path for a month
     */
    getMonthFilePath(month) {
        return path.join(this.dataDir, `${this.theaterSlug}-${month}.json`);
    }

    /**
     * Save month data
     * @param {string} month - Month in YYYY-MM format
     * @param {Array} movies - Array of movie objects
     * @param {string} theaterName - Full theater name for metadata
     */
    saveMonthData(month, movies, theaterName = null) {
        const data = {
            month,
            theater: theaterName || this.theaterSlug,
            lastUpdated: new Date().toISOString(),
            totalMovies: movies.length,
            movies
        };

        const filePath = this.getMonthFilePath(month);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved ${movies.length} movies to ${filePath}`);
    }

    /**
     * Get month data
     * @param {string} month - Month in YYYY-MM format
     * @returns {Object|null} Month data or null if not found
     */
    getMonthData(month) {
        const filePath = this.getMonthFilePath(month);

        if (!fs.existsSync(filePath)) {
            return null;
        }

        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Get all stored months
     * @returns {Array} Array of month strings
     */
    getAllMonths() {
        const files = fs.readdirSync(this.dataDir);
        return files
            .filter(f => f.startsWith(`${this.theaterSlug}-`) && f.endsWith('.json'))
            .map(f => f.replace(`${this.theaterSlug}-`, '').replace('.json', ''))
            .sort();
    }

    /**
     * Get all movies from all stored months
     * @returns {Array} All movies
     */
    getAllMovies() {
        const months = this.getAllMonths();
        const allMovies = [];

        months.forEach(month => {
            const data = this.getMonthData(month);
            if (data && data.movies) {
                allMovies.push(...data.movies);
            }
        });

        return allMovies;
    }

    /**
     * Clear all data
     */
    clearAll() {
        const months = this.getAllMonths();
        months.forEach(month => {
            const filePath = this.getMonthFilePath(month);
            fs.unlinkSync(filePath);
        });
        console.log('Cleared all cached data');
    }

    /**
     * Get storage statistics
     */
    getStats() {
        const months = this.getAllMonths();
        const allMovies = this.getAllMovies();

        return {
            totalMonths: months.length,
            totalMovies: allMovies.length,
            months: months.map(month => {
                const data = this.getMonthData(month);
                return {
                    month,
                    movieCount: data?.totalMovies || 0,
                    lastUpdated: data?.lastUpdated
                };
            })
        };
    }
}
