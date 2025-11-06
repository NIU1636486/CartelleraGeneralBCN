import { useState, useMemo } from 'react';

export const useMovieFilters = (movies, selectedDate) => {
  const [selectedTheaters, setSelectedTheaters] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Extract unique theaters
  const theaters = useMemo(() => {
    return [...new Set(movies.map(m => m.theater))].sort();
  }, [movies]);

  // Extract unique genres
  const genres = useMemo(() => {
    const allGenres = new Set();
    movies.forEach(movie => {
      movie.genre.forEach(g => allGenres.add(g));
    });
    return [...allGenres].sort();
  }, [movies]);

  // Filter movies
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const theaterMatch = selectedTheaters.length === 0 || selectedTheaters.includes(movie.theater);
      const genreMatch = selectedGenre === "all" || movie.genre.includes(selectedGenre);
      const searchMatch = searchTerm === "" ||
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase()));
      const dateMatch = movie.date === selectedDate;

      return theaterMatch && genreMatch && searchMatch && dateMatch;
    });
  }, [movies, selectedTheaters, selectedGenre, searchTerm, selectedDate]);

  return {
    selectedTheaters,
    setSelectedTheaters,
    selectedGenre,
    setSelectedGenre,
    searchTerm,
    setSearchTerm,
    theaters,
    genres,
    filteredMovies
  };
};
