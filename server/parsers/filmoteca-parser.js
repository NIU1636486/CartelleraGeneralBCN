/**
 * Filmoteca de Catalunya HTML Parser
 * Extracts movie screening data from the monthly agenda
 */

export class FilmotecaParser {
    constructor() {
        this.theater = "Filmoteca de Catalunya";
        this.baseUrl = "https://www.filmoteca.cat";
    }

    /**
     * Decode HTML entities
     */
    decodeHtmlEntities(text) {
        const entities = {
            '&#039;': "'",
            '&quot;': '"',
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&nbsp;': ' ',
            '&#34;': '"',
            '&#39;': "'"
        };

        return text.replace(/&#?\w+;/g, match => entities[match] || match);
    }

    /**
     * Parse the HTML content and extract movie data
     * @param {string} html - The HTML content to parse
     * @param {string} month - Month in format YYYY-MM
     * @returns {Array} Array of movie objects
     */
    parseHTML(html, month) {
        const movies = [];

        // Extract day sections - more flexible regex
        const dayRegex = /<h2>(.*?)<span>(\d+)<\/span><\/h2>[\s\S]*?<div class="column-list">\s*<ul>([\s\S]*?)<\/ul>/g;

        let dayMatch;
        while ((dayMatch = dayRegex.exec(html)) !== null) {
            const dayName = dayMatch[1].trim();
            const dayNumber = dayMatch[2];
            const listContent = dayMatch[3];

            // Create date string
            const date = `${month}-${dayNumber.padStart(2, '0')}`;

            // Extract individual screenings
            const screeningRegex = /<li>([\s\S]*?)<\/li>/g;
            let screeningMatch;

            while ((screeningMatch = screeningRegex.exec(listContent)) !== null) {
                const screening = this.parseScreening(screeningMatch[1], date, dayName);
                if (screening) {
                    movies.push(screening);
                }
            }
        }

        return movies;
    }

    /**
     * Parse a single screening entry
     */
    parseScreening(screeningHTML, date, dayName) {
        try {
            // Extract time
            const timeMatch = screeningHTML.match(/(\d{2}:\d{2})/);
            if (!timeMatch) return null;
            const time = timeMatch[1];

            // Extract title and link
            const titleMatch = screeningHTML.match(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/);
            if (!titleMatch) return null;

            const filmPath = titleMatch[1];
            const title = this.decodeHtmlEntities(titleMatch[2].trim());

            // Extract alternative title
            let altTitle = '';
            const altTitleMatch = screeningHTML.match(/<\/a>(.*?)<span>/);
            if (altTitleMatch) {
                altTitle = this.decodeHtmlEntities(altTitleMatch[1].trim());
            }

            // Extract cycle/series
            let cycle = '';
            const cycleMatch = screeningHTML.match(/<span><a href="([^"]*)"[^>]*>([^<]*)<\/a>/);
            if (cycleMatch) {
                cycle = this.decodeHtmlEntities(cycleMatch[2].trim());
            }

            // Extract guest information
            let guests = '';
            const guestsMatch = screeningHTML.match(/onclick='javascript:alert\("([^"]*)"\)'/);
            if (guestsMatch) {
                guests = this.decodeHtmlEntities(guestsMatch[1]);
            }

            // Generate unique ID
            const id = `filmoteca_${date}_${time.replace(':', '')}_${this.slugify(title)}`;

            return {
                id,
                title,
                altTitle,
                director: '',
                duration: null,
                genre: cycle ? [cycle] : ['Film'],
                rating: '',
                poster: '',
                theater: this.theater,
                showtimes: [time],
                date,
                dayName,
                cycle,
                guests,
                filmUrl: filmPath ? `${this.baseUrl}${filmPath}` : '',
                source: 'filmoteca'
            };
        } catch (error) {
            console.error('Error parsing screening:', error);
            return null;
        }
    }

    /**
     * Create a URL-friendly slug from a string
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
     * Group movies by date and title to combine multiple showtimes
     */
    groupMovies(movies) {
        const grouped = {};

        movies.forEach(movie => {
            const key = `${movie.date}_${movie.title}`;

            if (grouped[key]) {
                if (!grouped[key].showtimes.includes(movie.showtimes[0])) {
                    grouped[key].showtimes.push(movie.showtimes[0]);
                    grouped[key].showtimes.sort();
                }
            } else {
                grouped[key] = { ...movie };
            }
        });

        return Object.values(grouped);
    }

    /**
     * Parse HTML string directly
     */
    parseString(html, month) {
        const movies = this.parseHTML(html, month);
        return this.groupMovies(movies);
    }
}
