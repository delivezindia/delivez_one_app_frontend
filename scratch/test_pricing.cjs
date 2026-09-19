const { execSync } = require('child_process');
const fs = require('fs');

const tsCode = `
import { calculateLuggageMasterQuote } from './src/modules/luggage-delivery/luggage-delivery-pricing.js';

const res = calculateLuggageMasterQuote({
  service: { service_id: 'home_airport' },
  route: { route_type: 'single_trip' },
  luggage: {
    total_pieces: 2,
    total_weight_kg: 32,
    items: [{ quantity: 2, total_weight_kg: 32, size: 'large' }],
  },
  add_ons: {
    selected_items: [
      { code: 'secure_luggage_tag', quantity: 2 },
      { code: 'tamper_proof_seal', quantity: 2 },
      { code: 'photo_proof_delivery', quantity: 1 },
    ],
  },
  promo: { coupon_code: 'DELIVEZ10', apply_coupon: true },
});

console.log('--- PRICING RESULT ---');
console.log(JSON.stringify(res.pricing, null, 2));
`;

fs.writeFileSync('C:/Users/Rax/Desktop/Delivery_app_site_backend/test_pricing_tmp.ts', tsCode, 'utf8');

try {
  const out = execSync('npx tsx test_pricing_tmp.ts', {
    cwd: 'C:/Users/Rax/Desktop/Delivery_app_site_backend',
    encoding: 'utf8',
  });
  console.log(out);
} finally {
  try {
    fs.unlinkSync('C:/Users/Rax/Desktop/Delivery_app_site_backend/test_pricing_tmp.ts');
  } catch {}
}
