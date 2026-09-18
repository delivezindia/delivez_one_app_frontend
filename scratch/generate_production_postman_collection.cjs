const fs = require('fs');
const path = require('path');

console.log('>>> Building Production Postman Collection...');

const templateFile = path.join('C:/Users/Rax/Desktop/asdfghjkl/Delivez_Vault_Unified_API.postman_collection.json');
const baseColl = JSON.parse(fs.readFileSync(templateFile, 'utf8'));

// 1. Configure Production Metadata & Variables
baseColl.info = {
  name: 'Delivez - Confidential Delivery (Vault) - Production',
  _postman_id: 'delivez-vault-production-unified-2026',
  description: 'PRODUCTION POSTMAN COLLECTION for Delivez Confidential Courier / Vault Module.\n\nStrictly implements the unified 8-step canonical contract with zero separate APIs required across all 9 services.\n\nPre-configured for Production Server:\n- Base URL: http://40.81.244.167:3012/api/v1 (or https://api.delivez.com/api/v1)\n- Pre-loaded Credentials & Self-Contained Collection Variables: Can be imported and run immediately without an external environment file.\n- Auto-Variables: Login and booking creation automatically store tokens, booking IDs, payment IDs, and receipt IDs.\n- Includes 6 Folders:\n  0. Schema Discovery & Form Templates (No separate APIs needed)\n  1. Authentication (OTP & Password login)\n  2. Create Bookings (All 9 Canonical Services: Secure, Priority, Direct, Precise, Hand Carry, Return, Exchange, Critical, MultiPoint)\n  3. Booking Retrieval & Lifecycle Management\n  4. Payments API\n  5. Receipts API',
  schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
};

baseColl.variable = [
  {
    key: 'baseUrl',
    value: 'http://40.81.244.167:3012/api/v1',
    type: 'string'
  },
  {
    key: 'userMobile',
    value: '9876543210',
    type: 'string'
  },
  {
    key: 'countryCode',
    value: '+91',
    type: 'string'
  },
  {
    key: 'userPassword',
    value: 'Customer@1234',
    type: 'string'
  },
  {
    key: 'challengeId',
    value: '',
    type: 'string'
  },
  {
    key: 'token',
    value: '',
    type: 'string'
  },
  {
    key: 'accessToken',
    value: '',
    type: 'string'
  },
  {
    key: 'bookingId',
    value: 'CV-260918-BDD9',
    type: 'string'
  },
  {
    key: 'paymentId',
    value: '',
    type: 'string'
  },
  {
    key: 'receiptId',
    value: '',
    type: 'string'
  }
];

// Add password login request to Authentication folder for production flexibility
const authFolder = baseColl.item.find(i => i.name.includes('Authentication'));
if (authFolder) {
  const passwordLoginRequest = {
    name: '3. Password Login (POST /auth/login-password)',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json', type: 'text' }
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify({
          mobileNumber: '{{userMobile}}',
          countryCode: '{{countryCode}}',
          password: '{{userPassword}}'
        }, null, 2),
        options: { raw: { language: 'json' } }
      },
      url: {
        raw: '{{baseUrl}}/auth/login-password',
        host: ['{{baseUrl}}'],
        path: ['auth', 'login-password']
      },
      description: 'Alternative password-based customer authentication for production environments.'
    },
    event: [
      {
        listen: 'test',
        script: {
          exec: [
            'const json = pm.response.json();',
            'if (pm.response.code === 200 || pm.response.code === 201) {',
            '    const t = (json.data && (json.data.accessToken || json.data.token)) || json.accessToken;',
            '    if (t) {',
            '        pm.collectionVariables.set("token", t);',
            '        pm.collectionVariables.set("accessToken", t);',
            '        pm.environment.set("token", t);',
            '        pm.environment.set("accessToken", t);',
            '    }',
            '}'
          ],
          type: 'text/javascript'
        }
      }
    ],
    response: []
  };

  if (!authFolder.item.some(i => i.name.includes('Password Login'))) {
    authFolder.item.push(passwordLoginRequest);
  }
}

// Enhance test scripts in all requests to set both pm.collectionVariables and pm.environment
function updateScriptsRecursively(items) {
  for (const it of items) {
    if (it.item) {
      updateScriptsRecursively(it.item);
    } else if (it.event) {
      for (const ev of it.event) {
        if (ev.listen === 'test' && ev.script?.exec) {
          const lines = ev.script.exec;
          const newLines = [];
          for (const line of lines) {
            newLines.push(line);
            if (line.includes('pm.environment.set("bookingId"')) {
              newLines.push('    pm.collectionVariables.set("bookingId", b.booking_id || b.id);');
            } else if (line.includes('pm.environment.set("paymentId"')) {
              newLines.push('    pm.collectionVariables.set("paymentId", p.payment_id || p.id);');
            } else if (line.includes('pm.environment.set("receiptId"')) {
              newLines.push('    pm.collectionVariables.set("receiptId", r.receipt_id || r.id);');
            } else if (line.includes('pm.environment.set("accessToken"')) {
              newLines.push('    pm.collectionVariables.set("accessToken", json.data.accessToken);');
              newLines.push('    pm.collectionVariables.set("token", json.data.accessToken);');
            }
          }
          ev.script.exec = newLines;
        }
      }
    }
  }
}

updateScriptsRecursively(baseColl.item);

// Target file locations
const targets = [
  'c:/Users/Rax/Desktop/Delivery_app_web/postman/Delivez-Confidential-Delivery-Production.postman_collection.json',
  'c:/Users/Rax/Desktop/Delivery_app_web/postman/Delivez_Vault_Unified_API_Production.postman_collection.json',
  'C:/Users/Rax/Desktop/asdfghjkl/Delivez-Confidential-Delivery-Production.postman_collection.json',
  'C:/Users/Rax/Desktop/asdfghjkl/Delivez_Vault_Unified_API_Production.postman_collection.json'
];

for (const t of targets) {
  fs.writeFileSync(t, JSON.stringify(baseColl, null, 2), 'utf8');
  console.log('✓ Successfully wrote production collection to:', t);
}

console.log('🎉 Production Postman collection created and deployed to all locations!');
