import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Wrench,
  ArrowRight,
  Bike,
  Building,
  Building2,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Crosshair,
  Diamond,
  FileText,
  Flag,
  Glasses,
  Headphones,
  HelpCircle,
  Home,
  Hotel,
  Key,
  Landmark,
  Laptop,
  Lightbulb,
  Lock,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Plug,
  Plus,
  QrCode,
  Receipt,
  Rocket,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smartphone,
  Truck,
  Upload,
  User,
  UserPlus,
  Users,
  Utensils,
  Wallet,
  Wine,
  X,
  Zap,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'
import {
  createForgotSomethingBooking,
  fetchForgotSomethingOptions,
  fetchForgotSomethingQuote,
  DEFAULT_FORGOT_SOMETHING_OPTIONS,
  fetchForgotSomethingReturnTypes,
  DEFAULT_RETURN_TYPES,
} from '@/features/forgot-something/services/forgotSomethingService.js'
import AuthModal from '@/features/auth/components/AuthModal.jsx'
import styles from './ForgotSomethingBookingPage.module.css'

const CATEGORY_ICONS = {
  KEYS: Key,
  LAPTOP: Laptop,
  PHONE: Smartphone,
  DOCUMENTS: FileText,
  BAG: ShoppingBag,
  CHARGER: Plug,
  WALLET: Wallet,
  GLASSES: Glasses,
  CLOTHING: Shirt,
  HEADPHONES: Headphones,
  BOOK_DIARY: FileText,
  OTHER: Package,
}

const LOCATION_ICONS = {
  HOME: Home,
  OFFICE: Building2,
  HOTEL: Hotel,
  RESTAURANT: Utensils,
  VEHICLE: Car,
  SOMEONES_PLACE: Users,
  OTHER: MapPin,
}


const RETURN_TYPE_ICONS = {
  RETURN_ITEM: RotateCcw,
  EXCHANGE_ITEM: RefreshCw,
  REPAIR_SERVICE: Wrench,
  WARRANTY_RETURN: ShieldCheck,
  RENTAL_RETURN: Clock,
  SEND_BACK_TO_SOMEONE: Users,
  OTHER_RETURN: HelpCircle,
}

const HANDOVER_ICONS = {
  RECEPTION: Building,
  SECURITY_GUARD: ShieldCheck,
  COLLEAGUE_STAFF: User,
  LOST_AND_FOUND: Package,
  SOMEONE_ELSE: Users,
  CUSTOM_CONTACT: UserPlus,
}

