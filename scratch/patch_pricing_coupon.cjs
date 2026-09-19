const fs = require('fs');

// Patch luggage-delivery-pricing.ts
const pricingPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery-pricing.ts';
let pricing = fs.readFileSync(pricingPath, 'utf8');

pricing = pricing.replace(
  `  const rawAddons = input.add_ons?.selected_items || input.selectedAddOns || [];`,
  `  const rawAddons = input.add_ons?.selected_items || (Array.isArray(input.add_ons) ? input.add_ons : []) || input.selectedAddOns || [];`
);

pricing = pricing.replace(
  `  const rawProtections = input.luggage_protection?.selected_items || input.selectedProtections || [];`,
  `  const rawProtections = input.luggage_protection?.selected_items || (Array.isArray(input.luggage_protection) ? input.luggage_protection : []) || (Array.isArray(input.protections) ? input.protections : []) || input.selectedProtections || [];`
);

pricing = pricing.replace(
  `  const rawAssistance = input.airport_assistance?.selected_services || input.selectedAirportAssistance || [];`,
  `  const rawAssistance = input.airport_assistance?.selected_services || (Array.isArray(input.airport_assistance) ? input.airport_assistance : []) || (Array.isArray(input.airportAssistance) ? input.airportAssistance : []) || input.selectedAirportAssistance || [];`
);

pricing = pricing.replace(
  `  const couponCode = input.promo?.coupon_code || input.couponCode || null;`,
  `  const couponCode = input.applied_coupon?.code || input.promo?.coupon_code || input.coupon_code || input.couponCode || null;`
);

fs.writeFileSync(pricingPath, pricing, 'utf8');

// Patch luggage-delivery.controller.ts for validateCouponHandler
const ctrlPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

const targetCouponExtraction = `  const code = (req.body?.coupon_code || req.body?.couponCode || req.body?.code || '').toString().trim().toUpperCase();
  const subtotal = Number(req.body?.subtotal || 0);`;

const replacementCouponExtraction = `  const code = (req.body?.coupon_code || req.body?.couponCode || req.body?.code || '').toString().trim().toUpperCase();
  let subtotal = Number(req.body?.subtotal || 0);
  if (subtotal <= 0) {
    // If not passed explicitly, calculate from quote
    try {
      const quote = calculateLuggageMasterQuote(req.body);
      subtotal = quote.subtotal;
    } catch {
      subtotal = 0;
    }
  }`;

ctrl = ctrl.replace(targetCouponExtraction, replacementCouponExtraction);
fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Successfully patched pricing and coupon extraction.');
