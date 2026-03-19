import HttpStatus from 'http-status-codes';

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message: string = 'Something went wrong',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set prototype explicitly
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  // Factory methods for common errors
  static badRequest(message: string = 'Bad Request', details?: any): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, true, details);
  }
  static requiredfield(message: string = 'Required Fields Missing', details?: any): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, true, details);
  }
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message);
  }

  static notFound(message: string = 'Not Found'): ApiError {
    return new ApiError(HttpStatus.NOT_FOUND, message);
  }

  static conflict(message: string = 'Conflict', details?: any): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message, true, details);
  }

  static validationError(message: string = 'Validation Error', details?: any): ApiError {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, true, details);
  }

  static serverError(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, false);
  }

  static databaseError(message: string = 'Database Error'): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, false);
  }

  static serviceUnavailable(message: string = 'Service Unavailable'): ApiError {
    return new ApiError(HttpStatus.SERVICE_UNAVAILABLE, message, true);
  }

  static tooManyRequests(message: string = 'Too Many Requests'): ApiError {
    return new ApiError(HttpStatus.TOO_MANY_REQUESTS, message);
  }

  // Check if error is operational (expected) vs programming error
  static isOperationalError(error: any): boolean {
    if (error instanceof ApiError) {
      return error.isOperational;
    }
    return false;
  }

  // Convert to JSON response
  toJSON(): any {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString(),
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }

  // Log error
  logError(): void {
    console.error(`[${new Date().toISOString()}] ${this.constructor.name}:`, {
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      stack: this.stack,
      details: this.details
    });
  }
}