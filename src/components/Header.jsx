const Header = ({ onRefresh, isLoading }) => {
  const handleRefresh = () => {
    const confirmed = window.confirm(
      'Aquesta acció farà una actualització completa de tots els cinemes i pot trigar uns minuts. Vols continuar?'
    );
    if (confirmed) {
      onRefresh();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-film text-blue-600 text-2xl"></i>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cines de Barcelona</h1>
          </div>
          <button
            onClick={handleRefresh}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isLoading ? 'opacity-50' : ''}`}
            disabled={isLoading}
          >
            <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
            <span className="hidden sm:inline">Actualitzar</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
