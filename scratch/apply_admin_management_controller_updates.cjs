const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../../Delivery_app_site_backend/src/modules/admin/admin-management.controller.ts');
let code = fs.readFileSync(filePath, 'utf8');

// ============================================================================
// 1. UPDATE getUnifiedDashboardStats TO INCLUDE LUGGAGE
// ============================================================================
const oldStatsQuery = `    returnCount,
    returnTodayCount,
    returnActiveCount,
    returnRevenue,

    usersCount,
    driversCount,
  ] = await Promise.all([`;

const newStatsQuery = `    returnCount,
    returnTodayCount,
    returnActiveCount,
    returnRevenue,

    luggageCount,
    luggageTodayCount,
    luggageActiveCount,
    luggageRevenue,

    usersCount,
    driversCount,
  ] = await Promise.all([`;

const oldStatsPromises = `    prisma.returnPickupBooking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),

    prisma.user.count({ where: { role: 'USER' } }),`;

const newStatsPromises = `    prisma.returnPickupBooking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),

    prisma.luggageDeliveryBooking.count(),
    prisma.luggageDeliveryBooking.count({ where: { createdAt: { gte: today } } }),
    prisma.luggageDeliveryBooking.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
    prisma.luggageDeliveryBooking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),

    prisma.user.count({ where: { role: 'USER' } }),`;

const oldStatsTotals = `  const totalOrders = giftCount + courierCount + confidentialCount + forgotCount + returnCount;
  const todayOrders = giftTodayCount + courierTodayCount + confidentialTodayCount + forgotTodayCount + returnTodayCount;
  const activeDeliveries = giftActiveCount + courierActiveCount + confidentialActiveCount + forgotActiveCount + returnActiveCount;
  
  const totalRevenue = Math.round(
    Number(giftRevenue._sum.totalAmount || 0) +
    Number(courierRevenue._sum.totalAmount || 0) +
    Number(confidentialRevenue._sum.totalAmount || 0) +
    Number(forgotRevenue._sum.totalAmount || 0) +
    Number(returnRevenue._sum.totalAmount || 0)
  );`;

const newStatsTotals = `  const totalOrders = giftCount + courierCount + confidentialCount + forgotCount + returnCount + luggageCount;
  const todayOrders = giftTodayCount + courierTodayCount + confidentialTodayCount + forgotTodayCount + returnTodayCount + luggageTodayCount;
  const activeDeliveries = giftActiveCount + courierActiveCount + confidentialActiveCount + forgotActiveCount + returnActiveCount + luggageActiveCount;
  
  const totalRevenue = Math.round(
    Number(giftRevenue._sum.totalAmount || 0) +
    Number(courierRevenue._sum.totalAmount || 0) +
    Number(confidentialRevenue._sum.totalAmount || 0) +
    Number(forgotRevenue._sum.totalAmount || 0) +
    Number(returnRevenue._sum.totalAmount || 0) +
    Number(luggageRevenue._sum.totalAmount || 0)
  );`;

const oldBreakdown = `      breakdown: {
        giftDelivery: giftCount,
        personalCourier: courierCount,
        confidentialCourier: confidentialCount,
        forgotSomething: forgotCount,
        returnPickup: returnCount,
      },`;

const newBreakdown = `      breakdown: {
        giftDelivery: giftCount,
        personalCourier: courierCount,
        luggageDelivery: luggageCount,
        confidentialCourier: confidentialCount,
        forgotSomething: forgotCount,
        returnPickup: returnCount,
      },`;

if (code.includes(oldStatsQuery)) code = code.replace(oldStatsQuery, newStatsQuery);
if (code.includes(oldStatsPromises)) code = code.replace(oldStatsPromises, newStatsPromises);
if (code.includes(oldStatsTotals)) code = code.replace(oldStatsTotals, newStatsTotals);
if (code.includes(oldBreakdown)) code = code.replace(oldBreakdown, newBreakdown);
console.log('1. getUnifiedDashboardStats modified.');

