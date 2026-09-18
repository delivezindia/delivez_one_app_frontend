/**
 * Comprehensive End-to-End Test Suite for Confidential Courier / Vault Module
 * Tests:
 * 1. Authentication & Token Retrieval
 * 2. Booking creation for ALL 9 Canonical Vault Services:
 *    - Vault Secure
 *    - Vault Priority
 *    - Vault Direct
 *    - Vault Precise
 *    - Vault Hand Carry
 *    - Vault Return
 *    - Vault Exchange
 *    - Vault Critical
 *    - Vault MultiPoint (with 3 stops)
 * 3. GET all bookings & GET booking by ID (Canonical reconstruction test)
 * 4. PUT and PATCH updates
 * 5. Payment initiation (POST /courier-delivery/payments)
 * 6. Server-side payment verification (POST /courier-delivery/payments/:id/verify)
 * 7. Receipt generation and Idempotency test (POST /courier-delivery/receipts)
 * 8. GET receipt by ID and GET receipt by booking ID
 * 9. Direct relational database inspection verifying all 13 child tables
 */

const { PrismaClient } = require('C:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/api/v1';

let authToken = '';
let testUserId = '';

// Helper to log test stages
function logStage(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`>>> ${title}`);
  console.log('='.repeat(80));
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

// 1. Get Auth Token
async function authenticateTestUser() {
  logStage('1. AUTHENTICATING TEST USER');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode: '+91', mobileNumber: '9895226999' })
  });
  const loginData = await loginRes.json();
  assert(loginData.status === 'success', 'Login request successful');
  assert(loginData.data?.challengeId, 'Challenge ID returned');

  const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: loginData.data.challengeId,
      otp: loginData.data.developmentOtp || loginData.data.otp
    })
  });
  const verifyData = await verifyRes.json();
  assert(verifyData.status === 'success', 'OTP verification successful');
  assert(verifyData.data?.accessToken, 'Access token received');

  authToken = verifyData.data.accessToken;
  testUserId = verifyData.data.user.id;
  console.log(`Authenticated user: ${verifyData.data.user.fullName} (${testUserId})`);
}

