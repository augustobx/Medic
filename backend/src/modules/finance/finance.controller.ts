import { Controller, Get, Put, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Role } from '@prisma/client';

@Controller('finance')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('config')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  getConfig(@CurrentTenant() tenantId: string) {
    return this.financeService.getConfig(tenantId);
  }

  @Put('payment-config')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  updatePaymentConfig(@CurrentTenant() tenantId: string, @Body() data: any) {
    return this.financeService.updatePaymentConfig(tenantId, data);
  }

  @Patch('session-types/:id/price')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  updateSessionTypePrice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body('price') price: number,
  ) {
    return this.financeService.updateSessionTypePrice(id, tenantId, price);
  }

  @Get('insurances')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  getInsurances(@CurrentTenant() tenantId: string) {
    return this.financeService.getInsurances(tenantId);
  }

  @Post('insurances')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  addInsurance(@CurrentTenant() tenantId: string, @Body() data: any) {
    return this.financeService.addInsurance(tenantId, data);
  }

  @Get('insurance-providers')
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  getAllInsuranceProviders() {
    return this.financeService.getAllInsuranceProviders();
  }
}