// ============================================================================
// 2. UPDATE listAllUnifiedOrders TO INCLUDE LUGGAGE
// ============================================================================
const oldOrdersPromise = `  const [giftOrders, courierOrders, confidentialOrders, forgotOrders, returnOrders] = await Promise.all([`;
const newOrdersPromise = `  const [giftOrders, courierOrders, confidentialOrders, forgotOrders, returnOrders, luggageOrders] = await Promise.all([`;

const oldReturnOrderQuery = `    (serviceType === 'ALL' || serviceType === 'RETURN' || serviceType === 'return-pickup')
      ? prisma.returnPickupBooking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { fullName: true, mobileNumber: true, email: true } } },
        })
      : [],
  ]);`;

const newReturnOrderQuery = `    (serviceType === 'ALL' || serviceType === 'RETURN' || serviceType === 'return-pickup')
      ? prisma.returnPickupBooking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { fullName: true, mobileNumber: true, email: true } } },
        })
      : [],
    (serviceType === 'ALL' || serviceType === 'LUGGAGE' || serviceType === 'luggage-delivery' || serviceType === 'airport-luggage')
      ? prisma.luggageDeliveryBooking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { fullName: true, mobileNumber: true, email: true } } },
        })
      : [],
  ]);`;

if (code.includes(oldOrdersPromise)) code = code.replace(oldOrdersPromise, newOrdersPromise);
if (code.includes(oldReturnOrderQuery)) code = code.replace(oldReturnOrderQuery, newReturnOrderQuery);

// Add luggage push in unified array
const targetReturnPush = `  returnOrders.forEach((o: any) => {
    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'return-pickup',
      serviceName: 'Return & Exchange Pickup',
      customerName: o.user?.fullName || 'Customer',
      customerPhone: o.user?.mobileNumber || o.pickupPhone,
      recipientName: o.destinationName || 'E-Commerce Return Desk',
      destination: o.destinationAddress || 'Warehouse Return Center',
      itemSummary: \`\${o.itemCategory || 'Parcel'} - \${o.returnReason || 'Product Return'}\`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: o.partnerName || 'Unassigned',
      partnerPhone: o.partnerPhone || '',
      createdAt: o.createdAt,
    });
  });`;

const luggagePushBlock = `

  luggageOrders.forEach((o: any) => {
    const pickup = (o.pickupDetails as any) || {};
    const delivery = (o.deliveryDetails as any) || {};
    const flight = (o.flightDetails as any) || pickup.airport_specific || delivery.airport_specific || {};
    const items = Array.isArray(o.luggageItems) ? (o.luggageItems as any[]) : [];
    const bagCount = items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0) || 1;
    const dest = delivery.full_address || delivery.address || [delivery.city, delivery.state].filter(Boolean).join(', ') || 'Airport / Hotel Terminal';

    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'luggage-delivery',
      serviceName: 'Luggage Delivery',
      customerName: o.user?.fullName || pickup.contact?.full_name || 'Passenger',
      customerPhone: o.user?.mobileNumber || pickup.contact?.mobile || '—',
      recipientName: delivery.contact?.full_name || 'Recipient / Hotel Desk',
      destination: dest,
      itemSummary: \`\${bagCount} Luggage Bag\${bagCount > 1 ? 's' : ''}\${flight.flight_number ? \` • Flight \${flight.flight_number}\` : ''}\`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: (o.driverDetails as any)?.name || 'Unassigned',
      partnerPhone: (o.driverDetails as any)?.phone || '',
      createdAt: o.createdAt,
    });
  });`;

if (code.includes(targetReturnPush) && !code.includes('luggageOrders.forEach')) {
  code = code.replace(targetReturnPush, targetReturnPush + luggagePushBlock);
  console.log('2. listAllUnifiedOrders modified to include luggage.');
}

// ============================================================================
// 3. UPDATE universalTrackOrder TO RESOLVE LUGGAGE
// ============================================================================
const oldTrackPromises = `  const [gift, courier, confidential, forgot, ret] = await Promise.all([
    prisma.giftDeliveryBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.courierBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } }, addresses: true },
    }),
    prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } }, addresses: true },
    }),
    prisma.forgotSomethingBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.returnPickupBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
  ]);`;

