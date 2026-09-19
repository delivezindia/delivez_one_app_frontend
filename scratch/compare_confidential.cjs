const { PrismaClient } = require('../../Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const vaultBookings = await prisma.vaultCourierBooking.findMany({
    select: { bookingNumber: true, serviceType: true, status: true, totalAmount: true }
  });
  const confBookings = await prisma.confidentialCourierBooking.findMany({
    select: { bookingNumber: true, status: true, totalAmount: true }
  });

  const vaultSet = new Set(vaultBookings.map(v => v.bookingNumber));
  const confSet = new Set(confBookings.map(c => c.bookingNumber));

  const onlyVault = vaultBookings.filter(v => !confSet.has(v.bookingNumber));
  const onlyConf = confBookings.filter(c => !vaultSet.has(c.bookingNumber));

  console.log('Total Vault:', vaultBookings.length);
  console.log('Total Conf:', confBookings.length);
  console.log('Only in Vault:', onlyVault.length, onlyVault.map(v => v.bookingNumber).slice(0, 5));
  console.log('Only in Conf:', onlyConf.length, onlyConf.map(c => c.bookingNumber).slice(0, 5));
}

check().catch(console.error).finally(() => prisma.$disconnect());
