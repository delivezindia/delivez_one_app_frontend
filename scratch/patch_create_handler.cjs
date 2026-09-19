const fs = require('fs');

const ctrlPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

const targetLines = `  // Extract structured parts
  const pickupDetails = body.pickup || { address: body.pickupAddress, contact: body.pickupContact };
  const deliveryDetails = body.delivery || { address: body.deliveryAddress, airport: body.airport, flight: body.flight };
  const multiStops = body.route?.stops || body.multiStops || [];
  const flightDetails = body.delivery?.flight || body.flightDetails || null;
  const hotelDetails = body.pickup?.hotel || body.delivery?.hotel || body.hotelDetails || null;
  const luggageItems = body.luggage?.items || body.luggageItems || [];
  const addOns = body.add_ons || body.addOns || { selected_items: [] };
  const protections = body.luggage_protection || body.protections || { enabled: false, selected_items: [] };
  const airportAssistance = body.airport_assistance || body.airportAssistance || { enabled: false, selected_services: [] };
  const schedule = body.schedule || {};
  const gstInvoice = body.gst_invoice || body.gstInvoice || { enabled: false, request_invoice: false };

  // Validate GSTIN if invoice requested
  if (gstInvoice.request_invoice || gstInvoice.enabled) {
    const gstin = (gstInvoice.gstin || '').trim();
    if (!gstin || gstin.length < 15) {
      throw new AppError(400, 'A valid 15-character GSTIN is required when business invoice is requested');
    }
  }

  const paymentMethod = (body.payment?.payment_method || body.paymentMethod || 'WALLET').toUpperCase();`;

const replacementLines = `  // Extract structured parts
  const pickupDetails = body.pickup || { address: body.pickupAddress, contact: body.pickupContact };
  const deliveryDetails = body.delivery || { address: body.deliveryAddress, airport: body.airport, flight: body.flight };
  const multiStops = body.multi_stops || body.route?.stops || body.multiStops || [];
  const flightDetails = body.flight_details || body.delivery?.airport_specific || body.delivery?.flight || body.flightDetails || null;
  const hotelDetails = body.hotel_details || body.delivery?.hotel_specific || body.pickup?.hotel_specific || body.pickup?.hotel || body.delivery?.hotel || body.hotelDetails || null;
  const luggageItems = body.luggage_items || body.luggage?.items || body.luggageItems || [];
  const addOns = body.add_ons || body.addOns || { selected_items: [] };
  const protections = body.luggage_protection || body.protections || { enabled: false, selected_items: [] };
  const airportAssistance = body.airport_assistance || body.airportAssistance || { enabled: false, selected_services: [] };
  const schedule = body.schedule || {};
  const gstInvoice = body.gst_invoice || body.gstInvoice || { enabled: false, request_invoice: false, required: false };

  // Validate GSTIN if invoice requested
  if (gstInvoice.request_invoice || gstInvoice.enabled || gstInvoice.required) {
    const gstin = (gstInvoice.gstin || '').trim();
    if (!gstin || gstin.length < 15) {
      throw new AppError(400, 'A valid 15-character GSTIN is required when business invoice is requested');
    }
  }

  const paymentMethod = (body.payment?.payment_method || body.payment_method || body.paymentMethod || 'WALLET').toUpperCase();`;

ctrl = ctrl.replace(targetLines, replacementLines);
fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Successfully updated field extractions in createLuggageDeliveryBookingHandler');
