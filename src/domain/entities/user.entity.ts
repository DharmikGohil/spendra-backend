import { v4 as uuidv4 } from 'uuid';
import { InvalidDeviceIdError } from '../errors/user.errors.js';

/**
 * User entity - Immutable domain object representing a user.
 * Users are identified by their device ID in this mobile-first application.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly deviceId: string,
    public readonly deviceFingerprint: string | undefined,
    public readonly settings: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly lastSyncAt: Date | undefined
  ) {
    Object.freeze(this);
  }

  /**
   * Factory method to create a new User entity.
   * Validates invariants before creation.
   */
  static create(props: {
    deviceId: string;
    deviceFingerprint?: string;
    settings?: Record<string, unknown>;
  }): User {
    // Validate invariants
    if (!props.deviceId || props.deviceId.trim().length === 0) {
      throw new InvalidDeviceIdError(props.deviceId ?? '');
    }

    return new User(
      uuidv4(),
      props.deviceId.trim(),
      props.deviceFingerprint?.trim(),
      props.settings ?? {},
      new Date(),
      undefined
    );
  }

  /**
   * Reconstitute a User entity from persistence data.
   * Used by mappers when loading from database.
   */
  static reconstitute(props: {
    id: string;
    deviceId: string;
    deviceFingerprint: string | undefined;
    settings: Record<string, unknown>;
    createdAt: Date;
    lastSyncAt: Date | undefined;
  }): User {
    return new User(
      props.id,
      props.deviceId,
      props.deviceFingerprint,
      props.settings,
      props.createdAt,
      props.lastSyncAt
    );
  }

  /**
   * Create a new User with updated lastSyncAt timestamp.
   * Returns a new immutable User instance.
   */
  updateLastSync(): User {
    return new User(
      this.id,
      this.deviceId,
      this.deviceFingerprint,
      this.settings,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Create a new User with updated settings.
   * Returns a new immutable User instance.
   */
  updateSettings(settings: Record<string, unknown>): User {
    return new User(
      this.id,
      this.deviceId,
      this.deviceFingerprint,
      { ...this.settings, ...settings },
      this.createdAt,
      this.lastSyncAt
    );
  }
}
