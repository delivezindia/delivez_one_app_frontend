const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../../../../Delivery_app_site_backend/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function main() {
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
  console.log('Available Prisma models:', models);

  const modelName = models.find(m => m.toLowerCase().includes('confidential'));
  console.log('Found model:', modelName);

  if (modelName) {
    const list = await prisma[modelName].findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { addresses: true, user: true, transactions: true }
    });
    console.log('\n--- CONFIDENTIAL BOOKINGS ---');
    console.log(JSON.stringify(list.map(b => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      documentCategory: b.documentCategory,
      envelopeSize: b.envelopeSize,
      pageCount: b.pageCount,
      containsOriginals: b.containsOriginals,
      requiresReturn: b.requiresReturn,
      declaredValue: b.declaredValue,
      baseCharge: b.baseCharge,
      distanceCharge: b.distanceCharge,
      securityCharge: b.securityCharge,
      handoverCharge: b.handoverCharge,
      originalsCharge: b.originalsCharge,
      returnCharge: b.returnCharge,
      taxAmount: b.taxAmount,
      totalAmount: b.totalAmount,
      status: b.status,
      paymentStatus: b.paymentStatus,
      addressesCount: b.addresses?.length,
      user: b.user ? { name: b.user.fullName, phone: b.user.mobileNumber } : null
    })), null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
