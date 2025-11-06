import { theaterConfig } from '../data/theaterConfig';

const TheaterLegend = ({ theaters }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 hidden lg:block">
      <h4 className="font-semibold text-sm mb-2">Theaters</h4>
      <div className="space-y-1">
        {theaters.map(theater => (
          <div key={theater} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded ${theaterConfig[theater]?.color || 'bg-gray-600'}`}></div>
            <span>{theater}</span>
            {theaterConfig[theater]?.hasGoogleIntegration && (
              <i className="fab fa-google text-gray-400" title="Google integrated"></i>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheaterLegend;