const newTrackPromises = `  const [gift, courier, confidential, forgot, ret, luggage] = await Promise.all([
    prisma.giftDeliveryBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.courierBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } }, addresses: true },
    }),
    prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } }, addresses: true },
    }),
    prisma.forgotSomethingBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.returnPickupBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.luggageDeliveryBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true, email: true } } },
    }),
  ]);`;

if (code.includes(oldTrackPromises)) {
  code = code.replace(oldTrackPromises, newTrackPromises);
}

const luggageTrackResponse = `
  if (luggage) {
    const pickup = (luggage.pickupDetails as any) || {};
    const delivery = (luggage.deliveryDetails as any) || {};
    const flight = (luggage.flightDetails as any) || pickup.airport_specific || delivery.airport_specific || {};
    const hotel = (luggage.hotelDetails as any) || pickup.hotel_specific || delivery.hotel_specific || {};
    const items = Array.isArray(luggage.luggageItems) ? (luggage.luggageItems as any[]) : [];
    const bagCount = items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0) || 1;

    res.status(200).json({
      status: 'success',
      data: {
        serviceKey: 'luggage-delivery',
        serviceName: 'Luggage Delivery',
        bookingNumber: luggage.bookingNumber,
        status: luggage.status,
        customerName: luggage.user?.fullName || pickup.contact?.full_name || 'Passenger',
        recipientName: delivery.contact?.full_name || hotel.hotelName || 'Recipient / Hotel Front Desk',
        recipientPhone: delivery.contact?.mobile || '—',
        address: delivery.full_address || delivery.address || [delivery.city, delivery.state].filter(Boolean).join(', '),
        item: \`\${bagCount} Luggage Bag\${bagCount > 1 ? 's' : ''}\${flight.flight_number ? \` (Flight \${flight.flight_number})\` : ''}\`,
        amount: Number(luggage.totalAmount || 0),
        eta: (luggage.schedule as any)?.delivery_speed?.label || '3-4 Hours Transit',
        partnerName: (luggage.driverDetails as any)?.name || 'Designated Airport Luggage Agent',
        partnerPhone: (luggage.driverDetails as any)?.phone || '+91 98765 43210',
        progress: luggage.status === 'DELIVERED' ? 5 : (luggage.status === 'IN_TRANSIT' || luggage.status === 'OUT_FOR_DELIVERY') ? 4 : (luggage.status === 'LUGGAGE_PICKED') ? 3 : 2,
        steps: ['Booking Confirmed', 'Agent Assigned', 'Luggage Picked Up', 'In Transit', 'Delivered'],
        createdAt: luggage.createdAt,
        flightDetails: flight,
        hotelDetails: hotel,
        pickupDetails: pickup,
        deliveryDetails: delivery,
        milestones: luggage.milestones,
      },
    });
    return;
  }
`;

const trackRetCheck = `  if (ret) {`;
if (code.includes(trackRetCheck) && !code.includes('if (luggage) {')) {
  code = code.replace(trackRetCheck, luggageTrackResponse + '\n  if (ret) {');
  console.log('3. universalTrackOrder modified to resolve luggage.');
}

// ============================================================================
// 4. UPDATE serializeAdminConfidentialBooking, listAdminConfidentialBookings,
//    getAdminConfidentialBooking, updateAdminConfidentialStatus
// ============================================================================
// Inspect lines around serializeAdminConfidentialBooking
const oldSerializeConf = `const serializeAdminConfidentialBooking = (booking: any) => {`;
const newSerializeConf = `const serializeAdminConfidentialBooking = (booking: any, vault?: any) => {`;

if (code.includes(oldSerializeConf)) {
  code = code.replace(oldSerializeConf, newSerializeConf);
}

