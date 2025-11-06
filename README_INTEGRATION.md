# Local Cinema Hub - Filmoteca Integration

This project integrates real-time movie data from Filmoteca de Catalunya into a modern React application.

## Features

✅ **Automatic Data Fetching**: Fetches movie schedules from Filmoteca de Catalunya website
✅ **Smart Caching**: Stores parsed data locally to minimize requests
✅ **Month-Based Parsing**: Automatically parses new months when you select dates
✅ **Real-time Updates**: Refresh button fetches the latest data
✅ **Date Filtering**: Browse movies by specific dates

## Architecture

```
movie-catalog/
├── src/                     # React frontend
│   ├── components/          # UI components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer
│   └── data/               # Configuration
└── server/                  # Backend API
    ├── parsers/            # HTML parsers
    ├── services/           # Business logic
    ├── utils/              # Utilities
    └── data/               # Cached movie data (auto-generated)
```

## How It Works

### Backend (Express API Server)

1. **Parser** (`server/parsers/filmoteca-parser.js`)
   - Fetches HTML from Filmoteca website
   - Extracts movie screenings using regex
   - Parses titles, times, cycles, and special events

2. **Service Layer** (`server/services/filmoteca-service.js`)
   - Manages data fetching and caching
   - Checks if cached data is fresh (< 6 hours)
   - Automatically refreshes stale data

3. **Data Store** (`server/utils/data-store.js`)
   - Stores parsed data as JSON files
   - One file per month (e.g., `filmoteca-2025-11.json`)
   - Provides statistics and management

4. **API Endpoints**:
   - `GET /api/movies/date/:date` - Get movies for a specific date
   - `GET /api/movies/month/:month` - Get movies for a month
   - `POST /api/refresh` - Force refresh data
   - `GET /api/stats` - Get cache statistics

### Frontend (React + Vite)

1. **API Service** (`src/services/api.js`)
   - Communicates with backend API
   - Handles errors gracefully

2. **Custom Hook** (`src/hooks/useMovieData.js`)
   - Fetches data when date changes
   - Automatically triggers parsing if month not cached
   - Manages loading states

3. **Components**
   - Display movies in grid or list view
   - Filter by theater, genre, search
   - Show loading indicators

## Running the Project

### Option 1: Run Both Servers Separately

**Terminal 1** - Start the backend:
```bash
cd movie-catalog
npm run server
```

**Terminal 2** - Start the frontend:
```bash
cd movie-catalog
npm run dev
```

### Option 2: Run Everything Together

```bash
cd movie-catalog
npm run dev:full
```

Then open http://localhost:5173 in your browser.

## API Usage Examples

### Get Movies for a Specific Date
```bash
curl "http://localhost:3001/api/movies/date/2025-11-15"
```

### Get Movies for a Month (with refresh)
```bash
curl "http://localhost:3001/api/movies/month/2025-11?refresh=true"
```

### Force Refresh Current Month
```bash
curl -X POST "http://localhost:3001/api/refresh"
```

### Get Cache Statistics
```bash
curl "http://localhost:3001/api/stats"
```

## Data Flow

1. **User selects a date** in the React app
2. Frontend calls `GET /api/movies/date/2025-11-15`
3. Backend checks if `2025-11` data is cached
4. If not cached or stale:
   - Fetches HTML from Filmoteca website
   - Parses movie screenings
   - Saves to `server/data/filmoteca-2025-11.json`
5. Returns filtered movies for that date
6. Frontend displays the movies

## Caching Strategy

- **Cache Duration**: 6 hours
- **Cache Location**: `server/data/filmoteca-YYYY-MM.json`
- **Refresh**:
  - Automatic: When cache is older than 6 hours
  - Manual: Click the Refresh button or add `?refresh=true`

## Future Enhancements

- [ ] Add more theaters (Verdi, Zumzeig, etc.)
- [ ] Fetch movie posters and metadata from film detail pages
- [ ] Add director and duration information
- [ ] Implement full-text search
- [ ] Add calendar view
- [ ] Export to Google Calendar
- [ ] Email notifications for new films
- [ ] User favorites and watchlist

## Development

### Add a New Theater

1. Create a parser in `server/parsers/[theater]-parser.js`
2. Create a service in `server/services/[theater]-service.js`
3. Add API endpoints in `server/index.js`
4. Update `src/data/theaterConfig.js`

### Customize Parser

Edit `server/parsers/filmoteca-parser.js` to:
- Change regex patterns
- Extract additional fields
- Modify data structure

## Troubleshooting

**No movies showing?**
- Check backend is running on port 3001
- Check browser console for errors
- Try forcing a refresh with the Refresh button

**Parser returning 0 movies?**
- Filmoteca might have changed their HTML structure
- Check the regex in `filmoteca-parser.js`
- Test with: `curl https://www.filmoteca.cat/web/ca/view-agenda-mensual?m=2025-11`

**CORS errors?**
- Make sure Vite proxy is configured in `vite.config.js`
- Backend should be on port 3001, frontend on 5173

## License

MIT
