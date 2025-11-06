import { useState, useRef, useEffect } from 'react';

const Filters = ({
  selectedTheaters,
  setSelectedTheaters,
  selectedGenre,
  setSelectedGenre,
  viewMode,
  setViewMode,
  theaters,
  genres,
  showFilters
}) => {
  const [isTheaterDropdownOpen, setIsTheaterDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTheaterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheater = (theater) => {
    if (selectedTheaters.includes(theater)) {
      setSelectedTheaters(selectedTheaters.filter(t => t !== theater));
    } else {
      setSelectedTheaters([...selectedTheaters, theater]);
    }
  };

  const selectAllTheaters = () => {
    if (selectedTheaters.length === theaters.length) {
      setSelectedTheaters([]);
    } else {
      setSelectedTheaters([...theaters]);
    }
  };

  const getTheaterButtonText = () => {
    if (selectedTheaters.length === 0) {
      return 'Tots els cinemes';
    } else if (selectedTheaters.length === theaters.length) {
      return 'Tots els cinemes';
    } else if (selectedTheaters.length === 1) {
      return selectedTheaters[0];
    } else {
      return `${selectedTheaters.length} cinemes`;
    }
  };

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden sm:flex gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsTheaterDropdownOpen(!isTheaterDropdownOpen)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center gap-2 min-w-[200px] justify-between"
          >
            <span>{getTheaterButtonText()}</span>
            <i className={`fas fa-chevron-${isTheaterDropdownOpen ? 'up' : 'down'} text-gray-400`}></i>
          </button>

          {isTheaterDropdownOpen && (
            <div className="absolute top-full mt-1 w-full min-w-[250px] bg-white border rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
              <div className="p-2 border-b">
                <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer rounded">
                  <input
                    type="checkbox"
                    checked={selectedTheaters.length === theaters.length}
                    onChange={selectAllTheaters}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">Tots els cinemes</span>
                </label>
              </div>
              <div className="p-2">
                {theaters.map(theater => (
                  <label
                    key={theater}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTheaters.includes(theater)}
                      onChange={() => toggleTheater(theater)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{theater}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tots els gèneres</option>
          {genres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Mobile Filters (Collapsible) */}
      {showFilters && (
        <div className="sm:hidden mt-3 pt-3 border-t flex flex-col gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTheaterDropdownOpen(!isTheaterDropdownOpen)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center gap-2 justify-between"
            >
              <span>{getTheaterButtonText()}</span>
              <i className={`fas fa-chevron-${isTheaterDropdownOpen ? 'up' : 'down'} text-gray-400`}></i>
            </button>

            {isTheaterDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                <div className="p-2 border-b">
                  <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer rounded">
                    <input
                      type="checkbox"
                      checked={selectedTheaters.length === theaters.length}
                      onChange={selectAllTheaters}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">Tots els cinemes</span>
                  </label>
                </div>
                <div className="p-2">
                  {theaters.map(theater => (
                    <label
                      key={theater}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTheaters.includes(theater)}
                        onChange={() => toggleTheater(theater)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{theater}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tots els gèneres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              <i className="fas fa-th mr-2"></i>Graella
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              <i className="fas fa-list mr-2"></i>Llista
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Filters;
