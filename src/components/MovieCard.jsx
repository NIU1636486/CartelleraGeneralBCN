import { theaterConfig } from '../data/theaterConfig';

const MovieCard = ({ movie }) => {
  // Fallback for missing poster
  const posterUrl = movie.poster || 'https://via.placeholder.com/500x750/6b7280/ffffff?text=No+Poster';
  const hasPoster = Boolean(movie.poster);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={posterUrl}
          alt={movie.title}
          className={`w-full h-64 sm:h-72 object-cover ${!hasPoster ? 'opacity-50' : ''}`}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x750/6b7280/ffffff?text=No+Poster';
          }}
        />
        <div className={`absolute top-2 right-2 ${theaterConfig[movie.theater]?.color || 'bg-gray-600'} text-white px-2 py-1 rounded text-xs font-semibold`}>
          {movie.theater}
        </div>
        {movie.releaseYear && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {movie.releaseYear}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1" title={movie.title}>
          {movie.title}
        </h3>
        {movie.altTitle && (
          <p className="text-gray-500 text-xs mb-1 italic line-clamp-1">{movie.altTitle}</p>
        )}
        {movie.director && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-1">
            <i className="fas fa-user-tie mr-1"></i>
            {movie.director}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genre.slice(0, 2).map((g, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {g}
            </span>
          ))}
        </div>
        {movie.duration && (
          <div className="mb-3">
            <span className="text-sm text-gray-500">
              <i className="far fa-clock mr-1"></i>
              {movie.duration} min
            </span>
          </div>
        )}
        <div className="border-t pt-3">
          <p className="text-xs text-gray-500 mb-2">Today&apos;s Showtimes:</p>
          <div className="flex flex-wrap gap-2">
            {movie.showtimes.map((time, idx) => (
              <button
                key={idx}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
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

export default MovieCard;