// Add rich vault fields inside serializeAdminConfidentialBooking return
const oldConfReturnEnd = `    deliveryDetails: dropoffAddr ? {
      name: dropoffAddr.contactName,
      phone: \`\${dropoffAddr.countryCode || '+91'} \${dropoffAddr.phoneNumber}\`.trim(),
      address: [dropoffAddr.addressLine1, dropoffAddr.addressLine2, dropoffAddr.landmark, \`\${dropoffAddr.city}, \${dropoffAddr.state} - \${dropoffAddr.postalCode}\`, dropoffAddr.country].filter(Boolean).join(', '),
      addressLine1: dropoffAddr.addressLine1,
      addressLine2: dropoffAddr.addressLine2,
      city: dropoffAddr.city,
      state: dropoffAddr.state,
      postalCode: dropoffAddr.postalCode,
      landmark: dropoffAddr.landmark,
      country: dropoffAddr.country,
      latitude: dropoffAddr.latitude != null ? Number(dropoffAddr.latitude) : null,
      longitude: dropoffAddr.longitude != null ? Number(dropoffAddr.longitude) : null,
    } : null,
  };
};`;

const newConfReturnEnd = `    deliveryDetails: dropoffAddr ? {
      name: dropoffAddr.contactName,
      phone: \`\${dropoffAddr.countryCode || '+91'} \${dropoffAddr.phoneNumber}\`.trim(),
      address: [dropoffAddr.addressLine1, dropoffAddr.addressLine2, dropoffAddr.landmark, \`\${dropoffAddr.city}, \${dropoffAddr.state} - \${dropoffAddr.postalCode}\`, dropoffAddr.country].filter(Boolean).join(', '),
      addressLine1: dropoffAddr.addressLine1,
      addressLine2: dropoffAddr.addressLine2,
      city: dropoffAddr.city,
      state: dropoffAddr.state,
      postalCode: dropoffAddr.postalCode,
      landmark: dropoffAddr.landmark,
      country: dropoffAddr.country,
      latitude: dropoffAddr.latitude != null ? Number(dropoffAddr.latitude) : null,
      longitude: dropoffAddr.longitude != null ? Number(dropoffAddr.longitude) : null,
    } : null,
    // Vault relations & rich canonical fields
    vault: vault || null,
    pickupType: vault?.pickup?.pickupType || 'Business',
    companyOrganization: vault?.pickup?.companyOrganization || vault?.delivery?.companyOrganization || null,
    gstin: vault?.pickup?.gstin || vault?.delivery?.gstin || null,
    specialInstructions: vault?.pickup?.specialInstructions || vault?.delivery?.specialInstructions || null,
    item: vault?.item ? {
      ...vault.item,
      declaredValue: vault.item.declaredValue != null ? Number(vault.item.declaredValue) : null,
    } : null,
    packaging: vault?.packaging || null,
    security: vault?.security || null,
    verification: vault?.verification || null,
    multipointStops: vault?.multipointStops || [],
    attachments: vault?.attachments || [],
    timings: vault?.timings || [],
    contacts: vault?.contacts || [],
    receipts: vault?.receipts || [],
    serviceDetails: vault?.serviceDetails || null,
  };
};`;

if (code.includes(oldConfReturnEnd)) {
  code = code.replace(oldConfReturnEnd, newConfReturnEnd);
  console.log('4. serializeAdminConfidentialBooking upgraded with vault relations.');
}

// In listAdminConfidentialBookings: hydrate vault bookings
const oldListConfMap = `  const bookings = rawBookings.map((b: any) => serializeAdminConfidentialBooking(b));`;
const newListConfMap = `  // Hydrate with matching VaultCourierBooking records for comprehensive dossier view
  const bookingNumbers = rawBookings.map((b: any) => b.bookingNumber).filter(Boolean);
  const vaultBookings = await prisma.vaultCourierBooking.findMany({
    where: { bookingNumber: { in: bookingNumbers } },
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
    },
  });
  const vaultMap = new Map(vaultBookings.map((v: any) => [v.bookingNumber, v]));

  const bookings = rawBookings.map((b: any) => serializeAdminConfidentialBooking(b, vaultMap.get(b.bookingNumber)));`;

if (code.includes(oldListConfMap)) {
  code = code.replace(oldListConfMap, newListConfMap);
  console.log('5. listAdminConfidentialBookings hydrated with vault bookings.');
}

// In getAdminConfidentialBooking: hydrate single vault booking
const oldGetConfReturn = `  res.status(200).json({
    status: 'success',
    data: { booking: serializeAdminConfidentialBooking(booking) },
  });`;

