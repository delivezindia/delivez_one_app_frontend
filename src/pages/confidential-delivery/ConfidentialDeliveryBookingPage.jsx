import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Building,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
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
  MoreHorizontal,
  Package,
  Phone,
  Scale,
  ScanFace,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UploadCloud,
  User,
  UserCheck,
  Zap,
  Repeat,
  ArrowLeftRight,
  Briefcase,
  GitFork,
  Boxes,
  Wine,
  Hand,
  ArrowUp,
  Umbrella,
  PenTool,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  calculateVaultQuote,
  createVaultBooking,
  DEFAULT_VAULT_OPTIONS,
  fetchVaultOptions,
} from '@/features/confidential-delivery/services/confidentialDeliveryService.js'
import styles from './ConfidentialDeliveryBookingPage.module.css'

const STEPS = [
  { id: 1, key: 'service', label: 'Service', icon: Truck },
  { id: 2, key: 'pickup', label: 'Pickup', icon: MapPin },
  { id: 3, key: 'delivery', label: 'Delivery', icon: User },
  { id: 4, key: 'item', label: 'Item', icon: FileText },
  { id: 5, key: 'packaging', label: 'Packaging', icon: Package },
  { id: 6, key: 'security', label: 'Security', icon: ShieldCheck },
  { id: 7, key: 'verification', label: 'Verification', icon: BadgeCheck },
  { id: 8, key: 'review', label: 'Review', icon: FileText },
  { id: 9, key: 'confirm', label: 'Conform', icon: CheckCircle2 },
]

