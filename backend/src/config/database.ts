import { PrismaClient } from '@prisma/client';

class DatabaseConnection {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });
    }
    return DatabaseConnection.instance;
  }
}

export const prisma = DatabaseConnection.getInstance();
export default prisma;
