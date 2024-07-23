class GenericError {
  constructor(public readonly message: string, public readonly retryable: boolean) {}
}

export class UserLocationError extends GenericError {
  constructor(message: string) {
    super(message, true);
  }
}

export class InvalidLocationError extends GenericError {
  constructor(message: string) {
    super(message, false);
  }
}

export class WeatherRetrievalError extends GenericError {
  constructor(message: string) {
    super(message, true);
  }
}

export type ApplicationError = UserLocationError | InvalidLocationError | WeatherRetrievalError;
