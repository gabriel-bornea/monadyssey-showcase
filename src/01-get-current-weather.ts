import {CurrentConditions, CurrentLocation, Weather} from "./types";

// @ts-ignore
let conditions: CurrentConditions = {};

// @ts-ignore
const getCurrentWeatherMonolithic = async () => {
  const locationRes = await fetch('https://ipinfo.io/json');
  if (!locationRes.ok) {
    throw new Error("Failed to retrieve user location");
  }
  const location: CurrentLocation = await locationRes.json();

  const [latitude, longitude] = location.loc.split(",").map(Number);

  const currentWeatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
  if (!currentWeatherRes.ok) {
    throw new Error("Failed to retrieve current weather conditions");
  }

  const weather: Weather = await currentWeatherRes.json();

  conditions = {
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
