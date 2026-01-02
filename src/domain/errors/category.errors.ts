import { BaseError } from './base.error.js';
import { CATEGORY_ERROR_CODES } from './category.codes.js';

/**
 * Error thrown when a category is not found.
 */
export class CategoryNotFoundError extends BaseError {
  constructor(identifier: string) {
    super(
      CATEGORY_ERROR_CODES.NOT_FOUND,
      `Category ${identifier} not found`,
      404
    );
  }
}

/**
 * Error thrown when category slug is invalid.
 */
export class InvalidCategorySlugError extends BaseError {
  constructor(slug: string) {
    super(
      CATEGORY_ERROR_CODES.INVALID_SLUG,
      `Invalid category slug: "${slug}". Slug cannot be empty.`,
      400
    );
  }
}

/**
 * Error thrown when category name is invalid.
 */
export class InvalidCategoryNameError extends BaseError {
  constructor(name: string) {
    super(
      CATEGORY_ERROR_CODES.INVALID_NAME,
      `Invalid category name: "${name}". Name cannot be empty.`,
      400
    );
  }
}

/**
 * Error thrown when a circular reference is detected in category hierarchy.
 */
export class CircularCategoryReferenceError extends BaseError {
  constructor(categoryId: string, parentId: string) {
    super(
      CATEGORY_ERROR_CODES.CIRCULAR_REFERENCE,
      `Circular reference detected: category ${categoryId} cannot have ${parentId} as parent.`,
      400
    );
  }
}
