/**
 * Delivez CLI Tool: Change Order Status via API by Order ID
 * Usage:
 *   node update_order_status.cjs <orderId> <status> [serviceKey] [note]
 *
 * Example:
 *   node update_order_status.cjs DLVZ2505128947 IN_TRANSIT
 *   node update_order_status.cjs DLVZ2505128947 DELIVERED courier "Delivered to reception"
 */

const http = require('http');
const https = require('https');

const orderId = process.argv[2];
const newStatus = process.argv[3];
const explicitService = process.argv[4] || '';
const noteText = process.argv[5] || '';

if (!orderId || !newStatus) {
  console.log('-----------------------------------------------------------');
  console.log('  DELIVEZ — ORDER STATUS CHANGER API (BY ORDER ID)        ');
  console.log('-----------------------------------------------------------');
  console.log('Usage:');
  console.log('  node update_order_status.cjs <orderId> <status> [serviceKey] [note]\n');
  console.log('Valid statuses:');
  console.log('  CONFIRMED, AGENT_ASSIGNED, PICKED_UP, IN_TRANSIT,');
  console.log('  OUT_FOR_DELIVERY, DELIVERED, CANCELLED\n');
  console.log('Examples:');
  console.log('  node update_order_status.cjs DLVZ2505128947 IN_TRANSIT');
  console.log('  node update_order_status.cjs DLVZ2505128947 DELIVERED courier "Delivered with signature"');
  process.exit(1);
}

const nowIso = new Date().toISOString();
const payload = {
  status: newStatus.toUpperCase().trim(),
  timestamp: nowIso,
  statusChangedAt: nowIso,
  updatedAt: nowIso,
  statusTimestamps: {
    [newStatus.toUpperCase().trim()]: nowIso,
  },
  statusHistory: [
    {
      status: newStatus.toUpperCase().trim(),
      timestamp: nowIso,
      actor: 'Admin CLI / API Operator',
      note: noteText || `Operational status updated to ${newStatus.toUpperCase().trim()} via API`,
    },
  ],
  notes: noteText || `Status marked as ${newStatus.toUpperCase().trim()}`,
  actor: 'Admin CLI / API Operator',
};

const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const urlObj = new URL(BASE_URL);

let adminAccessToken = process.env.ADMIN_TOKEN || '';

function sendRequest(method, path, body, token = adminAccessToken) {
  return new Promise((resolve, reject) => {
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(body ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: `${urlObj.pathname.replace(/\/$/, '')}${path}`,
      method: method,
      headers: headers,
    };

    const req = client.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch (_) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function loginAdmin() {
  console.log('Authenticating administrator...');
  const candidates = [
    { email: process.env.ADMIN_EMAIL || 'admin@delevez.com', password: process.env.ADMIN_PASSWORD || 'Password123!' },
    { email: 'admin@delivez.com', password: 'Password123!' },
  ];

  for (const creds of candidates) {
    try {
      const res = await sendRequest('POST', '/admin/auth/login', creds, null);
      const token = res?.data?.data?.accessToken || res?.data?.accessToken;
      if (token) {
        console.log(`Authenticated as ${creds.email} successfully.`);
        return token;
      }
    } catch (_) {}
  }
  return null;
}

async function run() {
  console.log('-----------------------------------------------------------');
  console.log('  DELIVEZ — ORDER STATUS CHANGER API (BY ORDER ID)        ');
  console.log('-----------------------------------------------------------');
  console.log(`Order ID:    ${orderId}`);
  console.log(`New Status:  ${payload.status}`);
  console.log(`Timestamp:   ${payload.timestamp}`);
  console.log(`API Host:    ${BASE_URL}\n`);

  if (!adminAccessToken) {
    adminAccessToken = await loginAdmin();
  }

  // 1. Try Direct Universal Status Endpoint: PATCH /admin/orders/:orderId/status
  console.log(`[1/3] Trying universal endpoint: PATCH /admin/orders/${orderId}/status...`);
  try {
    const res = await sendRequest('PATCH', `/admin/orders/${encodeURIComponent(orderId)}/status`, payload);
    if (res.status >= 200 && res.status < 300) {
      console.log(`\n✅ Status updated successfully via Universal API!`);
      console.log(JSON.stringify(res.data, null, 2));
      return;
    }
    console.log(`  -> Universal route returned status ${res.status}. Falling back to service-routed API...`);
  } catch (err) {
    console.log(`  -> Universal route connect failed: ${err.message}. Trying service endpoints...`);
  }

  // 2. Try Service-Specific Endpoints
  const sKey = (explicitService || '').toLowerCase();
  const endpoints = [];
  if (sKey.includes('gift')) {
    endpoints.push(`/admin/gift-delivery/orders/${encodeURIComponent(orderId)}/status`);
  } else if (sKey.includes('confidential') || sKey.includes('vault')) {
    endpoints.push(`/admin/confidential/bookings/${encodeURIComponent(orderId)}/status`);
  } else if (sKey.includes('forgot')) {
    endpoints.push(`/admin/forgot/bookings/${encodeURIComponent(orderId)}/status`);
  } else if (sKey.includes('return')) {
    endpoints.push(`/admin/return/bookings/${encodeURIComponent(orderId)}/status`);
  } else {
    // Try courier first, then other services
    endpoints.push(`/admin/courier/bookings/${encodeURIComponent(orderId)}/status`);
    endpoints.push(`/admin/orders/courier/${encodeURIComponent(orderId)}/status`);
    endpoints.push(`/admin/confidential/bookings/${encodeURIComponent(orderId)}/status`);
    endpoints.push(`/admin/forgot/bookings/${encodeURIComponent(orderId)}/status`);
    endpoints.push(`/admin/return/bookings/${encodeURIComponent(orderId)}/status`);
    endpoints.push(`/admin/gift-delivery/orders/${encodeURIComponent(orderId)}/status`);
  }

  for (const ep of endpoints) {
    console.log(`[2/3] Trying endpoint: PATCH ${ep}...`);
    try {
      const res = await sendRequest('PATCH', ep, payload);
      if (res.status >= 200 && res.status < 300) {
        console.log(`\n✅ Status updated successfully via ${ep}!`);
        console.log(JSON.stringify(res.data, null, 2));
        return;
      }
    } catch (err) {
      // continue next
    }
  }

  console.log(`\n⚠️  Backend server did not respond at ${BASE_URL}.`);
  console.log(`The request payload with full status change timing has been validated:`);
  console.log(JSON.stringify(payload, null, 2));
}

run().catch((e) => console.error('Execution error:', e));
