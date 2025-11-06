import { useState } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import StatusBar from './components/StatusBar';
import MovieCard from './components/MovieCard';
import MovieList from './components/MovieList';
import EmptyState from './components/EmptyState';
import TheaterLegend from './components/TheaterLegend';
import { useMovieData } from './hooks/useMovieData';
import { useMovieFilters } from './hooks/useMovieFilters';

function App() {
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Custom hooks for data and filtering (now fetches real data from API)
  const { movies, isLoading, lastUpdated, error, refreshData } = useMovieData(selectedDate);
  const {
    selectedTheaters,
    setSelectedTheaters,
    selectedGenre,
    setSelectedGenre,
    searchTerm,
    setSearchTerm,
    theaters,
    genres,
    filteredMovies
  } = useMovieFilters(movies, selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={refreshData} isLoading={isLoading} />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading movies: {error}. Showing cached data if available.
              </p>
            </div>
          </div>
        </div>
      )}

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Filters
            selectedTheaters={selectedTheaters}
            setSelectedTheaters={setSelectedTheaters}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            viewMode={viewMode}
            setViewMode={setViewMode}
            theaters={theaters}
            genres={genres}
            showFilters={showFilters}
          />
        </div>
      </div>

      <StatusBar filteredMoviesCount={filteredMovies.length} lastUpdated={lastUpdated} />

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {filteredMovies.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
          }>
            {filteredMovies.map(movie => (
              viewMode === 'grid'
                ? <MovieCard key={movie.id} movie={movie} />
                : <MovieList key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>

      <TheaterLegend theaters={theaters} />
    </div>
  );
}

export default App;
