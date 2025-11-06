/**
 * Verdi Barcelona Cinema Parser
 * Extracts movie screening data from HTML
 */

export class VerdiParser {
    constructor() {
        this.theater = "Verdi Barcelona";
        this.baseUrl = "https://barcelona.cines-verdi.com";
        this.carteleraUrl = `${this.baseUrl}/cartelera`;
    }

    /**
     * Extract movie URLs from the cartelera page
     */
    extractMovieUrls(html) {
        const urls = [];
        // Match: <h2><a href="/movie-slug" 
        const regex = /<h2><a href="([^"]+)"/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            const path = match[1];
            // Skip external links and special pages
            if (!path.startsWith('http') && !path.includes('cartelera') && path.startsWith('/')) {
                const url = `${this.baseUrl}${path}`;
                if (!urls.includes(url)) {
                    urls.push(url);
                }
            }
        }

        return urls;
    }

    /**
     * Parse a single movie page and extract showtimes
     */
    parseMoviePage(html, movieUrl) {
        const showtimesByDate = {};
        let movieTitle = '';

        // Extract title from <h1> (using [\s\S] to match across newlines)
        const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        if (titleMatch) {
            // Remove all HTML tags and normalize whitespace
            movieTitle = titleMatch[1]
                .replace(/<[^>]*>/g, '')  // Remove HTML tags
                .replace(/\s+/g, ' ')      // Normalize whitespace
                .trim();
        }

        // Extract showtimes from links with title="YYYYMMDD HH:MM"
        const showtimeRegex = /title="(\d{8})\s+(\d{2}:\d{2})"/g;
        let match;

        while ((match = showtimeRegex.exec(html)) !== null) {
            const dateStr = match[1]; // YYYYMMDD
            const time = match[2];     // HH:MM

            // Convert YYYYMMDD to YYYY-MM-DD
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const date = `${year}-${month}-${day}`;

            if (!showtimesByDate[date]) {
                showtimesByDate[date] = [];
            }

            if (!showtimesByDate[date].includes(time)) {
                showtimesByDate[date].push(time);
            }
        }

        return {
            title: movieTitle,
            url: movieUrl,
            showtimesByDate
        };
    }

    /**
     * Convert parsed data to standard movie format
     */
    formatMovies(parsedMovies) {
        const movies = [];

        for (const parsed of parsedMovies) {
            const { title, url, showtimesByDate } = parsed;

            // Create one movie entry per date
            for (const [date, showtimes] of Object.entries(showtimesByDate)) {
                // Sort showtimes
                showtimes.sort();

                const id = `verdi_${this.slugify(title)}_${date}`;

                movies.push({
                    id,
                    title,
                    director: '',
                    duration: null,
                    genre: ['Cinema'],
                    rating: '',
                    poster: '',
                    theater: this.theater,
                    showtimes,
                    date,
                    filmUrl: url,
                    source: 'verdi'
                });
            }
        }

        return movies;
    }

    /**
     * Create a URL-friendly slug
     */
    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Parse HTML string and return movie URLs
     */
    parseString(html) {
        const movieUrls = this.extractMovieUrls(html);
        console.log(`Found ${movieUrls.length} movie URLs from Verdi cartelera`);
        return movieUrls;
    }

    /**
     * Group movies by date and title to combine showtimes
     */
    groupMovies(movies) {
        const grouped = {};

        movies.forEach(movie => {
            const key = `${movie.date}_${movie.title}`;

            if (grouped[key]) {
                // Merge showtimes
                grouped[key].showtimes.push(...movie.showtimes);
                grouped[key].showtimes = [...new Set(grouped[key].showtimes)].sort();
            } else {
                grouped[key] = { ...movie };
            }
        });

        return Object.values(grouped);
    }
}
