/**
 * Cinema Hub API Server
 * Express server providing movie data from various sources
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { FilmotecaService } from './services/filmoteca-service.js';
import { ZumzeigService } from './services/zumzeig-service.js';
import { VerdiService } from "./services/verdi-service.js";
import { RenoirService } from './services/renoir-service.js';
import { MoobyAribauService } from './services/mooby-aribau-service.js';
import { MoobyBalmesService } from './services/mooby-balmes-service.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const filmotecaService = new FilmotecaService();
const zumzeigService = new ZumzeigService();
const renoirService = new RenoirService();
const verdiService = new VerdiService();
const moobyAribauService = new MoobyAribauService();
const moobyBalmesService = new MoobyBalmesService();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Helper function to sort movies by date and showtime
 * @param {Array} movies - Array of movie objects
 * @returns {Array} Sorted array of movies
 */
function sortMoviesByDateAndTime(movies) {
    return movies.sort((a, b) => {
        // First sort by date
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
        }

        // Then sort by first showtime
        const timeA = a.showtimes && a.showtimes.length > 0 ? a.showtimes[0] : '00:00';
        const timeB = b.showtimes && b.showtimes.length > 0 ? b.showtimes[0] : '00:00';
        return timeA.localeCompare(timeB);
    });
}

/**
 * GET /api/movies
 * Get all movies from all sources
 * Query params:
 *   - date: YYYY-MM-DD (optional) - filter by specific date
 *   - month: YYYY-MM (optional) - filter by month
 *   - refresh: boolean (optional) - force refresh data
 */
