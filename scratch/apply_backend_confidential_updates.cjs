const fs = require('fs');
const path = require('path');

const backendDir = 'c:/Users/Rax/Desktop/Delivery_app_site_backend';
const routesPath = path.join(backendDir, 'src/modules/admin/admin.routes.ts');
const ctrlPath = path.join(backendDir, 'src/modules/admin/admin-management.controller.ts');

// 1. Update admin.routes.ts
let routes = fs.readFileSync(routesPath, 'utf8');

if (!routes.includes('getAdminConfidentialBooking')) {
  routes = routes.replace(
    'listAdminConfidentialBookings,',
    'listAdminConfidentialBookings,\n  getAdminConfidentialBooking,'
  );

  routes = routes.replace(
    "adminRouter.get('/confidential/bookings', listAdminConfidentialBookings);",
    "adminRouter.get('/confidential/bookings', listAdminConfidentialBookings);\nadminRouter.get('/confidential/bookings/:id', getAdminConfidentialBooking);"
  );

  fs.writeFileSync(routesPath, routes, 'utf8');
  console.log('Updated admin.routes.ts successfully.');
} else {
  console.log('admin.routes.ts already has getAdminConfidentialBooking.');
}

// 2. Update admin-management.controller.ts
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

// A. Add getAdminConfidentialBooking if not present
if (!ctrl.includes('export const getAdminConfidentialBooking')) {
  const target = 'export const updateAdminConfidentialStatus: RequestHandler = async (req, res) => {';
  const getFnCode = `export const getAdminConfidentialBooking: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const booking = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
    },
  });

  if (!booking) {
    throw new AppError(404, 'Confidential courier booking not found.');
  }

  const pickupAddr = booking.addresses.find((a: any) => a.kind === 'PICKUP' || a.type === 'PICKUP') || booking.addresses[0];
  const dropoffAddr = booking.addresses.find((a: any) => a.kind === 'DROPOFF' || a.type === 'DROPOFF') || booking.addresses[1];

  const serialized = {
    ...booking,
    vaultId: booking.bookingNumber,
    declaredValue: booking.declaredValue ? Number(booking.declaredValue) : 0,
    distanceKm: booking.distanceKm ? Number(booking.distanceKm) : 0,
    baseCharge: Number(booking.baseCharge || 0),
    distanceCharge: Number(booking.distanceCharge || 0),
    securityCharge: Number(booking.securityCharge || 0),
    handoverCharge: Number(booking.handoverCharge || 0),
    originalsCharge: Number(booking.originalsCharge || 0),
    returnCharge: Number(booking.returnCharge || 0),
    taxAmount: Number(booking.taxAmount || 0),
    totalAmount: Number(booking.totalAmount || 0),
    pickup: pickupAddr,
    dropoff: dropoffAddr,
    pickupDetails: pickupAddr ? {
      name: pickupAddr.contactName,
      phone: \`\${pickupAddr.countryCode || '+91'} \${pickupAddr.phoneNumber}\`.trim(),
      address: [pickupAddr.addressLine1, pickupAddr.addressLine2, pickupAddr.landmark, \`\${pickupAddr.city}, \${pickupAddr.state} - \${pickupAddr.postalCode}\`, pickupAddr.country].filter(Boolean).join(', '),
      addressLine1: pickupAddr.addressLine1,
      addressLine2: pickupAddr.addressLine2,
      city: pickupAddr.city,
      state: pickupAddr.state,
      postalCode: pickupAddr.postalCode,
      landmark: pickupAddr.landmark,
      country: pickupAddr.country,
      latitude: pickupAddr.latitude ? Number(pickupAddr.latitude) : null,
      longitude: pickupAddr.longitude ? Number(pickupAddr.longitude) : null,
    } : null,
    deliveryDetails: dropoffAddr ? {
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
      latitude: dropoffAddr.latitude ? Number(dropoffAddr.latitude) : null,
      longitude: dropoffAddr.longitude ? Number(dropoffAddr.longitude) : null,
    } : null,
  };

  res.status(200).json({
    status: 'success',
    data: { booking: serialized },
  });
};\n\n`;

  ctrl = ctrl.replace(target, getFnCode + target);
  console.log('Added getAdminConfidentialBooking to admin-management.controller.ts');
}

// B. Update updateUnifiedOrderStatus order of checks
// Make sure confidential check is BEFORE courier check
const oldCourierBranch = `  } else if (serviceKey.includes('courier') || serviceKey.includes('personal')) {
    const existing = await prisma.courierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Courier booking not found.');

    let courierStatus: any = status;
    if (!['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(courierStatus)) {
      courierStatus = 'CONFIRMED';
    }

    updatedOrder = await prisma.courierBooking.update({
      where: { id: existing.id },
      data: {
        status: courierStatus,
        ...(courierStatus === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(courierStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });
  } else if (serviceKey.includes('confidential') || serviceKey.includes('luggage')) {
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
    });`;

const newConfidentialBranchFirst = `  } else if (serviceKey.includes('confidential') || serviceKey.includes('vault')) {
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
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal') || serviceKey.includes('luggage')) {
    const existing = await prisma.courierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Courier booking not found.');

    let courierStatus: any = status;
    if (!['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(courierStatus)) {
      courierStatus = 'CONFIRMED';
    }

    updatedOrder = await prisma.courierBooking.update({
      where: { id: existing.id },
      data: {
        status: courierStatus,
        ...(courierStatus === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(courierStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });`;