const newGetConfReturn = `  const vault = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: booking.bookingNumber }] },
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
    },
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeAdminConfidentialBooking(booking, vault) },
  });`;

if (code.includes(oldGetConfReturn)) {
  code = code.replace(oldGetConfReturn, newGetConfReturn);
  console.log('6. getAdminConfidentialBooking upgraded with vault relations.');
}

// In updateAdminConfidentialStatus: dual-model transaction
const oldUpdateConf = `export const updateAdminConfidentialStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status, cancellationReason } = req.body;

  const existing = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!existing) throw new AppError(404, 'Confidential courier booking not found.');

  const updated = await prisma.confidentialCourierBooking.update({
    where: { id: existing.id },
    data: {
      status: status as any,
      ...(status === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
      ...(status === 'CANCELLED' ? { cancelledAt: new Date(), cancellationReason: cancellationReason || 'Cancelled by Administrator' } : {}),
    },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: \`Status updated to \${status}\`,
    data: { booking: serializeAdminConfidentialBooking(updated) },
  });
};`;

const newUpdateConf = `export const updateAdminConfidentialStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status, cancellationReason } = req.body;

  const existing = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!existing) throw new AppError(404, 'Confidential courier booking not found.');

  // Normalize status across models
  const vaultStatusMap: Record<string, string> = {
    PAYMENT_PENDING: 'pending_payment',
    CONFIRMED: 'confirmed',
    PICKUP_ASSIGNED: 'assigned',
    PICKED_UP: 'in_transit',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };
  const vStatus = vaultStatusMap[status] || status.toLowerCase();

  const [updated] = await prisma.$transaction([
    prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: {
        status: status as any,
        ...(status === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(status === 'CANCELLED' ? { cancelledAt: new Date(), cancellationReason: cancellationReason || 'Cancelled by Administrator' } : {}),
      },
      include: {
        user: { select: publicUserSelect },
        addresses: true,
      },
    }),
    prisma.vaultCourierBooking.updateMany({
      where: { bookingNumber: existing.bookingNumber },
      data: {
        status: vStatus,
        ...(status === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(status === 'CANCELLED' ? { cancelledAt: new Date(), cancellationReason: cancellationReason || 'Cancelled by Administrator' } : {}),
      },
    }),
  ]);

  const vault = await prisma.vaultCourierBooking.findFirst({
    where: { bookingNumber: existing.bookingNumber },
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
    },
  });

  res.status(200).json({
    status: 'success',
    message: \`Status updated to \${status}\`,
    data: { booking: serializeAdminConfidentialBooking(updated, vault) },
  });
};`;

if (code.includes(oldUpdateConf)) {
  code = code.replace(oldUpdateConf, newUpdateConf);
  console.log('7. updateAdminConfidentialStatus upgraded with dual-model transaction.');
}

