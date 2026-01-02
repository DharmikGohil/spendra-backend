import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { BaseError } from '../../domain/errors/base.error.js';
import { TRANSACTION_ERROR_CODES } from '../../domain/errors/transaction.codes.js';
import { CATEGORY_ERROR_CODES } from '../../domain/errors/category.codes.js';
import { USER_ERROR_CODES } from '../../domain/errors/user.codes.js';

interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: unknown;
}

// Map error codes to HTTP status codes
const errorToStatusCode = new Map<string, number>([
  // Transaction errors
  [TRANSACTION_ERROR_CODES.NOT_FOUND, 404],
  [TRANSACTION_ERROR_CODES.INVALID_AMOUNT, 400],
  [TRANSACTION_ERROR_CODES.INVALID_TYPE, 400],
  [TRANSACTION_ERROR_CODES.SYNC_FAILED, 500],
  [TRANSACTION_ERROR_CODES.DUPLICATE_HASH, 409],

  // Category errors
  [CATEGORY_ERROR_CODES.NOT_FOUND, 404],
  [CATEGORY_ERROR_CODES.INVALID_SLUG, 400],
  [CATEGORY_ERROR_CODES.INVALID_NAME, 400],
  [CATEGORY_ERROR_CODES.CIRCULAR_REFERENCE, 400],

  // User errors
  [USER_ERROR_CODES.NOT_FOUND, 404],
  [USER_ERROR_CODES.INVALID_DEVICE_ID, 400],
  [USER_ERROR_CODES.DEVICE_ID_REQUIRED, 401],
]);

export { errorToStatusCode };

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Log the error
  request.log.error({
    error: error.message,
    stack: error.stack,
    path: request.url,
    method: request.method,
  });

  let response: ErrorResponse;
  let statusCode: number;

  if (error instanceof BaseError) {
    // Domain-specific errors
    statusCode = errorToStatusCode.get(error.code) ?? error.statusCode;
    response = {
      status: 'error',
      code: error.code,
      message: error.message,
    };
  } else if (error instanceof ZodError) {
    // Validation errors
    const validationErrors = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    statusCode = 400;
    response = {
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: `Validation failed: ${validationErrors.map((e: { field: string; message: string }) => `${e.field} - ${e.message}`).join(', ')}`,
      details: validationErrors,
    };
  } else if ('statusCode' in error && typeof error.statusCode === 'number') {
    // Fastify errors with status code
    statusCode = error.statusCode;
    response = {
      status: 'error',
      code: 'REQUEST_ERROR',
      message: error.message,
    };
  } else {
    // Unknown errors
    statusCode = 500;
    response = {
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  reply.status(statusCode).send(response);
}