export default function ForgotSomethingBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [options, setOptions] = useState(DEFAULT_FORGOT_SOMETHING_OPTIONS)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Booking Form State strictly matching mobile screens
  const [formData, setFormData] = useState({
    // Step 1: Item Category
    itemCategory: 'BAG',

    // Step 2: Return Type
    returnType: 'RETURN_ITEM',

    // Step 2: Location Category
    locationType: 'OFFICE',

    // Step 3: Handover
    handoverType: 'RECEPTION',
    handoverCustomName: '',
    handoverCustomPhone: '',

    // Step 4: Pickup Location
    pickupFlatBuilding: 'Flat 402, Lotus Tower',
    pickupStreet: 'Golf Course Road',
    pickupArea: 'Sector 42',
    pickupCity: 'Gurugram',
    pickupState: 'Haryana',
    pickupPostalCode: '122002',
    pickupContactName: 'Reception Desk',
    pickupPhoneNumber: '9876543210',
    pickupLandmark: 'Opposite Metro Station',

    // Step 5: Deliver To
    dropoffAddressType: 'Home',
    dropoffAddressLine1: '123, MG Road, Bangalore, Karnatak',
    dropoffRecipientName: 'Rohan Sharma',
    dropoffPhoneNumber: '9876543210',
    dropoffLandmark: 'Near Trinity Metro',

    // Step 6: Schedule & Service
    deliverySpeed: 'INSTANT', // 'INSTANT', 'EXPRESS', 'SAME_DAY', 'PRECISE_TIME'
    scheduledDate: '24',
    scheduledTimeSlot: '10:00 AM - 11:00 AM',

    // Step 7: Item Details
    itemName: 'Black Laptop Bag',
    itemDescription: 'Left behind in cab on the way',
    itemBrandColor: 'Safari / Black',
    itemQuantity: 1,
    declaredValue: '2500',
    itemTags: ['Urgent'],
    itemPhotoUrl: null,
    itemPhotoPreview: null,

    // Step 8: Secure Handling & Verification (5 exact toggles from Screen 13)
    pickupOtpRequired: true,
    deliveryOtpRequired: true,
    photoAtPickup: false,
    photoAtDelivery: true,
    tamperProofPackaging: true,

    // Step 9: Payment
    paymentMethod: 'WALLET', // 'WALLET', 'UPI', 'CARD', 'NET_BANKING'
    termsAgreed: true,
  })

  // Pricing State matching reference Screen 14/15
  const [quote, setQuote] = useState({
    retrievalFee: 149.0,
    deliveryFee: 129.0,
    secureHandlingFee: 39.0,
    taxAmount: 23.02,
    totalAmount: 340.02,
  })

  useEffect(() => {
    fetchForgotSomethingOptions()
      .then((opts) => {
        if (opts) setOptions(opts)
      })
      .catch(() => {})

    fetchForgotSomethingReturnTypes()
      .then((rt) => {
        if (Array.isArray(rt) && rt.length > 0) {
          setOptions((prev) => ({ ...prev, returnTypes: rt }))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchForgotSomethingQuote({
      speed: formData.deliverySpeed,
      tamperProofPackaging: formData.tamperProofPackaging,
      declaredValue: Number(formData.declaredValue) || 0,
    })
      .then((res) => {
        if (res) {
          setQuote({
            retrievalFee: Number(res.retrievalFee) || 149.0,
            deliveryFee: Number(res.deliveryFee) || 129.0,
            secureHandlingFee: Number(res.secureHandlingFee) || (formData.tamperProofPackaging ? 39.0 : 0.0),
            taxAmount: Number(res.taxAmount) || 23.02,
            totalAmount: Number(res.totalAmount) || 340.02,
          })
        }
      })
      .catch(() => {})
  }, [formData.deliverySpeed, formData.tamperProofPackaging, formData.declaredValue])

  const updateField = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }))
  }

  const toggleTag = (tag) => {
    setFormData((prev) => {
      const exists = prev.itemTags.includes(tag)
      return {
        ...prev,
        itemTags: exists ? prev.itemTags.filter((t) => t !== tag) : [...prev.itemTags, tag],
      }
    })
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setFormData((prev) => ({
      ...prev,
      itemPhotoPreview: preview,
      itemPhotoUrl: preview,
    }))
  }

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateField('pickupArea', 'Sector 42')
          updateField('pickupCity', 'Gurugram')
          updateField('pickupPostalCode', '122002')
        },
        () => {
          alert('Location access was denied. You can enter your pickup address manually.')
        }
      )
    }
  }

  const handleNext = () => {
    setErrorMsg('')
    if (currentStep === 2) {
      if (!formData.returnType) {
        setErrorMsg('Please select a return type to continue.')
        return
      }
    }
    if (currentStep === 5) {
      if (!formData.pickupFlatBuilding || !formData.pickupStreet || !formData.pickupCity || !formData.pickupPostalCode) {
        setErrorMsg('Please fill in Flat/Building, Street, City, and Pincode.')
        return
      }
      if (!formData.pickupContactName || !formData.pickupPhoneNumber) {
        setErrorMsg('Please enter Contact Person Name and Phone Number.')
        return
      }
    }
    if (currentStep === 6) {
      if (!formData.dropoffAddressLine1 || !formData.dropoffRecipientName || !formData.dropoffPhoneNumber) {
        setErrorMsg('Please fill in Delivery Address, Recipient Name, and Phone Number.')
        return
      }
    }
    if (currentStep === 8) {
      if (!formData.itemName.trim()) {
        setErrorMsg('Please enter the Item Name.')
        return
      }
    }
    setCurrentStep((prev) => Math.min(11, prev + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setErrorMsg('')
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConfirmAndBook = async () => {
    if (!formData.termsAgreed) {
      setErrorMsg('Please agree to the Terms & Conditions and Privacy Policy.')
      return
    }

    const token = getUserAccessToken()
    if (!token) {
      setAuthModalOpen(true)
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const idempotencyKey = 'fetch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
      const payload = {
        returnType: formData.returnType || 'RETURN_ITEM',
        itemCategory: formData.itemCategory,
        itemName: formData.itemName || 'Forgotten Item',
        itemDescription: formData.itemDescription || '',
        itemBrandColor: formData.itemBrandColor || '',
        itemQuantity: Number(formData.itemQuantity) || 1,
        declaredValue: Number(formData.declaredValue) || 0,
        itemTags: formData.itemTags,
        itemPhotoUrl: formData.itemPhotoUrl,

        locationType: formData.locationType,
        handoverType: formData.handoverType,
        handoverCustomName: formData.handoverCustomName,
        handoverCustomPhone: formData.handoverCustomPhone,

        pickup: {
          flatBuilding: formData.pickupFlatBuilding,
          street: formData.pickupStreet,
          area: formData.pickupArea,
          city: formData.pickupCity,
          state: formData.pickupState,
          postalCode: formData.pickupPostalCode,
          contactName: formData.pickupContactName,
          phoneNumber: formData.pickupPhoneNumber,
          landmark: formData.pickupLandmark,
        },

        dropoff: {
          addressType: formData.dropoffAddressType,
          addressLine1: formData.dropoffAddressLine1,
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          recipientName: formData.dropoffRecipientName,
          phoneNumber: formData.dropoffPhoneNumber,
          landmark: formData.dropoffLandmark,
        },

        speed: formData.deliverySpeed,
        scheduledDate: formData.scheduledDate,
        scheduledTimeSlot: formData.scheduledTimeSlot,

        pickupOtpRequired: formData.pickupOtpRequired,
        deliveryOtpRequired: formData.deliveryOtpRequired,
        photoAtPickup: formData.photoAtPickup,
        photoAtDelivery: formData.photoAtDelivery,
        tamperProofPackaging: formData.tamperProofPackaging,

        paymentMethod: formData.paymentMethod,
      }

      const created = await createForgotSomethingBooking(payload, idempotencyKey)
      setConfirmedBooking(created)
      setCurrentStep(11) // Screen 16: Booking Confirmed
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to place booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Selected Category Icon
  const SelectedCategoryIcon = CATEGORY_ICONS[formData.itemCategory] || Package

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.desktopContainer}>
        {/* ================================================================ */}
        {/* Top App Header Card                                              */}
        {/* ================================================================ */}
        <header className={styles.topNavCard}>
          <div className={styles.navLeft}>
            <button
              type="button"
              className={styles.headerBtn}
              onClick={() => (currentStep > 1 && currentStep < 11 ? handleBack() : navigateTo('/'))}
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className={styles.brandGroup}>
              <span className={styles.brandTitle}>
                DELIVE<span className={styles.brandYellowZ}>Z</span>
              </span>
              {currentStep <= 3 ? (
                <span className={styles.brandSubtitle}>FETCH</span>
              ) : (
                <span className={styles.brandSubBlack}>DELIVERING PROMISES</span>
              )}
            </div>
          </div>

          <div className={styles.navRight}>
            <div className={styles.stepBadge}>
              <Clock size={14} />
              <span>Step {currentStep} of 11</span>
            </div>

            <button
              type="button"
              className={styles.headerBtn}
              onClick={() => alert('Delivez Fetch Help: We quickly retrieve forgotten items from anywhere and bring them to you.')}
              title="Help & Information"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </header>

        {/* ================================================================ */}
        {/* 5-Step Horizontal Stepper (Screens 1 to 5)                       */}
        {/* ================================================================ */}
        {currentStep <= 6 && (
          <div className={styles.stepperCard}>
            {[
              { num: 1, title: 'Item Category' },
              { num: 2, title: 'Return Type' },
              { num: 3, title: 'Location Type' },
              { num: 4, title: 'Handover Mode' },
              { num: 5, title: 'Pickup Details' },
              { num: 6, title: 'Delivery Destination' },
            ].map(({ num: stepNum, title: stepTitle }, idx) => {
              const isCompleted = currentStep > stepNum
              const isActive = currentStep === stepNum
              return (
                <React.Fragment key={stepNum}>
                  <div
                    className={styles.stepperItem}
                    onClick={() => {
                      if (stepNum < currentStep) setCurrentStep(stepNum)
                    }}
                  >
                    <div
                      className={`${styles.stepCircle} ${isActive ? styles.stepCircleActive : ''} ${
                        isCompleted ? styles.stepCircleCompleted : ''
                      }`}
                    >
                      {isCompleted ? <Check size={14} strokeWidth={3} /> : stepNum}
                    </div>
                    <span className={styles.stepTitleDesktop}>{stepTitle}</span>
                  </div>
                  {idx < 5 && (
                    <div
                      className={`${styles.stepLine} ${currentStep > stepNum ? styles.stepLineCompleted : ''}`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div style={{ padding: '12px 18px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 16, color: '#dc2626', fontSize: '0.9rem', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        {/* ================================================================ */}
        {/* Main Content Layout: Split Grid (Steps 1-9) or Confirmed (Step 10)*/}
        {/* ================================================================ */}
        {currentStep < 11 ? (
          <div className={styles.splitGrid}>
            <div className={styles.formPanelCard}>
              {/* -------------------------------------------------------------- */}
              {/* STEP 1: What did you forget? (Screens 1 & 2)                  */}
              {/* -------------------------------------------------------------- */}
              {currentStep === 1 && (
                <>
                  <div className={styles.screenTitleBlock}>
                    <h1 className={styles.screenTitle}>What did you forget?</h1>
                    <div className={styles.titleUnderlineYellow} />
                    <p className={styles.screenSubtitle}>Select the item you want us to fetch.</p>
                  </div>

              <div className={styles.itemCategoryGrid}>
                {options.itemCategories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id] || Package
                  const isSelected = formData.itemCategory === cat.id
                  return (
                    <div
                      key={cat.id}
                      className={`${styles.categoryCard} ${isSelected ? styles.categoryCardSelected : ''}`}
                      onClick={() => updateField('itemCategory', cat.id)}
                    >
                      <div className={styles.categoryIconPill}>
                        <Icon size={24} />
                      </div>
                      <span className={styles.categoryLabel}>{cat.name}</span>
                    </div>
                  )
                })}
              </div>

              <div className={styles.yellowTrustCard}>
                <Shield size={28} color="#0f172a" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4>We've got you covered!</h4>
                  <p>Our verified partners will securely pick up your item and bring it safely to you.</p>
                </div>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Package size={26} color="#0f172a" />
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000000',
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                </div>
              </div>
            </>
          )}

          
          {/* -------------------------------------------------------------- */}
          {/* STEP 2: Return Type Options                                    */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 2 && (
            <>
              <div className={styles.screenTitleBlock}>
                <h1 className={styles.screenTitle}>Select Return Type</h1>
                <div className={styles.titleUnderlineYellow} />
                <p className={styles.screenSubtitle}>Choose the reason for sending or returning this forgotten item.</p>
              </div>

              <div className={styles.returnTypeStack}>
                {(options.returnTypes || DEFAULT_RETURN_TYPES).map((rt) => {
                  const Icon = RETURN_TYPE_ICONS[rt.code] || RotateCcw
                  const isSelected = formData.returnType === rt.code
                  return (
                    <div
                      key={rt.code}
                      className={`${styles.returnTypeCard} ${isSelected ? styles.returnTypeCardSelected : ''}`}
                      onClick={() => updateField('returnType', rt.code)}
                    >
                      <div className={styles.returnTypeLeft}>
                        <div className={styles.returnTypeIconPill}>
                          <Icon size={20} />
                        </div>
                        <div className={styles.returnTypeText}>
                          <h4>{rt.title}</h4>
                          <p>{rt.description}</p>
                        </div>
                      </div>

                      <div className={styles.returnTypeRadio}>
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={styles.yellowTrustCard}>
                <Shield size={28} color="#0f172a" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4>Safe & Verified Returns</h4>
                  <p>Our verified partners securely collect your item and hand it over with live tracking and proof.</p>
                </div>
              </div>
            </>
          )}

          {/* -------------------------------------------------------------- */}
          {/* STEP 3: Where is your item? (Screens 3 & 4)                   */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 3 && (
            <>
              <div className={styles.screenTitleBlock}>
                <h1 className={styles.screenTitle}>Where is your item?</h1>
                <div className={styles.titleUnderlineYellow} />
                <p className={styles.screenSubtitle}>Let us know the exact location where we should pick up your item.</p>
              </div>

              <div className={styles.locationGrid}>
                {options.locationTypes.map((loc) => {
                  const Icon = LOCATION_ICONS[loc.id] || Home
                  const isSelected = formData.locationType === loc.id
                  const isFull = loc.id === 'OTHER'
                  return (
                    <div
                      key={loc.id}
                      className={`${styles.locationCard} ${isFull ? styles.locationCardFull : ''} ${
                        isSelected ? styles.locationCardSelected : ''
                      }`}
                      onClick={() => updateField('locationType', loc.id)}
                    >
                      {isSelected && (
                        <div className={styles.selectedBadgeCheck}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      <div className={styles.locationIconPill}>
                        <Icon size={22} color={loc.id === 'OTHER' ? '#dc2626' : '#0f172a'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className={styles.locationTitle}>{loc.name}</div>
                        <div className={styles.locationDesc}>{loc.description}</div>
                      </div>
                      <ChevronRight size={18} className={styles.locationChevron} />
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* -------------------------------------------------------------- */}
          {/* STEP 4: Who can hand it over? (Screens 5 & 6)                 */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 4 && (
            <>
              <div className={styles.screenTitleBlock}>
                <h1 className={styles.screenTitle}>Who can hand it over?</h1>
                <div className={styles.titleUnderlineYellow} />
                <p className={styles.screenSubtitle}>We'll coordinate with the person at the pickup location to collect your item.</p>
              </div>

              <div className={styles.handoverStack}>
                {options.handoverOptions.map((h) => {
                  const Icon = HANDOVER_ICONS[h.id] || User
                  const isSelected = formData.handoverType === h.id
                  return (
                    <div
                      key={h.id}
                      className={`${styles.handoverCard} ${isSelected ? styles.handoverCardSelected : ''}`}
                      onClick={() => updateField('handoverType', h.id)}
                    >
                      <div className={styles.handoverLeft}>
                        <div className={styles.locationIconPill}>
                          <Icon size={20} />
                        </div>
                        <div className={styles.handoverText}>
                          <h4>{h.name}</h4>
                          <p>{h.description}</p>
                        </div>
                      </div>

                      {h.id === 'CUSTOM_CONTACT' ? (
                        <ChevronRight size={18} color="#94a3b8" />
                      ) : (
                        <div className={`${styles.radioOuter} ${isSelected ? styles.radioOuterActive : ''}`}>
                          {isSelected && <div className={styles.radioInnerDot} />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className={styles.yellowTrustCard}>
                <Shield size={26} color="#0f172a" />
                <div style={{ flex: 1 }}>
                  <h4>Your item is safe with us</h4>
                  <p>Our handoff protocol ensures verified, secure retrieval every step of the way.</p>
                </div>
                <Smartphone size={24} color="#0f172a" />
              </div>
            </>
          )}

          {/* -------------------------------------------------------------- */}
          {/* STEP 5: Pickup Location (Screens 7 & 8)                       */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 5 && (
            <>
              <div className={styles.screenTitleBlock}>
                <h1 className={styles.screenTitle}>
                  Pickup <span style={{ color: '#dc2626' }}>Location</span>
                </h1>
                <div className={styles.titleUnderlineRed} />
                <p className={styles.screenSubtitle}>Tell us where the forgotten item is.</p>
              </div>

              {/* Use current location button */}
              <div className={styles.useLocationBtn} onClick={handleDetectLocation}>
                <div className={styles.useLocationLeft}>
                  <div className={styles.targetIconRed}>
                    <Crosshair size={20} />
                  </div>
                  <div>
                    <strong>Use current location</strong>
                    <span>Detect my location automatically.</span>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              {/* Mini Location Preview Snippet */}
              <div className={styles.locationPreviewCard}>
                <div className={styles.miniMapPreview}>
                  <div className={styles.miniMapRoad} />
                  <div className={styles.miniMapCrossRoad} />
                  <MapPin size={24} color="#dc2626" fill="#dc2626" style={{ position: 'relative', zIndex: 3 }} />
                </div>
                <div className={styles.previewText}>
                  <strong>Location Preview</strong>
                  <span>{formData.pickupArea || 'Sector 42'}, {formData.pickupCity || 'Gurugram'}, {formData.pickupState || 'Haryana'} {formData.pickupPostalCode || '122002'}</span>
                </div>
              </div>

              {/* 8 Pickup Fields matching Screen 7 & 8 */}
              <div className={styles.fieldPillRow}>
                <Building2 size={18} color="#0f172a" />
                <input
                  type="text"
                  placeholder="Flat / Building / House No."
                  value={formData.pickupFlatBuilding}
                  onChange={(e) => updateField('pickupFlatBuilding', e.target.value)}
                />
              </div>

              <div className={styles.fieldPillRow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, lineHeight: 1 }}>!|!</span>
                </div>
                <input
                  type="text"
                  placeholder="Street / Road"
                  value={formData.pickupStreet}
                  onChange={(e) => updateField('pickupStreet', e.target.value)}
                />
              </div>

              <div className={styles.fieldPillRow}>
                <MapPin size={18} color="#0f172a" />
                <input
                  type="text"
                  placeholder="Area / Locality"
                  value={formData.pickupArea}
                  onChange={(e) => updateField('pickupArea', e.target.value)}
                />
              </div>

              <div className={styles.fieldPillRow}>
                <Building size={18} color="#0f172a" />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.pickupCity}
                  onChange={(e) => updateField('pickupCity', e.target.value)}
                />
              </div>

              <div className={styles.fieldPillRow}>
                <MapPin size={18} color="#0f172a" />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.pickupPostalCode}
                  onChange={(e) => updateField('pickupPostalCode', e.target.value)}
                />
              </div>

              <div className={styles.fieldPillRow}>
                <User size={18} color="#0f172a" />
                <input
                  type="text"
                  placeholder="Contact Person Name"
                  value={formData.pickupContactName}
                  onChange={(e) => updateField('pickupContactName', e.target.value)}
                />
              </div>

              <div className={styles.fieldPillRow}>
                <Phone size={18} color="#0f172a" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.pickupPhoneNumber}
                  onChange={(e) => updateField('pickupPhoneNumber', e.target.value)}
                />
              </div>

              <div className={styles.fieldPillRow}>
                <Flag size={18} color="#0f172a" />
                <input
                  type="text"
                  placeholder="Landmark (Optional)"
                  value={formData.pickupLandmark}
                  onChange={(e) => updateField('pickupLandmark', e.target.value)}
                />
              </div>
            </>
          )}

          {/* -------------------------------------------------------------- */}
          {/* STEP 5: Deliver To (Screen 9)                                 */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 5 && (
            <>
              <div className={styles.deliverToHeaderRow}>
                <div className={styles.screenTitleBlock}>
                  <h1 className={styles.screenTitle}>Deliver To</h1>
                  <div className={styles.titleUnderlineRed} />
                  <p className={styles.screenSubtitleYellow}>Where should we bring your item?</p>
                </div>
                <div style={{ position: 'relative', width: 90, height: 75, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={38} color="#f59e0b" />
                  <MapPin size={34} color="#dc2626" fill="#dc2626" style={{ position: 'absolute', top: 0, left: 10 }} />
                </div>
              </div>

              {/* 4 Address Type Pills */}
              <div className={styles.addressTypeRow}>
                {[
                  { id: 'Home', label: 'Home', icon: Home },
                  { id: 'Office', label: 'Office', icon: Building2 },
                  { id: 'Friend / Family', label: 'Friend /\nFamily', icon: Users },
                  { id: 'Custom Address', label: 'Custom\nAddress', icon: MapPin },
                ].map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.dropoffAddressType === type.id
                  return (
                    <div
                      key={type.id}
                      className={`${styles.addressTypeBtn} ${isSelected ? styles.addressTypeBtnSelected : ''}`}
                      onClick={() => updateField('dropoffAddressType', type.id)}
                    >
                      {isSelected && (
                        <div className={styles.addressTypeCheckRed}>
                          <Check size={9} strokeWidth={3} />
                        </div>
                      )}
                      <Icon size={20} color="#0f172a" />
                      <span className={styles.addressTypeLabel}>{type.label}</span>
                    </div>
                  )
                })}
              </div>

              {/* Address Details Card */}
              <div className={styles.addressDetailCard}>
                <div className={styles.detailFieldBlock}>
                  <MapPin size={20} color="#0f172a" style={{ marginTop: 2 }} />
                  <div className={styles.fieldContent}>
                    <span className={styles.fieldLabelSmall}>Delivery Address</span>
                    <input
                      type="text"
                      placeholder="123, MG Road, Bangalore, Karnatak"
                      value={formData.dropoffAddressLine1}
                      onChange={(e) => updateField('dropoffAddressLine1', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.detailFieldBlock}>
                  <User size={20} color="#0f172a" style={{ marginTop: 2 }} />
                  <div className={styles.fieldContent}>
                    <span className={styles.fieldLabelSmall}>Recipient Name</span>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={formData.dropoffRecipientName}
                      onChange={(e) => updateField('dropoffRecipientName', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.detailFieldBlock}>
                  <Phone size={20} color="#0f172a" style={{ marginTop: 2 }} />
                  <div className={styles.fieldContent}>
                    <span className={styles.fieldLabelSmall}>Phone Number</span>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.dropoffPhoneNumber}
                      onChange={(e) => updateField('dropoffPhoneNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.detailFieldBlock}>
                  <Building size={20} color="#0f172a" style={{ marginTop: 2 }} />
                  <div className={styles.fieldContent}>
                    <span className={styles.fieldLabelSmall}>Landmark (Optional)</span>
                    <input
                      type="text"
                      placeholder="Nearby landmark for easy delivery"
                      value={formData.dropoffLandmark}
                      onChange={(e) => updateField('dropoffLandmark', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.redSecurityBanner}>
                <Lock size={18} />
                <span>Secure handoff and verified delivery</span>
              </div>
            </>
          )}

          {/* -------------------------------------------------------------- */}
          {/* STEP 7: Schedule & Service (Screens 10 & 11)                   */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 7 && (
            <>
              <div className={styles.screenTitleBlock}>
                <h1 className={styles.screenTitle}>
                  Schedule & <span style={{ color: '#f59e0b' }}>Service</span>
                </h1>
                <div className={styles.titleUnderlineRed} />
                <p className={styles.screenSubtitle}>Choose how quickly you need it delivered.</p>
              </div>

              <strong style={{ fontSize: '0.92rem', fontWeight: 800 }}>Choose Pickup Speed</strong>

              {/* Pickup Speed Cards */}
              <div className={styles.speedScrollRow}>
                {[
                  { id: 'INSTANT', title: 'Instant\nPickup', eta: '15–30 mins', price: 'From ₹149', icon: Bike },
                  { id: 'EXPRESS', title: 'Express', eta: '30–60 mins', price: 'From ₹119', icon: Rocket },
                  { id: 'SAME_DAY', title: 'Same-Day', eta: '2–6 hrs', price: 'From ₹89', icon: Truck },
                  { id: 'PRECISE_TIME', title: 'Precise\nTime Delivery', eta: 'Select Time', price: 'From ₹99', icon: Clock },
                ].map((s) => {
                  const Icon = s.icon
                  const isSelected = formData.deliverySpeed === s.id
                  return (
                    <div
                      key={s.id}
                      className={`${styles.speedCard} ${isSelected ? styles.speedCardSelected : ''}`}
                      onClick={() => updateField('deliverySpeed', s.id)}
                    >
                      {isSelected && (
                        <div className={styles.selectedBadgeCheck} style={{ background: '#dc2626', color: '#ffffff' }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      <Icon size={24} color="#dc2626" />
                      <div className={styles.speedTitle}>{s.title}</div>
                      <div className={styles.speedEtaYellow}>{s.eta}</div>
                      <div className={styles.speedPrice}>{s.price}</div>
                    </div>
                  )
                })}
              </div>

              {/* Schedule Box */}
              <div className={styles.scheduleBoxCard}>
                <h4>Select Pickup Date & Time</h4>

                <div>
                  <small style={{ color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6 }}>Pickup Date</small>
                  <div className={styles.datePillsRow}>
                    {[
                      { day: 'Today', num: '24' },
                      { day: 'Sat', num: '25' },
                      { day: 'Sun', num: '26' },
                      { day: 'Mon', num: '27' },
                      { day: 'Tue', num: '28' },
                    ].map((d) => {
                      const isSelected = formData.scheduledDate === d.num
                      return (
                        <div
                          key={d.num}
                          className={`${styles.datePill} ${isSelected ? styles.datePillSelected : ''}`}
                          onClick={() => updateField('scheduledDate', d.num)}
                        >
                          <span className={styles.dateDayName}>{d.day}</span>
                          <span className={styles.dateDayNum}>{d.num}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <small style={{ color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6 }}>Pickup Time</small>
                  <div className={styles.timeSlotsRow}>
                    {[
                      { title: 'ASAP', desc: 'As soon as possible' },
                      { title: '9:00 AM', desc: '– 10:00 AM' },
                      { title: '10:00 AM', desc: '– 11:00 AM' },
                      { title: '11:00 AM', desc: '– 12:00 PM' },
                    ].map((t) => {
                      const slotVal = `${t.title} ${t.desc}`
                      const isSelected = formData.scheduledTimeSlot === slotVal || (t.title === '10:00 AM' && formData.scheduledTimeSlot.includes('10:00 AM'))
                      return (
                        <div
                          key={t.title}
                          className={`${styles.timeSlotPill} ${isSelected ? styles.timeSlotPillSelected : ''}`}
                          onClick={() => updateField('scheduledTimeSlot', slotVal)}
                        >
                          {isSelected && (
                            <div className={styles.selectedBadgeCheck} style={{ top: 4, right: 4, width: 14, height: 14, background: '#dc2626', color: '#ffffff' }}>
                              <Check size={8} strokeWidth={3} />
                            </div>
                          )}
                          <span className={styles.timeSlotTitle}>{t.title}</span>
                          <span className={styles.timeSlotDesc}>{t.desc}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.redCommitmentCard}>
                <div className={styles.shieldYellowCircle}>
                  <ShieldCheck size={24} color="#f59e0b" />
                </div>
                <div>
                  <h4>Fast retrieval, on time.</h4>
                  <p>We're committed to getting your items back to you—fast and reliably.</p>
                </div>
              </div>
            </>
          )}

          {/* -------------------------------------------------------------- */}
          {/* STEP 8: Item Details (Screen 12)                              */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 8 && (
            <>
              <div className={styles.screenTitleBlock}>
                <h1 className={styles.screenTitle}>Item Details</h1>
                <div className={styles.titleUnderlineRed} />
                <p className={styles.screenSubtitle}>Help us identify the forgotten item.</p>
              </div>

              <div className={styles.itemDetailsCard}>
                <div className={styles.itemDetailTopGrid}>
                  <div className={styles.itemInputsCol}>
                    <div className={styles.detailInputGroup}>
                      <label>Item Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Black Laptop Bag"
                        value={formData.itemName}
                        onChange={(e) => updateField('itemName', e.target.value)}
                      />
                    </div>

                    <div className={styles.detailInputGroup}>
                      <label>Short Description</label>
                      <input
                        type="text"
                        placeholder="e.g., Left behind in cab on the way"
                        value={formData.itemDescription}
                        onChange={(e) => updateField('itemDescription', e.target.value)}
                      />
                    </div>

                    <div className={styles.detailInputGroup}>
                      <label>Brand / Color (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., Safari / Black"
                        value={formData.itemBrandColor}
                        onChange={(e) => updateField('itemBrandColor', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.itemPreviewCol}>
                    <small style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>Item Preview</small>
                    <div className={styles.previewBoxSquare}>
                      {formData.itemPhotoPreview ? (
                        <img src={formData.itemPhotoPreview} alt="Item" className={styles.previewUploadedImg} />
                      ) : (
                        <SelectedCategoryIcon size={40} color="#f59e0b" strokeWidth={1.8} />
                      )}
                    </div>

                    <small style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>Upload Photo</small>
                    <label className={styles.uploadPhotoBox}>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                      <Upload size={20} color="#dc2626" />
                      <strong>Tap to upload</strong>
                      <span>JPG, PNG up to 5MB</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className={styles.detailInputGroup}>
                    <label>Quantity</label>
                    <select
                      value={formData.itemQuantity}
                      onChange={(e) => updateField('itemQuantity', Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 10].map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.detailInputGroup}>
                    <label>Approx. Value (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g., 2500"
                      value={formData.declaredValue}
                      onChange={(e) => updateField('declaredValue', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 750, color: '#0f172a', display: 'block', marginBottom: 8 }}>
                    Item Tags (Optional)
                  </label>
                  <div className={styles.tagsRow}>
                    {[
                      { label: 'Fragile', icon: Wine },
                      { label: 'High Value', icon: Diamond },
                      { label: 'Urgent', icon: Zap },
                      { label: 'Small Item', icon: Package },
                    ].map((tag) => {
                      const Icon = tag.icon
                      const isSelected = formData.itemTags.includes(tag.label)
                      return (
                        <div
                          key={tag.label}
                          className={`${styles.tagPill} ${isSelected ? styles.tagPillSelected : ''}`}
                          onClick={() => toggleTag(tag.label)}
                        >
                          <Icon size={14} color={isSelected ? '#b45309' : '#0f172a'} />
                          <span>{tag.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.tipCard}>
                  <Lightbulb size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Tip:</strong> Clear details help us retrieve your item faster.
                  </span>
                </div>
              </div>
            </>
          )}

          {/* -------------------------------------------------------------- */}
          {/* STEP 9: Secure Handling & Verification (Screen 13)            */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 9 && (
            <>
              <div className={styles.screenTitleBlock}>
                <h1 className={styles.screenTitle}>
                  Secure Handling <span style={{ color: '#f59e0b' }}>& Verification</span>
                </h1>
                <div className={styles.titleUnderlineRed} />
                <p className={styles.screenSubtitle}>Choose safety options for retrieval and delivery.</p>
              </div>

              <div className={styles.redSecurityBanner}>
                <Lock size={18} />
                <span>Your items are handled securely from pickup to handoff.</span>
              </div>

              {/* 5 Exact Toggles from Screen 13 */}
              {[
                {
                  key: 'pickupOtpRequired',
                  title: 'Pickup OTP Verification',
                  desc: 'Verify identity during pickup.',
                  icon: Smartphone,
                  color: '#2563eb',
                },
                {
                  key: 'deliveryOtpRequired',
                  title: 'Delivery OTP Verification',
                  desc: 'Verify identity during delivery.',
                  icon: Smartphone,
                  color: '#f59e0b',
                },
                {
                  key: 'photoAtPickup',
                  title: 'Photo at Pickup',
                  desc: 'Capture photo at the time of pickup.',
                  icon: Camera,
                  color: '#dc2626',
                },
                {
                  key: 'photoAtDelivery',
                  title: 'Photo at Delivery',
                  desc: 'Capture photo at the time of delivery.',
                  icon: Camera,
                  color: '#f59e0b',
                },
                {
                  key: 'tamperProofPackaging',
                  title: 'Tamper-proof Packaging',
                  desc: 'Secure tamper-evident packaging.',
                  icon: PackageCheck,
                  color: '#dc2626',
                },
              ].map((t) => {
                const Icon = t.icon
                const isActive = Boolean(formData[t.key])
                return (
                  <div key={t.key} className={styles.toggleRowCard}>
                    <div className={styles.toggleLeft}>
                      <div className={styles.locationIconPill}>
                        <Icon size={20} color={t.color} />
                      </div>
                      <div>
                        <h4>{t.title}</h4>
                        <p>{t.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`${styles.switchToggle} ${isActive ? styles.switchToggleActive : ''}`}
                      onClick={() => updateField(t.key, !isActive)}
                    >
                      <div className={`${styles.switchKnob} ${isActive ? styles.switchKnobActive : ''}`} />
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* -------------------------------------------------------------- */}
          {/* STEP 9: Review & Pay (Screens 14 & 15)                         */}
          {/* -------------------------------------------------------------- */}
          {currentStep === 9 && (
            <>
              <div className={styles.screenTitleBlock}>
                <h1 className={styles.screenTitle}>
                  Review <span style={{ color: '#f59e0b' }}>& Pay</span>
                </h1>
                <div className={styles.titleUnderlineRed} />
                <p className={styles.screenSubtitle}>Check your retrieval order before booking.</p>
              </div>

              {/* Order Summary Card */}
              <div className={styles.reviewSummaryCard}>
                <div className={styles.reviewItemRow}>
                  <ShoppingBag size={20} color="#dc2626" />
                  <div className={styles.reviewItemContent}>
                    <small style={{ color: '#64748b', fontWeight: 700 }}>Item</small>
                    <strong>{formData.itemName || 'Yellow Backpack'}</strong>
                    <span>{formData.itemQuantity} Item</span>
                  </div>
                </div>

                
                <div className={styles.reviewItemRow}>
                  <RotateCcw size={20} color="#d97706" />
                  <div className={styles.reviewItemContent}>
                    <small style={{ color: '#64748b', fontWeight: 700 }}>Return Type</small>
                    <strong>{(options.returnTypes || DEFAULT_RETURN_TYPES).find((r) => r.code === formData.returnType)?.title || 'Return an Item'}</strong>
                    <span>{(options.returnTypes || DEFAULT_RETURN_TYPES).find((r) => r.code === formData.returnType)?.description || 'Send an item back to the seller or store.'}</span>
                  </div>
                </div>

                <div className={styles.reviewItemRow}>
                  <MapPin size={20} color="#0f172a" />
                  <div className={styles.reviewItemContent}>
                    <small style={{ color: '#64748b', fontWeight: 700 }}>Pickup Address</small>
                    <strong>{formData.pickupArea || 'Home'}</strong>
                    <span>{formData.pickupFlatBuilding}, {formData.pickupStreet}, {formData.pickupCity}</span>
                  </div>
                </div>

                <div className={styles.reviewItemRow}>
                  <MapPin size={20} color="#f59e0b" fill="#f59e0b" />
                  <div className={styles.reviewItemContent}>
                    <small style={{ color: '#64748b', fontWeight: 700 }}>Delivery Address</small>
                    <strong>{formData.dropoffAddressType}</strong>
                    <span>{formData.dropoffAddressLine1}</span>
                  </div>
                </div>

                <div className={styles.reviewItemRow}>
                  <Bike size={20} color="#dc2626" />
                  <div className={styles.reviewItemContent}>
                    <small style={{ color: '#64748b', fontWeight: 700 }}>Service</small>
                    <strong>{formData.deliverySpeed === 'INSTANT' ? 'Instant Retrieval' : 'Express Retrieval'}</strong>
                    <span>Fast pickup & delivery</span>
                  </div>
                </div>

                <div className={styles.reviewItemRow}>
                  <Calendar size={20} color="#0f172a" />
                  <div className={styles.reviewItemContent}>
                    <small style={{ color: '#64748b', fontWeight: 700 }}>Schedule</small>
                    <strong>{formData.scheduledTimeSlot.includes('ASAP') ? 'ASAP' : formData.scheduledTimeSlot}</strong>
                    <span>Within 60 minutes</span>
                  </div>
                </div>

                <div className={styles.reviewItemRow}>
                  <ShieldCheck size={20} color="#f59e0b" />
                  <div className={styles.reviewItemContent}>
                    <small style={{ color: '#64748b', fontWeight: 700 }}>Security Options</small>
                    <strong>Secure Handling</strong>
                    <span>Careful handling for your items</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className={styles.priceBreakdownCard}>
                <div className={styles.priceHeaderRow}>
                  <h4>Price Breakdown</h4>
                  <span className={styles.viewDetailsLink}>View details &gt;</span>
                </div>
                <div className={styles.priceLineRow}>
                  <span>Retrieval Fee</span>
                  <strong>₹ {quote.retrievalFee.toFixed(2)}</strong>
                </div>
                <div className={styles.priceLineRow}>
                  <span>Delivery Fee</span>
                  <strong>₹ {quote.deliveryFee.toFixed(2)}</strong>
                </div>
                <div className={styles.priceLineRow}>
                  <span>Secure Handling Fee</span>
                  <strong>₹ {quote.secureHandlingFee.toFixed(2)}</strong>
                </div>
                <div className={styles.priceLineRow}>
                  <span>Taxes & Charges</span>
                  <strong>₹ {quote.taxAmount.toFixed(2)}</strong>
                </div>
                <div className={styles.priceDashedDivider} />
                <div className={styles.priceTotalRow}>
                  <span>Total Amount</span>
                  <span>₹{quote.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Choose Payment Method */}
              <div className={styles.paymentMethodsCard}>
                <h4>Choose Payment Method</h4>
                <div className={styles.paymentGrid}>
                  {[
                    { id: 'WALLET', label: 'Delivez Mo...', sub: 'Balance:\n₹512.00', icon: Wallet },
                    { id: 'UPI', label: 'UPI', sub: '', icon: QrCode },
                    { id: 'CARD', label: 'Debit / Cred...', sub: '', icon: CreditCard },
                    { id: 'NET_BANKING', label: 'Net Banking', sub: '', icon: Landmark },
                  ].map((p) => {
                    const Icon = p.icon
                    const isSelected = formData.paymentMethod === p.id
                    return (
                      <div
                        key={p.id}
                        className={`${styles.paymentBtn} ${isSelected ? styles.paymentBtnSelected : ''}`}
                        onClick={() => updateField('paymentMethod', p.id)}
                      >
                        {isSelected && (
                          <div className={styles.addressTypeCheckRed} style={{ top: 4, right: 4, width: 14, height: 14 }}>
                            <Check size={8} strokeWidth={3} />
                          </div>
                        )}
                        <Icon size={20} color="#0f172a" />
                        <span className={styles.paymentLabel}>{p.label}</span>
                        {p.sub && <span className={styles.paymentSubtext}>{p.sub}</span>}
                      </div>
                    )
                  })}
                </div>

                <label className={styles.termsRow}>
                  <input
                    type="checkbox"
                    checked={formData.termsAgreed}
                    onChange={(e) => updateField('termsAgreed', e.target.checked)}
                  />
                  <span>
                    I agree to the <strong style={{ textDecoration: 'underline' }}>Terms & Conditions</strong> and{' '}
                    <strong style={{ textDecoration: 'underline' }}>Privacy Policy</strong>.
                  </span>
                </label>

                <button
                  type="button"
                  className={styles.confirmBookBtn}
                  onClick={handleConfirmAndBook}
                  disabled={submitting}
                >
                  <span>{submitting ? 'Confirming Retrieval…' : 'Confirm & Book'}</span>
                  <div className={styles.confirmBookArrowCircle}>
                    <ChevronRight size={16} />
                  </div>
                </button>
              </div>
            </>
          )}

              {/* Desktop / Form Action Row (Back & Continue Buttons) */}
              <div className={styles.desktopActionRow}>
                {currentStep > 1 && (
                  <button type="button" className={styles.btnBackWhite} onClick={handleBack}>
                    &larr; Back
                  </button>
                )}

                {currentStep === 5 || currentStep === 6 || currentStep === 8 ? (
                  <button type="button" className={styles.btnContinueYellow} onClick={handleNext}>
                    <span>Continue &gt;</span>
                  </button>
                ) : currentStep < 10 ? (
                  <button type="button" className={styles.btnContinueRed} onClick={handleNext}>
                    <span>Continue &rarr;</span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Desktop Live Sidebar Summary */}
            <aside className={styles.sidebarCard}>
              <div className={styles.sidebarHead}>
                <h3>Order Summary</h3>
                <span className={styles.sidebarLiveBadge}>LIVE QUOTE</span>
              </div>

              {/* Selected Item Box */}
              <div className={styles.sidebarItemBox}>
                <div className={styles.sidebarItemIcon}>
                  <SelectedCategoryIcon size={22} />
                </div>
                <div className={styles.sidebarItemText}>
                  <strong>
                    {options.itemCategories.find((c) => c.id === formData.itemCategory)?.name || 'Selected Item'}
                  </strong>
                  <span>
                    {formData.itemName || 'Item to retrieve'} &bull; {formData.itemBrandColor || 'Standard'}
                  </span>
                </div>
              </div>

              {/* Route Points */}
              <div className={styles.sidebarLocationMini}>

              {formData.returnType && (
                <div className={styles.sidebarLocPoint} style={{ marginTop: 8 }}>
                  <RotateCcw size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Return Type</strong>
                    <span>{(options.returnTypes || DEFAULT_RETURN_TYPES).find((r) => r.code === formData.returnType)?.title || 'Return an Item'}</span>
                  </div>
                </div>
              )}

                <div className={styles.sidebarLocPoint}>
                  <MapPin size={16} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Pickup Point</strong>
                    <span>
                      {formData.pickupFlatBuilding
                        ? `${formData.pickupFlatBuilding}, ${formData.pickupStreet}, ${formData.pickupCity}`
                        : 'Pickup address not specified yet'}
                    </span>
                  </div>
                </div>
                <div className={styles.sidebarLocPoint}>
                  <Home size={16} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Delivery Destination</strong>
                    <span>{formData.dropoffAddressLine1 || 'Delivery destination not specified yet'}</span>
                  </div>
                </div>
              </div>

              {/* Speed & Schedule */}
              <div style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: '#475569', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <Zap size={14} color="#f59e0b" />
                  <span style={{ fontWeight: 700 }}>{formData.deliverySpeed || 'INSTANT'} SPEED</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <Clock size={14} color="#64748b" />
                  <span style={{ fontWeight: 700 }}>
                    {formData.scheduledDate ? `${formData.scheduledDate} Sep • ${formData.scheduledTimeSlot}` : 'ASAP'}
                  </span>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className={styles.sidebarFareTable}>
                <div className={styles.sidebarFareRow}>
                  <span>Retrieval fee</span>
                  <strong>₹{quote.retrievalFee?.toFixed(2) || '149.00'}</strong>
                </div>
                <div className={styles.sidebarFareRow}>
                  <span>Delivery fee</span>
                  <strong>₹{quote.deliveryFee?.toFixed(2) || '129.00'}</strong>
                </div>
                <div className={styles.sidebarFareRow}>
                  <span>Secure handling</span>
                  <strong>₹{quote.secureHandlingFee?.toFixed(2) || '39.00'}</strong>
                </div>
                <div className={styles.sidebarFareRow}>
                  <span>Taxes & charges</span>
                  <strong>₹{quote.taxAmount?.toFixed(2) || '23.02'}</strong>
                </div>
                <div className={styles.sidebarFareTotal}>
                  <span>Total Payable</span>
                  <span style={{ color: '#dc2626' }}>₹{quote.totalAmount?.toFixed(2) || '340.02'}</span>
                </div>
              </div>

              {/* Trust Banner */}
              <div className={styles.sidebarTrustBanner}>
                <ShieldCheck size={16} color="#f59e0b" />
                <span>Verified Partner &bull; Secure OTP Handover</span>
              </div>
            </aside>
          </div>
        ) : (
          /* ================================================================ */
          /* STEP 10: Booking Confirmed (Screen 16) - Desktop Expansive Card  */
          /* ================================================================ */
          confirmedBooking && (
            <div className={styles.confirmedContainerDesktop}>
              <div className={styles.confirmedTopHead}>
                <div className={styles.greenCheckCircle}>
                  <Check size={24} strokeWidth={3} />
                </div>
                <div className={styles.confirmedTitleBlock}>
                  <h1 className={styles.confirmedTitle}>
                    Booking <span className={styles.confirmedTitleYellow}>Confirmed</span>
                  </h1>
                  <div className={styles.titleUnderlineRed} />
                  <p className={styles.confirmedSubtitle}>We're arranging your retrieval now.</p>
                </div>
              </div>

              {/* 4 Info Cards */}
              <div className={styles.confirmedInfoGrid}>
                <div className={styles.infoCardBox}>
                  <Receipt size={20} color="#dc2626" />
                  <small>Booking ID</small>
                  <strong>{confirmedBooking.bookingNumber || 'DZ12345678'}</strong>
                </div>

                <div className={styles.infoCardBox}>
                  <Clock size={20} color="#0f172a" />
                  <small>Pickup ETA</small>
                  <strong>15–20 min</strong>
                </div>

                <div className={styles.infoCardBox}>
                  <Bike size={20} color="#dc2626" />
                  <small>Service</small>
                  <strong>Instant Retrieval</strong>
                </div>

                <div className={styles.infoCardBox}>
                  <Shield size={20} color="#f59e0b" />
                  <small>Secure & Safe</small>
                  <strong>Handled with care</strong>
                </div>
              </div>

              {/* Retrieval Progress Card */}
              <div className={styles.progressCard}>
                <h4>Retrieval Progress</h4>

                <div className={styles.milestonesRow}>
                  <div className={styles.milestonesLineBg} />
                  <div className={styles.milestonesLineFill} style={{ width: '25%' }} />

                  {/* Step 1: Order Confirmed */}
                  <div className={styles.milestoneCol}>
                    <div className={`${styles.milestoneNode} ${styles.milestoneNodeCompleted}`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div className={styles.milestoneIconWrap}>
                      <FileText size={16} color="#dc2626" />
                    </div>
                    <span className={styles.milestoneLabel}>Order Confirmed</span>
                    <span className={styles.milestoneTime}>09:41 AM</span>
                  </div>

                  {/* Step 2: Partner Assigned */}
                  <div className={styles.milestoneCol}>
                    <div className={`${styles.milestoneNode} ${styles.milestoneNodeActive}`}>
                      <div className={styles.milestoneNodeActiveInner} />
                    </div>
                    <div className={styles.milestoneIconWrap}>
                      <User size={16} color="#dc2626" />
                    </div>
                    <span className={styles.milestoneLabel}>Partner Assigned</span>
                    <span className={styles.milestoneTime}>09:42 AM</span>
                  </div>

                  {/* Step 3: Pickup in Progress */}
                  <div className={styles.milestoneCol}>
                    <div className={styles.milestoneNode} />
                    <div className={styles.milestoneIconWrap} style={{ background: '#f1f5f9' }}>
                      <Package size={16} color="#94a3b8" />
                    </div>
                    <span className={styles.milestoneLabel} style={{ color: '#94a3b8' }}>
                      Pickup in Progress
                    </span>
                  </div>

                  {/* Step 4: On the Way */}
                  <div className={styles.milestoneCol}>
                    <div className={styles.milestoneNode} />
                    <div className={styles.milestoneIconWrap} style={{ background: '#f1f5f9' }}>
                      <Bike size={16} color="#94a3b8" />
                    </div>
                    <span className={styles.milestoneLabel} style={{ color: '#94a3b8' }}>
                      On the Way
                    </span>
                  </div>

                  {/* Step 5: Delivered */}
                  <div className={styles.milestoneCol}>
                    <div className={styles.milestoneNode} />
                    <div className={styles.milestoneIconWrap} style={{ background: '#f1f5f9' }}>
                      <Home size={16} color="#94a3b8" />
                    </div>
                    <span className={styles.milestoneLabel} style={{ color: '#94a3b8' }}>
                      Delivered
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next Card */}
              <div className={styles.whatsNextCard}>
                <div className={styles.bellYellowCircle}>
                  <ShieldAlert size={22} color="#0f172a" />
                </div>
                <div>
                  <h4>What's Next?</h4>
                  <p>Our delivery partner is on the way to pick up your item.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  className={styles.btnTrackYellow}
                  onClick={() =>
                    navigateTo(
                      `/track/forgot-something/${confirmedBooking.bookingNumber || confirmedBooking.id}`
                    )
                  }
                >
                  <MapPin size={18} />
                  <span>Track Retrieval &gt;</span>
                </button>

                <button
                  type="button"
                  className={styles.btnHomeWhite}
                  onClick={() => navigateTo('/')}
                >
                  <Home size={18} />
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {authModalOpen && <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />}
    </div>
  )
}
