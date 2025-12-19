import { WaypointWeather } from '../types/weather';

// Check if weather condition is severe/hazardous for driving
export const isSevereWeather = (weatherMain: string, description: string): boolean => {
  const main = weatherMain.toLowerCase();
  const desc = description.toLowerCase();
  
  // Severe conditions that could hinder driving
  return (
    main.includes('thunderstorm') ||
    main.includes('snow') ||
    main.includes('sleet') ||
    main.includes('extreme') ||
    desc.includes('heavy') ||
    desc.includes('freezing') ||
    desc.includes('ice') ||
    desc.includes('blizzard') ||
    desc.includes('hail') ||
    desc.includes('torrential')
  );
};

// Check if wind speed is severe for trucks (typically > 30 mph is concerning)
export const isSevereWind = (windSpeedMps: number): boolean => {
  const windSpeedMph = windSpeedMps * 2.237;
  return windSpeedMph > 30;
};

// Check if visibility is severely reduced (< 1 mile is concerning)
export const isSevereVisibility = (visibilityMeters: number): boolean => {
  const visibilityMiles = (visibilityMeters || 10000) * 0.000621371;
  return visibilityMiles < 1;
};

// Check if waypoint has any severe weather conditions
export const hasSevereConditions = (waypointWeather: WaypointWeather): boolean => {
  const current = waypointWeather.current;
  const weatherMain = current.weather[0]?.main || '';
  const weatherDesc = current.weather[0]?.description || '';
  
  return (
    isSevereWeather(weatherMain, weatherDesc) ||
    isSevereWind(current.wind.speed) ||
    isSevereVisibility(current.visibility || 10000)
  );
};

