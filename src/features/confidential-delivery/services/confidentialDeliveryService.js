import { apiRequest, ApiError } from '@/services/api/apiClient.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'

export const DEFAULT_VAULT_OPTIONS = {
  itemTypes: [
    { id: 'CONFIDENTIAL_DOCS', name: 'Confidential Documents', description: 'Private and business-critical documents', icon: 'FileText' },
    { id: 'LEGAL_DOCS', name: 'Legal Documents', description: 'Affidavits, deeds, power of attorney, petitions', icon: 'Scale' },
    { id: 'CONTRACTS', name: 'Contracts / Agreements', description: 'Executed contracts, NDAs, MoUs, lease agreements', icon: 'Handshake' },
    { id: 'FINANCIAL_DOCS', name: 'Financial Documents', description: 'Cheques, audit reports, bank drafts, statements', icon: 'Landmark' },
    { id: 'OFFICIAL_DOCS', name: 'Official Documents', description: 'Corporate records, tax filings, compliance papers', icon: 'Building2' },
    { id: 'CERTIFICATES', name: 'Original Certificates', description: 'Degrees, licenses, title deeds, birth certificates', icon: 'Award' },
    { id: 'SEALED_ENVELOPE', name: 'Sealed Envelope', description: 'Pre-sealed confidential envelope for direct handover', icon: 'Mail' },
    { id: 'SENSITIVE_RECORDS', name: 'Sensitive Records', description: 'Medical files, HR records, confidential dossiers', icon: 'FolderLock' },
    { id: 'SECURE_PACKAGE', name: 'Secure Package', description: 'Encrypted devices, hardware tokens, secure containers', icon: 'Package' },
    { id: 'OTHER', name: 'Other / Not Listed', description: 'Describe your custom confidential shipment', icon: 'MoreHorizontal' },
  ],
  securityLevels: [
    { id: 'STANDARD_CONFIDENTIAL', name: 'Standard Confidential', description: 'Business-sensitive documents with secure handling, OTP verification & basic tracking.', badge: 'Standard', tag: 'Good', fee: 0 },
    { id: 'HIGHLY_CONFIDENTIAL', name: 'Highly Confidential', description: 'Restricted recipient access, tamper protection, named recipient, full chain of custody & verified delivery.', badge: 'High', tag: 'Recommended', fee: 30 },
    { id: 'CRITICAL', name: 'Critical', description: 'Highest level of security & control with enhanced verification, direct delivery & detailed audit trail.', badge: 'Ultra', tag: 'Maximum', fee: 60 },
  ],
  packagingOptions: [
    { id: 'VAULT_SECURE_ENVELOPE', name: 'Vault Secure Envelope', description: 'Tamper-evident and water-resistant. Includes tamper-proof security seal & unique seal ID.', tag: 'RECOMMENDED', fee: 49 },
    { id: 'MY_SEALED_ENVELOPE', name: 'My Sealed Envelope', description: "I'll provide my own sealed packaging. We ensure secure handling & seal verification at pickup.", tag: 'No Extra Cost', fee: 0 },
    { id: 'VAULT_SECURE_BOX', name: 'Vault Secure Box', description: 'For bulkier documents or items. Rugged & tamper-evident box with extra protection for bulky items.', fee: 99 },
  ],
  serviceTypes: [
    { id: 'VAULT_SECURE', name: 'Vault Secure', description: 'Standard secure delivery with full verification and chain of custody.', expectedDelivery: '1-2 Days', tag: 'Recommended', category: 'POPULAR', fee: 0 },
    { id: 'VAULT_PRIORITY', name: 'Vault Priority', description: 'Faster delivery with priority handling and dedicated partner.', expectedDelivery: 'Same / Next Day', tag: 'Fastest', category: 'POPULAR', fee: 50 },
    { id: 'VAULT_DIRECT', name: 'Vault Direct', description: 'Direct pickup to delivery with no intermediate stops.', expectedDelivery: '4-6 Hours', category: 'POPULAR', fee: 100 },
    { id: 'VAULT_LEGAL', name: 'Vault Legal', description: 'Specialized handling for court filings, deeds, and legal notices with formal acknowledgement.', expectedDelivery: 'Next Day', category: 'MORE', fee: 40 },
    { id: 'VAULT_TENDER', name: 'Vault Tender', description: 'Strict-time tender submission with signed submission receipt.', expectedDelivery: 'Time-Definite', category: 'MORE', fee: 60 },
    { id: 'VAULT_BANKING', name: 'Vault Banking', description: 'For banking drafts, bonds, and high-value instruments.', expectedDelivery: 'Banking Hours', category: 'MORE', fee: 50 },
    { id: 'VAULT_BOARD', name: 'Vault Board', description: 'Board packs & executive confidential dossier delivery.', expectedDelivery: 'Same Day', category: 'MORE', fee: 80 },
    { id: 'VAULT_WHITE_GLOVE', name: 'Vault White Glove', description: 'Premium handling, tamper audit & dedicated executive escort.', expectedDelivery: 'Direct Non-Stop', category: 'MORE', fee: 120 },
    { id: 'VAULT_CRITICAL', name: 'Vault Critical', description: 'Highest control & rapid response delivery with active GPS telemetry.', expectedDelivery: 'Immediate', category: 'MORE', fee: 180 },
  ],
  accessRequirements: ['Security Check', 'Visitor Pass', 'Lift Access', 'ID Proof', 'Parking'],
  verificationMethods: [
    { id: 'OTP', name: 'OTP Verification', description: 'Recipient will receive an OTP on mobile to verify identity.', tag: 'RECOMMENDED' },
    { id: 'QR_CODE', name: 'QR Code Verification', description: 'Recipient must scan the secure QR code at the time of delivery.' },
    { id: 'GOVT_ID', name: 'Authorized ID Verification', description: 'Verify recipient using valid Govt. ID at delivery.' },
  ],
  timeSlots: ['10:00 AM - 12:00 PM', '12:00 PM - 02:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM', '06:00 PM - 08:00 PM'],
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
    const secFee = details.securityLevel === 'CRITICAL' ? 60 : (details.securityLevel === 'HIGHLY_CONFIDENTIAL' ? 30 : 0)
    const pkgFee = details.packaging === 'VAULT_SECURE_BOX' ? 99 : (details.packaging === 'VAULT_SECURE_ENVELOPE' ? 49 : 0)
    const baseFare = 49
    const subtotal = baseFare + secFee + pkgFee
    const gst = Math.round(subtotal * 0.18 * 100) / 100
    return {
      baseFare,
      securityHandling: secFee,
      packagingFee: pkgFee,
      serviceFee: 0,
      addOnServices: 49,
      totalAmount: Math.round(subtotal + gst),
      breakdown: { baseFare, securityHandling: secFee, packagingFee: pkgFee, gstAmount: gst, distanceKm: 8.5 },
      securityLevel: details.securityLevel || 'Highly Confidential',
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
