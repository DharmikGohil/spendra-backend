/**
 * Error codes for category-related errors.
 */
export const CATEGORY_ERROR_CODES = {
  NOT_FOUND: 'CATEGORY_NOT_FOUND',
  INVALID_SLUG: 'CATEGORY_INVALID_SLUG',
  INVALID_NAME: 'CATEGORY_INVALID_NAME',
  CIRCULAR_REFERENCE: 'CATEGORY_CIRCULAR_REFERENCE',
} as const;

export type CategoryErrorCode = typeof CATEGORY_ERROR_CODES[keyof typeof CATEGORY_ERROR_CODES];
