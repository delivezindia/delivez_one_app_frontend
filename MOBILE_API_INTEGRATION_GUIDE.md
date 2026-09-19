# Delivez Mobile Application — Step-by-Step API Implementation Guide

This guide is the master technical specification for mobile application developers building the **Delivez iOS & Android apps** (Flutter, React Native, Swift, or Kotlin).

---

## 📱 Mobile Architecture & Global Standards

### Base URLs
| Environment | Base URL |
|---|---|
| **Local Development** | `http://localhost:4000/api/v1` *(Android Emulator: `http://10.0.2.2:4000/api/v1`)* |
| **Staging / Testing** | `http://40.81.244.167:3012/api/v1` |
| **Production** | `https://api.delivez.com/api/v1` |

### Global HTTP Headers
All mobile requests should include:
```http
Accept: application/json
Content-Type: application/json
User-Agent: DelivezMobile/1.0.0 (Android 14; Pixel 8)
X-Device-Id: {{unique_device_uuid}}
```

When authenticated:
```http
Authorization: Bearer <accessToken>
```

For mutating state actions (order creation), send an idempotency key to prevent duplicate charges:
```http
Idempotency-Key: idemp-<uuid-or-timestamp>
```

### Standard Response Envelope
**Success (2xx):**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error (4xx / 5xx):**
```json
{
  "status": "error",
  "message": "Human readable error description",
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed diagnostic information"
  }
}
```

---

## 🚀 STEP-BY-STEP IMPLEMENTATION ROADMAP

---

### SCREEN 0: Splash & App Startup

#### 1. System Health & Connectivity Check
Verify server availability before loading the UI.
* **Method**: `GET`
* **Endpoint**: `/health`
* **Auth**: None
* **Response**:
```json
{
  "status": "ok",
  "service": "delivery-app-backend",
  "uptimeSeconds": 1420
}
```

#### 2. Active Broadcasts / Maintenance Banners
Fetch real-time announcements, emergency notices, or festival promo banners.
* **Method**: `GET`
* **Endpoint**: `/broadcasts/active`
* **Auth**: None
* **Response**:
```json
{
  "status": "success",
  "data": {
    "broadcasts": [
      {
        "id": "bc-1",
        "title": "Monsoon Delivery Advisory",
        "message": "Express deliveries in Bengaluru may take an additional 15 mins due to rain.",
        "type": "INFO",
        "active": true
      }
    ]
  }
}
```

---

### SCREEN 1: Authentication & Onboarding

Delivez uses **Phone Number OTP Login** as the primary frictionless mobile authentication mechanism with fallback to password.

#### Step 1: Send Login OTP
When user enters their 10-digit mobile number on the login screen.
* **Method**: `POST`
* **Endpoint**: `/auth/login`
* **Request Body**:
```json
{
  "countryCode": "+91",
  "mobileNumber": "9876543210"
}
```
* **Response (OTP Dispatched)**:
```json
{
  "status": "success",
  "message": "An OTP has been sent to your mobile number.",
  "data": {
    "challengeId": "68f4e12c-4971-4648-9c59-d890fa38bb39",
    "maskedPhone": "******3210",
    "expiresInSeconds": 600
  }
}
```
> **Mobile UI Action**: Navigate user to the 6-digit OTP Input screen and start a 60-second countdown timer. Store `challengeId` in memory.

