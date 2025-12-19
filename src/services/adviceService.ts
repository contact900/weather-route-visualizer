import { WaypointWeather, ForecastWeather } from '../types/weather';
import { formatTemperature } from '../utils/formatHelpers';
import { isSevereWeather, isSevereWind, isSevereVisibility } from '../utils/weatherHelpers';

export interface WeatherAdvice {
  severity: 'clear' | 'minor' | 'moderate' | 'severe';
  message: string;
  details: string[];
}


export const generateClientAdvice = (waypointWeathers: WaypointWeather[], pickupDate?: Date, deliveryDate?: Date): WeatherAdvice => {
  if (waypointWeathers.length === 0) {
    const dateContext = pickupDate && deliveryDate 
      ? ` from ${pickupDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : '';
    
    return {
      severity: 'clear',
      message: `No severe weather conditions detected along the route${dateContext}. Safe driving conditions expected.`,
      details: [],
    };
  }

  const details: string[] = [];
  let hasSevereWeather = false;
  let hasHighWinds = false;
  let hasLowVisibility = false;
  let maxWindSpeed = 0;
  let minVisibility = Infinity;
  const severeWeatherLocations: Array<{ name: string; condition: string }> = [];
  const windLocations: Array<{ name: string; speed: number }> = [];
  const visibilityLocations: Array<{ name: string; visibility: number }> = [];

  // Analyze only severe conditions that could hinder driving
  for (const waypoint of waypointWeathers) {
    const locationName = waypoint.location.name || 'location';
    const current = waypoint.current;
    const forecasts = waypoint.forecast.slice(0, 8); // Next 24 hours

    // Check current conditions for severe weather
    const weatherMain = current.weather[0]?.main.toLowerCase() || '';
    const weatherDesc = current.weather[0]?.description || '';
    
    if (isSevereWeather(weatherMain, weatherDesc)) {
      hasSevereWeather = true;
      severeWeatherLocations.push({
        name: locationName,
        condition: weatherDesc,
      });
      details.push(`Severe weather: ${weatherDesc} at ${locationName}`);
    }

    // Check wind speed
    const windSpeedMph = current.wind.speed * 2.237;
    if (windSpeedMph > maxWindSpeed) {
      maxWindSpeed = windSpeedMph;
    }
    if (isSevereWind(current.wind.speed)) {
      hasHighWinds = true;
      windLocations.push({
        name: locationName,
        speed: windSpeedMph,
      });
      details.push(`High winds: ${Math.round(windSpeedMph)} mph at ${locationName}`);
    }

    // Check visibility
    const visibilityMiles = (current.visibility || 10000) * 0.000621371;
    if (visibilityMiles < minVisibility) {
      minVisibility = visibilityMiles;
    }
    if (isSevereVisibility(current.visibility || 10000)) {
      hasLowVisibility = true;
      visibilityLocations.push({
        name: locationName,
        visibility: visibilityMiles,
      });
      details.push(`Low visibility: ${visibilityMiles.toFixed(1)} mi at ${locationName}`);
    }

    // Check forecast for severe conditions
    for (const forecast of forecasts) {
      const forecastWeather = forecast.weather[0]?.main.toLowerCase() || '';
      const forecastDesc = forecast.weather[0]?.description || '';
      const pop = forecast.pop;
      
      // Only flag if high probability of severe weather
      if (pop > 0.6 && isSevereWeather(forecastWeather, forecastDesc)) {
        const alreadyListed = severeWeatherLocations.some(l => l.name === locationName);
        if (!alreadyListed) {
          hasSevereWeather = true;
          severeWeatherLocations.push({
            name: locationName,
            condition: forecastDesc,
          });
        }
      }
    }
  }

  // Generate advice message - only for severe conditions
  let severity: WeatherAdvice['severity'] = 'clear';
  let message = '';

  if (hasSevereWeather || (hasHighWinds && maxWindSpeed > 50) || (hasLowVisibility && minVisibility < 0.25)) {
    severity = 'severe';
    message = 'SEVERE WEATHER ALERT: ';
    const alerts: string[] = [];
    
    if (hasSevereWeather && severeWeatherLocations.length > 0) {
      const locations = severeWeatherLocations.slice(0, 3).map(l => `${l.name} (${l.condition})`).join(', ');
      alerts.push(`Severe weather conditions at ${locations}`);
    }
    if (maxWindSpeed > 50) {
      const worstWind = windLocations.sort((a, b) => b.speed - a.speed)[0];
      alerts.push(`Extremely high winds (${Math.round(maxWindSpeed)} mph) at ${worstWind.name}`);
    }
    if (minVisibility < 0.25) {
      const worstVisibility = visibilityLocations.sort((a, b) => a.visibility - b.visibility)[0];
      alerts.push(`Very low visibility (${minVisibility.toFixed(1)} mi) at ${worstVisibility.name}`);
    }
    
    message += alerts.join('. ') + '. ';
    message += 'We recommend delaying departure or rerouting. Please contact us to discuss alternative arrangements.';
  } else if (hasHighWinds || hasLowVisibility || hasSevereWeather) {
    severity = 'moderate';
    message = 'MODERATE WEATHER CONDITIONS: ';
    const conditions: string[] = [];
    
    if (hasSevereWeather && severeWeatherLocations.length > 0) {
      const locations = severeWeatherLocations.slice(0, 2).map(l => l.name).join(' and ');
      conditions.push(`severe weather conditions at ${locations}`);
    }
    if (hasHighWinds) {
      const worstWind = windLocations.sort((a, b) => b.speed - a.speed)[0];
      conditions.push(`high winds (${Math.round(worstWind.speed)} mph) at ${worstWind.name}`);
    }
    if (hasLowVisibility) {
      const worstVisibility = visibilityLocations.sort((a, b) => a.visibility - b.visibility)[0];
      conditions.push(`reduced visibility (${worstVisibility.visibility.toFixed(1)} mi) at ${worstVisibility.name}`);
    }
    
    message += conditions.join(', ') + '. ';
    message += 'Delays may be possible. We will monitor conditions and update you if needed.';
  } else {
    severity = 'clear';
    message = 'CLEAR CONDITIONS: No severe weather conditions detected along the route. ';
    message += 'Safe driving conditions expected with on-time delivery likely.';
  }

  return {
    severity,
    message,
    details: details.length > 0 ? details : [],
  };
};

export const getAdviceColor = (severity: WeatherAdvice['severity']): string => {
  switch (severity) {
    case 'clear':
      return 'bg-green-100 border-green-500 text-green-800';
    case 'minor':
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    case 'moderate':
      return 'bg-orange-100 border-orange-500 text-orange-800';
    case 'severe':
      return 'bg-red-100 border-red-500 text-red-800';
    default:
      return 'bg-gray-100 border-gray-500 text-gray-800';
  }
};

