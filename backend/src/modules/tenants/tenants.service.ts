import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        sessionTypes: { where: { isActive: true } },
        tenantInsurances: { include: { insuranceProvider: true } },
        paymentConfig: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        sessionTypes: { where: { isActive: true } },
        tenantInsurances: { include: { insuranceProvider: true } },
        paymentConfig: true,
        availabilities: { where: { isActive: true } },
      },
    });
  }

  async listPublic() {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        specialty: true,
        logoUrl: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  // Session Types
  async createSessionType(tenantId: string, data: any) {
    return this.prisma.sessionType.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async deleteSessionType(tenantId: string, id: string) {
    return this.prisma.sessionType.delete({
      where: { id, tenantId },
    });
  }

  // Availabilities
  async createAvailability(tenantId: string, data: any) {
    return this.prisma.availability.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async deleteAvailability(tenantId: string, id: string) {
    return this.prisma.availability.delete({
      where: { id, tenantId },
    });
  }
}
