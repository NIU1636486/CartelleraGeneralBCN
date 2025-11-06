/**
 * The Movie Database (TMDB) API Service
 * Free API for movie metadata, posters, runtime, etc.
 * Get your free API key at: https://www.themoviedb.org/settings/api
 */

import fetch from 'node-fetch';

export class TMDBService {
    constructor() {
        // Get API key from environment variable or use a placeholder
        this.apiKey = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY_HERE';
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p';
        this.enabled = this.apiKey && this.apiKey !== 'YOUR_TMDB_API_KEY_HERE';

        if (!this.enabled) {
            console.warn('⚠️  TMDB API key not configured. Movie metadata will not be fetched.');
            console.warn('   Get a free API key at: https://www.themoviedb.org/settings/api');
            console.warn('   Then set TMDB_API_KEY environment variable');
        }
    }

    /**
     * Search for a movie by title
     * @param {string} title - Movie title to search
     * @param {number} year - Optional release year
     * @returns {Promise<Object|null>} Movie data or null
     */
    async searchMovie(title, year = null) {
        if (!this.enabled) return null;

        try {
            // Clean up the title (remove special characters, extra text)
            const cleanTitle = this.cleanTitle(title);

            let url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(cleanTitle)}`;

            if (year) {
                url += `&year=${year}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                console.error(`TMDB API error: ${response.status}`);
                return null;
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                // Return the first result (usually the most relevant)
                return data.results[0];
            }

            return null;
        } catch (error) {
            console.error(`Error searching TMDB for "${title}":`, error.message);
            return null;
        }
    }

    /**
     * Get detailed movie information
     * @param {number} movieId - TMDB movie ID
     * @returns {Promise<Object|null>} Detailed movie data
     */
    async getMovieDetails(movieId) {
        if (!this.enabled) return null;

        try {
            const url = `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching TMDB details for movie ${movieId}:`, error.message);
            return null;
        }
    }

    /**
     * Get movie credits (cast and crew)
     * @param {number} movieId - TMDB movie ID
     * @returns {Promise<Object|null>} Credits data
     */
    async getMovieCredits(movieId) {
        if (!this.enabled) return null;

        try {
            const url = `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching TMDB credits for movie ${movieId}:`, error.message);
            return null;
        }
    }

    /**
     * Extract poster image from cinema website HTML
     * @param {string} url - Movie page URL
     * @returns {Promise<string>} Poster URL or empty string
     */
    async extractPosterFromWebsite(url) {
        if (!url) return '';

        try {
            const response = await fetch(url);
            if (!response.ok) return '';

            const html = await response.text();

            // Try common meta tags for images (used for social sharing)
            const patterns = [
                /<meta property="og:image" content="([^"]+)"/i,
                /<meta name="twitter:image" content="([^"]+)"/i,
                /<meta property="og:image:url" content="([^"]+)"/i,
                /<img[^>]+class="[^"]*poster[^"]*"[^>]+src="([^"]+)"/i,
                /<img[^>]+src="([^"]+)"[^>]+class="[^"]*poster[^"]*"/i
            ];

            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    let posterUrl = match[1];

                    // Handle relative URLs
                    if (posterUrl.startsWith('/')) {
                        const urlObj = new URL(url);
                        posterUrl = `${urlObj.protocol}//${urlObj.host}${posterUrl}`;
                    }

                    return posterUrl;
                }
            }

            return '';
        } catch (error) {
            console.error(`Error extracting poster from ${url}:`, error.message);
            return '';
        }
    }

    /**
     * Enrich movie data with TMDB metadata
     * @param {Object} movie - Movie object from Filmoteca parser
     * @returns {Promise<Object>} Enriched movie object
     */
    async enrichMovieData(movie) {
        if (!this.enabled) {
            // Even if TMDB is disabled, try to get poster from website
            let poster = movie.poster || '';
            if (!poster && movie.filmUrl) {
                poster = await this.extractPosterFromWebsite(movie.filmUrl);
            }
            return { ...movie, poster };
        }

        try {
            // Search for the movie
            const searchResult = await this.searchMovie(movie.title);

            if (!searchResult) {
                // No TMDB result, try to get poster from website
                let poster = movie.poster || '';
                if (!poster && movie.filmUrl) {
                    poster = await this.extractPosterFromWebsite(movie.filmUrl);
                }
                return { ...movie, poster };
            }

            // Get detailed information
            const [details, credits] = await Promise.all([
                this.getMovieDetails(searchResult.id),
                this.getMovieCredits(searchResult.id)
            ]);

            // Extract director from credits
            let director = movie.director || '';
            if (credits && credits.crew) {
                const directors = credits.crew
                    .filter(person => person.job === 'Director')
                    .map(person => person.name);
                if (directors.length > 0) {
                    director = directors.join(', ');
                }
            }

            // Get poster URL - try TMDB first, fallback to website
            let poster = movie.poster || '';
            if (searchResult.poster_path) {
                // Use w500 size for posters (good balance between quality and size)
                poster = `${this.imageBaseUrl}/w500${searchResult.poster_path}`;
            } else if (movie.filmUrl) {
                // TMDB doesn't have poster, try to get it from the cinema website
                poster = await this.extractPosterFromWebsite(movie.filmUrl);
            }

            // Update movie object with TMDB data
            return {
                ...movie,
                director,
                duration: details?.runtime || movie.duration,
                poster,
                rating: searchResult.vote_average ? `${searchResult.vote_average}/10` : movie.rating,
                plot: searchResult.overview || '',
                tmdbId: searchResult.id,
                originalTitle: searchResult.original_title || movie.title,
                releaseYear: searchResult.release_date ? new Date(searchResult.release_date).getFullYear() : null
            };
        } catch (error) {
            console.error(`Error enriching movie "${movie.title}":`, error.message);
            return movie;
        }
    }

    /**
     * Enrich multiple movies with TMDB data
     * @param {Array} movies - Array of movie objects
     * @param {number} delayMs - Delay between requests to avoid rate limiting
     * @returns {Promise<Array>} Array of enriched movies
     */
    async enrichMovies(movies, delayMs = 250) {
        if (!this.enabled) {
            console.log('TMDB service disabled, skipping metadata enrichment');
            return movies;
        }

        console.log(`Enriching ${movies.length} movies with TMDB data...`);
        const enrichedMovies = [];

        for (const movie of movies) {
            const enriched = await this.enrichMovieData(movie);
            enrichedMovies.push(enriched);

            // Add delay to respect rate limits (40 requests per 10 seconds)
            if (delayMs > 0) {
                await this.delay(delayMs);
            }
        }

        const enrichedCount = enrichedMovies.filter(m => m.poster || m.duration).length;
        console.log(`✅ Successfully enriched ${enrichedCount}/${movies.length} movies`);

        return enrichedMovies;
    }

    /**
     * Clean title for better search results
     */
    cleanTitle(title) {
        // Remove common suffixes and special characters
        return title
            .replace(/\s*\|.*$/, '') // Remove everything after |
            .replace(/\s*\(.*?\)\s*/g, ' ') // Remove parentheses content
            .replace(/[^\w\s\-']/g, ' ') // Remove special chars except apostrophes and hyphens
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get poster URL for different sizes
     * Sizes: w92, w154, w185, w342, w500, w780, original
     */
    getPosterUrl(posterPath, size = 'w500') {
        if (!posterPath) return '';
        return `${this.imageBaseUrl}/${size}${posterPath}`;
    }
}
