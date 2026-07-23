import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Role } from '@prisma/client';

@Controller('patients')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.patientsService.findAll(tenantId, page, limit, search);
  }

  @Get(':id')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  findById(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.patientsService.findById(id, tenantId);
  }

  @Get(':id/timeline')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  getTimeline(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.patientsService.getTimeline(id, tenantId);
  }

  @Post()
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, tenantId, dto);
  }

  @Post(':id/evolutions')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  createEvolution(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() data: { title?: string; content: string },
  ) {
    return this.patientsService.createEvolution(id, tenantId, data);
  }

  @Post(':id/anamnesis')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  createAnamnesis(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() data: any,
  ) {
    return this.patientsService.createAnamnesis(id, tenantId, data);
  }

  @Patch(':id/anamnesis/:anamnesisId')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  updateAnamnesis(
    @Param('id') id: string,
    @Param('anamnesisId') anamnesisId: string,
    @CurrentTenant() tenantId: string,
    @Body() data: any,
  ) {
    return this.patientsService.updateAnamnesis(id, anamnesisId, tenantId, data);
  }
}
