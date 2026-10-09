import { Report } from '@prisma/client';
import { IReportRepository } from '../interfaces/repositories';
import prisma from '../config/database';

export class ReportRepository implements IReportRepository {
  async create(data: any): Promise<Report> {
    const { title, description, generatedById, reportType, dataJson } = data;
    return prisma.report.create({
      data: {
        title,
        description,
        generatedById,
        reportType,
        dataJson,
      },
      include: {
        generatedBy: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Report[]> {
    return prisma.report.findMany({
      include: {
        generatedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<Report | null> {
    return prisma.report.findUnique({
      where: { id },
      include: {
        generatedBy: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
