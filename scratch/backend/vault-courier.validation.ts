import { AppError } from '../../lib/app-error.js';

export const CANONICAL_SERVICES = [
  'Vault Secure',
  'Vault Priority',
  'Vault Direct',
  'Vault Precise',
  'Vault Hand Carry',
  'Vault Return',
  'Vault Exchange',
  'Vault Critical',
  'Vault MultiPoint',
] as const;

export type CanonicalServiceType = (typeof CANONICAL_SERVICES)[number];

export interface ValidationErrorDetail {
  [field: string]: string[];
}

export function validateCanonicalBookingPayload(payload: any): {
  serviceType: CanonicalServiceType;
  errors: ValidationErrorDetail;
} {
  const errors: ValidationErrorDetail = {};

  const addError = (field: string, message: string) => {
    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field].push(message);
  };

  if (!payload || typeof payload !== 'object') {
    throw new AppError({
      message: 'Validation failed: Request body must be an object',
      statusCode: 400,
      code: 'VALIDATION_FAILED',
    });
  }

  // 1. Service Type Validation
  const serviceTypeRaw = payload.service_type || payload.serviceType;
  if (!serviceTypeRaw || typeof serviceTypeRaw !== 'string') {
    addError('service_type', 'service_type is required and must be a string.');
  } else if (!CANONICAL_SERVICES.includes(serviceTypeRaw as CanonicalServiceType)) {
    addError(
      'service_type',
      `Invalid service_type "${serviceTypeRaw}". Must be one of: ${CANONICAL_SERVICES.join(', ')}`
    );
  }
  const serviceType = serviceTypeRaw as CanonicalServiceType;

  // 2. Step 1: Pickup Location Validation
  const step1 = payload.step_1_pickup_location || payload.step1 || {};
  const pickupLoc = step1.pickup_location || payload.pickup || {};

  if (!pickupLoc.contact_name && !pickupLoc.contactName) {
    addError('step_1_pickup_location.pickup_location.contact_name', 'Contact name is required for pickup.');
  }

  const pickupMobile = pickupLoc.mobile_number || pickupLoc.mobileNumber || pickupLoc.phoneNumber;
  if (!pickupMobile) {
    addError('step_1_pickup_location.pickup_location.mobile_number', 'Mobile number is required for pickup.');
  } else if (typeof pickupMobile === 'string' && pickupMobile.replace(/\D/g, '').length < 7) {
    addError('step_1_pickup_location.pickup_location.mobile_number', 'Valid mobile number is required.');
  }

  const pickupAddress = pickupLoc.complete_pickup_address || pickupLoc.addressLine1 || pickupLoc.completeAddress;
  if (!pickupAddress) {
    addError(
      'step_1_pickup_location.pickup_location.complete_pickup_address',
      'Complete pickup address is required.'
    );
  }

  // 3. Step 2: Recipient & Delivery Location Validation
  const step2 = payload.step_2_recipient_and_delivery || payload.step2 || {};
  const deliveryLoc = step2.delivery_location || payload.delivery || payload.dropoff || {};

  if (!deliveryLoc.contact_name && !deliveryLoc.contactName) {
    addError(
      'step_2_recipient_and_delivery.delivery_location.contact_name',
      'Contact name is required for recipient/delivery.'
    );
  }

  const deliveryMobile = deliveryLoc.mobile_number || deliveryLoc.mobileNumber || deliveryLoc.phoneNumber;
  if (!deliveryMobile) {
    addError(
      'step_2_recipient_and_delivery.delivery_location.mobile_number',
      'Mobile number is required for recipient/delivery.'
    );
  } else if (typeof deliveryMobile === 'string' && deliveryMobile.replace(/\D/g, '').length < 7) {
    addError('step_2_recipient_and_delivery.delivery_location.mobile_number', 'Valid mobile number is required.');
  }

  const deliveryAddress = deliveryLoc.complete_delivery_address || deliveryLoc.addressLine1 || deliveryLoc.completeAddress;
  if (!deliveryAddress) {
    addError(
      'step_2_recipient_and_delivery.delivery_location.complete_delivery_address',
      'Complete delivery address is required.'
    );
  }

  // 4. Service-Specific Validation
  const serviceSpecificSetup = step2.service_specific_setup || payload.serviceSpecificSetup || {};

  switch (serviceType) {
    case 'Vault Direct': {
      const direct = serviceSpecificSetup['Vault Direct'] || payload.directDetails || {};
      if (!direct.delivery_type && !direct.deliveryType) {
        addError('service_specific_setup.Vault Direct.delivery_type', 'Delivery type is required for Vault Direct.');
      }
      break;
    }

    case 'Vault Precise': {
      const precise = serviceSpecificSetup['Vault Precise'] || payload.preciseDetails || {};
      const precision = precise.delivery_precision || precise;
      if (!precision.delivery_date && !precision.deliveryDate) {
        addError('service_specific_setup.Vault Precise.delivery_precision.delivery_date', 'Delivery date is required for Vault Precise.');
      }
      if (!precision.preferred_time_window && !precision.timeWindow && !precision.preferredTimeWindow) {
        addError('service_specific_setup.Vault Precise.delivery_precision.preferred_time_window', 'Preferred time window is required for Vault Precise.');
      }
      break;
    }

    case 'Vault Hand Carry': {
      const handCarry = serviceSpecificSetup['Vault Hand Carry'] || payload.handCarryDetails || {};
      const details = handCarry.hand_carry_details || handCarry;
      if (!details.hand_carry_type && !details.handCarryType) {
        addError('service_specific_setup.Vault Hand Carry.hand_carry_details.hand_carry_type', 'Hand carry item type is required.');
      }
      if (!details.executive_level && !details.executiveLevel) {
        addError('service_specific_setup.Vault Hand Carry.hand_carry_details.executive_level', 'Executive level is required.');
      }
      break;
    }

    case 'Vault Return': {
      const returnSetup = serviceSpecificSetup['Vault Return'] || payload.returnDetails || {};
      const details = returnSetup.return_details || returnSetup;
      if (!details.return_type && !details.returnType) {
        addError('service_specific_setup.Vault Return.return_details.return_type', 'Return type is required for Vault Return.');
      }
      break;
    }

    case 'Vault Critical': {
      const critical = serviceSpecificSetup['Vault Critical'] || payload.criticalDetails || {};
      const details = critical.critical_details || critical;
      if (!details.critical_shipment_type && !details.criticalShipmentType && !details.shipmentType) {
        addError('service_specific_setup.Vault Critical.critical_details.critical_shipment_type', 'Critical shipment type is required.');
      }
      break;
    }

    case 'Vault MultiPoint': {
      const multiPoint = serviceSpecificSetup['Vault MultiPoint'] || payload.multipointDetails || {};
      const points = multiPoint.delivery_points || multiPoint.stops || [];
      if (!Array.isArray(points) || points.length < 2) {
        addError('service_specific_setup.Vault MultiPoint.delivery_points', 'At least 2 delivery stops are required for MultiPoint delivery.');
      } else {
        points.forEach((stop: any, idx: number) => {
          const stopAddress = stop.address || stop.stop_address;
          if (!stopAddress) {
            addError(`service_specific_setup.Vault MultiPoint.delivery_points[${idx}].address`, `Address is required for stop ${idx + 1}.`);
          }
        });
      }
      break;
    }

    case 'Vault Exchange': {
      // Per Section 6: If Exchange fields are present, validate them; otherwise accept structural placeholder
      const exchange = serviceSpecificSetup['Vault Exchange'] || payload.exchangeDetails || {};
      if (exchange.exchangeType && !exchange.outgoingItem && !exchange.incomingItem) {
        addError('service_specific_setup.Vault Exchange.items', 'Exchange items description is required.');
      }
      break;
    }

    case 'Vault Secure':
    case 'Vault Priority':
    default:
      // Common booking flow
      break;
  }

  // 5. Step 3: Item Type & Information Validation
  const step3 = payload.step_3_item_type_and_information || payload.step3 || {};
  const itemInfo = step3.item_information || payload.item || {};
  const itemName =
    itemInfo.item_name_description ||
    itemInfo.itemName ||
    step3.selected_top_item_type ||
    payload.itemDescription;

  if (!itemName) {
    addError(
      'step_3_item_type_and_information.item_information.item_name_description',
      'Item name or description is required.'
    );
  }

  return { serviceType, errors };
}
