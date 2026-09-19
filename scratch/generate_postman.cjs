const fs = require('fs');
const path = require('path');

function createCollection(isProduction) {
  const envName = isProduction ? 'Production' : 'Local';
  const defaultBaseUrl = isProduction ? 'https://api.delivez.com/api/v1' : 'http://localhost:4000/api/v1';

  const masterSampleBookingPayload = {
    api_version: "1.0",
    client_request_id: "req_luggage_blr_001",
    payment_method: "UPI",
    service: {
      service_id: "home_airport"
    },
    route: {
      route_type: "single_trip"
    },
    pickup: {
      location_type: "home",
      full_address: "Flat 402, Sunrise Heights, 12th Main Road, Indiranagar, Bengaluru",
      landmark: "Opposite Metro Pillar 104",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      latitude: 12.9784,
      longitude: 77.6408,
      contact: {
        full_name: "Rahul Sharma",
        mobile: "+919876543210",
        email: "rahul.sharma@example.com"
      }
    },
    delivery: {
      location_type: "airport",
      full_address: "Kempegowda International Airport, Terminal 1 Departure Ramp, Devanahalli, Bengaluru",
      landmark: "Near Pillar 4 Departure Gate",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560300",
      latitude: 13.1986,
      longitude: 77.7066,
      contact: {
        full_name: "Rahul Sharma",
        mobile: "+919876543210",
        email: "rahul.sharma@example.com"
      },
      airport_specific: {
        terminal: "T1",
        departure_time: "2026-09-19T18:30:00.000Z",
        flight_number: "6E-2041",
        pnr: "AB12CD",
        airline_name: "IndiGo",
        gate_number: "Gate 4",
        meeting_point: "Departure Pillar 4"
      }
    },
    flight_details: {
      airline_name: "IndiGo",
      flight_number: "6E-2041",
      pnr: "AB12CD",
      departure_time: "2026-09-19T18:30:00.000Z",
      terminal: "T1"
    },
    luggage_items: [
      {
        item_id: "item_1",
        bag_type: "large",
        quantity: 1,
        declared_weight_kg: 23,
        dimensions: { length_cm: 75, width_cm: 50, height_cm: 32 },
        is_fragile: false,
        is_valuable: false,
        description: "Navy blue Samsonite hard trolley with number lock"
      },
      {
        item_id: "item_2",
        bag_type: "medium",
        quantity: 1,
        declared_weight_kg: 15,
        dimensions: { length_cm: 65, width_cm: 42, height_cm: 26 },
        is_fragile: true,
        is_valuable: true,
        description: "Delsey brown spinner with fragile electronics"
      }
    ],
    schedule: {
      pickup_type: "scheduled",
      pickup_time: "2026-09-19T13:00:00.000Z",
      delivery_speed: {
        type: "standard",
        label: "Standard (3-4 hrs)"
      }
    },
    luggage_protection: {
      enabled: true,
      selected_items: [
        { id: "tamper_tag", title: "Tamper-proof Tag", price: 99 }
      ]
    },
    airport_assistance: {
      enabled: true,
      selected_services: [
        { id: "meet_assist", title: "Meet & Assist", price: 499 }
      ]
    },
    add_ons: {
      selected_items: [
        { code: "secure_luggage_tag", title: "Tamper-evident luggage tag", price: 29 },
        { code: "photo_proof_delivery", title: "Photo proof of delivery", price: 19 }
      ]
    },
    applied_coupon: {
      code: "DELIVEZ10"
    },
    gst_invoice: {
      required: true,
      company_name: "TechCorp Global Solutions Pvt Ltd",
      gstin: "29ABCDE1234F1Z5",
      billing_address: "Embassy TechVillage, Bellandur, Bengaluru",
      state_code: "29"
    },
    special_instructions: "Please call 15 minutes before reaching Indiranagar residence."
  };

  const collection = {
    info: {
      name: `Delivez - Luggage Delivery (${envName})`,
      description: `Complete Master Contract Luggage Delivery API collection for ${envName}.\nStrictly adheres to Master Contract JSON. Covers Authentication, Discovery, Quotes for all 7 service types, Coupon validation, Booking creation, Payments, Receipt, and Tracking.`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    variable: [
      { key: "baseUrl", value: defaultBaseUrl, type: "string" },
      { key: "authToken", value: "", type: "string" },
      { key: "challengeId", value: "", type: "string" },
      { key: "userMobile", value: "9876543210", type: "string" },
      { key: "booking_id", value: "", type: "string" },
      { key: "booking_number", value: "", type: "string" },
      { key: "order_id", value: "", type: "string" }
    ],
    item: [
      {
        name: "0. Authentication (Get Token)",
        item: [
          {
            name: "POST Send Login OTP",
            event: [
              {
                listen: "test",
                script: {
                  exec: [
                    "var res = pm.response.json();",
                    "if (res.data && res.data.challengeId) {",
                    "  pm.collectionVariables.set('challengeId', res.data.challengeId);",
                    "  try { pm.environment.set('challengeId', res.data.challengeId); } catch(e) {}",
                    "  console.log('Saved challengeId:', res.data.challengeId);",
                    "}"
                  ],
                  type: "text/javascript"
                }
              }
            ],
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ countryCode: "+91", mobileNumber: "{{userMobile}}" }, null, 2)
              },
              url: { raw: "{{baseUrl}}/auth/login", host: ["{{baseUrl}}"], path: ["auth", "login"] }
            }
          },
          {
            name: "POST Verify OTP & Extract Token",
            event: [
              {
                listen: "test",
                script: {
                  exec: [
                    "var res = pm.response.json();",
                    "if (res.data && res.data.accessToken) {",
                    "  pm.collectionVariables.set('authToken', res.data.accessToken);",
                    "  try { pm.environment.set('authToken', res.data.accessToken); } catch(e) {}",
                    "  console.log('Successfully saved authToken!');",
                    "}"
                  ],
                  type: "text/javascript"
                }
              }
            ],
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ challengeId: "{{challengeId}}", otp: "123456" }, null, 2)
              },
              url: { raw: "{{baseUrl}}/auth/verify-otp", host: ["{{baseUrl}}"], path: ["auth", "verify-otp"] }
            }
          }
        ]
      },
      {
        name: "1. Discovery & Catalog",
        item: [
          {
            name: "GET Service Options & Catalog",
            request: {
              method: "GET",
              header: [{ key: "Accept", value: "application/json" }],
              url: { raw: "{{baseUrl}}/luggage-delivery/options", host: ["{{baseUrl}}"], path: ["luggage-delivery", "options"] }
            }
          }
        ]
      },
      {
        name: "2. Server-Side Quote Engine (All 7 Services)",
        item: [
          {
            name: "POST Quote - Home to Airport",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  service_type: "home_airport",
                  pickup: masterSampleBookingPayload.pickup,
                  delivery: masterSampleBookingPayload.delivery,
                  flight_details: masterSampleBookingPayload.flight_details,
                  luggage_items: masterSampleBookingPayload.luggage_items,
                  schedule: masterSampleBookingPayload.schedule,
                  luggage_protection: masterSampleBookingPayload.luggage_protection,
                  airport_assistance: masterSampleBookingPayload.airport_assistance,
                  add_ons: masterSampleBookingPayload.add_ons,
                  applied_coupon: { code: "DELIVEZ10" }
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/quote", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "quote"] }
            }
          },
          {
            name: "POST Quote - Airport to Home",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  service_type: "airport_home",
                  pickup: masterSampleBookingPayload.delivery,
                  delivery: masterSampleBookingPayload.pickup,
                  flight_details: masterSampleBookingPayload.flight_details,
                  luggage_items: [{ bag_type: "large", quantity: 2, weight_kg: 20 }],
                  schedule: { pickup_time: "2026-09-19T14:00:00.000Z", delivery_speed: { type: "express" } }
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/quote", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "quote"] }
            }
          },
          {
            name: "POST Quote - Hotel to Airport",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  service_type: "hotel_airport",
                  hotel_details: { hotel_name: "The Oberoi", room_number: "305", guest_name: "Rahul Sharma" },
                  luggage_items: [{ bag_type: "medium", quantity: 1, weight_kg: 15 }]
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/quote", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "quote"] }
            }
          },
          {
            name: "POST Quote - Airport to Hotel",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  service_type: "airport_hotel",
                  hotel_details: { hotel_name: "The Oberoi", room_number: "305", guest_name: "Rahul Sharma", front_desk_handover: true },
                  luggage_items: [{ bag_type: "large", quantity: 1, weight_kg: 22 }]
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/quote", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "quote"] }
            }
          },
          {
            name: "POST Quote - Hotel to Home",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  service_type: "hotel_home",
                  hotel_details: { hotel_name: "Taj West End", guest_name: "Rahul Sharma" },
                  luggage_items: [{ bag_type: "medium", quantity: 2, weight_kg: 14 }]
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/quote", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "quote"] }
            }
          },
          {
            name: "POST Quote - Home to Hotel",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  service_type: "home_hotel",
                  hotel_details: { hotel_name: "ITC Gardenia", guest_name: "Rahul Sharma" },
                  luggage_items: [{ bag_type: "small", quantity: 1, weight_kg: 7 }]
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/quote", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "quote"] }
            }
          },
          {
            name: "POST Quote - Multi-Stop Route",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  service_type: "multi_stop",
                  multi_stops: [
                    { stop_number: 1, full_address: "Indiranagar, Bengaluru", action: "pickup" },
                    { stop_number: 2, full_address: "The Leela Palace, Bengaluru", action: "drop" },
                    { stop_number: 3, full_address: "KIA Airport T1, Bengaluru", action: "drop" }
                  ],
                  luggage_items: [{ bag_type: "large", quantity: 2, weight_kg: 20 }]
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/quote", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "quote"] }
            }
          }
        ]
      },
      {
        name: "3. Coupon Engine",
        item: [
          {
            name: "POST Validate Coupon DELIVEZ10 (10% OFF)",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ coupon_code: "DELIVEZ10", subtotal: 1200 }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/validate-coupon", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "validate-coupon"] }
            }
          },
          {
            name: "POST Validate Coupon WELCOME50 (₹50 FLAT)",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ coupon_code: "WELCOME50", subtotal: 600 }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/validate-coupon", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "validate-coupon"] }
            }
          },
          {
            name: "POST Validate Coupon AIRPORT100 (₹100 FLAT)",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ coupon_code: "AIRPORT100", subtotal: 1000 }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/validate-coupon", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "validate-coupon"] }
            }
          }
        ]
      },
      {
        name: "4. Booking & Order Lifecycle",
        item: [
          {
            name: "POST Create Master Booking (Strict JSON Contract)",
            event: [
              {
                listen: "test",
                script: {
                  exec: [
                    "var jsonData = pm.response.json();",
                    "if (jsonData.success && jsonData.data) {",
                    "  var b = jsonData.data.booking || jsonData.data;",
                    "  pm.collectionVariables.set('booking_id', b.booking_id || b.id);",
                    "  pm.collectionVariables.set('booking_number', b.booking_number || b.bookingNumber);",
                    "  try {",
                    "    pm.environment.set('booking_id', b.booking_id || b.id);",
                    "    pm.environment.set('booking_number', b.booking_number || b.bookingNumber);",
                    "  } catch(e) {}",
                    "  console.log('Saved booking:', b.booking_number);",
                    "}"
                  ],
                  type: "text/javascript"
                }
              }
            ],
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{authToken}}" },
                { key: "Idempotency-Key", value: "idemp_luggage_{{$timestamp}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(masterSampleBookingPayload, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings"] }
            }
          },
          {
            name: "GET Booking Details (Master Contract JSON)",
            request: {
              method: "GET",
              header: [
                { key: "Accept", value: "application/json" },
                { key: "Authorization", value: "Bearer {{authToken}}" }
              ],
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/{{booking_id}}", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "{{booking_id}}"] }
            }
          },
          {
            name: "GET List User Bookings",
            request: {
              method: "GET",
              header: [
                { key: "Accept", value: "application/json" },
                { key: "Authorization", value: "Bearer {{authToken}}" }
              ],
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings?page=1&limit=10", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings"], query: [{ key: "page", value: "1" }, { key: "limit", value: "10" }] }
            }
          },
          {
            name: "GET GST Invoice & Receipt",
            request: {
              method: "GET",
              header: [
                { key: "Accept", value: "application/json" },
                { key: "Authorization", value: "Bearer {{authToken}}" }
              ],
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/{{booking_id}}/receipt", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "{{booking_id}}", "receipt"] }
            }
          },
          {
            name: "POST Cancel Booking",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{authToken}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ reason: "Flight rescheduled by airline" }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/bookings/{{booking_id}}/cancel", host: ["{{baseUrl}}"], path: ["luggage-delivery", "bookings", "{{booking_id}}", "cancel"] }
            }
          }
        ]
      },
      {
        name: "5. Payment Gateway Lifecycle",
        item: [
          {
            name: "POST Create Payment Order (Gateway Init)",
            event: [
              {
                listen: "test",
                script: {
                  exec: [
                    "var res = pm.response.json();",
                    "if (res.data && (res.data.order_id || res.data.gateway_order_id)) {",
                    "  var oid = res.data.order_id || res.data.gateway_order_id;",
                    "  pm.collectionVariables.set('order_id', oid);",
                    "  try { pm.environment.set('order_id', oid); } catch(e) {}",
                    "  console.log('Saved order_id:', oid);",
                    "}"
                  ],
                  type: "text/javascript"
                }
              }
            ],
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{authToken}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  booking_id: "{{booking_id}}",
                  gateway: "razorpay",
                  payment_method: "upi"
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/payments/create", host: ["{{baseUrl}}"], path: ["luggage-delivery", "payments", "create"] }
            }
          },
          {
            name: "POST Verify Payment (Gateway Verification)",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{authToken}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  booking_id: "{{booking_id}}",
                  gateway: "razorpay",
                  payment_id: "pay_sample_123456",
                  order_id: "{{order_id}}",
                  signature: "sample_signature_hash"
                }, null, 2)
              },
              url: { raw: "{{baseUrl}}/luggage-delivery/payments/verify", host: ["{{baseUrl}}"], path: ["luggage-delivery", "payments", "verify"] }
            }
          }
        ]
      },
      {
        name: "6. Tracking & Milestones",
        item: [
          {
            name: "GET Live Tracking by Tracking ID / Booking Number",
            request: {
              method: "GET",
              header: [{ key: "Accept", value: "application/json" }],
              url: { raw: "{{baseUrl}}/luggage-delivery/tracking/{{booking_number}}", host: ["{{baseUrl}}"], path: ["luggage-delivery", "tracking", "{{booking_number}}"] }
            }
          }
        ]
      }
    ]
  };

  return collection;
}

