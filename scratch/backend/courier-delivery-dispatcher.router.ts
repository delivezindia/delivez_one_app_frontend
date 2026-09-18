import { Router } from 'express';
import { personalCourierRouter } from '../personal-courier/personal-courier.routes.js';
import { vaultCourierRouter } from './vault-courier.routes.js';
import { CANONICAL_SERVICES } from './vault-courier.validation.js';
import { prisma } from '../../lib/prisma.js';

export const courierDeliveryDispatcherRouter = Router();

// 1. Direct dispatch for Payments & Receipts
courierDeliveryDispatcherRouter.use('/payments', vaultCourierRouter);
courierDeliveryDispatcherRouter.use('/receipts', vaultCourierRouter);

// 2. Booking specific payment & receipt endpoints:
// /bookings/:bookingId/payment and /bookings/:bookingId/receipt
courierDeliveryDispatcherRouter.get('/bookings/:bookingId/payment', (req, res, next) => {
  return vaultCourierRouter(req, res, next);
});
courierDeliveryDispatcherRouter.get('/bookings/:bookingId/receipt', (req, res, next) => {
  return vaultCourierRouter(req, res, next);
});

// 3. Dispatch for POST /bookings
courierDeliveryDispatcherRouter.post('/bookings', (req, res, next) => {
  const serviceType = req.body?.service_type || req.body?.serviceType;
  if (
    CANONICAL_SERVICES.includes(serviceType) ||
    (typeof serviceType === 'string' && serviceType.toLowerCase().includes('vault'))
  ) {
    return vaultCourierRouter(req, res, next);
  }
  return personalCourierRouter(req, res, next);
});

// 4. Dispatch for /bookings/:id (GET, PUT, PATCH, DELETE)
courierDeliveryDispatcherRouter.all('/bookings/:id', async (req, res, next) => {
  const id = String(req.params.id || '');
  if (id.startsWith('CV-') || id.startsWith('DV-')) {
    return vaultCourierRouter(req, res, next);
  }
  try {
    const vaultExists = await prisma.vaultCourierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
      select: { id: true },
    });
    if (vaultExists) {
      return vaultCourierRouter(req, res, next);
    }
  } catch {}
  return personalCourierRouter(req, res, next);
});

// 5. Dispatch for GET /bookings
courierDeliveryDispatcherRouter.get('/bookings', async (req, res, next) => {
  const serviceType = req.query?.service_type || req.query?.serviceType;
  if (
    serviceType &&
    (CANONICAL_SERVICES.includes(serviceType as any) ||
      String(serviceType).toLowerCase().includes('vault'))
  ) {
    return vaultCourierRouter(req, res, next);
  }
  // If user calls GET /courier-delivery/bookings without filters, default to vaultCourierRouter
  return vaultCourierRouter(req, res, () => personalCourierRouter(req, res, next));
});

// 6. Fallback for other routes (options, quotes, track, etc.)
courierDeliveryDispatcherRouter.use(vaultCourierRouter);
courierDeliveryDispatcherRouter.use(personalCourierRouter);
