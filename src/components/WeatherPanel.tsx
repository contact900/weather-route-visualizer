import { WaypointWeather } from '../types/weather';
import { WeatherCard } from './WeatherCard';
import { hasSevereConditions } from '../utils/weatherHelpers';

interface WeatherPanelProps {
  waypointWeathers: WaypointWeather[];
  loading: boolean;
}

export const WeatherPanel = ({ waypointWeathers, loading }: WeatherPanelProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600 font-medium">Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (waypointWeathers.length === 0) {
    return null;
  }

  // Show all waypoints, but separate severe from normal
  const severeWaypoints = waypointWeathers.filter(hasSevereConditions);
  const clearWaypoints = waypointWeathers.filter(w => !hasSevereConditions(w));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Weather Along Route</h2>
        <p className="text-gray-600 font-medium">Weather conditions for major cities along your route</p>
      </div>

      {/* Show severe weather alerts first if any */}
      {severeWaypoints.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">Severe Weather Alerts</h3>
            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">{severeWaypoints.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {severeWaypoints.map((waypointWeather, index) => (
              <WeatherCard key={`severe-${index}`} waypointWeather={waypointWeather} />
            ))}
          </div>
        </div>
      )}

      {/* Show clear weather conditions */}
      {clearWaypoints.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">Clear Conditions</h3>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">{clearWaypoints.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clearWaypoints.map((waypointWeather, index) => (
              <WeatherCard key={`clear-${index}`} waypointWeather={waypointWeather} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

