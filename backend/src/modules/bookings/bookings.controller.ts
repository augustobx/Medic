import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, BadRequestException
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators/tenant.decorator';
import { BookingStatus } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: BookingStatus,
    @Query('patientId') patientId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingsService.findAll(tenantId, user, {
      date, startDate, endDate, status, patientId, page, limit,
    });
  }

  @Get('availability')
  getAvailableSlots(
    @Query('tenantId') tenantId: string,
    @Query('date') date: string,
    @Query('sessionTypeId') sessionTypeId: string,
  ) {
    return this.bookingsService.getAvailableSlots(tenantId, date, sessionTypeId);
  }

  // Patient portal: get own bookings across all tenants (no TenantGuard needed)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyBookings(@CurrentUser() user: any) {
    return this.bookingsService.findAllByUser(user.id);
  }

  // Patient portal: cancel own booking
  @UseGuards(JwtAuthGuard)
  @Delete('my/:id')
  cancelMyBooking(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.cancelByUser(id, user.id);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.bookingsService.findById(id, tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentTenant() userTenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateBookingDto,
  ) {
    const tenantId = dto.tenantId || userTenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.bookingsService.create(tenantId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, tenantId, dto);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Delete(':id')
  cancel(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.bookingsService.cancel(id, tenantId);
  }
}
