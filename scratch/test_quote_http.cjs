const http = require('http');

async function post(path, body) {
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buf) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: buf });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- TEST 1: POST /api/v1/luggage-delivery/bookings/quote (home_airport) ---');
  const quoteReq = {
    service_type: 'home_airport',
    pickup: {
      location_type: 'home',
      full_address: 'Flat 402, Sunrise Heights, Indiranagar, Bengaluru',
      city: 'Bengaluru',
      pincode: '560038'
    },
    delivery: {
      location_type: 'airport',
      full_address: 'Kempegowda International Airport, Terminal 1, Devanahalli, Bengaluru',
      city: 'Bengaluru',
      pincode: '560300'
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
        type: 'large',
        quantity: 2,
        weight_kg: 23,
        size: 'large',
        is_fragile: false
      }
    ],
    schedule: {
      pickup_time: '2026-09-19T13:00:00.000Z',
      delivery_speed: {
        type: 'standard',
        label: 'Standard (3-4 hrs)'
      }
    },
    add_ons: [
      {
        code: 'secure_luggage_tag',
        title: 'Tamper-evident luggage tag',
        price: 29
      }
    ],
    protections: [
      {
        id: 'tamper_tag',
        title: 'Tamper-proof Tag',
        price: 99
      }
    ],
    airport_assistance: [
      {
        id: 'meet_assist',
        title: 'Meet & Assist',
        price: 499
      }
    ],
    applied_coupon: {
      code: 'DELIVEZ10'
    }
  };

  const res1 = await post('/api/v1/luggage-delivery/bookings/quote', quoteReq);
  console.log('Quote status:', res1.status);
  console.log('Pricing output:', JSON.stringify(res1.data?.data?.pricing || res1.data, null, 2));

  console.log('\n--- TEST 2: POST /api/v1/luggage-delivery/bookings/validate-coupon ---');
  const res2 = await post('/api/v1/luggage-delivery/bookings/validate-coupon', {
    coupon_code: 'DELIVEZ10',
    service_type: 'home_airport',
    luggage_items: quoteReq.luggage_items,
    schedule: quoteReq.schedule,
    add_ons: quoteReq.add_ons,
    protections: quoteReq.protections,
    airport_assistance: quoteReq.airport_assistance
  });
  console.log('Coupon status:', res2.status);
  console.log('Coupon result:', JSON.stringify(res2.data, null, 2));
}

run().catch(console.error);