// Helper to create common steps 1 to 6
function getCommonSteps() {
  return {
    addresses: {
      pickup: {
        address_line1: 'Tower A, Floor 14, Brigade Gateway',
        address_line2: 'Rajajinagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560055',
        country: 'India',
        latitude: 13.0125,
        longitude: 77.5558,
        landmark: 'Near Orion Mall',
        floor_number: '14',
        building_name: 'Brigade Gateway',
        gate_code: 'GATE-3',
        access_notes: 'Ring security bell and ask for Room 1402'
      },
      delivery: {
        address_line1: 'Embassy TechVillage, Block 2B',
        address_line2: 'Outer Ring Road, Devarabisanahalli',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560103',
        country: 'India',
        latitude: 12.9279,
        longitude: 77.6894,
        landmark: 'Opposite New Horizon College',
        floor_number: '5',
        building_name: 'Block 2B',
        gate_code: 'SECURITY-MAIN',
        access_notes: 'Visitor badge required at main gate'
      }
    },
    contacts: {
      sender: {
        full_name: 'Rajesh Sharma',
        phone: '+919895226999',
        alternate_phone: '+919895226998',
        email: 'rajesh.sharma@vaultsecure.in',
        company_name: 'Apex Legal Partners',
        department: 'Corporate M&A',
        id_type: 'PASSPORT',
        id_number_masked: '****4321'
      },
      recipient: {
        full_name: 'Priya Sundaram',
        phone: '+919876543210',
        alternate_phone: '+919876543211',
        email: 'priya.s@techhorizon.com',
        company_name: 'Tech Horizon Solutions',
        department: 'Finance & Compliance',
        id_type: 'AADHAAR',
        id_number_masked: '****9876'
      },
      emergency: {
        full_name: 'Kavita Menon',
        phone: '+919811223344',
        relationship: 'Operations Director'
      }
    },
    timing: {
      pickup_window: {
        scheduled_date: '2026-09-20',
        start_time: '10:00:00',
        end_time: '11:30:00',
        timezone: 'Asia/Kolkata'
      },
      delivery_window: {
        scheduled_date: '2026-09-20',
        start_time: '14:00:00',
        end_time: '16:00:00',
        timezone: 'Asia/Kolkata'
      },
      is_asap: false,
      grace_period_minutes: 15,
      special_timing_notes: 'Urgent handover before board review meeting at 4 PM'
    },
    package_details: {
      items: [
        {
          item_id: 'ITEM-001',
          item_name: 'Acquisition Contracts (Triplicate Original)',
          category: 'DOCUMENT',
          quantity: 3,
          declared_value: 250000,
          currency: 'INR',
          dimensions: {
            length: 35.0,
            width: 25.0,
            height: 5.0,
            unit: 'cm'
          },
          weight: {
            value: 1.8,
            unit: 'kg'
          },
          is_fragile: false,
          is_hazardous: false,
          special_instructions: 'Do not bend or expose to moisture'
        },
        {
          item_id: 'ITEM-002',
          item_name: 'Hardware Security Key (FIPS 140-2 Level 3)',
          category: 'HIGH_VALUE',
          quantity: 1,
          declared_value: 75000,
          currency: 'INR',
          dimensions: {
            length: 8.0,
            width: 3.0,
            height: 1.0,
            unit: 'cm'
          },
          weight: {
            value: 0.1,
            unit: 'kg'
          },
          is_fragile: true,
          is_hazardous: false,
          special_instructions: 'Keep in Faraday enclosure'
        }
      ],
      attachments: [
        {
          attachment_id: 'ATT-001',
          attachment_type: 'CHAIN_OF_CUSTODY_DOC',
          file_name: 'custody_manifest_signed.pdf',
          file_size_bytes: 412500,
          mime_type: 'application/pdf',
          url: 'https://cdn.vaultdelivery.com/manifests/custody_manifest_signed.pdf'
        }
      ],
      packaging: {
        packaging_type: 'TAMPER_EVIDENT_ENVELOPE',
        custom_packaging_requested: true,
        packaging_instructions: 'Place in heavy-duty tamper-proof security sleeve with serialized lock',
        requires_temperature_control: false,
        requires_shock_indicator: true
      }
    },
    security: {
      level: 'ULTRA_HIGH',
      chain_of_custody: true,
      digital_seal: true,
      tamper_evident: true,
      two_person_verification: false,
      armed_escort: false,
      gps_tracking_level: 'CONTINUOUS',
      geo_fencing_enabled: true,
      allow_subcontractor: false,
      security_officer_assigned: 'SO-VIKRAM-781'
    },
    verification: {
      pickup: {
        id_verification: true,
        signature_required: true,
        otp_required: true,
        photo_proof: true,
        tamper_seal_scan: true
      },
      delivery: {
        id_verification: true,
        signature_required: true,
        otp_required: true,
        photo_proof: true,
        tamper_seal_scan: true,
        thumbprint_required: false
      },
      audit_trail: {
        log_all_events: true,
        gps_breadcrumbs: true,
        tamper_alert_notifications: true
      },
      custody_signatures: []
    }
  };
}

