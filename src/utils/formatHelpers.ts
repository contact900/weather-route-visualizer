export const formatTemperature = (kelvin: number, unit: 'F' | 'C' = 'F'): string => {
  if (unit === 'F') {
    const fahrenheit = ((kelvin - 273.15) * 9/5) + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  const celsius = kelvin - 273.15;
  return `${Math.round(celsius)}°C`;
};

export const formatDistance = (km: number): string => {
  const miles = km * 0.621371;
  if (miles < 1) {
    return `${Math.round(miles * 5280)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatWindSpeed = (mps: number): string => {
  const mph = mps * 2.237;
  return `${Math.round(mph)} mph`;
};

export const formatVisibility = (meters: number): string => {
  const miles = meters * 0.000621371;
  if (miles < 1) {
    return `${Math.round(miles * 5280)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
};

export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

