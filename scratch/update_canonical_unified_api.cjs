const fs = require('fs');
const path = require('path');

console.log('>>> Preparing update_canonical_unified_api.cjs...');

const backendDir = 'C:/Users/Rax/Desktop/Delivery_app_site_backend';
const scratchDir = 'c:/Users/Rax/Desktop/Delivery_app_web/scratch';

// 1. Read existing scratch/vault-courier.controller.ts
let ctrl = fs.readFileSync(path.join(scratchDir, 'vault-courier.controller.ts'), 'utf8');

// A. Insert DEFAULT_SERVICE_API_MAPPING and CANONICAL_BOOKING_TEMPLATE right after defaultAvailableServices
const defaultServiceApiMappingCode = `
export const DEFAULT_SERVICE_API_MAPPING = {
  'Vault Secure': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: null,
  },
  'Vault Priority': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: null,
  },
  'Vault Direct': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Direct',
  },
  'Vault Precise': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Precise',
  },
  'Vault Hand Carry': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Hand Carry',
  },
  'Vault Return': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Return',
  },
  'Vault Exchange': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Exchange',
    source_fields_available: false,
  },
  'Vault Critical': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault Critical',
  },
  'Vault MultiPoint': {
    step_0: true,
    step_1: true,
    step_2: true,
    step_3: true,
    step_4: true,
    step_5: true,
    step_6: true,
    step_7: true,
    service_specific_step: 'step_2.service_specific_setup.Vault MultiPoint',
  },
};

export const CANONICAL_BOOKING_TEMPLATE = {
  service_type: 'Vault Secure',

  step_0_service_type: {
    selected_service: 'Vault Secure',
    available_services: defaultAvailableServices,
  },

  step_1_pickup_location: {
    pickup_location: {
      pickup_type: 'Business',
      pickup_type_options: [
        'Business',
        'Home',
      ],
      contact_name: '',
      mobile_number: '',
      company_organization: '',
      gstin: '',
      complete_pickup_address: '',
      city: '',
      state: '',
      pin_code: '',
      use_my_location: false,
    },
    pickup_contact_person: {
      contact_person: '',
      designation: '',
      alternate_mobile: '',
      email: '',
    },
    pickup_timing: {
      pickup_date: '',
      pickup_time_window: '',
      preferred_time: '',
    },
    pickup_special_instructions: '',
    pickup_access_requirements: {
      security_check: false,
      visitor_pass: false,
      lift_access: false,
      id_proof: false,
      parking: false,
    },
  },

  step_2_recipient_and_delivery: {
    delivery_location: {
      delivery_type: 'Business',
      delivery_type_options: [
        'Business',
        'Home',
      ],
      contact_name: '',
      mobile_number: '',
      company_organization: '',
      gstin: '',
      complete_delivery_address: '',
      city: '',
      state: '',
      pin_code: '',
      use_my_location: false,
    },
    delivery_contact_person: {
      contact_person: '',
      designation: '',
      alternate_mobile: '',
      email: '',
    },
    delivery_timing: {
      preferred_delivery_date: '',
      preferred_time_window: '',
      customer_available: '',
    },
    delivery_special_instructions: '',
    delivery_access_requirements: {
      security_check: false,
      visitor_pass: false,
      lift_access: false,
      id_proof: false,
      parking: false,
    },
    service_specific_setup: {
      'Vault Secure': {
        setup_present_in_source: false,
        uses_common_booking_steps: true,
      },
      'Vault Priority': {
        setup_present_in_source: false,
        uses_common_booking_steps: true,
      },
      'Vault Direct': {
        delivery_type: 'Direct Delivery',
        delivery_type_options: [
          'Direct Delivery',
          'Direct Express',
          'Same Day Direct',
        ],
        pickup_location: {
          pickup_address: '',
          use_current_location: false,
        },
        delivery_location: {
          delivery_address: '',
          use_current_location: false,
        },
        delivery_preferences: {
          preferred_delivery_date: '',
          preferred_time_window: '',
          timezone: 'IST (GMT +05:30)',
          special_instructions: '',
        },
        handling_options: {
          single_point_handling: true,
          avoid_hubs_sorting: true,
          sealed_secure: true,
          delivery_alerts: true,
        },
        contact_and_verification: {
          recipient_contact: '',
          verification_method: '',
          alternate_contact: '',
        },
      },
      'Vault Precise': {
        delivery_precision: {
          delivery_date: '',
          preferred_time_window: '',
          timezone: 'IST (GMT +05:30)',
          delivery_deadline_hard_cutoff: '',
          early_delivery_not_allowed: true,
        },
        delivery_location: {
          delivery_address: '',
          edit_address: false,
          delivery_instructions: '',
          landmark: '',
        },
        recipient_and_verification: {
          recipient_name: '',
          recipient_contact: '',
          verification_method: '',
          recipient_must_be_available_within_time_window: true,
          alternate_contact: '',
        },
        handling_and_service_options: {
          handling_option: 'Precise Delivery',
          handling_option_options: [
            'Precise Delivery',
            'Precise + Priority',
            'Precise + Signature',
            'Photo Proof',
          ],
        },
        special_instructions: '',
      },
      'Vault Hand Carry': {
        hand_carry_details: {
          hand_carry_type: 'Confidential Documents',
          hand_carry_type_options: [
            'Confidential Documents',
            'High Value Item',
            'Priority Delivery',
          ],
          executive_level: 'Verified Executive',
          declared_value: '',
          preferred_handover_slot: '',
        },
        executive_and_handover_instructions: {
          dedicated_executive: true,
          id_check_on_pickup: true,
          id_check_on_delivery: true,
          signature_at_handover: true,
          no_unattended_delivery: true,
          recipient_must_be_present: false,
        },
        monitoring_and_security: {
          real_time_tracking_and_alerts: true,
          chain_of_custody: true,
          photo_proof_at_delivery: true,
          confidential_handling: true,
          escalation_contact_required: true,
        },
        special_instructions: '',
      },
      'Vault Return': {
        return_details: {
          return_type: 'Return to Sender',
          return_type_options: [
            'Return to Sender',
            'Return to Another Location',
          ],
          return_reason: '',
          rma_reference_number: '',
          return_instruction: '',
          expected_return_date: '',
        },
        return_address: {
          address_mode: 'Same as Pickup Address',
          address_mode_options: [
            'Same as Pickup Address',
            'Use Different Address',
          ],
          return_address_preview: '',
          edit_address: false,
        },
        return_collection_preference: {
          collection_date_preference: '',
          collection_time_window: '',
          pickup_instructions_for_return: '',
        },
      },
      'Vault Exchange': {
        setup_present_in_source: false,
        source_component_referenced: 'ExchangeSetupScreen',
        source_component_implementation_found: false,
        fields: {},
      },
      'Vault Critical': {
        critical_details: {
          critical_shipment_type: 'High Value',
          critical_shipment_type_options: [
            'High Value',
            'Time Critical',
            'Confidential',
          ],
          critical_level: 'Level 1 - Highest',
          declared_value: '',
          sla_delivery_commitment: 'Select SLA',
        },
        security_and_handling_instructions: {
          tamper_proof_sealing: true,
          single_point_of_contact: true,
          secure_storage_at_hubs: true,
          armed_escort_if_available: false,
          no_unattended_delivery: true,
          photo_proof_at_every_stage: true,
        },
        priority_and_monitoring: {
          priority_handling: 'Highest Priority',
          real_time_tracking_and_alerts: true,
          delay_alert_threshold: '15 minutes',
        },
        special_instructions: '',
      },
      'Vault MultiPoint': {
        route_summary: {
          total_stops: 0,
          estimated_distance: '',
          estimated_time: '',
          service_type: 'Multi Point Delivery',
        },
        delivery_points: [
          {
            stop_number: 1,
            stop_name: '',
            subtitle: '',
            address: '',
            contact_person: '',
            eta: '',
          },
        ],
        delivery_point_actions: {
          add_stop: true,
          edit_stop: true,
          delete_stop: true,
          reorder_stops: true,
          optimize_route: false,
        },
        additional_options: {
          time_window_for_each_stop: false,
          notify_recipients: true,
          collect_pod_at_each_stop: false,
          return_to_origin_if_undelivered: false,
        },
        special_instructions: '',
      },
    },
  },

  step_3_item_type_and_information: {
    selected_top_item_type: '',
    top_item_type_options: [
      'Confidential Documents',
      'Legal Documents',
      'Contracts / Agreements',
      'Financial Documents',
      'Official Documents',
      'Original Certificates',
      'Sealed Envelope',
      'Sensitive Records',
      'Secure Package',
    ],
    other_item_type: '',
    item_information: {
      item_name_description: '',
      item_category: '',
      item_type: 'Document',
      item_type_options: [
        'Document',
        'Parcel',
        'Other',
      ],
      number_of_pieces: 1,
      weight_actual: '',
      weight_unit: 'kg',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'cm',
      },
      declared_value: '',
      content_type: '',
      item_contents_description: '',
    },
    attachments: [],
    item_handling: {
      fragile: false,
      handle_with_care: false,
      this_side_up: false,
      keep_dry: false,
      do_not_stack: false,
      high_value: false,
    },
  },

  step_4_packaging_options: {
    selected_package: 'Standard Box',
    package_type_options: [
      'Standard Box',
      'Padded Envelope',
      'Tamper Proof Pouch',
      'Bubble Wrap',
      'Heavy Duty Crate',
      'Document Sleeve',
      'My Own Package',
    ],
    add_on_protection: {
      extra_bubble_wrap: false,
      corner_guard: false,
      waterproof_cover: false,
      fragile_sticker: false,
      seal_and_security_tape: false,
    },
    packaging_instructions: '',
    packaging_preview: {
      selected_packaging: '',
      protection_level: '',
      suitable_for: '',
    },
  },

  step_5_security_level: {
    selected_security_level: 'Standard Security',
    security_level_options: [
      'Standard Security',
      'Enhanced Security',
      'Maximum Security',
    ],
    security_features: {
      real_time_gps_tracking: true,
      delivery_alerts_and_notifications: true,
      armed_escort: false,
      secure_storage_at_hubs: true,
      restricted_access: true,
    },
    additional_instructions: '',
  },

  step_6_verification: {
    selected_verification: 'OTP Verification',
    verification_method_options: [
      'OTP Verification',
      'ID Proof Verification',
      'Signature Verification',
      'Face Verification',
      'Authorized Person Verification',
      'PIN Verification',
    ],
    capture_photo_of_recipient: true,
    capture_photo_of_id_proof: false,
  },

  step_7_review_and_confirmation: {
    shipment_summary: {
      item_type: '',
      security_level: '',
      packaging: '',
    },
    pickup_and_delivery_summary: {
      pickup_date: '',
      pickup_time: '',
      delivery_date: '',
      delivery_time: '',
      pickup_details: '',
      delivery_details: '',
    },
    recipient_summary: {
      recipient_name: '',
      recipient_contact: '',
      delivery_address: '',
    },
    additional_services: {},
    price_details: {
      base_price: '',
      additional_charges: '',
      total_amount: '',
    },
    agree_terms: true,
  },

  service_api_mapping: DEFAULT_SERVICE_API_MAPPING,
};
`;