// ============================================================================
// 5. IMPLEMENT DEDICATED LUGGAGE HANDLERS
// ============================================================================
const luggageHandlersBlock = `
// ============================================================================
// 7.5. LUGGAGE DELIVERY (AIRPORT & HOTEL TRANSIT)
// ============================================================================
export const serializeAdminLuggageBooking = (b: any) => {
  const pickup = (b.pickupDetails as any) || {};
  const delivery = (b.deliveryDetails as any) || {};
  const flight = (b.flightDetails as any) || pickup.airport_specific || delivery.airport_specific || {};
  const hotel = (b.hotelDetails as any) || pickup.hotel_specific || delivery.hotel_specific || {};
  const items = Array.isArray(b.luggageItems) ? (b.luggageItems as any[]) : [];
  const totalBags = items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0);
  const totalWeight = items.reduce((acc: number, it: any) => acc + (Number(it.declared_weight_kg || it.weight || 0) * (Number(it.quantity) || 1)), 0);

  const serviceId = b.serviceId || 'home_airport';
  const routeMap: Record<string, string> = {
    home_airport: 'Home to Airport',
    airport_home: 'Airport to Home',
    hotel_airport: 'Hotel to Airport',
    airport_hotel: 'Airport to Hotel',
    hotel_home: 'Hotel to Home',
    home_hotel: 'Home to Hotel',
    multi_stop: 'Multi-Stop Transit',
  };
  const routeTitle = routeMap[serviceId] || serviceId.replace(/_/g, ' ').replace(/\\b\\w/g, (c: string) => c.toUpperCase());

  return {
    ...b,
    totalAmount: Number(b.totalAmount || 0),
    serviceKey: 'luggage-delivery',
    serviceName: 'Luggage Delivery',
    serviceType: routeTitle,
    routeTitle,
    customerName: b.user?.fullName || pickup.contact?.full_name || 'Passenger',
    customerPhone: b.user?.mobileNumber || pickup.contact?.mobile || '—',
    customerEmail: b.user?.email || pickup.contact?.email || '—',
    totalBags: totalBags || 1,
    totalWeightKg: totalWeight || 15,
    pickupAddress: pickup.full_address || pickup.address || [pickup.city, pickup.state].filter(Boolean).join(', '),
    deliveryAddress: delivery.full_address || delivery.address || [delivery.city, delivery.state].filter(Boolean).join(', '),
    terminal: flight.terminal || pickup.terminal || delivery.terminal || null,
    luggageBelt: flight.belt_number || flight.luggageBelt || pickup.luggageBelt || delivery.luggageBelt || null,
    flightNumber: flight.flight_number || flight.flightNumber || null,
    pnr: flight.pnr || null,
    airline: flight.airline_name || flight.airline || null,
    hotelName: hotel.hotel_name || hotel.hotelName || null,
    roomNumber: hotel.room_number || hotel.roomNumber || null,
    guestName: hotel.guest_name || hotel.guestName || null,
    bookingReference: hotel.booking_reference || hotel.bookingReference || null,
    addresses: [
      {
        kind: 'PICKUP',
        label: 'Pickup',
        contactName: pickup.contact?.full_name || b.user?.fullName || 'Sender',
        phoneNumber: pickup.contact?.mobile || b.user?.mobileNumber || '',
        addressLine1: pickup.full_address || pickup.address || '',
        city: pickup.city || '',
        state: pickup.state || '',
        postalCode: pickup.pincode || '',
      },
      {
        kind: 'DROPOFF',
        label: 'Delivery',
        contactName: delivery.contact?.full_name || 'Recipient',
        phoneNumber: delivery.contact?.mobile || '',
        addressLine1: delivery.full_address || delivery.address || '',
        city: delivery.city || '',
        state: delivery.state || '',
        postalCode: delivery.pincode || '',
      },
    ],
  };
};

export const listAdminLuggageBookings: RequestHandler = async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';
  const routeType = typeof req.query.routeType === 'string' ? req.query.routeType.trim() : 'ALL';

  const where: Prisma.LuggageDeliveryBookingWhereInput = {};
  if (status !== 'ALL') where.status = status;
  if (routeType !== 'ALL') {
    where.OR = [
      { serviceId: { contains: routeType, mode: 'insensitive' } },
      { routeType: { contains: routeType, mode: 'insensitive' } },
    ];
  }
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { mobileNumber: { contains: search } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { serviceId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, rawBookings, statusGroups] = await Promise.all([
    prisma.luggageDeliveryBooking.count({ where }),
    prisma.luggageDeliveryBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: publicUserSelect },
      },
    }),
    prisma.luggageDeliveryBooking.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  const bookings = rawBookings.map((b: any) => serializeAdminLuggageBooking(b));

  const statusCounts: Record<string, number> = {
    ALL: total,
    BOOKING_CONFIRMED: 0,
    AGENT_ASSIGNED: 0,
    PICKUP_IN_PROGRESS: 0,
    LUGGAGE_PICKED: 0,
    IN_TRANSIT: 0,
    OUT_FOR_DELIVERY: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  statusGroups.forEach((g: any) => {
    if (statusCounts[g.status] !== undefined) {
      statusCounts[g.status] = g._count._all;
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      statusCounts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    },
  });
};

export const getAdminLuggageBooking: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: {
      user: { select: publicUserSelect },
    },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery booking not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { booking: serializeAdminLuggageBooking(booking) },
  });
};

export const updateAdminLuggageStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status, cancellationReason, notes } = req.body;

  const existing = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!existing) throw new AppError(404, 'Luggage delivery booking not found.');

  const milestoneMap: Record<string, number> = {
    BOOKING_CONFIRMED: 0,
    AGENT_ASSIGNED: 1,
    PICKUP_IN_PROGRESS: 2,
    LUGGAGE_PICKED: 4,
    IN_TRANSIT: 5,
    OUT_FOR_DELIVERY: 6,
    DELIVERED: 9,
    CANCELLED: existing.currentMilestoneIndex,
  };

  const nextMilestoneIndex = milestoneMap[status] !== undefined ? milestoneMap[status] : existing.currentMilestoneIndex;

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: existing.id },
    data: {
      status,
      currentMilestoneIndex: nextMilestoneIndex,
      ...(status === 'DELIVERED' ? { paymentStatus: 'PAID' } : {}),
      ...(status === 'CANCELLED' ? {
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || notes || 'Cancelled by Administrator',
      } : {}),
    },
    include: {
      user: { select: publicUserSelect },
    },
  });

  res.status(200).json({
    status: 'success',
    message: \`Luggage status updated to \${status}\`,
    data: { booking: serializeAdminLuggageBooking(updated) },
  });
};
`;

