const fs = require('fs');

const ctrlPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

// 1. Patch createLuggagePaymentHandler
ctrl = ctrl.replace(
  `      gateway_order_id: gatewayOrderId,
      key_id: 'rzp_test_delivez_luggage_key',`,
  `      gateway_order_id: gatewayOrderId,
      order_id: gatewayOrderId,
      key_id: 'rzp_test_delivez_luggage_key',`
);

// 2. Patch getLuggageDeliveryReceiptHandler
const targetReceipt = `      receipt_id: \`REC-\${booking.bookingNumber}\`,
      receipt_number: \`RCPT-LG-\${booking.bookingNumber}\`,
      booking_id: booking.id,
      booking_number: booking.bookingNumber,
      issued_at: booking.createdAt,
      customer: formatted.customer,
      service: formatted.service,
      pickup: formatted.pickup,
      delivery: formatted.delivery,
      luggage: formatted.luggage,
      schedule: formatted.schedule,
      pricing: formatted.pricing,
      gst_invoice: formatted.gst_invoice,
      payment: formatted.payment,
      tax_summary: {`;

const replacementReceipt = `      receipt_id: \`REC-\${booking.bookingNumber}\`,
      receipt_number: \`RCPT-LG-\${booking.bookingNumber}\`,
      invoice_number: \`INV-\${booking.bookingNumber}\`,
      booking_id: booking.id,
      booking_number: booking.bookingNumber,
      issued_at: booking.createdAt,
      customer: formatted.customer,
      service: formatted.service,
      pickup: formatted.pickup,
      delivery: formatted.delivery,
      luggage: formatted.luggage,
      schedule: formatted.schedule,
      pricing: formatted.pricing,
      gst_invoice: formatted.gst_invoice,
      payment: formatted.payment,
      billing_to: {
        company_name: (booking.gstInvoice as any)?.company_name || formatted.customer?.full_name,
        gstin: (booking.gstInvoice as any)?.gstin || null,
        billing_address: (booking.gstInvoice as any)?.billing_address || formatted.pickup?.full_address,
      },
      tax_breakdown: {
        taxable_amount: taxableAmount,
        tax_rate: 18,
        cgst_amount: pricing.tax?.cgst_amount || 0,
        sgst_amount: pricing.tax?.sgst_amount || 0,
        total_tax: pricing.tax?.total_tax || 0,
        total_amount: pricing.total_amount,
      },
      tax_summary: {`;

ctrl = ctrl.replace(targetReceipt, replacementReceipt);

fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Successfully patched createLuggagePaymentHandler and getLuggageDeliveryReceiptHandler');
