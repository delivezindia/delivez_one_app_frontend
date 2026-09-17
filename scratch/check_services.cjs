const { PrismaClient } = require('c:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const services = await prisma.service.findMany();
  console.log('Services in DB:', JSON.stringify(services, null, 2));
  
  // Also check confidential courier bookings serviceId and documentDescription
  const bookings = await prisma.confidentialCourierBooking.findMany({
    take: 10,
    select: {
      id: true,
      bookingNumber: true,
      serviceId: true,
      service: true,
      deliverySpeed: true,
      scheduleType: true,
      securityLevel: true,
      handoverMethod: true,
      documentDescription: true,
    }
  });
  console.log('Sample bookings with service:', JSON.stringify(bookings, null, 2));
  await prisma.$disconnect();
}
check();
