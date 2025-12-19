import axios from 'axios';
import { Coordinates, CurrentWeather, ForecastWeather, WaypointWeather, Location } from '../types/weather';

const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

export const getCurrentWeather = async (
  coordinates: Coordinates,
  apiKey: string
): Promise<CurrentWeather> => {
  try {
    const response = await axios.get<CurrentWeather>(`${OPENWEATHER_API_URL}/weather`, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lon,
        appid: apiKey,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Weather fetch failed: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getWeatherForecast = async (
  coordinates: Coordinates,
  apiKey: string
): Promise<ForecastWeather[]> => {
  try {
    const response = await axios.get<{ list: ForecastWeather[] }>(`${OPENWEATHER_API_URL}/forecast`, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lon,
        appid: apiKey,
      },
    });
    return response.data.list;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Forecast fetch failed: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getWaypointWeather = async (
  location: Location,
  apiKey: string,
  pickupDate: Date,
  deliveryDate: Date
): Promise<WaypointWeather> => {
  try {
    const [current, forecast] = await Promise.all([
      getCurrentWeather(location.coordinates, apiKey),
      getWeatherForecast(location.coordinates, apiKey),
    ]);

    // Filter forecast to focus on dates relevant to the route (pickup to delivery window)
    const filteredForecast = forecast.filter((f) => {
      const forecastDate = new Date(f.dt * 1000);
      // Include forecasts from pickup date to delivery date + 1 day buffer
      const bufferDate = new Date(deliveryDate);
      bufferDate.setDate(bufferDate.getDate() + 1);
      return forecastDate >= pickupDate && forecastDate <= bufferDate;
    });

    return {
      location,
      current,
      forecast: filteredForecast.length > 0 ? filteredForecast : forecast.slice(0, 8), // Fallback to first 8 if no matches
    };
  } catch (error) {
    throw error;
  }
};

export const getWeatherForWaypoints = async (
  locations: Location[],
  apiKey: string,
  pickupDate: Date,
  deliveryDate: Date
): Promise<WaypointWeather[]> => {
  try {
    // Process weather requests in parallel batches for better performance
    // OpenWeatherMap free tier allows up to 60 calls/minute, so we can be more aggressive
    const batchSize = 5; // Process 5 requests at a time
    const results: WaypointWeather[] = [];

    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map((location) => {
        return getWaypointWeather(location, apiKey, pickupDate, deliveryDate);
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to be respectful of API limits (only if not last batch)
      if (i + batchSize < locations.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  } catch (error) {
    throw error;
  }
};

