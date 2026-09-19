const fs = require('fs');

const ctrlPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

ctrl = ctrl.replace(
  `    data: {
      booking_id: updated.id,
      booking_number: updated.bookingNumber,
      payment_status: 'paid',`,
  `    data: {
      booking_id: updated.id,
      booking_number: updated.bookingNumber,
      booking_status: updated.status,
      payment_status: 'paid',`
);

fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Added booking_status to verifyLuggagePaymentHandler');
