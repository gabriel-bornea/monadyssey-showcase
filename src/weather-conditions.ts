import {property} from "lit/decorators.js";
import {html, LitElement} from "lit";
import {CurrentConditions} from "./types";
import 'bootstrap/dist/css/bootstrap.min.css';
import {IO, Policy, Schedule} from "monadyssey";
import {
  getCurrentLocation,
  getCurrentWeatherData,
  getLatitudeAndLongitude,
  mapToConditions
} from "./03-get-current-weather";
import {ApplicationError, WeatherRetrievalError} from "./error";

export class WeatherConditions extends LitElement {

  @property({type: Object}) conditions?: CurrentConditions;

  override createRenderRoot() {
    return this;
  }

  override async firstUpdated(): Promise<void> {
    const policy: Policy = {
      recurs: 3,
      factor: 1.2,
      delay: 1000,
      timeout: 3000
    };

    const scheduler = new Schedule(policy);

    await scheduler
      .retryIf(
        this.getCurrentWeather(),
        (e) => e.retryable,
        (e) => new WeatherRetrievalError(e.message)
      ).fold(
        (e: ApplicationError) => console.error(e.message),
        (conditions: CurrentConditions) => this.conditions = conditions
      );
  }

  getCurrentWeather = (): IO<ApplicationError, CurrentConditions> =>
    IO.forM(async (bind) => {
      const location = await bind(getCurrentLocation());
      const [latitude, longitude] = await bind(getLatitudeAndLongitude(location));
      const weather = await bind(getCurrentWeatherData(latitude, longitude));

      return mapToConditions(location, weather);
    });

  override render = () => html`
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div class="card" style="width: 480px; background: url('../public/clouds.png'); background-size: cover">
        <div class="card-body">
          <div class="row">
            <div class="col-md-6" style="text-align: center">
              <img src="../public/sun-1.png" alt="Sunny" width="180">
            </div>
            <div class="col-md-6">
              <div class="row">
                <div class="col-md-12">
                  <span style="font-size: 42px; font-weight: bold; color: var(--bs-dark-text-emphasis)">
                    ${this.conditions?.temperature} ${this.conditions?.temperatureUnit}
                  </span>
                </div>

                <div class="col-md-12" style="margin-top: 5px">
                  <div class="windSpeed">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" fill="#5DADE2">
                      <!--! Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. -->
                      <path
                        d="M288 32c0 17.7 14.3 32 32 32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c53 0 96-43 96-96s-43-96-96-96H320c-17.7 0-32 14.3-32 32zm64 352c0 17.7 14.3 32 32 32h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32 14.3-32 32zM128 512h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H160c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/>
                    </svg>
                    <span style="font-size: 14px; margin-left: 10px; color: var(--bs-dark-text-emphasis)">
                      ${this.conditions?.windSpeed} ${this.conditions?.windSpeedUnit} | ${this.conditions?.windDirection}
                    ${this.conditions?.windDirectionUnit}
                    </span>
                  </div>
                </div>

                <div class="col-md-12" style="margin-top: 2px">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="16" fill="#AF7AC5">
                    <!--! Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. -->
                    <path
                      d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                  </svg>
                  <span style="font-size: 14px; margin-left: 10px; color: var(--bs-dark-text-emphasis)">
                    ${this.conditions?.city}, ${this.conditions?.country}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

customElements.define("weather-conditions", WeatherConditions);
