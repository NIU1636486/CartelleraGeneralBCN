import { theaterConfig } from '../data/theaterConfig';

const MovieList = ({ movie }) => {
  const posterUrl = movie.poster || 'https://via.placeholder.com/200x300/6b7280/ffffff?text=No+Poster';
  const hasPoster = Boolean(movie.poster);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        <img
          src={posterUrl}
          alt={movie.title}
          className={`w-full sm:w-24 h-36 sm:h-36 object-cover rounded ${!hasPoster ? 'opacity-50' : ''}`}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200x300/6b7280/ffffff?text=No+Poster';
          }}
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg">{movie.title}</h3>
              {movie.altTitle && (
                <p className="text-gray-500 text-sm italic">{movie.altTitle}</p>
              )}
              {movie.director && (
                <p className="text-gray-600 text-sm">
                  <i className="fas fa-user-tie mr-1"></i>
                  {movie.director}
                </p>
              )}
            </div>
            <span className={`${theaterConfig[movie.theater]?.color || 'bg-gray-600'} text-white px-3 py-1 rounded text-sm font-semibold mt-2 sm:mt-0 inline-block`}>
              {movie.theater}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            {movie.duration && (
              <>
                <span className="text-sm text-gray-500">
                  <i className="far fa-clock mr-1"></i>
                  {movie.duration} min
                </span>
                <span className="text-sm text-gray-500">•</span>
              </>
            )}
            {movie.releaseYear && (
              <>
                <span className="text-sm text-gray-500">{movie.releaseYear}</span>
                <span className="text-sm text-gray-500">•</span>
              </>
            )}
            {movie.genre.map((g, idx) => (
              <span key={idx} className="text-sm text-gray-500">
                {g}{idx < movie.genre.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 mr-2">Showtimes:</span>
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

export default MovieList;
