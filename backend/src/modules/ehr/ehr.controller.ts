import {
  Controller, Get, Post, Param, Body, Query, UseGuards,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EhrService } from './ehr.service';
import { CreateAnamnesisDto } from './dto/create-anamnesis.dto';
import { CreateEvolutionDto } from './dto/create-evolution.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Role } from '@prisma/client';

const storage = diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

@Controller('ehr')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class EhrController {
  constructor(private ehrService: EhrService) {}

  // ─── Anamnesis ─────────────────────────────────
  @Post('anamnesis')
  @Roles(Role.PROFESSIONAL, Role.PATIENT, Role.SYSTEM_ADMIN)
  createAnamnesis(@CurrentTenant() tenantId: string, @Body() dto: CreateAnamnesisDto) {
    return this.ehrService.createAnamnesis(tenantId, dto);
  }

  @Get('anamnesis/:patientId')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  getAnamnesis(@Param('patientId') patientId: string, @CurrentTenant() tenantId: string) {
    return this.ehrService.getAnamnesis(patientId, tenantId);
  }

  // ─── Evolutions ────────────────────────────────
  @Post('evolutions')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  createEvolution(@CurrentTenant() tenantId: string, @Body() dto: CreateEvolutionDto) {
    return this.ehrService.createEvolution(tenantId, dto);
  }

  @Get('evolutions/:patientId')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  getEvolutions(@Param('patientId') patientId: string, @CurrentTenant() tenantId: string) {
    return this.ehrService.getEvolutions(patientId, tenantId);
  }

  // ─── Documents ─────────────────────────────────
  @Post('documents/:patientId')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadDocument(
    @CurrentTenant() tenantId: string,
    @Param('patientId') patientId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
  ) {
    return this.ehrService.uploadDocument(tenantId, patientId, file, description);
  }

  @Get('documents/:patientId')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  getDocuments(@Param('patientId') patientId: string, @CurrentTenant() tenantId: string) {
    return this.ehrService.getDocuments(patientId, tenantId);
  }
}
