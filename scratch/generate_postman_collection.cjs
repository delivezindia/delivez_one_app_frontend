const fs = require('fs');
const path = require('path');

function createPostmanCollection() {
  // Helper for common steps
  const commonSteps = {
    addresses: {
      pickup: {
        address_line1: 'Tower A, Floor 14, Brigade Gateway',
        address_line2: 'Rajajinagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560055',
        country: 'India',
        latitude: 13.0125,
        longitude: 77.5558,
        landmark: 'Near Orion Mall',
        floor_number: '14',
        building_name: 'Brigade Gateway',
        gate_code: 'GATE-3',
        access_notes: 'Ring security bell and ask for Room 1402'
      },
      delivery: {
        address_line1: 'Embassy TechVillage, Block 2B',
        address_line2: 'Outer Ring Road, Devarabisanahalli',
        city: 'Bengaluru',
        state: 'Karnataka',
        postal_code: '560103',
        country: 'India',
        latitude: 12.9279,
        longitude: 77.6894,
        landmark: 'Opposite New Horizon College',
        floor_number: '5',
        building_name: 'Block 2B',
        gate_code: 'SECURITY-MAIN',
        access_notes: 'Visitor badge required at main gate'
      }
    },
    contacts: {
      sender: {
        full_name: 'Rajesh Sharma',
        phone: '+919895226999',
        alternate_phone: '+919895226998',
        email: 'rajesh.sharma@vaultsecure.in',
        company_name: 'Apex Legal Partners',
        department: 'Corporate M&A',
        id_type: 'PASSPORT',
        id_number_masked: '****4321'
      },
      recipient: {
        full_name: 'Priya Sundaram',
        phone: '+919876543210',
        alternate_phone: '+919876543211',
        email: 'priya.s@techhorizon.com',
        company_name: 'Tech Horizon Solutions',
        department: 'Finance & Compliance',
        id_type: 'AADHAAR',
        id_number_masked: '****9876'
      },
      emergency: {
        full_name: 'Kavita Menon',
        phone: '+919811223344',
        relationship: 'Operations Director'
      }
    },
    timing: {
      pickup_window: {
        scheduled_date: '2026-09-20',
        start_time: '10:00:00',
        end_time: '11:30:00',
        timezone: 'Asia/Kolkata'
      },
      delivery_window: {
        scheduled_date: '2026-09-20',
        start_time: '14:00:00',
        end_time: '16:00:00',
        timezone: 'Asia/Kolkata'
      },
      is_asap: false,
      grace_period_minutes: 15,
      special_timing_notes: 'Urgent handover before board review meeting at 4 PM'
    },
    package_details: {
      items: [
        {
          item_id: 'ITEM-001',
          item_name: 'Acquisition Contracts (Triplicate Original)',
          category: 'DOCUMENT',
          quantity: 3,
          declared_value: 250000,
          currency: 'INR',
          dimensions: { length: 35.0, width: 25.0, height: 5.0, unit: 'cm' },
          weight: { value: 1.8, unit: 'kg' },
          is_fragile: false,
          is_hazardous: false,
          special_instructions: 'Do not bend or expose to moisture'
        }
      ],
      attachments: [
        {
          attachment_id: 'ATT-001',
          attachment_type: 'CHAIN_OF_CUSTODY_DOC',
          file_name: 'custody_manifest_signed.pdf',
          file_size_bytes: 412500,
          mime_type: 'application/pdf',
          url: 'https://cdn.vaultdelivery.com/manifests/custody_manifest_signed.pdf'
        }
      ],
      packaging: {
        packaging_type: 'TAMPER_EVIDENT_ENVELOPE',
        custom_packaging_requested: true,
        packaging_instructions: 'Place in heavy-duty tamper-proof security sleeve with serialized lock',
        requires_temperature_control: false,
        requires_shock_indicator: true
      }
    },
    security: {
      level: 'ULTRA_HIGH',
      chain_of_custody: true,
      digital_seal: true,
      tamper_evident: true,
      two_person_verification: false,
      armed_escort: false,
      gps_tracking_level: 'CONTINUOUS',
      geo_fencing_enabled: true,
      allow_subcontractor: false,
      security_officer_assigned: 'SO-VIKRAM-781'
    },
    verification: {
      pickup: {
        id_verification: true,
        signature_required: true,
        otp_required: true,
        photo_proof: true,
        tamper_seal_scan: true
      },
      delivery: {
        id_verification: true,
        signature_required: true,
        otp_required: true,
        photo_proof: true,
        tamper_seal_scan: true,
        thumbprint_required: false
      },
      audit_trail: {
        log_all_events: true,
        gps_breadcrumbs: true,
        tamper_alert_notifications: true
      },
      custody_signatures: []
    }
  };

  const services = [
    {
      name: 'Vault Secure',
      slug: 'vault_secure',
      desc: 'Standard secure delivery with electronic tamper seal and monitoring',
      specific: {
        vault_type: 'ELECTRONIC_TAMPER_SEAL',
        lock_type: 'DIGITAL_PIN_AND_SEAL',
        seal_numbers: ['SL-SEC-9901', 'SL-SEC-9902'],
        escort_required: false,
        monitoring_tier: 'CONTINUOUS_SOC',
        max_idle_seconds: 300,
        emergency_protocol: 'NOTIFY_DISPATCH_AND_POLICE'
      }
    },
    {
      name: 'Vault Priority',
      slug: 'vault_priority',
      desc: 'Fastest priority delivery with dedicated vehicle and 60 min transit guarantee',
      specific: {
        priority_level: 'TIER_1',
        max_transit_minutes: 60,
        dedicated_vehicle: true,
        sla_guarantee_minutes: 75,
        route_optimization: 'FASTEST_DIRECT',
        bypass_checkpoints: false
      }
    },
    {
      name: 'Vault Direct',
      slug: 'vault_direct',
      desc: 'Point-to-point delivery with zero intermediate stops and deviation alerts',
      specific: {
        point_to_point: true,
        zero_intermediate_stops: true,
        seal_intact_at_delivery: true,
        route_deviation_alert: true,
        deviation_radius_meters: 100
      }
    },
    {
      name: 'Vault Precise',
      slug: 'vault_precise',
      desc: 'Delivery within strict 15-minute scheduled appointment window',
      specific: {
        time_window_minutes: 15,
        preferred_delivery_exact: '2026-09-20T14:30:00Z',
        pre_call_minutes: 20,
        late_compensation_applied: false,
        max_wait_minutes: 10
      }
    },
    {
      name: 'Vault Hand Carry',
      slug: 'vault_hand_carry',
      desc: 'In-person executive courier handover with flight/cabin approval',
      specific: {
        courier_identity: 'HC-AGENT-007',
        cabin_luggage_approved: true,
        flight_number: '6E-452',
        handover_protocol: 'IN_PERSON_EYE_CONTACT',
        hotel_stay_protocol: 'IN_ROOM_VAULT'
      }
    },
    {
      name: 'Vault Return',
      slug: 'vault_return',
      desc: 'Round-trip delivery with counter-collection and automated return trigger',
      specific: {
        is_round_trip: true,
        return_condition: 'UNOPENED_AND_SIGNED',
        return_pickup_window: {
          scheduled_date: '2026-09-21',
          start_time: '11:00:00',
          end_time: '13:00:00',
          timezone: 'Asia/Kolkata'
        },
        return_recipient: {
          full_name: 'Rajesh Sharma',
          phone: '+919895226999',
          address_line1: 'Tower A, Floor 14, Brigade Gateway',
          city: 'Bengaluru',
          postal_code: '560055'
        },
        auto_return_trigger: 'RECIPIENT_SIGNATURE_COMPLETED'
      }
    },
    {
      name: 'Vault Exchange',
      slug: 'vault_exchange',
      desc: 'Simultaneous two-way document or item swap with inspection protocol',
      specific: {
        exchange_type: 'TWO_WAY_SIMULTANEOUS',
        exchange_reason: 'CONTRACT_COUNTER_EXECUTION',
        exchange_id: 'EXC-2026-009',
        outgoing_item: {
          name: 'Original Execution Draft Copy A',
          serial_number: 'DOC-EXEC-101'
        },
        incoming_item: {
          name: 'Executed Counterpart Copy B with Board Seal',
          serial_number: 'DOC-EXEC-102'
        },
        exchange_instructions: 'Verify Board Seal before handing over Copy A',
        expected_exchange_date: '2026-09-20',
        swap_time_window: '30_MINUTES',
        same_as_pickup: true
      }
    },
    {
      name: 'Vault Critical',
      slug: 'vault_critical',
      desc: 'Mission-critical delivery with dual couriers, standby backup vehicle, and SOC alerts',
      specific: {
        criticality_level: 'LIFE_CRITICAL',
        dual_courier: true,
        police_intimation: false,
        backup_vehicle_on_standby: true,
        failsafe_abort_protocol: 'RETURN_TO_BASE_IMMEDIATELY',
        soc_call_frequency_minutes: 15
      }
    },
    {
      name: 'Vault MultiPoint',
      slug: 'vault_multipoint',
      desc: 'Multi-stop journey with 3+ intermediate points, individual stop verification',
      specific: {
        route_type: 'OPTIMIZED',
        total_stops: 3,
        allow_stop_reordering: false,
        stops: [
          {
            stop_sequence: 1,
            stop_type: 'DROPOFF',
            address: {
              address_line1: 'Stop 1: KPMG Tower, Level 4, RMZ Infinity',
              city: 'Bengaluru',
              postal_code: '560016'
            },
            contact: {
              full_name: 'Sunil Mehta',
              phone: '+919845011111'
            },
            package_actions: ['DELIVER_PACKAGE_1'],
            verification_requirements: ['OTP', 'SIGNATURE']
          },
          {
            stop_sequence: 2,
            stop_type: 'PICKUP',
            address: {
              address_line1: 'Stop 2: Ernst & Young Office, Bagmane Tech Park',
              city: 'Bengaluru',
              postal_code: '560093'
            },
            contact: {
              full_name: 'Ananya Rao',
              phone: '+919845022222'
            },
            package_actions: ['PICKUP_ADDITIONAL_AUDIT_DOCS'],
            verification_requirements: ['ID_CHECK', 'SIGNATURE']
          },
          {
            stop_sequence: 3,
            stop_type: 'DROPOFF',
            address: {
              address_line1: 'Stop 3: Embassy GolfLinks, Business Park',
              city: 'Bengaluru',
              postal_code: '560071'
            },
            contact: {
              full_name: 'Deepak Verma',
              phone: '+919845033333'
            },
            package_actions: ['FINAL_DELIVERY_ALL_ITEMS'],
            verification_requirements: ['OTP', 'SIGNATURE', 'PHOTO']
          }
        ]
      }
    }
  ];

  // Build items array for collection
  const collection = {
    info: {
      _postman_id: 'vault-courier-canonical-collection-v2',
      name: 'Confidential Courier (Vault) Enterprise API',
      description: 'Authoritative, canonical API collection for Delivez Confidential Courier (Vault) covering all 9 services, relational persistence, payments lifecycle, and receipts.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    variable: [
      { key: 'base_url', value: 'http://localhost:4000/api/v1', type: 'string' },
      { key: 'auth_token', value: '', type: 'string' },
      { key: 'challenge_id', value: '', type: 'string' },
      { key: 'otp_code', value: '', type: 'string' },
      { key: 'booking_id', value: '', type: 'string' },
      { key: 'payment_id', value: '', type: 'string' },
      { key: 'receipt_id', value: '', type: 'string' }
    ],
    item: [
      // 1. Authentication Folder
      {
        name: '1. Authentication',
        item: [
          {
            name: '1.1 Request OTP Login',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'if (jsonData.data && jsonData.data.challengeId) {',
                    '    pm.collectionVariables.set("challenge_id", jsonData.data.challengeId);',
                    '    pm.collectionVariables.set("otp_code", jsonData.data.developmentOtp || jsonData.data.otp);',
                    '    console.log("Challenge ID saved: " + jsonData.data.challengeId);',
                    '}'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ countryCode: '+91', mobileNumber: '9895226999' }, null, 2)
              },
              url: {
                raw: '{{base_url}}/auth/login',
                host: ['{{base_url}}'],
                path: ['auth', 'login']
              }
            }
          },
          {
            name: '1.2 Verify OTP & Get Access Token',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'if (jsonData.data && jsonData.data.accessToken) {',
                    '    pm.collectionVariables.set("auth_token", jsonData.data.accessToken);',
                    '    console.log("Auth Token saved successfully!");',
                    '}'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [{ key: 'Content-Type', value: 'application/json' }],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ challengeId: '{{challenge_id}}', otp: '{{otp_code}}' }, null, 2)
              },
              url: {
                raw: '{{base_url}}/auth/verify-otp',
                host: ['{{base_url}}'],
                path: ['auth', 'verify-otp']
              }
            }
          }
        ]
      },

      // 2. Bookings - 9 Canonical Services
      {
        name: '2. Create Bookings (All 9 Canonical Services)',
        item: services.map((s, idx) => {
          const bodyPayload = {
            service_selection: {
              service_type: s.name,
              service_name: s.name,
              speed_tier: 'EXPRESS',
              vehicle_type: 'FOUR_WHEELER',
              description: s.desc
            },
            ...commonSteps,
            service_specific: s.specific
          };

          return {
            name: `2.${idx + 1} Create Booking: ${s.name}`,
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Booking ID returned", function () { pm.expect(jsonData.data.booking_id).to.be.a("string"); });',
                    'pm.test("Pricing calculated with GST", function () { pm.expect(jsonData.data.pricing.total_fare).to.be.above(0); });',
                    'pm.collectionVariables.set("booking_id", jsonData.data.booking_id);',
                    'console.log("Saved active booking_id: " + jsonData.data.booking_id);'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify(bodyPayload, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/bookings',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'bookings']
              }
            }
          };
        })
      },

      // 3. Bookings - CRUD Management
      {
        name: '3. Booking CRUD Management',
        item: [
          {
            name: '3.1 List All User Bookings',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Returns array of bookings", function () { pm.expect(Array.isArray(jsonData.data)).to.be.true; });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{auth_token}}' }],
              url: {
                raw: '{{base_url}}/courier-delivery/bookings',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'bookings']
              }
            }
          },
          {
            name: '3.2 Get Booking By ID (Canonical Reconstruction)',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Matches booking_id", function () { pm.expect(jsonData.data.booking_id).to.eql(pm.collectionVariables.get("booking_id")); });',
                    'pm.test("Reconstructs addresses", function () { pm.expect(jsonData.data.addresses.pickup.city).to.eql("Bengaluru"); });',
                    'pm.test("Reconstructs security", function () { pm.expect(jsonData.data.security.level).to.eql("ULTRA_HIGH"); });',
                    'pm.test("Reconstructs pricing", function () { pm.expect(jsonData.data.pricing.total_fare).to.be.above(0); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{auth_token}}' }],
              url: {
                raw: '{{base_url}}/courier-delivery/bookings/{{booking_id}}',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'bookings', '{{booking_id}}']
              }
            }
          },
          {
            name: '3.3 Full Update (PUT Booking)',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Updated timing notes reflected", function () {',
                    '    pm.expect(jsonData.data.timing.special_timing_notes).to.include("Rescheduled");',
                    '});'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'PUT',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  timing: {
                    special_timing_notes: 'Rescheduled pickup time by client request via Postman.'
                  }
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/bookings/{{booking_id}}',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'bookings', '{{booking_id}}']
              }
            }
          },
          {
            name: '3.4 Partial Update (PATCH Booking)',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Status updated to CONFIRMED", function () { pm.expect(jsonData.data.status).to.eql("CONFIRMED"); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'PATCH',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  status: 'CONFIRMED',
                  special_instructions: 'Updated: Handle with utmost care and verify ID strictly.'
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/bookings/{{booking_id}}',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'bookings', '{{booking_id}}']
              }
            }
          },
          {
            name: '3.5 Cancel Booking (DELETE Booking)',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'DELETE',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ reason: 'Client requested cancellation for testing.' }, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/bookings/{{booking_id}}',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'bookings', '{{booking_id}}']
              }
            }
          }
        ]
      },

      // 4. Payments API
      {
        name: '4. Payments API',
        item: [
          {
            name: '4.1 Initiate Payment',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Payment ID generated", function () { pm.expect(jsonData.data.payment_id).to.be.a("string"); });',
                    'pm.test("Initial status is pending", function () { pm.expect(jsonData.data.status.toLowerCase()).to.eql("pending"); });',
                    'pm.collectionVariables.set("payment_id", jsonData.data.payment_id);'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  booking_id: '{{booking_id}}',
                  payment_method: 'UPI',
                  currency: 'INR'
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/payments',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'payments']
              }
            }
          },
          {
            name: '4.2 Verify Payment (Server-Side Signature & Auto-Receipt)',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Payment status is paid", function () { pm.expect(jsonData.data.status.toLowerCase()).to.eql("paid"); });',
                    'pm.test("Receipt auto-generated", function () { pm.expect(jsonData.data.receipt.receipt_id).to.be.a("string"); });',
                    'pm.collectionVariables.set("receipt_id", jsonData.data.receipt.receipt_id);'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({
                  gateway_payment_id: 'PAY_GATEWAY_RAZORPAY_991823',
                  gateway_signature: 'SIG_HMAC_SHA256_VERIFIED_TOKEN_991',
                  metadata: { upi_vpa: 'test@okhdfcbank', mode: 'UPI' }
                }, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/payments/{{payment_id}}/verify',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'payments', '{{payment_id}}', 'verify']
              }
            }
          },
          {
            name: '4.3 Get Payment By ID',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Payment ID matches", function () { pm.expect(jsonData.data.payment_id).to.eql(pm.collectionVariables.get("payment_id")); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{auth_token}}' }],
              url: {
                raw: '{{base_url}}/courier-delivery/payments/{{payment_id}}',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'payments', '{{payment_id}}']
              }
            }
          },
          {
            name: '4.4 Get Payment By Booking ID',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Payment status is paid", function () { pm.expect(jsonData.data.status.toLowerCase()).to.eql("paid"); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{auth_token}}' }],
              url: {
                raw: '{{base_url}}/courier-delivery/bookings/{{booking_id}}/payment',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'bookings', '{{booking_id}}', 'payment']
              }
            }
          },
          {
            name: '4.5 Refund Payment',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Payment marked refunded", function () { pm.expect(jsonData.data.status.toLowerCase()).to.eql("refunded"); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ reason: 'Customer requested cancellation and refund.' }, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/payments/{{payment_id}}/refund',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'payments', '{{payment_id}}', 'refund']
              }
            }
          }
        ]
      },

      // 5. Receipts API
      {
        name: '5. Receipts API',
        item: [
          {
            name: '5.1 Generate / Fetch Receipt',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200 or 201", function () { pm.expect([200, 201]).to.include(pm.response.code); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Receipt ID present", function () { pm.expect(jsonData.data.receipt_id).to.be.a("string"); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ booking_id: '{{booking_id}}' }, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/receipts',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'receipts']
              }
            }
          },
          {
            name: '5.2 Idempotent Receipt Call (Same booking)',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200 (Idempotent)", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Same receipt_id returned", function () { pm.expect(jsonData.data.receipt_id).to.eql(pm.collectionVariables.get("receipt_id")); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'POST',
              header: [
                { key: 'Content-Type', value: 'application/json' },
                { key: 'Authorization', value: 'Bearer {{auth_token}}' }
              ],
              body: {
                mode: 'raw',
                raw: JSON.stringify({ booking_id: '{{booking_id}}' }, null, 2)
              },
              url: {
                raw: '{{base_url}}/courier-delivery/receipts',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'receipts']
              }
            }
          },
          {
            name: '5.3 Get Receipt By ID',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Receipt ID matches", function () { pm.expect(jsonData.data.receipt_id).to.eql(pm.collectionVariables.get("receipt_id")); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{auth_token}}' }],
              url: {
                raw: '{{base_url}}/courier-delivery/receipts/{{receipt_id}}',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'receipts', '{{receipt_id}}']
              }
            }
          },
          {
            name: '5.4 Get Receipt By Booking ID',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Receipt ID matches", function () { pm.expect(jsonData.data.receipt_id).to.eql(pm.collectionVariables.get("receipt_id")); });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{auth_token}}' }],
              url: {
                raw: '{{base_url}}/courier-delivery/bookings/{{booking_id}}/receipt',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'bookings', '{{booking_id}}', 'receipt']
              }
            }
          },
          {
            name: '5.5 List All Receipts',
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
                    'var jsonData = pm.response.json();',
                    'pm.test("Returns array of receipts", function () { pm.expect(Array.isArray(jsonData.data)).to.be.true; });'
                  ],
                  type: 'text/javascript'
                }
              }
            ],
            request: {
              method: 'GET',
              header: [{ key: 'Authorization', value: 'Bearer {{auth_token}}' }],
              url: {
                raw: '{{base_url}}/courier-delivery/receipts',
                host: ['{{base_url}}'],
                path: ['courier-delivery', 'receipts']
              }
            }
          }
        ]
      }
    ]
  };

  const outputDir = path.join(__dirname, '..', 'postman');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'Confidential_Courier_Vault_API.postman_collection.json');
  fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), 'utf-8');
  console.log(`Successfully generated Postman collection at: ${outputPath}`);
}

createPostmanCollection();
