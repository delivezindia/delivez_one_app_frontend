const http = require('http');
const jwt = require('C:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/jsonwebtoken');

const JWT_SECRET = 'development-jwt-secret-with-at-least-32-characters';
const USER_ID = '8d6804b0-44db-4f17-b032-c7ddaaeb3cf1';

const token = jwt.sign({}, JWT_SECRET, {
  subject: USER_ID,
  expiresIn: '7d',
});

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1' + path,
      method: method,
      headers: reqHeaders,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error('❌ ASSERTION FAILED:', message);
    throw new Error(message);
  }
  console.log('  ✓', message);
}

async function runSuite() {
  console.log('================================================================');
  console.log('  DELIVEZ LUGGAGE DELIVERY MASTER CONTRACT VERIFICATION SUITE   ');
  console.log('================================================================\n');

  // TEST 1: GET /options
  console.log('TEST 1: GET /luggage-delivery/options');
  const optRes = await request('GET', '/luggage-delivery/options');
  assert(optRes.status === 200, 'Options returns HTTP 200');
  const options = optRes.data.data;
  assert(Array.isArray(options.services), 'Options has services list');
  assert(options.services.length >= 7, 'Options covers all 7 service types');
  
  const expectedServiceIds = [
    'home_airport', 'airport_home', 'hotel_airport',
    'airport_hotel', 'hotel_home', 'home_hotel', 'multi_stop'
  ];
  for (const sId of expectedServiceIds) {
    assert(options.services.some(s => s.id === sId), `Service ${sId} is registered`);
  }
  assert(Array.isArray(options.addOns), 'Add-ons catalog is returned');
  assert(options.addOns.some(a => a.code === 'secure_luggage_tag' && a.id !== undefined), 'Add-on has both id and code');
  assert(Array.isArray(options.protections), 'Protections catalog is returned');
  assert(Array.isArray(options.airportAssistance), 'Airport assistance catalog is returned');
  assert(Array.isArray(options.timelineMilestones) && options.timelineMilestones.length === 10, 'Timeline milestones has all 10 stages');

  // TEST 2: POST /bookings/quote for all 7 service types
  console.log('\nTEST 2: POST /luggage-delivery/bookings/quote across all 7 service types');
  for (const serviceId of expectedServiceIds) {
    const qPayload = {
      service_type: serviceId,
      pickup: {
        location_type: serviceId.includes('airport') && !serviceId.startsWith('home') && !serviceId.startsWith('hotel') ? 'airport' : 'home',
        full_address: '12th Main Road, Indiranagar, Bengaluru',
        city: 'Bengaluru',
        pincode: '560038'
      },
      delivery: {
        location_type: serviceId.includes('airport') ? 'airport' : 'hotel',
        full_address: 'Kempegowda International Airport Terminal 1',
        city: 'Bengaluru',
        pincode: '560300'
      },
      luggage_items: [
        { bag_type: 'large', quantity: 1, declared_weight_kg: 23, dimensions: { length_cm: 75, width_cm: 50, height_cm: 30 } },
        { bag_type: 'medium', quantity: 1, declared_weight_kg: 15, dimensions: { length_cm: 65, width_cm: 42, height_cm: 26 } }
      ],
      schedule: {
        pickup_time: new Date().toISOString(),
        delivery_speed: { type: 'standard' }
      },
      distance_km: 25
    };

    if (serviceId === 'multi_stop') {
      qPayload.multi_stops = [
        { stop_number: 1, location_type: 'home', full_address: 'Indiranagar', action: 'pickup' },
        { stop_number: 2, location_type: 'hotel', full_address: 'MG Road Hotel', action: 'drop' },
        { stop_number: 3, location_type: 'airport', full_address: 'KIA Airport T1', action: 'drop' }
      ];
    }

    const qRes = await request('POST', '/luggage-delivery/bookings/quote', qPayload);
    assert(qRes.status === 200, `Quote for ${serviceId} returns HTTP 200`);
    const pricing = qRes.data.data?.pricing;
    assert(pricing !== undefined, `Pricing envelope present for ${serviceId}`);
    assert(pricing.base_fare > 0, `Base fare > 0 (${pricing.base_fare})`);
    assert(pricing.total_amount > 0, `Total amount > 0 (${pricing.total_amount})`);
    assert(pricing.tax && pricing.tax.total_tax > 0, `18% GST calculated (${pricing.tax.total_tax})`);
    if (serviceId.includes('airport')) {
      assert(pricing.airport_handling_fee === 50, `Airport handling fee ₹50 applied for ${serviceId}`);
    }
    if (serviceId.includes('hotel')) {
      assert(pricing.hotel_handling_fee === 50, `Hotel handling fee ₹50 applied for ${serviceId}`);
    }
  }

  // TEST 3: POST /bookings/validate-coupon
  console.log('\nTEST 3: POST /luggage-delivery/bookings/validate-coupon');
  const c1 = await request('POST', '/luggage-delivery/bookings/validate-coupon', {
    coupon_code: 'DELIVEZ10',
    subtotal: 1200
  });
  assert(c1.status === 200 && c1.data.data.valid === true, 'DELIVEZ10 is valid');
  assert(c1.data.data.discount_amount === 120, 'DELIVEZ10 applied 10% discount (₹120)');
  assert(c1.data.data.new_subtotal === 1080, 'New subtotal ₹1080');
  assert(c1.data.data.new_tax === 194.4, 'New 18% GST ₹194.40');
  assert(c1.data.data.new_total === 1274.4, 'New total ₹1274.40');

  const c2 = await request('POST', '/luggage-delivery/bookings/validate-coupon', {
    coupon_code: 'WELCOME50',
    subtotal: 600
  });
  assert(c2.status === 200 && c2.data.data.valid === true, 'WELCOME50 is valid');
  assert(c2.data.data.discount_amount === 50, 'WELCOME50 applied ₹50 flat discount');

  const c3 = await request('POST', '/luggage-delivery/bookings/validate-coupon', {
    coupon_code: 'AIRPORT100',
    subtotal: 1000
  });
  assert(c3.status === 200 && c3.data.data.valid === true, 'AIRPORT100 is valid');
  assert(c3.data.data.discount_amount === 100, 'AIRPORT100 applied ₹100 flat discount');

  const cInvalid = await request('POST', '/luggage-delivery/bookings/validate-coupon', {
    coupon_code: 'NONEXISTENT_CODE',
    subtotal: 1000
  });
  assert(cInvalid.data.data.valid === false, 'Invalid coupon correctly rejected');

  // TEST 4: POST /bookings - Master Booking Creation with Idempotency
  console.log('\nTEST 4: POST /luggage-delivery/bookings (Master Booking Contract Creation)');
  const clientRequestId = 'test_req_' + Date.now();
  const masterPayload = {
    api_version: '1.0',
    client_request_id: clientRequestId,
    payment_method: 'UPI',
    service: {
      service_id: 'home_airport'
    },
    route: {
      route_type: 'single_trip'
    },
    pickup: {
      location_type: 'home',
      full_address: 'Flat 402, Sunrise Heights, Indiranagar, Bengaluru',
      landmark: 'Near Metro Pillar 104',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      contact: {
        full_name: 'Rahul Sharma',
        mobile: '+919876543210',
        email: 'rahul.sharma@example.com'
      }
    },
    delivery: {
      location_type: 'airport',
      full_address: 'Kempegowda International Airport, Terminal 1 Departure Ramp, Devanahalli',
      landmark: 'Near Pillar 4 Departure Gate',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560300',
      contact: {
        full_name: 'Rahul Sharma',
        mobile: '+919876543210',
        email: 'rahul.sharma@example.com'
      },
      airport_specific: {
        terminal: 'T1',
        departure_time: '2026-09-19T18:30:00.000Z',
        flight_number: '6E-2041',
        pnr: 'AB12CD',
        airline_name: 'IndiGo',
        gate_number: 'Gate 4',
        meeting_point: 'Departure Pillar 4'
      }
    },
    flight_details: {
      airline_name: 'IndiGo',
      flight_number: '6E-2041',
      pnr: 'AB12CD',
      departure_time: '2026-09-19T18:30:00.000Z',
      terminal: 'T1'
    },
    luggage_items: [
      {
        item_id: 'item_1',
        bag_type: 'large',
        quantity: 1,
        declared_weight_kg: 23,
        dimensions: { length_cm: 75, width_cm: 50, height_cm: 32 },
        is_fragile: false,
        is_valuable: false,
        description: 'Navy blue Samsonite hard trolley'
      },
      {
        item_id: 'item_2',
        bag_type: 'medium',
        quantity: 1,
        declared_weight_kg: 15,
        dimensions: { length_cm: 65, width_cm: 42, height_cm: 26 },
        is_fragile: true,
        is_valuable: true,
        description: 'Delsey brown spinner'
      }
    ],
    schedule: {
      pickup_type: 'scheduled',
      pickup_time: '2026-09-19T13:00:00.000Z',
      delivery_speed: {
        type: 'standard',
        label: 'Standard (3-4 hrs)'
      }
    },
    luggage_protection: {
      enabled: true,
      selected_items: [
        { id: 'tamper_tag', title: 'Tamper-proof Tag', price: 99 }
      ]
    },
    airport_assistance: {
      enabled: true,
      selected_services: [
        { id: 'meet_assist', title: 'Meet & Assist', price: 499 }
      ]
    },
    add_ons: {
      selected_items: [
        { code: 'secure_luggage_tag', title: 'Tamper-evident luggage tag', price: 29 },
        { code: 'photo_proof_delivery', title: 'Photo proof of delivery', price: 19 }
      ]
    },
    applied_coupon: {
      code: 'DELIVEZ10'
    },
    gst_invoice: {
      required: true,
      company_name: 'TechCorp Global Solutions Pvt Ltd',
      gstin: '29ABCDE1234F1Z5',
      billing_address: 'Embassy TechVillage, Bellandur, Bengaluru',
      state_code: '29'
    },
    special_instructions: 'Please call 15 minutes before reaching Indiranagar residence.'
  };

  const bRes = await request('POST', '/luggage-delivery/bookings', masterPayload, {
    'Authorization': `Bearer ${token}`,
    'Idempotency-Key': clientRequestId
  });
  assert(bRes.status === 201 || bRes.status === 200, 'Create booking returns HTTP 201/200');
  const bData = bRes.data.data?.booking || bRes.data.data;
  assert(bData.api_version === '1.0', 'Booking has api_version: 1.0');
  assert(bData.client_request_id === clientRequestId, 'Client request ID matches');
  assert(bData.booking_number && bData.booking_number.startsWith('DLVZ'), `Valid booking number: ${bData.booking_number}`);
  assert(bData.status === 'CREATED' || bData.status === 'PENDING' || bData.status === 'BOOKING_CONFIRMED', `Booking status: ${bData.status}`);
  assert(bData.customer && bData.customer.customer_id, 'Customer envelope present');
  assert(bData.pickup && bData.pickup.pincode === '560038', 'Pickup address point verified');
  assert(bData.delivery && bData.delivery.airport_specific?.flight_number === '6E-2041', 'Delivery airport specs verified');
  assert(Array.isArray(bData.luggage_items) && bData.luggage_items.length === 2, 'Luggage items verified');
  assert(bData.pricing && bData.pricing.subtotal > 0, `Pricing subtotal: ₹${bData.pricing.subtotal}`);
  assert(bData.pricing.tax && bData.pricing.tax.total_tax > 0, `Tax breakdown: ₹${bData.pricing.tax.total_tax}`);
  assert(bData.pricing.discount && bData.pricing.discount.coupon_code === 'DELIVEZ10', 'Coupon discount verified');
  assert(bData.gst_invoice && bData.gst_invoice.gstin === '29ABCDE1234F1Z5', 'GST invoice details saved');
  assert(Array.isArray(bData.timeline) && bData.timeline.length === 10, 'Timeline milestones complete (10)');

  const bookingId = bData.booking_id;
  const bookingNumber = bData.booking_number;

  // TEST 5: Idempotency Verification
  console.log('\nTEST 5: Idempotency Enforcement');
  const bRes2 = await request('POST', '/luggage-delivery/bookings', masterPayload, {
    'Authorization': `Bearer ${token}`,
    'Idempotency-Key': clientRequestId
  });
  const bData2 = bRes2.data.data?.booking || bRes2.data.data;
  assert(bData2.booking_id === bookingId, 'Idempotent request returned exact same booking ID');
  assert(bData2.booking_number === bookingNumber, 'Idempotent request returned exact same booking number');

  // TEST 6: GET /bookings/:id (Master Contract JSON Details)
  console.log('\nTEST 6: GET /luggage-delivery/bookings/:id');
  const detRes = await request('GET', `/luggage-delivery/bookings/${bookingId}`, null, {
    'Authorization': `Bearer ${token}`
  });
  assert(detRes.status === 200, 'Details returns HTTP 200');
  const detBooking = detRes.data.data?.booking || detRes.data.data;
  assert(detBooking.booking_id === bookingId, 'Details returned matching booking');
  assert(detBooking.api_version === '1.0', 'Details returns Master Contract JSON');

  // TEST 7: POST /payments/create (Gateway Order Creation)
  console.log('\nTEST 7: POST /luggage-delivery/payments/create');
  const payCreateRes = await request('POST', '/luggage-delivery/payments/create', {
    booking_id: bookingId,
    gateway: 'razorpay',
    payment_method: 'upi'
  }, {
    'Authorization': `Bearer ${token}`
  });
  assert(payCreateRes.status === 200, 'Create payment returns HTTP 200');
  const payData = payCreateRes.data.data;
  assert(payData.order_id && payData.order_id.startsWith('order_'), `Payment order ID: ${payData.order_id}`);
  assert(payData.amount > 0, `Payment amount: ₹${payData.amount}`);

  // TEST 8: POST /payments/verify (Payment Signature Verification)
  console.log('\nTEST 8: POST /luggage-delivery/payments/verify');
  const payVerifyRes = await request('POST', '/luggage-delivery/payments/verify', {
    booking_id: bookingId,
    gateway: 'razorpay',
    payment_id: 'pay_test_' + Date.now(),
    order_id: payData.order_id,
    signature: 'sig_valid_hash'
  }, {
    'Authorization': `Bearer ${token}`
  });
  assert(payVerifyRes.status === 200, 'Verify payment returns HTTP 200');
  assert(payVerifyRes.data.data.booking_status === 'CONFIRMED' || payVerifyRes.data.data.booking_status === 'BOOKING_CONFIRMED', 'Booking transitioned to CONFIRMED');
  assert(payVerifyRes.data.data.payment_status === 'completed' || payVerifyRes.data.data.payment_status === 'paid', 'Payment status is completed/paid');

  // TEST 9: GET /bookings/:id/receipt (GST Invoice & Receipt)
  console.log('\nTEST 9: GET /luggage-delivery/bookings/:id/receipt');
  const recRes = await request('GET', `/luggage-delivery/bookings/${bookingId}/receipt`, null, {
    'Authorization': `Bearer ${token}`
  });
  assert(recRes.status === 200, 'Receipt returns HTTP 200');
  const receipt = recRes.data.data?.receipt || recRes.data.data;
  assert(receipt.receipt_id?.startsWith('REC-') || receipt.receipt_number?.startsWith('RCPT-'), `Receipt identifier: ${receipt.receipt_id || receipt.receipt_number}`);
  assert(receipt.invoice_number && receipt.invoice_number.startsWith('INV-'), `Invoice number: ${receipt.invoice_number}`);
  assert(receipt.tax_breakdown && receipt.tax_breakdown.total_tax > 0, 'Tax breakdown in receipt');
  assert(receipt.billing_to?.company_name === 'TechCorp Global Solutions Pvt Ltd', 'Billed to company name matches');
  assert(receipt.billing_to?.gstin === '29ABCDE1234F1Z5', 'Billed to GSTIN matches');

  // TEST 10: GET /tracking/:trackingId (Live Tracking & Milestones)
  console.log('\nTEST 10: GET /luggage-delivery/tracking/:trackingId');
  const trkRes = await request('GET', `/luggage-delivery/tracking/${bookingNumber}`);
  assert(trkRes.status === 200, 'Tracking returns HTTP 200');
  const tracking = trkRes.data.data?.tracking || trkRes.data.data;
  assert(tracking.booking_number === bookingNumber, 'Tracking matches booking number');
  assert(Array.isArray(tracking.milestones) && tracking.milestones.length === 10, 'Tracking has all 10 milestones');
  assert(tracking.current_milestone_step >= 1, `Current milestone step: ${tracking.current_milestone_step}`);
  assert(tracking.security_status?.seal_intact !== undefined, 'Security status verified');

  console.log('\n================================================================');
  console.log('  🎉 ALL 10 E2E VERIFICATION TESTS PASSED SUCCESSFULLY!         ');
  console.log('================================================================');
}

runSuite().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
