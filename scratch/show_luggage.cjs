const { PrismaClient } = require('../../Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function showLuggage() {
  const list = await prisma.luggageDeliveryBooking.findMany({
    take: 2,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, fullName: true, mobileNumber: true, email: true } } }
  });
  console.log(JSON.stringify(list, null, 2));
}

showLuggage().catch(console.error).finally(() => prisma.$disconnect());
