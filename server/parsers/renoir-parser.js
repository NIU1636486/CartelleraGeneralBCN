/**
 * Renoir Floridablanca Cinema Parser
 * Extracts movie screening data using JSON-LD structured data
 */

export class RenoirParser {
    constructor() {
        this.theater = "Renoir Floridablanca";
        this.baseUrl = "https://www.cinesrenoir.com";
        this.cartelera = "/cine/renoir-floridablanca/cartelera/";
    }

    /**
     * Extract movie URLs from the cartelera page
     */
    extractMovieUrls(html) {
        const urls = [];
        const regex = /href="(\/pelicula\/[^"]+\/)"/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            const url = `${this.baseUrl}${match[1]}`;
            if (!urls.includes(url)) {
                urls.push(url);
            }
        }

        return urls;
    }

    /**
     * Extract JSON-LD structured data from HTML
     */
    extractJsonLd(html) {
        const jsonLdBlocks = [];
        const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            try {
                const jsonData = JSON.parse(match[1]);
                jsonLdBlocks.push(jsonData);
            } catch (e) {
                console.error('Error parsing JSON-LD:', e);
            }
        }

        return jsonLdBlocks;
    }

    /**
     * Parse a single movie page and extract Floridablanca showtimes
     */
    parseMoviePage(html, movieUrl) {
        const jsonLdBlocks = this.extractJsonLd(html);
        const showtimesByDate = {};
        let movieTitle = '';

        // Find all Event objects for Renoir Floridablanca
        for (const block of jsonLdBlocks) {
            // Handle both single objects and arrays
            const events = Array.isArray(block) ? block : [block];

            for (const event of events) {
                if (event['@type'] === 'Event' &&
                    event.location?.name === 'Renoir Floridablanca') {

                    movieTitle = event.name || movieTitle;

                    // Parse startDate: "2025-11-21T16:00"
                    const startDate = event.startDate;
                    if (startDate) {
                        const [date, time] = startDate.split('T');

                        if (!showtimesByDate[date]) {
                            showtimesByDate[date] = [];
                        }

                        // Add time without seconds
                        const shortTime = time.substring(0, 5); // "16:00"
                        if (!showtimesByDate[date].includes(shortTime)) {
                            showtimesByDate[date].push(shortTime);
                        }
                    }
                }
            }
        }

        // If no title found in JSON-LD, try to extract from HTML
        if (!movieTitle) {
            const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
            if (titleMatch) {
                movieTitle = titleMatch[1].trim().replace(/<[^>]*>/g, '');
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

                const id = `renoir_${this.slugify(title)}_${date}`;

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
                    source: 'renoir'
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
     * Parse HTML string and return movies
     */
    parseString(html) {
        const movieUrls = this.extractMovieUrls(html);
        console.log(`Found ${movieUrls.length} movie URLs from cartelera`);

        // This will be called with individual movie pages
        // The service will handle fetching each movie page
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
