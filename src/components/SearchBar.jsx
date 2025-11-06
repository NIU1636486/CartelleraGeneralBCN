import DatePicker from './DatePicker';

const SearchBar = ({ searchTerm, setSearchTerm, selectedDate, setSelectedDate, showFilters, setShowFilters }) => {
  return (
    <div className="bg-white border-b sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cerca pel·lícules o directors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>

          {/* Date Picker */}
          <DatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden bg-gray-100 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <i className="fas fa-filter"></i>
            Filtres
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
