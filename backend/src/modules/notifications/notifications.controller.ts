import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * GET /notifications/webhook
   * Meta WhatsApp webhook verification endpoint
   */
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const result = this.notificationsService.verifyWebhook(mode, token, challenge);

    if (result) {
      return res.status(HttpStatus.OK).send(result);
    }

    return res.status(HttpStatus.FORBIDDEN).send('Verification failed');
  }

  /**
   * POST /notifications/webhook
   * Receive incoming WhatsApp webhook events from Meta
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  processWebhook(@Body() body: any) {
    return this.notificationsService.processWebhook(body);
  }

  // --- In-App Notifications ---
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  @Get()
  getInAppNotifications(@CurrentTenant() tenantId: string) {
    return this.notificationsService.getInAppNotifications(tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(Role.PROFESSIONAL, Role.SYSTEM_ADMIN)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.notificationsService.markAsRead(id, tenantId);
  }
}
