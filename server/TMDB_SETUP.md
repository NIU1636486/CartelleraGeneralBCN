# TMDB API Setup Guide

The Movie Database (TMDB) provides free movie metadata including posters, runtime, directors, and more.

## Getting Your Free API Key

1. **Create an Account**
   - Go to https://www.themoviedb.org/signup
   - Sign up for a free account

2. **Request API Key**
   - Go to https://www.themoviedb.org/settings/api
   - Click "Create" under "Request an API Key"
   - Choose "Developer" option
   - Fill out the form (use "Personal" or "Educational" for type)
   - Accept the terms
   - You'll receive your API key immediately

3. **Configure the Application**

   **Option 1: Environment Variable (Recommended)**
   ```bash
   export TMDB_API_KEY=your_actual_api_key_here
   ```

   **Option 2: Create .env file**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env and add your API key
   ```

4. **Restart the Server**
   ```bash
   npm run server
   ```

## Features Provided by TMDB

With TMDB integration, each movie gets:

- ✅ **Movie Posters** - High quality poster images
- ✅ **Runtime** - Duration in minutes
- ✅ **Director** - Director name(s)
- ✅ **Rating** - TMDB user rating (x/10)
- ✅ **Plot** - Movie synopsis
- ✅ **Release Year** - Original release year
- ✅ **Original Title** - International title

## Without API Key

If you don't configure an API key:
- The app still works perfectly
- Movies won't have posters or detailed metadata
- Only data from Filmoteca will be shown

## Rate Limits

TMDB Free Tier:
- **40 requests per 10 seconds**
- **Unlimited requests per day**

Our implementation automatically:
- Adds 250ms delay between requests
- Respects rate limits
- Caches enriched data locally

## Testing

After setting up your API key:

```bash
# Test a single movie search
curl "http://localhost:3001/api/movies/date/2025-11-15"

# Force refresh to trigger TMDB enrichment
curl "http://localhost:3001/api/movies/month/2025-11?refresh=true"
```

Check the server logs - you should see:
```
Enriching 114 movies with metadata...
✅ Successfully enriched 95/114 movies
```

## Troubleshooting

**No posters showing up?**
- Check your API key is valid
- Look for TMDB errors in server logs
- Try deleting cached data and refreshing

**"TMDB API key not configured" warning?**
- Set the TMDB_API_KEY environment variable
- Or create a .env file with your key

**Rate limit errors?**
- The system adds delays automatically
- Wait a few minutes and try again
- Old cached data will still be available