// 9 Service Definitions with their specific service_details (Step 7)
const SERVICE_TEST_SPECS = [
  {
    name: 'Vault Secure',
    service_type: 'vault_secure',
    service_name: 'Vault Secure',
    service_specific: {
      vault_type: 'ELECTRONIC_TAMPER_SEAL',
      lock_type: 'DIGITAL_PIN_AND_SEAL',
      seal_numbers: ['SL-SEC-9901', 'SL-SEC-9902'],
      escort_required: false,
      monitoring_tier: 'CONTINUOUS_SOC',
      max_idle_seconds: 300,
      emergency_protocol: 'NOTIFY_DISPATCH_AND_POLICE'
    }
  },
  {
    name: 'Vault Priority',
    service_type: 'vault_priority',
    service_name: 'Vault Priority',
    service_specific: {
      priority_level: 'TIER_1',
      max_transit_minutes: 60,
      dedicated_vehicle: true,
      sla_guarantee_minutes: 75,
      route_optimization: 'FASTEST_DIRECT',
      bypass_checkpoints: false
    }
  },
  {
    name: 'Vault Direct',
    service_type: 'vault_direct',
    service_name: 'Vault Direct',
    service_specific: {
      point_to_point: true,
      zero_intermediate_stops: true,
      seal_intact_at_delivery: true,
      route_deviation_alert: true,
      deviation_radius_meters: 100
    }
  },
  {
    name: 'Vault Precise',
    service_type: 'vault_precise',
    service_name: 'Vault Precise',
    service_specific: {
      time_window_minutes: 15,
      preferred_delivery_exact: '2026-09-20T14:30:00Z',
      pre_call_minutes: 20,
      late_compensation_applied: false,
      max_wait_minutes: 10
    }
  },
  {
    name: 'Vault Hand Carry',
    service_type: 'vault_hand_carry',
    service_name: 'Vault Hand Carry',
    service_specific: {
      courier_identity: 'HC-AGENT-007',
      cabin_luggage_approved: true,
      flight_number: '6E-452',
      handover_protocol: 'IN_PERSON_EYE_CONTACT',
      hotel_stay_protocol: 'IN_ROOM_VAULT'
    }
  },
  {
    name: 'Vault Return',
    service_type: 'vault_return',
    service_name: 'Vault Return',
    service_specific: {
      is_round_trip: true,
      return_condition: 'UNOPENED_AND_SIGNED',
      return_pickup_window: {
        scheduled_date: '2026-09-21',
        start_time: '11:00:00',
        end_time: '13:00:00',
        timezone: 'Asia/Kolkata'
      },
      return_recipient: {
        full_name: 'Rajesh Sharma',
        phone: '+919895226999',
        address_line1: 'Tower A, Floor 14, Brigade Gateway',
        city: 'Bengaluru',
        postal_code: '560055'
      },
      auto_return_trigger: 'RECIPIENT_SIGNATURE_COMPLETED'
    }
  },
  {
    name: 'Vault Exchange',
    service_type: 'vault_exchange',
    service_name: 'Vault Exchange',
    service_specific: {
      exchange_type: 'TWO_WAY_SIMULTANEOUS',
      exchange_reason: 'CONTRACT_COUNTER_EXECUTION',
      exchange_id: 'EXC-2026-009',
      outgoing_item: {
        name: 'Original Execution Draft Copy A',
        serial_number: 'DOC-EXEC-101'
      },
      incoming_item: {
        name: 'Executed Counterpart Copy B with Board Seal',
        serial_number: 'DOC-EXEC-102'
      },
      exchange_instructions: 'Verify Board Seal before handing over Copy A',
      expected_exchange_date: '2026-09-20',
      swap_time_window: '30_MINUTES',
      same_as_pickup: true
    }
  },
  {
    name: 'Vault Critical',
    service_type: 'vault_critical',
    service_name: 'Vault Critical',
    service_specific: {
      criticality_level: 'LIFE_CRITICAL',
      dual_courier: true,
      police_intimation: false,
      backup_vehicle_on_standby: true,
      failsafe_abort_protocol: 'RETURN_TO_BASE_IMMEDIATELY',
      soc_call_frequency_minutes: 15
    }
  },
  {
    name: 'Vault MultiPoint',
    service_type: 'vault_multipoint',
    service_name: 'Vault MultiPoint',
    service_specific: {
      route_type: 'OPTIMIZED',
      total_stops: 3,
      allow_stop_reordering: false,
      stops: [
        {
          stop_sequence: 1,
          stop_type: 'DROPOFF',
          address: {
            address_line1: 'Stop 1: KPMG Tower, Level 4, RMZ Infinity',
            city: 'Bengaluru',
            postal_code: '560016'
          },
          contact: {
            full_name: 'Sunil Mehta',
            phone: '+919845011111'
          },
          package_actions: ['DELIVER_PACKAGE_1'],
          verification_requirements: ['OTP', 'SIGNATURE']
        },
        {
          stop_sequence: 2,
          stop_type: 'PICKUP',
          address: {
            address_line1: 'Stop 2: Ernst & Young Office, Bagmane Tech Park',
            city: 'Bengaluru',
            postal_code: '560093'
          },
          contact: {
            full_name: 'Ananya Rao',
            phone: '+919845022222'
          },
          package_actions: ['PICKUP_ADDITIONAL_AUDIT_DOCS'],
          verification_requirements: ['ID_CHECK', 'SIGNATURE']
        },
        {
          stop_sequence: 3,
          stop_type: 'DROPOFF',
          address: {
            address_line1: 'Stop 3: Embassy GolfLinks, Business Park',
            city: 'Bengaluru',
            postal_code: '560071'
          },
          contact: {
            full_name: 'Deepak Verma',
            phone: '+919845033333'
          },
          package_actions: ['FINAL_DELIVERY_ALL_ITEMS'],
          verification_requirements: ['OTP', 'SIGNATURE', 'PHOTO']
        }
      ]
    }
  }
];

