import { theaterConfig, getTheaterFallbackImage } from '../data/theaterConfig';

const MovieList = ({ movie }) => {
  const posterUrl = movie.poster || getTheaterFallbackImage(movie.theater);
  const hasPoster = Boolean(movie.poster);

  return (
    <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex gap-2 sm:gap-4">
        <img
          src={posterUrl}
          alt={movie.title}
          className={`w-16 sm:w-24 h-24 sm:h-36 object-cover rounded flex-shrink-0 ${!hasPoster ? 'opacity-90' : ''}`}
          onError={(e) => {
            e.target.src = getTheaterFallbackImage(movie.theater);
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-lg truncate">{movie.title}</h3>
              {movie.altTitle && (
                <p className="text-gray-500 text-xs sm:text-sm italic truncate">{movie.altTitle}</p>
              )}
              {movie.director && (
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  <i className="fas fa-user-tie mr-1"></i>
                  {movie.director}
                </p>
              )}
            </div>
            <span className={`${theaterConfig[movie.theater]?.color || 'bg-gray-600'} text-white px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0`}>
              {movie.theater}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2 items-center text-xs sm:text-sm text-gray-500">
            {movie.duration && (
              <>
                <span>
                  <i className="far fa-clock mr-1"></i>
                  {movie.duration} min
                </span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            {movie.releaseYear && (
              <>
                <span>{movie.releaseYear}</span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            <span className="truncate">
              {movie.genre.slice(0, 2).join(', ')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {movie.showtimes.map((time, idx) => (
              <button
                key={idx}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-medium transition-colors"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieList;
