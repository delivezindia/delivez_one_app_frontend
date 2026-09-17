const { PrismaClient } = require('../Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.confidentialCourierBooking.count();
  console.log('Confidential bookings count:', count);
  const sample = await prisma.confidentialCourierBooking.findFirst({
    include: { addresses: true, user: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log('Sample booking:', JSON.stringify(sample, null, 2));
  await prisma.$disconnect();
}
check();
