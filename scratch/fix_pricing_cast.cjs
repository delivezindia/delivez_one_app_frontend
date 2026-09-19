const fs = require('fs');

const pricingPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery-pricing.ts';
let pricing = fs.readFileSync(pricingPath, 'utf8');

pricing = pricing.replace(
  `  const rawAddons = input.add_ons?.selected_items || (Array.isArray(input.add_ons) ? input.add_ons : []) || input.selectedAddOns || [];`,
  `  const rawAddons = (input.add_ons as any)?.selected_items || (Array.isArray(input.add_ons) ? input.add_ons : []) || input.selectedAddOns || [];`
);

pricing = pricing.replace(
  `  const isProtEnabled = input.luggage_protection?.enabled !== false;
  const rawProtections = input.luggage_protection?.selected_items || (Array.isArray(input.luggage_protection) ? input.luggage_protection : []) || (Array.isArray(input.protections) ? input.protections : []) || input.selectedProtections || [];`,
  `  const isProtEnabled = (input.luggage_protection as any)?.enabled !== false;
  const rawProtections = (input.luggage_protection as any)?.selected_items || (Array.isArray(input.luggage_protection) ? input.luggage_protection : []) || (Array.isArray(input.protections) ? input.protections : []) || input.selectedProtections || [];`
);

pricing = pricing.replace(
  `  const isAssistEnabled = input.airport_assistance?.enabled !== false;
  const rawAssistance = input.airport_assistance?.selected_services || (Array.isArray(input.airport_assistance) ? input.airport_assistance : []) || (Array.isArray(input.airportAssistance) ? input.airportAssistance : []) || input.selectedAirportAssistance || [];`,
  `  const isAssistEnabled = (input.airport_assistance as any)?.enabled !== false;
  const rawAssistance = (input.airport_assistance as any)?.selected_services || (Array.isArray(input.airport_assistance) ? input.airport_assistance : []) || (Array.isArray(input.airportAssistance) ? input.airportAssistance : []) || input.selectedAirportAssistance || [];`
);

fs.writeFileSync(pricingPath, pricing, 'utf8');
console.log('Successfully updated casting in luggage-delivery-pricing.ts');