if (!ctrl.includes('DEFAULT_SERVICE_API_MAPPING')) {
  // We place defaultAvailableServices first, then DEFAULT_SERVICE_API_MAPPING, then CANONICAL_BOOKING_TEMPLATE
  ctrl = ctrl.replace(
    'export const defaultAvailableServices = [',
    '// Temporary marker'
  );
  ctrl = ctrl.replace(
    '// Temporary marker',
    'export const defaultAvailableServices = ['
  );
}

// B. Update Vault Exchange in defaultServiceSetups
const oldExchange = `    'Vault Exchange': {
      setup_present_in_source: true,
      source_component_referenced: 'ExchangeSetupSection',
      source_component_implementation_found: true,
      fields: {
        exchangeType: 'Two-Way Document Exchange',
        exchangeReason: 'Signed Contract / Deed Swap',
        exchangeId: '',
        outgoingItem: '',
        incomingItem: '',
        exchangeInstructions: '',
        expectedExchangeDate: '',
        swapTimeWindow: '10:00 AM - 12:00 PM',
        sameAsPickup: true,
        customReturnAddress: '',
      },
    },`;

const newExchange = `    'Vault Exchange': {
      setup_present_in_source: false,
      source_component_referenced: 'ExchangeSetupScreen',
      source_component_implementation_found: false,
      fields: (serviceDetails && Object.keys(serviceDetails).length > 0)
        ? (serviceDetails.fields || serviceDetails)
        : {},
    },`;

