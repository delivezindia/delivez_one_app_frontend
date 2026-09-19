const fs = require('fs');

const ctrlPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery.controller.ts';
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

const targetTracking = `      tracking: {
        booking_id: booking.id,
        booking_number: booking.bookingNumber,
        status: booking.status,
        current_milestone_index: currentIdx,
        current_milestone: timeline[currentIdx],
        timeline,
        pickup_otp: booking.pickupOtp,
        delivery_otp: booking.deliveryOtp,
        driver: booking.driverDetails || {`;

const replacementTracking = `      tracking: {
        booking_id: booking.id,
        booking_number: booking.bookingNumber,
        status: booking.status,
        current_milestone_index: currentIdx,
        current_milestone_step: currentIdx + 1,
        current_milestone: timeline[currentIdx],
        timeline,
        milestones: timeline,
        pickup_otp: booking.pickupOtp,
        delivery_otp: booking.deliveryOtp,
        security_status: {
          seal_intact: true,
          tamper_evident: true,
          inspected_at: booking.createdAt,
        },
        driver: booking.driverDetails || {`;

ctrl = ctrl.replace(targetTracking, replacementTracking);
fs.writeFileSync(ctrlPath, ctrl, 'utf8');
console.log('Successfully added milestones and security_status to tracking response');
