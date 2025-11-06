const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <i className="fas fa-film text-6xl text-gray-300 mb-4"></i>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">No movies found</h3>
      <p className="text-gray-500">Try adjusting your filters or search terms</p>
    </div>
  );
};

export default EmptyState;
