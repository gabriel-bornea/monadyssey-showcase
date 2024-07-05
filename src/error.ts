class GenericError {
  constructor(public readonly message: string, public readonly retryable: boolean) {}
}

class UserLocationError extends GenericError {
  constructor(message: string) {
    super(message, true);
  }
}

class InvalidLocationError extends GenericError {
  constructor(message: string) {
    super(message, false);
  }
}

class WeatherRetrievalError extends GenericError {
  constructor(message: string) {
    super(message, true);
  }
}

type ApplicationError = UserLocationError | InvalidLocationError | WeatherRetrievalError;
