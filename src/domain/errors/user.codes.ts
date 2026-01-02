/**
 * Error codes for user-related errors.
 */
export const USER_ERROR_CODES = {
  NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_DEVICE_ID: 'USER_INVALID_DEVICE_ID',
  DEVICE_ID_REQUIRED: 'USER_DEVICE_ID_REQUIRED',
} as const;

export type UserErrorCode = typeof USER_ERROR_CODES[keyof typeof USER_ERROR_CODES];
