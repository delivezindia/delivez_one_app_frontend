const { PrismaClient } = require('C:\\Users\\Rax\\Desktop\\Delivery_app_site_backend\\node_modules\\@prisma\\client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:1234@localhost:5432/delivery_app_backend?schema=public'
    }
  }
});

async function seed() {
  console.log('Seeding APK booking DLVZ2505128947 into PostgreSQL...');

  // Find any existing user or create customer user
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        mobileNumber: '9876543210',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
        role: 'CUSTOMER',
      }
    });
  }

  // Find personal-courier service
  const service = await prisma.service.findFirst({
    where: { slug: 'personal-courier' }
  });

  const bNumber = 'DLVZ2505128947';

  const meta = {
    bookingNumber: bNumber,
    status: 'IN_TRANSIT',
    serviceType: 'AIRPORT_TO_HOTEL',
    pickupDetails: {
      terminal: 'Terminal 3',
      flightNumber: 'AI 102',
      pnr: 'AB12CD',
      luggageBelt: '04',
      pickupOption: 'luggage_belt',
      flightArrivalDate: '10 May 2025',
      timeSlot: '09:00 AM - 11:00 AM',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      address: 'Indira Gandhi International Airport, Terminal 3',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110037',
    },
    deliveryDetails: {
      hotelName: 'Taj City Centre',
      roomNumber: '402',
      guestName: 'Rahul Sharma',
      deliveryOption: 'hotel_reception',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      address: 'Taj City Centre, Sector 44',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122004',
    },
    luggage: [
      { id: 1, type: 'Check-in Bag', size: 'Large', weight: 15, tag: 'AI-48291' },
      { id: 2, type: 'Cabin Bag', size: 'Medium', weight: 13, tag: 'AI-48292' },
    ],
    totalBags: 2,
    totalWeightKg: 28,
    addons: ['AIRPORT_ASSIST', 'SEAL_WRAP', 'SANITISED_VAN'],
    luggageProtection: ['THEFT_COVER', 'DAMAGE_COVER'],
    airportAssistance: ['BELT_PICKUP', 'PORTER_HELP'],
    schedule: {
      pickupDate: '10 May 2025',
      pickupSlot: '10:00 AM - 12:00 PM',
      deliverySpeed: 'EXPRESS',
      estimatedDelivery: '12 May 2025 by 06:00 PM',
    },
    fareBreakdown: {
      baseCharge: 1200,
      distanceCharge: 360,
      luggageCharge: 160,
      airportCharge: 150,
      addonsCharge: 250,
      deliverySpeedCharge: 100,
      gst: 370.8,
      discount: 235,
      totalAmount: 2395.8,
      promoCode: 'DELIVEZ10',
    },
    sealNumber: 'DLV-SEAL-88492',
    agent: {
      name: 'Ravi Kumar',
      id: 'DLZAGT45521',
      phone: '+91 98765 43210',
      vehicle: 'DL 1Z 4589',
      rating: '4.9',
      completedTrips: '1,420+',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    pod: {
      otp: '5487',
      deliveredTo: 'Taj City Centre Hotel Front Desk',
      receivedBy: 'Taj Front Desk - Amit Verma',
      relationship: 'Hotel Reception Desk',
      contactNumber: '+91 98111 22334',
      signatureUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=400&q=80',
      photoUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=600&q=80',
      sealPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
      sealNumber: 'DLV-SEAL-88492',
      deliveredAt: '12 May 2025, 05:45 PM',
      notes: 'Luggage received intact with tamper-evident seal unbroken. Front desk verified guest name Rahul Sharma, Room 402.',
    },
  };

  const existing = await prisma.courierBooking.findUnique({
    where: { bookingNumber: bNumber },
    include: { addresses: true, package: true }
  });

  if (existing) {
    console.log('Updating existing booking', bNumber);
    await prisma.courierBooking.update({
      where: { id: existing.id },
      data: {
        status: 'IN_TRANSIT',
        totalAmount: 2395.8,
      }
    });
    if (existing.package) {
      await prisma.courierBookingPackage.update({
        where: { id: existing.package.id },
        data: {
          actualWeightKg: 28,
          chargeableWeightKg: 28,
          contentDescription: JSON.stringify(meta),
        }
      });
    }
  } else {
    console.log('Creating new booking', bNumber);
    await prisma.courierBooking.create({
      data: {
        bookingNumber: bNumber,
        userId: user.id,
        serviceId: service ? service.id : null,
        idempotencyKey: 'seed-' + Date.now(),
        requestFingerprint: 'seed-fp',
        status: 'IN_TRANSIT',
        serviceType: 'SURFACE_EXPRESS',
        pickupScheduleType: 'SCHEDULED',
        scheduledPickupAt: new Date('2025-05-10T10:00:00Z'),
        distanceKm: 32.5,
        pricingVersion: 'v1.0.0',
        currency: 'INR',
        baseCharge: 1200,
        distanceCharge: 360,
        weightCharge: 160,
        packagingCharge: 250,
        insurancePremium: 150,
        taxAmount: 370.8,
        totalAmount: 2395.8,
        paymentMethod: 'ONLINE',
        paymentStatus: 'PAID',
        confirmedAt: new Date('2025-05-10T09:30:00Z'),
        addresses: {
          create: [
            {
              kind: 'PICKUP',
              label: 'Airport Terminal 3',
              contactName: 'Rahul Sharma',
              phoneNumber: '+91 98765 43210',
              addressLine1: 'Indira Gandhi International Airport, Terminal 3',
              city: 'New Delhi',
              state: 'Delhi',
              postalCode: '110037',
              country: 'India',
              latitude: 28.5562,
              longitude: 77.1000,
            },
            {
              kind: 'DROPOFF',
              label: 'Taj City Centre Hotel',
              contactName: 'Rahul Sharma',
              phoneNumber: '+91 98765 43210',
              addressLine1: 'Taj City Centre, Sector 44',
              city: 'Gurugram',
              state: 'Haryana',
              postalCode: '122004',
              country: 'India',
              latitude: 28.4682,
              longitude: 77.0654,
            },
          ]
        },
        package: {
          create: {
            actualWeightKg: 28,
            chargeableWeightKg: 28,
            lengthCm: 55,
            widthCm: 35,
            heightCm: 25,
            parcelSize: 'LARGE',
            packagingType: 'STANDARD',
            contentCategory: 'HOUSEHOLD_ITEMS',
            insuranceType: 'FULL',
            contentDescription: JSON.stringify(meta),
          }
        }
      }
    });
  }

  console.log('Seed completed successfully for DLVZ2505128947!');
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
