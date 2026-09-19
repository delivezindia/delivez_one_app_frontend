const { PrismaClient } = require('../../Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const luggageCount = await prisma.luggageDeliveryBooking.count();
  const confCount = await prisma.confidentialCourierBooking.count();
  const vaultCount = await prisma.vaultCourierBooking.count();
  const courierCount = await prisma.courierBooking.count();

  console.log('Database Counts:', {
    luggageCount,
    confCount,
    vaultCount,
    courierCount,
  });

  if (luggageCount > 0) {
    const latestLuggage = await prisma.luggageDeliveryBooking.findFirst({ orderBy: { createdAt: 'desc' } });
    console.log('Latest luggage:', latestLuggage.bookingNumber, latestLuggage.status, Number(latestLuggage.totalAmount));
  }
  if (confCount > 0) {
    const latestConf = await prisma.confidentialCourierBooking.findFirst({ orderBy: { createdAt: 'desc' } });
    console.log('Latest confidentialCourierBooking:', latestConf.bookingNumber, latestConf.status, Number(latestConf.totalAmount));
  }
  if (vaultCount > 0) {
    const latestVault = await prisma.vaultCourierBooking.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { pickup: true, delivery: true }
    });
    console.log('Latest vaultCourierBooking:', latestVault.bookingNumber, latestVault.status, Number(latestVault.totalAmount), latestVault.serviceType);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
