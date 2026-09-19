const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../../Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function inspectFullDetails() {
  const luggage = await prisma.luggageDeliveryBooking.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, fullName: true, mobileNumber: true, email: true } } }
  });

  const vault = await prisma.confidentialCourierBooking.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, fullName: true, mobileNumber: true, email: true } },
      addresses: true,
    }
  });

  const vaultRelations = await prisma.vaultCourierBooking.findFirst({
    where: { bookingNumber: vault.bookingNumber },
    include: {
      pickup: true,
      delivery: true,
      contacts: true,
      timings: true,
      item: true,
      attachments: true,
      packaging: true,
      security: true,
      verification: true,
      serviceDetails: true,
      multipointStops: { orderBy: { stopNumber: 'asc' } },
      payments: true,
      receipts: true,
    }
  });

  console.log('Luggage Keys:', Object.keys(luggage));
  console.log('Luggage flightDetails:', luggage.flightDetails);
  console.log('Luggage hotelDetails:', luggage.hotelDetails);
  console.log('Luggage luggageItems:', luggage.luggageItems);
  console.log('Luggage pricingBreakdown:', luggage.pricingBreakdown);
  console.log('Luggage milestones length:', Array.isArray(luggage.milestones) ? luggage.milestones.length : 'none');

  console.log('\nVault Relations available:');
  console.log('pickup:', Boolean(vaultRelations?.pickup), vaultRelations?.pickup?.completePickupAddress);
  console.log('delivery:', Boolean(vaultRelations?.delivery), vaultRelations?.delivery?.completeDeliveryAddress);
  console.log('item:', vaultRelations?.item?.itemNameDescription, vaultRelations?.item?.weightActual);
  console.log('packaging:', vaultRelations?.packaging?.selectedPackage);
  console.log('security:', vaultRelations?.security?.selectedSecurityLevel, 'armed:', vaultRelations?.security?.armedEscort);
  console.log('verification:', vaultRelations?.verification?.selectedVerification);
  console.log('multipointStops:', vaultRelations?.multipointStops?.length);
}

inspectFullDetails().catch(console.error).finally(() => prisma.$disconnect());
