# How to Get Your Free TMDB API Key

Follow these simple steps to enable movie posters and metadata:

## Step 1: Create a TMDB Account

1. Go to **https://www.themoviedb.org/signup**
2. Fill in your details:
   - Username
   - Password
   - Email
3. Verify your email address

## Step 2: Request an API Key

1. Log in to TMDB
2. Go to **https://www.themoviedb.org/settings/api**
3. Click **"Create"** under "Request an API Key"
4. Select **"Developer"** (not commercial)
5. Accept the terms of use
6. Fill out the application form:
   - **Application Name**: Cinema Hub (or any name)
   - **Application URL**: http://localhost:3001 (or leave blank)
   - **Application Summary**: Personal movie catalog project
7. Submit

You'll receive your **API Key (v3 auth)** immediately!

## Step 3: Configure Your Application

### Option A: Environment Variable (Recommended)

**On macOS/Linux:**
```bash
export TMDB_API_KEY=your_api_key_here
```

**On Windows (Command Prompt):**
```cmd
set TMDB_API_KEY=your_api_key_here
```

**On Windows (PowerShell):**
```powershell
$env:TMDB_API_KEY="your_api_key_here"
```

### Option B: Create .env File

1. Navigate to the server directory:
   ```bash
   cd /Users/polriubrogentcomas/Documents/CatalegCinema/movie-catalog/server
   ```

2. Create a `.env` file:
   ```bash
   echo "TMDB_API_KEY=your_actual_api_key_here" > .env
   ```

3. Replace `your_actual_api_key_here` with your real API key

## Step 4: Restart the Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run server
```

You should see:
```
✅ TMDB service enabled
```

Instead of:
```
⚠️  TMDB API key not configured
```

## Step 5: Test It!

1. Start the frontend: `npm run dev`
2. Open http://localhost:5173
3. Select a date with movies
4. Click the **Refresh** button to force fetching new data
5. Watch the server logs - you should see:
   ```
   Enriching 114 movies with metadata...
   ✅ Successfully enriched 95/114 movies
   ```

## What You'll See

With TMDB enabled, each movie will have:
- ✅ **Movie poster images**
- ✅ **Runtime** (duration in minutes)
- ✅ **Director names**
- ✅ **TMDB ratings** (x/10)
- ✅ **Release year**

## Example API Key

Your API key looks like this:
```
abc123def456ghi789jkl012mno345pq
```

(This is fake - use your real one!)

## Troubleshooting

**Still seeing "No Poster"?**
- Check the server logs for TMDB errors
- Make sure you set the environment variable BEFORE starting the server
- Try `echo $TMDB_API_KEY` to verify it's set

**Movies not getting enriched?**
- Delete cached data: `rm server/data/*.json`
- Click Refresh button in the app to force re-parsing
- Check server logs for error messages

**Rate limit errors?**
- Wait a few minutes (TMDB allows 40 requests per 10 seconds)
- The system automatically adds delays between requests

## Need Help?

Check the detailed guide at: `server/TMDB_SETUP.md`
