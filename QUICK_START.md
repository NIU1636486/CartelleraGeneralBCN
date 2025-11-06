# Cinema Hub - Quick Start Guide

Get your local cinema catalog running with real Filmoteca data and movie posters in minutes!

## Prerequisites

- Node.js v25+ installed
- Internet connection (for fetching movie data)

## Step 1: Get TMDB API Key (Optional but Recommended)

**To get movie posters, runtime, and director info:**

1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Go to https://www.themoviedb.org/settings/api
4. Click "Create" and select "Developer"
5. Copy your API Key

See detailed instructions: [GET_TMDB_API_KEY.md](GET_TMDB_API_KEY.md)

## Step 2: Configure API Key

```bash
export TMDB_API_KEY=your_actual_api_key_here
```

## Step 3: Install Dependencies

```bash
cd /Users/polriubrogentcomas/Documents/CatalegCinema/movie-catalog

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
npm run server
```

Wait for:
```
🎬 Cinema Hub API Server
📡 Server running on http://localhost:3001
✨ Ready to serve movie data!
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Wait for:
```
➜  Local:   http://localhost:5173/
```

## Step 5: Browse Movies!

Open your browser to **http://localhost:5173**

- The app will automatically fetch November 2025 movies
- Click the date picker to browse other dates
- Click "Refresh" to get the latest data
- Movies with TMDB metadata will show posters and duration

## What You'll See

### Without TMDB API Key:
- ✅ Movie titles and showtimes
- ✅ Film cycles/series
- ✅ Filmoteca links
- ❌ No posters (placeholder shown)
- ❌ No runtime/duration
- ❌ No director names

### With TMDB API Key:
- ✅ All of the above PLUS:
- ✅ Movie posters
- ✅ Runtime (duration in minutes)
- ✅ Director names
- ✅ TMDB ratings
- ✅ Release years

## Testing the API

While both servers are running:

```bash
# Check server health
curl http://localhost:3001/health

# Get movies for a specific date
curl http://localhost:3001/api/movies/date/2025-11-15

# Force refresh November data
curl "http://localhost:3001/api/movies/month/2025-11?refresh=true"

# See cache statistics
curl http://localhost:3001/api/stats
```

## Troubleshooting

**No movies showing?**
- Check both terminals for errors
- Make sure both servers are running
- Open browser DevTools (F12) and check Console

**Ports already in use?**
```bash
# Kill processes on ports 3001 and 5173
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**TMDB not working?**
- Check you exported the environment variable BEFORE starting the server
- Verify: `echo $TMDB_API_KEY`
- Look for TMDB warnings in server logs

## Next Steps

- Add more theaters (see README_INTEGRATION.md)
- Customize the parser
- Deploy to production
- Add more features!

## Files to Check

- **Frontend**: `src/components/MovieCard.jsx` - Movie display
- **Backend**: `server/index.js` - API endpoints
- **Parser**: `server/parsers/filmoteca-parser.js` - HTML parsing
- **TMDB**: `server/services/tmdb-service.js` - Metadata enrichment

Enjoy your local cinema hub! 🎬
