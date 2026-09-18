const fs = require('fs');
const path = require('path');

const postmanVaultFile = 'postman/Confidential_Courier_Vault_API.postman_collection.json';
const vaultColl = JSON.parse(fs.readFileSync(postmanVaultFile, 'utf8'));

async function main() {
  const templateRes = await fetch('http://localhost:4000/api/v1/courier-delivery/services/canonical-template');
  const templateJson = await templateRes.json();
  const CANONICAL_BOOKING_TEMPLATE = templateJson.data;

const templateFolder = {
  name: '0. Canonical Services & Unified Schema Template',
  item: [
    {
      name: 'Get Complete Unified Canonical Booking Template',
      request: {
        method: 'GET',
        header: [
          { key: 'Accept', value: 'application/json', type: 'text' }
        ],
        url: {
          raw: '{{baseUrl}}/courier-delivery/services/canonical-template',
          host: ['{{baseUrl}}'],
          path: ['courier-delivery', 'services', 'canonical-template']
        },
        description: 'Returns the exact 8-step canonical JSON structure, options arrays, all 9 service specific setups, and service_api_mapping so developers do not need to create separate APIs for the server.'
      },
      response: []
    },
    {
      name: 'Get All 9 Canonical Vault Services & Catalog',
      request: {
        method: 'GET',
        header: [
          { key: 'Accept', value: 'application/json', type: 'text' }
        ],
        url: {
          raw: '{{baseUrl}}/courier-delivery/services',
          host: ['{{baseUrl}}'],
          path: ['courier-delivery', 'services']
        },
        description: 'Returns all 9 available services, canonical form template, and complete service_api_mapping.'
      },
      response: []
    }
  ]
};

// Check if already present
if (!vaultColl.item.some(i => i.name.includes('Unified Schema Template'))) {
  vaultColl.item.unshift(templateFolder);
  console.log('✓ Added 0. Canonical Services & Unified Schema Template folder to Confidential_Courier_Vault_API.');
}

// Add canonical unified payload booking request to Create Bookings
const createBookingsFolder = vaultColl.item.find(i => i.name.includes('Create Bookings'));
if (createBookingsFolder) {
  const unifiedPayloadSample = JSON.parse(JSON.stringify(CANONICAL_BOOKING_TEMPLATE));
  unifiedPayloadSample.step_1_pickup_location.pickup_location.contact_name = 'Vikram Malhotra';
  unifiedPayloadSample.step_1_pickup_location.pickup_location.mobile_number = '+91 9895226999';
  unifiedPayloadSample.step_1_pickup_location.pickup_location.complete_pickup_address = 'Tower B, Brigade Gateway, Rajajinagar, Bengaluru, 560055';
  unifiedPayloadSample.step_1_pickup_location.pickup_location.city = 'Bengaluru';
  unifiedPayloadSample.step_1_pickup_location.pickup_location.state = 'Karnataka';
  unifiedPayloadSample.step_1_pickup_location.pickup_location.pin_code = '560055';

  unifiedPayloadSample.step_2_recipient_and_delivery.delivery_location.contact_name = 'Neha Deshmukh';
  unifiedPayloadSample.step_2_recipient_and_delivery.delivery_location.mobile_number = '+91 9876543210';
  unifiedPayloadSample.step_2_recipient_and_delivery.delivery_location.complete_delivery_address = 'Prestige Tech Park, Marathahalli, Bengaluru, 560103';
  unifiedPayloadSample.step_2_recipient_and_delivery.delivery_location.city = 'Bengaluru';
  unifiedPayloadSample.step_2_recipient_and_delivery.delivery_location.state = 'Karnataka';
  unifiedPayloadSample.step_2_recipient_and_delivery.delivery_location.pin_code = '560103';

  unifiedPayloadSample.step_3_item_type_and_information.selected_top_item_type = 'Confidential Documents';
  unifiedPayloadSample.step_3_item_type_and_information.item_information.item_name_description = 'Original Acquisition Contract';
  unifiedPayloadSample.step_3_item_type_and_information.item_information.declared_value = '1500000';

  const canonicalUnifiedRequest = {
    name: 'POST /courier-delivery/bookings (Unified 8-Step Canonical Payload)',
    request: {
      method: 'POST',
      header: [
        { key: 'Content-Type', value: 'application/json', type: 'text' },
        { key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' }
      ],
      body: {
        mode: 'raw',
        raw: JSON.stringify(unifiedPayloadSample, null, 2),
        options: { raw: { language: 'json' } }
      },
      url: {
        raw: '{{baseUrl}}/courier-delivery/bookings',
        host: ['{{baseUrl}}'],
        path: ['courier-delivery', 'bookings']
      },
      description: 'Creates a booking using the single, unified 8-step canonical JSON structure containing all fields, options, and service specific configurations.'
    },
    response: []
  };

  if (!createBookingsFolder.item.some(i => i.name.includes('Unified 8-Step Canonical Payload'))) {
    createBookingsFolder.item.unshift(canonicalUnifiedRequest);
    console.log('✓ Added Unified 8-Step Canonical Payload request to Create Bookings folder.');
  }
}

fs.writeFileSync(postmanVaultFile, JSON.stringify(vaultColl, null, 2), 'utf8');

// Also update Delivez-Confidential-Delivery.postman_collection.json
const legacyFile = 'postman/Delivez-Confidential-Delivery.postman_collection.json';
if (fs.existsSync(legacyFile)) {
  const legacyColl = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
  if (!legacyColl.item.some(i => i.name.includes('Unified Schema Template'))) {
    legacyColl.item.unshift(templateFolder);
    fs.writeFileSync(legacyFile, JSON.stringify(legacyColl, null, 2), 'utf8');
    console.log('✓ Added Unified Schema Template to Delivez-Confidential-Delivery.postman_collection.json.');
  }
}

  console.log('🎉 Postman collections updated successfully!');
}

main().catch(console.error);

