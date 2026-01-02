import { User as PrismaUser, Prisma } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity.js';

/**
 * Mapper for converting between User domain entity and Prisma model.
 */
export class UserMapper {
  /**
   * Convert Prisma model to domain entity.
   */
  static toDomain(prismaUser: PrismaUser): User {
    return User.reconstitute({
      id: prismaUser.id,
      deviceId: prismaUser.deviceId,
      deviceFingerprint: prismaUser.deviceFingerprint ?? undefined,
      settings: prismaUser.settings as Record<string, unknown>,
      createdAt: prismaUser.createdAt,
      lastSyncAt: prismaUser.lastSyncAt ?? undefined,
    });
  }

  /**
   * Convert domain entity to Prisma create/update data.
   */
  static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      deviceId: user.deviceId,
      deviceFingerprint: user.deviceFingerprint ?? null,
      settings: user.settings as Prisma.InputJsonValue,
      createdAt: user.createdAt,
      lastSyncAt: user.lastSyncAt ?? null,
    };
  }
}
