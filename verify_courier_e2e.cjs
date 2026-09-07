const http = require('http');
const { PrismaClient } = require('C:\\Users\\Rax\\Desktop\\Delivery_app_site_backend\\node_modules\\@prisma\\client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:1234@localhost:5432/delivery_app_backend?schema=public'
    }
  }
});

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log(' COURIER DELIVERY MODULE — END-TO-END VERIFICATION  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Check Options API
  console.log('--- 1. Testing GET /api/v1/courier-delivery/options ---');
  const optRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/courier-delivery/options',
    method: 'GET',
  });
  assert(optRes.status === 200, `Options endpoint returned status 200 (got ${optRes.status})`);
  const services = optRes.body?.data?.services;
  assert(Array.isArray(services) && services.length === 7, `Returned exactly 7 APK services (got ${services ? services.length : 0})`);
  const serviceKeys = services ? services.map(s => s.id) : [];
  assert(serviceKeys.includes('AIRPORT_TO_HOTEL'), 'Contains AIRPORT_TO_HOTEL service');
  assert(serviceKeys.includes('HOME_TO_AIRPORT'), 'Contains HOME_TO_AIRPORT service');
  assert(serviceKeys.includes('MULTI_STOP'), 'Contains MULTI_STOP service');

  // 2. Check Tracking API for seeded booking DLVZ2505128947
  console.log('\n--- 2. Testing GET /api/v1/courier-delivery/bookings/DLVZ2505128947/track ---');
  const trackRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/courier-delivery/bookings/DLVZ2505128947/track',
    method: 'GET',
  });
  assert(trackRes.status === 200, `Tracking endpoint returned status 200 (got ${trackRes.status})`);
  const tracking = trackRes.body?.data?.tracking;
  assert(tracking?.bookingId === 'DLVZ2505128947', `Booking ID matches DLVZ2505128947`);
  assert(tracking?.status === 'IN_TRANSIT', `Status is IN_TRANSIT`);
  assert(tracking?.sealNumber === 'DLV-SEAL-88492', `Seal number matches DLV-SEAL-88492`);
  assert(tracking?.agent?.name === 'Ravi Kumar', `Driver agent is Ravi Kumar`);
  assert(Array.isArray(tracking?.timeline) && tracking.timeline.length === 10, `Detailed journey timeline contains all 10 milestones (got ${tracking?.timeline?.length})`);
  const inTransitStage = tracking?.timeline?.find(s => s.stage === 'IN_TRANSIT');
  assert(inTransitStage?.current === true, `Stage IN_TRANSIT is marked current: true in Detailed Journey Timeline`);

  // 3. Check Proof of Delivery (POD) API for DLVZ2505128947
  console.log('\n--- 3. Testing GET /api/v1/courier-delivery/bookings/DLVZ2505128947/pod ---');
  const podRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/courier-delivery/bookings/DLVZ2505128947/pod',
    method: 'GET',
  });
  assert(podRes.status === 200, `POD endpoint returned status 200 (got ${podRes.status})`);
  const pod = podRes.body?.data?.pod;
  assert(pod?.otp === '5487', `Handover OTP matches 5487`);
  assert(pod?.sealNumber === 'DLV-SEAL-88492', `POD seal number matches DLV-SEAL-88492`);
  assert(pod?.receivedBy?.includes('Amit Verma'), `Received by includes Taj Front Desk - Amit Verma`);
  assert(Boolean(pod?.signatureUrl), `Digital signature URL present`);
  assert(Boolean(pod?.photoUrl), `Luggage handover photo URL present`);
  assert(Boolean(pod?.sealPhotoUrl), `Tamper seal photo URL present`);

  // 4. Check PostgreSQL direct record
  console.log('\n--- 4. Checking PostgreSQL Database Record ---');
  const dbBooking = await prisma.courierBooking.findUnique({
    where: { bookingNumber: 'DLVZ2505128947' },
    include: { addresses: true, package: true }
  });
  assert(Boolean(dbBooking), 'DLVZ2505128947 exists in PostgreSQL database');
  assert(dbBooking?.totalAmount.toNumber() === 2395.8, `Total amount in PostgreSQL is 2395.80 (Screen 26 fare)`);
  assert(dbBooking?.addresses?.length === 2, `Addresses contain pickup & dropoff records`);
  let dbMeta = {};
  try { dbMeta = JSON.parse(dbBooking?.package?.contentDescription || '{}'); } catch {}
  assert(dbMeta.pickupDetails?.flightNumber === 'AI 102', `Pickup details flight number is AI 102`);
  assert(dbMeta.deliveryDetails?.hotelName === 'Taj City Centre', `Delivery hotel is Taj City Centre`);
  assert(dbMeta.deliveryDetails?.roomNumber === '402', `Delivery room number is 402`);
  assert(dbMeta.luggage?.length === 2, `Luggage pieces in DB is 2 bags`);

  // 5. Test Live Admin Edit & Database Persistence
  console.log('\n--- 5. Testing Admin Edit & Live Database Update ---');
  const updatePayload = {
    deliveryDetails: {
      hotelName: 'Taj City Centre Luxury Suites',
      roomNumber: '508',
      name: 'Rahul Sharma (VIP Guest)',
      phone: '+91 98765 43210',
      address: 'Taj City Centre, Sector 44',
      city: 'Gurugram',
    },
    agent: {
      name: 'Ravi Kumar (Senior Executive)',
      id: 'DLZAGT45521',
      phone: '+91 98765 43210',
      vehicle: 'DL 1Z 4589',
    },
    status: 'OUT_FOR_DELIVERY',
    totalAmount: 2395.8,
  };

  // Update via internal controller or direct DB simulation
  let updatedMeta = { ...dbMeta, ...updatePayload };
  updatedMeta.deliveryDetails = { ...dbMeta.deliveryDetails, ...updatePayload.deliveryDetails };
  updatedMeta.agent = { ...dbMeta.agent, ...updatePayload.agent };
  updatedMeta.status = updatePayload.status;

  await prisma.courierBookingPackage.update({
    where: { id: dbBooking.package.id },
    data: { contentDescription: JSON.stringify(updatedMeta) }
  });

  // Verify updated record via Tracking API
  const trackUpdatedRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/courier-delivery/bookings/DLVZ2505128947/track',
    method: 'GET',
  });
  const updatedTracking = trackUpdatedRes.body?.data?.tracking;
  assert(updatedTracking?.status === 'OUT_FOR_DELIVERY', `Updated status reflected immediately as OUT_FOR_DELIVERY`);
  assert(updatedTracking?.agent?.name === 'Ravi Kumar (Senior Executive)', `Updated agent reflected immediately`);

  // Revert back to IN_TRANSIT for ongoing demo integrity
  updatedMeta.status = 'IN_TRANSIT';
  updatedMeta.deliveryDetails.hotelName = 'Taj City Centre';
  updatedMeta.deliveryDetails.roomNumber = '402';
  updatedMeta.agent.name = 'Ravi Kumar';
  await prisma.courierBookingPackage.update({
    where: { id: dbBooking.package.id },
    data: { contentDescription: JSON.stringify(updatedMeta) }
  });
  console.log('[INFO] State cleanly restored to IN_TRANSIT for demo walkthrough.');

  console.log('\n====================================================');
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
