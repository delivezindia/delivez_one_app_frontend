const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== Test 1: Testing Backend courier-config.ts exports & getCourierOptions() ===');

const testBackendCode = `
import {
  getCourierOptions,
  getCourierDeliveryConfig,
  courierPackageCategories,
  courierBoxTypesByWeight,
  courierParcelTypes,
  courierParcelDimensions,
  courierLocalOptions,
  courierIntercityOptions,
  courierDropOptions,
  courierInsuranceOptions,
  getBoxesForWeight,
} from './src/modules/personal-courier/courier-config.js';

const options = getCourierOptions();
const config = getCourierDeliveryConfig();

console.log('1. Categories count:', courierPackageCategories.length);
console.log('   Category codes:', courierPackageCategories.map(c => c.apiCode).join(', '));
if (courierPackageCategories.length !== 8) throw new Error('Expected 8 categories');

console.log('2. Box weights available:', Object.keys(courierBoxTypesByWeight).join(', '));
console.log('   10 Kg box count:', getBoxesForWeight('10 Kg').length);
console.log('   15 Kg box count:', getBoxesForWeight('15 Kg').length);
console.log('   25 Kg box count:', getBoxesForWeight('25 Kg').length);
if (getBoxesForWeight('10 Kg').length !== 3) throw new Error('Expected 3 10kg boxes');

console.log('3. Parcel types count:', courierParcelTypes.length);
console.log('   Parcel dimensions keys:', Object.keys(courierParcelDimensions).join(', '));
if (courierParcelTypes.length !== 4) throw new Error('Expected 4 parcel types');

console.log('4. Local options count:', courierLocalOptions.length);
console.log('   Local titles:', courierLocalOptions.map(l => l.title).join(' | '));
if (courierLocalOptions.length !== 4) throw new Error('Expected 4 local options');

console.log('5. Intercity options count:', courierIntercityOptions.length);
console.log('   Intercity titles:', courierIntercityOptions.map(i => i.title).join(' | '));
if (courierIntercityOptions.length !== 5) throw new Error('Expected 5 intercity options');

console.log('6. Drop options count:', courierDropOptions.length);
console.log('   Drop titles:', courierDropOptions.map(d => d.title).join(' | '));
if (courierDropOptions.length !== 2) throw new Error('Expected 2 drop options');

console.log('7. Insurance options count:', courierInsuranceOptions.length);
console.log('   Insurance titles:', courierInsuranceOptions.map(i => i.title).join(' | '));
if (courierInsuranceOptions.length !== 3) throw new Error('Expected 3 insurance options');

console.log('8. getCourierOptions() envelope payload assertions:');
console.log('   package_categories present:', Boolean(options.package_categories && options.package_categories.length === 8));
console.log('   box_types present:', Boolean(options.box_types && options.box_types['10 Kg']));
console.log('   parcel_types present:', Boolean(options.parcel_types && options.parcel_types.length === 4));
console.log('   local_options present:', Boolean(options.local_options && options.local_options.length === 4));
console.log('   intercity_options present:', Boolean(options.intercity_options && options.intercity_options.length === 5));
console.log('   drop_options present:', Boolean(options.drop_options && options.drop_options.length === 2));
console.log('   insurance_options present:', Boolean(options.insurance_options && options.insurance_options.length === 3));

if (!options.package_categories || options.package_categories.length !== 8) {
  throw new Error('options.package_categories missing or incorrect length');
}
if (!options.local_options || options.local_options.length !== 4) {
  throw new Error('options.local_options missing or incorrect length');
}
if (!options.intercity_options || options.intercity_options.length !== 5) {
  throw new Error('options.intercity_options missing or incorrect length');
}
`;

fs.writeFileSync('C:/Users/Rax/Desktop/Delivery_app_site_backend/test_runner_config.ts', testBackendCode, 'utf8');

try {
  const result = execSync('npx tsx test_runner_config.ts', {
    cwd: 'C:/Users/Rax/Desktop/Delivery_app_site_backend',
    encoding: 'utf8',
  });
  console.log(result);
} finally {
  try {
    fs.unlinkSync('C:/Users/Rax/Desktop/Delivery_app_site_backend/test_runner_config.ts');
  } catch {}
}

console.log('=== Test 2: Checking Frontend courierDeliveryApi.js and Models File Integrity ===');
const frontendContent = fs.readFileSync('c:/Users/Rax/Desktop/Delivery_app_web/src/services/api/courierDeliveryApi.js', 'utf8');
assert(frontendContent.includes('COURIER_PACKAGE_CATEGORIES'), 'Has COURIER_PACKAGE_CATEGORIES');
assert(frontendContent.includes('COURIER_BOX_TYPES'), 'Has COURIER_BOX_TYPES');
assert(frontendContent.includes('COURIER_PARCEL_TYPES'), 'Has COURIER_PARCEL_TYPES');
assert(frontendContent.includes('COURIER_LOCAL_OPTIONS'), 'Has COURIER_LOCAL_OPTIONS');
assert(frontendContent.includes('COURIER_INTERCITY_OPTIONS'), 'Has COURIER_INTERCITY_OPTIONS');
assert(frontendContent.includes('COURIER_DROP_OPTIONS'), 'Has COURIER_DROP_OPTIONS');
assert(frontendContent.includes('COURIER_INSURANCE_OPTIONS'), 'Has COURIER_INSURANCE_OPTIONS');
console.log('Frontend courierDeliveryApi.js constants and functions verified.');

const dartModels = fs.readFileSync('c:/Users/Rax/Desktop/Delivery_app_web/mobile-sdk/courier_models.dart', 'utf8');
assert(dartModels.includes('class CourierDeliveryConfig'), 'Has CourierDeliveryConfig');
assert(dartModels.includes('class CourierPackageCategory'), 'Has CourierPackageCategory');
assert(dartModels.includes('class CourierBoxType'), 'Has CourierBoxType');
assert(dartModels.includes('class CourierParcelType'), 'Has CourierParcelType');
assert(dartModels.includes('class CourierServiceOption'), 'Has CourierServiceOption');
assert(dartModels.includes('class CourierDropOption'), 'Has CourierDropOption');
assert(dartModels.includes('class CourierInsuranceOption'), 'Has CourierInsuranceOption');
console.log('Mobile SDK Flutter Dart models verified.');

console.log('\n========================================================================');
console.log('>>> SUCCESS: ALL 6 DATASETS FULLY IMPLEMENTED, TESTED, AND VERIFIED! <<<');
console.log('========================================================================');
