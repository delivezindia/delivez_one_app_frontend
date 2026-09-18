const fs = require('fs');
const path = require('path');

const targetDir = 'C:/Users/Rax/Desktop/asdfghjkl';
const workspacePostmanDir = 'c:/Users/Rax/Desktop/Delivery_app_web/postman';
const BASE_URL = 'http://localhost:4000/api/v1';

async function generate() {
  console.log('>>> Starting generation in:', targetDir);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const frontendDir = path.join(targetDir, 'frontend_examples');
  const backendDir = path.join(targetDir, 'backend_examples');
  if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });
  if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });

  // 1. Authenticate to get live token
  console.log('Authenticating with backend...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ countryCode: '+91', mobileNumber: '9895226999' })
  });
  const loginData = await loginRes.json();
  const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: loginData.data.challengeId,
      otp: loginData.data.developmentOtp || loginData.data.otp
    })
  });
  const verifyData = await verifyRes.json();
  const token = verifyData.data.accessToken;
  console.log('Authenticated token obtained successfully.');

  // 2. Fetch canonical template
  const templateRes = await fetch(`${BASE_URL}/courier-delivery/services/canonical-template`);
  const templateJson = await templateRes.json();
  const CANONICAL_TEMPLATE = templateJson.data;

  // 3. Define the 9 payloads
  const servicesConfig = [
    {
      key: 'vault_secure',
      serviceType: 'Vault Secure',
      folderName: 'Vault Secure (Standard)',
      desc: 'Standard secure delivery with full verification and chain of custody.',
      customize: (p) => {
        p.service_type = 'Vault Secure';
        p.step_0_service_type.selected_service = 'Vault Secure';
        p.step_1_pickup_location.pickup_location.contact_name = 'Arjun Verma (Legal Head)';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.company_organization = 'Verma & Partners Legal LLP';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'Floor 14, Tower A, Brigade Gateway, Rajajinagar, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560055';
        p.step_1_pickup_location.pickup_contact_person.contact_person = 'Arjun Verma';
        p.step_1_pickup_location.pickup_contact_person.designation = 'Managing Partner';
        p.step_1_pickup_location.pickup_contact_person.alternate_mobile = '+91 9895226998';
        p.step_1_pickup_location.pickup_contact_person.email = 'arjun.verma@vermalegal.in';
        p.step_1_pickup_location.pickup_timing.pickup_date = '2026-09-20';
        p.step_1_pickup_location.pickup_timing.pickup_time_window = '10:00 AM - 12:00 PM';
        p.step_1_pickup_location.pickup_special_instructions = 'Deliver to security reception first for clearance';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Kavita Menon (Chief Legal Officer)';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.company_organization = 'Apex Financial Corporation';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'Embassy GolfLinks Business Park, Domlur, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560071';
        p.step_2_recipient_and_delivery.delivery_contact_person.contact_person = 'Kavita Menon';
        p.step_2_recipient_and_delivery.delivery_contact_person.designation = 'Chief Legal Officer';
        p.step_2_recipient_and_delivery.delivery_contact_person.email = 'kavita.menon@apexfinancial.com';
        p.step_2_recipient_and_delivery.delivery_timing.preferred_delivery_date = '2026-09-21';
        p.step_2_recipient_and_delivery.delivery_timing.preferred_time_window = '02:00 PM - 04:00 PM';

        p.step_3_item_type_and_information.selected_top_item_type = 'Confidential Documents';
        p.step_3_item_type_and_information.item_information.item_name_description = 'Original Acquisition Contract & Asset Title Deeds';
        p.step_3_item_type_and_information.item_information.item_category = 'Corporate & Contracts';
        p.step_3_item_type_and_information.item_information.item_type = 'Document';
        p.step_3_item_type_and_information.item_information.number_of_pieces = 1;
        p.step_3_item_type_and_information.item_information.weight_actual = '0.75';
        p.step_3_item_type_and_information.item_information.declared_value = '1500000';
        p.step_3_item_type_and_information.item_handling.handle_with_care = true;
        p.step_3_item_type_and_information.item_handling.high_value = true;

        p.step_4_packaging_options.selected_package = 'Tamper Proof Pouch';
        p.step_4_packaging_options.add_on_protection.seal_and_security_tape = true;
        p.step_4_packaging_options.add_on_protection.waterproof_cover = true;

        p.step_5_security_level.selected_security_level = 'Standard Security';
        p.step_6_verification.selected_verification = 'OTP Verification';
        p.step_6_verification.capture_photo_of_recipient = true;
      }
    },
    {
      key: 'vault_priority',
      serviceType: 'Vault Priority',
      folderName: 'Vault Priority (Same/Next Day)',
      desc: 'Faster delivery with priority handling and dedicated partners.',
      customize: (p) => {
        p.service_type = 'Vault Priority';
        p.step_0_service_type.selected_service = 'Vault Priority';
        p.step_1_pickup_location.pickup_location.contact_name = 'Siddharth Rao';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'Bagmane Tech Park, CV Raman Nagar, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560093';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Ananya Sen';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'RMZ Ecospace, Bellandur, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560103';

        p.step_3_item_type_and_information.selected_top_item_type = 'Financial Documents';
        p.step_3_item_type_and_information.item_information.item_name_description = 'Urgent Audit Compliance Dossier';
        p.step_3_item_type_and_information.item_information.declared_value = '500000';
        p.step_4_packaging_options.selected_package = 'Document Sleeve';
        p.step_5_security_level.selected_security_level = 'Enhanced Security';
        p.step_6_verification.selected_verification = 'OTP Verification';
      }
    },
    {
      key: 'vault_direct',
      serviceType: 'Vault Direct',
      folderName: 'Vault Direct (Point-to-Point)',
      desc: 'Point-to-point delivery with no stops in between. Maximum confidentiality.',
      customize: (p) => {
        p.service_type = 'Vault Direct';
        p.step_0_service_type.selected_service = 'Vault Direct';
        p.step_1_pickup_location.pickup_location.contact_name = 'Vikramaditya Roy';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'UB City, Vittal Mallya Road, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560001';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Deepak Singhania';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'Manyata Embassy Business Park, Nagawara, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560045';

        p.step_2_recipient_and_delivery.service_specific_setup['Vault Direct'] = {
          delivery_type: 'Direct Delivery',
          delivery_type_options: ['Direct Delivery', 'Direct Express', 'Same Day Direct'],
          pickup_location: {
            pickup_address: 'UB City, Vittal Mallya Road, Bengaluru',
            use_current_location: false
          },
          delivery_location: {
            delivery_address: 'Manyata Embassy Business Park, Nagawara, Bengaluru',
            use_current_location: false
          },
          delivery_preferences: {
            preferred_delivery_date: '2026-09-20',
            preferred_time_window: '11:00 AM - 01:00 PM',
            timezone: 'IST (GMT +05:30)',
            special_instructions: 'Zero stopover allowed. Direct point to point.'
          },
          handling_options: {
            single_point_handling: true,
            avoid_hubs_sorting: true,
            sealed_secure: true,
            delivery_alerts: true
          },
          contact_and_verification: {
            recipient_contact: '+91 9876543210',
            verification_method: 'OTP Verification',
            alternate_contact: '+91 9876543219'
          }
        };

        p.step_3_item_type_and_information.selected_top_item_type = 'Legal Documents';
        p.step_3_item_type_and_information.item_information.item_name_description = 'Classified M&A Board Resolution';
        p.step_3_item_type_and_information.item_information.declared_value = '2500000';
      }
    },
    {
      key: 'vault_precise',
      serviceType: 'Vault Precise',
      folderName: 'Vault Precise (Exact Scheduled Window)',
      desc: 'Deliver at a specific date and time window of your choice.',
      customize: (p) => {
        p.service_type = 'Vault Precise';
        p.step_0_service_type.selected_service = 'Vault Precise';
        p.step_1_pickup_location.pickup_location.contact_name = 'Dr. Rajesh Murthy';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'Indiranagar 100ft Road, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560038';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Hon. Justice (Retd.) K. Nair';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'Sadashivanagar, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560080';

        p.step_2_recipient_and_delivery.service_specific_setup['Vault Precise'] = {
          delivery_precision: {
            delivery_date: '2026-09-22',
            preferred_time_window: '03:15 PM - 03:45 PM',
            timezone: 'IST (GMT +05:30)',
            delivery_deadline_hard_cutoff: '04:00 PM',
            early_delivery_not_allowed: true
          },
          delivery_location: {
            delivery_address: 'Sadashivanagar, Bengaluru',
            edit_address: false,
            delivery_instructions: 'Hand deliver to chamber office only',
            landmark: 'Near Sankey Tank'
          },
          recipient_and_verification: {
            recipient_name: 'Hon. Justice (Retd.) K. Nair',
            recipient_contact: '+91 9876543210',
            verification_method: 'ID Proof Verification',
            recipient_must_be_available_within_time_window: true,
            alternate_contact: '+91 9876543219'
          },
          handling_and_service_options: {
            handling_option: 'Precise + Signature',
            handling_option_options: [
              'Precise Delivery',
              'Precise + Priority',
              'Precise + Signature',
              'Photo Proof'
            ]
          },
          special_instructions: 'Strict time adherence required'
        };

        p.step_3_item_type_and_information.selected_top_item_type = 'Sensitive Records';
        p.step_3_item_type_and_information.item_information.item_name_description = 'Arbitration Award & Settlement Agreement';
        p.step_3_item_type_and_information.item_information.declared_value = '8000000';
      }
    },
    {
      key: 'vault_hand_carry',
      serviceType: 'Vault Hand Carry',
      folderName: 'Vault Hand Carry (Dedicated Executive)',
      desc: 'Dedicated hand carry by authorized executive for highest priority items.',
      customize: (p) => {
        p.service_type = 'Vault Hand Carry';
        p.step_0_service_type.selected_service = 'Vault Hand Carry';
        p.step_1_pickup_location.pickup_location.contact_name = 'Devika Banker';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'Cunningham Road, Vasanth Nagar, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560052';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Naveen Jindal';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'Kempegowda International Airport, Terminal 1 VIP Lounge, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560300';

        p.step_2_recipient_and_delivery.service_specific_setup['Vault Hand Carry'] = {
          hand_carry_details: {
            hand_carry_type: 'High Value Item',
            hand_carry_type_options: [
              'Confidential Documents',
              'High Value Item',
              'Priority Delivery'
            ],
            executive_level: 'Verified Executive',
            declared_value: '5000000',
            preferred_handover_slot: '08:00 AM - 10:00 AM'
          },
          executive_and_handover_instructions: {
            dedicated_executive: true,
            id_check_on_pickup: true,
            id_check_on_delivery: true,
            signature_at_handover: true,
            no_unattended_delivery: true,
            recipient_must_be_present: true
          },
          monitoring_and_security: {
            real_time_tracking_and_alerts: true,
            chain_of_custody: true,
            photo_proof_at_delivery: true,
            confidential_handling: true,
            escalation_contact_required: true
          },
          special_instructions: 'Handover inside VIP Terminal Lounge only'
        };

        p.step_3_item_type_and_information.selected_top_item_type = 'Secure Package';
        p.step_3_item_type_and_information.item_information.item_name_description = 'High Security Hardware Encryption Tokens & Keys';
        p.step_3_item_type_and_information.item_information.declared_value = '5000000';
      }
    },
    {
      key: 'vault_return',
      serviceType: 'Vault Return',
      folderName: 'Vault Return (Round-Trip Document Sign-off)',
      desc: 'Deliver and collect signed or processed documents and return to sender.',
      customize: (p) => {
        p.service_type = 'Vault Return';
        p.step_0_service_type.selected_service = 'Vault Return';
        p.step_1_pickup_location.pickup_location.contact_name = 'Finance Manager (KPMG)';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'RMZ Infinity, Old Madras Road, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560016';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Director of Compliance';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'Prestige Shantiniketan, Whitefield, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560066';

        p.step_2_recipient_and_delivery.service_specific_setup['Vault Return'] = {
          return_details: {
            return_type: 'Return to Sender',
            return_type_options: [
              'Return to Sender',
              'Return to Another Location'
            ],
            return_reason: 'Signed Statutory Tax Filings & Signatures',
            rma_reference_number: 'RMA-STAT-2026-99',
            return_instruction: 'Wait up to 20 minutes for Director to sign all 6 pages before returning',
            expected_return_date: '2026-09-23'
          },
          return_address: {
            address_mode: 'Same as Pickup Address',
            address_mode_options: [
              'Same as Pickup Address',
              'Use Different Address'
            ],
            return_address_preview: 'RMZ Infinity, Old Madras Road, Bengaluru - 560016',
            edit_address: false
          },
          return_collection_preference: {
            collection_date_preference: '2026-09-23',
            collection_time_window: '04:00 PM - 06:00 PM',
            pickup_instructions_for_return: 'Deliver signed copy back to Finance Reception'
          }
        };

        p.step_3_item_type_and_information.selected_top_item_type = 'Contracts / Agreements';
        p.step_3_item_type_and_information.item_information.item_name_description = 'Tri-Party Loan Agreements & Mortgages';
        p.step_3_item_type_and_information.item_information.declared_value = '1200000';
      }
    },
    {
      key: 'vault_exchange',
      serviceType: 'Vault Exchange',
      folderName: 'Vault Exchange (Two-Way Simultaneous Swap)',
      desc: 'Two-way document or item exchange in a single trip.',
      customize: (p) => {
        p.service_type = 'Vault Exchange';
        p.step_0_service_type.selected_service = 'Vault Exchange';
        p.step_1_pickup_location.pickup_location.contact_name = 'Alok Tandon (Buyer Representative)';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'Koramangala 4th Block, 80 Feet Road, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560034';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Rameshwar Roy (Seller Representative)';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'Lavelle Road, Shanthala Nagar, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560001';

        p.step_2_recipient_and_delivery.service_specific_setup['Vault Exchange'] = {
          setup_present_in_source: false,
          source_component_referenced: 'ExchangeSetupScreen',
          source_component_implementation_found: false,
          fields: {
            exchange_type: 'Two-Way Commercial Asset Swap',
            outgoing_item: 'Demand Draft of ₹50,00,000 + Purchase Agreement',
            incoming_item: 'Original Physical Share Certificates (10,000 units)',
            swap_instructions: 'Handover envelope A only upon receiving envelope B with seal',
            inspection_allowed: true
          }
        };

        p.step_3_item_type_and_information.selected_top_item_type = 'Contracts / Agreements';
        p.step_3_item_type_and_information.item_information.item_name_description = 'Share Purchase Swap Documents & Instruments';
        p.step_3_item_type_and_information.item_information.declared_value = '5000000';
      }
    },
    {
      key: 'vault_critical',
      serviceType: 'Vault Critical',
      folderName: 'Vault Critical (Highest Armed Escort)',
      desc: 'Highest security with armed escort and real-time monitoring.',
      customize: (p) => {
        p.service_type = 'Vault Critical';
        p.step_0_service_type.selected_service = 'Vault Critical';
        p.step_1_pickup_location.pickup_location.contact_name = 'Commander R. S. Rathore';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'Reserve Bank Road, Cubbon Park, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560001';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Zonal Director (Treasury Vault)';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'State Bank Bhavan, St. Marks Road, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560001';

        p.step_2_recipient_and_delivery.service_specific_setup['Vault Critical'] = {
          critical_details: {
            critical_shipment_type: 'High Value',
            critical_shipment_type_options: [
              'High Value',
              'Time Critical',
              'Confidential'
            ],
            critical_level: 'Level 1 - Highest',
            declared_value: '20000000',
            sla_delivery_commitment: 'Immediate Armored Dispatch'
          },
          security_and_handling_instructions: {
            tamper_proof_sealing: true,
            single_point_of_contact: true,
            secure_storage_at_hubs: true,
            armed_escort_if_available: true,
            no_unattended_delivery: true,
            photo_proof_at_every_stage: true
          },
          priority_and_monitoring: {
            priority_handling: 'Highest Priority',
            real_time_tracking_and_alerts: true,
            delay_alert_threshold: '5 minutes'
          },
          special_instructions: 'Dual armed guard escort required'
        };

        p.step_3_item_type_and_information.selected_top_item_type = 'Original Certificates';
        p.step_3_item_type_and_information.item_information.item_name_description = 'Sovereign Gold Bonds & Bearer Bonds';
        p.step_3_item_type_and_information.item_information.declared_value = '20000000';
        p.step_5_security_level.selected_security_level = 'Maximum Security';
        p.step_5_security_level.security_features.armed_escort = true;
      }
    },
    {
      key: 'vault_multipoint',
      serviceType: 'Vault MultiPoint',
      folderName: 'Vault MultiPoint (Multi-Stop Route)',
      desc: 'Multiple secure stops in a single journey with optimized routing.',
      customize: (p) => {
        p.service_type = 'Vault MultiPoint';
        p.step_0_service_type.selected_service = 'Vault MultiPoint';
        p.step_1_pickup_location.pickup_location.contact_name = 'Corporate Legal Central Hub';
        p.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
        p.step_1_pickup_location.pickup_location.complete_pickup_address = 'World Trade Center, Malleswaram West, Bengaluru';
        p.step_1_pickup_location.pickup_location.city = 'Bengaluru';
        p.step_1_pickup_location.pickup_location.state = 'Karnataka';
        p.step_1_pickup_location.pickup_location.pin_code = '560055';

        p.step_2_recipient_and_delivery.delivery_location.contact_name = 'Regional Directorate (Final Hub)';
        p.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
        p.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'Manyata Embassy Tech Park, Nagawara, Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
        p.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
        p.step_2_recipient_and_delivery.delivery_location.pin_code = '560045';

        p.step_2_recipient_and_delivery.service_specific_setup['Vault MultiPoint'] = {
          route_summary: {
            total_stops: 3,
            estimated_distance: '28.4 km',
            estimated_time: '2 Hours 30 Mins',
            service_type: 'Multi Point Delivery'
          },
          delivery_points: [
            {
              stop_number: 1,
              stop_name: 'High Court of Karnataka',
              subtitle: 'Filing Section Counter 4',
              address: 'Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru, 560001',
              contact_person: 'Advocate on Record (S. Sundaram)',
              eta: '11:15 AM'
            },
            {
              stop_number: 2,
              stop_name: 'Registrar of Companies (RoC)',
              subtitle: 'Corporate Filings Division',
              address: 'E-Wing, Kendriya Sadan, Koramangala, Bengaluru, 560034',
              contact_person: 'Registrar Officer (M. K. Murthy)',
              eta: '12:45 PM'
            },
            {
              stop_number: 3,
              stop_name: 'Corporate Legal Headquarters',
              subtitle: 'Executive Suite 802',
              address: 'Manyata Embassy Tech Park, Nagawara, Bengaluru, 560045',
              contact_person: 'VP Legal & Governance',
              eta: '02:00 PM'
            }
          ],
          delivery_point_actions: {
            add_stop: true,
            edit_stop: true,
            delete_stop: true,
            reorder_stops: true,
            optimize_route: true
          },
          additional_options: {
            time_window_for_each_stop: true,
            notify_recipients: true,
            collect_pod_at_each_stop: true,
            return_to_origin_if_undelivered: true
          },
          special_instructions: 'Collect signature and official stamp on duplicate sheet at each stop'
        };

        p.step_3_item_type_and_information.selected_top_item_type = 'Legal Documents';
        p.step_3_item_type_and_information.item_information.item_name_description = 'Multi-Office Regulatory Compliance Documents';
        p.step_3_item_type_and_information.item_information.declared_value = '3500000';
      }
    }
  ];

  const postmanItems = [];

  // Folder 0: Discovery & Template
  postmanItems.push({
    name: '0. Schema Discovery & Form Templates (No Separate APIs Required)',
    description: 'Endpoints that return the full 8-step form template, service catalog, and API mapping so the frontend and client can dynamically render forms without needing custom endpoints for each service.',
    item: [
      {
        name: 'GET /courier-delivery/services/canonical-template (Complete 8-Step Form Schema)',
        request: {
          method: 'GET',
          header: [{ key: 'Accept', value: 'application/json', type: 'text' }],
          url: {
            raw: '{{baseUrl}}/courier-delivery/services/canonical-template',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'services', 'canonical-template']
          },
          description: 'Returns the exact 8-step canonical JSON structure with all field keys, all options arrays (pickup_type_options, delivery_type_options, top_item_type_options, package_type_options, security_level_options, verification_method_options), all 9 service configurations, and service_api_mapping.'
        },
        response: [
          {
            name: '200 OK - Complete Canonical Schema Template',
            originalRequest: {
              method: 'GET',
              header: [{ key: 'Accept', value: 'application/json', type: 'text' }],
              url: {
                raw: '{{baseUrl}}/courier-delivery/services/canonical-template',
                host: ['{{baseUrl}}'],
                path: ['courier-delivery', 'services', 'canonical-template']
              }
            },
            status: 'OK',
            code: 200,
            _postman_previewlanguage: 'json',
            header: [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
            body: JSON.stringify({ status: 'success', data: CANONICAL_TEMPLATE }, null, 2)
          }
        ]
      },
      {
        name: 'GET /courier-delivery/services (Available 9 Services & Catalog)',
        request: {
          method: 'GET',
          header: [{ key: 'Accept', value: 'application/json', type: 'text' }],
          url: {
            raw: '{{baseUrl}}/courier-delivery/services',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'services']
          },
          description: 'Returns the list of 9 available Vault courier plans, the canonical template, and service API mapping.'
        },
        response: [
          {
            name: '200 OK - 9 Services & Catalog',
            originalRequest: {
              method: 'GET',
              header: [{ key: 'Accept', value: 'application/json', type: 'text' }],
              url: {
                raw: '{{baseUrl}}/courier-delivery/services',
                host: ['{{baseUrl}}'],
                path: ['courier-delivery', 'services']
              }
            },
            status: 'OK',
            code: 200,
            _postman_previewlanguage: 'json',
            header: [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
            body: JSON.stringify({
              status: 'success',
              data: {
                services: CANONICAL_TEMPLATE.step_0_service_type.available_services,
                template: CANONICAL_TEMPLATE,
                service_api_mapping: CANONICAL_TEMPLATE.service_api_mapping
              }
            }, null, 2)
          }
        ]
      }
    ]
  });

  // Folder 1: Authentication
  postmanItems.push({
    name: '1. Authentication (OTP Flow)',
    description: 'Passwordless mobile OTP authentication to acquire bearer access token.',
    item: [
      {
        name: '1. Request OTP (POST /auth/login)',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          body: {
            mode: 'raw',
            raw: JSON.stringify({ countryCode: '+91', mobileNumber: '{{mobileNumber}}' }, null, 2),
            options: { raw: { language: 'json' } }
          },
          url: {
            raw: '{{baseUrl}}/auth/login',
            host: ['{{baseUrl}}'],
            path: ['auth', 'login']
          },
          description: 'Requests OTP login challenge for mobile number.'
        },
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                'const json = pm.response.json();',
                'pm.expect(pm.response.code).to.equal(200);',
                'if (json.data && json.data.challengeId) {',
                '    pm.environment.set("challengeId", json.data.challengeId);',
                '}'
              ],
              type: 'text/javascript'
            }
          }
        ],
        response: [
          {
            name: '200 OK - Challenge Created',
            originalRequest: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ countryCode: '+91', mobileNumber: '9895226999' }, null, 2),
                options: { raw: { language: 'json' } }
              },
              url: { raw: '{{baseUrl}}/auth/login', host: ['{{baseUrl}}'], path: ['auth', 'login'] }
            },
            status: 'OK',
            code: 200,
            _postman_previewlanguage: 'json',
            header: [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
            body: JSON.stringify({
              status: 'success',
              data: {
                challengeId: 'ch_sample_260918_8888',
                expiresInSeconds: 300,
                developmentOtp: '123456'
              }
            }, null, 2)
          }
        ]
      },
      {
        name: '2. Verify OTP & Obtain Token (POST /auth/verify-otp)',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          body: {
            mode: 'raw',
            raw: JSON.stringify({ challengeId: '{{challengeId}}', otp: '123456' }, null, 2),
            options: { raw: { language: 'json' } }
          },
          url: {
            raw: '{{baseUrl}}/auth/verify-otp',
            host: ['{{baseUrl}}'],
            path: ['auth', 'verify-otp']
          },
          description: 'Verifies OTP and returns access token.'
        },
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                'const json = pm.response.json();',
                'pm.expect(pm.response.code).to.equal(200);',
                'if (json.data && json.data.accessToken) {',
                '    pm.environment.set("accessToken", json.data.accessToken);',
                '}'
              ],
              type: 'text/javascript'
            }
          }
        ],
        response: [
          {
            name: '200 OK - Access Token Granted',
            originalRequest: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ challengeId: 'ch_sample_260918_8888', otp: '123456' }, null, 2),
                options: { raw: { language: 'json' } }
              },
              url: { raw: '{{baseUrl}}/auth/verify-otp', host: ['{{baseUrl}}'], path: ['auth', 'verify-otp'] }
            },
            status: 'OK',
            code: 200,
            _postman_previewlanguage: 'json',
            header: [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
            body: JSON.stringify({
              status: 'success',
              data: {
                user: { id: 'usr_260918_1001', fullName: 'Enterprise Vault User', mobileNumber: '9895226999' },
                accessToken: 'jwt_sample_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'refresh_sample_token_...'
              }
            }, null, 2)
          }
        ]
      }
    ]
  });

  // Folder 2: All 9 Booking Requests
  const bookingItems = [];
  let sampleBookingId = '';

  for (let i = 0; i < servicesConfig.length; i++) {
    const sc = servicesConfig[i];
    console.log(`Executing live booking creation for ${sc.serviceType}...`);

    const frontendPayload = JSON.parse(JSON.stringify(CANONICAL_TEMPLATE));
    sc.customize(frontendPayload);

    // Save individual frontend JSON example
    const frontendFilePath = path.join(frontendDir, `${i + 1}_${sc.key}_frontend_request.json`);
    fs.writeFileSync(frontendFilePath, JSON.stringify(frontendPayload, null, 2), 'utf8');

    // Make live request to backend to get the exact real server response
    const createRes = await fetch(`${BASE_URL}/courier-delivery/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(frontendPayload)
    });

    const backendResponseJson = await createRes.json();
    if (!sampleBookingId && backendResponseJson.data?.booking_id) {
      sampleBookingId = backendResponseJson.data.booking_id;
    }

    // Save individual backend JSON example
    const backendFilePath = path.join(backendDir, `${i + 1}_${sc.key}_backend_response.json`);
    fs.writeFileSync(backendFilePath, JSON.stringify(backendResponseJson, null, 2), 'utf8');

    bookingItems.push({
      name: `${i + 1}. Create ${sc.serviceType} Booking (${sc.folderName})`,
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json', type: 'text' },
          { key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify(frontendPayload, null, 2),
          options: { raw: { language: 'json' } }
        },
        url: {
          raw: '{{baseUrl}}/courier-delivery/bookings',
          host: ['{{baseUrl}}'],
          path: ['courier-delivery', 'bookings']
        },
        description: `Creates a ${sc.serviceType} booking using the single canonical 8-step contract. ${sc.desc}`
      },
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              'const json = pm.response.json();',
              'pm.expect(pm.response.code).to.equal(201);',
              'pm.expect(json.status).to.equal("success");',
              'const b = json.data?.booking || json.data;',
              'if (b && (b.booking_id || b.id)) {',
              '    pm.environment.set("bookingId", b.booking_id || b.id);',
              '}',
              'pm.expect(b.step_0_service_type).to.be.an("object");',
              'pm.expect(b.step_1_pickup_location).to.be.an("object");',
              'pm.expect(b.step_2_recipient_and_delivery).to.be.an("object");',
              'pm.expect(b.step_3_item_type_and_information).to.be.an("object");',
              'pm.expect(b.step_4_packaging_options).to.be.an("object");',
              'pm.expect(b.step_5_security_level).to.be.an("object");',
              'pm.expect(b.step_6_verification).to.be.an("object");',
              'pm.expect(b.step_7_review_and_confirmation).to.be.an("object");',
              'pm.expect(b.service_api_mapping).to.be.an("object");'
            ],
            type: 'text/javascript'
          }
        }
      ],
      response: [
        {
          name: `201 Created - ${sc.serviceType} Server Response`,
          originalRequest: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json', type: 'text' },
              { key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }
            ],
            body: {
              mode: 'raw',
              raw: JSON.stringify(frontendPayload, null, 2),
              options: { raw: { language: 'json' } }
            },
            url: { raw: '{{baseUrl}}/courier-delivery/bookings', host: ['{{baseUrl}}'], path: ['courier-delivery', 'bookings'] }
          },
          status: 'Created',
          code: 201,
          _postman_previewlanguage: 'json',
          header: [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
          body: JSON.stringify(backendResponseJson, null, 2)
        }
      ]
    });
  }

  postmanItems.push({
    name: '2. Create Bookings (All 9 Canonical Services - Frontend Requests & Server Responses)',
    description: 'Live examples for all 9 canonical services. Every request uses the single 8-step JSON structure. Frontend never needs separate APIs.',
    item: bookingItems
  });

  // Folder 3: Booking CRUD Management
  postmanItems.push({
    name: '3. Booking Retrieval & Lifecycle Management',
    description: 'Fetching, updating, and listing bookings using the exact canonical 8-step contract.',
    item: [
      {
        name: 'GET /courier-delivery/bookings/:id (Reconstruct Canonical 8-Steps)',
        request: {
          method: 'GET',
          header: [{ key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }],
          url: {
            raw: '{{baseUrl}}/courier-delivery/bookings/{{bookingId}}',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'bookings', '{{bookingId}}']
          },
          description: 'Reconstructs all 8 steps and child tables from PostgreSQL without dropping any field.'
        },
        response: []
      },
      {
        name: 'GET /courier-delivery/bookings (List User Bookings in Canonical Format)',
        request: {
          method: 'GET',
          header: [{ key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }],
          url: {
            raw: '{{baseUrl}}/courier-delivery/bookings',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'bookings']
          },
          description: 'Lists all user bookings, each formatted in the full canonical 8-step structure.'
        },
        response: []
      },
      {
        name: 'PATCH /courier-delivery/bookings/:id (Status / Instructions Update)',
        request: {
          method: 'PATCH',
          header: [
            { key: 'Content-Type', value: 'application/json', type: 'text' },
            { key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              status: 'confirmed',
              special_instructions: 'Updated delivery instructions: Call recipient 15 minutes before arrival.'
            }, null, 2),
            options: { raw: { language: 'json' } }
          },
          url: {
            raw: '{{baseUrl}}/courier-delivery/bookings/{{bookingId}}',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'bookings', '{{bookingId}}']
          },
          description: 'Updates booking status or instructions.'
        },
        response: []
      }
    ]
  });

  // Folder 4: Payments API
  postmanItems.push({
    name: '4. Payments API',
    description: 'Initiate payment, verify digital signatures, and query payment records.',
    item: [
      {
        name: '1. Initiate Payment (POST /courier-delivery/payments)',
        request: {
          method: 'POST',
          header: [
            { key: 'Content-Type', value: 'application/json', type: 'text' },
            { key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              booking_id: '{{bookingId}}',
              payment_method: 'RAZORPAY_SANDBOX',
              gateway: 'RAZORPAY'
            }, null, 2),
            options: { raw: { language: 'json' } }
          },
          url: {
            raw: '{{baseUrl}}/courier-delivery/payments',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'payments']
          },
          description: 'Initiates a payment record for the specified booking.'
        },
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                'const json = pm.response.json();',
                'pm.expect(pm.response.code).to.equal(201);',
                'const p = json.data?.payment || json.data;',
                'if (p && (p.payment_id || p.id)) {',
                '    pm.environment.set("paymentId", p.payment_id || p.id);',
                '}'
              ],
              type: 'text/javascript'
            }
          }
        ],
        response: []
      },
      {
        name: '2. Verify Payment (POST /courier-delivery/payments/:id/verify)',
        request: {
          method: 'POST',
          header: [
            { key: 'Content-Type', value: 'application/json', type: 'text' },
            { key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              gateway_order_id: 'order_sandbox_vault_001',
              gateway_payment_id: 'pay_sandbox_vault_001',
              gateway_signature: 'sig_sandbox_verified_mock'
            }, null, 2),
            options: { raw: { language: 'json' } }
          },
          url: {
            raw: '{{baseUrl}}/courier-delivery/payments/{{paymentId}}/verify',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'payments', '{{paymentId}}', 'verify']
          },
          description: 'Verifies payment on the server, transitions booking to confirmed, and automatically generates receipt.'
        },
        response: []
      },
      {
        name: '3. Get Payment for Booking (GET /courier-delivery/bookings/:bookingId/payment)',
        request: {
          method: 'GET',
          header: [{ key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }],
          url: {
            raw: '{{baseUrl}}/courier-delivery/bookings/{{bookingId}}/payment',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'bookings', '{{bookingId}}', 'payment']
          },
          description: 'Retrieves payment status and gateway details for a booking.'
        },
        response: []
      }
    ]
  });

  // Folder 5: Receipts API
  postmanItems.push({
    name: '5. Receipts API',
    description: 'Idempotent official receipt generation, tax breakdown, and audit lookups.',
    item: [
      {
        name: '1. Create / Retrieve Idempotent Receipt (POST /courier-delivery/receipts)',
        request: {
          method: 'POST',
          header: [
            { key: 'Content-Type', value: 'application/json', type: 'text' },
            { key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              booking_id: '{{bookingId}}',
              payment_id: '{{paymentId}}'
            }, null, 2),
            options: { raw: { language: 'json' } }
          },
          url: {
            raw: '{{baseUrl}}/courier-delivery/receipts',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'receipts']
          },
          description: 'Generates or idempotently returns the official tax receipt.'
        },
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                'const json = pm.response.json();',
                'pm.expect(pm.response.code).to.equal(200);',
                'const r = json.data?.receipt || json.data;',
                'if (r && (r.receipt_id || r.id)) {',
                '    pm.environment.set("receiptId", r.receipt_id || r.id);',
                '}'
              ],
              type: 'text/javascript'
            }
          }
        ],
        response: []
      },
      {
        name: '2. Get Receipt by ID (GET /courier-delivery/receipts/:id)',
        request: {
          method: 'GET',
          header: [{ key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }],
          url: {
            raw: '{{baseUrl}}/courier-delivery/receipts/{{receiptId}}',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'receipts', '{{receiptId}}']
          },
          description: 'Fetches full receipt with line-item pricing and 18% GST calculation.'
        },
        response: []
      },
      {
        name: '3. Get Booking Receipt (GET /courier-delivery/bookings/:bookingId/receipt)',
        request: {
          method: 'GET',
          header: [{ key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }],
          url: {
            raw: '{{baseUrl}}/courier-delivery/bookings/{{bookingId}}/receipt',
            host: ['{{baseUrl}}'],
            path: ['courier-delivery', 'bookings', '{{bookingId}}', 'receipt']
          },
          description: 'Fetches receipt directly by booking identifier.'
        },
        response: []
      }
    ]
  });

  // Postman Collection Definition
  const fullPostmanCollection = {
    info: {
      name: 'Delivez - Unified Confidential Courier (Vault) Enterprise API',
      _postman_id: 'delivez-vault-unified-api-2026',
      description: 'Single unified enterprise Postman collection for the Delivez Confidential Courier / Vault system. Adheres strictly to the canonical 8-step JSON structure with zero separate APIs required across all 9 services.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: postmanItems
  };

  // Environment definition
  const localEnv = {
    id: 'delivez-vault-local-env',
    name: 'Delivez Vault Local',
    values: [
      { key: 'baseUrl', value: 'http://localhost:4000/api/v1', enabled: true },
      { key: 'mobileNumber', value: '9895226999', enabled: true },
      { key: 'challengeId', value: '', enabled: true },
      { key: 'accessToken', value: token, enabled: true },
      { key: 'bookingId', value: sampleBookingId, enabled: true },
      { key: 'paymentId', value: '', enabled: true },
      { key: 'receiptId', value: '', enabled: true }
    ],
    _postman_variable_scope: 'environment'
  };

  const prodEnv = {
    id: 'delivez-vault-prod-env',
    name: 'Delivez Vault Production',
    values: [
      { key: 'baseUrl', value: 'https://api.delivez.com/api/v1', enabled: true },
      { key: 'mobileNumber', value: '9895226999', enabled: true },
      { key: 'challengeId', value: '', enabled: true },
      { key: 'accessToken', value: '', enabled: true },
      { key: 'bookingId', value: '', enabled: true },
      { key: 'paymentId', value: '', enabled: true },
      { key: 'receiptId', value: '', enabled: true }
    ],
    _postman_variable_scope: 'environment'
  };

  // README in desktop folder
  const readmeContent = `# Delivez - Confidential Courier (Vault) Unified API Collection

This directory contains the **Single Unified Postman Collection, Environments, and Examples** for the Delivez Confidential Courier / Vault module.

## 🌟 Key Architecture Principle: No Separate APIs Needed

The server uses a **single canonical contract** for all 9 vault services:
1. **Schema Discovery**: \`GET /courier-delivery/services/canonical-template\` returns the complete 8-step structure, options arrays, and \`service_api_mapping\`.
2. **Unified Booking Creation**: \`POST /courier-delivery/bookings\` accepts the exact 8-step JSON payload for any of the 9 services.
3. **Unified Booking Retrieval**: \`GET /courier-delivery/bookings/:id\` reconstructs all 8 steps without losing a single field.
4. **Lifecycle**: Payments (\`POST /courier-delivery/payments\`) and Receipts (\`POST /courier-delivery/receipts\`).

---

## 📁 Included Files

- **\`Delivez_Vault_Unified_API.postman_collection.json\`**: The primary Postman collection with live request examples and test assertions.
- **\`Delivez_Vault_Local.postman_environment.json\`**: Local environment pre-configured with \`http://localhost:4000/api/v1\` and a valid test JWT access token.
- **\`Delivez_Vault_Production.postman_environment.json\`**: Production environment template.
- **\`frontend_examples/\`**: 9 individual JSON files showing the exact client request payload for each service:
  1. \`1_vault_secure_frontend_request.json\`
  2. \`2_vault_priority_frontend_request.json\`
  3. \`3_vault_direct_frontend_request.json\`
  4. \`4_vault_precise_frontend_request.json\`
  5. \`5_vault_hand_carry_frontend_request.json\`
  6. \`6_vault_return_frontend_request.json\`
  7. \`7_vault_exchange_frontend_request.json\`
  8. \`8_vault_critical_frontend_request.json\`
  9. \`9_vault_multipoint_frontend_request.json\`
- **\`backend_examples/\`**: 9 individual JSON files showing the exact server response returned by the backend for each service:
  1. \`1_vault_secure_backend_response.json\`
  2. \`2_vault_priority_backend_response.json\`
  3. \`3_vault_direct_backend_response.json\`
  4. \`4_vault_precise_backend_response.json\`
  5. \`5_vault_hand_carry_backend_response.json\`
  6. \`6_vault_return_backend_response.json\`
  7. \`7_vault_exchange_backend_response.json\`
  8. \`8_vault_critical_backend_response.json\`
  9. \`9_vault_multipoint_backend_response.json\`

---

## 🚀 How to Use in Postman

1. Open Postman.
2. Click **Import** (top left).
3. Drag and drop:
   - \`Delivez_Vault_Unified_API.postman_collection.json\`
   - \`Delivez_Vault_Local.postman_environment.json\`
4. Select the environment **Delivez Vault Local** in the top-right dropdown.
5. Run the requests in order:
   - **0. Schema Discovery**: Inspect the canonical form schema.
   - **1. Authentication**: Login and get your bearer token.
   - **2. Create Bookings**: Click **Send** on any of the 9 services. It will create the booking in PostgreSQL and automatically save the \`bookingId\`.
   - **3. Booking Retrieval**: Fetch by ID to see the reconstructed 8-step structure.
   - **4. Payments API**: Initiate and verify payment.
   - **5. Receipts API**: Generate official idempotent receipt.
`;

  // Write files to Desktop folder
  const collectionPath = path.join(targetDir, 'Delivez_Vault_Unified_API.postman_collection.json');
  const localEnvPath = path.join(targetDir, 'Delivez_Vault_Local.postman_environment.json');
  const prodEnvPath = path.join(targetDir, 'Delivez_Vault_Production.postman_environment.json');
  const readmePath = path.join(targetDir, 'README.md');

  fs.writeFileSync(collectionPath, JSON.stringify(fullPostmanCollection, null, 2), 'utf8');
  fs.writeFileSync(localEnvPath, JSON.stringify(localEnv, null, 2), 'utf8');
  fs.writeFileSync(prodEnvPath, JSON.stringify(prodEnv, null, 2), 'utf8');
  fs.writeFileSync(readmePath, readmeContent, 'utf8');

  // Also mirror to workspace postman/ directory
  fs.writeFileSync(path.join(workspacePostmanDir, 'Delivez_Vault_Unified_API.postman_collection.json'), JSON.stringify(fullPostmanCollection, null, 2), 'utf8');
  fs.writeFileSync(path.join(workspacePostmanDir, 'Delivez_Vault_Local.postman_environment.json'), JSON.stringify(localEnv, null, 2), 'utf8');
  fs.writeFileSync(path.join(workspacePostmanDir, 'Delivez_Vault_Production.postman_environment.json'), JSON.stringify(prodEnv, null, 2), 'utf8');

  console.log('🎉 Successfully created all files in:', targetDir);
  console.log('✓ Created Delivez_Vault_Unified_API.postman_collection.json');
  console.log('✓ Created Delivez_Vault_Local.postman_environment.json');
  console.log('✓ Created Delivez_Vault_Production.postman_environment.json');
  console.log('✓ Created 9 frontend request examples in frontend_examples/');
  console.log('✓ Created 9 backend response examples in backend_examples/');
  console.log('✓ Created README.md');
}

generate().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
