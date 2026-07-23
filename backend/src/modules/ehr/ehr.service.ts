import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnamnesisDto } from './dto/create-anamnesis.dto';
import { CreateEvolutionDto } from './dto/create-evolution.dto';

@Injectable()
export class EhrService {
  constructor(private prisma: PrismaService) {}

  // ─── Anamnesis ─────────────────────────────────
  async createAnamnesis(tenantId: string, dto: CreateAnamnesisDto) {
    // Verify patient belongs to tenant
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.anamnesis.create({
      data: {
        patientId: dto.patientId,
        formType: dto.formType || 'psicopedagogia',
        data: dto.data,
        version: dto.version || 1,
      },
    });
  }

  async getAnamnesis(patientId: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.anamnesis.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Evolutions ────────────────────────────────
  async createEvolution(tenantId: string, dto: CreateEvolutionDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    // Evolutions are immutable — only create, never update
    return this.prisma.evolution.create({
      data: {
        patientId: dto.patientId,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  async getEvolutions(patientId: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.evolution.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Documents ─────────────────────────────────
  async uploadDocument(
    tenantId: string,
    patientId: string,
    file: Express.Multer.File,
    description?: string,
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.document.create({
      data: {
        patientId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        path: file.path,
        description,
      },
    });
  }

  async getDocuments(patientId: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.document.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