// Test storage
const createdBookings = [];

// 2. Test All 9 Services Creation
async function testCreateAllServices() {
  logStage('2. CREATING BOOKINGS FOR ALL 9 CANONICAL VAULT SERVICES');

  for (const spec of SERVICE_TEST_SPECS) {
    console.log(`\n--- Testing Creation of: ${spec.name} (${spec.service_type}) ---`);

    const payload = {
      service_selection: {
        service_type: spec.service_type,
        service_name: spec.service_name,
        speed_tier: 'EXPRESS',
        vehicle_type: 'FOUR_WHEELER',
        description: `Official enterprise confidential test for ${spec.name}`
      },
      ...getCommonSteps(),
      service_specific: spec.service_specific
    };

    const res = await fetch(`${BASE_URL}/courier-delivery/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    });

    const responseData = await res.json();
    if (res.status !== 201) {
      console.error(`Creation failed for ${spec.name}: status=${res.status}`, JSON.stringify(responseData, null, 2));
    }
    assert(res.status === 201, `Status is 201 Created for ${spec.name}`);
    assert(responseData.status === 'success', `Response status is success for ${spec.name}`);
    assert(responseData.data?.booking_id, `booking_id returned: ${responseData.data?.booking_id}`);
    assert(
      responseData.data?.service_selection?.service_type === spec.name ||
      responseData.data?.service_selection?.service_type === spec.service_type,
      `service_type matches ${spec.name}`
    );
    assert(responseData.data?.pricing?.total_fare > 0, `Total fare calculated: ₹${responseData.data?.pricing?.total_fare}`);
    assert(responseData.data?.pricing?.gst_amount > 0, `GST calculated: ₹${responseData.data?.pricing?.gst_amount}`);

    // If multipoint, verify stops
    if (spec.service_type === 'vault_multipoint') {
      assert(responseData.data?.service_specific?.stops?.length === 3, 'MultiPoint created with exactly 3 stops');
    }

    createdBookings.push({
      spec,
      booking: responseData.data
    });
  }

  console.log(`\n Successfully created bookings for all ${createdBookings.length} services.`);
}

// 3. Test GET bookings (list and by ID) & Canonical Reconstruction
async function testGetBookings() {
  logStage('3. TESTING GET /courier-delivery/bookings (LIST & BY ID)');

  // Test List
  const listRes = await fetch(`${BASE_URL}/courier-delivery/bookings`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const listData = await listRes.json();
  assert(listRes.status === 200, 'GET list returned 200');
  assert(Array.isArray(listData.data), 'List returned array of bookings');
  assert(listData.data.length >= 9, `List has at least 9 bookings (found ${listData.data.length})`);

  // Test GET by ID for the MultiPoint booking and check full reconstruction
  const multiPointBooking = createdBookings.find(b => b.spec.service_type === 'vault_multipoint').booking;
  const getRes = await fetch(`${BASE_URL}/courier-delivery/bookings/${multiPointBooking.booking_id}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const getData = await getRes.json();
  assert(getRes.status === 200, 'GET by ID returned 200');
  const b = getData.data;

  // Verify all 8 steps are faithfully reconstructed in JSON response
  assert(b.booking_id === multiPointBooking.booking_id, 'booking_id matches');
  assert(
    b.service_selection?.service_type === 'Vault MultiPoint' ||
    b.service_selection?.service_type === 'vault_multipoint',
    'service_selection reconstructed'
  );
  assert(b.addresses?.pickup?.city === 'Bengaluru', 'addresses.pickup reconstructed');
  assert(b.addresses?.delivery?.landmark === 'Opposite New Horizon College', 'addresses.delivery reconstructed');
  assert(b.contacts?.sender?.full_name === 'Rajesh Sharma', 'contacts.sender reconstructed');
  assert(b.contacts?.recipient?.phone === '+919876543210', 'contacts.recipient reconstructed');
  assert(b.timing?.special_timing_notes.includes('Urgent handover'), 'timing reconstructed');
  assert(b.package_details?.items?.length === 2, 'package_details.items reconstructed with 2 items');
  assert(b.package_details?.packaging?.packaging_type === 'TAMPER_EVIDENT_ENVELOPE', 'package_details.packaging reconstructed');
  assert(b.security?.level === 'ULTRA_HIGH', 'security reconstructed');
  assert(b.verification?.pickup?.otp_required === true, 'verification reconstructed');
  assert(b.service_specific?.stops?.length === 3, 'service_specific reconstructed with 3 stops');
  assert(b.pricing?.total_fare > 0, 'pricing reconstructed');
}

// 4. Test PUT & PATCH updates
async function testBookingUpdates() {
  logStage('4. TESTING PUT & PATCH BOOKING UPDATES');

  const testBooking = createdBookings[0].booking;

  // PATCH: update notes and special instructions
  const patchRes = await fetch(`${BASE_URL}/courier-delivery/bookings/${testBooking.booking_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      special_instructions: 'Updated: Handle with utmost care and verify ID strictly.',
      status: 'CONFIRMED'
    })
  });
  const patchData = await patchRes.json();
  assert(patchRes.status === 200, 'PATCH returned 200');
  assert(patchData.data?.status === 'CONFIRMED', 'Status updated to CONFIRMED');
  assert(patchData.data?.special_instructions.includes('Updated: Handle with utmost care'), 'Special instructions updated');

  // PUT: full update of timing
  const updatedTiming = {
    ...testBooking.timing,
    special_timing_notes: 'Rescheduled pickup time by client request.'
  };
  const putRes = await fetch(`${BASE_URL}/courier-delivery/bookings/${testBooking.booking_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      timing: updatedTiming
    })
  });
  const putData = await putRes.json();
  assert(putRes.status === 200, 'PUT returned 200');
  assert(putData.data?.timing?.special_timing_notes === 'Rescheduled pickup time by client request.', 'Timing notes updated via PUT');
}

