import type { TErrorSources } from "../interfaces/error.interface";

class AppError extends Error {
  public statusCode: number;
  public errorSources: TErrorSources[] | undefined = undefined;

  constructor(
    statusCode: number,
    message: string,
    errorSources?: TErrorSources[],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorSources = errorSources;

    if (stack) {
      this.stack = stack;
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
