import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, user: any, filters?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: BookingStatus;
    patientId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const where: any = { tenantId };

    if (filters?.date) {
      const dayStart = new Date(filters.date);
      const dayEnd = new Date(filters.date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.date = { gte: dayStart, lt: dayEnd };
    }

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters?.status) where.status = filters.status;

    if (user.role === 'PATIENT') {
      const patient = await this.prisma.patient.findFirst({
        where: { userId: user.id, tenantId }
      });
      if (!patient) throw new ConflictException('Patient record not found');
      where.patientId = patient.id;
    } else {
      if (filters?.patientId) where.patientId = filters.patientId;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
          sessionType: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        sessionType: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(tenantId: string, dto: CreateBookingDto, bookedById?: string) {
    let patientId = dto.patientId;
    
    if (!patientId && bookedById) {
      let patient = await this.prisma.patient.findFirst({
        where: { userId: bookedById, tenantId }
      });
      if (!patient) {
        // Auto-create patient profile for this clinic using User data
        const user = await this.prisma.user.findUnique({ where: { id: bookedById } });
        if (user && user.role === 'PATIENT') {
          patient = await this.prisma.patient.create({
            data: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              userId: user.id,
              tenantId,
            }
          });
        } else {
           throw new ConflictException('Patient record not found for this user');
        }
      }
      patientId = patient.id;
    }

    if (dto.status !== BookingStatus.BLOCKED && !patientId) {
      throw new ConflictException('patientId is required for regular bookings');
    }

    // Check for overlapping bookings
    const overlap = await this.prisma.booking.findFirst({
      where: {
        tenantId,
        date: new Date(dto.date),
        status: { notIn: [BookingStatus.CANCELLED] },
        OR: [
          { startTime: { lt: dto.endTime }, endTime: { gt: dto.startTime } },
        ],
      },
    });

    if (overlap) {
      throw new ConflictException('Time slot is already booked');
    }

    const booking = await this.prisma.booking.create({
      data: {
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason,
        notes: dto.notes,
        isFirstVisit: dto.isFirstVisit || false,
        copayAmount: dto.copayAmount,
        totalAmount: dto.totalAmount,
        status: dto.status || BookingStatus.PENDING,
        tenantId,
        patientId,
        sessionTypeId: dto.sessionTypeId,
        bookedById,
      },
    });

    // Create notification
    await this.prisma.notification.create({
      data: {
        tenantId,
        type: 'BOOKING_CONFIRMED',
        channel: 'WHATSAPP',
        recipient: 'in-app',
        message: `Nuevo turno: ${dto.date} a las ${dto.startTime}`,
        status: 'unread',
        bookingId: booking.id,
      },
    });

    return await this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        sessionType: true,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateBookingDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.booking.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        sessionType: true,
      },
    });
  }

  async cancel(id: string, tenantId: string) {
    return this.update(id, tenantId, { status: BookingStatus.CANCELLED });
  }

  // Patient portal: find all bookings for a user across all tenants
  async findAllByUser(userId: string) {
    const patients = await this.prisma.patient.findMany({
      where: { userId },
      select: { id: true },
    });
    const patientIds = patients.map(p => p.id);

    if (patientIds.length === 0) {
      return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { patientId: { in: patientIds } },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
          sessionType: true,
          tenant: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.booking.count({ where: { patientId: { in: patientIds } } }),
    ]);

    return {
      data: bookings,
      meta: { total, page: 1, limit: 50, totalPages: 1 },
    };
  }

  // Patient portal: cancel a booking owned by this user
  async cancelByUser(bookingId: string, userId: string) {
    const patients = await this.prisma.patient.findMany({
      where: { userId },
      select: { id: true },
    });
    const patientIds = patients.map(p => p.id);

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, patientId: { in: patientIds } },
    });
    if (!booking) throw new NotFoundException('Booking not found or not owned by you');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        sessionType: true,
      },
    });
  }

  async getAvailableSlots(tenantId: string, date: string, sessionTypeId: string) {
    // Parse date as local timezone to avoid UTC shift issues
    const [year, month, day] = date.split('T')[0].split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayOfWeek = localDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const availabilities = await this.prisma.availability.findMany({
      where: { tenantId, dayOfWeek: dayOfWeek as any, isActive: true },
    });

    // Get session type for duration
    const sessionType = await this.prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
    });
    if (!sessionType) throw new NotFoundException('Session type not found');

    // Get existing bookings for this date using local bounds
    const dayStart = new Date(year, month - 1, day);
    const dayEnd = new Date(year, month - 1, day + 1);

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
        date: { gte: dayStart, lt: dayEnd },
        status: { notIn: [BookingStatus.CANCELLED] },
      },
    });

    // Generate available slots
    const slots: { startTime: string; endTime: string }[] = [];

    for (const avail of availabilities) {
      let current = this.timeToMinutes(avail.startTime);
      const end = this.timeToMinutes(avail.endTime);

      while (current + sessionType.durationMin <= end) {
        const slotStart = this.minutesToTime(current);
        const slotEnd = this.minutesToTime(current + sessionType.durationMin);

        // Check if slot overlaps with existing bookings
        const isOccupied = existingBookings.some((b) => {
          const bStart = this.timeToMinutes(b.startTime);
          const bEnd = this.timeToMinutes(b.endTime);
          return current < bEnd && current + sessionType.durationMin > bStart;
        });

        if (!isOccupied) {
          slots.push({ startTime: slotStart, endTime: slotEnd });
        }

        current += sessionType.durationMin;
      }
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