if (ctrl.includes(oldExchange)) {
  ctrl = ctrl.replace(oldExchange, newExchange);
  console.log('✓ Updated Vault Exchange template in defaultServiceSetups.');
}

// C. In serializeCanonicalBooking, add service_api_mapping: DEFAULT_SERVICE_API_MAPPING
const oldStep7End = `      agree_terms: b.agreeTerms !== false,
    },
  };`;

const newStep7End = `      agree_terms: b.agreeTerms !== false,
    },
    service_api_mapping: DEFAULT_SERVICE_API_MAPPING,
  };`;

if (ctrl.includes(oldStep7End)) {
  ctrl = ctrl.replace(oldStep7End, newStep7End);
  console.log('✓ Added service_api_mapping to serializeCanonicalBooking output.');
}

// D. Add getCanonicalTemplateHandler and getCanonicalServicesHandler
const templateHandlers = `
export const getCanonicalTemplateHandler: RequestHandler = (req, res) => {
  const isRaw = req.query.raw === 'true';
  if (isRaw) {
    res.status(200).json(CANONICAL_BOOKING_TEMPLATE);
    return;
  }
  res.status(200).json({
    status: 'success',
    success: true,
    data: CANONICAL_BOOKING_TEMPLATE,
    ...CANONICAL_BOOKING_TEMPLATE,
  });
};

export const getCanonicalServicesHandler: RequestHandler = (req, res) => {
  res.status(200).json({
    status: 'success',
    success: true,
    data: {
      services: defaultAvailableServices,
      template: CANONICAL_BOOKING_TEMPLATE,
      service_api_mapping: DEFAULT_SERVICE_API_MAPPING,
    },
  });
};
`;

