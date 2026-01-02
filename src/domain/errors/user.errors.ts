import { BaseError } from './base.error.js';
import { USER_ERROR_CODES } from './user.codes.js';

/**
 * Error thrown when a user is not found.
 */
export class UserNotFoundError extends BaseError {
  constructor(identifier: string) {
    super(
      USER_ERROR_CODES.NOT_FOUND,
      `User ${identifier} not found`,
      404
    );
  }
}

/**
 * Error thrown when device ID is invalid.
 */
export class InvalidDeviceIdError extends BaseError {
  constructor(deviceId: string) {
    super(
      USER_ERROR_CODES.INVALID_DEVICE_ID,
      `Invalid device ID: "${deviceId}". Device ID cannot be empty.`,
      400
    );
  }
}

/**
 * Error thrown when device ID is required but not provided.
 */
export class DeviceIdRequiredError extends BaseError {
  constructor() {
    super(
      USER_ERROR_CODES.DEVICE_ID_REQUIRED,
      'Device ID is required. Please provide x-device-id header.',
      401
    );
  }
}
