import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { ZodError, ZodSchema } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Creates a validation middleware for Fastify routes
 * Validates body, query, and params against Zod schemas
 */
export function validateSchema(schemas: ValidationSchemas) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      if (schemas.body) {
        request.body = await schemas.body.parseAsync(request.body);
      }

      if (schemas.query) {
        request.query = await schemas.query.parseAsync(request.query);
      }

      if (schemas.params) {
        request.params = await schemas.params.parseAsync(request.params);
      }
    } catch (error) {
      if (error instanceof ZodError) {npm
        const validationErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        const response: ErrorResponse = {
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: `Validation failed: ${validationErrors.map((e: { field: string; message: string }) => `${e.field} - ${e.message}`).join(', ')}`,
          details: validationErrors,
        };

        reply.status(400).send(response);
        return;
      }

      throw error;
    }
  };
}
