import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const where: any = { tenantId, isActive: true };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validPage = Number(page) || 1;
    const validLimit = Number(limit) || 20;

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip: (validPage - 1) * validLimit,
        take: validLimit,
        orderBy: { lastName: 'asc' },
        include: {
          insuranceProvider: true,
          _count: { select: { bookings: true, evolutions: true } },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
      meta: { total, page: validPage, limit: validLimit, totalPages: Math.ceil(total / validLimit) },
    };
  }

  async findById(id: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId },
      include: {
        insuranceProvider: true,
        legalGuardians: true,
        anamneses: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async getTimeline(id: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // Fetch all timeline items in parallel
    const [bookings, evolutions, documents] = await Promise.all([
      this.prisma.booking.findMany({
        where: { patientId: id },
        include: { sessionType: true },
        orderBy: { date: 'desc' },
      }),
      this.prisma.evolution.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Merge into unified timeline
    const timeline = [
      ...bookings.map((b) => ({ type: 'booking' as const, date: b.date, data: b })),
      ...evolutions.map((e) => ({ type: 'evolution' as const, date: e.createdAt, data: e })),
      ...documents.map((d) => ({ type: 'document' as const, date: d.createdAt, data: d })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  }

  async create(tenantId: string, dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }

  async createEvolution(patientId: string, tenantId: string, data: { title?: string; content: string }) {
    const patient = await this.prisma.patient.findFirst({ where: { id: patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.evolution.create({
      data: {
        title: data.title,
        content: data.content,
        patientId,
      },
    });
  }

  async createAnamnesis(patientId: string, tenantId: string, data: { formType?: string; data: any }) {
    const patient = await this.prisma.patient.findFirst({ where: { id: patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.anamnesis.create({
      data: {
        formType: data.formType || 'psicopedagogia',
        data: data.data,
        patientId,
      },
    });
  }

  async updateAnamnesis(patientId: string, anamnesisId: string, tenantId: string, data: any) {
    const patient = await this.prisma.patient.findFirst({ where: { id: patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const anamnesis = await this.prisma.anamnesis.findFirst({
      where: { id: anamnesisId, patientId },
    });
    if (!anamnesis) throw new NotFoundException('Anamnesis not found');

    return this.prisma.anamnesis.update({
      where: { id: anamnesisId },
      data: {
        data: data.data,
      },
    });
  }

  // Patient portal: create anamnesis by user (patient themselves)
  async createAnamnesisByUser(userId: string, formData: any) {
    const patient = await this.prisma.patient.findFirst({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient record not found');

    return this.prisma.anamnesis.create({
      data: {
        formType: 'psicopedagogia',
        data: formData,
        patientId: patient.id,
      },
    });
  }
}
