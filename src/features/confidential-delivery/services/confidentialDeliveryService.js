import { apiRequest, ApiError } from '@/services/api/apiClient.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'

export const DEFAULT_VAULT_OPTIONS = {
  serviceTypes: [
    {
      id: 'VAULT_SECURE',
      name: 'Vault Secure',
      description: 'Standard secure delivery with full verification and',
      expectedDelivery: '1-2 Days',
      badge: 'Recommended',
      icon: 'Shield',
      fee: 0,
    },
    {
      id: 'VAULT_PRIORITY',
      name: 'Vault Priority',
      description: 'Faster delivery with priority handling and',
      expectedDelivery: 'Same / Next Day',
      badge: 'Fastest',
      icon: 'Zap',
      fee: 40,
    },
    {
      id: 'VAULT_DIRECT',
      name: 'Vault Direct',
      description: 'Point-to-point delivery with no stops in between. Maxi...',
      expectedDelivery: '1-2 Days',
      icon: 'GitFork',
      fee: 50,
    },
    {
      id: 'VAULT_PRECISE',
      name: 'Vault Precise',
      description: 'Deliver at a specific date and time window of',
      expectedDelivery: 'Scheduled',
      icon: 'CalendarClock',
      fee: 30,
    },
    {
      id: 'VAULT_HAND_CARRY',
      name: 'Vault Hand Carry',
      description: 'Dedicated hand carry by authorized',
      expectedDelivery: '1-2 Days',
      icon: 'Briefcase',
      fee: 60,
    },
    {
      id: 'VAULT_RETURN',
      name: 'Vault Return',
      description: 'Deliver and collect signed or processed documents and ...',
      expectedDelivery: '1-3 Days',
      icon: 'ArrowLeftRight',
      fee: 45,
    },
    {
      id: 'VAULT_EXCHANGE',
      name: 'Vault Exchange',
      description: 'Two-way document or item exchange in',
      expectedDelivery: '1-3 Days',
      icon: 'Repeat',
      fee: 55,
    },
    {
      id: 'VAULT_CRITICAL',
      name: 'Vault Critical',
      description: 'Highest level of security with armed escort',
      expectedDelivery: 'Same Day',
      icon: 'ShieldAlert',
      fee: 90,
    },
    {
      id: 'VAULT_MULTIPOINT',
      name: 'Vault MultiPoint',
      description: 'Multiple secure stops in a single journey with',
      expectedDelivery: '1-3 Days',
      icon: 'Radar',
      fee: 70,
    },
  ],
  itemTypes: [
    { id: 'CONFIDENTIAL_DOCS', name: 'Confidential Documents', icon: 'FileText' },
    { id: 'LEGAL_DOCS', name: 'Legal Documents', icon: 'Scale' },
    { id: 'CONTRACTS', name: 'Contracts / Agreements', icon: 'Handshake' },
    { id: 'FINANCIAL_DOCS', name: 'Financial Documents', icon: 'Landmark' },
    { id: 'OFFICIAL_DOCS', name: 'Official Documents', icon: 'Building2' },
    { id: 'CERTIFICATES', name: 'Original Certificates', icon: 'Award' },
    { id: 'SEALED_ENVELOPE', name: 'Sealed Envelope', icon: 'Mail' },
    { id: 'SENSITIVE_RECORDS', name: 'Sensitive Records', icon: 'FolderLock' },
    { id: 'SECURE_PACKAGE', name: 'Secure Package', icon: 'Package' },
    { id: 'OTHER', name: 'Other / Not Listed', subtitle: 'Describe your shipment', icon: 'MoreHorizontal' },
  ],
  itemCategories: [
    'Legal Documents',
    'Financial Records',
    'Government & Official',
    'Corporate & Contracts',
    'Certificates & Diplomas',
    'Confidential Devices / Hardware',
    'Medical & Health Records',
    'Other Sensitive Materials',
  ],
  contentTypes: [
    'Original Printed Papers',
    'Signed Agreements / Deeds',
    'Bank Cheques / Drafts / Bonds',
    'Digital Storage / Tokens',
    'Identification Cards / Passports',
    'Physical Valuables / Sealed Items',
  ],
  itemHandlingOptions: [
    { id: 'FRAGILE', label: 'Fragile', icon: 'Wine' },
    { id: 'HANDLE_WITH_CARE', label: 'Handle with Care', icon: 'Hand' },
    { id: 'THIS_SIDE_UP', label: 'This Side Up', icon: 'ArrowUp' },
    { id: 'KEEP_DRY', label: 'Keep Dry', icon: 'Umbrella' },
    { id: 'DO_NOT_STACK', label: 'Do Not Stack', icon: 'Boxes' },
  ],
  packagingOptions: [
    {
      id: 'STANDARD_BOX',
      name: 'Standard Box',
      badge: 'Most Used',
      description: 'Sturdy corrugated box suitable for general shipments.',
      protectionLevel: 'Good',
      suitableFor: 'General Items',
      fee: 0,
    },
    {
      id: 'PADDED_ENVELOPE',
      name: 'Padded Envelope',
      description: 'Lightweight padded mailer for documents and small items.',
      protectionLevel: 'Good',
      suitableFor: 'Documents & Small Items',
      fee: 0,
    },
    {
      id: 'TAMPER_PROOF_POUCH',
      name: 'Tamper Proof Pouch',
      description: 'Secure, tamper-evident pouch for confidential items.',
      protectionLevel: 'High',
      suitableFor: 'Confidential Records',
      fee: 20,
    },
    {
      id: 'BUBBLE_WRAP',
      name: 'Bubble Wrap',
      description: 'Extra cushioning for fragile or breakable items.',
      protectionLevel: 'High',
      suitableFor: 'Fragile Deliveries',
      fee: 25,
    },
    {
      id: 'HEAVY_DUTY_CRATE',
      name: 'Heavy Duty Crate',
      description: 'Maximum protection for heavy, delicate or high-value items.',
      protectionLevel: 'Maximum',
      suitableFor: 'Heavy & High-Value Items',
      fee: 50,
    },
    {
      id: 'DOCUMENT_SLEEVE',
      name: 'Document Sleeve',
      description: 'Water-resistant sleeve for important documents.',
      protectionLevel: 'Good',
      suitableFor: 'Legal Documents',
      fee: 15,
    },
    {
      id: 'MY_OWN_PACKAGE',
      name: 'My Own Package',
      description: 'I will pack using my own packaging.',
      protectionLevel: 'Standard',
      suitableFor: 'Self Packed',
      fee: 0,
    },
  ],
  addonProtections: [
    { id: 'EXTRA_BUBBLE_WRAP', name: 'Extra Bubble Wrap', description: 'Additional cushioning for extra safety.', price: 30 },
    { id: 'CORNER_GUARD', name: 'Corner Guard', description: 'Protects corners and edges from damage.', price: 25 },
    { id: 'WATERPROOF_COVER', name: 'Waterproof Cover', description: 'Protects from moisture and light rain.', price: 20 },
    { id: 'FRAGILE_STICKER', name: 'Fragile Sticker', description: 'Alerts handlers to handle with care.', price: 10 },
    { id: 'SEAL_SECURITY_TAPE', name: 'Seal & Security Tape', description: 'Tamper-evident sealing for added security.', price: 15 },
  ],
  securityLevels: [
    {
      id: 'STANDARD_SECURITY',
      name: 'Standard Security',
      description: 'Basic security with sealed packaging and tracking.',
      badge: 'Included',
      badgeType: 'yellow',
      fee: 0,
    },
    {
      id: 'ENHANCED_SECURITY',
      name: 'Enhanced Security',
      description: 'Tamper-proof packaging and real-time tracking.',
      badge: 'Recommended',
      badgeType: 'green',
      fee: 30,
    },
    {
      id: 'MAXIMUM_SECURITY',
      name: 'Maximum Security',
      description: 'Armed escort / high security for critical items.',
      badge: 'Premium',
      badgeType: 'red',
      fee: 60,
    },
  ],
  securityFeatures: [
    { id: 'realtimeGps', label: 'Real-time GPS Tracking', description: 'Track your shipment in real-time.', default: true, icon: 'MapPin' },
    { id: 'deliveryAlerts', label: 'Delivery Alerts & Notifications', description: 'Get alerts for every key milestone.', default: true, icon: 'Bell' },
    { id: 'armedEscort', label: 'Armed Escort (Optional)', description: 'Add armed escort for high value or sensitive shipments.', default: false, icon: 'ShieldAlert' },
    { id: 'secureStorageHubs', label: 'Secure Storage at Hubs', description: 'Secure handling & storage at Delivez Vault hubs.', default: true, icon: 'Lock' },
    { id: 'restrictedAccess', label: 'Restricted Access', description: 'Limit access to authorized personnel only.', default: true, icon: 'UserCheck' },
  ],
  verificationMethods: [
    {
      id: 'OTP',
      name: 'OTP Verification',
      badge: 'Recommended',
      description: 'Recipient will receive an OTP on their registered mobile number for verification.',
      note: 'Best for secure and contact-based deliveries',
      icon: 'User',
    },
    {
      id: 'ID_PROOF',
      name: 'ID Proof Verification',
      description: 'Verify recipient using a valid government-issued ID proof.',
      note: 'Suitable for high value and important shipments',
      icon: 'BadgeCheck',
    },
    {
      id: 'SIGNATURE',
      name: 'Signature Verification',
      description: "Collect recipient's signature at the time of delivery.",
      note: 'Standard method for most deliveries',
      icon: 'PenTool',
    },
    {
      id: 'FACE_VERIFICATION',
      name: 'Face Verification',
      description: 'Verify recipient using live photo capture at delivery.',
      note: 'High security with live face match',
      icon: 'ScanFace',
    },
    {
      id: 'AUTHORIZED_PERSON',
      name: 'Authorized Person Verification',
      description: 'Allow delivery to an authorized person on behalf of the recipient.',
      note: 'For cases where recipient is not personally available',
      icon: 'Shield',
    },
    {
      id: 'PIN',
      name: 'PIN Verification',
      description: 'Recipient must provide a pre-shared PIN to receive the delivery.',
      note: 'Extra layer of security for sensitive items',
      icon: 'Lock',
    },
  ],
  accessRequirements: [
    { id: 'Security Check', label: 'Security Check', icon: 'Shield' },
    { id: 'Visitor Pass', label: 'Visitor Pass', icon: 'IdCard' },
    { id: 'Lift Access', label: 'Lift Access', icon: 'Building' },
    { id: 'ID Proof', label: 'ID Proof', icon: 'FileText' },
  ],
  timeSlots: [
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ],
  additionalServices: [
    { id: 'TAMPER_PROOF_SEAL', name: 'Tamper-Proof Seal' },
    { id: 'CHAIN_OF_CUSTODY', name: 'Chain of Custody' },
    { id: 'PHOTO_PROOF', name: 'Photo Proof of Delivery' },
    { id: 'SECURE_HANDLING', name: 'Secure Handling Protocol' },
  ],
  encryptionStandard: 'AES-256 End-to-End Encrypted',
  securityBadge: 'Norton SECURED',
}