if (ctrl.includes(oldCourierBranch)) {
  ctrl = ctrl.replace(oldCourierBranch, newConfidentialBranchFirst);
  console.log('Reordered updateUnifiedOrderStatus checks successfully.');
}

// C. Update cancelUnifiedOrder checks
const oldCancelBranch = `  } else if (serviceKey.includes('courier') || serviceKey.includes('personal')) {
    const existing = await prisma.courierBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.courierBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  } else if (serviceKey.includes('confidential') || serviceKey.includes('luggage')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });`;

const newCancelBranch = `  } else if (serviceKey.includes('confidential') || serviceKey.includes('vault')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Confidential courier booking not found.');
    await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal') || serviceKey.includes('luggage')) {
    const existing = await prisma.courierBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.courierBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });`;

if (ctrl.includes(oldCancelBranch)) {
  ctrl = ctrl.replace(oldCancelBranch, newCancelBranch);
  console.log('Reordered cancelUnifiedOrder checks successfully.');
}

// D. Fix listAllUnifiedOrders for confidential:
const oldConfMap = `  confidentialOrders.forEach((o: any) => {
    const pickupAddr = o.addresses?.find((a: any) => a.type === 'PICKUP') || o.addresses?.[0];
    const dropoffAddr = o.addresses?.find((a: any) => a.type === 'DROPOFF') || o.addresses?.[1];

    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'confidential-courier',
      serviceName: 'Confidential Courier / Luggage',
      customerName: o.user?.fullName || pickupAddr?.contactName || 'Customer',
      customerPhone: o.user?.mobileNumber || pickupAddr?.phoneNumber || '',
      recipientName: dropoffAddr?.contactName || 'Authorized Recipient',
      destination: dropoffAddr ? \`\${dropoffAddr.city || ''} (\${o.securityLevel} Vault)\` : \`\${o.securityLevel} Security Vault\`,
      itemSummary: \`\${o.documentType} (\${o.envelopeSize})\`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: 'Armored Vault Courier',
      partnerPhone: '',
      createdAt: o.createdAt,
    });
  });`;

const newConfMap = `  confidentialOrders.forEach((o: any) => {
    const pickupAddr = o.addresses?.find((a: any) => a.kind === 'PICKUP' || a.type === 'PICKUP') || o.addresses?.[0];
    const dropoffAddr = o.addresses?.find((a: any) => a.kind === 'DROPOFF' || a.type === 'DROPOFF') || o.addresses?.[1];

    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      vaultId: o.bookingNumber,
      serviceKey: 'confidential-courier',
      serviceName: 'Delivez Vault (Confidential)',
      customerName: o.user?.fullName || pickupAddr?.contactName || 'Customer',
      customerPhone: o.user?.mobileNumber || pickupAddr?.phoneNumber || '',
      recipientName: dropoffAddr?.contactName || 'Authorized Recipient',
      destination: dropoffAddr ? \`\${dropoffAddr.city || ''} (\${o.securityLevel} Vault)\` : \`\${o.securityLevel} Security Vault\`,
      itemSummary: \`\${o.documentType || 'Document'} (\${o.envelopeSize || 'Secure Envelope'})\`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: 'Armored Vault Courier',
      partnerPhone: '',
      createdAt: o.createdAt,
      documentType: o.documentType,
      envelopeSize: o.envelopeSize,
      pageCount: o.pageCount,
      documentDescription: o.documentDescription,
      containsOriginals: o.containsOriginals,
      requiresReturn: o.requiresReturn,
      declaredValue: o.declaredValue ? Number(o.declaredValue) : 0,
      complianceAcceptedAt: o.complianceAcceptedAt,
      securityLevel: o.securityLevel,
      handoverMethod: o.handoverMethod,
      recipientIdRequired: o.recipientIdRequired,
      pickupProofRequired: o.pickupProofRequired,
      deliverySpeed: o.deliverySpeed,
      scheduleType: o.scheduleType,
      scheduledPickupAt: o.scheduledPickupAt,
      distanceKm: o.distanceKm ? Number(o.distanceKm) : null,
      baseCharge: Number(o.baseCharge || 0),
      distanceCharge: Number(o.distanceCharge || 0),
      securityCharge: Number(o.securityCharge || 0),
      handoverCharge: Number(o.handoverCharge || 0),
      originalsCharge: Number(o.originalsCharge || 0),
      returnCharge: Number(o.returnCharge || 0),
      taxAmount: Number(o.taxAmount || 0),
      totalAmount: Number(o.totalAmount || 0),
      paymentProvider: o.paymentProvider,
      paymentReference: o.paymentReference,
      confirmedAt: o.confirmedAt,
      cancelledAt: o.cancelledAt,
      cancellationReason: o.cancellationReason,
      addresses: o.addresses,
      user: o.user,
    });
  });`;

if (ctrl.includes(oldConfMap)) {
  ctrl = ctrl.replace(oldConfMap, newConfMap);
  console.log('Updated listAllUnifiedOrders for confidential orders.');
}

fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Updated admin-management.controller.ts successfully.');