// 5. Test Payment Lifecycle (Initiation, Verification, Get)
let testPaymentId = '';
async function testPaymentLifecycle() {
  logStage('5. TESTING PAYMENT LIFECYCLE (CREATE, VERIFY, FETCH)');

  const testBooking = createdBookings[0].booking;

  // Create payment
  const createPaymentRes = await fetch(`${BASE_URL}/courier-delivery/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      booking_id: testBooking.booking_id,
      amount: testBooking.pricing.total_fare,
      payment_method: 'UPI',
      currency: 'INR'
    })
  });
  const createPaymentData = await createPaymentRes.json();
  assert(createPaymentRes.status === 201, 'POST /courier-delivery/payments returned 201 Created');
  assert(createPaymentData.data?.payment_id, `Payment initiated: ${createPaymentData.data?.payment_id}`);
  assert(
    createPaymentData.data?.status?.toUpperCase() === 'PENDING',
    'Payment initial status is PENDING'
  );
  testPaymentId = createPaymentData.data.payment_id;

  // Server-side Payment Verification
  const verifyPaymentRes = await fetch(`${BASE_URL}/courier-delivery/payments/${testPaymentId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      transaction_id: `TXN-UPI-${Date.now()}`,
      gateway_signature: `SIG-${crypto.randomBytes(16).toString('hex')}`,
      metadata: { upi_vpa: 'user@okhdfcbank', provider: 'Razorpay' }
    })
  });
  const verifyPaymentData = await verifyPaymentRes.json();
  assert(verifyPaymentRes.status === 200, 'Payment verification returned 200');
  assert(
    verifyPaymentData.data?.payment?.status?.toUpperCase() === 'PAID' ||
    verifyPaymentData.data?.payment?.status?.toUpperCase() === 'SUCCESS',
    'Payment status updated to PAID/SUCCESS'
  );
  assert(
    verifyPaymentData.data?.receipt?.receipt_number || verifyPaymentData.data?.receipt?.receipt_id,
    `Receipt auto-generated on payment: ${verifyPaymentData.data?.receipt?.receipt_number || verifyPaymentData.data?.receipt?.receipt_id}`
  );

  // Fetch Payment by Booking ID
  const getPaymentRes = await fetch(`${BASE_URL}/courier-delivery/bookings/${testBooking.booking_id}/payment`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const getPaymentData = await getPaymentRes.json();
  assert(getPaymentRes.status === 200, 'GET booking payment returned 200');
  assert(getPaymentData.data?.payment_id === testPaymentId, 'Payment ID matches');
  assert(
    getPaymentData.data?.status?.toUpperCase() === 'PAID' ||
    getPaymentData.data?.status?.toUpperCase() === 'SUCCESS',
    'Verified payment status is PAID/SUCCESS'
  );
}