const returnStatusHandlerTarget = `export const updateAdminReturnStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const existing = await prisma.returnPickupBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!existing) throw new AppError(404, 'Return pickup booking not found.');

  const updated = await prisma.returnPickupBooking.update({
    where: { id: existing.id },
    data: { status: status as any },
  });

  res.status(200).json({
    status: 'success',
    message: \`Status updated to \${status}\`,
    data: { booking: updated },
  });
};`;

if (code.includes(returnStatusHandlerTarget) && !code.includes('listAdminLuggageBookings')) {
  code = code.replace(returnStatusHandlerTarget, returnStatusHandlerTarget + luggageHandlersBlock);
  console.log('8. Luggage handlers inserted.');
}

// ============================================================================
// 6. UPDATE updateUnifiedOrderStatus TO ROUTE LUGGAGE & SYNC VAULT
// ============================================================================
const oldUpdateUnifiedConf = `  } else if (serviceKey.includes('confidential') || serviceKey.includes('vault')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Confidential courier booking not found.');

    let confStatus: any = status;
    if (!['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(confStatus)) {
      confStatus = 'CONFIRMED';
    }

    updatedOrder = await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: {
        status: confStatus,
        ...(confStatus === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(confStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal') || serviceKey.includes('luggage')) {`;

const newUpdateUnifiedConf = `  } else if (serviceKey.includes('confidential') || serviceKey.includes('vault')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Confidential courier booking not found.');

    let confStatus: any = status;
    if (!['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(confStatus)) {
      confStatus = 'CONFIRMED';
    }

    const vaultStatusMap: Record<string, string> = {
      PAYMENT_PENDING: 'pending_payment',
      CONFIRMED: 'confirmed',
      PICKUP_ASSIGNED: 'assigned',
      PICKED_UP: 'in_transit',
      IN_TRANSIT: 'in_transit',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
    };
    const vStatus = vaultStatusMap[confStatus] || confStatus.toLowerCase();

    await prisma.vaultCourierBooking.updateMany({
      where: { bookingNumber: existing.bookingNumber },
      data: {
        status: vStatus,
        ...(confStatus === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(confStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });

    updatedOrder = await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: {
        status: confStatus,
        ...(confStatus === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(confStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });
  } else if (serviceKey.includes('luggage') || serviceKey.includes('airport-luggage')) {
    const existing = await prisma.luggageDeliveryBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Luggage delivery booking not found.');

    const milestoneMap: Record<string, number> = {
      BOOKING_CONFIRMED: 0,
      AGENT_ASSIGNED: 1,
      PICKUP_IN_PROGRESS: 2,
      LUGGAGE_PICKED: 4,
      IN_TRANSIT: 5,
      OUT_FOR_DELIVERY: 6,
      DELIVERED: 9,
      CANCELLED: existing.currentMilestoneIndex,
    };
    const nextIdx = milestoneMap[status] !== undefined ? milestoneMap[status] : existing.currentMilestoneIndex;

    updatedOrder = await prisma.luggageDeliveryBooking.update({
      where: { id: existing.id },
      data: {
        status,
        currentMilestoneIndex: nextIdx,
        ...(status === 'DELIVERED' ? { paymentStatus: 'PAID' } : {}),
        ...(status === 'CANCELLED' ? { cancelledAt: new Date(), cancellationReason: 'Cancelled via Unified Operations' } : {}),
      },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal')) {`;

