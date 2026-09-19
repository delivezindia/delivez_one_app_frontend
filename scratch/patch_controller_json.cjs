const fs = require('fs');

const ctrlPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

// Find formatMasterBookingJson function start and end
const fnStart = 'export function formatMasterBookingJson(booking: any): Record<string, any> {';
const fnEnd = 'export const createLuggageDeliveryBookingHandler: RequestHandler = async (req, res) => {';

const startIndex = ctrl.indexOf(fnStart);
const endIndex = ctrl.indexOf(fnEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not locate formatMasterBookingJson function boundaries');
  process.exit(1);
}

const replacementFn = `export function formatMasterBookingJson(booking: any): Record<string, any> {
  const serviceId = booking.serviceId || 'home_airport';
  const serviceMatch = luggageServices.find((s) => s.id === serviceId) ?? luggageServices[0]!;
  
  const rawPricing = booking.pricingBreakdown || {};
  const totalAmount = Number(booking.totalAmount || rawPricing.total_amount || 0);

  const rawLuggage = booking.luggageItems || [];
  const items = Array.isArray(rawLuggage) ? rawLuggage : (rawLuggage.items || []);
  let totalPieces = 0;
  let totalWeightKg = 0;
  for (const item of items) {
    const q = Number(item.quantity) || 1;
    totalPieces += q;
    totalWeightKg += (Number(item.total_weight_kg ?? item.declared_weight_kg ?? item.weightKg) || 15) * q;
  }

  const pickup = booking.pickupDetails || {};
  const delivery = booking.deliveryDetails || {};
  const customer = booking.user || {};

  const pickupFullAddr = pickup.full_address || pickup.address?.full_address || (typeof pickup.address === 'string' ? pickup.address : '') || (typeof pickup.fullAddress === 'string' ? pickup.fullAddress : '');
  const deliveryFullAddr = delivery.full_address || delivery.address?.full_address || (typeof delivery.address === 'string' ? delivery.address : '') || (typeof delivery.fullAddress === 'string' ? delivery.fullAddress : '');

  const flightDetails = booking.flightDetails || delivery.flight_details || delivery.airport_specific || pickup.flight_details || pickup.airport_specific || null;
  const hotelDetails = booking.hotelDetails || delivery.hotel_details || delivery.hotel_specific || pickup.hotel_details || pickup.hotel_specific || null;

  return {
    api_version: '1.0',
    client_request_id: booking.idempotencyKey || booking.id,
    booking_id: booking.id,
    booking_number: booking.bookingNumber,
    status: booking.status,
    customer: {
      customer_id: customer.id || 1001,
      customer_type: 'registered',
      full_name: customer.name || pickup.contact?.full_name || 'Customer',
      email: customer.email || pickup.contact?.email || 'customer@delivez.com',
      mobile: customer.phone || customer.mobileNumber || pickup.contact?.mobile || '+919876543210',
      alternate_mobile: pickup.contact?.alternate_mobile || null,
    },
    service: {
      service_id: serviceId,
      service_name: serviceMatch.title,
      service_tag: serviceMatch.tag || 'Luggage Transfer',
      service_description: serviceMatch.description,
    },
    route: {
      route_type: booking.routeType || 'single_trip',
      total_stops: Array.isArray(booking.multiStops) && booking.multiStops.length > 0 ? booking.multiStops.length : 2,
      estimated_distance_km: Number(rawPricing.distance_km || booking.distanceKm || 22),
      estimated_duration_minutes: 180,
      is_round_trip: booking.routeType === 'round_trip',
      is_multi_stop: booking.routeType === 'multi_stop' || (Array.isArray(booking.multiStops) && booking.multiStops.length > 2),
      stops: Array.isArray(booking.multiStops) && booking.multiStops.length > 0 ? booking.multiStops : [
        {
          sequence: 1,
          stop_type: 'pickup',
          location_type: pickup.location_type || 'home',
          title: pickup.location_type === 'airport' ? (pickup.airport?.airport_name || 'Airport') : (pickup.location_type === 'hotel' ? 'Hotel' : 'Home'),
          address: pickupFullAddr,
          city: pickup.city || pickup.address?.city || 'Bengaluru',
          state: pickup.state || pickup.address?.state || 'Karnataka',
          pincode: pickup.pincode || pickup.address?.pincode || '560038',
          country: pickup.country || pickup.address?.country || 'India',
          latitude: pickup.latitude || pickup.address?.latitude || null,
          longitude: pickup.longitude || pickup.address?.longitude || null,
        },
        {
          sequence: 2,
          stop_type: 'delivery',
          location_type: delivery.location_type || 'airport',
          title: delivery.location_type === 'airport' ? (delivery.airport?.airport_name || 'Airport') : (delivery.location_type === 'hotel' ? 'Hotel' : 'Home'),
          address: deliveryFullAddr,
          city: delivery.city || delivery.address?.city || 'Bengaluru',
          state: delivery.state || delivery.address?.state || 'Karnataka',
          pincode: delivery.pincode || delivery.address?.pincode || '560300',
          country: 'India',
          latitude: delivery.latitude || delivery.address?.latitude || null,
          longitude: delivery.longitude || delivery.address?.longitude || null,
        },
      ],
    },
    pickup: {
      location_type: pickup.location_type || 'home',
      full_address: pickupFullAddr,
      landmark: pickup.landmark || pickup.address?.landmark || null,
      city: pickup.city || pickup.address?.city || 'Bengaluru',
      state: pickup.state || pickup.address?.state || 'Karnataka',
      pincode: pickup.pincode || pickup.address?.pincode || '560038',
      country: pickup.country || pickup.address?.country || 'India',
      latitude: pickup.latitude || pickup.address?.latitude || null,
      longitude: pickup.longitude || pickup.address?.longitude || null,
      contact: pickup.contact || {
        full_name: customer.name || 'Contact Person',
        mobile: customer.phone || customer.mobileNumber || '+919876543210',
        alternate_mobile: null,
        email: customer.email || 'contact@delivez.com',
      },
      airport_specific: pickup.airport_specific || null,
      hotel_specific: pickup.hotel_specific || null,
      address: pickup.address || {
        full_address: pickupFullAddr,
        city: pickup.city || 'Bengaluru',
        state: pickup.state || 'Karnataka',
        pincode: pickup.pincode || '560038',
        country: 'India',
      },
      schedule: pickup.schedule || {
        pickup_date: booking.schedule?.pickup_date || new Date().toISOString().split('T')[0],
        pickup_time_slot: typeof booking.schedule?.pickup_time_slot === 'object' ? booking.schedule?.pickup_time_slot?.label : (booking.schedule?.pickup_time_slot || '10:00 AM - 12:00 PM'),
      },
      instructions: pickup.instructions || 'Please ring the doorbell.',
    },
    delivery: {
      location_type: delivery.location_type || 'airport',
      full_address: deliveryFullAddr,
      landmark: delivery.landmark || delivery.address?.landmark || null,
      city: delivery.city || delivery.address?.city || 'Bengaluru',
      state: delivery.state || delivery.address?.state || 'Karnataka',
      pincode: delivery.pincode || delivery.address?.pincode || '560300',
      country: delivery.country || delivery.address?.country || 'India',
      latitude: delivery.latitude || delivery.address?.latitude || null,
      longitude: delivery.longitude || delivery.address?.longitude || null,
      contact: delivery.contact || {
        full_name: customer.name || 'Recipient',
        mobile: customer.phone || customer.mobileNumber || '+919876543210',
        alternate_mobile: null,
        email: customer.email || 'recipient@delivez.com',
      },
      airport_specific: delivery.airport_specific || (flightDetails ? {
        terminal: flightDetails.terminal || 'T1',
        flight_number: flightDetails.flight_number || flightDetails.flightNumber || '6E-2041',
        pnr: flightDetails.pnr || 'AB12CD',
        airline_name: flightDetails.airline_name || flightDetails.airline || 'IndiGo',
        departure_time: flightDetails.departure_time || flightDetails.flightDate || '2026-09-19T18:30:00.000Z',
        gate_number: flightDetails.gate_number || 'Gate 4',
        meeting_point: flightDetails.meeting_point || 'Departure Pillar 4',
      } : null),
      hotel_specific: delivery.hotel_specific || (hotelDetails ? {
        hotel_name: hotelDetails.hotel_name || hotelDetails.hotelName || 'The Hotel',
        room_number: hotelDetails.room_number || hotelDetails.roomNumber || 'Room 101',
        guest_name: hotelDetails.guest_name || hotelDetails.guestName || customer.name || 'Guest',
      } : null),
      address: delivery.address || {
        full_address: deliveryFullAddr,
        city: delivery.city || 'Bengaluru',
        state: delivery.state || 'Karnataka',
        pincode: delivery.pincode || '560300',
        country: 'India',
      },
      schedule: delivery.schedule || {
        delivery_date: booking.schedule?.pickup_date || new Date().toISOString().split('T')[0],
        preferred_delivery_time: '10:00 AM - 12:00 PM',
      },
      instructions: delivery.instructions || 'Handover luggage at designated terminal point.',
    },
    multi_stops: booking.multiStops || [],
    luggage_items: items.map((it: any, idx: number) => ({
      item_id: it.item_id || it.id || \`item_\${idx + 1}\`,
      bag_type: it.bag_type || it.type || 'large',
      quantity: Number(it.quantity) || 1,
      declared_weight_kg: Number(it.declared_weight_kg ?? it.total_weight_kg ?? it.weightKg) || 15.0,
      dimensions: it.dimensions || { length_cm: 70, width_cm: 45, height_cm: 28 },
      is_fragile: Boolean(it.is_fragile ?? it.isFragile ?? it.special_handling?.fragile),
      is_valuable: Boolean(it.is_valuable ?? it.isValuable),
      description: it.description || '',
    })),
    luggage: {
      total_pieces: totalPieces || 1,
      total_weight_kg: totalWeightKg || 15.0,
      items: items.map((it: any, idx: number) => ({
        item_id: it.item_id || idx + 1,
        luggage_type: it.luggage_type || it.type || 'suitcase',
        luggage_type_label: it.luggage_type_label || 'Suitcase / Trolley',
        size: it.size || 'large',
        quantity: Number(it.quantity) || 1,
        total_weight_kg: Number(it.total_weight_kg ?? it.declared_weight_kg ?? it.weightKg) || 15.0,
        weight_unit: 'kg',
        description: it.description || 'Luggage piece',
        special_handling: it.special_handling || {
          fragile: Boolean(it.is_fragile ?? it.isFragile),
          keep_dry: false,
          temperature_sensitive: false,
        },
      })),
    },
    schedule: {
      pickup_type: booking.schedule?.pickup_type || 'scheduled',
      pickup_time: booking.schedule?.pickup_time || booking.schedule?.scheduled_pickup_time || new Date().toISOString(),
      delivery_speed: typeof booking.schedule?.delivery_speed === 'object' ? booking.schedule?.delivery_speed : {
        type: String(booking.schedule?.delivery_speed || 'standard').toLowerCase(),
        label: 'Standard',
        additional_fee: 0,
      },
      buffer_minutes: booking.schedule?.buffer_minutes || 180,
    },
    add_ons: booking.addOns || { selected_items: [] },
    luggage_protection: booking.protections || { enabled: false, selected_items: [] },
    airport_assistance: booking.airportAssistance || { enabled: false, selected_services: [] },
    pricing: rawPricing.subtotal !== undefined ? rawPricing : {
      currency: 'INR',
      distance_km: Number(booking.distanceKm || 22),
      base_fare: 499,
      distance_fee: 0,
      luggage_handling_fee: 0,
      airport_handling_fee: 0,
      hotel_handling_fee: 0,
      delivery_speed_fee: 0,
      luggage_protection_fee: 0,
      airport_assistance_fee: 0,
      add_on_fee: 0,
      subtotal: totalAmount / 1.18,
      tax: {
        tax_type: 'GST',
        tax_rate: 18,
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 0,
        cgst_amount: Math.round((totalAmount - totalAmount / 1.18) / 2 * 100) / 100,
        sgst_amount: Math.round((totalAmount - totalAmount / 1.18) / 2 * 100) / 100,
        igst_amount: 0,
        total_tax: Math.round((totalAmount - totalAmount / 1.18) * 100) / 100,
      },
      discount: {
        coupon_code: null,
        discount_type: null,
        discount_amount: 0,
      },
      total_amount: totalAmount,
    },
    gst_invoice: booking.gstInvoice || {
      required: false,
      company_name: null,
      gstin: null,
      billing_address: null,
      state_code: null,
      invoice_number: null,
      invoice_url: null,
    },
    payment: {
      payment_id: booking.paymentId || 'pay_' + booking.id.slice(0, 8),
      gateway: 'razorpay',
      payment_method: String(booking.paymentMethod || 'upi').toLowerCase(),
      status: booking.paymentStatus === 'PAID' ? 'completed' : 'pending',
      currency: 'INR',
      amount_paid: totalAmount,
      paid_at: booking.paidAt ? booking.paidAt.toISOString() : new Date().toISOString(),
      receipt_number: 'REC-' + booking.bookingNumber,
      transaction_ref: 'TXN-' + booking.bookingNumber,
    },
    timeline: [
      { step: 1, code: 'booking_created', title: 'Booking Created', timestamp: booking.createdAt?.toISOString() || new Date().toISOString(), completed: true },
      { step: 2, code: 'payment_verified', title: 'Payment Confirmed', timestamp: booking.paidAt?.toISOString() || null, completed: booking.paymentStatus === 'PAID' },
      { step: 3, code: 'executive_assigned', title: 'Executive Assigned', timestamp: null, completed: false },
      { step: 4, code: 'agent_at_source', title: 'Agent at Source', timestamp: null, completed: false },
      { step: 5, code: 'luggage_sealed', title: 'Luggage Sealed & Tagged', timestamp: null, completed: false },
      { step: 6, code: 'pickup_completed', title: 'Pickup Completed', timestamp: null, completed: false },
      { step: 7, code: 'in_transit', title: 'In Transit', timestamp: null, completed: false },
      { step: 8, code: 'arrived_destination', title: 'Arrived at Destination', timestamp: null, completed: false },
      { step: 9, code: 'otp_verified', title: 'OTP & Handover Verification', timestamp: null, completed: false },
      { step: 10, code: 'delivered', title: 'Delivered', timestamp: null, completed: false },
    ],
    tracking: {
      tracking_id: booking.bookingNumber,
      carrier: 'Delivez Secure Logistics',
      driver: {
        name: 'Ramesh Kumar',
        phone: '+919876543210',
        vehicle_number: 'KA-01-MJ-4050',
      },
    },
  };
}

`;

ctrl = ctrl.substring(0, startIndex) + replacementFn + ctrl.substring(endIndex);
fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Successfully updated formatMasterBookingJson in luggage-delivery.controller.ts');
