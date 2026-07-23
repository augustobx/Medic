import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getConfig(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        paymentConfig: true,
        sessionTypes: { where: { isActive: true } },
        tenantInsurances: { include: { insuranceProvider: true } },
      },
    });

    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updatePaymentConfig(tenantId: string, data: {
    alias?: string;
    cbu?: string;
    bankName?: string;
    holderName?: string;
    policyText?: string;
  }) {
    return this.prisma.paymentConfig.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });
  }

  async updateSessionTypePrice(id: string, tenantId: string, price: number) {
    const sessionType = await this.prisma.sessionType.findFirst({
      where: { id, tenantId },
    });
    if (!sessionType) throw new NotFoundException('Session type not found');

    return this.prisma.sessionType.update({
      where: { id },
      data: { price },
    });
  }

  async getInsurances(tenantId: string) {
    return this.prisma.tenantInsurance.findMany({
      where: { tenantId },
      include: { insuranceProvider: true },
    });
  }

  async addInsurance(tenantId: string, data: {
    insuranceProviderId: string;
    copayAmount?: number;
    copayPercentage?: number;
    reimbursementAmount?: number;
  }) {
    return this.prisma.tenantInsurance.create({
      data: { tenantId, ...data },
      include: { insuranceProvider: true },
    });
  }

  async getAllInsuranceProviders() {
    return this.prisma.insuranceProvider.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
