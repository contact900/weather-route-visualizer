import { WaypointWeather } from '../types/weather';
import { formatTemperature, formatWindSpeed, formatVisibility, getWeatherIconUrl } from '../utils/formatHelpers';
import { isSevereWeather, isSevereWind, isSevereVisibility } from '../utils/weatherHelpers';

interface WeatherCardProps {
  waypointWeather: WaypointWeather;
}

export const WeatherCard = ({ waypointWeather }: WeatherCardProps) => {
  const { location, current, forecast } = waypointWeather;
  const mainWeather = current.weather[0];
  const weatherMain = mainWeather?.main || '';
  const weatherDesc = mainWeather?.description || '';
  
  // Check if there are severe conditions
  const hasSevereWeather = isSevereWeather(weatherMain, weatherDesc);
  const hasSevereWind = isSevereWind(current.wind.speed);
  const hasSevereVisibility = isSevereVisibility(current.visibility || 10000);
  const hasAnySevere = hasSevereWeather || hasSevereWind || hasSevereVisibility;

  const nextForecast = forecast.slice(0, 3); // Next 9 hours (3-hour intervals)
  
  // Determine border color based on severity - show all cards but with different styling
  const borderColor = hasSevereWeather ? 'border-red-500 border-2 shadow-lg' : 
                      (hasSevereWind || hasSevereVisibility) ? 'border-orange-500 border-2 shadow-md' : 
                      'border-green-200 border-2';

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{location.name || 'Location'}</h3>
        {mainWeather && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2 shadow-sm">
            <img
              src={getWeatherIconUrl(mainWeather.icon)}
              alt={mainWeather.description}
              className="w-12 h-12"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-800">
            {formatTemperature(current.main.temp)}
          </span>
          {mainWeather && (
            <span className="text-gray-600 capitalize">{mainWeather.description}</span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Feels like {formatTemperature(current.main.feels_like)}
        </div>
      </div>

      {/* Condition status indicator */}
      {hasAnySevere ? (
        <>
          {/* Severe condition warnings */}
          {hasSevereWeather && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-300 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-bold text-red-800">Severe Weather Alert</p>
          </div>
          <p className="text-sm text-red-700 font-medium">{weatherDesc}</p>
        </div>
      )}
      {hasSevereWind && (
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-300 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-bold text-orange-800">High Winds</p>
          </div>
          <p className="text-sm text-orange-700 font-medium">{formatWindSpeed(current.wind.speed)} - May affect vehicle stability</p>
        </div>
      )}
      {hasSevereVisibility && (
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-300 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-bold text-orange-800">Reduced Visibility</p>
          </div>
          <p className="text-sm text-orange-700 font-medium">{formatVisibility(current.visibility || 10000)} - Use caution</p>
        </div>
      )}
        </>
      ) : (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-bold text-green-800">Clear Conditions</p>
          </div>
          <p className="text-sm text-green-700 font-medium mt-1">Safe driving conditions expected</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Wind</span>
          <span className={`text-base font-bold ${hasSevereWind ? 'text-orange-600' : 'text-gray-800'}`}>
            {formatWindSpeed(current.wind.speed)}
          </span>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Visibility</span>
          <span className={`text-base font-bold ${hasSevereVisibility ? 'text-orange-600' : 'text-gray-800'}`}>
            {formatVisibility(current.visibility || 10000)}
          </span>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Humidity</span>
          <span className="text-base font-bold text-gray-800">
            {current.main.humidity}%
          </span>
        </div>
      </div>

      {nextForecast.length > 0 && (
        <div className="border-t-2 border-gray-100 pt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Forecast Timeline</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {nextForecast.map((f) => {
              const forecastDate = new Date(f.dt * 1000);
              const isToday = forecastDate.toDateString() === new Date().toDateString();
              const isTomorrow = forecastDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
              
              return (
                <div key={f.dt} className="flex-shrink-0 text-center min-w-[80px] bg-gray-50 rounded-xl p-2 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {forecastDate.toLocaleTimeString('en-US', { hour: 'numeric' })}
                  </div>
                  {f.weather[0] && (
                    <img
                      src={getWeatherIconUrl(f.weather[0].icon)}
                      alt={f.weather[0].description}
                      className="w-10 h-10 mx-auto mb-2"
                    />
                  )}
                  <div className="text-sm font-bold text-gray-800 mb-1">{formatTemperature(f.main.temp)}</div>
                  {f.pop > 0 && (
                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 inline-block">
                      {Math.round(f.pop * 100)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

