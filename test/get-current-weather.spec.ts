import {beforeEach, describe, expect, it} from "@jest/globals";
import fetch from "jest-fetch-mock";
import {
  getCurrentLocation,
  getCurrentWeatherData,
  getLatitudeAndLongitude,
  mapToConditions
} from "../src/03-get-current-weather";
import {CurrentConditions, CurrentLocation, Weather} from "../src/types";
import {Err, IO, Ok} from "monadyssey";
import {ApplicationError} from "../src/error";

describe("Get weather conditions", () => {
  describe("getCurrentLocation", () => {
    beforeEach(() => {
      fetch.resetMocks();
    });

    it("should return the current location", async () => {
      fetch.mockResponseOnce(JSON.stringify(
        {
          ip: "127.0.0.1",
          city: "Bucharest",
          region: "Bucharest",
          country: "Romania",
          loc: "12.34,56.78",
          postal: "00000",
          timezone: "Europe/Bucharest",
        }
      ), {
        headers: {
          "Content-Type": "application/json"
        }
      });

      const eff = await getCurrentLocation().runAsync();

      expect(IO.isOk(eff)).toBe(true);
      const location = (eff as Ok<CurrentLocation>).value;
      expect(location.loc).toBe("12.34,56.78")
    });

    it("should return an error if location service request fails", async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          error: "An internal error has occurred, please try again later",
        }),
        {status: 500}
      );
      const eff = await getCurrentLocation().runAsync();

      expect(IO.isErr(eff)).toBe(true);
      const error = (eff as Err<ApplicationError>).error;
      expect(error.message).toContain("Request failed with status 500");
    });
  });

  describe("getLatitudeAndLongitude", () => {
    it('should parse the location and extract latitude and longitude', async () => {
      const location: CurrentLocation = {
        ip: "127.0.0.1",
        city: "Bucharest",
        region: "Bucharest",
        country: "Romania",
        loc: "12.34,56.78",
        postal: "00000",
        timezone: "Europe/Bucharest",
      }

      const eff = await getLatitudeAndLongitude(location).runAsync();

      expect(IO.isOk(eff)).toBe(true);
      const [latitude, longitude] = (eff as Ok<[number, number]>).value;
      expect(latitude).toBe(12.34);
      expect(longitude).toBe(56.78);
    });

    it('should return an error if location data is invalid', async () => {
      const location: CurrentLocation = {
        ip: "127.0.0.1",
        city: "Bucharest",
        region: "Bucharest",
        country: "Romania",
        loc: "abc,efg",
        postal: "00000",
        timezone: "Europe/Bucharest",
      }

      const eff = await getLatitudeAndLongitude(location).runAsync();

      expect(IO.isErr(eff)).toBe(true);
      const error = (eff as Err<ApplicationError>).error;
      expect(error.message).toContain("Invalid latitude or longitude values");
    });
  });

  describe("getCurrentWeatherData", () => {
    it("should return the current weather based on coordinates", async () => {
      fetch.mockResponseOnce(JSON.stringify(
        {
          "latitude": 40.7128,
          "longitude": -74.0060,
          "generationtime_ms": 12.345,
          "utc_offset_seconds": -14400,
          "timezone": "America/New_York",
          "timezone_abbreviation": "EDT",
          "elevation": 10,
          "current_weather_units": {
            "time": "iso8601",
            "interval": "minutes",
            "temperature": "°C",
            "windspeed": "km/h",
            "winddirection": "degrees",
            "is_day": "binary",
            "weathercode": "code"
          },
          "current_weather": {
            "time": "2024-07-23T14:00:00Z",
            "interval": 60,
            "temperature": 29.5,
            "windspeed": 15.2,
            "winddirection": 270,
            "is_day": 1,
            "weathercode": 3
          }
        }
      ))

      const eff = await getCurrentWeatherData(40.7128, -74.0060).runAsync()

      expect(IO.isOk(eff)).toBe(true);
      const weather = (eff as Ok<Weather>).value;
      expect(weather.current_weather.temperature).toBe(29.5);
      expect(weather.current_weather_units.temperature).toBe("°C");
    });

    it("should return an error if weather service request fails", async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          error: "An internal error has occurred, please try again later",
        }),
        {status: 500}
      );

      const eff = await getCurrentWeatherData(40.7128, -74.0060).runAsync()

      expect(IO.isErr(eff)).toBe(true);
      const error = (eff as Err<ApplicationError>).error;
      expect(error.message).toContain("Request failed with status 500");
    });
  })

  describe("getCurrentWeather", () => {
    it("should return the current weather based on coordinates", async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            ip: "127.0.0.1",
            city: "Bucharest",
            region: "Bucharest",
            country: "Romania",
            loc: "12.34,56.78",
            postal: "00000",
            timezone: "Europe/Bucharest",
          }),
          {headers: {"Content-Type": "application/json"}}
        ],
        [
          JSON.stringify({
            latitude: 40.7128,
            longitude: -74.0060,
            generationtime_ms: 12.345,
            utc_offset_seconds: -14400,
            timezone: "America/New_York",
            timezone_abbreviation: "EDT",
            elevation: 10,
            current_weather_units: {
              time: "iso8601",
              interval: "minutes",
              temperature: "°C",
              windspeed: "km/h",
              winddirection: "degrees",
              is_day: "binary",
              weathercode: "code"
            },
            current_weather: {
              time: "2024-07-23T14:00:00Z",
              interval: 60,
              temperature: 29.5,
              windspeed: 15.2,
              winddirection: 270,
              is_day: 1,
              weathercode: 3
            }
          }),
          {headers: {"Content-Type": "application/json"}}
        ]
      );

      const eff = await IO.forM<ApplicationError, CurrentConditions>(async bind => {
        const location = await bind(getCurrentLocation());
        const [latitude, longitude] = await bind(getLatitudeAndLongitude(location));
        const weather = await bind(getCurrentWeatherData(latitude, longitude));

        return mapToConditions(location, weather);
      }).runAsync();

      switch (eff.type) {
        case "Err":
          expect(eff.error.message).toBe(false);
          break;
        case "Ok":
          expect(eff.value.temperature).toBe(29.5);
          break;
      }
    });

    it("should short-circuit the computation when an error occurs", async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            ip: "127.0.0.1",
            city: "Bucharest",
            region: "Bucharest",
            country: "Romania",
            loc: "12.34,56.78",
            postal: "00000",
            timezone: "Europe/Bucharest",
          }),
          {headers: {"Content-Type": "application/json"}}
        ],
        [
          JSON.stringify({
            error: "An internal error has occurred, please try again later",
          }),
          {
            status: 500
          }
        ]
      );

      const eff = await getCurrentLocation()
        .flatMap((location) => getLatitudeAndLongitude(location)
          .flatMap(([lat, lon]) => getCurrentWeatherData(lat, lon)
            .map((weather) => mapToConditions(location, weather)))).runAsync();

      switch (eff.type) {
        case "Err":
          expect(eff.error.message).toContain("Request failed with status 500");
          break;
        case "Ok":
          expect(eff.value.temperature).toBe(0.0);
          break;
      }
    });
  });
})
