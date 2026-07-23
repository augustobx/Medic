import { PrismaClient, Role, DayOfWeek } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Insurance Providers ───────────────────────
  const osde = await prisma.insuranceProvider.create({
    data: { name: 'OSDE', code: 'OSDE' },
  });
  const swiss = await prisma.insuranceProvider.create({
    data: { name: 'Swiss Medical', code: 'SWISS' },
  });
  const galeno = await prisma.insuranceProvider.create({
    data: { name: 'Galeno', code: 'GALENO' },
  });
  const medicus = await prisma.insuranceProvider.create({
    data: { name: 'Medicus', code: 'MEDICUS' },
  });
  const omint = await prisma.insuranceProvider.create({
    data: { name: 'OMINT', code: 'OMINT' },
  });

  console.log('✅ Insurance providers created');

  // ─── Tenant (Professional) ─────────────────────
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Consultorio Lic. Martínez',
      slug: 'lic-martinez',
      specialty: 'psicopedagogia',
      phone: '+54 11 5555-0000',
      email: 'ana@consultorio.com',
      address: 'Av. Santa Fe 1234, CABA',
    },
  });

  console.log('✅ Tenant created:', tenant.name);

  // ─── Session Types ─────────────────────────────
  await prisma.sessionType.createMany({
    data: [
      { name: 'Primera Entrevista', durationMin: 60, price: 15000, color: '#8B5CF6', tenantId: tenant.id },
      { name: 'Evaluación', durationMin: 50, price: 12000, color: '#0EA5E9', tenantId: tenant.id },
      { name: 'Tratamiento', durationMin: 50, price: 10000, color: '#06B6D4', tenantId: tenant.id },
    ],
  });

  console.log('✅ Session types created');

  // ─── Availability ──────────────────────────────
  const weekdays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];
  for (const day of weekdays) {
    await prisma.availability.createMany({
      data: [
        { dayOfWeek: day, startTime: '09:00', endTime: '13:00', tenantId: tenant.id },
        { dayOfWeek: day, startTime: '14:00', endTime: '18:00', tenantId: tenant.id },
      ],
    });
  }

  console.log('✅ Availability created');

  // ─── Payment Config ────────────────────────────
  await prisma.paymentConfig.create({
    data: {
      tenantId: tenant.id,
      alias: 'consultorio.martinez.mp',
      cbu: '0000003100010000000123',
      bankName: 'Banco Galicia',
      holderName: 'Ana Martínez',
      policyText: 'Los turnos deben cancelarse con al menos 24 horas de anticipación.',
    },
  });

  console.log('✅ Payment config created');

  // ─── Tenant Insurances ─────────────────────────
  await prisma.tenantInsurance.createMany({
    data: [
      { tenantId: tenant.id, insuranceProviderId: osde.id, copayAmount: 3000 },
      { tenantId: tenant.id, insuranceProviderId: swiss.id, copayAmount: 3500 },
      { tenantId: tenant.id, insuranceProviderId: galeno.id, copayAmount: 2800 },
    ],
  });

  console.log('✅ Tenant insurances created');

  // ─── Professional User ─────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 12);

  await prisma.user.create({
    data: {
      email: 'ana@consultorio.com',
      passwordHash,
      firstName: 'Ana',
      lastName: 'Martínez',
      phone: '+54 11 5555-0000',
      role: Role.PROFESSIONAL,
      tenantId: tenant.id,
    },
  });

  console.log('✅ Professional user created (ana@consultorio.com / admin123)');

  // ─── System Admin ──────────────────────────────
  const adminHash = await bcrypt.hash('sysadmin123', 12);

  await prisma.user.create({
    data: {
      email: 'admin@medicturn.com',
      passwordHash: adminHash,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.SYSTEM_ADMIN,
    },
  });

  console.log('✅ System admin created (admin@medicturn.com / sysadmin123)');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
