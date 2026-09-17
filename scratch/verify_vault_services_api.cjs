const path = require('path');
const jwt = require(path.resolve(__dirname, '../../Delivery_app_site_backend/node_modules/jsonwebtoken'));
const http = require('http');
const fs = require('fs');

const envFile = fs.readFileSync('../Delivery_app_site_backend/.env', 'utf8');
const match = envFile.match(/JWT_SECRET=([^\r\n]+)/);
const secret = match ? match[1].trim() : 'delivez_jwt_secret_dev_key_12345';

const token = jwt.sign({}, secret, {
  subject: '0017e1f3-9427-4561-9e3f-7c9e771106ab',
  expiresIn: '1h'
});

function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ name, statusCode: res.statusCode, json });
          } catch (e) {
            resolve({ name, statusCode: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', (e) => resolve({ name, error: e.message }));
    req.end();
  });
}

async function run() {
  console.log('=== TESTING ADMIN CONFIDENTIAL BOOKINGS ENDPOINTS ===\n');

  // Test 1: All bookings & counts
  const r1 = await testEndpoint('/api/v1/admin/confidential/bookings', 'All Bookings');
  console.log('Test 1 (All Bookings): HTTP', r1.statusCode);
  console.log('Total bookings in list:', r1.json?.data?.bookings?.length);
  console.log('Service counts:', JSON.stringify(r1.json?.data?.serviceCounts, null, 2));

  if (r1.json?.data?.bookings?.length > 0) {
    console.log('\nSample Bookings with Vault Service Types:');
    r1.json.data.bookings.slice(0, 5).forEach((b, i) => {
      console.log(` ${i + 1}. [${b.vaultId}] ${b.serviceType} | SLA: ${b.vaultServiceTime} | Key: ${b.vaultServiceKey}`);
    });
  }

  // Test 2: Filter by Vault Priority
  const r2 = await testEndpoint('/api/v1/admin/confidential/bookings?serviceType=VAULT_PRIORITY', 'Filter VAULT_PRIORITY');
  console.log('\nTest 2 (Filter VAULT_PRIORITY): HTTP', r2.statusCode, '| Count:', r2.json?.data?.bookings?.length);

  // Test 3: Filter by Vault Precise
  const r3 = await testEndpoint('/api/v1/admin/confidential/bookings?serviceType=VAULT_PRECISE', 'Filter VAULT_PRECISE');
  console.log('Test 3 (Filter VAULT_PRECISE): HTTP', r3.statusCode, '| Count:', r3.json?.data?.bookings?.length);

  // Test 4: Filter by Vault Hand Carry
  const r4 = await testEndpoint('/api/v1/admin/confidential/bookings?serviceType=VAULT_HAND_CARRY', 'Filter VAULT_HAND_CARRY');
  console.log('Test 4 (Filter VAULT_HAND_CARRY): HTTP', r4.statusCode, '| Count:', r4.json?.data?.bookings?.length);

  console.log('\n=== ALL API TESTS COMPLETE ===');
}

run();
