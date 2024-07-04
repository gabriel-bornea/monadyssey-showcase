class UserLocationError {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

class InvalidLocationError {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

class WeatherRetrievalError {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}

type ApplicationError = UserLocationError | InvalidLocationError | WeatherRetrievalError;
