import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

console.log('🔌 Connecting to PostgreSQL...');

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter  
const adapter = new PrismaPg(pool);

// Prevent multiple instances in development
declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? new PrismaClient({
    adapter,
});

if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
    await prisma.$connect();
    console.log('✅ Database connected (PostgreSQL)');
}

export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
    await pool.end();
    console.log('Database disconnected');
}
