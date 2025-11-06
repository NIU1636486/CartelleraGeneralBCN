const StatusBar = ({ filteredMoviesCount, lastUpdated }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredMoviesCount} {filteredMoviesCount === 1 ? 'movie' : 'movies'}
        </span>
        <span>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
