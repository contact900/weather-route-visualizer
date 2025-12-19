export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Location {
  name: string;
  coordinates: Coordinates;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  coord: Coordinates;
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  dt: number;
  name: string;
}

export interface ForecastWeather {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: WeatherCondition[];
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  pop: number; // probability of precipitation
  dt_txt: string;
}

export interface ForecastResponse {
  list: ForecastWeather[];
}

export interface WaypointWeather {
  location: Location;
  current: CurrentWeather;
  forecast: ForecastWeather[];
}

export interface RoutePoint {
  coordinates: Coordinates;
  name?: string;
}

export interface RouteData {
  waypoints: RoutePoint[];
  polyline: [number, number][]; // [lat, lon] pairs
  distance: number; // in kilometers
  duration: number; // in seconds
}

