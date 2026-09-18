const fs = require('fs');
const schemaPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Find model Service block
const serviceModelRegex = /(model\s+Service\s*\{[\s\S]*?giftDeliveryBookings\s+GiftDeliveryBooking\[\])/;
if (serviceModelRegex.test(schema)) {
  schema = schema.replace(serviceModelRegex, '$1\n  vaultCourierBookings        VaultCourierBooking[]');
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('Successfully added vaultCourierBookings to model Service');
} else {
  console.log('Regex did not match model Service');
}