if (!ctrl.includes('getCanonicalTemplateHandler')) {
  ctrl = ctrl + '\n' + templateHandlers;
  console.log('✓ Added getCanonicalTemplateHandler and getCanonicalServicesHandler.');
}

// Write back to scratch/vault-courier.controller.ts and backend
fs.writeFileSync(path.join(scratchDir, 'vault-courier.controller.ts'), ctrl, 'utf8');
fs.writeFileSync(path.join(scratchDir, 'backend/vault-courier.controller.ts'), ctrl, 'utf8');
fs.writeFileSync(path.join(backendDir, 'src/modules/confidential-courier/vault-courier.controller.ts'), ctrl, 'utf8');
console.log('✓ Wrote updated vault-courier.controller.ts to scratch and backend.');

// 2. Update courier-delivery-dispatcher.router.ts
let disp = fs.readFileSync(path.join(scratchDir, 'courier-delivery-dispatcher.router.ts'), 'utf8');

if (!disp.includes('getCanonicalTemplateHandler')) {
  disp = disp.replace(
    '  deleteVaultBookingHandler,',
    '  deleteVaultBookingHandler,\n  getCanonicalTemplateHandler,\n  getCanonicalServicesHandler,'
  );

  const routeInsert = `
// ==========================================
// 0. CANONICAL TEMPLATE & SERVICES ENDPOINTS
// ==========================================
courierDeliveryDispatcherRouter.get('/services/canonical-template', getCanonicalTemplateHandler);
courierDeliveryDispatcherRouter.get('/canonical-template', getCanonicalTemplateHandler);
courierDeliveryDispatcherRouter.get('/template', getCanonicalTemplateHandler);
courierDeliveryDispatcherRouter.get('/services', getCanonicalServicesHandler);
`;

  disp = disp.replace(
    '// ==========================================\n// 1. DIRECT PAYMENT ENDPOINTS',
    routeInsert + '\n// ==========================================\n// 1. DIRECT PAYMENT ENDPOINTS'
  );

  fs.writeFileSync(path.join(scratchDir, 'courier-delivery-dispatcher.router.ts'), disp, 'utf8');
  fs.writeFileSync(path.join(backendDir, 'src/modules/confidential-courier/courier-delivery-dispatcher.router.ts'), disp, 'utf8');
  console.log('✓ Updated courier-delivery-dispatcher.router.ts with canonical template endpoints.');
}

// 3. Update vault-courier.routes.ts in backend
let vaultRoutes = fs.readFileSync(path.join(backendDir, 'src/modules/confidential-courier/vault-courier.routes.ts'), 'utf8');
if (!vaultRoutes.includes('getCanonicalTemplateHandler')) {
  vaultRoutes = vaultRoutes.replace(
    '  deleteVaultBookingHandler,',
    '  deleteVaultBookingHandler,\n  getCanonicalTemplateHandler,\n  getCanonicalServicesHandler,'
  );

  const publicRoutes = `
// Public canonical template & services endpoints (accessible with or without token)
vaultCourierRouter.get('/services/canonical-template', getCanonicalTemplateHandler);
vaultCourierRouter.get('/canonical-template', getCanonicalTemplateHandler);
vaultCourierRouter.get('/template', getCanonicalTemplateHandler);
vaultCourierRouter.get('/services', getCanonicalServicesHandler);
`;

  vaultRoutes = vaultRoutes.replace(
    '// Authentication middleware for booking & payment operations',
    publicRoutes + '\n// Authentication middleware for booking & payment operations'
  );

  fs.writeFileSync(path.join(backendDir, 'src/modules/confidential-courier/vault-courier.routes.ts'), vaultRoutes, 'utf8');
  console.log('✓ Updated vault-courier.routes.ts with canonical template endpoints.');
}

console.log('🎉 All files updated successfully!');
