import {IO} from "monadyssey";
import {CurrentConditions, CurrentLocation, Weather} from "./types";

export const getCurrentLocation = (): IO<ApplicationError, CurrentLocation> =>
  IO.of(
    async () => (await fetch('https://ipinfo.io/json')).json(),
    (e) => new UserLocationError(e instanceof Error ? e.message : "Failed to retrieve user location")
  );

export const getLatitudeAndLongitude = (location: CurrentLocation): IO<ApplicationError, [number, number]> =>
  IO.ofSync(
    () => location.loc.split(",").map(Number) as [number, number],
    (e) => new InvalidLocationError(e instanceof Error ? e.message : "Failed to parse user location")
  ).refine(
    ([lat, lon]) => !isNaN(lat) && !isNaN(lon),
    () => new InvalidLocationError("Invalid latitude or longitude values")
  );

export const getCurrentWeatherData = (latitude: Number, longitude: Number): IO<ApplicationError, Weather> =>
  IO.of(
    async () => (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)).json(),
    (e) => new WeatherRetrievalError(e instanceof Error ? e.message : "Failed to retrieve current weather conditions")
  );

export const setCurrentConditions = (location: CurrentLocation, weather: Weather): CurrentConditions => {
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