export default function ConfidentialDeliveryBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [options, setOptions] = useState(DEFAULT_VAULT_OPTIONS)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  // Form State matching mobile screens
  const [formData, setFormData] = useState({
    // Step 1: Service
    serviceType: 'VAULT_SECURE',

    // Step 2: Pickup
    pickup: {
      pickupType: 'Business', // Business | Home
      contactName: 'Rahul Sharma',
      mobileNumber: '9876548421',
      companyName: 'ABC Technologies Pvt Ltd',
      gstin: '',
      completeAddress: 'Tower A, 5th Floor, Block 1, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      contactPerson: 'Rahul Sharma',
      designation: 'Authorized Sender',
      alternateMobile: '',
      email: 'rahul@abctech.com',
      pickupDate: new Date().toISOString().split('T')[0],
      timeWindow: '10:00 AM - 12:00 PM',
      preferredTime: '',
      specialInstructions: 'Ask for Legal Department at reception.',
      accessRequirements: ['Security Check', 'Visitor Pass', 'Lift Access'],
    },

    // Step 3: Delivery
    delivery: {
      deliveryType: 'Business', // Business | Home
      contactName: 'Anita Verma',
      mobileNumber: '9876549654',
      companyName: 'ABC Law Associates',
      gstin: '',
      completeAddress: 'Tower A, 8th Floor, Unit 801, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      contactPerson: 'Anita Verma',
      designation: 'Legal Head',
      alternateMobile: '',
      email: 'anita.verma@abclaw.com',
      preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeWindow: '12:00 PM - 02:00 PM',
      customerAvailable: '',
      specialInstructions: 'Deliver to the Legal Department. Do not hand over to anyone else.',
      accessRequirements: ['Security Check', 'Visitor Pass', 'Lift Access'],
    },

    // Step 4: Item
    item: {
      selectedItemType: 'LEGAL_DOCS',
      itemName: 'Legal Documents & Contracts',
      itemCategory: 'Legal Documents',
      itemType: 'Document', // Document | Parcel | Other
      pieces: 1,
      weightKg: '0.5',
      lengthCm: '30',
      widthCm: '22',
      heightCm: '2',
      declaredValue: '50000',
      contentType: 'Signed Agreements / Deeds',
      itemContents: 'Contract original execution copies for signature acknowledgement.',
      handlingTags: ['Fragile', 'Handle with Care'],
      customOtherDescription: '',
    },

    // Step 5: Packaging
    packaging: {
      packagingType: 'STANDARD_BOX',
      addonProtections: ['EXTRA_BUBBLE_WRAP'],
      packagingInstructions: 'Keep items upright, handle with care',
    },

    // Step 6: Security
    security: {
      securityLevel: 'ENHANCED_SECURITY',
      features: {
        realtimeGps: true,
        deliveryAlerts: true,
        armedEscort: false,
        secureStorageHubs: true,
        restrictedAccess: true,
      },
      additionalInstructions: 'Follow high security protocol during transport.',
    },

    // Step 7: Verification
    verification: {
      verificationMethod: 'OTP', // OTP | ID_PROOF | SIGNATURE | FACE_VERIFICATION | AUTHORIZED_PERSON | PIN
      captureRecipientPhoto: true,
      captureIdPhoto: false,
    },

    // Step 8: Terms
    termsAccepted: true,
  })

  // Quotation State
  const [quote, setQuote] = useState({
    baseFare: 49.0,
    securityHandling: 30.0,
    packagingFee: 0.0,
    serviceFee: 0.0,
    addOnServices: 20.0,
    totalAmount: 99.0,
    breakdown: { baseFare: 49, securityHandling: 30, addOnServices: 20, distanceKm: 8.5 },
    securityLevel: 'Enhanced Security',
  })

  // Created Booking Record
  const [createdBooking, setCreatedBooking] = useState(null)

  // Load backend options
  useEffect(() => {
    let active = true
    fetchVaultOptions().then((opts) => {
      if (active && opts) setOptions(opts)
    })
    return () => {
      active = false
    }
  }, [])

  // Calculate quote dynamically on changes
  useEffect(() => {
    calculateVaultQuote({
      securityLevel: formData.security.securityLevel,
      packaging: formData.packaging.packagingType,
      serviceType: formData.serviceType,
      addonProtections: formData.packaging.addonProtections,
    }).then((q) => {
      if (q) setQuote(q)
    })
  }, [
    formData.serviceType,
    formData.packaging.packagingType,
    formData.packaging.addonProtections,
    formData.security.securityLevel,
  ])

  // Navigation handlers
  const goNext = () => {
    setErrorMsg('')
    if (currentStep === 1) {
      if (!formData.serviceType) {
        setErrorMsg('Please select a service type.')
        return
      }
    } else if (currentStep === 2) {
      if (!formData.pickup.contactName || !formData.pickup.mobileNumber || !formData.pickup.completeAddress) {
        setErrorMsg('Please fill in required pickup details (Contact Name, Mobile, Address).')
        return
      }
    } else if (currentStep === 3) {
      if (!formData.delivery.contactName || !formData.delivery.mobileNumber || !formData.delivery.completeAddress) {
        setErrorMsg('Please fill in required delivery details (Contact Name, Mobile, Address).')
        return
      }
    } else if (currentStep === 4) {
      if (!formData.item.itemName) {
        setErrorMsg('Please enter an item name or description.')
        return
      }
    }

    if (currentStep < 9) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goBack = () => {
    setErrorMsg('')
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigateTo('/services')
    }
  }

  // Final booking submission in Step 8
  const handleConfirmBooking = async () => {
    if (!formData.termsAccepted) {
      setErrorMsg('Please accept the Terms & Conditions to proceed.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const payload = {
        serviceType: formData.serviceType,
        itemType: formData.item.selectedItemType,
        itemDescription: formData.item.itemName,
        declaredValue: Number(formData.item.declaredValue) || 50000,
        securityLevel: formData.security.securityLevel,
        packaging: formData.packaging.packagingType,
        verificationMethod: formData.verification.verificationMethod,
        timeSlot: formData.pickup.timeWindow,
        pickupSchedule: formData.pickup.pickupDate,
        pickup: {
          companyName: formData.pickup.companyName,
          contactName: formData.pickup.contactName,
          phoneNumber: formData.pickup.mobileNumber,
          addressLine1: formData.pickup.completeAddress,
          city: formData.pickup.city,
          state: formData.pickup.state,
          postalCode: formData.pickup.pinCode,
          instructions: formData.pickup.specialInstructions,
          accessRequirements: formData.pickup.accessRequirements,
        },
        delivery: {
          companyName: formData.delivery.companyName,
          contactName: formData.delivery.contactName,
          phoneNumber: formData.delivery.mobileNumber,
          email: formData.delivery.email,
          designation: formData.delivery.designation,
          addressLine1: formData.delivery.completeAddress,
          city: formData.delivery.city,
          state: formData.delivery.state,
          postalCode: formData.delivery.pinCode,
          instructions: formData.delivery.specialInstructions,
          accessRequirements: formData.delivery.accessRequirements,
        },
        paymentMethod: 'PAY_ON_DELIVERY',
      }

      const booking = await createVaultBooking(payload)
      setCreatedBooking(booking)
      setCurrentStep(9)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.warn('Booking API error, using optimistic local vault booking:', err)
      const yy = String(new Date().getFullYear()).slice(2)
      const mm = String(new Date().getMonth() + 1).padStart(2, '0')
      const dd = String(new Date().getDate()).padStart(2, '0')
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
      const fallbackVaultId = `DV-${yy}${mm}${dd}-${rand}`

      const optimisticBooking = {
        vaultId: fallbackVaultId,
        bookingNumber: fallbackVaultId,
        status: 'CONFIRMED',
        pickupDate: formData.pickup.pickupDate,
        timeSlot: formData.pickup.timeWindow,
        securityLevel: formData.security.securityLevel === 'MAXIMUM_SECURITY' ? 'High' : 'High',
        encryption: 'AES-256',
        totalAmount: quote.totalAmount,
      }
      setCreatedBooking(optimisticBooking)
      setCurrentStep(9)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShareId = (id) => {
    if (!id) return
    if (navigator.share) {
      navigator.share({
        title: 'Delivez Vault ID',
        text: `Track my confidential delivery on Delivez Vault: ${id}`,
        url: window.location.origin + `/confidential-delivery/track/${id}`,
      }).catch(() => {})
    } else {
      handleCopyId(id)
    }
  }

  const toggleChip = (list, item) => {
    if (list.includes(item)) {
      return list.filter((x) => x !== item)
    } else {
      return [...list, item]
    }
  }

  const handleUseMyLocation = (targetKey) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            [targetKey]: {
              ...prev[targetKey],
              completeAddress: `Current Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            },
          }))
        },
        () => {
          alert('Unable to retrieve location automatically. Please enter your address manually.')
        }
      )
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...files.map((f) => f.name)])
    }
  }

  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'Zap': return Zap
      case 'GitFork': return GitFork
      case 'CalendarClock': return Clock
      case 'Briefcase': return Briefcase
      case 'ArrowLeftRight': return ArrowLeftRight
      case 'Repeat': return Repeat
      case 'ShieldAlert': return ShieldAlert
      case 'Radar': return MapPin
      default: return Shield
    }
  }

  const getItemIcon = (iconName) => {
    switch (iconName) {
      case 'Scale': return Scale
      case 'Handshake': return Handshake
      case 'Landmark': return Landmark
      case 'Building2': return Building2
      case 'Award': return Award
      case 'Mail': return Mail
      case 'FolderLock': return FolderLock
      case 'Package': return Package
      case 'MoreHorizontal': return MoreHorizontal
      default: return FileText
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <header className={styles.vaultHeader}>
        <div className={styles.headerLeft}>
          <button type="button" className={styles.backButton} onClick={goBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className={styles.brandLogo}>
            <div className={styles.brandTitle}>
              Delivez <span>VAULT</span>
            </div>
            <Lock className={styles.brandLockIcon} size={18} />
          </div>
        </div>

        <div className={styles.secureBadge}>
          <div className={styles.secureBadgeTop}>
            <Shield size={13} color="#0f172a" />
            <span>{currentStep === 7 ? 'VERIFY' : 'SECURE'}</span>
          </div>
          <div className={styles.secureBadgeSub}>
            {currentStep === 7 ? 'DELIVERY' : 'BOOKING'}
          </div>
        </div>
      </header>

      {/* Stepper matching all 9 steps in mobile */}
      <div className={styles.stepperWrapper}>
        <div className={styles.stepperContainer}>
          {STEPS.map((s, idx) => {
            const isCompleted = currentStep > s.id
            const isActive = currentStep === s.id
            return (
              <div
                key={s.id}
                className={styles.stepNode}
                onClick={() => currentStep > s.id && setCurrentStep(s.id)}
              >
                <div
                  className={`${styles.stepCircle} ${isActive ? styles.active : ''} ${
                    isCompleted ? styles.completed : ''
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : s.id}
                </div>
                <span
                  className={`${styles.stepLabel} ${isActive ? styles.active : ''} ${
                    isCompleted ? styles.completed : ''
                  }`}
                >
                  {s.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div className={`${styles.stepLine} ${isCompleted ? styles.completed : ''}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <main className={styles.mainContainer}>
        {errorMsg && (
          <div className="p-3.5 mb-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: SERVICE SELECTION */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div>
            <div className={styles.serviceHeaderRow}>
              <div>
                <h1 className={styles.stepTitle}>Choose Delivery Service Type</h1>
                <p className={styles.stepSubtitle}>
                  Select the service that best matches your security, speed and delivery requirements.
                </p>
              </div>
              <div className={styles.vaultTacticalBox}>
                <div className={styles.vaultTacticalBoxInner}>
                  <Shield size={14} color="#eab308" />
                  <Lock size={12} color="#eab308" />
                </div>
              </div>
            </div>

            <div className={styles.sectionHeading}>Popular Services</div>

            <div className={styles.servicesGrid}>
              {options.serviceTypes.map((srv) => {
                const IconComp = getServiceIcon(srv.icon)
                const isSelected = formData.serviceType === srv.id
                return (
                  <div
                    key={srv.id}
                    className={`${styles.serviceCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, serviceType: srv.id }))}
                  >
                    {srv.badge && (
                      <span
                        className={`${styles.serviceBadgeTag} ${
                          srv.badge === 'Fastest' ? styles.badgeRed : styles.badgeYellow
                        }`}
                      >
                        {srv.badge}
                      </span>
                    )}
                    <IconComp className={styles.serviceCardIcon} />
                    <h3 className={styles.serviceCardTitle}>{srv.name}</h3>
                    <p className={styles.serviceCardDesc}>{srv.description}</p>
                    <div className={styles.serviceCardDuration}>
                      <Clock size={13} />
                      <span>{srv.expectedDelivery}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={styles.actionBtnRow}>
              <button type="button" className={styles.primaryActionBtn} onClick={goNext}>
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: PICKUP */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div>
            <div className={styles.desktopSplitLayout}>
              {/* Main Column: Pickup Location */}
              <div className={styles.desktopColMain}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <MapPin size={16} />
                    <span>Pickup Location</span>
                  </div>

                  <label className={styles.inputLabel}>Pickup Type</label>
                  <div className={styles.toggleRow}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${
                        formData.pickup.pickupType === 'Business' ? styles.active : ''
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          pickup: { ...prev.pickup, pickupType: 'Business' },
                        }))
                      }
                    >
                      <Building2 size={16} />
                      <span>Business</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${
                        formData.pickup.pickupType === 'Home' ? styles.active : ''
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          pickup: { ...prev.pickup, pickupType: 'Home' },
                        }))
                      }
                    >
                      <Building size={16} />
                      <span>Home</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Contact Name</label>
                      <div className={styles.inputWrapper}>
                        <User className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter full name"
                          value={formData.pickup.contactName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, contactName: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Mobile Number</label>
                      <div className={styles.inputWrapper}>
                        <Phone className={styles.inputIcon} />
                        <input
                          type="tel"
                          className={styles.inputField}
                          placeholder="Enter mobile number"
                          value={formData.pickup.mobileNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, mobileNumber: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Company / Organization <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <Briefcase className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter company name"
                          value={formData.pickup.companyName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, companyName: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        GSTIN <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <FileText className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter GSTIN"
                          value={formData.pickup.gstin}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, gstin: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Complete Pickup Address</label>
                    <div className={styles.addressRow}>
                      <div className={styles.inputWrapper}>
                        <MapPin className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="House / Building, Street, Area, Landmark"
                          value={formData.pickup.completeAddress}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, completeAddress: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.locationBtn}
                        onClick={() => handleUseMyLocation('pickup')}
                      >
                        <span>Use My Location</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.row3Cols}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>City</label>
                      <div className={styles.inputWrapper}>
                        <Building2 className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter city"
                          value={formData.pickup.city}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, city: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>State</label>
                      <div className={styles.inputWrapper}>
                        <MapPin className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter state"
                          value={formData.pickup.state}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, state: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>PIN Code</label>
                      <div className={styles.inputWrapper}>
                        <MapPin className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter PIN code"
                          value={formData.pickup.pinCode}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, pinCode: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Column: Contact Person, Timing & Instructions */}
              <div className={styles.desktopColSide}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <User size={16} />
                    <span>Pickup Contact Person</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Contact Person</label>
                      <div className={styles.inputWrapper}>
                        <User className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter contact person name"
                          value={formData.pickup.contactPerson}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, contactPerson: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Designation <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <Briefcase className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter designation"
                          value={formData.pickup.designation}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, designation: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Alternate Mobile <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <Phone className={styles.inputIcon} />
                        <input
                          type="tel"
                          className={styles.inputField}
                          placeholder="Enter alternate number"
                          value={formData.pickup.alternateMobile}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, alternateMobile: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Email <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <Mail className={styles.inputIcon} />
                        <input
                          type="email"
                          className={styles.inputField}
                          placeholder="Enter email address"
                          value={formData.pickup.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, email: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.noticeBox}>
                    <ShieldCheck className={styles.noticeIcon} />
                    <span className={styles.noticeText}>
                      Our executive will contact you before arriving for pickup.
                    </span>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <Clock size={16} />
                    <span>Pickup Timing</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Pickup Date</label>
                      <div className={styles.inputWrapper}>
                        <Calendar className={styles.inputIcon} />
                        <input
                          type="date"
                          className={styles.inputField}
                          value={formData.pickup.pickupDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, pickupDate: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Pickup Time Window</label>
                      <div className={styles.inputWrapper}>
                        <Clock className={styles.inputIcon} />
                        <select
                          className={styles.selectDropdown}
                          value={formData.pickup.timeWindow}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickup: { ...prev.pickup, timeWindow: e.target.value },
                            }))
                          }
                        >
                          {options.timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={styles.selectChevron} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Special Instructions (Optional)</span>
                  </div>
                  <textarea
                    className={styles.textareaField}
                    placeholder="Add any special instructions for pickup..."
                    maxLength={250}
                    value={formData.pickup.specialInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pickup: { ...prev.pickup, specialInstructions: e.target.value },
                      }))
                    }
                  />
                  <span className={styles.charCount}>
                    {formData.pickup.specialInstructions.length}/250
                  </span>
                </div>
              </div>
            </div>

            {/* Access Requirements Card - Full Width Desktop */}
            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <span>Access Requirements</span>
              </div>
              <div className={styles.chipsGrid}>
                {options.accessRequirements.map((req) => {
                  const isSelected = formData.pickup.accessRequirements.includes(req.id || req)
                  return (
                    <div
                      key={req.id || req}
                      className={`${styles.chipCard} ${isSelected ? styles.selected : ''}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          pickup: {
                            ...prev.pickup,
                            accessRequirements: toggleChip(
                              prev.pickup.accessRequirements,
                              req.id || req
                            ),
                          },
                        }))
                      }
                    >
                      <Shield className={styles.chipIcon} />
                      <span className={styles.chipText}>{req.label || req}</span>
                    </div>
                  )
                })}
              </div>

              <div className={styles.noticeBox}>
                <ShieldCheck className={styles.noticeIcon} />
                <span className={styles.noticeText}>
                  Our executive will follow all building and security protocols.
                </span>
              </div>
            </div>

            <div className={styles.actionBtnRow}>
              <button type="button" className={styles.secondaryActionBtn} onClick={goBack}>
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button type="button" className={styles.primaryActionBtn} onClick={goNext}>
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: DELIVERY */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div>
            <div className={styles.desktopSplitLayout}>
              {/* Main Column: Delivery Location */}
              <div className={styles.desktopColMain}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <MapPin size={16} />
                    <span>Delivery Location</span>
                  </div>

                  <label className={styles.inputLabel}>Delivery Type</label>
                  <div className={styles.toggleRow}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${
                        formData.delivery.deliveryType === 'Business' ? styles.active : ''
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          delivery: { ...prev.delivery, deliveryType: 'Business' },
                        }))
                      }
                    >
                      <Building2 size={16} />
                      <span>Business</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${
                        formData.delivery.deliveryType === 'Home' ? styles.active : ''
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          delivery: { ...prev.delivery, deliveryType: 'Home' },
                        }))
                      }
                    >
                      <Building size={16} />
                      <span>Home</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Contact Name</label>
                      <div className={styles.inputWrapper}>
                        <User className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter full name"
                          value={formData.delivery.contactName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, contactName: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Mobile Number</label>
                      <div className={styles.inputWrapper}>
                        <Phone className={styles.inputIcon} />
                        <input
                          type="tel"
                          className={styles.inputField}
                          placeholder="Enter mobile number"
                          value={formData.delivery.mobileNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, mobileNumber: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Company / Organization <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <Briefcase className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter company name"
                          value={formData.delivery.companyName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, companyName: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        GSTIN <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <FileText className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter GSTIN"
                          value={formData.delivery.gstin}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, gstin: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Complete Delivery Address</label>
                    <div className={styles.addressRow}>
                      <div className={styles.inputWrapper}>
                        <MapPin className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="House / Building, Street, Area, Landmark"
                          value={formData.delivery.completeAddress}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, completeAddress: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.locationBtn}
                        onClick={() => handleUseMyLocation('delivery')}
                      >
                        <span>Use My Location</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.row3Cols}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>City</label>
                      <div className={styles.inputWrapper}>
                        <Building2 className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter city"
                          value={formData.delivery.city}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, city: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>State</label>
                      <div className={styles.inputWrapper}>
                        <MapPin className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter state"
                          value={formData.delivery.state}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, state: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>PIN Code</label>
                      <div className={styles.inputWrapper}>
                        <MapPin className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter PIN code"
                          value={formData.delivery.pinCode}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, pinCode: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Column: Delivery Contact, Timing, Instructions */}
              <div className={styles.desktopColSide}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <User size={16} />
                    <span>Delivery Contact Person</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Contact Person</label>
                      <div className={styles.inputWrapper}>
                        <User className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter contact person name"
                          value={formData.delivery.contactPerson}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, contactPerson: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Designation <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <Briefcase className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Enter designation"
                          value={formData.delivery.designation}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, designation: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Alternate Mobile <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <Phone className={styles.inputIcon} />
                        <input
                          type="tel"
                          className={styles.inputField}
                          placeholder="Enter alternate number"
                          value={formData.delivery.alternateMobile}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, alternateMobile: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>
                        Email <span className={styles.inputLabelSpan}>(Optional)</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <Mail className={styles.inputIcon} />
                        <input
                          type="email"
                          className={styles.inputField}
                          placeholder="Enter email address"
                          value={formData.delivery.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, email: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.noticeBox}>
                    <ShieldCheck className={styles.noticeIcon} />
                    <span className={styles.noticeText}>
                      We will notify the recipient before arriving at the delivery location.
                    </span>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <Clock size={16} />
                    <span>Delivery Timing</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Preferred Delivery Date</label>
                      <div className={styles.inputWrapper}>
                        <Calendar className={styles.inputIcon} />
                        <input
                          type="date"
                          className={styles.inputField}
                          value={formData.delivery.preferredDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, preferredDate: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Preferred Time Window</label>
                      <div className={styles.inputWrapper}>
                        <Clock className={styles.inputIcon} />
                        <select
                          className={styles.selectDropdown}
                          value={formData.delivery.timeWindow}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              delivery: { ...prev.delivery, timeWindow: e.target.value },
                            }))
                          }
                        >
                          {options.timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={styles.selectChevron} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Special Instructions (Optional)</span>
                  </div>
                  <textarea
                    className={styles.textareaField}
                    placeholder="Add any special instructions for delivery..."
                    maxLength={250}
                    value={formData.delivery.specialInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        delivery: { ...prev.delivery, specialInstructions: e.target.value },
                      }))
                    }
                  />
                  <span className={styles.charCount}>
                    {formData.delivery.specialInstructions.length}/250
                  </span>
                </div>
              </div>
            </div>

            {/* Access Requirements Card - Full Width */}
            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <span>Access Requirements</span>
              </div>
              <div className={styles.chipsGrid}>
                {options.accessRequirements.map((req) => {
                  const isSelected = formData.delivery.accessRequirements.includes(req.id || req)
                  return (
                    <div
                      key={req.id || req}
                      className={`${styles.chipCard} ${isSelected ? styles.selected : ''}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          delivery: {
                            ...prev.delivery,
                            accessRequirements: toggleChip(
                              prev.delivery.accessRequirements,
                              req.id || req
                            ),
                          },
                        }))
                      }
                    >
                      <Shield className={styles.chipIcon} />
                      <span className={styles.chipText}>{req.label || req}</span>
                    </div>
                  )
                })}
              </div>

              <div className={styles.noticeBox}>
                <ShieldCheck className={styles.noticeIcon} />
                <span className={styles.noticeText}>
                  Our executive will follow all building and security protocols.
                </span>
              </div>
            </div>

            <div className={styles.actionBtnRow}>
              <button type="button" className={styles.secondaryActionBtn} onClick={goBack}>
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button type="button" className={styles.primaryActionBtn} onClick={goNext}>
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: ITEM SELECTION */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 4 && (
          <div>
            <h1 className={styles.stepTitle}>What are you sending securely?</h1>

            <div className={styles.itemsGrid}>
              {options.itemTypes
                .filter((item) => item.id !== 'OTHER')
                .map((item) => {
                  const IconComp = getItemIcon(item.icon)
                  const isSelected = formData.item.selectedItemType === item.id
                  return (
                    <div
                      key={item.id}
                      className={`${styles.itemCard} ${isSelected ? styles.selected : ''}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          item: {
                            ...prev.item,
                            selectedItemType: item.id,
                            itemName: item.name,
                          },
                        }))
                      }
                    >
                      <ChevronRight className={styles.itemArrow} />
                      <IconComp className={styles.itemIcon} />
                      <span className={styles.itemName}>{item.name}</span>
                    </div>
                  )
                })}
            </div>

            {/* Other / Not Listed option & Why banner (2 cols on desktop) */}
            <div className={styles.itemOtherAndWhyRow}>
              <div
                className={`${styles.itemOtherWide} ${
                  formData.item.selectedItemType === 'OTHER' ? styles.selected : ''
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    item: {
                      ...prev.item,
                      selectedItemType: 'OTHER',
                      itemName: prev.item.customOtherDescription || 'Custom Confidential Shipment',
                    },
                  }))
                }
              >
                <div className={styles.itemOtherLeft}>
                  <div className={styles.dotsCircle}>
                    <MoreHorizontal size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Other / Not Listed</div>
                    <div className="text-xs text-slate-500">Describe your shipment</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#94a3b8" />
              </div>

              <div className={styles.whyBanner}>
                <Shield size={24} className="text-amber-500 flex-shrink-0" />
                <div>
                  <div className={styles.whyBannerTitle}>Why this matters?</div>
                  <div className={styles.whyBannerText}>
                    Choosing the right type helps us apply the right security controls and handling.
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop 2-column layout: Item Info on Left, Handling & Attachments on Right */}
            <div className={styles.desktopSplitLayout}>
              <div className={styles.desktopColMain}>
                {/* Item Information Card */}
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <Package size={16} />
                    <span>Item Information</span>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Item Name / Description *</label>
                  <div className={styles.inputWrapper}>
                    <Package className={styles.inputIcon} />
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="Enter item name or description"
                      value={formData.item.itemName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, itemName: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Item Category</label>
                  <div className={styles.inputWrapper}>
                    <select
                      className={styles.selectDropdown}
                      value={formData.item.itemCategory}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, itemCategory: e.target.value },
                        }))
                      }
                    >
                      {options.itemCategories?.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={styles.selectChevron} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Item Type *</label>
                  <div className={styles.radioRow}>
                    {['Document', 'Parcel', 'Other'].map((type) => (
                      <label key={type} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="itemTypeOption"
                          checked={formData.item.itemType === type}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              item: { ...prev.item, itemType: type },
                            }))
                          }
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>No. of Pieces *</label>
                  <div className={styles.stepperCounter}>
                    <button
                      type="button"
                      className={styles.counterBtn}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, pieces: Math.max(1, prev.item.pieces - 1) },
                        }))
                      }
                    >
                      -
                    </button>
                    <span className={styles.counterValue}>{formData.item.pieces}</span>
                    <button
                      type="button"
                      className={styles.counterBtn}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, pieces: prev.item.pieces + 1 },
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Weight (Actual)</label>
                  <div className={styles.inputWrapper}>
                    <Package className={styles.inputIcon} />
                    <input
                      type="number"
                      step="0.1"
                      className={styles.inputField}
                      placeholder="Enter weight in kg"
                      value={formData.item.weightKg}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, weightKg: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Dimensions (L × W × H)</label>
                  <div className={styles.dimensionsRow}>
                    <input
                      type="number"
                      placeholder="Length cm"
                      className={styles.dimInput}
                      value={formData.item.lengthCm}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, lengthCm: e.target.value },
                        }))
                      }
                    />
                    <span>×</span>
                    <input
                      type="number"
                      placeholder="Width cm"
                      className={styles.dimInput}
                      value={formData.item.widthCm}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, widthCm: e.target.value },
                        }))
                      }
                    />
                    <span>×</span>
                    <input
                      type="number"
                      placeholder="Height cm"
                      className={styles.dimInput}
                      value={formData.item.heightCm}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, heightCm: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Declared Value <span className={styles.inputLabelSpan}>(Optional)</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className="absolute left-3 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      className={styles.inputField}
                      placeholder="Enter declared value"
                      value={formData.item.declaredValue}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, declaredValue: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    Content Type <span className={styles.inputLabelSpan}>(Optional)</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <select
                      className={styles.selectDropdown}
                      value={formData.item.contentType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          item: { ...prev.item, contentType: e.target.value },
                        }))
                      }
                    >
                      {options.contentTypes?.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={styles.selectChevron} />
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Item Contents / Description <span className={styles.inputLabelSpan}>(Optional)</span>
                </label>
                <textarea
                  className={styles.textareaField}
                  placeholder="Provide more details about the item contents"
                  maxLength={250}
                  value={formData.item.itemContents}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      item: { ...prev.item, itemContents: e.target.value },
                    }))
                  }
                />
                <span className={styles.charCount}>
                  {formData.item.itemContents.length}/250
                </span>
              </div>
                </div>
              </div>

              {/* Side Column: Item Handling & Attachments */}
              <div className={styles.desktopColSide}>
                {/* Item Handling Card */}
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <Shield size={16} />
                    <span>Item Handling</span>
                  </div>
                  <div className={styles.handlingChipsRow}>
                    {options.itemHandlingOptions?.map((opt) => {
                      const label = opt.label || opt
                      const isSelected = formData.item.handlingTags.includes(label)
                      return (
                        <button
                          key={label}
                          type="button"
                          className={`${styles.handlingChip} ${isSelected ? styles.selected : ''}`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              item: {
                                ...prev.item,
                                handlingTags: toggleChip(prev.item.handlingTags, label),
                              },
                            }))
                          }
                        >
                          <span>{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Attachments Card */}
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Attachments (Optional)</span>
                  </div>
                  <div className={styles.uploadBox}>
                    <div className={styles.uploadLeft}>
                      <UploadCloud className={styles.uploadIcon} />
                      <div>
                        <div className={styles.uploadTitle}>
                          Upload supporting documents (invoice, item photo, etc.)
                        </div>
                        <div className={styles.uploadSub}>JPG, PNG, PDF (Max 5 MB each)</div>
                      </div>
                    </div>
                    <label className={styles.browseBtn}>
                      Browse Files
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uploadedFiles.map((file, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                        >
                          <FileText size={13} /> {file}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.noticeBox}>
                  <ShieldCheck className={styles.noticeIcon} />
                  <span className={styles.noticeText}>
                    All items are inspected and secured in tamper-evident containers with verified chain-of-custody seals.
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.actionBtnRow}>
              <button type="button" className={styles.secondaryActionBtn} onClick={goBack}>
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button type="button" className={styles.primaryActionBtn} onClick={goNext}>
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 5: PACKAGING */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 5 && (
          <div>
            <div className={styles.desktopSplitLayout}>
              {/* Main Column: Packaging Types & Addon Protections */}
              <div className={styles.desktopColMain}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>1. Choose Packaging Type</span>
                  </div>

                  <div className={styles.packagingGrid}>
                    {options.packagingOptions
                      .filter((pkg) => pkg.id !== 'MY_OWN_PACKAGE')
                      .map((pkg) => {
                        const isSelected = formData.packaging.packagingType === pkg.id
                        return (
                          <div
                            key={pkg.id}
                            className={`${styles.packagingCard} ${isSelected ? styles.selected : ''}`}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                packaging: { ...prev.packaging, packagingType: pkg.id },
                              }))
                            }
                          >
                            <div className={styles.packagingTopRow}>
                              <Package size={24} color="#eab308" />
                              <div
                                className={`${styles.radioCircleOuter} ${
                                  isSelected ? styles.selected : ''
                                }`}
                              >
                                {isSelected && <div className={styles.radioCircleInner} />}
                              </div>
                            </div>

                            <div className="font-extrabold text-slate-900 text-sm mb-1">{pkg.name}</div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                              {pkg.description}
                            </p>

                            {pkg.badge && <span className={styles.packagingBadge}>{pkg.badge}</span>}
                          </div>
                        )
                      })}
                  </div>

                  {/* My Own Package wide card */}
                  <div
                    className={`${styles.ownPackagingCard} ${
                      formData.packaging.packagingType === 'MY_OWN_PACKAGE' ? styles.selected : ''
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        packaging: { ...prev.packaging, packagingType: 'MY_OWN_PACKAGE' },
                      }))
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Boxes size={24} color="#1e293b" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">My Own Package</div>
                        <div className="text-xs text-slate-500">I will pack using my own packaging.</div>
                      </div>
                    </div>
                    <div
                      className={`${styles.radioCircleOuter} ${
                        formData.packaging.packagingType === 'MY_OWN_PACKAGE' ? styles.selected : ''
                      }`}
                    >
                      {formData.packaging.packagingType === 'MY_OWN_PACKAGE' && (
                        <div className={styles.radioCircleInner} />
                      )}
                    </div>
                  </div>

                  <div className={styles.noticeBox}>
                    <ShieldCheck className={styles.noticeIcon} />
                    <span className={styles.noticeText}>
                      Our packaging is designed to keep your items safe throughout the journey.
                    </span>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>2. Add-on Protection (Optional)</span>
                  </div>

                  {options.addonProtections?.map((addon) => {
                    const isChecked = formData.packaging.addonProtections.includes(addon.id)
                    return (
                      <div key={addon.id} className={styles.addonRow}>
                        <div className={styles.addonLeft}>
                          <div>
                            <div className={styles.addonTitle}>{addon.name}</div>
                            <div className={styles.addonDesc}>{addon.description}</div>
                          </div>
                        </div>
                        <div className={styles.addonRight}>
                          <span className={styles.addonPrice}>+ ₹{addon.price}</span>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                setFormData((prev) => ({
                              ...prev,
                              packaging: {
                                ...prev.packaging,
                                addonProtections: toggleChip(
                                  prev.packaging.addonProtections,
                                  addon.id
                                ),
                              },
                            }))
                              }
                            />
                            <span className={styles.slider} />
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Side Column: Packaging Instructions & Preview */}
              <div className={styles.desktopColSide}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>3. Packaging Instructions (Optional)</span>
                  </div>
                  <textarea
                    className={styles.textareaField}
                    placeholder="Add any special packaging instructions..."
                    maxLength={250}
                    value={formData.packaging.packagingInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        packaging: { ...prev.packaging, packagingInstructions: e.target.value },
                      }))
                    }
                  />
                  <span className={styles.charCount}>
                    {formData.packaging.packagingInstructions.length}/250
                  </span>

                  <div className={styles.quickPillsRow}>
                    <span className={styles.quickPillsLabel}>Examples:</span>
                    {['Keep items upright', 'Do not stack', 'Fragile - Handle'].map((example) => (
                      <button
                        key={example}
                        type="button"
                        className={styles.quickPill}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            packaging: {
                              ...prev.packaging,
                              packagingInstructions: prev.packaging.packagingInstructions
                                ? `${prev.packaging.packagingInstructions}, ${example}`
                                : example,
                            },
                          }))
                        }
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>4. Packaging Preview</span>
                  </div>
                  <div className={styles.previewRow}>
                    <div className={styles.previewItem}>
                      <Package size={24} color="#ca8a04" />
                      <div>
                        <div className={styles.previewLabel}>Selected Packaging</div>
                        <div className={styles.previewVal}>
                          {options.packagingOptions.find(
                            (p) => p.id === formData.packaging.packagingType
                          )?.name || 'Standard Box'}
                        </div>
                      </div>
                    </div>

                    <div className={styles.previewItem}>
                      <Shield size={24} color="#10b981" />
                      <div>
                        <div className={styles.previewLabel}>Protection Level</div>
                        <div className={styles.previewVal}>Good</div>
                        <div className={styles.protectionBar} />
                      </div>
                    </div>

                    <div className={styles.previewItem}>
                      <CheckCircle2 size={24} color="#ca8a04" />
                      <div>
                        <div className={styles.previewLabel}>Suitable for</div>
                        <div className={styles.previewVal}>General Items</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.actionBtnRow}>
              <button type="button" className={styles.secondaryActionBtn} onClick={goBack}>
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button type="button" className={styles.primaryActionBtn} onClick={goNext}>
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 6: SECURITY */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 6 && (
          <div>
            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <span>Select Security Level</span>
              </div>

              <div className={styles.securityCardsRow}>
                {options.securityLevels.map((lvl) => {
                  const isSelected = formData.security.securityLevel === lvl.id
                  return (
                    <div
                      key={lvl.id}
                      className={`${styles.securityLevelCard} ${isSelected ? styles.selected : ''}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          security: { ...prev.security, securityLevel: lvl.id },
                        }))
                      }
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div
                          className={`${styles.radioCircleOuter} ${
                            isSelected ? styles.selected : ''
                          }`}
                        >
                          {isSelected && <div className={styles.radioCircleInner} />}
                        </div>
                        <Shield
                          size={26}
                          color={
                            lvl.id === 'MAXIMUM_SECURITY'
                              ? '#ef4444'
                              : lvl.id === 'ENHANCED_SECURITY'
                              ? '#10b981'
                              : '#eab308'
                          }
                        />
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm mb-1">{lvl.name}</div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        {lvl.description}
                      </p>
                      <span
                        className={`${styles.secBadgeOutline} ${
                          lvl.badgeType === 'green'
                            ? styles.secBadgeGreen
                            : lvl.badgeType === 'red'
                            ? styles.secBadgeRed
                            : styles.secBadgeYellow
                        }`}
                      >
                        {lvl.badge}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={styles.desktopSplitLayout}>
              {/* Main Column: Security Features */}
              <div className={styles.desktopColMain}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Security Features</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {options.securityFeatures?.map((feat) => {
                      const isChecked = formData.security.features[feat.id]
                      return (
                        <div key={feat.id} className={styles.addonRow}>
                          <div className={styles.addonLeft}>
                            <MapPin size={18} color="#ca8a04" />
                            <div>
                              <div className={styles.addonTitle}>{feat.label}</div>
                              <div className={styles.addonDesc}>{feat.description}</div>
                            </div>
                          </div>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  security: {
                                    ...prev.security,
                                    features: {
                                      ...prev.security.features,
                                      [feat.id]: !isChecked,
                                    },
                                  },
                                }))
                              }
                            />
                            <span className={styles.slider} />
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Side Column: Additional Instructions & Trust Badge */}
              <div className={styles.desktopColSide}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Additional Instructions (Optional)</span>
                  </div>
                  <textarea
                    className={styles.textareaField}
                    placeholder="Add any special security instructions..."
                    maxLength={250}
                    value={formData.security.additionalInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        security: { ...prev.security, additionalInstructions: e.target.value },
                      }))
                    }
                  />
                  <span className={styles.charCount}>
                    {formData.security.additionalInstructions.length}/250
                  </span>

                  <div className={styles.noticeBox}>
                    <ShieldCheck className={styles.noticeIcon} />
                    <span className={styles.noticeText}>
                      We follow strict security protocols to ensure your shipment is safe and delivered
                      with maximum confidentiality.
                    </span>
                  </div>

                  <div className={styles.trustFooter}>
                    <div className={styles.trustLeft}>
                      <Lock size={16} color="#eab308" />
                      <span>
                        Your data and documents are protected with bank-level encryption.
                      </span>
                    </div>
                    <div className={styles.nortonBadge}>
                      <CheckCircle2 size={14} color="#eab308" />
                      <span>Norton SECURED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.actionBtnRow}>
              <button type="button" className={styles.secondaryActionBtn} onClick={goBack}>
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button type="button" className={styles.primaryActionBtn} onClick={goNext}>
                <span>Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 7: VERIFICATION METHOD */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 7 && (
          <div>
            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <span>Select Verification Method</span>
              </div>

              {/* 2-column Grid on desktop */}
              <div className={styles.verificationGrid}>
                {options.verificationMethods.map((v) => {
                  const isSelected = formData.verification.verificationMethod === v.id
                  return (
                    <div
                      key={v.id}
                      className={`${styles.verificationRow} ${isSelected ? styles.selected : ''}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          verification: { ...prev.verification, verificationMethod: v.id },
                        }))
                      }
                    >
                      <div className={styles.verificationLeft}>
                        <div
                          className={`${styles.radioCircleOuter} ${
                            isSelected ? styles.selected : ''
                          }`}
                        >
                          {isSelected && <div className={styles.radioCircleInner} />}
                        </div>
                        <div className={styles.verificationIconBox}>
                          <User size={20} />
                        </div>
                        <div>
                          <div className={styles.verificationTitleRow}>
                            <span className={styles.verificationTitle}>{v.name}</span>
                            {v.badge && <span className={styles.badgeRecGreen}>{v.badge}</span>}
                          </div>
                          <div className={styles.verificationDesc}>{v.description}</div>
                        </div>
                      </div>

                      {v.note && (
                        <div className={styles.verificationRightNote}>
                          <span>{v.note}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className={styles.sectionHeading}>
                <span>Additional Options</span>
              </div>

              <div className={styles.additionalCheckboxesGrid}>
                <div
                  className={styles.checkboxCard}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      verification: {
                        ...prev.verification,
                        captureRecipientPhoto: !prev.verification.captureRecipientPhoto,
                      },
                    }))
                  }
                >
                  <div
                    className={`${styles.customCheck} ${
                      formData.verification.captureRecipientPhoto ? styles.checked : ''
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 flex-1">
                    Capture photo of recipient at the time of delivery (Recommended)
                  </span>
                </div>

                <div
                  className={styles.checkboxCard}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      verification: {
                        ...prev.verification,
                        captureIdPhoto: !prev.verification.captureIdPhoto,
                      },
                    }))
                  }
                >
                  <div
                    className={`${styles.customCheck} ${
                      formData.verification.captureIdPhoto ? styles.checked : ''
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 flex-1">
                    Capture photo of ID proof (if ID verification is selected)
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.actionBtnRow}>
              <button type="button" className={styles.secondaryActionBtn} onClick={goBack}>
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <button type="button" className={styles.primaryActionBtn} onClick={goNext}>
                <span>Save & Continue</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 8: REVIEW & CONFIRM */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 8 && (
          <div>
            <h1 className={styles.stepTitle}>Review & Confirm</h1>

            <div className={styles.reviewDesktopGrid}>
              {/* Main Column: Details */}
              <div className={styles.reviewMainCol}>
                {/* Shipment Summary */}
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Shipment Summary</span>
                  </div>

                  <div className={styles.reviewSummaryGrid}>
                    <div className={styles.reviewItemCol}>
                      <div className={styles.reviewItemLabel}>
                        <FileText size={14} color="#eab308" />
                        <span>Item Type</span>
                      </div>
                      <div className={styles.reviewItemVal}>{formData.item.itemName}</div>
                    </div>

                    <div className={styles.reviewItemCol}>
                      <div className={styles.reviewItemLabel}>
                        <Shield size={14} color="#eab308" />
                        <span>Security Level</span>
                      </div>
                      <div className={styles.reviewItemVal}>{quote.securityLevel}</div>
                    </div>

                    <div className={styles.reviewItemCol}>
                      <div className={styles.reviewItemLabel}>
                        <Package size={14} color="#eab308" />
                        <span>Packaging</span>
                      </div>
                      <div className={styles.reviewItemVal}>Vault Secure Envelope</div>
                    </div>
                  </div>

                  <div className={styles.reviewRouteRow}>
                    <div className={styles.reviewRouteNode}>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                        <MapPin size={13} />
                        <span>Pickup</span>
                      </div>
                      <div className={styles.reviewRouteTitle}>
                        {formData.pickup.companyName || formData.pickup.contactName}
                      </div>
                      <div className={styles.reviewRouteDesc}>{formData.pickup.completeAddress}</div>
                    </div>

                    <ArrowRight size={18} color="#94a3b8" />

                    <div className={styles.reviewRouteNode}>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                        <MapPin size={13} />
                        <span>Delivery</span>
                      </div>
                      <div className={styles.reviewRouteTitle}>
                        {formData.delivery.companyName || formData.delivery.contactName}
                      </div>
                      <div className={styles.reviewRouteDesc}>{formData.delivery.completeAddress}</div>
                    </div>
                  </div>
                </div>

                {/* Pickup & Delivery Timing */}
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Pickup & Delivery</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Calendar size={13} />
                        <span>Pickup Date & Time</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {formData.pickup.pickupDate}
                      </div>
                      <div className="text-xs text-slate-500">{formData.pickup.timeWindow}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Clock size={13} />
                        <span>Service Type</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {options.serviceTypes.find((s) => s.id === formData.serviceType)?.name ||
                          'Standard Delivery'}
                      </div>
                      <div className="text-xs text-slate-500">(Secure Handling)</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <ShieldCheck size={13} />
                        <span>Expected Delivery</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {formData.delivery.preferredDate}
                      </div>
                      <div className="text-xs text-slate-500">By 06:00 PM</div>
                    </div>
                  </div>
                </div>

                {/* Recipient */}
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Recipient</span>
                  </div>

                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <User size={22} />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formData.delivery.contactPerson || formData.delivery.contactName}
                        </div>
                        <div className="text-xs text-slate-500">{formData.delivery.email}</div>
                        <div className="text-xs text-slate-500">
                          +91 ***** {formData.delivery.mobileNumber.slice(-4)}
                        </div>
                        {formData.delivery.designation && (
                          <div className="text-xs font-semibold text-slate-700">
                            {formData.delivery.designation}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 mb-1">Verification Method</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {options.verificationMethods.find(
                            (v) => v.id === formData.verification.verificationMethod
                          )?.name || 'OTP Verification'}
                        </span>
                        <span className={styles.badgeRecGreen}>Recommended</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Additional Services</span>
                  </div>
                  <div className={styles.reviewBadgeGrid}>
                    {options.additionalServices.map((srv) => (
                      <div key={srv.id} className={styles.reviewBadgeItem}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{srv.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Column: Sticky Price Details, Terms, and Confirm Button */}
              <div className={styles.reviewStickyCol}>
                <div className={styles.card}>
                  <div className={styles.sectionHeading}>
                    <span>Price Details</span>
                  </div>

                  <div className={styles.priceGrid}>
                    <div className={styles.priceLeft}>
                      <div className={styles.priceLine}>
                        <span>Base Fare</span>
                        <span>₹{quote.baseFare.toFixed(2)}</span>
                      </div>
                      <div className={styles.priceLine}>
                        <span>Security & Handling</span>
                        <span>₹{quote.securityHandling.toFixed(2)}</span>
                      </div>
                      <div className={styles.priceLine}>
                        <span>Add-on Services</span>
                        <span>₹{quote.addOnServices.toFixed(2)}</span>
                      </div>
                      <div className={styles.priceLineTotal}>
                        <span>Total Amount</span>
                        <span className={styles.priceTotalVal}>₹{quote.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className={styles.priceRight}>
                      <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm mb-1">
                        <Shield size={16} color="#ca8a04" />
                        <span>100% Secure & Encrypted</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Your data and documents are protected with bank-level encryption.
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 cursor-pointer bg-white rounded-xl border border-slate-100 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }))
                    }
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    I have reviewed all details and agree to the{' '}
                    <span className="text-amber-600 font-bold underline">Terms & Conditions</span>
                  </span>
                </label>

                <button
                  type="button"
                  className={styles.primaryActionBtn}
                  disabled={submitting}
                  onClick={handleConfirmBooking}
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      <span>Processing Vault Security...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Confirm & Pay Securely</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 9: CONFIRMATION (CONFORM) */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 9 && createdBooking && (
          <div className={styles.confirmWrapper}>
            <div className={styles.confirmHero}>
              <div className={styles.glowingShield}>
                <CheckCircle2 size={48} color="#ca8a04" />
              </div>
              <h1 className={styles.confirmTitle}>Vault Created Successfully!</h1>
              <p className={styles.confirmSubtitle}>
                Your confidential shipment has been securely booked and is ready for pickup.
              </p>
            </div>

            <div className={styles.vaultIdCard}>
              <div className={styles.vaultIdLabel}>Vault ID</div>
              <div
                className={styles.vaultIdNumber}
                onClick={() => handleCopyId(createdBooking.vaultId)}
              >
                <span>{createdBooking.vaultId}</span>
                <Copy size={20} />
                {copied && <span className="text-xs text-emerald-600 font-normal">Copied!</span>}
              </div>

              <div className={styles.confirm3Cols}>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                    <Calendar size={14} color="#ca8a04" />
                    <span>Pickup Date</span>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {formData.pickup.pickupDate}
                  </div>
                  <div className="text-xs text-slate-500">{formData.pickup.timeWindow}</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                    <Shield size={14} color="#ca8a04" />
                    <span>Security Level</span>
                  </div>
                  <div className="font-extrabold text-rose-600 text-sm">High</div>
                  <div className="text-xs text-slate-500">Tamper Evident</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                    <Lock size={14} color="#ca8a04" />
                    <span>End-to-End</span>
                  </div>
                  <div className="font-extrabold text-emerald-600 text-sm">Encrypted</div>
                  <div className="text-xs text-slate-500">AES-256</div>
                </div>
              </div>
            </div>

            {/* What's Next Card */}
            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <span>What's Next?</span>
              </div>

              <div
                className={styles.nextStepItem}
                onClick={() => navigateTo(`/confidential-delivery/track/${createdBooking.vaultId}`)}
              >
                <div className={styles.nextStepLeft}>
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <User size={18} />
                  </div>
                  <span>Our trusted executive will pick up your package as scheduled.</span>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                className={styles.nextStepItem}
                onClick={() => navigateTo(`/confidential-delivery/track/${createdBooking.vaultId}`)}
              >
                <div className={styles.nextStepLeft}>
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <Shield size={18} />
                  </div>
                  <span>You can track your shipment in real-time inside Delivez Vault.</span>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>

            <div className={styles.confirmActionsRow}>
              <button
                type="button"
                className={styles.shareBtn}
                onClick={() => handleShareId(createdBooking.vaultId)}
              >
                <Share2 size={18} />
                <span>Share ID</span>
              </button>

              <button
                type="button"
                className={styles.trackBtn}
                onClick={() => navigateTo(`/confidential-delivery/track/${createdBooking.vaultId}`)}
              >
                <span>Track Shipment</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