function createEnvironment(isProduction) {
  const envName = isProduction ? 'Production' : 'Local';
  const defaultBaseUrl = isProduction ? 'https://api.delivez.com/api/v1' : 'http://localhost:4000/api/v1';

  return {
    id: isProduction ? "delivez-luggage-prod-env-id" : "delivez-luggage-local-env-id",
    name: `Delivez - Luggage Delivery (${envName})`,
    values: [
      { key: "baseUrl", value: defaultBaseUrl, enabled: true },
      { key: "userMobile", value: "9876543210", enabled: true },
      { key: "authToken", value: "", enabled: true },
      { key: "challengeId", value: "", enabled: true },
      { key: "booking_id", value: "", enabled: true },
      { key: "booking_number", value: "", enabled: true },
      { key: "order_id", value: "", enabled: true }
    ],
    _postman_variable_scope: "environment"
  };
}

const prodCollection = createCollection(true);
const localCollection = createCollection(false);
const prodEnv = createEnvironment(true);
const localEnv = createEnvironment(false);

const postmanDir = path.join(__dirname, '../postman');
const prodPath = path.join(postmanDir, 'Delivez-Luggage-Delivery-Production.postman_collection.json');
const localPath = path.join(postmanDir, 'Delivez-Luggage-Delivery-Local.postman_collection.json');
const prodEnvPath = path.join(postmanDir, 'Delivez-Luggage-Delivery-Production.postman_environment.json');
const localEnvPath = path.join(postmanDir, 'Delivez-Luggage-Delivery-Local.postman_environment.json');

fs.writeFileSync(prodPath, JSON.stringify(prodCollection, null, 2), 'utf8');
fs.writeFileSync(localPath, JSON.stringify(localCollection, null, 2), 'utf8');
fs.writeFileSync(prodEnvPath, JSON.stringify(prodEnv, null, 2), 'utf8');
fs.writeFileSync(localEnvPath, JSON.stringify(localEnv, null, 2), 'utf8');

console.log('Successfully generated Postman files:');
console.log('1. ' + prodPath);
console.log('2. ' + localPath);
console.log('3. ' + prodEnvPath);
console.log('4. ' + localEnvPath);