app.get('/api/movies', async (req, res) => {
    try {
        const { date, month, refresh } = req.query;
        const forceRefresh = refresh === 'true';

        let movies = [];

        if (date) {
            // Get movies for specific date from all sources
            const [filmotecaMovies, zumzeigMovies, renoirMovies, verdiMovies, moobyAribauMovies, moobyBalmesMovies] = await Promise.all([
                filmotecaService.getMoviesForDate(date, forceRefresh),
                zumzeigService.getMoviesForDate(date, forceRefresh),
                renoirService.getMoviesForDate(date, forceRefresh),
                verdiService.getMoviesForDate(date, forceRefresh),
                moobyAribauService.getMoviesForDate(date, forceRefresh),
                moobyBalmesService.getMoviesForDate(date, forceRefresh)
            ]);
            movies = [...filmotecaMovies, ...zumzeigMovies, ...renoirMovies, ...verdiMovies, ...moobyAribauMovies, ...moobyBalmesMovies];
        } else if (month) {
            // Get movies for specific month from all sources
            const [filmotecaMovies, zumzeigMovies, renoirMovies, verdiMovies, moobyAribauMovies, moobyBalmesMovies] = await Promise.all([
                filmotecaService.getMoviesForMonth(month, forceRefresh),
                zumzeigService.getMoviesForMonth(month, forceRefresh),
                renoirService.getMoviesForMonth(month, forceRefresh),
                verdiService.getMoviesForMonth(month, forceRefresh),
                moobyAribauService.getMoviesForMonth(month, forceRefresh),
                moobyBalmesService.getMoviesForMonth(month, forceRefresh)
            ]);
            movies = [...filmotecaMovies, ...zumzeigMovies, ...renoirMovies, ...verdiMovies, ...moobyAribauMovies, ...moobyBalmesMovies];
        } else {
            // Get all stored movies from all sources
            movies = [...filmotecaService.getAllMovies(), ...zumzeigService.getAllMovies(), ...renoirService.getAllMovies(), ...verdiService.getAllMovies(), ...moobyAribauService.getAllMovies(), ...moobyBalmesService.getAllMovies()];
        }

        // Sort movies by date and showtime
        movies = sortMoviesByDateAndTime(movies);

        res.json({
            success: true,
            count: movies.length,
            movies
        });
    } catch (error) {
        console.error('Error in GET /api/movies:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/movies/month/:month
 * Get movies for a specific month
 * Params:
 *   - month: YYYY-MM
 * Query params:
 *   - refresh: boolean (optional)
 */
app.get('/api/movies/month/:month', async (req, res) => {
    try {
        const { month } = req.params;
        const forceRefresh = req.query.refresh === 'true';

        // Validate month format
        if (!/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid month format. Use YYYY-MM'
            });
        }

        // Fetch from all sources in parallel
        const [filmotecaMovies, zumzeigMovies, renoirMovies, verdiMovies, moobyAribauMovies, moobyBalmesMovies] = await Promise.all([
            filmotecaService.getMoviesForMonth(month, forceRefresh),
            zumzeigService.getMoviesForMonth(month, forceRefresh),
            renoirService.getMoviesForMonth(month, forceRefresh),
                verdiService.getMoviesForMonth(month, forceRefresh),
                moobyAribauService.getMoviesForMonth(month, forceRefresh),
                moobyBalmesService.getMoviesForMonth(month, forceRefresh)
        ]);

        let movies = [...filmotecaMovies, ...zumzeigMovies, ...renoirMovies, ...verdiMovies, ...moobyAribauMovies, ...moobyBalmesMovies];

        // Sort movies by date and showtime
        movies = sortMoviesByDateAndTime(movies);

        res.json({
            success: true,
            month,
            count: movies.length,
            movies
        });
    } catch (error) {
        console.error(`Error in GET /api/movies/month/${req.params.month}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/movies/date/:date
 * Get movies for a specific date
 * Params:
 *   - date: YYYY-MM-DD
 * Query params:
 *   - refresh: boolean (optional)
 */
app.get('/api/movies/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const forceRefresh = req.query.refresh === 'true';

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        // Fetch from all sources in parallel
        const [filmotecaMovies, zumzeigMovies, renoirMovies, verdiMovies, moobyAribauMovies, moobyBalmesMovies] = await Promise.all([
            filmotecaService.getMoviesForDate(date, forceRefresh),
            zumzeigService.getMoviesForDate(date, forceRefresh),
            renoirService.getMoviesForDate(date, forceRefresh),
                verdiService.getMoviesForDate(date, forceRefresh),
                moobyAribauService.getMoviesForDate(date, forceRefresh),
                moobyBalmesService.getMoviesForDate(date, forceRefresh)
        ]);

        let movies = [...filmotecaMovies, ...zumzeigMovies, ...renoirMovies, ...verdiMovies, ...moobyAribauMovies, ...moobyBalmesMovies];

        // Sort movies by showtime (all movies have same date)
        movies = sortMoviesByDateAndTime(movies);

        res.json({
            success: true,
            date,
            count: movies.length,
            movies
        });
    } catch (error) {
        console.error(`Error in GET /api/movies/date/${req.params.date}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/refresh
 * Force refresh all data
 */
app.post('/api/refresh', async (req, res) => {
    try {
        const { month, date } = req.body;

        if (date) {
            const extractedMonth = date.substring(0, 7);
            // Refresh all sources
            await Promise.all([
                filmotecaService.getMoviesForMonth(extractedMonth, true),
                zumzeigService.getMoviesForMonth(extractedMonth, true),
                renoirService.getMoviesForMonth(extractedMonth, true),
                verdiService.getMoviesForMonth(extractedMonth, true),
                moobyAribauService.getMoviesForMonth(extractedMonth, true),
                moobyBalmesService.getMoviesForMonth(extractedMonth, true)
            ]);

            const [filmotecaMovies, zumzeigMovies, renoirMovies, verdiMovies, moobyAribauMovies, moobyBalmesMovies] = await Promise.all([
                filmotecaService.getMoviesForDate(date, false),
                zumzeigService.getMoviesForDate(date, false),
                renoirService.getMoviesForDate(date, false),
                verdiService.getMoviesForDate(date, false),
                moobyAribauService.getMoviesForDate(date, false),
                moobyBalmesService.getMoviesForDate(date, false)
            ]);

            let movies = [...filmotecaMovies, ...zumzeigMovies, ...renoirMovies, ...verdiMovies, ...moobyAribauMovies, ...moobyBalmesMovies];
            movies = sortMoviesByDateAndTime(movies);

            return res.json({
                success: true,
                message: `Refreshed data for ${date}`,
                count: movies.length,
                movies
            });
        } else if (month) {
            const [filmotecaMovies, zumzeigMovies, renoirMovies, verdiMovies, moobyAribauMovies, moobyBalmesMovies] = await Promise.all([
                filmotecaService.getMoviesForMonth(month, true),
                zumzeigService.getMoviesForMonth(month, true),
                renoirService.getMoviesForMonth(month, true),
                verdiService.getMoviesForMonth(month, true),
                moobyAribauService.getMoviesForMonth(month, true),
                moobyBalmesService.getMoviesForMonth(month, true)
            ]);

            let movies = [...filmotecaMovies, ...zumzeigMovies, ...renoirMovies, ...verdiMovies, ...moobyAribauMovies, ...moobyBalmesMovies];
            movies = sortMoviesByDateAndTime(movies);

            return res.json({
                success: true,
                message: `Refreshed data for ${month}`,
                count: movies.length,
                movies
            });
        } else {
            // Refresh current month by default
            const today = new Date();
            const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

            const [filmotecaMovies, zumzeigMovies, renoirMovies, verdiMovies, moobyAribauMovies, moobyBalmesMovies] = await Promise.all([
                filmotecaService.getMoviesForMonth(currentMonth, true),
                zumzeigService.getMoviesForMonth(currentMonth, true),
                renoirService.getMoviesForMonth(currentMonth, true),
                verdiService.getMoviesForMonth(currentMonth, true),
                moobyAribauService.getMoviesForMonth(currentMonth, true),
                moobyBalmesService.getMoviesForMonth(currentMonth, true)
            ]);

            let movies = [...filmotecaMovies, ...zumzeigMovies, ...renoirMovies, ...verdiMovies, ...moobyAribauMovies, ...moobyBalmesMovies];
            movies = sortMoviesByDateAndTime(movies);

            return res.json({
                success: true,
                message: `Refreshed data for current month ${currentMonth}`,
                count: movies.length,
                movies
            });
        }
    } catch (error) {
        console.error('Error in POST /api/refresh:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stats
 * Get storage statistics
 */
app.get('/api/stats', (req, res) => {
    try {
        const filmotecaStats = filmotecaService.dataStore.getStats();
        const zumzeigStats = zumzeigService.dataStore.getStats();
        const renoirStats = renoirService.dataStore.getStats();
        const verdiStats = verdiService.dataStore.getStats();
        const moobyAribauStats = moobyAribauService.dataStore.getStats();
        const moobyBalmesStats = moobyBalmesService.dataStore.getStats();

        res.json({
            success: true,
            stats: {
                filmoteca: filmotecaStats,
                zumzeig: zumzeigStats,
                renoir: renoirStats,
                verdi: verdiStats,
                moobyAribau: moobyAribauStats,
                moobyBalmes: moobyBalmesStats,
                total: {
                    totalMonths: filmotecaStats.totalMonths + zumzeigStats.totalMonths + renoirStats.totalMonths + verdiStats.totalMonths + moobyAribauStats.totalMonths + moobyBalmesStats.totalMonths,
                    totalMovies: filmotecaStats.totalMovies + zumzeigStats.totalMovies + renoirStats.totalMovies + verdiStats.totalMovies + moobyAribauStats.totalMovies + moobyBalmesStats.totalMovies
                }
            }
        });
    } catch (error) {
        console.error('Error in GET /api/stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/cache
 * Clear all cached data
 */
app.delete('/api/cache', (req, res) => {
    try {
        filmotecaService.clearCache();
        zumzeigService.clearCache();
        renoirService.clearCache();
        verdiService.clearCache();
        moobyAribauService.clearCache();
        moobyBalmesService.clearCache();
        res.json({
            success: true,
            message: 'Cache cleared successfully for all theaters'
        });
    } catch (error) {
        console.error('Error in DELETE /api/cache:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Serve static files from React app in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Catch-all route to serve React app for any non-API routes
app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🎬 Cinema Hub API Server`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET  /api/movies              - Get all movies`);
    console.log(`  GET  /api/movies/month/:month - Get movies for specific month`);
    console.log(`  GET  /api/movies/date/:date   - Get movies for specific date`);
    console.log(`  POST /api/refresh             - Refresh data`);
    console.log(`  GET  /api/stats               - Get storage stats`);
    console.log(`  GET  /health                  - Health check`);
    console.log(`\n✨ Ready to serve movie data!\n`);
});

export default app;