function authorizedRequest(path, options = {}) {
  const token = getUserAccessToken()
  if (!token) {
    throw new ApiError('Please log in to continue.', 401, null)
  }
  return apiRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function fetchVaultOptions() {
  try {
    const response = await apiRequest('/confidential-delivery/options')
    return response?.data || DEFAULT_VAULT_OPTIONS
  } catch (err) {
    console.warn('Using default vault options fallback:', err)
    return DEFAULT_VAULT_OPTIONS
  }
}

export async function calculateVaultQuote(details) {
  try {
    const response = await apiRequest('/confidential-delivery/quote', {
      method: 'POST',
      body: JSON.stringify(details),
    })
    return response.data
  } catch (err) {
    const secFee = details.securityLevel === 'MAXIMUM_SECURITY' ? 60 : (details.securityLevel === 'ENHANCED_SECURITY' ? 30 : 30)
    let addonFee = 0
    if (Array.isArray(details.addonProtections)) {
      addonFee = details.addonProtections.length * 15
    }
    const baseFare = 49.00
    const addOnServices = 20.00 + addonFee
    const totalAmount = baseFare + secFee + addOnServices
    return {
      baseFare,
      securityHandling: secFee,
      packagingFee: 0,
      serviceFee: 0,
      addOnServices,
      totalAmount,
      breakdown: { baseFare, securityHandling: secFee, addOnServices, gstAmount: 17.82, distanceKm: 8.5 },
      securityLevel: details.securityLevel === 'MAXIMUM_SECURITY' ? 'Maximum Security' : 'Highly Confidential',
    }
  }
}

export async function createVaultBooking(details, idempotencyKey) {
  const response = await authorizedRequest('/confidential-delivery/bookings', {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    body: JSON.stringify(details),
  })
  return response.data.booking
}

export async function fetchVaultBookings() {
  const response = await authorizedRequest('/confidential-delivery/bookings')
  return response.data.bookings
}

export async function fetchVaultBookingById(id) {
  const response = await authorizedRequest(`/confidential-delivery/bookings/${id}`)
  return response.data.booking
}

export async function trackVaultShipment(vaultId) {
  const response = await apiRequest(`/confidential-delivery/track/${vaultId}`)
  return response.data
}

export async function verifyVaultOtp(id, otp) {
  const response = await apiRequest(`/confidential-delivery/track/${id}/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({ otp }),
  })
  return response.data
}

export async function cancelVaultBooking(id, reason = 'Cancelled by user') {
  const response = await authorizedRequest(`/confidential-delivery/bookings/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
  return response.data
}

export async function completeVaultSandboxPayment(id, paymentPayload) {
  const response = await authorizedRequest(`/confidential-delivery/bookings/${id}/payments/sandbox`, {
    method: 'POST',
    body: JSON.stringify(paymentPayload),
  })
  return response.data
}
