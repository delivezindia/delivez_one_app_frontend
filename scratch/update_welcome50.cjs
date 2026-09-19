const fs = require('fs');

const configPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery-config.ts';
let config = fs.readFileSync(configPath, 'utf8');

config = config.replace(
  `  WELCOME50: {
    code: 'WELCOME50',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 300,
    minSubtotal: 300,
    description: '15% welcome discount up to ₹300',
  },`,
  `  WELCOME50: {
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    maxDiscount: 50,
    minSubtotal: 300,
    description: 'Flat ₹50 welcome discount on your luggage booking',
  },`
);

fs.writeFileSync(configPath, config, 'utf8');
console.log('Updated WELCOME50 to flat 50 discount.');
