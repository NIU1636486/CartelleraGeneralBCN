/**
 * API Service
 * Handles all API requests to the backend
 */

// Use environment variable if set, otherwise detect based on mode
// In production, API is served from same origin. In dev, use localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:3001');

class ApiService {
    /**
     * Get movies for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {boolean} refresh - Force refresh data
     * @returns {Promise<Array>} Array of movies
     */
    async getMoviesForDate(date, refresh = false) {
        try {
            const url = `${API_BASE_URL}/api/movies/date/${date}${refresh ? '?refresh=true' : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.movies || [];
        } catch (error) {
            console.error('Error fetching movies for date:', error);
            throw error;
        }
    }

    /**
     * Get movies for a specific month
     * @param {string} month - Month in YYYY-MM format
     * @param {boolean} refresh - Force refresh data
     * @returns {Promise<Array>} Array of movies
     */
    async getMoviesForMonth(month, refresh = false) {
        try {
            const url = `${API_BASE_URL}/api/movies/month/${month}${refresh ? '?refresh=true' : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.movies || [];
        } catch (error) {
            console.error('Error fetching movies for month:', error);
            throw error;
        }
    }

    /**
     * Get all movies
     * @returns {Promise<Array>} Array of all movies
     */
    async getAllMovies() {
        try {
            const url = `${API_BASE_URL}/api/movies`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.movies || [];
        } catch (error) {
            console.error('Error fetching all movies:', error);
            throw error;
        }
    }

    /**
     * Refresh data
     * @param {Object} options - Refresh options
     * @param {string} options.date - Specific date to refresh
     * @param {string} options.month - Specific month to refresh
     * @returns {Promise<Array>} Array of refreshed movies
     */
    async refresh({ date, month } = {}) {
        try {
            const url = `${API_BASE_URL}/api/refresh`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date, month })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.movies || [];
        } catch (error) {
            console.error('Error refreshing data:', error);
            throw error;
        }
    }

    /**
     * Get storage statistics
     * @returns {Promise<Object>} Storage stats
     */
    async getStats() {
        try {
            const url = `${API_BASE_URL}/api/stats`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.stats || {};
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }

    /**
     * Check if server is healthy
     * @returns {Promise<boolean>} Server health status
     */
    async healthCheck() {
        try {
            const url = `${API_BASE_URL}/health`;
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

export const apiService = new ApiService();
