const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../../Delivery_app_site_backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

// Read backend .env
const envPath = path.resolve(__dirname, '../../Delivery_app_site_backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const envMap = {};
envLines.forEach(l => {
  const parts = l.split('=');
  if (parts.length >= 2) {
    envMap[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const adminEmail = envMap.ADMIN_EMAIL;
const adminPassword = envMap.ADMIN_PASSWORD;

async function testBackend() {
  console.log('Logging in as Admin:', adminEmail);
  const loginRes = await fetch('http://localhost:4000/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: adminEmail, password: adminPassword }),
  });
  const loginData = await loginRes.json();
  const token = loginData?.data?.accessToken || loginData?.data?.tokens?.accessToken || loginData?.data?.token;

  if (!token) {
    console.error('Failed to log in as admin:', loginData);
    return;
  }
  console.log('Login successful! Admin Token acquired.');

  const baseUrl = 'http://localhost:4000/api/v1/admin';

  // 1. Test Luggage Bookings List
  console.log('\n--- 1. Testing GET /admin/luggage/bookings ---');
  const resLuggage = await fetch(`${baseUrl}/luggage/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Status:', resLuggage.status);
  const dataLuggage = await resLuggage.json();
  console.log('Total luggage bookings returned:', dataLuggage?.data?.bookings?.length);
  console.log('Status counts:', dataLuggage?.data?.statusCounts);
  if (dataLuggage?.data?.bookings?.length > 0) {
    const b0 = dataLuggage.data.bookings[0];
    console.log('Sample luggage booking:', {
      bookingNumber: b0.bookingNumber,
      customerName: b0.customerName,
      customerPhone: b0.customerPhone,
      routeTitle: b0.routeTitle,
      flightNumber: b0.flightNumber,
      pnr: b0.pnr,
      terminal: b0.terminal,
      totalBags: b0.totalBags,
      totalWeightKg: b0.totalWeightKg,
      totalAmount: b0.totalAmount,
      status: b0.status,
    });

    // 2. Test Luggage Detail by ID
    console.log('\n--- 2. Testing GET /admin/luggage/bookings/:id ---');
    const resDetail = await fetch(`${baseUrl}/luggage/bookings/${b0.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataDetail = await resDetail.json();
    console.log('Detail status:', resDetail.status, 'Booking:', dataDetail?.data?.booking?.bookingNumber);

    // 3. Test Luggage Status Update
    console.log('\n--- 3. Testing PATCH /admin/luggage/bookings/:id/status ---');
    const originalStatus = b0.status;
    const resPatch = await fetch(`${baseUrl}/luggage/bookings/${b0.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'AGENT_ASSIGNED', notes: 'Automated Admin Test' }),
    });
    const dataPatch = await resPatch.json();
    console.log('Patch status:', resPatch.status, 'New status:', dataPatch?.data?.booking?.status, 'Milestone idx:', dataPatch?.data?.booking?.currentMilestoneIndex);

    // Revert status
    await fetch(`${baseUrl}/luggage/bookings/${b0.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: originalStatus }),
    });
    console.log('Reverted back to:', originalStatus);
  }

  // 4. Test Confidential Bookings List
  console.log('\n--- 4. Testing GET /admin/confidential/bookings ---');
  const resConf = await fetch(`${baseUrl}/confidential/bookings?limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Status:', resConf.status);
  const dataConf = await resConf.json();
  console.log('Total confidential bookings returned:', dataConf?.data?.bookings?.length);
  if (dataConf?.data?.bookings?.length > 0) {
    const c0 = dataConf.data.bookings[0];
    console.log('Sample confidential booking:', {
      bookingNumber: c0.bookingNumber,
      vaultServiceType: c0.vaultServiceType,
      totalAmount: c0.totalAmount,
      status: c0.status,
      hasVaultRelations: Boolean(c0.vault),
      multipointStopsCount: c0.multipointStops?.length,
      itemPieceCount: c0.item?.numberOfPieces,
    });
  }

  // 5. Test Stats
  console.log('\n--- 5. Testing GET /admin/stats ---');
  const resStats = await fetch(`${baseUrl}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dataStats = await resStats.json();
  console.log('Stats breakdown:', dataStats?.data?.breakdown);
  console.log('Total orders:', dataStats?.data?.totalOrders);

  // 6. Test Unified Orders
  console.log('\n--- 6. Testing GET /admin/orders/unified ---');
  const resUnified = await fetch(`${baseUrl}/orders/unified?limit=10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dataUnified = await resUnified.json();
  const servicesInUnified = new Set(dataUnified?.data?.orders?.map(o => o.serviceKey));
  console.log('Unified orders count:', dataUnified?.data?.orders?.length, 'Services present:', Array.from(servicesInUnified));
}

testBackend().catch(console.error).finally(() => prisma.$disconnect());
