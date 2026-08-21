export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message = code,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const invalidCredentials = () => new AppError("invalid_credentials", 401);
export const unauthorized = () => new AppError("unauthorized", 401);
export const forbidden = () => new AppError("forbidden", 403);