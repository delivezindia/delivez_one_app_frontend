const fs = require('fs');
const path = require('path');

const schemaPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Update User model to include vault relations
if (!schema.includes('vaultCourierBookings')) {
  schema = schema.replace(
    'luggageDeliveryBookings     LuggageDeliveryBooking[]',
    'luggageDeliveryBookings     LuggageDeliveryBooking[]\n  vaultCourierBookings        VaultCourierBooking[]\n  courierBookingPayments      CourierBookingPayment[]\n  courierBookingReceipts      CourierBookingReceipt[]'
  );
}

// 2. Update Service model to include vault relations
if (!schema.includes('vaultCourierBookings        VaultCourierBooking[]')) {
  schema = schema.replace(
    'giftDeliveryBookings        GiftDeliveryBooking[]',
    'giftDeliveryBookings        GiftDeliveryBooking[]\n  vaultCourierBookings        VaultCourierBooking[]'
  );
}

// 3. Append the new models if not present
if (!schema.includes('model VaultCourierBooking')) {
  const models = `

model VaultCourierBooking {
  id                  String   @id @default(uuid())
  bookingNumber       String   @unique @map("booking_number")
  userId              String   @map("user_id")
  serviceId           String?  @map("service_id")
  serviceType         String   @map("service_type")
  status              String   @default("pending_payment")
  paymentStatus       String   @default("pending") @map("payment_status")
  receiptStatus       String   @default("pending") @map("receipt_status")
  currency            String   @default("INR")
  basePrice           Decimal  @default(0) @map("base_price") @db.Decimal(12, 2)
  additionalCharges   Decimal  @default(0) @map("additional_charges") @db.Decimal(12, 2)
  totalAmount         Decimal  @default(0) @map("total_amount") @db.Decimal(12, 2)
  agreeTerms          Boolean  @default(true) @map("agree_terms")
  idempotencyKey      String?  @map("idempotency_key")
  requestFingerprint  String?  @map("request_fingerprint")
  rawPayload          Json?    @map("raw_payload")
  confirmedAt         DateTime? @map("confirmed_at")
  cancelledAt         DateTime? @map("cancelled_at")
  cancellationReason  String?  @map("cancellation_reason")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  user                User     @relation(fields: [userId], references: [id], onDelete: Restrict)
  service             Service? @relation(fields: [serviceId], references: [id], onDelete: SetNull)

  pickup              CourierBookingPickup?
  delivery            CourierBookingDelivery?
  contacts            CourierBookingContact[]
  timings             CourierBookingTiming[]
  item                CourierBookingItem?
  attachments         CourierBookingAttachment[]
  packaging           CourierBookingPackaging?
  security            CourierBookingSecurity?
  verification        CourierBookingVerification?
  serviceDetails      CourierBookingServiceDetails?
  multipointStops     CourierBookingMultipointStop[]
  payments            CourierBookingPayment[]
  receipts            CourierBookingReceipt[]

  @@unique([userId, idempotencyKey])
  @@index([userId, createdAt])
  @@index([status, createdAt])
  @@index([serviceType])
  @@index([bookingNumber])
  @@map("courier_vault_bookings")
}

model CourierBookingPickup {
  id                     String              @id @default(uuid())
  bookingId              String              @unique @map("booking_id")
  pickupType             String              @default("Business") @map("pickup_type")
  contactName            String              @map("contact_name")
  mobileNumber           String              @map("mobile_number")
  companyOrganization    String?             @map("company_organization")
  gstin                  String?             @map("gstin")
  completePickupAddress  String              @map("complete_pickup_address")
  city                   String              @map("city")
  state                  String              @map("state")
  pinCode                String              @map("pin_code")
  useMyLocation          Boolean             @default(false) @map("use_my_location")
  securityCheck          Boolean             @default(false) @map("security_check")
  visitorPass            Boolean             @default(false) @map("visitor_pass")
  liftAccess             Boolean             @default(false) @map("lift_access")
  idProof                Boolean             @default(false) @map("id_proof")
  parking                Boolean             @default(false) @map("parking")
  specialInstructions    String?             @map("special_instructions")
  createdAt              DateTime            @default(now()) @map("created_at")
  updatedAt              DateTime            @updatedAt @map("updated_at")

  booking                VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("courier_booking_pickups")
}

model CourierBookingDelivery {
  id                      String              @id @default(uuid())
  bookingId               String              @unique @map("booking_id")
  deliveryType            String              @default("Business") @map("delivery_type")
  contactName             String              @map("contact_name")
  mobileNumber            String              @map("mobile_number")
  companyOrganization     String?             @map("company_organization")
  gstin                   String?             @map("gstin")
  completeDeliveryAddress String              @map("complete_delivery_address")
  city                    String              @map("city")
  state                   String              @map("state")
  pinCode                 String              @map("pin_code")
  useMyLocation           Boolean             @default(false) @map("use_my_location")
  securityCheck           Boolean             @default(false) @map("security_check")
  visitorPass             Boolean             @default(false) @map("visitor_pass")
  liftAccess              Boolean             @default(false) @map("lift_access")
  idProof                 Boolean             @default(false) @map("id_proof")
  parking                 Boolean             @default(false) @map("parking")
  specialInstructions     String?             @map("special_instructions")
  createdAt               DateTime            @default(now()) @map("created_at")
  updatedAt               DateTime            @updatedAt @map("updated_at")

  booking                 VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("courier_booking_deliveries")
}

model CourierBookingContact {
  id              String              @id @default(uuid())
  bookingId       String              @map("booking_id")
  contactRole     String              @map("contact_role")
  contactPerson   String              @map("contact_person")
  designation     String?             @map("designation")
  alternateMobile String?             @map("alternate_mobile")
  email           String?             @map("email")
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  booking         VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId, contactRole])
  @@map("courier_booking_contacts")
}

model CourierBookingTiming {
  id                String              @id @default(uuid())
  bookingId         String              @map("booking_id")
  timingRole        String              @map("timing_role")
  scheduleDate      String?             @map("schedule_date")
  timeWindow        String?             @map("time_window")
  preferredTime     String?             @map("preferred_time")
  customerAvailable String?             @map("customer_available")
  createdAt         DateTime            @default(now()) @map("created_at")
  updatedAt         DateTime            @updatedAt @map("updated_at")

  booking           VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId, timingRole])
  @@map("courier_booking_timings")
}

model CourierBookingItem {
  id                       String              @id @default(uuid())
  bookingId                String              @unique @map("booking_id")
  selectedTopItemType      String?             @map("selected_top_item_type")
  otherItemType            String?             @map("other_item_type")
  itemNameDescription      String              @map("item_name_description")
  itemCategory             String?             @map("item_category")
  itemType                 String              @default("Document") @map("item_type")
  numberOfPieces           Int                 @default(1) @map("number_of_pieces")
  weightActual             String?             @map("weight_actual")
  weightUnit               String              @default("kg") @map("weight_unit")
  length                   String?             @map("length")
  width                    String?             @map("width")
  height                   String?             @map("height")
  dimensionUnit            String              @default("cm") @map("dimension_unit")
  declaredValue            Decimal?            @map("declared_value") @db.Decimal(12, 2)
  contentType              String?             @map("content_type")
  itemContentsDescription  String?             @map("item_contents_description")
  fragile                  Boolean             @default(false) @map("fragile")
  handleWithCare           Boolean             @default(false) @map("handle_with_care")
  thisSideUp               Boolean             @default(false) @map("this_side_up")
  keepDry                  Boolean             @default(false) @map("keep_dry")
  doNotStack               Boolean             @default(false) @map("do_not_stack")
  highValue                Boolean             @default(false) @map("high_value")
  createdAt                DateTime            @default(now()) @map("created_at")
  updatedAt                DateTime            @updatedAt @map("updated_at")

  booking                  VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("courier_booking_items")
}

model CourierBookingAttachment {
  id           String              @id @default(uuid())
  bookingId    String              @map("booking_id")
  fileName     String              @map("file_name")
  filePath     String?             @map("file_path")
  fileUrl      String?             @map("file_url")
  mimeType     String?             @map("mime_type")
  fileSize     Int?                @map("file_size")
  documentType String?             @map("document_type")
  createdAt    DateTime            @default(now()) @map("created_at")
  updatedAt    DateTime            @updatedAt @map("updated_at")

  booking      VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId])
  @@map("courier_booking_attachments")
}

model CourierBookingPackaging {
  id                    String              @id @default(uuid())
  bookingId             String              @unique @map("booking_id")
  selectedPackage       String              @default("Standard Box") @map("selected_package")
  extraBubbleWrap       Boolean             @default(false) @map("extra_bubble_wrap")
  cornerGuard           Boolean             @default(false) @map("corner_guard")
  waterproofCover       Boolean             @default(false) @map("waterproof_cover")
  fragileSticker        Boolean             @default(false) @map("fragile_sticker")
  sealAndSecurityTape   Boolean             @default(false) @map("seal_and_security_tape")
  packagingInstructions String?             @map("packaging_instructions")
  packagingPreview      Json?               @map("packaging_preview")
  createdAt             DateTime            @default(now()) @map("created_at")
  updatedAt             DateTime            @updatedAt @map("updated_at")

  booking               VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("courier_booking_packaging")
}

model CourierBookingSecurity {
  id                             String              @id @default(uuid())
  bookingId                      String              @unique @map("booking_id")
  selectedSecurityLevel          String              @default("Standard Security") @map("selected_security_level")
  realTimeGpsTracking            Boolean             @default(true) @map("real_time_gps_tracking")
  deliveryAlertsAndNotifications Boolean             @default(true) @map("delivery_alerts_and_notifications")
  armedEscort                    Boolean             @default(false) @map("armed_escort")
  secureStorageAtHubs            Boolean             @default(true) @map("secure_storage_at_hubs")
  restrictedAccess               Boolean             @default(true) @map("restricted_access")
  additionalInstructions         String?             @map("additional_instructions")
  createdAt                      DateTime            @default(now()) @map("created_at")
  updatedAt                      DateTime            @updatedAt @map("updated_at")

  booking                        VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("courier_booking_security")
}

model CourierBookingVerification {
  id                       String              @id @default(uuid())
  bookingId                String              @unique @map("booking_id")
  selectedVerification     String              @default("OTP Verification") @map("selected_verification")
  capturePhotoOfRecipient  Boolean             @default(true) @map("capture_photo_of_recipient")
  capturePhotoOfIdProof    Boolean             @default(false) @map("capture_photo_of_id_proof")
  createdAt                DateTime            @default(now()) @map("created_at")
  updatedAt                DateTime            @updatedAt @map("updated_at")

  booking                  VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("courier_booking_verification")
}

model CourierBookingServiceDetails {
  id            String              @id @default(uuid())
  bookingId     String              @unique @map("booking_id")
  serviceType   String              @map("service_type")
  configuration Json                @map("configuration")
  createdAt     DateTime            @default(now()) @map("created_at")
  updatedAt     DateTime            @updatedAt @map("updated_at")

  booking       VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("courier_booking_service_details")
}

model CourierBookingMultipointStop {
  id            String              @id @default(uuid())
  bookingId     String              @map("booking_id")
  stopNumber    Int                 @map("stop_number")
  stopName      String              @map("stop_name")
  subtitle      String?             @map("subtitle")
  address       String              @map("address")
  contactPerson String              @map("contact_person")
  eta           String?             @map("eta")
  timeWindow    String?             @map("time_window")
  createdAt     DateTime            @default(now()) @map("created_at")
  updatedAt     DateTime            @updatedAt @map("updated_at")

  booking       VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId, stopNumber])
  @@map("courier_booking_multipoint_stops")
}

model CourierBookingPayment {
  id               String              @id @default(uuid())
  paymentId        String              @unique @map("payment_id")
  bookingId        String              @map("booking_id")
  userId           String              @map("user_id")
  gateway          String              @default("SANDBOX") @map("gateway")
  gatewayOrderId   String?             @map("gateway_order_id")
  gatewayPaymentId String?             @map("gateway_payment_id")
  gatewaySignature String?             @map("gateway_signature")
  amount           Decimal             @map("amount") @db.Decimal(12, 2)
  currency         String              @default("INR") @map("currency")
  status           String              @default("pending") @map("status")
  paymentMethod    String              @default("ONLINE") @map("payment_method")
  failureReason    String?             @map("failure_reason")
  paidAt           DateTime?           @map("paid_at")
  createdAt        DateTime            @default(now()) @map("created_at")
  updatedAt        DateTime            @updatedAt @map("updated_at")

  booking          VaultCourierBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  user             User                @relation(fields: [userId], references: [id], onDelete: Restrict)
  receipts         CourierBookingReceipt[]

  @@index([bookingId])
  @@index([userId])
  @@index([status])
  @@map("courier_booking_payments")
}

model CourierBookingReceipt {
  id            String                 @id @default(uuid())
  receiptId     String                 @unique @map("receipt_id")
  bookingId     String                 @map("booking_id")
  paymentId     String?                @map("payment_id")
  userId        String                 @map("user_id")
  serviceType   String                 @map("service_type")
  amount        Decimal                @map("amount") @db.Decimal(12, 2)
  currency      String                 @default("INR") @map("currency")
  paymentStatus String                 @default("paid") @map("payment_status")
  bookingStatus String                 @default("confirmed") @map("booking_status")
  issuedAt      DateTime               @default(now()) @map("issued_at")
  receiptData   Json?                  @map("receipt_data")
  createdAt     DateTime               @default(now()) @map("created_at")
  updatedAt     DateTime               @updatedAt @map("updated_at")

  booking       VaultCourierBooking    @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  payment       CourierBookingPayment? @relation(fields: [paymentId], references: [id], onDelete: SetNull)
  user          User                   @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@unique([bookingId, paymentId])
  @@index([bookingId])
  @@index([userId])
  @@map("courier_booking_receipts")
}
`;
  schema += models;
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully updated schema.prisma with all 13 normalized tables.');
