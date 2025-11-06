import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useMovieData = (selectedDate) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);

  /**
   * Fetch movies for the entire month of the selected date
   * This will show all movies from all days in that month
   */
  const fetchMoviesForDate = async (date, forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Extract month from date (YYYY-MM)
      const month = date.substring(0, 7);

      // Fetch entire month of movies instead of just one day
      const fetchedMovies = await apiService.getMoviesForMonth(month, forceRefresh);
      setMovies(fetchedMovies);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err.message);
      // Keep existing movies on error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh data for current selected date
   */
  const refreshData = async () => {
    if (!selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      await fetchMoviesForDate(today, true);
    } else {
      await fetchMoviesForDate(selectedDate, true);
    }
  };

  /**
   * Fetch movies when selected date changes
   */
  useEffect(() => {
    if (selectedDate) {
      fetchMoviesForDate(selectedDate, false);
    }
  }, [selectedDate]);

  /**
   * Initial load - fetch today's movies
   */
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchMoviesForDate(today, false);
  }, []);

  return {
    movies,
    setMovies,
    isLoading,
    lastUpdated,
    error,
    refreshData
  };
};
