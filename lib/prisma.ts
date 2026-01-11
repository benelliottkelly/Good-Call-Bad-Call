import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/app/generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`
const globalForPrisma = global as typeof globalThis & { prisma?: PrismaClient };

// const adapter = new PrismaPg({ connectionString })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }), });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// const prisma = new PrismaClient({ adapter })

// export { prisma }