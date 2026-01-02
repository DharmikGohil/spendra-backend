import { User } from '../../entities/user.entity.js';

/**
 * User repository interface - defines data access contract for users.
 */
export interface IUserRepository {
  /**
   * Save a new user to the database.
   */
  save(user: User): Promise<User>;

  /**
   * Find a user by their ID.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their device ID.
   */
  findByDeviceId(deviceId: string): Promise<User | null>;

  /**
   * Update an existing user.
   */
  update(user: User): Promise<User>;
}
