import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  // Public — list professionals for patient portal
  @Get('public')
  listPublic() {
    return this.tenantsService.listPublic();
  }

  // Public — get tenant by slug (for booking portal)
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  // Protected — get own tenant details
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me')
  findOwn(@CurrentTenant() tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }

  // Protected — update own tenant
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Patch('me')
  update(@CurrentTenant() tenantId: string, @Body() data: any) {
    return this.tenantsService.update(tenantId, data);
  }

  // Session Types
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('me/session-types')
  createSessionType(@CurrentTenant() tenantId: string, @Body() data: any) {
    return this.tenantsService.createSessionType(tenantId, data);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Delete('me/session-types/:id')
  deleteSessionType(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.tenantsService.deleteSessionType(tenantId, id);
  }

  // Availabilities
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('me/availabilities')
  createAvailability(@CurrentTenant() tenantId: string, @Body() data: any) {
    return this.tenantsService.createAvailability(tenantId, data);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Delete('me/availabilities/:id')
  deleteAvailability(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.tenantsService.deleteAvailability(tenantId, id);
  }
}
