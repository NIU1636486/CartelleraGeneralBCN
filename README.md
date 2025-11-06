# Local Cinema Hub - Movie Catalog

A modern, responsive React application for browsing local cinema movie showtimes. Built with React, Vite, and TailwindCSS.

## Features

- **Movie Catalog**: Browse all movies from local theaters in one place
- **Advanced Filtering**: Filter by theater, genre, date, and search by title or director
- **Multiple View Modes**: Toggle between grid and list views
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Real-time Updates**: Refresh button to get the latest showtimes
- **Theater Integration**: Support for both API and web scraping sources

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Lightning-fast build tool and dev server
- **TailwindCSS v4**: Utility-first CSS framework with new PostCSS plugin
- **Font Awesome**: Icons for a polished UI

## Project Structure

```
movie-catalog/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── SearchBar.jsx
│   │   ├── Filters.jsx
│   │   ├── MovieCard.jsx
│   │   ├── MovieList.jsx
│   │   ├── StatusBar.jsx
│   │   ├── TheaterLegend.jsx
│   │   └── EmptyState.jsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useMovieData.js
│   │   └── useMovieFilters.js
│   ├── data/            # Data and configuration
│   │   ├── sampleMovies.js
│   │   └── theaterConfig.js
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
└── index.html           # HTML template
```

## Getting Started

### Prerequisites

- Node.js v25.1.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd movie-catalog
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Features in Detail

### Custom Hooks

- **useMovieData**: Manages movie data, loading states, and refresh functionality
- **useMovieFilters**: Handles all filtering logic (theater, genre, search, date)

### Component Architecture

- **Separation of Concerns**: Each component has a single responsibility
- **Reusability**: Components are designed to be reused across the application
- **Props-based**: All components receive data through props for flexibility

### Theater Configuration

The app supports different theater types:
- **API Integration**: Direct API calls to theater services
- **Web Scraping**: Scraping theater websites for showtimes
- **Google Integration**: Support for theaters with Google showtimes

## Future Enhancements

- [ ] Real API integration with local theaters
- [ ] User authentication and favorite movies
- [ ] Movie detail pages with trailers and reviews
- [ ] Booking integration
- [ ] Push notifications for favorite movies
- [ ] Advanced filtering (rating, duration, etc.)
- [ ] Map view showing theater locations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
