import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  FolderLock,
  Handshake,
  Landmark,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  MapPinned,
  MoreHorizontal,
  Package,
  Phone,
  QrCode,
  Scale,
  Share2,
  Shield,
  ShieldCheck,
  Truck,
  User,
  UserCheck,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  calculateVaultQuote,
  createVaultBooking,
  fetchVaultOptions,
} from '@/features/confidential-delivery/services/confidentialDeliveryService.js'
import { fetchSavedAddresses } from '@/features/personal-courier/services/personalCourierService.js'
import styles from './ConfidentialDeliveryBookingPage.module.css'

const STEPS = [
  { id: 'item', label: 'Item Type' },
  { id: 'security', label: 'Security Level' },
  { id: 'packaging', label: 'Packaging' },
  { id: 'service', label: 'Service Type' },
  { id: 'pickup', label: 'Pickup' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'review', label: 'Review' },
  { id: 'confirm', label: 'Confirm' },
]

const ITEM_ICON_MAP = {
  FileText,
  Scale,
  Handshake,
  Landmark,
  Building2,
  Award,
  Mail,
  FolderLock,
  Package,
  MoreHorizontal,
}

export default function ConfidentialDeliveryBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [options, setOptions] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // Booking Form State
  const [formData, setFormData] = useState({
    itemType: 'LEGAL_DOCS',
    customItemDescription: '',
    securityLevel: 'HIGHLY_CONFIDENTIAL',
    packaging: 'VAULT_SECURE_ENVELOPE',
    serviceType: 'VAULT_SECURE',
    declaredValue: 50000,
    paymentMethod: 'PAY_ON_DELIVERY',
    termsAccepted: true,
    pickup: {
      companyName: 'ABC Technologies Pvt Ltd',
      contactName: 'Rahul Sharma',
      phoneNumber: '9876548421',
      addressLine1: 'Tower A, 5th Floor, Block 1',
      addressLine2: 'MG Road',
      landmark: 'Near Trinity Metro',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      senderRole: 'Authorized Sender',
      timingType: 'SCHEDULE',
      pickupDate: new Date().toISOString().split('T')[0],
      timeSlot: '12:00 PM - 02:00 PM',
      instructions: 'Ask for Legal Department at reception.',
      accessRequirements: ['Security Check', 'Visitor Pass', 'Lift Access'],
    },
    delivery: {
      companyName: 'ABC Law Associates',
      contactName: 'Anita Verma',
      phoneNumber: '9876549654',
      email: 'anita.verma@abclaw.com',
      designation: 'Legal Head',
      addressLine1: 'Tower A, 8th Floor, Unit 801',
      addressLine2: 'MG Road',
      landmark: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      verificationMethod: 'OTP',
      instructions: 'Deliver to the Legal Department. Do not hand over to anyone else.',
      allowAlternateRecipient: false,
    },
  })

  // Quotation State
  const [quote, setQuote] = useState({
    baseFare: 49,
    securityHandling: 30,
    packagingFee: 49,
    serviceFee: 0,
    addOnServices: 49,
    totalAmount: 128,
    breakdown: { baseFare: 49, securityHandling: 30, addOnServices: 49, gstAmount: 23.04, distanceKm: 8.5 },
    securityLevel: 'Highly Confidential',
  })

  // Created Booking Record
  const [createdBooking, setCreatedBooking] = useState(null)

  // Load config & saved addresses
  useEffect(() => {
    let active = true
    Promise.all([
      fetchVaultOptions().catch(() => null),
      fetchSavedAddresses().catch(() => []),
    ]).then(([opts, addrs]) => {
      if (!active) return
      if (opts) setOptions(opts)
      if (Array.isArray(addrs)) setSavedAddresses(addrs)
      setLoadingOptions(false)
    })
    return () => { active = false }
  }, [])

  // Recalculate quote on relevant changes
  useEffect(() => {
    calculateVaultQuote({
      securityLevel: formData.securityLevel,
      packaging: formData.packaging,
      serviceType: formData.serviceType,
      declaredValue: formData.declaredValue,
    })
      .then((q) => {
        if (q) setQuote(q)
      })
      .catch(() => {})
  }, [formData.securityLevel, formData.packaging, formData.serviceType, formData.declaredValue])

  const nextStep = () => {
    setErrorMsg('')
    if (currentStep === 5) {
      if (!formData.pickup.contactName || !formData.pickup.phoneNumber || !formData.pickup.addressLine1 || !formData.pickup.city || !formData.pickup.postalCode) {
        setErrorMsg('Please fill in all required pickup address fields.')
        return
      }
    }
    if (currentStep === 6) {
      if (!formData.delivery.contactName || !formData.delivery.phoneNumber || !formData.delivery.addressLine1 || !formData.delivery.city || !formData.delivery.postalCode) {
        setErrorMsg('Please fill in all required delivery address fields.')
        return
      }
    }
    if (currentStep < 7) {
      setCurrentStep(c => c + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setErrorMsg('')
    if (currentStep > 1 && currentStep <= 7) {
      setCurrentStep(c => c - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigateTo('/#services')
    }
  }

  const handleBookingSubmit = async () => {
    if (!formData.termsAccepted) {
      setErrorMsg('Please agree to the Terms & Conditions to confirm your Vault booking.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const payload = {
        itemType: formData.itemType,
        itemDescription: formData.customItemDescription || (options?.itemTypes?.find(t => t.id === formData.itemType)?.name ?? 'Confidential Shipment'),
        securityLevel: formData.securityLevel,
        packaging: formData.packaging,
        serviceType: formData.serviceType,
        declaredValue: formData.declaredValue,
        paymentMethod: formData.paymentMethod,
        pickupSchedule: formData.pickup.timingType === 'SCHEDULE' ? `${formData.pickup.pickupDate}T10:00:00.000Z` : null,
        timeSlot: formData.pickup.timeSlot,
        pickupInstructions: formData.pickup.instructions,
        accessRequirements: formData.pickup.accessRequirements,
        pickup: {
          label: formData.pickup.companyName || 'Pickup Location',
          contactName: formData.pickup.contactName,
          phoneNumber: formData.pickup.phoneNumber,
          addressLine1: formData.pickup.addressLine1,
          addressLine2: formData.pickup.addressLine2,
          landmark: formData.pickup.landmark,
          city: formData.pickup.city,
          state: formData.pickup.state,
          postalCode: formData.pickup.postalCode,
        },
        delivery: {
          label: formData.delivery.companyName || 'Delivery Location',
          contactName: formData.delivery.contactName,
          phoneNumber: formData.delivery.phoneNumber,
          email: formData.delivery.email,
          designation: formData.delivery.designation,
          addressLine1: formData.delivery.addressLine1,
          addressLine2: formData.delivery.addressLine2,
          landmark: formData.delivery.landmark,
          city: formData.delivery.city,
          state: formData.delivery.state,
          postalCode: formData.delivery.postalCode,
          verificationMethod: formData.delivery.verificationMethod,
          instructions: formData.delivery.instructions,
          allowAlternateRecipient: formData.delivery.allowAlternateRecipient,
        },
      }

      const booking = await createVaultBooking(payload)
      setCreatedBooking(booking)
      setCurrentStep(8)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to create Vault booking. Please check your details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyVaultId = (id) => {
    if (!id) return
    navigator.clipboard?.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShareVault = (vaultId) => {
    const url = `${window.location.origin}/vault/track/${vaultId}`
    if (navigator.share) {
      navigator.share({
        title: `Delivez Vault Shipment: ${vaultId}`,
        text: `Track your confidential shipment in Delivez Vault: ${vaultId}`,
        url,
      }).catch(() => {})
    } else {
      handleCopyVaultId(url)
    }
  }

  const toggleAccessReq = (reqName) => {
    setFormData(prev => {
      const list = prev.pickup.accessRequirements.includes(reqName)
        ? prev.pickup.accessRequirements.filter(r => r !== reqName)
        : [...prev.pickup.accessRequirements, reqName]
      return { ...prev, pickup: { ...prev.pickup, accessRequirements: list } }
    })
  }

  if (loadingOptions) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308', gap: '12px' }}>
          <LoaderCircle className="animate-spin" size={32} />
          <strong>Loading Delivez Vault Secure Environment...</strong>
        </div>
      </div>
    )
  }

  const itemTypesList = options?.itemTypes || []
  const securityLevelsList = options?.securityLevels || []
  const packagingList = options?.packagingOptions || []
  const serviceTypesList = options?.serviceTypes || []
  const popularServices = serviceTypesList.filter(s => s.category === 'POPULAR')
  const moreServices = serviceTypesList.filter(s => s.category === 'MORE')
  const accessReqs = options?.accessRequirements || ['Security Check', 'Visitor Pass', 'Lift Access', 'ID Proof', 'Parking']
  const verificationMethods = options?.verificationMethods || []
  const timeSlots = options?.timeSlots || ['10:00 AM - 12:00 PM', '12:00 PM - 02:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM']

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.vaultHeader}>
        <div className={styles.headerLeft}>
          <button type="button" className={styles.backButton} onClick={prevStep} title="Back">
            <ArrowLeft size={20} />
          </button>
          <div className={styles.brandLogo}>
            <Shield className={styles.brandIcon} size={28} />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>DELIVEZ</span>
              <span className={styles.brandSubtitle}>VAULT</span>
            </div>
          </div>
        </div>
        <div className={styles.secureBadge}>
          <ShieldCheck size={16} />
          <span>SECURE BOOKING</span>
        </div>
      </header>

      {/* Stepper Bar */}
      <nav className={styles.stepperWrapper} aria-label="Booking Progress">
        <div className={styles.stepperCard}>
          <div className={styles.stepperList}>
            {STEPS.map((step, idx) => {
              const stepNum = idx + 1
              const isActive = currentStep === stepNum
              const isCompleted = currentStep > stepNum
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`${styles.stepItem} ${isActive ? styles.stepActive : ''} ${isCompleted ? styles.stepCompleted : ''}`}
                  onClick={() => {
                    if (isCompleted && currentStep <= 7) setCurrentStep(stepNum)
                  }}
                  disabled={currentStep === 8 || stepNum > currentStep}
                >
                  <div className={styles.stepCircle}>
                    {isCompleted ? <Check size={16} /> : stepNum}
                  </div>
                  <span className={styles.stepLabel}>{step.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Card */}
      <main className={styles.contentArea}>
        <div className={styles.mainCard}>
          {errorMsg && (
            <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '14px', marginBottom: '20px', fontSize: '0.88rem', fontWeight: '600' }}>
              {errorMsg}
            </div>
          )}

          {/* STEP 1: What are you sending securely? */}
          {currentStep === 1 && (
            <section>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>What are you sending securely?</h1>
                <p className={styles.sectionSubtitle}>Select the document or asset category for tailored confidential handling.</p>
              </div>

              <div className={styles.itemGrid}>
                {itemTypesList.map((item) => {
                  const Icon = ITEM_ICON_MAP[item.icon] || FileText
                  const isSelected = formData.itemType === item.id
                  return (
                    <div
                      key={item.id}
                      className={`${styles.itemCard} ${isSelected ? styles.itemCardSelected : ''}`}
                      onClick={() => setFormData(p => ({ ...p, itemType: item.id }))}
                    >
                      <div className={styles.itemLeft}>
                        <div className={styles.itemIcon}><Icon size={22} /></div>
                        <div className={styles.itemInfo}>
                          <h4>{item.name}</h4>
                          <p>{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className={styles.chevronIcon} size={18} />
                    </div>
                  )
                })}
              </div>

              {formData.itemType === 'OTHER' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '0.85rem' }}>Describe your confidential shipment</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. Encrypted cryptographic token with master recovery seeds"
                    value={formData.customItemDescription}
                    onChange={(e) => setFormData(p => ({ ...p, customItemDescription: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </section>
          )}

          {/* STEP 2: Security Level */}
          {currentStep === 2 && (
            <section>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>What level of confidentiality does this require?</h1>
                <p className={styles.sectionSubtitle}>Choose the security protocol, chain of custody, and verification depth.</p>
              </div>

              <div className={styles.securityList}>
                {securityLevelsList.map((level) => {
                  const isSelected = formData.securityLevel === level.id
                  const tagClass = level.tag === 'Good' ? styles.tagGood : (level.tag === 'Maximum' ? styles.tagMaximum : styles.tagRecommended)
                  return (
                    <div
                      key={level.id}
                      className={`${styles.securityCard} ${isSelected ? styles.securityCardSelected : ''}`}
                      onClick={() => setFormData(p => ({ ...p, securityLevel: level.id }))}
                    >
                      <div className={styles.securityRadio}>
                        {isSelected && <div className={styles.securityRadioInner} />}
                      </div>
                      <div className={styles.securityBody}>
                        <div className={styles.securityTitleRow}>
                          <h4>{level.name}</h4>
                          {level.tag && <span className={`${styles.securityTag} ${tagClass}`}>{level.tag}</span>}
                        </div>
                        <p className={styles.securityDesc}>{level.description}</p>
                        <ul className={styles.securityFeatureList}>
                          <li><ShieldCheck size={15} className={styles.featureDot} /> Bank-grade Chain of Custody</li>
                          <li><Lock size={15} className={styles.featureDot} /> OTP & ID Verification</li>
                          <li><Award size={15} className={styles.featureDot} /> Tamper Protection</li>
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* STEP 3: Packaging */}
          {currentStep === 3 && (
            <section>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>How should we package your confidential shipment?</h1>
                <p className={styles.sectionSubtitle}>Enterprise tamper-proof sealed packaging with serial tracking.</p>
              </div>

              <div className={styles.packagingGrid}>
                {packagingList.map((pkg) => {
                  const isSelected = formData.packaging === pkg.id
                  return (
                    <div
                      key={pkg.id}
                      className={`${styles.packagingCard} ${isSelected ? styles.packagingCardSelected : ''}`}
                      onClick={() => setFormData(p => ({ ...p, packaging: pkg.id }))}
                    >
                      {pkg.tag && <span className={styles.packagingBadge}>{pkg.tag}</span>}
                      <div>
                        <div className={styles.packagingVisual}>
                          {pkg.id.includes('BOX') ? <Package size={28} /> : <Mail size={28} />}
                        </div>
                        <h4>{pkg.name}</h4>
                        <p>{pkg.description}</p>
                      </div>
                      <div className={styles.packagingPriceRow}>
                        <span className={styles.packagingPrice}>
                          {pkg.fee === 0 ? '₹0' : `₹${pkg.fee}`}
                        </span>
                        <small style={{ color: '#64748b', fontWeight: '600' }}>
                          {pkg.fee === 0 ? 'No Extra Cost' : 'Per Shipment'}
                        </small>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '14px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#854d0e' }}>
                <ShieldCheck size={20} />
                <span>All Vault packaging includes: Tamper Seal • Seal Verification • Chain of Custody • Secure Handling</span>
              </div>
            </section>
          )}

          {/* STEP 4: Service Type */}
          {currentStep === 4 && (
            <section className={styles.servicesSectionWrap}>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Choose Delivery Service Type</h1>
                <p className={styles.sectionSubtitle}>Select the service that best matches your security, speed, and transit requirements.</p>
              </div>

              <div className={styles.popularGrid}>
                {popularServices.map((service) => {
                  const isSelected = formData.serviceType === service.id
                  return (
                    <div
                      key={service.id}
                      className={`${styles.serviceCard} ${isSelected ? styles.serviceCardSelected : ''}`}
                      onClick={() => setFormData(p => ({ ...p, serviceType: service.id }))}
                    >
                      {service.tag && (
                        <span className={`${styles.serviceTag} ${service.tag === 'Fastest' ? styles.serviceTagFastest : styles.serviceTagRecommended}`}>
                          {service.tag}
                        </span>
                      )}
                      <div>
                        <div className={styles.serviceHeaderRow}>
                          <Shield size={20} className={styles.serviceIcon} />
                          <h4>{service.name}</h4>
                        </div>
                        <p className={styles.serviceDesc}>{service.description}</p>
                      </div>
                      <div className={styles.serviceEtaRow}>
                        <span><Clock size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} /> {service.expectedDelivery}</span>
                        <span>{service.fee === 0 ? 'Included' : `+₹${service.fee}`}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={styles.moreServicesHeader}>
                <h3>More Specialized Vault Services</h3>
                <small style={{ color: '#64748b', fontWeight: '600' }}>{moreServices.length} additional options</small>
              </div>

              <div className={styles.moreGrid}>
                {moreServices.map((service) => {
                  const isSelected = formData.serviceType === service.id
                  return (
                    <div
                      key={service.id}
                      className={`${styles.moreServiceCard} ${isSelected ? styles.moreServiceSelected : ''}`}
                      onClick={() => setFormData(p => ({ ...p, serviceType: service.id }))}
                    >
                      <h5>{service.name}</h5>
                      <p>{service.description}</p>
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '700', color: '#854d0e' }}>
                        <span>{service.expectedDelivery}</span>
                        <span>{service.fee === 0 ? 'Free' : `+₹${service.fee}`}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* STEP 5: Pickup Details */}
          {currentStep === 5 && (
            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Pickup Details</h1>
                <p className={styles.sectionSubtitle}>Where should our trusted custody executive pick up the shipment?</p>
              </div>

              {/* Saved Address helper */}
              {savedAddresses.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Load from saved addresses:</span>
                  <select
                    className={styles.selectField}
                    onChange={(e) => {
                      const selected = savedAddresses.find(a => a.id === e.target.value)
                      if (selected) {
                        setFormData(p => ({
                          ...p,
                          pickup: {
                            ...p.pickup,
                            companyName: selected.label || p.pickup.companyName,
                            contactName: selected.contactName,
                            phoneNumber: selected.phoneNumber,
                            addressLine1: selected.addressLine1,
                            addressLine2: selected.addressLine2 || '',
                            landmark: selected.landmark || '',
                            city: selected.city,
                            state: selected.state,
                            postalCode: selected.postalCode,
                          }
                        }))
                      }
                    }}
                  >
                    <option value="">-- Choose saved address --</option>
                    {savedAddresses.map(a => (
                      <option key={a.id} value={a.id}>{a.label} ({a.contactName}, {a.city})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pickup Address Card */}
              <div className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <h4>Pickup Address & Contact</h4>
                  <span className={styles.changeBtn}>Verified Sender</span>
                </div>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label>Company / Location Name</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.pickup.companyName}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, companyName: e.target.value } }))}
                      placeholder="e.g. ABC Technologies Pvt Ltd"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Contact Person *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.pickup.contactName}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, contactName: e.target.value } }))}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      className={styles.inputField}
                      value={formData.pickup.phoneNumber}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, phoneNumber: e.target.value } }))}
                      placeholder="e.g. 9876548421"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Sender Role / Pickup Point</label>
                    <select
                      className={styles.selectField}
                      value={formData.pickup.senderRole}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, senderRole: e.target.value } }))}
                    >
                      <option value="Authorized Sender">Authorized Sender</option>
                      <option value="Legal Officer">Legal Officer</option>
                      <option value="Executive Assistant">Executive Assistant</option>
                      <option value="Direct Custodian">Direct Custodian</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }} className={styles.inputGrid}>
                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Address Line 1 (Flat, Floor, Building) *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.pickup.addressLine1}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, addressLine1: e.target.value } }))}
                      placeholder="Tower A, 5th Floor, Block 1"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Street / Area</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.pickup.addressLine2}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, addressLine2: e.target.value } }))}
                      placeholder="MG Road"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Landmark</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.pickup.landmark}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, landmark: e.target.value } }))}
                      placeholder="Near Metro Station"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>City *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.pickup.city}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, city: e.target.value } }))}
                      placeholder="Bengaluru"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>State *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.pickup.state}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, state: e.target.value } }))}
                      placeholder="Karnataka"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.pickup.postalCode}
                      onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, postalCode: e.target.value } }))}
                      placeholder="560001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Timing */}
              <div className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <h4>Pickup Timing</h4>
                </div>
                <div className={styles.timingGrid}>
                  <div
                    className={`${styles.timingCard} ${formData.pickup.timingType === 'SCHEDULE' ? styles.timingCardSelected : ''}`}
                    onClick={() => setFormData(p => ({ ...p, pickup: { ...p.pickup, timingType: 'SCHEDULE' } }))}
                  >
                    <Calendar size={22} className={styles.featureDot} />
                    <div>
                      <h5>Schedule Pickup</h5>
                      <p>Choose date & time slot</p>
                    </div>
                  </div>
                  <div
                    className={`${styles.timingCard} ${formData.pickup.timingType === 'EXPRESS' ? styles.timingCardSelected : ''}`}
                    onClick={() => setFormData(p => ({ ...p, pickup: { ...p.pickup, timingType: 'EXPRESS' } }))}
                  >
                    <Clock size={22} className={styles.featureDot} />
                    <div>
                      <h5>Express Pickup</h5>
                      <p>ASAP (Within 2 hours)</p>
                    </div>
                  </div>
                </div>

                {formData.pickup.timingType === 'SCHEDULE' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'center' }}>
                      <div className={styles.inputGroup}>
                        <label>Pickup Date</label>
                        <input
                          type="date"
                          className={styles.inputField}
                          value={formData.pickup.pickupDate}
                          onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, pickupDate: e.target.value } }))}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Preferred Time Slot</label>
                        <div className={styles.slotGrid}>
                          {timeSlots.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              className={`${styles.slotPill} ${formData.pickup.timeSlot === slot ? styles.slotPillSelected : ''}`}
                              onClick={() => setFormData(p => ({ ...p, pickup: { ...p.pickup, timeSlot: slot } }))}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions & Access Requirements */}
              <div className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <h4>Pickup Instructions & Access Requirements</h4>
                </div>
                <div className={styles.inputGroup}>
                  <label>Pickup Instructions (Optional)</label>
                  <textarea
                    className={styles.textareaField}
                    maxLength={200}
                    value={formData.pickup.instructions}
                    onChange={e => setFormData(p => ({ ...p, pickup: { ...p.pickup, instructions: e.target.value } }))}
                    placeholder="e.g. Ask for Legal Department at reception."
                  />
                  <span className={styles.charCount}>{formData.pickup.instructions.length} / 200</span>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Access Requirements</label>
                  <div className={styles.chipGrid}>
                    {accessReqs.map(req => {
                      const isChecked = formData.pickup.accessRequirements.includes(req)
                      return (
                        <button
                          key={req}
                          type="button"
                          className={`${styles.chipBtn} ${isChecked ? styles.chipActive : ''}`}
                          onClick={() => toggleAccessReq(req)}
                        >
                          {isChecked ? <CheckCircle2 size={16} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #cbd5e1' }} />}
                          <span>{req}</span>
                        </button>
                      )
                    })}
                  </div>
                  <small style={{ display: 'block', marginTop: '8px', color: '#64748b', fontSize: '0.76rem' }}>
                    Our executive will follow all building, security, and verification protocols.
                  </small>
                </div>
              </div>
            </section>
          )}

          {/* STEP 6: Delivery Details */}
          {currentStep === 6 && (
            <section className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Delivery Details</h1>
                <p className={styles.sectionSubtitle}>Recipient identity, security verification method, and destination address.</p>
              </div>

              {/* Recipient Information Card */}
              <div className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <h4>Recipient Information</h4>
                  <span className={styles.changeBtn}>Strict Handover</span>
                </div>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label>Recipient Full Name *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.delivery.contactName}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, contactName: e.target.value } }))}
                      placeholder="e.g. Anita Verma"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Recipient Mobile Number *</label>
                    <input
                      type="tel"
                      className={styles.inputField}
                      value={formData.delivery.phoneNumber}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, phoneNumber: e.target.value } }))}
                      placeholder="e.g. 9876549654"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email Address (Optional)</label>
                    <input
                      type="email"
                      className={styles.inputField}
                      value={formData.delivery.email}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, email: e.target.value } }))}
                      placeholder="anita.verma@abclaw.com"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Designation / Role (Optional)</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.delivery.designation}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, designation: e.target.value } }))}
                      placeholder="e.g. Legal Head / Senior Partner"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <h4>Delivery Address</h4>
                </div>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                    <label>Address Line 1 (Flat, Floor, Unit) *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.delivery.addressLine1}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, addressLine1: e.target.value } }))}
                      placeholder="Tower A, 8th Floor, Unit 801"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Street / Area</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.delivery.addressLine2}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, addressLine2: e.target.value } }))}
                      placeholder="MG Road"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>City *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.delivery.city}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, city: e.target.value } }))}
                      placeholder="Bengaluru"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>State *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.delivery.state}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, state: e.target.value } }))}
                      placeholder="Karnataka"
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={formData.delivery.postalCode}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, postalCode: e.target.value } }))}
                      placeholder="560001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Verification Method Selection */}
              <div className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <h4>Recipient Verification Method</h4>
                </div>
                <div className={styles.verificationGrid}>
                  {verificationMethods.map(vm => {
                    const isSelected = formData.delivery.verificationMethod === vm.id
                    return (
                      <div
                        key={vm.id}
                        className={`${styles.verificationCard} ${isSelected ? styles.verificationCardSelected : ''}`}
                        onClick={() => setFormData(p => ({ ...p, delivery: { ...p.delivery, verificationMethod: vm.id } }))}
                      >
                        <div className={styles.securityRadio}>
                          {isSelected && <div className={styles.securityRadioInner} />}
                        </div>
                        <div>
                          <h5>{vm.name} {vm.tag && <span className={styles.tagRecommended} style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px' }}>{vm.tag}</span>}</h5>
                          <p>{vm.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Additional Instructions (Optional)</label>
                  <textarea
                    className={styles.textareaField}
                    maxLength={200}
                    value={formData.delivery.instructions}
                    onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, instructions: e.target.value } }))}
                    placeholder="e.g. Deliver to Legal Department. Do not hand over to anyone else."
                  />
                  <span className={styles.charCount}>{formData.delivery.instructions.length} / 200</span>
                </div>

                <div className={styles.toggleRow}>
                  <div className={styles.toggleLabel}>
                    <strong>Allow Alternate Recipient</strong>
                    <small>Only if the primary recipient is strictly unavailable at delivery</small>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={formData.delivery.allowAlternateRecipient}
                      onChange={e => setFormData(p => ({ ...p, delivery: { ...p.delivery, allowAlternateRecipient: e.target.checked } }))}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* STEP 7: Review & Confirm */}
          {currentStep === 7 && (
            <section>
              <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle}>Review & Confirm</h1>
                <p className={styles.sectionSubtitle}>Verify all parameters before final sealed dispatch.</p>
              </div>

              {/* Summary Cards */}
              <div className={styles.reviewSummaryGrid}>
                <div className={styles.summaryTile}>
                  <small>Item Type</small>
                  <strong>{options?.itemTypes?.find(t => t.id === formData.itemType)?.name || 'Confidential Documents'}</strong>
                </div>
                <div className={styles.summaryTile}>
                  <small>Security Level</small>
                  <strong>{options?.securityLevels?.find(s => s.id === formData.securityLevel)?.name || 'Highly Confidential'}</strong>
                </div>
                <div className={styles.summaryTile}>
                  <small>Packaging</small>
                  <strong>{options?.packagingOptions?.find(p => p.id === formData.packaging)?.name || 'Vault Secure Envelope'}</strong>
                </div>
                <div className={styles.summaryTile}>
                  <small>Service Speed</small>
                  <strong>{options?.serviceTypes?.find(s => s.id === formData.serviceType)?.name || 'Vault Secure'}</strong>
                </div>
              </div>

              {/* Address Route Card */}
              <div className={styles.addressRouteCard}>
                <div>
                  <small style={{ color: '#ca8a04', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.72rem' }}>Pickup</small>
                  <h4 style={{ margin: '4px 0 2px', fontSize: '1rem', color: '#0f172a' }}>{formData.pickup.companyName || formData.pickup.contactName}</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{formData.pickup.addressLine1}, {formData.pickup.city} - {formData.pickup.postalCode}</p>
                </div>
                <div className={styles.routeArrow}><ArrowRight size={24} /></div>
                <div>
                  <small style={{ color: '#ca8a04', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.72rem' }}>Delivery</small>
                  <h4 style={{ margin: '4px 0 2px', fontSize: '1rem', color: '#0f172a' }}>{formData.delivery.companyName || formData.delivery.contactName}</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{formData.delivery.addressLine1}, {formData.delivery.city} - {formData.delivery.postalCode}</p>
                </div>
              </div>

              {/* Price Details */}
              <div className={styles.priceBreakdownCard}>
                <h4 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Price Breakdown</h4>
                <div className={styles.priceRow}>
                  <span>Base Fare</span>
                  <strong>₹{quote.baseFare.toFixed(2)}</strong>
                </div>
                <div className={styles.priceRow}>
                  <span>Security & Handling Fee ({quote.securityLevel})</span>
                  <strong>₹{quote.securityHandling.toFixed(2)}</strong>
                </div>
                <div className={styles.priceRow}>
                  <span>Add-on Packaging & Services</span>
                  <strong>₹{quote.addOnServices.toFixed(2)}</strong>
                </div>
                <div className={styles.priceRow}>
                  <span>Estimated GST (18%)</span>
                  <strong>₹{quote.breakdown.gstAmount.toFixed(2)}</strong>
                </div>
                <div className={styles.totalPriceRow}>
                  <span>Total Amount</span>
                  <span className={styles.totalPriceVal}>₹{quote.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px 22px', marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>Payment Method</label>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PAY_ON_DELIVERY"
                      checked={formData.paymentMethod === 'PAY_ON_DELIVERY'}
                      onChange={() => setFormData(p => ({ ...p, paymentMethod: 'PAY_ON_DELIVERY' }))}
                      style={{ accentColor: '#eab308' }}
                    />
                    <span>Pay on Delivery (Cash / UPI / Cheque)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={formData.paymentMethod === 'ONLINE'}
                      onChange={() => setFormData(p => ({ ...p, paymentMethod: 'ONLINE' }))}
                      style={{ accentColor: '#eab308' }}
                    />
                    <span>Online Payment (Sandbox Card / UPI Gateway)</span>
                  </label>
                </div>
              </div>

              {/* Terms Box */}
              <div className={styles.termsBox}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={e => setFormData(p => ({ ...p, termsAccepted: e.target.checked }))}
                />
                <label htmlFor="terms" style={{ cursor: 'pointer' }}>
                  I have reviewed all shipment details and agree to the <strong>Delivez Vault Terms & Conditions</strong> and chain of custody compliance.
                </label>
              </div>
            </section>
          )}

          {/* STEP 8: Confirmation Screen (Vault Created Successfully) */}
          {currentStep === 8 && (
            <section className={styles.confirmationWrapper}>
              <div className={styles.glowingShield}>
                <ShieldCheck size={48} />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px' }}>
                Vault Created Successfully!
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 24px' }}>
                Your confidential shipment has been securely booked and is registered for pickup.
              </p>

              <div className={styles.vaultSuccessCard}>
                <small style={{ color: '#64748b', fontWeight: '700', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Vault ID
                </small>
                <div className={styles.vaultIdDisplay}>
                  <span>{createdBooking?.vaultId || createdBooking?.bookingNumber || 'DV-250811-8F7X'}</span>
                  <button
                    type="button"
                    className={styles.copyIdBtn}
                    onClick={() => handleCopyVaultId(createdBooking?.vaultId || createdBooking?.bookingNumber)}
                  >
                    <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className={styles.vaultSummaryThreeCol}>
                  <div className={styles.colItem}>
                    <small>Pickup Schedule</small>
                    <strong>{formData.pickup.pickupDate || 'Today'} ({formData.pickup.timeSlot})</strong>
                  </div>
                  <div className={styles.colItem}>
                    <small>Security Level</small>
                    <strong style={{ color: '#dc2626' }}>{quote.securityLevel}</strong>
                  </div>
                  <div className={styles.colItem}>
                    <small>Encryption</small>
                    <strong style={{ color: '#16a34a' }}>AES-256 End-to-End</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => handleShareVault(createdBooking?.vaultId || createdBooking?.bookingNumber)}
                >
                  <Share2 size={18} /> Share ID
                </button>
                <button
                  type="button"
                  className={`${styles.btnPrimary} ${styles.btnGold}`}
                  onClick={() => navigateTo(`/vault/track/${createdBooking?.vaultId || createdBooking?.bookingNumber}`)}
                >
                  Track Shipment <ArrowRight size={18} />
                </button>
              </div>
            </section>
          )}

          {/* Action Buttons Footer (Steps 1 to 7) */}
          {currentStep <= 7 && (
            <div className={styles.footerButtons}>
              <button type="button" className={styles.btnSecondary} onClick={prevStep}>
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              {currentStep < 7 ? (
                <button type="button" className={styles.btnPrimary} onClick={nextStep}>
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleBookingSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} /> Securing Vault Dispatch...
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Confirm & Pay Securely
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Trust Footer Note */}
          <div className={styles.securityFooterNote}>
            <Lock size={14} className={styles.lockIcon} />
            <span>Your data and documents are protected with bank-level encryption.</span>
            <span className={styles.nortonBadge}>✓ Norton SECURED</span>
          </div>
        </div>
      </main>
    </div>
  )
}
