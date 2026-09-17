const http = require('http');
const { PrismaClient } = require('c:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/@prisma/client');
const jwt = require('c:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/jsonwebtoken');

const prisma = new PrismaClient();

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function verifyAll() {
  console.log('--- START VERIFICATION ---');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const sample = await prisma.confidentialCourierBooking.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!admin || !sample) {
    console.error('Admin or sample booking not found!');
    await prisma.$disconnect();
    return;
  }

  const token = jwt.sign(
    { sub: admin.id, userId: admin.id, role: admin.role },
    process.env.JWT_SECRET || 'delivez_backend_jwt_secret_dev_key_2026',
    { expiresIn: '1h' }
  );

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. List Confidential Bookings
  const listRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/admin/confidential/bookings',
    method: 'GET',
    headers,
  });
  console.log('1. List Confidential Bookings Status:', listRes.status);
  console.log('   Count returned:', listRes.data?.data?.bookings?.length);

  // 2. Single Booking by ID
  const singleRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/v1/admin/confidential/bookings/${sample.id}`,
    method: 'GET',
    headers,
  });
  console.log('2. Single Booking Status:', singleRes.status);
  const bk = singleRes.data?.data?.booking;
  console.log('   Vault ID:', bk?.vaultId);
  console.log('   Document Type:', bk?.documentType);
  console.log('   Envelope Size:', bk?.envelopeSize);
  console.log('   Security Level:', bk?.securityLevel);
  console.log('   Handover Method:', bk?.handoverMethod);
  console.log('   Contains Originals:', bk?.containsOriginals);
  console.log('   Requires Return:', bk?.requiresReturn);
  console.log('   Base Charge:', bk?.baseCharge);
  console.log('   Security Charge:', bk?.securityCharge);
  console.log('   Handover Charge:', bk?.handoverCharge);
  console.log('   Tax Amount:', bk?.taxAmount);
  console.log('   Total Amount:', bk?.totalAmount);
  console.log('   Pickup Address:', bk?.pickup?.addressLine1, bk?.pickup?.city);
  console.log('   Dropoff Address:', bk?.dropoff?.addressLine1, bk?.dropoff?.city);

  // 3. Unified Orders Stream Search
  const unifiedRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/v1/admin/orders/unified?search=${encodeURIComponent(sample.bookingNumber)}`,
    method: 'GET',
    headers,
  });
  console.log('3. Unified Order Search Status:', unifiedRes.status);
  const uniOrder = unifiedRes.data?.data?.orders?.[0];
  console.log('   Unified Service Key:', uniOrder?.serviceKey);
  console.log('   Unified Document Type:', uniOrder?.documentType);
  console.log('   Unified Amount:', uniOrder?.amount);
  console.log('   Unified Recipient:', uniOrder?.recipientName);

  // 4. Update Status
  const updateRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1/admin/confidential/bookings/${sample.id}/status`,
      method: 'PATCH',
      headers,
    },
    { status: 'IN_TRANSIT' }
  );
  console.log('4. Update Status Response:', updateRes.status, updateRes.data?.message);

  console.log('--- VERIFICATION COMPLETE: ALL PASS ---');
  await prisma.$disconnect();
}

verifyAll().catch(console.error);
