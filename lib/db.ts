import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL) {
    prismaInstance =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
  }
} catch {
  console.warn('[prisma] Database not available, running without persistence');
}

export const prisma = prismaInstance;
