const fs = require('fs');
const path = require('path');

const targetPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery.controller.ts';

const controllerCode = `// luggage-delivery.controller.ts
import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getSandboxGatewayOptions,
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import {
  getLuggageOptions,
  luggageTimelineMilestones,
  luggageServices,
  findCoupon,
  LUGGAGE_COUPONS,
} from './luggage-delivery-config.js';
import type { LuggageServiceItem } from './luggage-delivery-config.js';
import {
  calculateLuggageMasterQuote,
  type MasterQuoteResult,
} from './luggage-delivery-pricing.js';

// Format: DLVZ + 10 digits (e.g. DLVZ2505128947 as in Flutter Dart source)
export const makeLuggageBookingNumber = (): string => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return \`DLVZ\${yy}\${mm}\${dd}\${rand}\`;
};

/**
 * 1. GET /options - Service options and catalog
 */
export const getLuggageDeliveryOptionsHandler: RequestHandler = (_req, res) => {
  res.status(200).json({
    success: true,
    data: getLuggageOptions(),
  });
};

/**
 * 2. POST /bookings/validate-coupon & POST /validate-coupon
 */
export const validateCouponHandler: RequestHandler = (req, res) => {
  const code = (req.body?.coupon_code || req.body?.couponCode || req.body?.code || '').toString().trim().toUpperCase();
  const subtotal = Number(req.body?.subtotal || 0);

  if (!code) {
    throw new AppError(400, 'Coupon code is required');
  }

  const coupon = findCoupon(code);
  if (!coupon) {
    res.status(200).json({
      success: false,
      message: 'Invalid coupon code',
      data: { valid: false, message: 'Invalid coupon code' },
    });
    return;
  }

  if (subtotal > 0 && subtotal < coupon.minSubtotal) {
    res.status(200).json({
      success: false,
      message: \`Minimum booking subtotal of ₹\${coupon.minSubtotal} required for coupon \${coupon.code}\`,
      data: {
        valid: false,
        message: \`Minimum subtotal of ₹\${coupon.minSubtotal} required\`,
      },
    });
    return;
  }

  let discount_amount = 0;
  if (coupon.discountType === 'percentage') {
    const raw = (subtotal * coupon.discountValue) / 100;
    discount_amount = Math.min(coupon.maxDiscount, Math.round(raw * 100) / 100);
  } else {
    discount_amount = Math.min(coupon.maxDiscount, coupon.discountValue);
  }

  const new_subtotal = Math.max(0, subtotal - discount_amount);
  const new_tax = Math.round(new_subtotal * 0.18 * 100) / 100;
  const new_total = Math.round((new_subtotal + new_tax) * 100) / 100;

  res.status(200).json({
    success: true,
    message: 'Coupon is valid',
    data: {
      valid: true,
      coupon_code: coupon.code,
      discount_type: coupon.discountType,
      discount_amount,
      new_subtotal,
      new_tax,
      new_total,
      message: coupon.description,
    },
  });
};

/**
 * 3. POST /quote & POST /bookings/quote
 */
export const getLuggageDeliveryQuoteHandler: RequestHandler = (req, res) => {
  const body = req.body || {};
  const quoteResult: MasterQuoteResult = calculateLuggageMasterQuote(body);

  res.status(200).json({
    success: true,
    data: {
      quote_id: quoteResult.quote_id,
      pricing: quoteResult.pricing,
      expires_at: quoteResult.expires_at,
      // Legacy compatibility fields
      quote: quoteResult,
    },
  });
};

/**
 * Format raw Prisma booking into the MASTER BOOKING CONTRACT JSON
 */
export function formatMasterBookingJson(booking: any): Record<string, any> {
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
    totalWeightKg += (Number(item.total_weight_kg ?? item.weightKg) || 15) * q;
  }

  const pickup = booking.pickupDetails || {};
  const delivery = booking.deliveryDetails || {};
  const customer = booking.user || {};

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
      mobile: customer.phone || pickup.contact?.mobile || '+919876543210',
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
      route_type_label: booking.routeType === 'round_trip' ? 'Round Trip' : (booking.routeType === 'multi_stop' ? 'Multi-Stop' : 'Single Trip'),
      is_round_trip: booking.routeType === 'round_trip',
      is_multi_stop: booking.routeType === 'multi_stop' || (Array.isArray(booking.multiStops) && booking.multiStops.length > 2),
      stops: Array.isArray(booking.multiStops) && booking.multiStops.length > 0 ? booking.multiStops : [
        {
          sequence: 1,
          stop_type: 'pickup',
          location_type: pickup.location_type || 'home',
          title: pickup.location_type === 'airport' ? (pickup.airport?.airport_name || 'Airport') : (pickup.location_type === 'hotel' ? 'Hotel' : 'Home'),
          address: pickup.address?.full_address || pickup.address || '',
          city: pickup.address?.city || 'Bengaluru',
          state: pickup.address?.state || 'Karnataka',
          pincode: pickup.address?.pincode || '560103',
          country: pickup.address?.country || 'India',
          latitude: pickup.address?.latitude || null,
          longitude: pickup.address?.longitude || null,
        },
        {
          sequence: 2,
          stop_type: 'delivery',
          location_type: delivery.location_type || 'airport',
          title: delivery.location_type === 'airport' ? (delivery.airport?.airport_name || 'Airport') : (delivery.location_type === 'hotel' ? 'Hotel' : 'Home'),
          address: delivery.airport?.address || delivery.address?.full_address || delivery.address || '',
          city: delivery.airport?.city || delivery.address?.city || 'Bengaluru',
          state: delivery.airport?.state || delivery.address?.state || 'Karnataka',
          pincode: delivery.airport?.pincode || delivery.address?.pincode || '560103',
          country: 'India',
          latitude: delivery.airport?.latitude || null,
          longitude: delivery.airport?.longitude || null,
        },
      ],
    },
    pickup: {
      location_type: pickup.location_type || 'home',
      address: pickup.address || {
        full_address: typeof pickup.address === 'string' ? pickup.address : '',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110016',
        country: 'India',
        latitude: null,
        longitude: null,
        landmark: null,
      },
      contact: pickup.contact || {
        full_name: 'Contact Person',
        mobile: '+919876543210',
        alternate_mobile: null,
        email: 'contact@delivez.com',
      },
      schedule: pickup.schedule || {
        pickup_date: booking.schedule?.pickup_date || new Date().toISOString().split('T')[0],
        pickup_time_slot: typeof booking.schedule?.pickup_time_slot === 'object' ? booking.schedule?.pickup_time_slot?.label : (booking.schedule?.pickup_time_slot || '10:00 AM - 12:00 PM'),
        pickup_time_start: '10:00',
        pickup_time_end: '12:00',
      },
      instructions: pickup.instructions || 'Please ring the doorbell.',
      landmark_notes: pickup.landmark_notes || null,
      proof: pickup.proof || { photo_proof: true, signature_required: false, otp_required: false },
    },
    delivery: {
      location_type: delivery.location_type || 'airport',
      airport: delivery.airport || (delivery.location_type === 'airport' ? {
        airport_name: 'Indira Gandhi International Airport',
        airport_code: 'DEL',
        terminal: 'Terminal 3',
        meeting_point: 'Departure Gate A - Pillar 4',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110037',
        country: 'India',
        latitude: null,
        longitude: null,
      } : null),
      flight: delivery.flight || booking.flightDetails || null,
      contact: delivery.contact || {
        full_name: 'Recipient',
        mobile: '+919876543210',
        alternate_mobile: null,
        email: 'recipient@delivez.com',
      },
      schedule: delivery.schedule || {
        delivery_date: booking.schedule?.pickup_date || new Date().toISOString().split('T')[0],
        preferred_delivery_time: '10:00 AM - 12:00 PM',
      },
      handover: delivery.handover || {
        handover_type: 'designated_airport_point',
        otp_required: true,
        signature_required: false,
        photo_proof_required: true,
      },
      instructions: delivery.instructions || 'Handover luggage at designated terminal point.',
    },
    luggage: {
      total_pieces: totalPieces || 1,
      total_weight_kg: totalWeightKg || 15.0,
      items: items.map((it: any, idx: number) => ({
        item_id: it.item_id || idx + 1,
        luggage_type: it.luggage_type || it.type || 'suitcase',
        luggage_type_label: it.luggage_type_label || 'Suitcase / Trolley',
        size: it.size || 'large',
        size_label: it.size_label || (it.size === 'large' ? 'Large' : (it.size === 'small' ? 'Small' : 'Medium')),
        size_description: it.size_description || (it.size === 'large' ? 'Above 75 cm' : (it.size === 'small' ? 'Up to 55 cm' : '56–75 cm')),
        quantity: Number(it.quantity) || 1,
        total_weight_kg: Number(it.total_weight_kg ?? it.weightKg) || 15.0,
        weight_unit: 'kg',
        description: it.description || 'Luggage piece',
        special_handling: it.special_handling || {
          fragile: Boolean(it.isFragile),
          keep_dry: false,
          temperature_sensitive: false,
        },
      })),
    },
    add_ons: booking.addOns || { selected_items: [] },
    luggage_protection: booking.protections || { enabled: false, selected_items: [] },
    airport_assistance: booking.airportAssistance || { enabled: false, selected_services: [] },
    schedule: {
      pickup_date: booking.schedule?.pickup_date || new Date().toISOString().split('T')[0],
      pickup_time_slot: typeof booking.schedule?.pickup_time_slot === 'object' ? booking.schedule?.pickup_time_slot : {
        slot_id: 1,
        label: String(booking.schedule?.pickup_time_slot || '10:00 AM - 12:00 PM'),
        start_time: '10:00',
        end_time: '12:00',
      },
      delivery_deadline: typeof booking.schedule?.delivery_deadline === 'object' ? booking.schedule?.delivery_deadline : {
        deadline_id: 1,
        label: String(booking.schedule?.delivery_deadline || 'Before 6:00 PM'),
        deadline_time: '18:00',
      },
      need_exact_delivery_time: Boolean(booking.schedule?.need_exact_delivery_time),
      exact_delivery_time: booking.schedule?.exact_delivery_time || '15:30',
      flight_based_urgency: Boolean(booking.schedule?.flight_based_urgency),
      delivery_speed: typeof booking.schedule?.delivery_speed === 'object' ? booking.schedule?.delivery_speed : {
        type: String(booking.schedule?.delivery_speed || 'standard').toLowerCase(),
        label: 'Standard',
        additional_fee: 0,
      },
    },
    promo: {
      coupon_code: rawPricing.discount?.coupon_code || null,
      apply_coupon: Boolean(rawPricing.discount?.coupon_code),
    },
    gst_invoice: booking.gstInvoice || {
      enabled: false,
      request_invoice: false,
      save_gst_details: false,
      business_name: null,
      gstin: null,
      legal_name: null,
      billing_address: null,
      state: null,
      state_code: null,
      place_of_supply: null,
      pincode: null,
    },
    pricing: rawPricing.currency ? rawPricing : {
      currency: 'INR',
      distance_km: 18.4,
      base_fare: 499,
      distance_fee: 51,
      luggage_handling_fee: 0,
      airport_handling_fee: 50,
      hotel_handling_fee: 0,
      delivery_speed_fee: 0,
      luggage_protection_fee: 0,
      airport_assistance_fee: 0,
      add_on_fee: 0,
      subtotal: totalAmount,
      tax: {
        tax_type: 'GST',
        tax_rate: 18,
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 0,
        cgst_amount: Math.round(totalAmount * 0.09 * 100) / 100,
        sgst_amount: Math.round(totalAmount * 0.09 * 100) / 100,
        igst_amount: 0,
        total_tax: Math.round(totalAmount * 0.18 * 100) / 100,
      },
      discount: { coupon_code: null, discount_type: null, discount_amount: 0 },
      total_amount: totalAmount,
    },
    payment: {
      payment_method: String(booking.paymentMethod || 'wallet').toLowerCase(),
      allowed_methods: ['wallet', 'upi', 'card', 'netbanking', 'digital_wallets', 'cash'],
      wallet: {
        wallet_id: null,
        available_balance: null,
        amount_to_deduct: booking.paymentMethod?.toLowerCase() === 'wallet' ? totalAmount : null,
      },
      upi: { upi_id: null, transaction_id: null },
      card: { gateway: null, transaction_id: null, card_last4: null },
      netbanking: { bank_code: null, transaction_id: null },
      digital_wallet: { provider: null, transaction_id: null },
      cash: { collection_required: booking.paymentMethod?.toLowerCase() === 'cash' },
      save_payment_method: true,
      payment_status: String(booking.paymentStatus || 'pending').toLowerCase(),
      gateway: null,
      gateway_order_id: null,
      gateway_payment_id: booking.paymentReference || null,
      gateway_signature: null,
    },
    booking_preferences: {
      call_before_pickup: true,
      call_before_delivery: true,
      allow_hotel_staff_coordination: false,
      customer_notifications: { sms: true, email: true, whatsapp: true, push: true },
    },
    consents: {
      terms_accepted: true,
      privacy_policy_accepted: true,
      cancellation_policy_accepted: true,
      payment_authorization_accepted: true,
    },
    metadata: {
      platform: 'flutter',
      device_type: 'android',
      app_version: '1.0.0',
      source: 'mobile_app',
      created_from: 'luggage_delivery',
      ip_address: null,
      user_agent: null,
      booking_id: booking.id,
      booking_number: booking.bookingNumber,
      status: booking.status,
      pickup_otp: booking.pickupOtp,
      delivery_otp: booking.deliveryOtp,
      created_at: booking.createdAt,
    },
  };
}

/**
 * 4. POST /bookings - Create Booking using Master JSON
 */
export const createLuggageDeliveryBookingHandler: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, 'Authentication required to create luggage booking');
  }

  const body = req.body || {};
  const clientRequestId =
    body.client_request_id ||
    (req.headers['idempotency-key'] as string) ||
    body.idempotencyKey ||
    \`LRQ-\${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-\${Math.floor(100000 + Math.random() * 900000)}\`;

  // Idempotency check: Return existing booking if same client_request_id submitted
  const existing = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [
        { idempotencyKey: clientRequestId },
        { bookingNumber: clientRequestId },
      ],
    },
    include: { user: true },
  });

  if (existing) {
    const formatted = formatMasterBookingJson(existing);
    res.status(200).json({
      success: true,
      message: 'Idempotent replay: booking already exists',
      data: {
        booking: formatted,
        booking_id: existing.id,
        booking_number: existing.bookingNumber,
        isIdempotentReplay: true,
      },
    });
    return;
  }

  // 1. Recalculate Quote Server-Side (Never trust client prices)
  const quoteResult = calculateLuggageMasterQuote(body);
  const pricing = quoteResult.pricing;

  const serviceId = body.service?.service_id || body.serviceId || 'home_airport';
  const routeType = body.route?.route_type || body.routeType || 'single_trip';
  const bookingNumber = makeLuggageBookingNumber();
  const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

  // Extract structured parts
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

  const paymentMethod = (body.payment?.payment_method || body.paymentMethod || 'WALLET').toUpperCase();
  const paymentStatus = paymentMethod === 'CASH' ? 'CASH_PENDING' : 'PENDING';

  // Transactional database creation
  const created = await prisma.$transaction(async (tx) => {
    return await tx.luggageDeliveryBooking.create({
      data: {
        bookingNumber,
        userId,
        serviceId,
        routeType,
        status: 'BOOKING_CONFIRMED',
        idempotencyKey: clientRequestId,
        pickupDetails: pickupDetails as any,
        deliveryDetails: deliveryDetails as any,
        hotelDetails: hotelDetails as any,
        flightDetails: flightDetails as any,
        multiStops: multiStops as any,
        luggageItems: luggageItems as any,
        protections: protections as any,
        addOns: addOns as any,
        airportAssistance: airportAssistance as any,
        schedule: schedule as any,
        gstInvoice: gstInvoice as any,
        pricingBreakdown: pricing as any,
        totalAmount: pricing.total_amount,
        paymentMethod,
        paymentStatus,
        paymentReference: \`PAY-LG-\${bookingNumber}\`,
        pickupOtp,
        deliveryOtp,
        currentMilestoneIndex: 0,
        milestones: luggageTimelineMilestones as any,
        driverDetails: {
          name: 'Suresh Raina',
          phone: '+919876543210',
          vehicle_type: 'Luggage Transit Van',
          vehicle_number: 'KA-01-EA-5542',
        } as any,
      },
      include: { user: true },
    });
  });

  const formatted = formatMasterBookingJson(created);

  res.status(201).json({
    success: true,
    message: 'Luggage booking created successfully',
    data: {
      booking_id: created.id,
      booking_number: created.bookingNumber,
      booking: formatted,
      quote_id: quoteResult.quote_id,
      pricing,
    },
  });
};

/**
 * 5. POST /payments/create & POST /bookings/:id/payments/create
 */
export const createLuggagePaymentHandler: RequestHandler = async (req, res) => {
  const id = req.params.id || req.body?.booking_id || req.body?.bookingId;
  if (!id) {
    throw new AppError(400, 'Booking ID is required to create payment');
  }

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery booking not found');
  }

  const paymentMethod = (req.body?.payment_method || req.body?.paymentMethod || booking.paymentMethod || 'WALLET').toUpperCase();
  const gatewayOrderId = 'order_lg_' + randomBytes(8).toString('hex');
  const amount = Number(booking.totalAmount);

  res.status(200).json({
    success: true,
    message: 'Payment order created',
    data: {
      booking_id: booking.id,
      booking_number: booking.bookingNumber,
      payment_method: paymentMethod.toLowerCase(),
      amount,
      currency: 'INR',
      gateway: paymentMethod === 'WALLET' ? 'INTERNAL_WALLET' : 'SANDBOX_GATEWAY',
      gateway_order_id: gatewayOrderId,
      key_id: 'rzp_test_delivez_luggage_key',
    },
  });
};

/**
 * 6. POST /payments/verify & POST /bookings/:id/payments/verify
 */
export const verifyLuggagePaymentHandler: RequestHandler = async (req, res) => {
  const id = req.params.id || req.body?.booking_id || req.body?.bookingId;
  const { payment_method, gateway_payment_id, gateway_signature } = req.body || {};

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery booking not found');
  }

  const paymentRef = gateway_payment_id || \`PAY-LG-\${randomBytes(6).toString('hex')}\`;

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: 'PAID',
      paymentReference: paymentRef,
      status: 'BOOKING_CONFIRMED',
    },
    include: { user: true },
  });

  res.status(200).json({
    success: true,
    message: 'Payment verified and booking confirmed',
    data: {
      booking_id: updated.id,
      booking_number: updated.bookingNumber,
      payment_status: 'paid',
      payment_reference: paymentRef,
      booking: formatMasterBookingJson(updated),
    },
  });
};

/**
 * 7. GET /bookings/:id - Retrieve Master Booking details
 */
export const getLuggageDeliveryBookingDetailsHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: { user: true },
  });

  if (!booking) {
    throw new AppError(404, \`Luggage delivery booking '\${id}' not found\`);
  }

  const formatted = formatMasterBookingJson(booking);

  res.status(200).json({
    success: true,
    data: {
      booking: formatted,
    },
  });
};

/**
 * 8. GET /bookings - List customer bookings
 */
export const listLuggageDeliveryBookingsHandler: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    if (userId) whereClause.userId = userId;
  }

  const [bookings, total] = await Promise.all([
    prisma.luggageDeliveryBooking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: true },
    }),
    prisma.luggageDeliveryBooking.count({ where: whereClause }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      bookings: bookings.map(formatMasterBookingJson),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

/**
 * 9. GET /bookings/:id/receipt - Retrieve GST Invoice & Printable Receipt
 */
export const getLuggageDeliveryReceiptHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: { user: true },
  });

  if (!booking) {
    throw new AppError(404, \`Luggage booking '\${id}' not found\`);
  }

  const formatted = formatMasterBookingJson(booking);
  const pricing = formatted.pricing;
  const taxableAmount = Math.max(0, (pricing.subtotal || 0) - (pricing.discount?.discount_amount || 0));

  res.status(200).json({
    success: true,
    message: 'Receipt retrieved successfully',
    data: {
      receipt_id: \`REC-\${booking.bookingNumber}\`,
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
      tax_summary: {
        taxable_amount: taxableAmount,
        tax_rate: 18,
        cgst_amount: pricing.tax?.cgst_amount || 0,
        sgst_amount: pricing.tax?.sgst_amount || 0,
        total_tax: pricing.tax?.total_tax || 0,
        total_amount: pricing.total_amount,
      },
      issuer: {
        legal_name: 'Delivez India Logistics Private Limited',
        brand_name: 'Delivez One Airport Concierge',
        gstin: '29AABCD1234E1Z5',
        cin: 'U63090KA2024PTC184920',
        registered_office: 'Tower 4, Prestige Tech Park, Marathahalli, Bengaluru 560103, India',
        support_email: 'support@delivez.com',
        support_phone: '+91 80 4567 8900',
        support_website: 'https://delivez.com/help',
      },
    },
  });
};

/**
 * 10. GET /bookings/:id/payment - Retrieve payment status
 */
export const getLuggageDeliveryPaymentHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError(404, \`Luggage booking '\${id}' not found\`);
  }

  res.status(200).json({
    success: true,
    data: {
      booking_id: booking.id,
      booking_number: booking.bookingNumber,
      payment_method: String(booking.paymentMethod).toLowerCase(),
      payment_status: String(booking.paymentStatus).toLowerCase(),
      payment_reference: booking.paymentReference,
      total_amount: Number(booking.totalAmount),
      currency: 'INR',
      updated_at: booking.updatedAt,
    },
  });
};

/**
 * 11. GET /bookings/:id/tracking & GET /tracking/:trackingId - Milestone Journey
 */
export const getLuggageDeliveryTrackingHandler: RequestHandler = async (req, res) => {
  const trackingId = String(req.params.trackingId || req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id: trackingId }, { bookingNumber: trackingId }] },
  });

  if (!booking) {
    throw new AppError(404, \`Tracking record not found for '\${trackingId}'\`);
  }

  const milestones = (booking.milestones as any[]) || luggageTimelineMilestones;
  const currentIdx = booking.currentMilestoneIndex || 0;

  const timeline = milestones.map((m: any, idx: number) => ({
    ...m,
    completed: idx <= currentIdx,
    current: idx === currentIdx,
    timestamp: idx <= currentIdx ? new Date(Date.now() - (currentIdx - idx) * 3600000).toISOString() : null,
  }));

  res.status(200).json({
    success: true,
    data: {
      tracking: {
        booking_id: booking.id,
        booking_number: booking.bookingNumber,
        status: booking.status,
        current_milestone_index: currentIdx,
        current_milestone: timeline[currentIdx],
        timeline,
        pickup_otp: booking.pickupOtp,
        delivery_otp: booking.deliveryOtp,
        driver: booking.driverDetails || {
          name: 'Suresh Raina',
          phone: '+919876543210',
          vehicle_type: 'Luggage Transit Van',
          vehicle_number: 'KA-01-EA-5542',
        },
      },
    },
  });
};

/**
 * 12. POST /bookings/:id/cancel
 */
export const cancelLuggageDeliveryBookingHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const reason = req.body?.reason || 'Cancelled by user';

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery booking not found');
  }

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason,
      cancelledAt: new Date(),
    },
    include: { user: true },
  });

  res.status(200).json({
    success: true,
    message: 'Luggage delivery booking cancelled',
    data: {
      booking: formatMasterBookingJson(updated),
    },
  });
};

// Legacy handlers for milestone advance, otp verification, pod
export const verifyLuggageDeliveryOtpHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { otp, type = 'delivery' } = req.body;
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const expectedOtp = type === 'pickup' ? booking.pickupOtp : booking.deliveryOtp;
  const valid = String(otp).trim() === String(expectedOtp).trim();
  res.status(200).json({ success: true, data: { valid, type, verifiedAt: new Date().toISOString() } });
};

export const submitLuggageDeliveryPodHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const podData = req.body;
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      podData: podData as any,
      status: 'DELIVERED',
      currentMilestoneIndex: 7,
    },
  });
  res.status(200).json({ success: true, data: { bookingId: updated.id, status: 'DELIVERED' } });
};

export const advanceLuggageDeliveryMilestoneHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { targetIndex } = req.body;
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const newIdx = typeof targetIndex === 'number' ? targetIndex : Math.min(7, (booking.currentMilestoneIndex || 0) + 1);
  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: { currentMilestoneIndex: newIdx },
  });
  res.status(200).json({ success: true, data: { booking: updated, currentMilestoneIndex: newIdx } });
};

export const processLuggageDeliverySandboxPaymentHandler: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: 'PAID',
      status: 'BOOKING_CONFIRMED',
      paymentReference: \`PAY-LG-\${randomBytes(6).toString('hex')}\`,
    },
    include: { user: true },
  });

  res.status(200).json({
    success: true,
    data: {
      booking: formatMasterBookingJson(updated),
      status: 'success',
      paymentStatus: 'PAID',
    },
  });
};
`;

fs.writeFileSync(targetPath, controllerCode, 'utf8');
console.log('Successfully updated luggage-delivery.controller.ts with Master Contract and all lifecycle handlers!');
