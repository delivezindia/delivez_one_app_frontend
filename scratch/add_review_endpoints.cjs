const fs = require('fs');
const path = require('path');

// 1. Update controller
const ctrlPath = path.resolve(__dirname, '../../Delivery_app_site_backend/src/modules/confidential-delivery/confidential-delivery.controller.ts');
let ctrl = fs.readFileSync(ctrlPath, 'utf8');

if (!ctrl.includes('getBookingReviewHandler')) {
  const codeToAdd = `
export const getBookingReviewHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const booking = await prisma.confidentialCourierBooking.findFirst({
    where: {
      OR: [{ id: String(id) }, { bookingNumber: String(id) }],
    },
    select: {
      id: true,
      bookingNumber: true,
      status: true,
      rating: true,
      reviewText: true,
      updatedAt: true,
    },
  });

  if (!booking) throw new AppError(404, 'Vault booking not found.');

  res.status(200).json({
    status: 'success',
    data: {
      vaultId: booking.bookingNumber,
      hasReview: booking.rating != null,
      rating: booking.rating,
      reviewText: booking.reviewText,
      updatedAt: booking.updatedAt,
    },
  });
};
`;
  ctrl = ctrl.replace(
    'export const submitBookingReviewHandler: RequestHandler = async (req, res) => {',
    codeToAdd + '\nexport const submitBookingReviewHandler: RequestHandler = async (req, res) => {'
  );
  fs.writeFileSync(ctrlPath, ctrl, 'utf8');
  console.log('Added getBookingReviewHandler to controller.');
} else {
  console.log('getBookingReviewHandler already exists in controller.');
}

// 2. Update routes
const routesPath = path.resolve(__dirname, '../../Delivery_app_site_backend/src/modules/confidential-delivery/confidential-delivery.routes.ts');
let routes = fs.readFileSync(routesPath, 'utf8');

if (!routes.includes('getBookingReviewHandler')) {
  routes = routes.replace('submitBookingReviewHandler,', 'submitBookingReviewHandler,\n  getBookingReviewHandler,');
  routes = routes.replace(
    "confidentialDeliveryRouter.post('/quote', getQuote);",
    "confidentialDeliveryRouter.post('/quote', getQuote);\nconfidentialDeliveryRouter.post('/order-review', getQuote);\nconfidentialDeliveryRouter.post('/preview', getQuote);"
  );
  routes = routes.replace(
    "// Review & Feedback endpoints",
    "// Review & Feedback endpoints\nconfidentialDeliveryRouter.get('/bookings/:id/review', getBookingReviewHandler);\nconfidentialDeliveryRouter.get('/:id/review', getBookingReviewHandler);"
  );
  fs.writeFileSync(routesPath, routes, 'utf8');
  console.log('Updated routes with getBookingReviewHandler and order-review aliases.');
} else {
  console.log('getBookingReviewHandler already exists in routes.');
}
