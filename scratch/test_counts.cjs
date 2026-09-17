const { PrismaClient } = require('c:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

function resolveServiceType(b) {
  const desc = b.documentDescription || '';
  if (desc.includes('MultiPoint') || desc.includes('Multi-Office')) return 'Vault MultiPoint';
  if (desc.includes('Critical') || desc.includes('Armed')) return 'Vault Critical';
  if (desc.includes('Exchange')) return 'Vault Exchange';
  if (desc.includes('Return') || b.requiresReturn) return 'Vault Return';
  if (desc.includes('Hand Carry') || desc.includes('Luggage')) return 'Vault Hand Carry';
  if (desc.includes('Precise') || b.scheduleType === 'SCHEDULED') return 'Vault Precise';
  if (desc.includes('Direct')) return 'Vault Direct';
  if (desc.includes('Priority') || b.deliverySpeed === 'EXPRESS') return 'Vault Priority';
  return 'Vault Secure';
}

async function check() {
  const bookings = await prisma.confidentialCourierBooking.findMany({
    select: {
      bookingNumber: true,
      documentDescription: true,
      requiresReturn: true,
      scheduleType: true,
      deliverySpeed: true,
    }
  });

  const counts = {};
  bookings.forEach(b => {
    const s = resolveServiceType(b);
    counts[s] = (counts[s] || 0) + 1;
  });

  console.log('Resolved counts across 9 services:');
  console.log(counts);
  await prisma.$disconnect();
}
check();
