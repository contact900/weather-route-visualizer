import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RouteData, WaypointWeather } from '../types/weather';
import { formatTemperature, formatWindSpeed, getWeatherIconUrl } from '../utils/formatHelpers';
import { hasSevereConditions } from '../utils/weatherHelpers';

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  routeData: RouteData | null;
  waypointWeathers: WaypointWeather[];
}

// Component to update map bounds when route changes
const MapBoundsUpdater = ({ routeData }: { routeData: RouteData | null }) => {
  const map = useMap();

  useEffect(() => {
    if (routeData && routeData.polyline.length > 0) {
      const bounds = L.latLngBounds(routeData.polyline);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeData, map]);

  return null;
};

// Custom weather icon
const createWeatherIcon = (iconCode: string, size: number = 32) => {
  return L.divIcon({
    className: 'weather-marker',
    html: `<img src="${getWeatherIconUrl(iconCode)}" width="${size}" height="${size}" style="background: white; border-radius: 50%; padding: 2px;"/>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export const MapView = ({ routeData, waypointWeathers }: MapViewProps) => {
  if (!routeData) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 shadow-inner">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600 font-medium">Enter origin and destination to view route</p>
        </div>
      </div>
    );
  }

  // Get weather for each waypoint and filter to only severe weather
  const waypointMap = new Map(
    waypointWeathers
      .filter(hasSevereConditions) // Only include waypoints with severe weather
      .map((w) => [`${w.location.coordinates.lat},${w.location.coordinates.lon}`, w])
  );

  // Determine route color based on weather severity
  const getRouteColor = (): string => {
    if (waypointWeathers.length === 0) return '#3388ff';
    
    // Check for severe weather
    const hasSevere = waypointWeathers.some((w) => {
      const main = w.current.weather[0]?.main.toLowerCase() || '';
      return main.includes('thunderstorm') || main.includes('extreme');
    });
    if (hasSevere) return '#dc2626'; // red

    // Check for moderate weather
    const hasModerate = waypointWeathers.some((w) => {
      const windSpeed = w.current.wind.speed * 2.237; // m/s to mph
      const visibility = (w.current.visibility || 10000) * 0.000621371; // meters to miles
      return windSpeed > 30 || visibility < 1;
    });
    if (hasModerate) return '#f97316'; // orange

    // Check for precipitation
    const hasPrecip = waypointWeathers.some((w) => {
      const main = w.current.weather[0]?.main.toLowerCase() || '';
      return ['rain', 'drizzle', 'snow', 'sleet'].some((p) => main.includes(p));
    });
    if (hasPrecip) return '#eab308'; // yellow

    return '#22c55e'; // green for clear
  };

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl">
      <MapContainer
        center={[routeData.polyline[0]?.[0] || 39.8283, routeData.polyline[0]?.[1] || -98.5795]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsUpdater routeData={routeData} />
        
        {/* Route polyline */}
        <Polyline
          positions={routeData.polyline}
          color={getRouteColor()}
          weight={4}
          opacity={0.8}
        />

        {/* Waypoint markers - only show for severe weather */}
        {routeData.waypoints.map((waypoint, index) => {
          const weather = waypointMap.get(`${waypoint.coordinates.lat},${waypoint.coordinates.lon}`);
          
          // Only show marker if there's severe weather at this location
          if (!weather) {
            return null;
          }

          const iconCode = weather.current.weather[0]?.icon || '01d';

          return (
            <Marker
              key={index}
              position={[waypoint.coordinates.lat, waypoint.coordinates.lon]}
              icon={createWeatherIcon(iconCode)}
            >
              <Popup>
                <div className="text-sm">
                  <strong className="font-bold">{waypoint.name || `Location ${index + 1}`}</strong>
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={getWeatherIconUrl(iconCode)}
                        alt={weather.current.weather[0]?.description}
                        className="w-6 h-6"
                      />
                      <span className="font-semibold">{formatTemperature(weather.current.main.temp)}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600 font-medium">
                      {weather.current.weather[0]?.description}
                    </div>
                    <div className="mt-1 text-xs">
                      Wind: {formatWindSpeed(weather.current.wind.speed)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