// 6. Test Receipt Lifecycle & Idempotency
let testReceiptId = '';
async function testReceiptLifecycle() {
  logStage('6. TESTING RECEIPT LIFECYCLE & IDEMPOTENCY');

  const testBooking = createdBookings[0].booking;

  // 1. Call POST /courier-delivery/receipts (should return the receipt generated during payment)
  const receipt1Res = await fetch(`${BASE_URL}/courier-delivery/receipts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      booking_id: testBooking.booking_id
    })
  });
  const receipt1Data = await receipt1Res.json();
  assert(receipt1Res.status === 200 || receipt1Res.status === 201, 'Receipt call succeeded');
  assert(
    receipt1Data.data?.receipt_number || receipt1Data.data?.receipt_id,
    `Receipt Number: ${receipt1Data.data?.receipt_number || receipt1Data.data?.receipt_id}`
  );
  testReceiptId = receipt1Data.data?.receipt_id;

  // 2. Call POST /courier-delivery/receipts AGAIN (Idempotency Test)
  const receipt2Res = await fetch(`${BASE_URL}/courier-delivery/receipts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({
      booking_id: testBooking.booking_id
    })
  });
  const receipt2Data = await receipt2Res.json();
  assert(receipt2Res.status === 200, 'Idempotent receipt call returned 200');
  assert(receipt2Data.data?.receipt_id === testReceiptId, 'Idempotency preserved: receipt_id is identical');
  assert(receipt2Data.data?.receipt_number === receipt1Data.data.receipt_number, 'Idempotency preserved: receipt_number is identical');

  // 3. Fetch receipt by ID
  const getReceiptRes = await fetch(`${BASE_URL}/courier-delivery/receipts/${testReceiptId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const getReceiptData = await getReceiptRes.json();
  assert(getReceiptRes.status === 200, 'GET /receipts/:id returned 200');
  assert(getReceiptData.data?.receipt_id === testReceiptId, 'Receipt ID matched');

  // 4. Fetch receipt by booking ID
  const getBookingReceiptRes = await fetch(`${BASE_URL}/courier-delivery/bookings/${testBooking.booking_id}/receipt`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const getBookingReceiptData = await getBookingReceiptRes.json();
  assert(getBookingReceiptRes.status === 200, 'GET /bookings/:id/receipt returned 200');
  assert(getBookingReceiptData.data?.receipt_id === testReceiptId, 'Booking receipt ID matched');
}

// 7. Verify Relational Persistence in PostgreSQL (All 13 Child Tables)
async function testDatabaseRelationalPersistence() {
  logStage('7. DIRECT DATABASE INSPECTION (VERIFYING 13 RELATIONAL CHILD TABLES)');

  const multiPoint = createdBookings.find(b => b.spec.service_type === 'vault_multipoint').booking;
  const bookingId = multiPoint.booking_id;

  console.log(`Inspecting database records for booking ID: ${bookingId}`);

  // Query parent and all relations
  const dbBooking = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
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
      multipointStops: true,
      payments: true,
      receipts: true
    }
  });

  assert(dbBooking !== null, 'VaultCourierBooking found in database');
  assert(dbBooking.serviceType === 'Vault MultiPoint', 'DB serviceType is Vault MultiPoint');
  assert(dbBooking.pickup !== null, 'Table: courier_booking_pickups record exists');
  assert(dbBooking.pickup.city === 'Bengaluru', 'Pickup city matches Bengaluru');
  assert(dbBooking.delivery !== null, 'Table: courier_booking_deliveries record exists');
  assert(dbBooking.contacts.length >= 2, `Table: courier_booking_contacts has ${dbBooking.contacts.length} records`);
  assert(dbBooking.timings.length >= 2, `Table: courier_booking_timings has ${dbBooking.timings.length} records`);
  assert(dbBooking.item !== null, 'Table: courier_booking_items record exists');
  assert(dbBooking.attachments.length === 1, `Table: courier_booking_attachments has ${dbBooking.attachments.length} attachments`);
  assert(dbBooking.packaging !== null, 'Table: courier_booking_packaging record exists');
  assert(dbBooking.security !== null, 'Table: courier_booking_security record exists');
  assert(dbBooking.verification !== null, 'Table: courier_booking_verification record exists');
  assert(dbBooking.serviceDetails !== null, 'Table: courier_booking_service_details record exists');
  assert(dbBooking.multipointStops.length === 3, `Table: courier_booking_multipoint_stops has ${dbBooking.multipointStops.length} stops`);

  // Check first booking which had payment and receipt
  const firstBooking = createdBookings[0].booking;
  const dbFirstBooking = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id: firstBooking.booking_id }, { bookingNumber: firstBooking.booking_id }] },
    include: {
      payments: true,
      receipts: true
    }
  });
  assert(dbFirstBooking !== null, 'First booking found in database');
  assert(dbFirstBooking.payments.length >= 1, `Table: courier_booking_payments has ${dbFirstBooking.payments.length} records`);
  assert(dbFirstBooking.receipts.length >= 1, `Table: courier_booking_receipts has ${dbFirstBooking.receipts.length} records`);

  // Check sync with legacy table for Admin portal
  const legacySync = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id: firstBooking.booking_id }, { bookingNumber: firstBooking.booking_id }] }
  });
  assert(legacySync !== null, 'Legacy confidential_courier_bookings table synced successfully for Admin Portal');

  console.log('\n🎉 ALL 13 RELATIONAL CHILD TABLES VERIFIED SUCCESSFULLY IN POSTGRESQL!');
}

// Main runner
async function runAllTests() {
  const startTime = Date.now();
  console.log('🚀 STARTING COMPREHENSIVE VAULT COURIER E2E TEST SUITE');

  try {
    await authenticateTestUser();
    await testCreateAllServices();
    await testGetBookings();
    await testBookingUpdates();
    await testPaymentLifecycle();
    await testReceiptLifecycle();
    await testDatabaseRelationalPersistence();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(80));
    console.log(`✅ ALL TESTS PASSED SUCCESSFULLY IN ${elapsed}s!`);
    console.log('='.repeat(80));
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllTests();
