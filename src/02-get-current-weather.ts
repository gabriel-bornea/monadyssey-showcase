import {CurrentConditions, CurrentLocation, Weather} from "./types";

// @ts-ignore
const getCurrentLocation = async (): Promise<CurrentLocation> => {
  try {
    const response = await fetch('https://ipinfo.io/json');
    if (!response.ok) {
      return Promise.reject(new Error("Failed to retrieve user location"));
    }
    return await response.json();
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to retrieve user location";
    return Promise.reject(new Error(message));
  }
}

// @ts-ignore
const getLatitudeAndLongitude = (location: CurrentLocation): Promise<[number, number]> => {
  if (!location.loc) {
    return Promise.reject(new Error("Location data is missing"));
  }
  const [latitude, longitude] = location.loc.split(",").map(Number);

  if (!latitude || !longitude) {
    return Promise.reject(new Error("Latitude or longitude data is missing"));
  }

  if (isNaN(latitude) || isNaN(longitude)) {
    return Promise.reject(new Error("Invalid latitude or longitude values"));
  }

  return Promise.resolve([latitude, longitude]);
}

// @ts-ignore
const getCurrentWeatherData = async (latitude: Number, longitude: Number): Promise<Weather> => {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    if (!response.ok) {
      return Promise.reject(new Error("Failed to retrieve current weather conditions"));
    }

    return await response.json();
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to retrieve current weather conditions";
    return Promise.reject(new Error(message));
  }
}

// @ts-ignore
const mapToConditions = (location: CurrentLocation, weather: Weather): CurrentConditions => {
  return {
    city: location.city,
    country: location.country,
    temperature: weather.current_weather.temperature,
    temperatureUnit: weather.current_weather_units.temperature,
    windSpeed: weather.current_weather.windspeed,
    windSpeedUnit: weather.current_weather_units.windspeed,
    windDirection: weather.current_weather.winddirection,
    windDirectionUnit: weather.current_weather_units.winddirection
  }
}