if (code.includes(oldUpdateUnifiedConf)) {
  code = code.replace(oldUpdateUnifiedConf, newUpdateUnifiedConf);
  console.log('9. updateUnifiedOrderStatus modified for luggage & vault.');
}

// ============================================================================
// 7. UPDATE cancelUnifiedOrder TO ROUTE LUGGAGE & SYNC VAULT
// ============================================================================
const oldCancelConf = `  } else if (serviceKey.includes('confidential')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Confidential courier booking not found.');

    updated = await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal') || serviceKey.includes('luggage')) {`;

const newCancelConf = `  } else if (serviceKey.includes('confidential') || serviceKey.includes('vault')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Confidential courier booking not found.');

    await prisma.vaultCourierBooking.updateMany({
      where: { bookingNumber: existing.bookingNumber },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    updated = await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });
  } else if (serviceKey.includes('luggage') || serviceKey.includes('airport-luggage')) {
    const existing = await prisma.luggageDeliveryBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Luggage delivery booking not found.');

    updated = await prisma.luggageDeliveryBooking.update({
      where: { id: existing.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal')) {`;

if (code.includes(oldCancelConf)) {
  code = code.replace(oldCancelConf, newCancelConf);
  console.log('10. cancelUnifiedOrder modified for luggage & vault.');
}

// ============================================================================
// 8. UPDATE exportOrdersCsv TO INCLUDE LUGGAGE
// ============================================================================
const oldCsvPromise = `  const [gifts, couriers, confidentials, forgots, returns] = await Promise.all([`;
const newCsvPromise = `  const [gifts, couriers, confidentials, forgots, returns, luggages] = await Promise.all([`;

const oldCsvReturnQuery = `    prisma.returnPickupBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
  ]);`;

const newCsvReturnQuery = `    prisma.returnPickupBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.luggageDeliveryBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
  ]);`;

if (code.includes(oldCsvPromise)) code = code.replace(oldCsvPromise, newCsvPromise);
if (code.includes(oldCsvReturnQuery)) code = code.replace(oldCsvReturnQuery, newCsvReturnQuery);

const oldCsvReturnPush = `  returns.forEach((r: any) => {
    rows.push([
      r.bookingNumber,
      'Return Pickup',
      r.status,
      r.user?.fullName || 'Customer',
      r.user?.mobileNumber || r.pickupPhone || '',
      r.totalAmount || 0,
      r.createdAt ? new Date(r.createdAt).toISOString() : '',
    ]);
  });`;

const newCsvLuggagePush = `  returns.forEach((r: any) => {
    rows.push([
      r.bookingNumber,
      'Return Pickup',
      r.status,
      r.user?.fullName || 'Customer',
      r.user?.mobileNumber || r.pickupPhone || '',
      r.totalAmount || 0,
      r.createdAt ? new Date(r.createdAt).toISOString() : '',
    ]);
  });

  luggages.forEach((l: any) => {
    rows.push([
      l.bookingNumber,
      'Luggage Delivery',
      l.status,
      l.user?.fullName || (l.pickupDetails as any)?.contact?.full_name || 'Passenger',
      l.user?.mobileNumber || (l.pickupDetails as any)?.contact?.mobile || '',
      Number(l.totalAmount || 0),
      l.createdAt ? new Date(l.createdAt).toISOString() : '',
    ]);
  });`;

if (code.includes(oldCsvReturnPush) && !code.includes('luggages.forEach')) {
  code = code.replace(oldCsvReturnPush, newCsvLuggagePush);
  console.log('11. exportOrdersCsv modified to include luggage.');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved updated admin-management.controller.ts successfully!');
