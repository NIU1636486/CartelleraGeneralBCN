/**
 * Zumzeig Cinema Parser
 * Extracts movie screening data from Zumzeig's program page
 */

export class ZumzeigParser {
    constructor() {
        this.theater = "Zumzeig";
        this.baseUrl = "https://zumzeigcine.coop";

        // Day name mappings (Catalan to number)
        this.dayMap = {
            'Dl': 1, // Dilluns (Monday)
            'Dt': 2, // Dimarts (Tuesday)
            'Dc': 3, // Dimecres (Wednesday)
            'Dj': 4, // Dijous (Thursday)
            'Dv': 5, // Divendres (Friday)
            'Ds': 6, // Dissabte (Saturday)
            'Dg': 0  // Diumenge (Sunday)
        };
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
     * Parse date from Zumzeig format (e.g., "Dj 6.11.25") to YYYY-MM-DD
     */
    parseDate(dateStr) {
        // Format: "Dj 6.11.25" (Day DD.MM.YY)
        const match = dateStr.trim().match(/\w+\s+(\d+)\.(\d+)\.(\d+)/);
        if (!match) return null;

        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = `20${match[3]}`; // Assuming 20xx century

        return `${year}-${month}-${day}`;
    }

    /**
     * Parse the HTML content and extract movie data
     */
    parseHTML(html) {
        const movies = [];

        // Extract all film blocks
        const filmRegex = /<a class="film[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;

        let filmMatch;
        while ((filmMatch = filmRegex.exec(html)) !== null) {
            const filmPath = filmMatch[1];
            const filmContent = filmMatch[2];

            const movie = this.parseFilm(filmContent, filmPath);
            if (movie && movie.sessions && movie.sessions.length > 0) {
                // Create separate movie entries for each session date
                movie.sessions.forEach(session => {
                    if (session.date) {
                        const movieEntry = {
                            ...movie,
                            date: session.date,
                            showtimes: session.showtimes,
                            sessions: undefined // Remove sessions array
                        };
                        delete movieEntry.sessions;
                        movies.push(movieEntry);
                    }
                });
            }
        }

        return movies;
    }

    /**
     * Parse a single film entry
     */
    parseFilm(filmContent, filmPath) {
        try {
            // Extract title
            const titleMatch = filmContent.match(/<h2[^>]*class="filmtitle[^"]*"[^>]*>(.*?)<span/s);
            if (!titleMatch) return null;
            const title = this.decodeHtmlEntities(titleMatch[1].trim());

            // Extract poster image
            let poster = '';
            const posterMatch = filmContent.match(/<img[^>]*class="thumbfilm"[^>]*src="([^"]*)"/);
            if (posterMatch) {
                poster = posterMatch[1].startsWith('http') ? posterMatch[1] : `${this.baseUrl}${posterMatch[1]}`;
            }

            // Extract director
            let director = '';
            const directorMatch = filmContent.match(/<div class="autor">([^<]*(?:<div[^>]*>([^<]*)<\/div>)?[^<]*)<\/div>/s);
            if (directorMatch) {
                // Some have nested divs for cycle/festival info
                const directorText = directorMatch[1].replace(/<div[^>]*>.*?<\/div>/g, '').trim();
                director = this.decodeHtmlEntities(directorText);
            }

            // Extract cycle/festival info
            let cycle = '';
            const cycleMatch = filmContent.match(/<div class="autor"><div class="autor">([^<]*)<\/div>/);
            if (cycleMatch) {
                cycle = this.decodeHtmlEntities(cycleMatch[1].trim());
            }

            // Extract film type from class
            const typeMatch = filmContent.match(/class="filmtitle\s+(tipo_\w+)"/);
            const filmType = typeMatch ? typeMatch[1].replace('tipo_', '') : '';

            // Extract sessions
            const sessions = this.parseSessions(filmContent);

            // Generate base ID
            const id = `zumzeig_${this.slugify(title)}`;

            return {
                id,
                title,
                director,
                duration: null,
                genre: cycle ? [cycle] : filmType ? [filmType] : ['Film'],
                rating: '',
                poster,
                theater: this.theater,
                cycle,
                filmType,
                filmUrl: filmPath ? `${this.baseUrl}${filmPath}` : '',
                source: 'zumzeig',
                sessions // Temporary, will be split
            };
        } catch (error) {
            console.error('Error parsing film:', error);
            return null;
        }
    }

    /**
     * Parse all sessions for a film
     */
    parseSessions(filmContent) {
        const sessions = {};

        // Check if tickets are not yet on sale
        if (filmContent.includes('Entrades pròximament a la venda')) {
            return [];
        }

        // Extract session divs
        const sessionRegex = /<div class="session">([^<]*(?:<span[^>]*>[^<]*<\/span>)*[^<]*)<\/div>/g;

        let sessionMatch;
        while ((sessionMatch = sessionRegex.exec(filmContent)) !== null) {
            const sessionText = sessionMatch[1];

            // Skip the "+" button
            if (sessionText.includes('plussesion')) continue;

            // Extract date and time
            const dateMatch = sessionText.match(/(\w+\s+\d+\.\d+\.\d+)/);
            const timeMatch = sessionText.match(/<span class="hour">\((\d{2}:\d{2})\)<\/span>/);

            if (dateMatch && timeMatch) {
                const dateStr = dateMatch[1];
                const time = timeMatch[1];
                const date = this.parseDate(dateStr);

                if (date) {
                    if (!sessions[date]) {
                        sessions[date] = {
                            date,
                            showtimes: []
                        };
                    }
                    sessions[date].showtimes.push(time);
                }
            }
        }

        // Sort showtimes for each date
        Object.values(sessions).forEach(session => {
            session.showtimes.sort();
        });

        return Object.values(sessions);
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
     * Group movies by date and title to combine multiple showtimes
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

    /**
     * Parse HTML string
     */
    parseString(html) {
        const movies = this.parseHTML(html);
        return this.groupMovies(movies);
    }
}
