const fs = require('fs');
const path = require('path');

const configPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery-config.ts';
let content = fs.readFileSync(configPath, 'utf8');

// Replace LuggageAddonItem interface to include code
content = content.replace(
  `export interface LuggageAddonItem {\n  id: string;\n  title: string;\n  price: number;\n  description: string;\n  category: string;\n}`,
  `export interface LuggageAddonItem {\n  id: string | number;\n  code?: string;\n  title: string;\n  price: number;\n  description: string;\n  category: string;\n  popular?: boolean;\n}`
);

// Replace luggageAddOns list with code mapping
const newAddonsList = `export const luggageAddOns: LuggageAddonItem[] = [
  { id: 1, code: 'secure_luggage_tag', title: 'Secure luggage tag', price: 29, description: 'Durable serialized barcode tag attached to handle', category: 'Security', popular: true },
  { id: 2, code: 'tamper_proof_seal', title: 'Tamper-proof seal', price: 29, description: 'Numbered zip-tie tamper seal preventing zipper opening', category: 'Security', popular: true },
  { id: 3, code: 'wrapping', title: 'Wrapping / protective cover', price: 49, description: 'Protective shrink-wrap film guarding against scuffs and moisture', category: 'Packaging', popular: true },
  { id: 4, code: 'doorstep_weighing', title: 'Doorstep weighing & calibration', price: 19, description: 'Calibrated digital scale weighing at collection point', category: 'Inspection', popular: true },
  { id: 5, code: 'fragile_handling', title: 'Fragile handling sticker & pouch', price: 39, description: 'Specialized padded stowage with high-priority handling stickers', category: 'Care' },
  { id: 6, code: 'priority_loading', title: 'Priority dispatch & loading', price: 49, description: 'First-in-line vehicle dispatch with dedicated priority routing', category: 'Speed' },
  { id: 7, code: 'waterproof_cover', title: 'Waterproof protective cover', price: 39, description: 'Heavy gauge waterproof sleeve protecting against rain', category: 'Protection' },
  { id: 8, code: 'gps_tracker', title: 'GPS tracker attachment', price: 79, description: 'Hardware BLE/GPS beacon attached to luggage for pinpoint telemetry', category: 'Tracking' },
  { id: 9, code: 'express_pickup', title: 'Express 30-min pickup window', price: 59, description: 'Driver assigned immediately with 30-minute arrival guarantee', category: 'Speed' },
  { id: 10, code: 'sms_updates', title: 'SMS & WhatsApp milestone pings', price: 19, description: 'Direct cellular notifications on each stage transition', category: 'Notifications' },
  { id: 11, code: 'photo_proof_delivery', title: 'Photo proof of delivery', price: 19, description: 'Timestamped photo proof of luggage handover at destination', category: 'Proof', popular: true },
  { id: 12, code: 'sanitization', title: 'Exterior sanitization wipe', price: 29, description: 'Hospital-grade sanitizing wipe before departure and after transit', category: 'Care' },
  { id: 13, code: 'storage_extension', title: 'Flexible 24-hr hub storage', price: 99, description: 'Secure luggage holding at Delivez central hub for up to 24 hours', category: 'Storage' },
  { id: 14, code: 'video_proof', title: 'Video proof of inspection', price: 99, description: 'End-to-end recorded inspection video of luggage condition', category: 'Proof' },
  { id: 15, code: 'dedicated_support', title: 'Premium 24/7 luggage concierge', price: 149, description: 'Dedicated personal logistics executive assigned to your order', category: 'Support' },
  { id: 16, code: 'porter_assistance', title: 'Porter assistance at gate', price: 69, description: 'Physical luggage porter to assist with bag transfer', category: 'Convenience' },
];`;

const startIdx = content.indexOf('export const luggageAddOns: LuggageAddonItem[] = [');
const endIdx = content.indexOf('];', startIdx) + 2;
if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + newAddonsList + content.slice(endIdx);
  fs.writeFileSync(configPath, content, 'utf8');
  console.log('Successfully updated luggageAddOns with codes and IDs in luggage-delivery-config.ts');
} else {
  console.log('Could not find start/end of luggageAddOns in luggage-delivery-config.ts');
}
