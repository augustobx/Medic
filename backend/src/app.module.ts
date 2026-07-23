import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { PatientsModule } from './modules/patients/patients.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { EhrModule } from './modules/ehr/ehr.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Cron jobs for reminders
    ScheduleModule.forRoot(),

    // Serve uploaded files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Core
    PrismaModule,

    // Feature modules
    AuthModule,
    TenantsModule,
    PatientsModule,
    BookingsModule,
    EhrModule,
    FinanceModule,
    NotificationsModule,
  ],
})
export class AppModule {}
