import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    let tenantId: string | null = null;

    // If registering as PROFESSIONAL, create a new tenant
    if (dto.role === Role.PROFESSIONAL && dto.tenantName) {
      const slug = dto.tenantSlug || dto.tenantName.toLowerCase().replace(/\s+/g, '-');

      const existingTenant = await this.prisma.tenant.findUnique({
        where: { slug },
      });
      if (existingTenant) {
        throw new ConflictException('Tenant slug already taken');
      }

      const tenant = await this.prisma.tenant.create({
        data: {
          name: dto.tenantName,
          slug,
          email: dto.email,
          phone: dto.phone,
        },
      });
      tenantId = tenant.id;

      // Create default session types
      await this.prisma.sessionType.createMany({
        data: [
          { name: 'Primera Entrevista', durationMin: 60, price: 0, color: '#8B5CF6', tenantId },
          { name: 'Evaluación', durationMin: 50, price: 0, color: '#0EA5E9', tenantId },
          { name: 'Tratamiento', durationMin: 50, price: 0, color: '#06B6D4', tenantId },
        ],
      });

      // Create default payment config
      await this.prisma.paymentConfig.create({
        data: { tenantId },
      });
    }

    // If registering as PATIENT with an existing tenant
    if (dto.role === Role.PATIENT && dto.tenantId) {
      tenantId = dto.tenantId;
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role || Role.PATIENT,
        tenantId,
      },
    });

    // If patient, also create a Patient record
    if (user.role === Role.PATIENT && tenantId) {
      await this.prisma.patient.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          tenantId,
          userId: user.id,
        },
      });

      // Create in-app notification for the doctor
      await this.prisma.notification.create({
        data: {
          tenantId,
          type: 'CUSTOM',
          channel: 'WHATSAPP',
          recipient: 'in-app',
          message: `Nuevo paciente registrado: ${user.firstName} ${user.lastName}`,
          status: 'unread',
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.tenantId);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.tenantId);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...result } = user;

    if (user.role === Role.PATIENT) {
      const patient = await this.prisma.patient.findFirst({
        where: { userId: user.id },
        include: { 
          _count: { select: { anamneses: true } },
          anamneses: { orderBy: { createdAt: 'desc' } }
        },
      });
      return { ...result, patient };
    }

    return result;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    tenantId: string | null,
  ) {
    const payload = { sub: userId, email, role, tenantId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    return { accessToken, refreshToken };
  }
}
