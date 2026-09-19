const fs = require('fs');
const path = require('path');

const backendDir = path.resolve(__dirname, '../../Delivery_app_site_backend');
const adminControllerPath = path.join(backendDir, 'src/modules/admin/admin-management.controller.ts');
const adminRoutesPath = path.join(backendDir, 'src/modules/admin/admin.routes.ts');
const adminUserCtrlPath = path.join(backendDir, 'src/modules/admin/admin.controller.ts');

console.log('Reading backend files...');
let ctrlCode = fs.readFileSync(adminControllerPath, 'utf8');
let routesCode = fs.readFileSync(adminRoutesPath, 'utf8');
let userCtrlCode = fs.readFileSync(adminUserCtrlPath, 'utf8');

// 1. UPDATE admin.routes.ts
if (!routesCode.includes('listAdminLuggageBookings')) {
  routesCode = routesCode.replace(
    `  listAdminConfidentialBookings,\n  getAdminConfidentialBooking,\n  updateAdminConfidentialStatus,`,
    `  listAdminLuggageBookings,\n  getAdminLuggageBooking,\n  updateAdminLuggageStatus,\n  listAdminConfidentialBookings,\n  getAdminConfidentialBooking,\n  updateAdminConfidentialStatus,`
  );

  routesCode = routesCode.replace(
    `adminRouter.get('/confidential/bookings', listAdminConfidentialBookings);`,
    `adminRouter.get('/luggage/bookings', listAdminLuggageBookings);\nadminRouter.get('/luggage/bookings/:id', getAdminLuggageBooking);\nadminRouter.patch('/luggage/bookings/:id/status', updateAdminLuggageStatus);\n\nadminRouter.get('/confidential/bookings', listAdminConfidentialBookings);`
  );

  fs.writeFileSync(adminRoutesPath, routesCode, 'utf8');
  console.log('Updated admin.routes.ts successfully.');
} else {
  console.log('admin.routes.ts already has listAdminLuggageBookings.');
}

// 2. UPDATE admin.controller.ts (getUserDetails)
if (!userCtrlCode.includes('luggageDeliveryBookings:')) {
  userCtrlCode = userCtrlCode.replace(
    `      giftDeliveryBookings: {\n        take: 10,\n        orderBy: { createdAt: 'desc' },\n        select: { id: true, bookingNumber: true, status: true, totalAmount: true, productName: true, recipientName: true, deliveryCity: true, createdAt: true },\n      },`,
    `      giftDeliveryBookings: {\n        take: 10,\n        orderBy: { createdAt: 'desc' },\n        select: { id: true, bookingNumber: true, status: true, totalAmount: true, productName: true, recipientName: true, deliveryCity: true, createdAt: true },\n      },\n      luggageDeliveryBookings: {\n        take: 10,\n        orderBy: { createdAt: 'desc' },\n        select: { id: true, bookingNumber: true, status: true, totalAmount: true, serviceId: true, routeType: true, createdAt: true },\n      },`
  );

  userCtrlCode = userCtrlCode.replace(
    `  const totalGift = user.giftDeliveryBookings.length;\n  const lifetimeBookings = totalCourier + totalConfidential + totalForgot + totalReturn + totalGift;`,
    `  const totalGift = user.giftDeliveryBookings.length;\n  const totalLuggage = (user as any).luggageDeliveryBookings?.length || 0;\n  const lifetimeBookings = totalCourier + totalConfidential + totalForgot + totalReturn + totalGift + totalLuggage;`
  );

  fs.writeFileSync(adminUserCtrlPath, userCtrlCode, 'utf8');
  console.log('Updated admin.controller.ts successfully.');
} else {
  console.log('admin.controller.ts already includes luggageDeliveryBookings.');
}

console.log('Backend routes and user controller updated.');
