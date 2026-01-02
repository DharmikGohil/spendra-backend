import { User } from '../../../domain/entities/user.entity.js';
import { IUserRepository } from '../../../domain/interfaces/repos/user.repo.js';
import { UserMapper } from '../mappers/user.mapper.js';
import { prisma } from '../../database/client.js';
import { Prisma } from '@prisma/client';

/**
 * User repository implementation using Prisma.
 */
export class UserRepository implements IUserRepository {
  /**
   * Save a new user to the database.
   */
  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    const created = await prisma.user.create({ data });
    return UserMapper.toDomain(created);
  }

  /**
   * Find a user by their ID.
   */
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  /**
   * Find a user by their device ID.
   */
  async findByDeviceId(deviceId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { deviceId } });
    return user ? UserMapper.toDomain(user) : null;
  }

  /**
   * Update an existing user.
   */
  async update(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        deviceFingerprint: data.deviceFingerprint,
        settings: data.settings as Prisma.InputJsonValue,
        lastSyncAt: data.lastSyncAt,
      },
    });
    return UserMapper.toDomain(updated);
  }
}
