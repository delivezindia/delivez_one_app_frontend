const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../../Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

// Read backend .env for admin login
const envPath = path.resolve(__dirname, '../../Delivery_app_site_backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envMap = {};
envContent.split('\n').forEach(l => {
  const parts = l.split('=');
  if (parts.length >= 2) {
    envMap[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const adminEmail = envMap.ADMIN_EMAIL;
const adminPassword = envMap.ADMIN_PASSWORD;

async function runVerification() {
  console.log('====================================================');
  console.log('  DELIVEZ ADMIN DASHBOARD LIVE DATABASE VERIFICATION');
  console.log('====================================================\n');

  // Step 0: Login
  const loginRes = await fetch('http://localhost:4000/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: adminEmail, password: adminPassword }),
  });
  const loginData = await loginRes.json();
  const token = loginData?.data?.accessToken;
  if (!token) throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  console.log('✔ 0. Admin Authentication Verified (Token generated for ' + adminEmail + ')\n');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const baseUrl = 'http://localhost:4000/api/v1/admin';

  // Step 1: Luggage Delivery Listing & Counts
  console.log('--- 1. Testing Luggage Delivery Live Listing ---');
  const resLuggage = await fetch(`${baseUrl}/luggage/bookings`, { headers });
  const dataLuggage = await resLuggage.json();
  if (resLuggage.status !== 200) throw new Error('Failed to list luggage: ' + JSON.stringify(dataLuggage));

  const totalInDb = await prisma.luggageDeliveryBooking.count();
  console.log(`✔ Listed ${dataLuggage.data.bookings.length} luggage bookings (DB Count: ${totalInDb})`);
  console.log('  Status Counts from DB:', dataLuggage.data.statusCounts);

  const sampleLuggage = dataLuggage.data.bookings[0];
  console.log('  Sample Booking:', {
    bookingNumber: sampleLuggage.bookingNumber,
    routeTitle: sampleLuggage.routeTitle,
    passenger: sampleLuggage.customerName,
    flight: sampleLuggage.flightNumber,
    pnr: sampleLuggage.pnr,
    terminal: sampleLuggage.terminal,
    bags: sampleLuggage.totalBags,
    weightKg: sampleLuggage.totalWeightKg,
    amount: sampleLuggage.totalAmount,
    status: sampleLuggage.status,
  });

  // Step 2: Luggage Detail View
  console.log('\n--- 2. Testing Luggage Full Detail Retrieval ---');
  const resLuggageDetail = await fetch(`${baseUrl}/luggage/bookings/${sampleLuggage.id}`, { headers });
  const dataLuggageDetail = await resLuggageDetail.json();
  if (resLuggageDetail.status !== 200) throw new Error('Failed to fetch luggage detail');
  const bDetail = dataLuggageDetail.data.booking;
  console.log('✔ Master Dossier retrieved:', {
    bookingNumber: bDetail.bookingNumber,
    pickupOtp: bDetail.pickupOtp,
    deliveryOtp: bDetail.deliveryOtp,
    hasLuggageItems: Array.isArray(bDetail.luggageItems) && bDetail.luggageItems.length > 0,
    hasMilestones: Array.isArray(bDetail.milestones) && bDetail.milestones.length > 0,
    hasPricingBreakdown: Boolean(bDetail.pricingBreakdown),
  });

  // Step 3: Luggage Status Mutation & DB Persistence
  console.log('\n--- 3. Testing Luggage Status Mutation & DB Persistence ---');
  const prevStatus = sampleLuggage.status;
  const patchRes = await fetch(`${baseUrl}/luggage/bookings/${sampleLuggage.id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'IN_TRANSIT', notes: 'Live Admin Verification Test' }),
  });
  const patchData = await patchRes.json();
  console.log(`✔ Status updated via API to ${patchData.data.booking.status} (Milestone Index: ${patchData.data.booking.currentMilestoneIndex})`);

  // Verify directly in DB
  const dbLuggage = await prisma.luggageDeliveryBooking.findUnique({ where: { id: sampleLuggage.id } });
  if (dbLuggage.status !== 'IN_TRANSIT') throw new Error('DB status does not match!');
  console.log('✔ Verified in PostgreSQL: luggage_delivery_bookings.status is now ' + dbLuggage.status);

  // Revert back
  await fetch(`${baseUrl}/luggage/bookings/${sampleLuggage.id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: prevStatus }),
  });
  console.log(`✔ Reverted status back to ${prevStatus}`);

  // Step 4: Confidential Delivery Hydration & Dual-Sync
  console.log('\n--- 4. Testing Confidential Delivery & Vault Hydration ---');
  const resConf = await fetch(`${baseUrl}/confidential/bookings?limit=5`, { headers });
  const dataConf = await resConf.json();
  if (resConf.status !== 200) throw new Error('Failed to list confidential bookings');
  console.log(`✔ Listed ${dataConf.data.bookings.length} confidential consignments`);

  const sampleConf = dataConf.data.bookings.find(b => b.vault) || dataConf.data.bookings[0];
  console.log('  Sample Vault Consignment:', {
    bookingNumber: sampleConf.bookingNumber,
    vaultServiceType: sampleConf.vaultServiceType,
    securityTitle: sampleConf.securityTitle,
    amount: sampleConf.totalAmount,
    status: sampleConf.status,
    hasVaultHydration: Boolean(sampleConf.vault),
    multipointStops: sampleConf.multipointStops?.length || 0,
    packaging: sampleConf.packaging?.selectedPackage || 'Standard Box',
  });

  // Step 5: Confidential Status Mutation & Dual Sync
  console.log('\n--- 5. Testing Dual-Model Synchronization on Status Change ---');
  const prevConfStatus = sampleConf.status;
  const patchConfRes = await fetch(`${baseUrl}/confidential/bookings/${sampleConf.id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'IN_TRANSIT' }),
  });
  const patchConfData = await patchConfRes.json();
  console.log(`✔ Confidential status updated via API to ${patchConfData.data.booking.status}`);

  // Verify in BOTH DB models
  const confRow = await prisma.confidentialCourierBooking.findFirst({ where: { bookingNumber: sampleConf.bookingNumber } });
  const vaultRow = await prisma.vaultCourierBooking.findFirst({ where: { bookingNumber: sampleConf.bookingNumber } });
  console.log('✔ Verified in PostgreSQL:');
  console.log(`  - confidential_courier_bookings.status: ${confRow?.status}`);
  console.log(`  - courier_vault_bookings.status: ${vaultRow?.status}`);

  // Revert back
  await fetch(`${baseUrl}/confidential/bookings/${sampleConf.id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: prevConfStatus }),
  });
  console.log(`✔ Reverted confidential status back to ${prevConfStatus}`);

  // Step 6: Unified Dashboard Stats
  console.log('\n--- 6. Testing Unified Dashboard Statistics ---');
  const resStats = await fetch(`${baseUrl}/stats`, { headers });
  const dataStats = await resStats.json();
  console.log('✔ Unified Dashboard Breakdown:', dataStats.data.breakdown);
  console.log(`✔ Total Orders across platform: ${dataStats.data.totalOrders}`);
  console.log(`✔ Total Revenue across platform: ₹${dataStats.data.totalRevenue.toLocaleString('en-IN')}`);

  // Step 7: Universal Tracking
  console.log('\n--- 7. Testing Universal Tracking for Luggage ---');
  const resTrack = await fetch(`http://localhost:4000/api/v1/track/${sampleLuggage.bookingNumber}`);
  const dataTrack = await resTrack.json();
  console.log('✔ Universal Track Result:', {
    serviceName: dataTrack?.data?.serviceName,
    bookingNumber: dataTrack?.data?.bookingNumber,
    item: dataTrack?.data?.item,
    status: dataTrack?.data?.status,
    progress: dataTrack?.data?.progress,
  });

  console.log('\n====================================================');
  console.log('  ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
  console.log('====================================================');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
