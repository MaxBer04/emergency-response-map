import { StatusCodes } from "http-status-codes";

/**
 * Base application error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, StatusCodes.NOT_FOUND);
  }
}

/**
 * 400 Bad Request error
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

/**
 * 429 Too Many Requests error
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests, please try again later") {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
  }
}

/**
 * 500 Service Unavailable error
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service temporarily unavailable") {
    super(message, StatusCodes.SERVICE_UNAVAILABLE);
  }
}

/**
 * External API error
 */
export class ExternalAPIError extends AppError {
  constructor(
    message: string = "External API error",
    statusCode: number = StatusCodes.BAD_GATEWAY
  ) {
    super(message, statusCode, false);
  }
}
