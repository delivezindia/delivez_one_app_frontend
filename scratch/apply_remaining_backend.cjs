const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../../Delivery_app_site_backend/src/modules/admin/admin-management.controller.ts');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add luggageOrders.forEach in listAllUnifiedOrders
const returnOrdersBlock = `  returnOrders.forEach((o: any) => {
    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'return-pickup',
      serviceName: 'Return & Exchange Pickup',
      customerName: o.user?.fullName || o.pickupContactName || 'Customer',
      customerPhone: o.user?.mobileNumber || o.pickupPhoneNumber || '',
      recipientName: o.destinationName || o.pickupStoreName || 'Vendor RMA',
      destination: o.pickupCity ? \`\${o.pickupCity} → \${o.returnCity || 'Vendor'}\` : o.pickupCity,
      itemSummary: \`\${o.itemCategory} (Qty: \${o.itemQuantity || 1})\`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: o.partnerName || 'Pickup Partner',
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

if (code.includes(returnOrdersBlock) && !code.includes('luggageOrders.forEach')) {
  code = code.replace(returnOrdersBlock, returnOrdersBlock + luggagePushBlock);
  console.log('1. Added luggageOrders.forEach to listAllUnifiedOrders.');
}

// 2. Fix cancelUnifiedOrder
const oldCancelBlock = `  } else if (serviceKey.includes('confidential') || serviceKey.includes('vault')) {
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

const newCancelBlock = `  } else if (serviceKey.includes('confidential') || serviceKey.includes('vault')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Confidential courier booking not found.');
    await prisma.vaultCourierBooking.updateMany({
      where: { bookingNumber: existing.bookingNumber },
      data: { status: 'cancelled', cancellationReason, cancelledAt: new Date() },
    });
    await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  } else if (serviceKey.includes('luggage') || serviceKey.includes('airport-luggage')) {
    const existing = await prisma.luggageDeliveryBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Luggage delivery booking not found.');
    await prisma.luggageDeliveryBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal')) {
    const existing = await prisma.courierBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.courierBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });`;

if (code.includes(oldCancelBlock)) {
  code = code.replace(oldCancelBlock, newCancelBlock);
  console.log('2. Fixed cancelUnifiedOrder for luggage & vault.');
}

// 3. Export CSV
const oldCsvTarget = `  const [gifts, couriers, confidentials, forgots, returns] = await Promise.all([
    prisma.giftDeliveryBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.courierBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.confidentialCourierBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.forgotSomethingBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.returnPickupBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
  ]);`;

const newCsvTarget = `  const [gifts, couriers, confidentials, forgots, returns, luggages] = await Promise.all([
    prisma.giftDeliveryBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.courierBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.confidentialCourierBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.forgotSomethingBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.returnPickupBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.luggageDeliveryBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
  ]);`;

if (code.includes(oldCsvTarget)) {
  code = code.replace(oldCsvTarget, newCsvTarget);
}

const oldCsvReturnLoop = `  returns.forEach((r: any) => {
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

const newCsvLuggageLoop = `  returns.forEach((r: any) => {
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

if (code.includes(oldCsvReturnLoop) && !code.includes('luggages.forEach')) {
  code = code.replace(oldCsvReturnLoop, newCsvLuggageLoop);
  console.log('3. Added luggage to exportOrdersCsv.');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('All remaining updates written.');