#### Step 2: Verify 6-Digit OTP
When user types the 6 digits received via SMS.
* **Method**: `POST`
* **Endpoint**: `/auth/verify-otp`
* **Request Body**:
```json
{
  "challengeId": "68f4e12c-4971-4648-9c59-d890fa38bb39",
  "otp": "482910",
  "deviceId": "pixel8-android-uuid"
}
```
* **Response (Authenticated)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "usr_99120491",
      "fullName": "Rahul Sharma",
      "mobileNumber": "9876543210",
      "countryCode": "+91",
      "email": "rahul.sharma@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 2592000
  }
}
```
> **Mobile Action**: Persist `accessToken` securely in `flutter_secure_storage` / iOS Keychain / Android Keystore. Transition to Home Screen.

#### Step 3: Resend OTP (If timer expires)
* **Method**: `POST`
* **Endpoint**: `/auth/resend-otp`
* **Request Body**:
```json
{
  "challengeId": "68f4e12c-4971-4648-9c59-d890fa38bb39"
}
```

#### Step 4: Register New User (If not registered)
* **Method**: `POST`
* **Endpoint**: `/auth/register`
* **Request Body**:
```json
{
  "fullName": "Rahul Sharma",
  "countryCode": "+91",
  "mobileNumber": "9876543210",
  "email": "rahul.sharma@example.com",
  "acceptedTerms": true
}
```

---

### SCREEN 2: Home Screen & Location Detection

#### 1. Real-time Location Detection (Location Bar)
Call on app launch to populate the top Location dropdown:
* **Option A (With GPS Coordinates)**:
  * `GET /location/detect?lat=12.9352&lng=77.6946`
* **Option B (Auto IP-based fallback)**:
  * `GET /location/current`
* **Response**:
```json
{
  "status": "success",
  "data": {
    "location": {
      "city": "Bengaluru",
      "area": "Bellandur, Outer Ring Road",
      "pincode": "560103",
      "state": "Karnataka",
      "serviceable": true,
      "latitude": 12.9352,
      "longitude": 77.6946
    }
  }
}
```

#### 2. Master Home Screen Feed
Fetches everything needed for the home view in a single high-performance payload:
* **Method**: `GET`
* **Endpoint**: `/home/all`
* **Response**:
```json
{
  "status": "success",
  "data": {
    "hero": {
      "headline": "Instant Delivery, Right on Time",
      "highlightWord": "delivered",
      "subtitle": "Courier, luggage, confidential records & forgotten items across the city.",
      "sideImageUrl": "/api/v1/home/hero/image"
    },
    "quickActions": [
      { "id": "qa-1", "title": "Ship Now", "subtitle": "Book personal courier", "route": "/courier-delivery", "badge": "Fast" },
      { "id": "qa-2", "title": "Track Shipment", "subtitle": "Live GPS tracking", "route": "/tracking" },
      { "id": "qa-3", "title": "Find Pincode", "subtitle": "Check coverage", "route": "/pincode" },
      { "id": "qa-4", "title": "Help & Support", "subtitle": "24/7 Helpline", "route": "/support" }
    ],
    "banner": {
      "badge": "DELIVEZ PRIORITY",
      "title": "Need something forgotten retrieved instantly?",
      "buttonText": "Retrieve Now"
    }
  }
}
```

#### 3. Services Catalog (Home Grid)
* **Method**: `GET`
* **Endpoint**: `/services`
* **Response**: Returns the core services:
  1. Personal Courier Delivery (`courier-delivery`)
  2. Luggage Delivery (`luggage-delivery`)
  3. Confidential Delivery (`confidential-delivery`)
  4. Forgot Something? (`forgot-something`)
  5. Return Pickup (`return-pickup`)
  6. Know More (`know-more`)

---

### SCREEN 3: Address Book & Saved Addresses

#### 1. Fetch Saved Addresses
* **Method**: `GET`
* **Endpoint**: `/addresses`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Response**:
```json
{
  "status": "success",
  "data": {
    "addresses": [
      {
        "id": "addr-1",
        "label": "Home",
        "contactName": "Rahul Sharma",
        "phoneNumber": "+919876543210",
        "addressLine1": "Flat 302, Green Glen Layout",
        "addressLine2": "Bellandur",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560103",
        "isDefault": true,
        "latitude": 12.9279,
        "longitude": 77.6771
      }
    ]
  }
}
```

#### 2. Save New Address
* **Method**: `POST`
* **Endpoint**: `/addresses`
* **Body**:
```json
{
  "label": "Office",
  "contactName": "Rahul Sharma",
  "phoneNumber": "+919876543210",
  "addressLine1": "Tower 4, Prestige Tech Park",
  "addressLine2": "Outer Ring Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "postalCode": "560103",
  "isDefault": false,
  "latitude": 12.9352,
  "longitude": 77.6946
}
```

---

### SERVICE FLOW 1: Personal Courier Delivery

```
[Address Selection] -> [Package & Speed Config] -> [Quote Calculation] -> [Order Placement] -> [Payment] -> [Live Tracking]
```

#### Step 1: Fetch Service Options & Delivery Catalog
* **Method**: `GET`
* **Endpoint**: `/courier/options` (or `/courier-delivery/options`)
* **UI Action**: Populates package categories, weight-tiered box options, parcel dimensions, local & intercity delivery speeds, self-service drop options, and insurance options.
* **Dart Model**: `CourierDeliveryConfig` from `mobile-sdk/courier_models.dart`
* **Response**:
```json
{
  "status": "success",
  "data": {
    "package_categories": [
      {
        "id": "DOCUMENTS",
        "apiCode": "DOCUMENTS",
        "title": "Documents",
        "subtitle": "Papers, files, certificates, books, etc.",
        "icon": "description_outlined",
        "bgColor": "#FFF9E6",
        "iconColor": "#D97706"
      },
      {
        "id": "ELECTRONICS",
        "apiCode": "ELECTRONICS",
        "title": "Electronics",
        "subtitle": "Mobile, laptop, gadgets, accessories, etc.",
        "icon": "smartphone_outlined",
        "bgColor": "#FFF1F2",
        "iconColor": "#E11D48"
      },
      {
        "id": "CLOTHING_APPAREL",
        "apiCode": "CLOTHING_APPAREL",
        "title": "Clothing & Apparel",
        "subtitle": "Clothes, shoes, cap, fashion items, etc.",
        "icon": "checkroom_outlined",
        "bgColor": "#EEF2FF",
        "iconColor": "#4F46E5"
      },
      {
        "id": "GIFTS_TOYS",
        "apiCode": "GIFTS_TOYS",
        "title": "Gifts & Toys",
        "subtitle": "Gift items, toys, decorative items, etc.",
        "icon": "card_giftcard_outlined",
        "bgColor": "#FFFDF0",
        "iconColor": "#D97706"
      },
      {
        "id": "HEALTH_MEDICINE",
        "apiCode": "HEALTH_MEDICINE",
        "title": "Health & Medicine",
        "subtitle": "Medicines, supplements, medical supplies, etc.",
        "icon": "medication_outlined",
        "bgColor": "#ECFDF5",
        "iconColor": "#059669"
      },
      {
        "id": "HOUSEHOLD_ITEMS",
        "apiCode": "HOUSEHOLD_ITEMS",
        "title": "Household Items",
        "subtitle": "Kitchenware, home decor, daily use items, etc.",
        "icon": "soup_kitchen_outlined",
        "bgColor": "#FFF7ED",
        "iconColor": "#EA580C"
      },
      {
        "id": "COMMERCIAL_GOODS",
        "apiCode": "COMMERCIAL_GOODS",
        "title": "Commercial Goods",
        "subtitle": "Samples, parts, raw materials, products, etc.",
        "icon": "inventory_2_outlined",
        "bgColor": "#F0F9FF",
        "iconColor": "#0284C7"
      },
      {
        "id": "OTHER",
        "apiCode": "OTHER",
        "title": "Others",
        "subtitle": "Other items not listed above.",
        "icon": "more_horiz_outlined",
        "bgColor": "#F9FAFB",
        "iconColor": "#4B5563"
      }
    ],
    "box_types": {
      "10 Kg": [
        {
          "id": "box_10kg_small",
          "title": "Small Box",
          "dimensions": "30 × 20 × 20 cm",
          "lengthCm": 30,
          "widthCm": 20,
          "heightCm": 20,
          "tag": "Best for Documents, Books, Electronics",
          "capacity": "Up to 10 Kg"
        },
        {
          "id": "box_10kg_medium",
          "title": "Medium Box",
          "dimensions": "30 × 30 × 25 cm",
          "lengthCm": 30,
          "widthCm": 30,
          "heightCm": 25,
          "tag": "Best for Clothing, Accessories, Home Items",
          "capacity": "Up to 10 Kg"
        },
        {
          "id": "box_10kg_large",
          "title": "Large Box",
          "dimensions": "40 × 30 × 30 cm",
          "lengthCm": 40,
          "widthCm": 30,
          "heightCm": 30,
          "tag": "Best for Shoes, Helmets, Small Appliances",
          "capacity": "Up to 10 Kg"
        }
      ],
      "15 Kg": [
        {
          "id": "box_15kg_medium",
          "title": "Medium Box",
          "dimensions": "35 × 28 × 32 cm",
          "lengthCm": 35,
          "widthCm": 28,
          "heightCm": 32,
          "tag": "Best for Clothes, Books, Home Items",
          "capacity": "Up to 15 Kg"
        },
        {
          "id": "box_15kg_large",
          "title": "Large Box",
          "dimensions": "40 × 30 × 35 cm",
          "lengthCm": 40,
          "widthCm": 30,
          "heightCm": 35,
          "tag": "Best for Appliances, Toys, Accessories",
          "capacity": "Up to 15 Kg"
        },
        {
          "id": "box_15kg_xlarge",
          "title": "Extra Large Box",
          "dimensions": "45 × 32 × 40 cm",
          "lengthCm": 45,
          "widthCm": 32,
          "heightCm": 40,
          "tag": "Best for Kitchen Items, Medium Appliances",
          "capacity": "Up to 15 Kg"
        }
      ],
      "25 Kg": [
        {
          "id": "box_25kg_medium",
          "title": "Medium Box",
          "dimensions": "45 × 35 × 40 cm",
          "lengthCm": 45,
          "widthCm": 35,
          "heightCm": 40,
          "tag": "Best for Clothing, Shoes, Books, Home Items",
          "capacity": "Up to 25 Kg"
        },
        {
          "id": "box_25kg_large",
          "title": "Large Box",
          "dimensions": "50 × 40 × 45 cm",
          "lengthCm": 50,
          "widthCm": 40,
          "heightCm": 45,
          "tag": "Best for Appliances, Toys, Accessories, Helmet",
          "capacity": "Up to 25 Kg"
        },
        {
          "id": "box_25kg_xlarge",
          "title": "Extra Large Box",
          "dimensions": "60 × 45 × 50 cm",
          "lengthCm": 60,
          "widthCm": 45,
          "heightCm": 50,
          "tag": "Best for Large Appliances, Bulk Items, Luggage",
          "capacity": "Up to 25 Kg"
        }
      ]
    },
    "parcel_types": [
      { "id": "SMALL", "title": "Small", "weight": "Up to 2 kg", "dimensions": "30 × 20 × 10", "isCustom": false },
      { "id": "MEDIUM", "title": "Medium", "weight": "2 - 10 kg", "dimensions": "45 × 35 × 30", "isCustom": false },
      { "id": "LARGE", "title": "Large", "weight": "10 - 25 kg", "dimensions": "60 × 45 × 45", "isCustom": false },
      { "id": "CUSTOM", "title": "Custom", "weight": "Enter size", "dimensions": "Define", "isCustom": true }
    ],
    "parcel_dimensions": {
      "Small": { "length": 30, "width": 20, "height": 10 },
      "Medium": { "length": 45, "width": 35, "height": 30 },
      "Large": { "length": 60, "width": 45, "height": 45 }
    },
    "local_options": [
      {
        "id": "BIKE_PRIORITY",
        "title": "Bike Priority Delivery",
        "badge": "FASTEST",
        "badgeColor": "#EF4444",
        "badgeTextColor": "#FFFFFF",
        "description": "Lightning fast delivery by bike for urgent and time-sensitive shipments.",
        "tags": [
          { "icon": "bolt", "label": "Fastest" },
          { "icon": "location_on_outlined", "label": "Real-time Tracking" },
          { "icon": "verified_user_outlined", "label": "High Priority" }
        ],
        "deliveryTime": "Delivery in 1 – 3 hours",
        "price": "₹120",
        "basePrice": 120.0,
        "icon": "two_wheeler"
      },
      {
        "id": "SAME_DAY",
        "title": "Same Day Delivery",
        "badge": "TODAY",
        "badgeColor": "#FEE2E2",
        "badgeTextColor": "#EF4444",
        "description": "Delivered on the same day within city limits.",
        "tags": [
          { "icon": "calendar_today_outlined", "label": "Same Day" },
          { "icon": "verified_user_outlined", "label": "Reliable" },
          { "icon": "home_outlined", "label": "Doorstep Delivery" }
        ],
        "deliveryTime": "Delivery by 8 PM today",
        "price": "₹150",
        "basePrice": 150.0,
        "icon": "local_shipping_outlined"
      },
      {
        "id": "HYBRID_DRONE",
        "title": "Hybrid Drone Delivery",
        "badge": null,
        "description": "Next-gen delivery using drone & road hybrid network.",
        "tags": [
          { "icon": "eco_outlined", "label": "Eco-friendly" },
          { "icon": "rocket_launch_outlined", "label": "Innovative" },
          { "icon": "verified_user_outlined", "label": "Secure" }
        ],
        "deliveryTime": "Delivery in 30 – 90 mins (if eligible)",
        "price": "₹200",
        "basePrice": 200.0,
        "icon": "flight_takeoff"
      },
      {
        "id": "NEXT_DAY_LOCAL",
        "title": "Next Day Delivery",
        "badge": null,
        "description": "Cost-effective delivery for non-urgent shipments.",
        "tags": [
          { "icon": "calendar_today_outlined", "label": "Next Day" },
          { "icon": "savings_outlined", "label": "Affordable" },
          { "icon": "verified_user_outlined", "label": "Reliable" }
        ],
        "deliveryTime": "Delivery by end of next day",
        "price": "₹100",
        "basePrice": 100.0,
        "icon": "local_shipping_sharp"
      }
    ],
    "intercity_options": [
      {
        "id": "STANDARD_DELIVERY",
        "title": "Standard Delivery",
        "badge": "MOST POPULAR",
        "badgeColor": "#EF4444",
        "badgeTextColor": "#FFFFFF",
        "description": "Reliable delivery within 2 – 3 business days for non-urgent shipments.",
        "tags": [
          { "icon": "verified_user_outlined", "label": "Reliable" },
          { "icon": "savings_outlined", "label": "Affordable" },
          { "icon": "home_outlined", "label": "Doorstep Delivery" }
        ],
        "deliveryTime": "Delivery in 2 – 3 business days",
        "price": "₹100",
        "basePrice": 100.0,
        "icon": "local_shipping"
      },
      {
        "id": "EXPRESS_DELIVERY",
        "title": "Express Delivery",
        "badge": "FAST",
        "badgeColor": "#FEE2E2",
        "badgeTextColor": "#EF4444",
        "description": "Priority delivery within city or across major routes with faster transit.",
        "tags": [
          { "icon": "bolt", "label": "Fast Delivery" },
          { "icon": "verified_user_outlined", "label": "High Priority" },
          { "icon": "home_outlined", "label": "Doorstep Delivery" }
        ],
        "deliveryTime": "Delivery in 24 – 48 hours",
        "price": "₹180",
        "basePrice": 180.0,
        "icon": "flash_on"
      },
      {
        "id": "PRECISE_TIME",
        "title": "Precise Time Delivery",
        "badge": "ON TIME, EVERY TIME",
        "badgeColor": "#FEE2E2",
        "badgeTextColor": "#EF4444",
        "description": "Guaranteed delivery at your chosen exact time slot.",
        "tags": [
          { "icon": "access_time", "label": "Time Guarantee" },
          { "icon": "calendar_today_outlined", "label": "Time Slot Choice" },
          { "icon": "verified_user_outlined", "label": "Priority Handling" }
        ],
        "deliveryTime": "Delivery at your selected time",
        "price": "₹250",
        "basePrice": 250.0,
        "icon": "edit_calendar_outlined"
      },
      {
        "id": "SCHEDULE_DELIVERY",
        "title": "Schedule Delivery",
        "badge": null,
        "description": "Choose your preferred date and time for pickup and delivery.",
        "tags": [
          { "icon": "calendar_today_outlined", "label": "Pick a Date" },
          { "icon": "access_time", "label": "Pick a Time" },
          { "icon": "notifications_none", "label": "Advance Booking" }
        ],
        "deliveryTime": "Deliver on your selected date & time",
        "price": "₹130",
        "basePrice": 130.0,
        "icon": "calendar_month"
      },
      {
        "id": "NEXT_DAY_INTERCITY",
        "title": "Next Day Delivery",
        "badge": "NEXT BUSINESS DAY",
        "badgeColor": "#FEE2E2",
        "badgeTextColor": "#EF4444",
        "description": "Cost-effective delivery with guaranteed next business day transit.",
        "tags": [
          { "icon": "calendar_today_outlined", "label": "Next Business Day" },
          { "icon": "savings_outlined", "label": "Affordable" },
          { "icon": "verified_user_outlined", "label": "Reliable" }
        ],
        "deliveryTime": "Delivery by next business day",
        "price": "₹120",
        "basePrice": 120.0,
        "icon": "local_shipping_sharp"
      }
    ],
    "drop_options": [
      {
        "index": 0,
        "id": "SELF_PICKUP",
        "title": "Self Pickup",
        "badge": "Save Time",
        "price": "₹50",
        "basePrice": 50.0,
        "desc": "You drop the parcel at our nearest Delivez location.",
        "tags": ["Quick Drop", "Lower Cost"],
        "icon": "directions_run_outlined"
      },
      {
        "index": 1,
        "id": "SELF_DROP",
        "title": "Self Drop",
        "badge": "Save Time",
        "price": "₹40",
        "basePrice": 40.0,
        "desc": "You drop the parcel at our destination hub.",
        "tags": ["Flexible", "Lower Cost"],
        "icon": "storefront_outlined"
      }
    ],
    "insurance_options": [
      {
        "index": 0,
        "id": "INSURE_SHIPMENT",
        "title": "Insure Shipment",
        "subtitle": "Get full protection for your shipment.\nRecommended for valuable items.",
        "icon": "shield_outlined",
        "isRecommended": true,
        "ratePercent": 0.75
      },
      {
        "index": 1,
        "id": "BASIC_COVERAGE",
        "title": "Basic Coverage",
        "subtitle": "Limited coverage as per carrier terms.\nCoverage up to ₹10,000",
        "icon": "gpp_maybe_outlined",
        "coverageLimit": 10000,
        "isRecommended": false,
        "ratePercent": 0
      },
      {
        "index": 2,
        "id": "NO_INSURANCE",
        "title": "No Insurance",
        "subtitle": "I understand the risk of loss or damage\nand do not want insurance.",
        "icon": "gpp_bad_outlined",
        "coverageLimit": 0,
        "isRecommended": false,
        "ratePercent": 0
      }
    ]
  }
}
```

#### Step 2: Instant Fare Estimator
* **Method**: `POST`
* **Endpoint**: `/courier/quote`
* **Request Body**:
```json
{
  "pickup": {
    "addressLine1": "Tower 4, Prestige Tech Park",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560103",
    "latitude": 12.9352,
    "longitude": 77.6946
  },
  "dropoff": {
    "addressLine1": "Flat 302, Green Glen Layout",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560103",
    "latitude": 12.9279,
    "longitude": 77.6771
  },
  "packageType": "BOX",
  "weightKg": 2.5,
  "speed": "EXPRESS",
  "selectedProtection": "STANDARD"
}
```
* **Response**:
```json
{
  "status": "success",
  "data": {
    "quote": {
      "currency": "INR",
      "baseFare": 60,
      "distanceKm": 4.2,
      "distanceFee": 42,
      "weightFee": 20,
      "speedFee": 30,
      "protectionFee": 10,
      "taxAmount": 29.16,
      "totalAmount": 191.16,
      "estimatedDurationMins": 35
    }
  }
}
```

#### Step 3: Create Booking (Submit Order)
* **Method**: `POST`
* **Endpoint**: `/courier/bookings`
* **Headers**:
  * `Authorization: Bearer <accessToken>`
  * `Idempotency-Key: idemp-courier-<timestamp>`
* **Request Body**:
```json
{
  "pickup": {
    "contactName": "Rahul Sharma",
    "phoneNumber": "+919876543210",
    "addressLine1": "Tower 4, Prestige Tech Park",
    "addressLine2": "A Block, 2nd Floor",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560103",
    "latitude": 12.9352,
    "longitude": 77.6946
  },
  "dropoff": {
    "contactName": "Priya Verma",
    "phoneNumber": "+919876543211",
    "addressLine1": "Flat 302, Green Glen Layout",
    "addressLine2": "Bellandur",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560103",
    "latitude": 12.9279,
    "longitude": 77.6771
  },
  "packageType": "BOX",
  "weightKg": 2.5,
  "speed": "EXPRESS",
  "instructions": "Call before arrival",
  "paymentMethod": "UPI"
}
```
* **Response**: Returns `booking.id` (e.g. `cbk_12903912`) and `trackingNumber`. Store in state and proceed to Payment or Tracking.

#### Step 4: Complete Sandbox / Razorpay Payment
* **Method**: `POST`
* **Endpoint**: `/courier/bookings/:id/payments/sandbox`
* **Request Body**:
```json
{
  "paymentMethod": "UPI",
  "status": "COMPLETED",
  "transactionId": "TXN_UPI_994102"
}
```

#### Step 5: Live Order Tracking
* **Method**: `GET`
* **Endpoint**: `/courier/bookings/:id/track`
* **Response**:
```json
{
  "status": "success",
  "data": {
    "tracking": {
      "bookingId": "cbk_12903912",
      "status": "IN_TRANSIT",
      "currentMilestone": "Package out for delivery",
      "partner": {
        "name": "Suresh Kumar",
        "phone": "+919876543999",
        "vehicle": "Hero Splendor (KA 01 AB 1234)",
        "rating": 4.9
      },
      "timeline": [
        { "status": "CREATED", "timestamp": "2026-09-09T10:00:00Z", "completed": true },
        { "status": "PARTNER_ASSIGNED", "timestamp": "2026-09-09T10:05:00Z", "completed": true },
        { "status": "PICKED_UP", "timestamp": "2026-09-09T10:20:00Z", "completed": true },
        { "status": "IN_TRANSIT", "timestamp": "2026-09-09T10:25:00Z", "completed": true },
        { "status": "DELIVERED", "timestamp": null, "completed": false }
      ]
    }
  }
}
```

#### Step 6: Proof of Delivery (POD)
* **Method**: `GET`
* **Endpoint**: `/courier/bookings/:id/pod`
* **Response**: Returns signature image URL, recipient confirmation name, and delivery timestamp.

---

### SERVICE FLOW 2: Luggage Delivery (Airport & Hotel)

Specialized for airport arrival luggage belt collection, terminal handoff, and hotel front desk luggage delivery.

#### Step 1: Fetch Luggage Options
* **Method**: `GET`
* **Endpoint**: `/luggage-delivery/options`
* **UI Action**: Renders bag counters (Check-in Bags, Cabin Bags), Airport Terminal lists, Luggage Belt collection option.

#### Step 2: Calculate Luggage Quote
* **Method**: `POST`
* **Endpoint**: `/luggage-delivery/quote`
* **Request Body**:
```json
{
  "pickup": {
    "addressLine1": "Terminal 2, Kempegowda International Airport",
    "addressLine2": "Luggage Belt 04",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560300",
    "latitude": 13.1986,
    "longitude": 77.7066
  },
  "dropoff": {
    "addressLine1": "The Leela Palace, Old Airport Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560008",
    "latitude": 12.9606,
    "longitude": 77.6484
  },
  "pickupOption": "luggage_belt",
  "luggageBelt": "04",
  "terminal": "T2",
  "flightNumber": "6E-2041",
  "luggageList": [
    { "id": "bag-1", "type": "Check-in Bag", "size": "Large", "weight": 23 },
    { "id": "bag-2", "type": "Cabin Trolley", "size": "Medium", "weight": 10 }
  ],
  "hotelFrontDeskDrop": true
}
```

#### Step 3: Create Luggage Booking
* **Method**: `POST`
* **Endpoint**: `/luggage-delivery/bookings`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Request Body**:
```json
{
  "pickup": {
    "contactName": "Vikram Malhotra",
    "phoneNumber": "+919876543212",
    "addressLine1": "Terminal 2, Kempegowda International Airport",
    "addressLine2": "Belt 04, International Arrival",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560300"
  },
  "dropoff": {
    "contactName": "Vikram Malhotra (Front Desk)",
    "phoneNumber": "+919876543212",
    "addressLine1": "The Leela Palace, 23 Old Airport Road",
    "addressLine2": "Leave with Reception under guest Vikram Malhotra",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560008"
  },
  "pickupOption": "luggage_belt",
  "flightNumber": "6E-2041",
  "terminal": "T2",
  "luggageBelt": "04",
  "luggageList": [
    { "type": "Check-in Bag", "size": "Large", "weight": 23, "tagNumber": "BLR-6E-9941" }
  ],
  "hotelFrontDeskDrop": true,
  "paymentMethod": "UPI"
}
```

---

### SERVICE FLOW 3: Confidential Delivery (Vault)

Ultra-secure transit for legal deeds, passports, financial instruments, and confidential documents with tamper-proof security seals and OTP handoff.

#### Step 1: Vault Options & Security Tiers
* **Method**: `GET`
* **Endpoint**: `/confidential-delivery/options`
* **UI Action**: Populates Security Tiers (`STANDARD_SECURITY`, `ENHANCED_SECURITY`, `MAXIMUM_SECURITY`), Tamper-Proof Pouches, and Verification Modes (`OTP`, `ID_PROOF`).

#### Step 2: Calculate Vault Quote
* **Method**: `POST`
* **Endpoint**: `/confidential-delivery/quote`
* **Request Body**:
```json
{
  "pickup": {
    "addressLine1": "High Court Complex, Chamber 14",
    "city": "Bengaluru",
    "postalCode": "560001"
  },
  "dropoff": {
    "addressLine1": "KPMG Office, Embassy GolfLinks",
    "city": "Bengaluru",
    "postalCode": "560071"
  },
  "securityLevel": "MAXIMUM_SECURITY",
  "packagingType": "TAMPER_PROOF_POUCH",
  "verificationMethod": "OTP",
  "addonProtections": ["SEAL_SECURITY_TAPE", "EXTRA_BUBBLE_WRAP"]
}
```

#### Step 3: Create Vault Booking
* **Method**: `POST`
* **Endpoint**: `/confidential-delivery/bookings`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Request Body**:
```json
{
  "pickup": {
    "contactName": "Advocate Ramesh Sen",
    "phoneNumber": "+919876543220",
    "addressLine1": "High Court Complex, Chamber 14",
    "city": "Bengaluru",
    "postalCode": "560001"
  },
  "dropoff": {
    "contactName": "Director Anita Roy",
    "phoneNumber": "+919876543221",
    "addressLine1": "Embassy GolfLinks Business Park, 3rd Floor",
    "city": "Bengaluru",
    "postalCode": "560071"
  },
  "securityLevel": "MAXIMUM_SECURITY",
  "packagingType": "TAMPER_PROOF_POUCH",
  "verificationMethod": "OTP",
  "itemDescription": "Original Deed Agreement & Legal Records",
  "handlingInstructions": "Strict handoff only to Anita Roy after OTP verification",
  "paymentMethod": "ONLINE"
}
```
* **Response**: Returns `vaultId` (e.g. `VLT-99412-BLR`).

#### Step 4: Public / Secured Vault Tracking
* **Method**: `GET`
* **Endpoint**: `/confidential-delivery/track/:vaultId`
* **UI Action**: Displays Tamper Seal Status (`SEAL_INTACT`), Custody Checkpoints, and Courier Verification status.

#### Step 5: Recipient Delivery OTP Verification
* **Method**: `POST`
* **Endpoint**: `/confidential-delivery/track/:id/verify-otp`
* **Request Body**:
```json
{
  "otp": "482910"
}
```

---

### SERVICE FLOW 4: Forgot Something (Item Retrieval)

Dedicated express runner service to retrieve forgotten keys, chargers, laptops, wallets, or documents from an office, hotel, café, or home.

#### Step 1: Retrieval Options
* **Method**: `GET`
* **Endpoint**: `/forgot-something/options`
* **UI Action**: Renders categories: `KEYS`, `LAPTOP`, `PHONE`, `DOCUMENTS`, `WALLET`, `BAG`, `CHARGER`, `GLASSES`.

#### Step 2: Instant Retrieval Quote
* **Method**: `POST`
* **Endpoint**: `/forgot-something/quote`
* **Request Body**:
```json
{
  "pickup": {
    "addressLine1": "WeWork Galaxy, 43 Residency Road",
    "city": "Bengaluru",
    "postalCode": "560025"
  },
  "dropoff": {
    "addressLine1": "Indiranagar 100ft Road, 12th Main",
    "city": "Bengaluru",
    "postalCode": "560038"
  },
  "itemCategory": "LAPTOP",
  "speed": "INSTANT",
  "tamperProofPackaging": true
}
```

#### Step 3: Book Item Retrieval
* **Method**: `POST`
* **Endpoint**: `/forgot-something/bookings`
* **Headers**: `Authorization: Bearer <accessToken>`
* **Request Body**:
```json
{
  "pickup": {
    "contactName": "Sunil (Reception)",
    "phoneNumber": "+919876543230",
    "addressLine1": "WeWork Galaxy, 43 Residency Road",
    "addressLine2": "Front Desk 4th Floor",
    "city": "Bengaluru",
    "postalCode": "560025"
  },
  "dropoff": {
    "contactName": "Aakash Mehta",
    "phoneNumber": "+919876543231",
    "addressLine1": "Villa 12, Indiranagar Defense Colony",
    "city": "Bengaluru",
    "postalCode": "560038"
  },
  "itemCategory": "LAPTOP",
  "itemName": "MacBook Pro 16-inch Silver in Black Sleeve",
  "itemDescription": "Left on desk 402 near cafeteria, with charging brick",
  "locationType": "OFFICE",
  "handoverPerson": "Sunil (Reception)",
  "handoverPhone": "+919876543230",
  "speed": "INSTANT",
  "tamperProofPackaging": true,
  "pickupOtpRequired": true,
  "deliveryOtpRequired": true,
  "paymentMethod": "UPI"
}
```

#### Step 4: Live Item Tracking
* **Method**: `GET`
* **Endpoint**: `/forgot-something/track/:id`
* **UI Action**: Displays runner location, item pickup status, and ETA.

#### Step 5: Verify Pickup / Delivery OTP
* **Method**: `POST`
* **Endpoint**: `/forgot-something/track/:id/verify-otp`
* **Request Body**:
```json
{
  "type": "DELIVERY",
  "otp": "456789"
}
```

---

### SCREEN 4: Universal Tracking & Order History

#### 1. Universal Tracking Bar (Single Search Input)
Takes any tracking ID, booking number, or vault code and resolves it across all 4 services:
* **Method**: `GET`
* **Endpoint**: `/track/:trackingId`
* **Response**:
```json
{
  "status": "success",
  "data": {
    "tracking": {
      "serviceType": "COURIER",
      "trackingNumber": "DLV-99401-BLR",
      "status": "IN_TRANSIT",
      "origin": "Prestige Tech Park, Bengaluru",
      "destination": "Bellandur, Bengaluru",
      "eta": "25 mins",
      "timeline": [ ... ]
    }
  }
}
```

#### 2. User Bookings History (Tabs)
* **Courier Bookings**: `GET /courier/bookings?page=1&limit=20`
* **Luggage Bookings**: `GET /luggage-delivery/bookings?page=1&limit=20`
* **Vault Bookings**: `GET /confidential-delivery/bookings`
* **Forgot Something Bookings**: `GET /forgot-something/bookings?page=1&limit=20`

---

### SCREEN 5: Customer Support & Helpline

#### 1. Fetch Support Info & Helplines
* **Method**: `GET`
* **Endpoint**: `/support/config`
* **Response**:
```json
{
  "status": "success",
  "data": {
    "helplineNumber": "1800-123-4567",
    "whatsappNumber": "+91 98765 43210",
    "supportEmail": "support@delivez.com",
    "operatingHours": "24/7 All 365 Days",
    "faqs": [
      {
        "question": "How do I track my delivery in real-time?",
        "answer": "Open the Track tab and enter your booking ID or tracking number for live GPS coordinates."
      }
    ]
  }
}
```

#### 2. Submit Support Ticket / Contact Us Form
* **Method**: `POST`
* **Endpoint**: `/support/inquiry`
* **Request Body**:
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "subject": "Delay inquiry for booking cbk_12903912",
  "message": "Runner is waiting at the wrong gate, please direct him to Gate 2."
}
```

---

## 🛠️ Error Codes Reference for Mobile Handling

| HTTP Status | Error Code | Meaning / User Alert | Mobile UI Recommended Handling |
|---|---|---|---|
| `401` | `UNAUTHORIZED` | Bearer token expired or missing | Clear local storage, show toast, redirect to Login screen |
| `403` | `FORBIDDEN` | Insufficient permissions | Display access denied dialog |
| `400` | `INVALID_INPUT` | Validation failed on fields | Highlight erroneous input field with red helper text |
| `404` | `NOT_FOUND` | Booking / tracking ID does not exist | Show empty state illustration with "Invalid Tracking ID" |
| `429` | `TOO_MANY_REQUESTS` | Rate limit exceeded | Display "Please wait 30 seconds before retrying" |
| `500` | `INTERNAL_ERROR` | Server error | Show retry button |
