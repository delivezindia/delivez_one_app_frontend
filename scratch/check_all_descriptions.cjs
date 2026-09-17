const { PrismaClient } = require('c:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const bookings = await prisma.confidentialCourierBooking.findMany({
    select: {
      bookingNumber: true,
      serviceId: true,
      service: { select: { id: true, name: true, slug: true } },
      documentDescription: true,
      deliverySpeed: true,
      scheduleType: true,
      securityLevel: true,
      handoverMethod: true,
      requiresReturn: true,
    }
  });
  console.log('Bookings summary:');
  bookings.forEach(b => {
    console.log(`${b.bookingNumber}: service="${b.service?.name}" desc="${b.documentDescription}" speed="${b.deliverySpeed}" schedule="${b.scheduleType}" return=${b.requiresReturn}`);
  });
  await prisma.$disconnect();
}
check();
