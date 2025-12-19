import { useState, useEffect } from 'react';
import { RouteInput } from './components/RouteInput';
import { MapView } from './components/MapView';
import { WeatherPanel } from './components/WeatherPanel';
import { AdviceGenerator } from './components/AdviceGenerator';
import { RouteSummary } from './components/RouteSummary';
import { calculateRoute, geocodeAddress } from './services/routingService';
import { getWeatherForWaypoints } from './services/weatherService';
import { RouteData, WaypointWeather, Location } from './types/weather';

function App() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [waypointWeathers, setWaypointWeathers] = useState<WaypointWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeysSet, setApiKeysSet] = useState(false);
  const [openRouteKey, setOpenRouteKey] = useState('eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYwOTQ5NjE1MmM3YTRmYjY5YTE1MzgzYWQ5MDI4MTQwIiwiaCI6Im11cm11cjY0In0=');
  const [openWeatherKey, setOpenWeatherKey] = useState('bbdf0ae173d5370002eb39a705baa0bf');
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);

  // Load API keys from localStorage on mount, or use defaults
  useEffect(() => {
    const storedRouteKey = localStorage.getItem('openRouteKey');
    const storedWeatherKey = localStorage.getItem('openWeatherKey');
    if (storedRouteKey && storedWeatherKey) {
      setOpenRouteKey(storedRouteKey);
      setOpenWeatherKey(storedWeatherKey);
      setApiKeysSet(true);
    } else {
      // Use default keys if no stored keys found
      const defaultRouteKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYwOTQ5NjE1MmM3YTRmYjY5YTE1MzgzYWQ5MDI4MTQwIiwiaCI6Im11cm11cjY0In0=';
      const defaultWeatherKey = 'bbdf0ae173d5370002eb39a705baa0bf';
      if (defaultRouteKey && defaultWeatherKey) {
        setOpenRouteKey(defaultRouteKey);
        setOpenWeatherKey(defaultWeatherKey);
        setApiKeysSet(true);
      }
    }
  }, []);

  const handleSetApiKeys = () => {
    if (openRouteKey.trim() && openWeatherKey.trim()) {
      setApiKeysSet(true);
      // Store in localStorage for convenience
      localStorage.setItem('openRouteKey', openRouteKey.trim());
      localStorage.setItem('openWeatherKey', openWeatherKey.trim());
    }
  };

  const handleCalculateRoute = async (startAddress: string, endAddress: string, pickupDate: string, deliveryDate: string) => {
    if (!apiKeysSet || !openRouteKey.trim() || !openWeatherKey.trim()) {
      setError('Please set your API keys first');
      return;
    }

    setLoading(true);
    setError(null);
    setRouteData(null);
    setWaypointWeathers([]);

    try {
      // Geocode addresses to coordinates
      const [startCoords, endCoords] = await Promise.all([
        geocodeAddress(startAddress, openRouteKey),
        geocodeAddress(endAddress, openRouteKey),
      ]);

      // Calculate route
      const route = await calculateRoute(startCoords, endCoords, openRouteKey);

      // Create locations for waypoints with city names
      const locations: Location[] = route.waypoints.map((wp) => ({
        name: wp.name || 'Location',
        coordinates: wp.coordinates,
      }));

      setRouteData(route);

      // Fetch weather for all waypoints with date context
      try {
        const pickup = new Date(pickupDate);
        const delivery = new Date(deliveryDate);
        setPickupDate(pickup);
        setDeliveryDate(delivery);
        
        // Show route immediately, then fetch weather in background
        const weathers = await getWeatherForWaypoints(locations, openWeatherKey, pickup, delivery);
        setWaypointWeathers(weathers);
      } catch (weatherError) {
        setError(
          `Route calculated successfully, but weather data could not be loaded: ${
            weatherError instanceof Error ? weatherError.message : 'Unknown error'
          }`
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setRouteData(null);
      setWaypointWeathers([]);
    } finally {
      setLoading(false);
    }
  };

  if (!apiKeysSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Weather Route Visualizer</h1>
          <p className="text-gray-600 mb-6">
            Enter your API keys to get started. Free API keys are available from:
          </p>
          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                OpenRouteService API Key
              </label>
              <input
                type="text"
                value={openRouteKey}
                onChange={(e) => setOpenRouteKey(e.target.value)}
                placeholder="Your OpenRouteService API key"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-2">
                Get free key at: <a href="https://openrouteservice.org/dev/#/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">openrouteservice.org</a>
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                OpenWeatherMap API Key
              </label>
              <input
                type="text"
                value={openWeatherKey}
                onChange={(e) => setOpenWeatherKey(e.target.value)}
                placeholder="Your OpenWeatherMap API key"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-2">
                Get free key at: <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">openweathermap.org</a>
              </p>
            </div>
          </div>
          <button
            onClick={handleSetApiKeys}
            disabled={!openRouteKey.trim() || !openWeatherKey.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Save API Keys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-white rounded-2xl p-4 shadow-xl">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Weather Route Visualizer
          </h1>
          <p className="text-xl text-gray-700 font-medium mb-2">Plan your truck routes with real-time weather intelligence</p>
          <p className="text-gray-500">Make informed decisions with comprehensive weather data along your entire route</p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Interactive Maps</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Real-time Alerts</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Smart Route Planning</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-bold text-lg">Error: </strong>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 transform transition-all duration-300 hover:scale-[1.01]">
            <RouteInput onCalculateRoute={handleCalculateRoute} loading={loading} />
          </div>
          {routeData && (
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <RouteSummary routeData={routeData} />
            </div>
          )}
          {!routeData && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Route summary will appear here</p>
                <p className="text-sm text-gray-400 mt-1">Enter your route to get started</p>
              </div>
            </div>
          )}
        </div>

        {routeData && (
          <div className="mb-6">
            <MapView routeData={routeData} waypointWeathers={waypointWeathers} />
          </div>
        )}

        {waypointWeathers.length > 0 && (
          <>
            <div className="mb-6 transform transition-all duration-300 hover:scale-[1.005]">
              <AdviceGenerator waypointWeathers={waypointWeathers} pickupDate={pickupDate || undefined} deliveryDate={deliveryDate || undefined} />
            </div>
            <div className="mb-6 transform transition-all duration-300">
              <WeatherPanel waypointWeathers={waypointWeathers} loading={loading} />
            </div>
          </>
        )}
        
        {!routeData && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">Enter Route</p>
                  <p className="text-sm text-gray-500">Add your origin and destination</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-indigo-600 font-bold text-lg">2</span>
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">Analyze Weather</p>
                  <p className="text-sm text-gray-500">Get real-time weather data</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-purple-600 font-bold text-lg">3</span>
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">Plan Safely</p>
                  <p className="text-sm text-gray-500">Make informed decisions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

