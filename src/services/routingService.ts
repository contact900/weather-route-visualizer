import axios from 'axios';
import { RouteData, RoutePoint, Coordinates, Location } from '../types/weather';

const OPENROUTE_SERVICE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

interface OpenRouteResponse {
  features: Array<{
    geometry: {
      coordinates: number[][]; // [lon, lat] pairs
    };
    properties: {
      summary: {
        distance: number; // in meters
        duration: number; // in seconds
      };
    };
  }>;
}

export const calculateRoute = async (
  start: Coordinates,
  end: Coordinates,
  apiKey: string
): Promise<RouteData> => {
  try {
    const response = await axios.get<OpenRouteResponse>(OPENROUTE_SERVICE_URL, {
      params: {
        start: `${start.lon},${start.lat}`,
        end: `${end.lon},${end.lat}`,
      },
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      },
    });

    const feature = response.data.features[0];
    if (!feature) {
      throw new Error('No route found');
    }

    const coordinates = feature.geometry.coordinates;
    const distance = feature.properties.summary.distance / 1000; // convert to km
    const duration = feature.properties.summary.duration;

    // Convert [lon, lat] to [lat, lon] for Leaflet
    const polyline: [number, number][] = coordinates.map(([lon, lat]) => [lat, lon]);

    // Extract waypoints: start, end, and every ~80km (50 miles) along the route
    const waypoints: RoutePoint[] = [];
    const waypointInterval = 80000; // 80km in meters
    let accumulatedDistance = 0;

    waypoints.push({
      coordinates: { lat: coordinates[0][1], lon: coordinates[0][0] },
      name: 'Start',
    });

    // Calculate accumulated distances along the route
    const distances: number[] = [0];
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      const segmentDistance = haversineDistance(
        prev[1],
        prev[0],
        curr[1],
        curr[0]
      );
      accumulatedDistance += segmentDistance * 1000; // convert to meters
      distances.push(accumulatedDistance);
    }

    // Add intermediate waypoints (every ~120km to reduce API calls while still getting good coverage)
    // We'll still get city names for all waypoints, but fewer waypoints = faster processing
    let nextWaypointDistance = waypointInterval * 1.5; // ~120km instead of 80km
    const intermediateWaypoints: RoutePoint[] = [];
    for (let i = 1; i < coordinates.length - 1; i++) {
      if (distances[i] >= nextWaypointDistance) {
        intermediateWaypoints.push({
          coordinates: { lat: coordinates[i][1], lon: coordinates[i][0] },
        });
        nextWaypointDistance += waypointInterval * 1.5;
      }
    }
    
    // Limit total intermediate waypoints to max 10 to prevent excessive API calls
    if (intermediateWaypoints.length > 10) {
      // Take evenly distributed waypoints if we have too many
      const step = Math.ceil(intermediateWaypoints.length / 10);
      const filtered = [];
      for (let i = 0; i < intermediateWaypoints.length; i += step) {
        filtered.push(intermediateWaypoints[i]);
      }
      intermediateWaypoints.splice(0, intermediateWaypoints.length, ...filtered.slice(0, 10));
    }

    // Get city names for all intermediate waypoints in parallel batches (Nominatim allows 1 req/sec per IP)
    // We'll process in smaller batches to balance speed vs rate limits
    const waypointsWithCities: Array<{ waypoint: RoutePoint; cityName: string | null }> = [];
    
    // Process in batches of 3 to avoid rate limits, with 1 second delay between batches
    const batchSize = 3;
    for (let i = 0; i < intermediateWaypoints.length; i += batchSize) {
      const batch = intermediateWaypoints.slice(i, i + batchSize);
      
      // Process batch in parallel with a small stagger
      const batchPromises = batch.map((wp, batchIndex) => 
        new Promise<{ waypoint: RoutePoint; cityName: string | null }>((resolve) => {
          setTimeout(() => {
            reverseGeocode(wp.coordinates).then(cityName => {
              resolve({ waypoint: wp, cityName });
            }).catch(() => {
              resolve({ waypoint: wp, cityName: null });
            });
          }, batchIndex * 200); // Small stagger within batch
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      waypointsWithCities.push(...batchResults);
      
      // Delay between batches to respect rate limits (1 req/sec)
      if (i + batchSize < intermediateWaypoints.length) {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }

    // Filter to only keep waypoints with city names (major cities/towns)
    // Also deduplicate by city name
    const seenCities = new Set<string>();
    const majorCityWaypoints = waypointsWithCities
      .filter(w => {
        if (!w.cityName) return false;
        // Skip if we've already seen this city
        const cityKey = w.cityName.toLowerCase();
        if (seenCities.has(cityKey)) return false;
        seenCities.add(cityKey);
        return true;
      })
      .map(w => ({
        coordinates: w.waypoint.coordinates,
        name: w.cityName || undefined,
      }));

    // Add major city waypoints
    waypoints.push(...majorCityWaypoints);

    // Add end point
    const lastCoord = coordinates[coordinates.length - 1];
    waypoints.push({
      coordinates: { lat: lastCoord[1], lon: lastCoord[0] },
      name: 'End',
    });

    return {
      waypoints,
      polyline,
      distance,
      duration,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Route calculation failed: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
};

export const geocodeAddress = async (
  address: string,
  apiKey: string
): Promise<Coordinates> => {
  try {
    // Try OpenRouteService first
    try {
      const response = await axios.get('https://api.openrouteservice.org/geocoding', {
        params: {
          text: address,
        },
        headers: {
          'Authorization': apiKey,
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        },
      });

      const features = response.data.features;
      if (!features || features.length === 0) {
        throw new Error('Address not found');
      }

      const [lon, lat] = features[0].geometry.coordinates;
      return { lat, lon };
    } catch (orsError) {
      // Fallback to Nominatim (OpenStreetMap's geocoding service) - free and no API key needed
      console.warn('OpenRouteService geocoding failed, trying Nominatim fallback:', orsError);
      
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'WeatherRouteVisualizer/1.0',
        },
      });

      const results = response.data;
      if (!results || results.length === 0) {
        throw new Error('Address not found. Please try a more specific address or city name.');
      }

      const result = results[0];
      return { 
        lat: parseFloat(result.lat), 
        lon: parseFloat(result.lon) 
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      if (errorMessage.includes('Network Error') || errorMessage.includes('CORS') || errorMessage.includes('Network')) {
        throw new Error('Network error: Please check your internet connection. If the problem persists, try using coordinates (latitude, longitude) instead of addresses.');
      }
      throw new Error(`Geocoding failed: ${errorMessage}`);
    }
    throw error;
  }
};

// Reverse geocode to get city name from coordinates
export const reverseGeocode = async (
  coordinates: Coordinates
): Promise<string | null> => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lon,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'WeatherRouteVisualizer/1.0',
      },
    });

    const address = response.data.address;
    if (!address) return null;

    // Prioritize city, town, or municipality name - prefer larger places
    const cityName = address.city || address.town || address.municipality || 
                     (address.county && address.state ? `${address.county}, ${address.state}` : address.county) ||
                     address.state;
    
    return cityName || null;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return null;
  }
};

// Haversine formula to calculate distance between two points
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

