/**
 * Mooby Cinemas Parser
 * Extracts movie screening data from JSON embedded in HTML
 */

export class MoobyParser {
    constructor(theaterCode, theaterName) {
        this.theaterCode = theaterCode; // e.g., 'BAL-ARIBAU'
        this.theaterName = theaterName; // e.g., 'Mooby Aribau'
        this.baseUrl = 'https://www.moobycinemas.com';
    }

    /**
     * Extract shops JSON from HTML
     */
    extractShopsData(html) {
        // Find window.shops = {...};
        const regex = /window\.shops\s*=\s*(\{.+?\});/s;
        const match = html.match(regex);

        if (!match) {
            throw new Error('Could not find window.shops data');
        }

        try {
            return JSON.parse(match[1]);
        } catch (e) {
            throw new Error(`Failed to parse shops JSON: ${e.message}`);
        }
    }

    /**
     * Parse showtime from YYYYMMDDHHMMSS format
     * Returns {date: 'YYYY-MM-DD', time: 'HH:MM'}
     */
    parseShowtime(timeStr) {
        if (!timeStr || timeStr.length < 12) {
            return null;
        }

        // YYYYMMDDHHMMSS
        const year = timeStr.substring(0, 4);
        const month = timeStr.substring(4, 6);
        const day = timeStr.substring(6, 8);
        const hour = timeStr.substring(8, 10);
        const minute = timeStr.substring(10, 12);

        return {
            date: `${year}-${month}-${day}`,
            time: `${hour}:${minute}`
        };
    }

    /**
     * Parse the HTML and extract movies for this theater
     */
    parseString(html) {
        const shopsData = this.extractShopsData(html);

        // Find our theater
        let theaterData = null;
        for (const shopId in shopsData) {
            if (shopsData[shopId].code === this.theaterCode) {
                theaterData = shopsData[shopId];
                break;
            }
        }

        if (!theaterData) {
            console.log(`Theater ${this.theaterCode} not found in shops data`);
            return [];
        }

        console.log(`Found ${theaterData.events?.length || 0} events for ${this.theaterName}`);

        const movies = [];
        const events = theaterData.events || [];

        for (const event of events) {
            const title = event.locale_title || event.name || '';
            const performances = event.performances || [];

            if (performances.length === 0) {
                continue; // Skip events without performances
            }

            // Group performances by date
            const showtimesByDate = {};
            for (const perf of performances) {
                const parsed = this.parseShowtime(perf.time);
                if (!parsed) continue;

                const { date, time } = parsed;

                if (!showtimesByDate[date]) {
                    showtimesByDate[date] = [];
                }

                if (!showtimesByDate[date].includes(time)) {
                    showtimesByDate[date].push(time);
                }
            }

            movies.push({
                title,
                url: `${this.baseUrl}`, // Could add specific movie URL if available
                showtimesByDate
            });
        }

        return movies;
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

                const id = `mooby_${this.slugify(this.theaterCode)}_${this.slugify(title)}_${date}`;

                movies.push({
                    id,
                    title,
                    director: '',
                    duration: null,
                    genre: ['Cinema'],
                    rating: '',
                    poster: '',
                    theater: this.theaterName,
                    showtimes,
                    date,
                    filmUrl: url,
                    source: `mooby_${this.theaterCode.toLowerCase()}`
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
