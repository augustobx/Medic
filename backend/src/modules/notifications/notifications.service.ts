import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Meta WhatsApp Webhook Verification
   * When Meta sends a GET request to verify the webhook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.META_VERIFY_TOKEN || 'medicturn_webhook_verify_token';

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp webhook verified successfully');
      return challenge;
    }

    return null;
  }

  /**
   * Process incoming WhatsApp webhook events
   */
  async processWebhook(body: any) {
    this.logger.log('Received WhatsApp webhook:', JSON.stringify(body));

    // TODO: Process incoming messages when Meta credentials are configured
    // - Parse message type (text, button reply, etc.)
    // - Handle appointment confirmations via WhatsApp replies
    // - Update booking status based on patient responses

    return { status: 'received' };
  }

  /**
   * Send WhatsApp message via Meta Cloud API
   * Stub — will be implemented when credentials are available
   */
  async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneId = process.env.META_WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      this.logger.warn('WhatsApp credentials not configured. Message not sent.');
      this.logger.debug(`Would send to ${phoneNumber}: ${message}`);
      return false;
    }

    try {
      // TODO: Implement actual API call when credentials are available
      // const response = await fetch(
      //   `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       messaging_product: 'whatsapp',
      //       to: phoneNumber,
      //       type: 'text',
      //       text: { body: message },
      //     }),
      //   }
      // );

      this.logger.log(`WhatsApp message stub — to: ${phoneNumber}`);
      return false;
    } catch (error) {
      this.logger.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  /**
   * CRON: Send 24h reminders daily at 10:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDailyReminders() {
    this.logger.log('Running 24h reminder cron job...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

    const bookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: tomorrowStart, lte: tomorrowEnd },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      include: {
        patient: true,
        sessionType: true,
        tenant: true,
      },
    });

    this.logger.log(`Found ${bookings.length} bookings for tomorrow`);

    for (const booking of bookings) {
      if (!booking.patient || !booking.sessionType) continue;
      if (!booking.patient.phone) continue;

      const message = `Hola ${booking.patient.firstName}, te recordamos tu turno de ${booking.sessionType.name} mañana a las ${booking.startTime}hs con ${booking.tenant.name}. Si necesitás reprogramar, contactanos.`;

      const sent = await this.sendWhatsAppMessage(booking.patient.phone, message);

      // Log the notification
      await this.prisma.notification.create({
        data: {
          type: 'REMINDER_24H',
          channel: 'WHATSAPP',
          recipient: booking.patient.phone,
          message,
          status: sent ? 'sent' : 'pending',
          sentAt: sent ? new Date() : undefined,
          tenantId: booking.tenantId,
          bookingId: booking.id,
        },
      });
    }
  }

  // --- In-App Notifications ---
  async getInAppNotifications(tenantId: string) {
    return this.prisma.notification.findMany({
      where: { tenantId, type: 'CUSTOM' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(id: string, tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { id, tenantId },
      data: { status: 'read' },
    });
  }

  async createInAppNotification(tenantId: string, message: string, bookingId?: string) {
    return this.prisma.notification.create({
      data: {
        tenantId,
        type: 'CUSTOM',
        channel: 'WHATSAPP', // Not used for in-app but required by schema
        recipient: 'in-app',
        message,
        status: 'unread',
        bookingId,
      },
    });
  }
}
