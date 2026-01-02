import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { DeviceIdRequiredError } from '../../domain/errors/user.errors.js';

// Extend FastifyRequest to include userId
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    deviceId?: string;
  }
}

/**
 * Device authentication middleware
 * Extracts device ID from x-device-id header and validates it
 * Sets deviceId on request for downstream use
 */
export function deviceAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const deviceId = request.headers['x-device-id'];

  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
    const error = new DeviceIdRequiredError();
    reply.status(error.statusCode).send({
      status: 'error',
      code: error.code,
      message: error.message,
    });
    return;
  }

  // Set device ID on request for downstream handlers
  request.deviceId = deviceId.trim();
  done();
}

/**
 * Optional device auth - doesn't fail if missing
 * Used for routes that can work with or without device ID
 */
export function optionalDeviceAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const deviceId = request.headers['x-device-id'];

  if (deviceId && typeof deviceId === 'string' && deviceId.trim() !== '') {
    request.deviceId = deviceId.trim();
  }

  done();
}
