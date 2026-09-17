import React, { useEffect, useMemo, useState } from 'react'
import {
  Undo2,
  Repeat,
  Wrench,
  ShieldCheck,
  CalendarDays,
  UserCheck,
  MoreHorizontal,
  ShoppingCart,
  Store,
  Tag,
  Building,
  Home,
  User,
  MapPin,
  Search,
  Mic,
  Camera,
  QrCode,
  Upload,
  FileText,
  Package,
  Clock,
  Rocket,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  Shield,
  CreditCard,
  Wallet,
  Sparkles,
  Edit3,
  Copy,
  Share2,
  Check,
  Loader2,
  Trash2,
  ChevronRight,
  Phone,
  FastForward,
  Bell,
  CheckCircle,
  Calendar,
  Layers,
  FileCheck,
  ScanLine,
  Image as ImageIcon
} from 'lucide-react'
import {
  fetchReturnPickupOptions,
  fetchReturnPickupQuote,
  createReturnPickupBooking,
  fetchReturnPickupSlider,
  DEFAULT_RETURN_PICKUP_OPTIONS
} from '@/features/return-pickup/services/returnPickupService.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'
import { navigateTo } from '@/app/router/navigation.js'
import AuthModal from '@/features/auth/components/AuthModal.jsx'
import styles from './ReturnPickupBookingPage.module.css'

const STEP_NAMES = [
  'Return Type',
  'Pickup Location',
  'Delivery Details',
  'Destination',
  'Item Details',
  'Documents',
  'Return Method',
  'Schedule',
  'Review & Pay'
]

const RETURN_ICONS = {
  RETURN_ITEM: Undo2,
  EXCHANGE_ITEM: Repeat,
  REPAIR_SERVICE: Wrench,
  WARRANTY_RETURN: ShieldCheck,
  RENTAL_RETURN: CalendarDays,
  SEND_BACK_TO_PERSON: UserCheck,
  OTHER: MoreHorizontal
}

const DESTINATION_ICONS = {
  ONLINE_STORE: ShoppingCart,
  LOCAL_STORE: Store,
  BRAND_STORE: Tag,
  SERVICE_CENTRE: Building,
  WAREHOUSE: Home,
  ANOTHER_PERSON: User,
  OTHER: MapPin
}

export default function ReturnPickupBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [sliderImages, setSliderImages] = useState([])
  const [currentSliderIdx, setCurrentSliderIdx] = useState(0)
  const [sliderDismissed, setSliderDismissed] = useState(false)
  const [options, setOptions] = useState(DEFAULT_RETURN_PICKUP_OPTIONS)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedBookingId, setCopiedBookingId] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Booking Form State
  const [formData, setFormData] = useState({
    // Step 1: Return Type
    returnType: 'RETURN_ITEM',

    // Step 2: Pickup Location Details
    pickupStoreName: 'Croma Electronics Hub',
    pickupAddress: 'No. 45, 100ft Road, HAL 2nd Stage, Indiranagar',
    pickupCity: 'Bengaluru',
    pickupState: 'Karnataka',
    pickupPostalCode: '560038',
    pickupContactName: 'Ravi Kishan',
    pickupPhoneNumber: '9876543210',
    pickupReferenceNumber: 'RET-AMZ-2026-9988',
    pickupInstructions: 'Store pickup counter on ground floor',

    // Step 3: Where should we deliver the return?
    returnAddressType: 'Store',
    returnAddress: 'Flat 402, Green Glen Layout, Outer Ring Road, Bellandur',
    returnCity: 'Bengaluru',
    returnState: 'Karnataka',
    returnPostalCode: '560103',
    returnContactName: 'Ravi Kishan',
    returnPhoneNumber: '9876543210',
    returnLandmark: 'Behind Central Mall',
    returnInstructions: '',

    // Step 4: Destination Store / Seller
    destinationType: 'ONLINE_STORE',
    destinationName: 'Amazon India',
    searchStoreQuery: '',
    customStoreName: '',

    // Step 5: Item Details
    itemCategory: 'ELECTRONICS',
    itemDescription: 'Wireless Noise Cancelling Headphones with original retail box and USB cable',
    itemQuantity: 1,
    declaredValue: 2499,
    approxWeightKg: 0.45,
    lengthCm: 18,
    widthCm: 15,
    heightCm: 8,
    itemCondition: 'NEW_UNUSED', // 'NEW_UNUSED' | 'USED_GOOD' | 'DAMAGED'
    specialHandlingTags: ['Fragile', 'Handle with care'],
    itemPhotos: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
    ],

    // Step 6: Return Documents
    documents: [
      {
        id: 'doc-inv',
        name: 'Amazon_Invoice_ORD9988.pdf',
        type: 'INVOICE_ORDER_PROOF',
        title: 'Invoice / Order Proof',
        uploadedAt: 'Today'
      }
    ],

    // Step 7: Return Method
    returnDetailsMethod: 'SCAN_LABEL', // 'SCAN_LABEL' | 'UPLOAD_SCREENSHOT' | 'ENTER_MANUALLY'
    orderId: 'ORD-AMZ-88992',
    returnId: 'RET-998822',
    estimatedRefundAmount: 2499,

    // Step 8: Pickup Date & Time
    scheduledDate: '2026-09-12',
    scheduledTimeSlot: '11:00 AM - 1:00 PM',
    deliveryService: 'STANDARD',
    shipmentProtection: true,

    // Step 9: Review & Pay
    couponCode: 'DELIVEZ10',
    paymentMethod: 'PAY_ON_PICKUP'
  })

  // Live Pricing Quote State
  const [quote, setQuote] = useState({
    currency: 'INR',
    basePickupCharge: 49,
    distanceCharge: 20,
    handlingCharge: 10,
    deliveryServiceCharge: 89,
    protectionCharge: 19,
    discountAmount: 18.7,
    taxAmount: 30.11,
    totalAmount: 197.41,
    deliveryServiceName: 'Standard Delivery',
    breakdown: [
      { key: 'BASE_PICKUP', label: 'Base Pickup Charge', amount: 49 },
      { key: 'DISTANCE', label: 'Distance Charge', amount: 20 },
      { key: 'HANDLING', label: 'Item Handling Fee', amount: 10 },
      { key: 'DELIVERY_SERVICE', label: 'Standard Delivery', amount: 89 },
      { key: 'PROTECTION', label: 'Shipment Protection Cover', amount: 19 },
      { key: 'DISCOUNT', label: 'Coupon Discount (DELIVEZ10)', amount: -18.7 },
      { key: 'TAX', label: 'GST (18%)', amount: 30.11 }
    ]
  })

  // Load Slider Images & Config Options
  useEffect(() => {
    async function loadData() {
      try {
        const [sliderImgs, opt] = await Promise.all([
          fetchReturnPickupSlider(),
          fetchReturnPickupOptions()
        ])
        if (sliderImgs && sliderImgs.length > 0) setSliderImages(sliderImgs)
        if (opt) setOptions(opt)
      } catch (e) {
        console.warn('Failed to load return options or slider:', e)
      } finally {
        setLoadingOptions(false)
      }
    }
    loadData()
  }, [])

  // Auto-advance hero slider
  useEffect(() => {
    if (sliderImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSliderIdx((prev) => (prev + 1) % sliderImages.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [sliderImages.length])

  // Recalculate Quote on Relevant Field Changes
  useEffect(() => {
    async function updateQuote() {
      try {
        const q = await fetchReturnPickupQuote({
          deliveryService: formData.deliveryService,
          shipmentProtection: formData.shipmentProtection,
          itemQuantity: formData.itemQuantity,
          declaredValue: formData.declaredValue,
          couponCode: formData.couponCode
        })
        if (q) setQuote(q)
      } catch (err) {
        console.warn('Quote calculation failed:', err)
      }
    }
    updateQuote()
  }, [
    formData.deliveryService,
    formData.shipmentProtection,
    formData.itemQuantity,
    formData.declaredValue,
    formData.couponCode
  ])

  // Helpers
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSpecialHandling = (tag) => {
    setFormData((prev) => {
      const exists = prev.specialHandlingTags.includes(tag)
      return {
        ...prev,
        specialHandlingTags: exists
          ? prev.specialHandlingTags.filter((t) => t !== tag)
          : [...prev.specialHandlingTags, tag]
      }
    })
  }

  const handleSelectStore = (store) => {
    setFormData((prev) => ({
      ...prev,
      destinationName: store.name,
      returnAddress: store.address.line1,
      returnCity: store.address.city,
      returnState: store.address.state,
      returnPostalCode: store.address.postalCode,
      returnContactName: store.name + ' Returns Team'
    }))
  }

  const handleAddSampleDoc = (title, type) => {
    const newDoc = {
      id: 'doc-' + Date.now(),
      name: `${title.replace(/\s+/g, '_')}.pdf`,
      type: type,
      title: title,
      uploadedAt: 'Just now'
    }
    setFormData((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc]
    }))
  }

  // 7-day pickup date options
  const dateOptions = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const list = []
    const now = new Date()

    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      const dayName = days[d.getDay()]
      const dateNum = String(d.getDate()).padStart(2, '0')
      const monthName = months[d.getMonth()]
      const iso = d.toISOString().split('T')[0]
      list.push({ day: dayName, date: dateNum, month: monthName, iso })
    }
    return list
  }, [])

  const timeSlots = [
    { time: '9:00 AM - 11:00 AM', badge: 'Fastest pickup' },
    { time: '11:00 AM - 1:00 PM', badge: 'Most preferred' },
    { time: '1:00 PM - 3:00 PM', badge: null },
    { time: '3:00 PM - 5:00 PM', badge: null },
    { time: '5:00 PM - 7:00 PM', badge: null },
    { time: '7:00 PM - 9:00 PM', badge: null }
  ]

  const documentTypesList = [
    { id: 'INVOICE_ORDER_PROOF', title: 'Invoice / Order Proof', tag: 'Recommended', subtitle: 'Upload invoice or order confirmation' },
    { id: 'RETURN_AUTHORIZATION', title: 'Return Authorization (If any)', tag: 'Optional', subtitle: 'Return request or authorization document' },
    { id: 'REPAIR_RECEIPT', title: 'Repair Receipt / Job Card', tag: 'Optional', subtitle: 'Upload repair receipt or job card' },
    { id: 'WARRANTY_DOC', title: 'Warranty Document (If any)', tag: 'Optional', subtitle: 'Upload warranty card or document' },
    { id: 'QR_BARCODE', title: 'QR Code / Barcode (If any)', tag: 'Optional', subtitle: 'Upload QR code or barcode screenshot' },
    { id: 'PICKUP_AUTH', title: 'Pickup Authorization (If required)', tag: 'Optional', subtitle: 'Authorization letter or consent for pickup' }
  ]

  // Step Validation
  const validateStep = (step) => {
    setErrorMessage('')
    if (step === 1) {
      if (!formData.returnType) {
        setErrorMessage('Please select a return type.')
        return false
      }
    } else if (step === 2) {
      if (!formData.pickupStoreName || !formData.pickupAddress || !formData.pickupContactName || !formData.pickupPhoneNumber) {
        setErrorMessage('Please complete all required pickup location details.')
        return false
      }
    } else if (step === 3) {
      if (!formData.returnAddress || !formData.returnContactName || !formData.returnPhoneNumber) {
        setErrorMessage('Please complete all required delivery address details.')
        return false
      }
    } else if (step === 4) {
      if (!formData.destinationType) {
        setErrorMessage('Please select where you are returning the item.')
        return false
      }
    } else if (step === 5) {
      if (!formData.itemDescription) {
        setErrorMessage('Please enter item description.')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(9, prev + 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setErrorMessage('')
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Submit Booking
  const handleConfirmBooking = async () => {
    setSubmitting(true)
    setErrorMessage('')

    const token = getUserAccessToken()
    if (!token) {
      setAuthModalOpen(true)
      setSubmitting(false)
      return
    }

    try {
      const idempotencyKey = 'ret-book-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
      const bookingPayload = {
        returnType: formData.returnType,
        destinationType: formData.destinationType,
        destinationName: formData.destinationName || formData.customStoreName || 'Amazon India',
        orderId: formData.orderId || null,
        returnId: formData.returnId || null,
        estimatedRefundAmount: Number(formData.estimatedRefundAmount) || null,

        pickupStoreName: formData.pickupStoreName,
        pickupAddress: formData.pickupAddress,
        pickupCity: formData.pickupCity,
        pickupState: formData.pickupState,
        pickupPostalCode: formData.pickupPostalCode,
        pickupContactName: formData.pickupContactName,
        pickupPhoneNumber: formData.pickupPhoneNumber,
        pickupReferenceNumber: formData.pickupReferenceNumber || null,
        pickupInstructions: formData.pickupInstructions || null,

        returnAddressType: formData.returnAddressType,
        returnAddress: formData.returnAddress,
        returnCity: formData.returnCity,
        returnState: formData.returnState,
        returnPostalCode: formData.returnPostalCode,
        returnContactName: formData.returnContactName,
        returnPhoneNumber: formData.returnPhoneNumber,
        returnLandmark: formData.returnLandmark || null,
        returnInstructions: formData.returnInstructions || null,

        itemCategory: formData.itemCategory,
        itemDescription: formData.itemDescription,
        itemQuantity: Number(formData.itemQuantity) || 1,
        declaredValue: Number(formData.declaredValue) || null,
        approxWeightKg: Number(formData.approxWeightKg) || 0.5,
        lengthCm: Number(formData.lengthCm) || null,
        widthCm: Number(formData.widthCm) || null,
        heightCm: Number(formData.heightCm) || null,
        itemCondition: formData.itemCondition,
        specialHandlingTags: formData.specialHandlingTags,
        documents: formData.documents,
        returnDetailsMethod: formData.returnDetailsMethod,

        scheduledDate: formData.scheduledDate,
        scheduledTimeSlot: formData.scheduledTimeSlot,
        deliveryService: formData.deliveryService,
        shipmentProtection: formData.shipmentProtection,
        couponCode: formData.couponCode,
        paymentMethod: formData.paymentMethod
      }

      const created = await createReturnPickupBooking(bookingPayload, idempotencyKey)
      setConfirmedBooking(created)
      setCurrentStep(10) // Confirmation View
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Return pickup booking failed:', err)
      setErrorMessage(err.message || 'Failed to confirm return pickup. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedBookingId(true)
    setTimeout(() => setCopiedBookingId(false), 2000)
  }

  return (
    <div className={styles.pageWrapper}>
      {/* 1. TOP APP BAR (FLUTTER STYLE) */}
      <header className={styles.topHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.brandRow}>
            <div className={styles.brandTitle} onClick={() => navigateTo('/')}>
              <span className={styles.brandLogo}>DELIVEZ</span>
              <FastForward size={18} className={styles.fastForwardIcon} />
              <span className={styles.securePill}>
                <Shield size={12} /> 100% Secure
              </span>
            </div>

            <div className={styles.headerMeta}>
              <button
                type="button"
                className={styles.notificationBtn}
                title="Notifications"
                onClick={() => navigateTo('/user/dashboard')}
              >
                <Bell size={20} />
                <span className={styles.notificationDot} />
              </button>

              <div className={styles.walletPill}>
                <Wallet size={15} color="#b45309" />
                <span>₹0.00</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. PROMOTIONAL HERO SLIDER (PAGE 1 FROM FLUTTER APP) */}
      {!sliderDismissed && currentStep <= 2 && sliderImages.length > 0 && (
        <section className={styles.sliderSection}>
          <div className={styles.sliderContainer}>
            <img
              src={sliderImages[currentSliderIdx] || sliderImages[0]}
              alt="Return Pickup Service Banner"
              className={styles.sliderImage}
            />
            <div className={styles.sliderOverlay}>
              <div className={styles.sliderContent}>
                <div className={styles.sliderText}>
                  <h3>Hassle-Free Return Pickups</h3>
                  <p>Fast pickup from your doorstep, direct return to seller, store or warehouse.</p>
                </div>
                <div className={styles.sliderControls}>
                  <div className={styles.sliderDots}>
                    {sliderImages.map((_, idx) => (
                      <span
                        key={idx}
                        className={`${styles.dot} ${idx === currentSliderIdx ? styles.active : ''}`}
                        onClick={() => setCurrentSliderIdx(idx)}
                      />
                    ))}
                  </div>
                  <div className={styles.sliderActions}>
                    <button
                      type="button"
                      className={styles.skipBtn}
                      onClick={() => setSliderDismissed(true)}
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      className={styles.sliderNextBtn}
                      onClick={() => {
                        setCurrentSliderIdx((prev) => (prev + 1) % sliderImages.length)
                        if (currentStep === 1) setCurrentStep(2)
                      }}
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. STEPPER PROGRESS RAIL */}
      {currentStep <= 9 && (
        <nav className={styles.stepperContainer} aria-label="Return Pickup Progress">
          <div className={styles.stepperRail}>
            {STEP_NAMES.map((name, index) => {
              const stepNum = index + 1
              const isActive = currentStep === stepNum
              const isCompleted = currentStep > stepNum
              return (
                <React.Fragment key={name}>
                  <div
                    className={`${styles.stepItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                    onClick={() => {
                      if (stepNum < currentStep) setCurrentStep(stepNum)
                    }}
                  >
                    <div className={styles.stepNode}>
                      {isCompleted ? <Check size={12} strokeWidth={3} /> : stepNum}
                    </div>
                    <span className={styles.stepLabel}>{name}</span>
                  </div>
                  {index < STEP_NAMES.length - 1 && (
                    <div
                      className={`${styles.stepLine} ${isCompleted ? styles.completedLine : ''}`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </nav>
      )}

      {/* 4. MAIN WORKSPACE */}
      <main className={styles.mainLayout}>
        {currentStep === 10 && confirmedBooking ? (
          /* CONFIRMATION SCREEN (MATCHING IMAGE 1) */
          <div className={styles.confirmationCard}>
            <div className={styles.successCheckCircle}>
              <CheckCircle2 size={36} />
            </div>
            <h2>Your Return is Booked!</h2>
            <p>Thank you! Your return request has been confirmed.</p>

            {/* Booking ID Box with Share */}
            <div className={styles.bookingIdCardBox}>
              <div className={styles.bookingIdLabelCol}>
                <small>Booking ID</small>
                <strong>{confirmedBooking.bookingNumber || 'DRVZ-RET-140926-16875'}</strong>
              </div>
              <div className={styles.bookingIdActions}>
                <button
                  type="button"
                  className={styles.shareBtn}
                  onClick={() => handleCopyId(confirmedBooking.bookingNumber)}
                  title="Share / Copy Booking ID"
                >
                  <Share2 size={15} />
                  <span>{copiedBookingId ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Green Notification Safe Banner */}
            <div className={styles.safeNoticeBanner}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>We will pick up your item as scheduled and deliver it safely.</span>
            </div>

            {/* Booking Details Card with 6-cell Grid */}
            <div className={styles.bookingDetailsContainerCard}>
              <div className={styles.bookingDetailsCardHeader}>
                <strong>Booking Details</strong>
                <button
                  type="button"
                  className={styles.viewDetailsTextLink}
                  onClick={() => navigateTo(`/return-pickup/details/${confirmedBooking.bookingNumber}`)}
                >
                  View Details <ChevronRight size={14} />
                </button>
              </div>

              <div className={styles.bookingDetailsInnerGrid}>
                {/* 1. Pickup Date & Time */}
                <div className={styles.detailGridCell}>
                  <div className={`${styles.detailCellIconBox} ${styles.iconBoxAmber}`}>
                    <CalendarDays size={18} />
                  </div>
                  <div className={styles.detailCellContent}>
                    <small>Pickup Date & Time</small>
                    <strong>
                      {confirmedBooking.scheduledDate || formData.scheduledDate}
                    </strong>
                    <div className={styles.detailSubText}>
                      {confirmedBooking.scheduledTimeSlot || formData.scheduledTimeSlot}
                    </div>
                  </div>
                </div>

                {/* 2. Pickup Address */}
                <div className={styles.detailGridCell}>
                  <div className={`${styles.detailCellIconBox} ${styles.iconBoxPink}`}>
                    <MapPin size={18} />
                  </div>
                  <div className={styles.detailCellContent}>
                    <small>Pickup Address</small>
                    <strong>
                      {confirmedBooking.pickup?.storeName || confirmedBooking.pickupStoreName || formData.pickupStoreName || 'Home'} - {confirmedBooking.pickup?.city || confirmedBooking.pickupCity || formData.pickupCity}
                    </strong>
                    <div className={styles.detailSubText}>
                      {confirmedBooking.pickup?.address || confirmedBooking.pickupAddress || formData.pickupAddress}, {confirmedBooking.pickup?.postalCode || confirmedBooking.pickupPostalCode || formData.pickupPostalCode}
                    </div>
                  </div>
                </div>

                {/* 3. Return To - REFLECTS STORE / SHOP / SERVICE CENTER */}
                <div className={styles.detailGridCell}>
                  <div className={`${styles.detailCellIconBox} ${styles.iconBoxGreen}`}>
                    <Store size={18} />
                  </div>
                  <div className={styles.detailCellContent}>
                    <small>Return To</small>
                    <strong className={styles.returnToTitleStrong}>
                      {confirmedBooking.delivery?.addressType || confirmedBooking.returnAddressType || confirmedBooking.destinationName || formData.returnAddressType || 'Store'}
                    </strong>
                    <div className={styles.detailSubText}>
                      {confirmedBooking.delivery?.address || confirmedBooking.returnAddress || formData.returnAddress}
                    </div>
                    <div className={styles.detailSubText}>
                      {confirmedBooking.delivery?.city || confirmedBooking.returnCity || formData.returnCity} - {confirmedBooking.delivery?.postalCode || confirmedBooking.returnPostalCode || formData.returnPostalCode}
                    </div>
                  </div>
                </div>

                {/* 4. Item Details */}
                <div className={styles.detailGridCell}>
                  <div className={`${styles.detailCellIconBox} ${styles.iconBoxPurple}`}>
                    <Package size={18} />
                  </div>
                  <div className={styles.detailCellContent}>
                    <small>Item Details</small>
                    <strong>
                      {confirmedBooking.itemCategory || formData.itemCategory}
                    </strong>
                    <div className={styles.detailSubText}>
                      {confirmedBooking.itemQuantity || formData.itemQuantity} Item(s) • {confirmedBooking.approxWeightKg || formData.approxWeightKg} kg
                    </div>
                  </div>
                </div>

                {/* 5. Service Type */}
                <div className={styles.detailGridCell}>
                  <div className={`${styles.detailCellIconBox} ${styles.iconBoxBlue}`}>
                    <Truck size={18} />
                  </div>
                  <div className={styles.detailCellContent}>
                    <small>Service Type</small>
                    <strong>
                      {confirmedBooking.deliveryService || formData.deliveryService || 'STANDARD'}
                    </strong>
                  </div>
                </div>

                {/* 6. Shipment Protection */}
                <div className={styles.detailGridCell}>
                  <div className={`${styles.detailCellIconBox} ${styles.iconBoxAmber}`}>
                    <ShieldCheck size={18} />
                  </div>
                  <div className={styles.detailCellContent}>
                    <small>Shipment Protection</small>
                    <div className={styles.protectionStatusRow}>
                      <strong>Added</strong> <CheckCircle2 size={13} color="#16a34a" />
                    </div>
                    <div className={styles.detailSubText}>
                      Covered up to ₹10000.0
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Verification Block */}
            <div className={styles.otpRow}>
              <div className={styles.otpCard}>
                <small>Pickup Verification OTP</small>
                <div className={styles.otpCode}>{confirmedBooking.pickupOtp || '5429'}</div>
              </div>
              <div className={styles.otpCard}>
                <small>Delivery Verification OTP</small>
                <div className={styles.otpCode}>{confirmedBooking.deliveryOtp || '4326'}</div>
              </div>
            </div>

            {/* Bottom Actions matching Image 1 */}
            <div className={styles.confirmBottomButtonsRow}>
              <button
                type="button"
                className={styles.homeWhiteBtn}
                onClick={() => navigateTo('/')}
              >
                <Home size={16} /> Go to Home
              </button>
              <button
                type="button"
                className={styles.trackOrangeBtn}
                onClick={() => navigateTo(`/track/return-pickup/${confirmedBooking.bookingNumber}`)}
              >
                Track Return <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.wizardGrid}>
            <div className={styles.formColumn}>
              {errorMessage && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: SELECT RETURN TYPE */}
              {currentStep === 1 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <div className={styles.heroHeaderRow}>
                      <div className={styles.heroHeaderText}>
                        <span className={styles.stepBadge}>Step 1</span>
                        <h2>What would you like to do?</h2>
                        <p>Choose the option that best describes your return.</p>
                      </div>
                      <div className={styles.heroIllustrationCircle}>
                        <div className={styles.heroInnerIconBox}>
                          <Undo2 size={24} />
                        </div>
                        <MapPin size={16} className={styles.heroFloatingPin} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.optionsList}>
                    {options.returnTypes.map((type) => {
                      const IconComp = RETURN_ICONS[type.id] || Undo2
                      const isSelected = formData.returnType === type.id
                      return (
                        <div
                          key={type.id}
                          className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
                          onClick={() => updateField('returnType', type.id)}
                        >
                          <div className={styles.optionAmberIcon}>
                            <IconComp size={22} />
                          </div>
                          <div className={styles.optionDetails}>
                            <strong>{type.name}</strong>
                            <p>{type.description}</p>
                          </div>
                          <ChevronRight size={18} className={styles.optionChevron} />
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* STEP 2: PICKUP LOCATION DETAILS */}
              {currentStep === 2 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 2</span>
                    <h2>Pickup Location Details</h2>
                    <p>Enter the details of the place where we need to pick up your item.</p>
                  </div>

                  {/* Store / Shop / Center Name */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Store / Shop / Service Center Name <span className={styles.requiredStar}>*</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <Store size={20} />
                      </div>
                      <div className={styles.standardInputWrap}>
                        <input
                          type="text"
                          className={styles.standardInput}
                          placeholder="e.g. Croma Mega Store, Customer Home, Apple Service Center"
                          value={formData.pickupStoreName}
                          onChange={(e) => updateField('pickupStoreName', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pickup Address with GPS */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Pickup Address <span className={styles.requiredStar}>*</span>
                      </span>
                      <button
                        type="button"
                        className={styles.gpsActionBtn}
                        onClick={() => updateField('pickupAddress', '123, 100ft Road, Indiranagar')}
                      >
                        <MapPin size={13} /> Use current location
                      </button>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <MapPin size={20} />
                      </div>
                      <div className={styles.splitAddressBox}>
                        <input
                          type="text"
                          className={styles.addressTopInput}
                          placeholder="House/Shop no., Building, Street, Area"
                          value={formData.pickupAddress}
                          onChange={(e) => updateField('pickupAddress', e.target.value)}
                        />
                        <div className={styles.splitDividerHorizontal} />
                        <div className={styles.splitBottomRow}>
                          <input
                            type="text"
                            className={styles.cityInput}
                            placeholder="City / Town"
                            value={formData.pickupCity}
                            onChange={(e) => updateField('pickupCity', e.target.value)}
                          />
                          <div className={styles.splitDividerVertical} />
                          <input
                            type="text"
                            className={styles.pincodeInput}
                            placeholder="Pincode"
                            value={formData.pickupPostalCode}
                            onChange={(e) => updateField('pickupPostalCode', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Person Name */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Contact Person Name <span className={styles.requiredStar}>*</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <User size={20} />
                      </div>
                      <div className={styles.standardInputWrap}>
                        <input
                          type="text"
                          className={styles.standardInput}
                          placeholder="Enter contact person name"
                          value={formData.pickupContactName}
                          onChange={(e) => updateField('pickupContactName', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Phone Number */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Contact Phone Number <span className={styles.requiredStar}>*</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <Phone size={20} />
                      </div>
                      <div className={styles.standardInputWrap}>
                        <input
                          type="tel"
                          className={styles.standardInput}
                          placeholder="Enter 10-digit mobile number"
                          value={formData.pickupPhoneNumber}
                          onChange={(e) => updateField('pickupPhoneNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order / Job / Reference Number */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Order / Job / Reference Number <span className={styles.optionalTag}>(Optional)</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <FileText size={20} />
                      </div>
                      <div className={styles.standardInputWrap}>
                        <input
                          type="text"
                          className={styles.standardInput}
                          placeholder="Enter order, job or reference number"
                          value={formData.pickupReferenceNumber}
                          onChange={(e) => updateField('pickupReferenceNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 3: WHERE SHOULD WE DELIVER THE RETURN? */}
              {currentStep === 3 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 3</span>
                    <h2>Where should we deliver the return?</h2>
                    <p>Enter the address where the item has to be delivered.</p>
                  </div>

                  {/* Delivery Type Horizontal Cards */}
                  <div className={styles.deliveryTypeCardsGrid}>
                    {[
                      { id: 'Store', title: 'Store', sub: 'Deliver to store address', icon: Home },
                      { id: 'Shop', title: 'Shop', sub: 'Deliver to shop address', icon: Building },
                      { id: 'Service Center', title: 'Service Center', sub: 'Deliver to service center address', icon: Wrench },
                      { id: 'Seller / Warehouse', title: 'Seller / Warehouse', sub: 'Deliver to seller or warehouse', icon: Store }
                    ].map((item) => {
                      const IconC = item.icon
                      const isSel = formData.returnAddressType === item.id
                      return (
                        <div
                          key={item.id}
                          className={`${styles.deliveryTypeCard} ${isSel ? styles.selected : ''}`}
                          onClick={() => {
                            updateField('returnAddressType', item.id)
                            if (item.id === 'Store' || item.id === 'Shop') {
                              updateField('destinationType', 'LOCAL_STORE')
                              updateField('destinationName', item.id)
                            } else if (item.id === 'Service Center') {
                              updateField('destinationType', 'SERVICE_CENTRE')
                              updateField('destinationName', 'Service Center')
                            } else if (item.id === 'Seller / Warehouse') {
                              updateField('destinationType', 'WAREHOUSE')
                              updateField('destinationName', 'Seller / Warehouse')
                            }
                          }}
                        >
                          <div className={styles.cardCheckCircle}>
                            {isSel ? <CheckCircle2 size={15} /> : <div className={styles.emptyCircle} />}
                          </div>
                          <IconC size={22} className={styles.deliveryTypeIcon} />
                          <strong>{item.title}</strong>
                          <small>{item.sub}</small>
                        </div>
                      )
                    })}
                  </div>

                  {/* Delivery Address with GPS */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Delivery Address <span className={styles.requiredStar}>*</span>
                      </span>
                      <button
                        type="button"
                        className={styles.gpsActionBtn}
                        onClick={() => updateField('returnAddress', 'Flat 402, Green Glen Layout, Bellandur')}
                      >
                        <MapPin size={13} /> Use current location
                      </button>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <MapPin size={20} />
                      </div>
                      <div className={styles.splitAddressBox}>
                        <input
                          type="text"
                          className={styles.addressTopInput}
                          placeholder="Shop / Store / Service Center, Street, Area"
                          value={formData.returnAddress}
                          onChange={(e) => updateField('returnAddress', e.target.value)}
                        />
                        <div className={styles.splitDividerHorizontal} />
                        <div className={styles.splitBottomRow}>
                          <input
                            type="text"
                            className={styles.cityInput}
                            placeholder="City / Town"
                            value={formData.returnCity}
                            onChange={(e) => updateField('returnCity', e.target.value)}
                          />
                          <div className={styles.splitDividerVertical} />
                          <input
                            type="text"
                            className={styles.pincodeInput}
                            placeholder="Pincode"
                            value={formData.returnPostalCode}
                            onChange={(e) => updateField('returnPostalCode', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Person Name */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Contact Person Name <span className={styles.requiredStar}>*</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <User size={20} />
                      </div>
                      <div className={styles.standardInputWrap}>
                        <input
                          type="text"
                          className={styles.standardInput}
                          placeholder="Enter contact person name"
                          value={formData.returnContactName}
                          onChange={(e) => updateField('returnContactName', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Phone Number */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Contact Phone Number <span className={styles.requiredStar}>*</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <Phone size={20} />
                      </div>
                      <div className={styles.standardInputWrap}>
                        <input
                          type="tel"
                          className={styles.standardInput}
                          placeholder="Enter 10-digit mobile number"
                          value={formData.returnPhoneNumber}
                          onChange={(e) => updateField('returnPhoneNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Landmark */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Landmark <span className={styles.optionalTag}>(Optional)</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <Package size={20} />
                      </div>
                      <div className={styles.standardInputWrap}>
                        <input
                          type="text"
                          className={styles.standardInput}
                          placeholder="Enter nearby landmark"
                          value={formData.returnLandmark}
                          onChange={(e) => updateField('returnLandmark', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Important Banner */}
                  <div className={styles.importantBanner}>
                    <Info size={20} className={styles.bannerAmberIcon} />
                    <div className={styles.bannerText}>
                      <strong>Important</strong>
                      <p>Please double-check the return delivery address. We will deliver the item exactly to this address.</p>
                    </div>
                    <div className={styles.bannerRightIllustration}>
                      <Package size={20} />
                      <MapPin size={12} className={styles.bannerFloatingPin} />
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 4: WHERE IS IT GOING? (DESTINATION) */}
              {currentStep === 4 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <div className={styles.heroHeaderRow}>
                      <div className={styles.heroHeaderText}>
                        <span className={styles.stepBadge}>Step 4</span>
                        <h2>Where are you returning it?</h2>
                        <p>Select where the item should be sent back.</p>
                      </div>
                      <div className={styles.heroIllustrationCircle}>
                        <div className={styles.heroInnerIconBox}>
                          <Undo2 size={24} />
                        </div>
                        <MapPin size={16} className={styles.heroFloatingPin} />
                      </div>
                    </div>
                  </div>

                  {/* Destination Grid 3 columns */}
                  <div className={styles.destGrid3Col}>
                    {options.destinationTypes.slice(0, 6).map((item) => {
                      const IconC = DESTINATION_ICONS[item.id] || Store
                      const isSel = formData.destinationType === item.id
                      return (
                        <div
                          key={item.id}
                          className={`${styles.destCard} ${isSel ? styles.selected : ''}`}
                          onClick={() => updateField('destinationType', item.id)}
                        >
                          <div className={styles.destCircleIcon}>
                            <IconC size={18} />
                          </div>
                          <strong>{item.name}</strong>
                          <small>{item.description}</small>
                        </div>
                      )
                    })}
                  </div>

                  {/* Other Destination Full Card */}
                  <div
                    className={`${styles.otherDestCard} ${formData.destinationType === 'OTHER' ? styles.selected : ''}`}
                    onClick={() => updateField('destinationType', 'OTHER')}
                  >
                    <div className={styles.otherIconBox}>
                      <MoreHorizontal size={18} />
                    </div>
                    <div className={styles.otherText}>
                      <strong>Other</strong>
                      <small>Any other return destination</small>
                    </div>
                    <ChevronRight size={18} />
                  </div>

                  {/* Search Store / Seller */}
                  <div className={styles.searchStoreHeaderRow}>
                    <strong>Select store or seller</strong>
                    <button
                      type="button"
                      className={styles.cantFindLink}
                      onClick={() => updateField('destinationName', 'Custom Seller')}
                    >
                      Can't find? Enter address <ChevronRight size={11} />
                    </button>
                  </div>

                  <div className={styles.storeSearchInputRow}>
                    <Search size={16} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search store, brand or seller name..."
                      value={formData.searchStoreQuery}
                      onChange={(e) => updateField('searchStoreQuery', e.target.value)}
                    />
                    <Mic size={16} color="#94a3b8" />
                  </div>

                  {/* Recent Destinations List */}
                  <div className={styles.recentDestinationsContainer}>
                    <div
                      className={styles.recentDestinationTile}
                      onClick={() => updateField('destinationName', 'Amazon India')}
                    >
                      <div className={styles.recentTileIcon}>
                        <ShoppingCart size={18} />
                      </div>
                      <div className={styles.recentTileText}>
                        <strong>Amazon India</strong>
                        <small>Bengaluru, Karnataka</small>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <div className={styles.tileDivider} />
                    <div
                      className={styles.recentDestinationTile}
                      onClick={() => updateField('destinationName', 'Flipkart')}
                    >
                      <div className={styles.recentTileIcon}>
                        <Store size={18} />
                      </div>
                      <div className={styles.recentTileText}>
                        <strong>Flipkart</strong>
                        <small>Bengaluru, Karnataka</small>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <div className={styles.tileDivider} />
                    <div
                      className={styles.recentDestinationTile}
                      onClick={() => updateField('destinationName', 'ABC Electronics Returns Centre')}
                    >
                      <div className={styles.recentTileIcon}>
                        <Building size={18} />
                      </div>
                      <div className={styles.recentTileText}>
                        <strong>ABC Electronics Returns Centre</strong>
                        <small>HSR Layout, Bengaluru, Karnataka</small>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 5: ITEM DETAILS */}
              {currentStep === 5 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 5</span>
                    <h2>Item Details</h2>
                    <p>Tell us about the item you want to return.</p>
                  </div>

                  {/* Item Category */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Item Category <span className={styles.requiredStar}>*</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <Layers size={20} />
                      </div>
                      <div className={styles.standardInputWrap}>
                        <select
                          className={styles.standardInput}
                          value={formData.itemCategory}
                          onChange={(e) => updateField('itemCategory', e.target.value)}
                        >
                          <option value="ELECTRONICS">Electronics & Gadgets</option>
                          <option value="CLOTHING_APPAREL">Clothing & Apparel</option>
                          <option value="FOOTWEAR">Footwear & Shoes</option>
                          <option value="HOME_KITCHEN">Home & Kitchen Appliances</option>
                          <option value="BOOKS_STATIONERY">Books & Stationery</option>
                          <option value="OTHER">Other Items</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Item Description */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Item Description <span className={styles.requiredStar}>*</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <FileText size={20} />
                      </div>
                      <div className={styles.itemDescStack}>
                        <textarea
                          className={styles.itemDescTextarea}
                          maxLength={200}
                          placeholder="Describe the item, brand, model, color, etc."
                          value={formData.itemDescription}
                          onChange={(e) => updateField('itemDescription', e.target.value)}
                        />
                        <span className={styles.charCounter}>
                          {formData.itemDescription.length}/200
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Item Value */}
                  <div className={styles.twoColsRow}>
                    <div className={styles.fieldBlock}>
                      <div className={styles.fieldLabelRow}>
                        <span className={styles.fieldLabel}>
                          Quantity <span className={styles.requiredStar}>*</span>
                        </span>
                      </div>
                      <div className={styles.inputRowWithAmberIcon}>
                        <div className={styles.amberIconSquare}>
                          <Package size={20} />
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          className={styles.standardInput}
                          value={formData.itemQuantity}
                          onChange={(e) => updateField('itemQuantity', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.fieldBlock}>
                      <div className={styles.fieldLabelRow}>
                        <span className={styles.fieldLabel}>
                          Item Value (₹) <span className={styles.requiredStar}>*</span>
                        </span>
                      </div>
                      <div className={styles.inputRowWithAmberIcon}>
                        <div className={styles.amberIconSquare}>
                          <Tag size={20} />
                        </div>
                        <input
                          type="number"
                          className={styles.standardInput}
                          placeholder="Approximate value"
                          value={formData.declaredValue}
                          onChange={(e) => updateField('declaredValue', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weight & Dimensions */}
                  <div className={styles.twoColsRow}>
                    <div className={styles.fieldBlock}>
                      <div className={styles.fieldLabelRow}>
                        <span className={styles.fieldLabel}>
                          Weight (Approx. kg) <span className={styles.requiredStar}>*</span>
                        </span>
                      </div>
                      <div className={styles.inputRowWithAmberIcon}>
                        <div className={styles.amberIconSquare}>
                          <Truck size={20} />
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          className={styles.standardInput}
                          placeholder="0.5"
                          value={formData.approxWeightKg}
                          onChange={(e) => updateField('approxWeightKg', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.fieldBlock}>
                      <div className={styles.fieldLabelRow}>
                        <span className={styles.fieldLabel}>
                          Dimensions (Approx. cm) <span className={styles.optionalTag}>(Optional)</span>
                        </span>
                      </div>
                      <div className={styles.dimBoxesRow}>
                        <div className={styles.dimBox}>
                          <input
                            type="number"
                            placeholder="18"
                            value={formData.lengthCm || ''}
                            onChange={(e) => updateField('lengthCm', e.target.value)}
                          />
                          <label>L (cm)</label>
                        </div>
                        <div className={styles.dimBox}>
                          <input
                            type="number"
                            placeholder="15"
                            value={formData.widthCm || ''}
                            onChange={(e) => updateField('widthCm', e.target.value)}
                          />
                          <label>W (cm)</label>
                        </div>
                        <div className={styles.dimBox}>
                          <input
                            type="number"
                            placeholder="8"
                            value={formData.heightCm || ''}
                            onChange={(e) => updateField('heightCm', e.target.value)}
                          />
                          <label>H (cm)</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item Condition */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Item Condition <span className={styles.requiredStar}>*</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <ShieldCheck size={20} />
                      </div>
                      <div className={styles.conditionCardsRow}>
                        {[
                          { id: 'NEW_UNUSED', label: 'New / Unused', icon: Package },
                          { id: 'USED_GOOD', label: 'Used - Good', icon: CheckCircle },
                          { id: 'DAMAGED', label: 'Damaged', icon: AlertCircle }
                        ].map((cond) => {
                          const IconC = cond.icon
                          const isSel = formData.itemCondition === cond.id
                          return (
                            <div
                              key={cond.id}
                              className={`${styles.conditionCard} ${isSel ? styles.selected : ''}`}
                              onClick={() => updateField('itemCondition', cond.id)}
                            >
                              <div className={styles.conditionCheckMark}>
                                {isSel && <Check size={8} strokeWidth={3} />}
                              </div>
                              <IconC size={18} className={styles.conditionCardIcon} />
                              <strong>{cond.label}</strong>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Special Handling */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Special Handling <span className={styles.optionalTag}>(Optional)</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <AlertCircle size={20} />
                      </div>
                      <div className={styles.handlingChipsWrap}>
                        {['Fragile', 'Handle with care', 'Keep Dry', 'High Value Item'].map((tag) => {
                          const isSel = formData.specialHandlingTags.includes(tag)
                          return (
                            <div
                              key={tag}
                              className={`${styles.handlingChip} ${isSel ? styles.selected : ''}`}
                              onClick={() => toggleSpecialHandling(tag)}
                            >
                              <span>{tag}</span>
                              <div className={styles.chipBox}>
                                {isSel && <Check size={8} strokeWidth={3} />}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Item Photos */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        Item Photos <span className={styles.optionalTag}>(Optional, up to 5 photos)</span>
                      </span>
                    </div>
                    <div className={styles.inputRowWithAmberIcon}>
                      <div className={styles.amberIconSquare}>
                        <Camera size={20} />
                      </div>
                      <div
                        className={styles.photosDropBox}
                        onClick={() => {
                          const sample = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'
                          if (formData.itemPhotos.length < 5) {
                            setFormData((prev) => ({
                              ...prev,
                              itemPhotos: [...prev.itemPhotos, sample]
                            }))
                          }
                        }}
                      >
                        <Camera size={22} color="#94a3b8" />
                        <strong>Add photos of the item</strong>
                        <small>Click to upload photo ({formData.itemPhotos.length}/5 added)</small>
                        {formData.itemPhotos.length > 0 && (
                          <div className={styles.photoThumbnailsRow}>
                            {formData.itemPhotos.map((photo, i) => (
                              <img key={i} src={photo} alt={`Item ${i}`} className={styles.photoThumb} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tip Banner */}
                  <div className={styles.tipBanner}>
                    <Info size={18} className={styles.bannerAmberIcon} />
                    <div className={styles.bannerText}>
                      <strong>Tip</strong>
                      <p>Clear photos and correct details help us deliver your return smoothly.</p>
                    </div>
                    <div className={styles.bannerRightIllustration}>
                      <Truck size={20} />
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 6: RETURN DOCUMENTS */}
              {currentStep === 6 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 6</span>
                    <h2>Return Documents</h2>
                    <p>Upload documents related to your return (if available).</p>
                  </div>

                  <div className={styles.documentCardsList}>
                    {documentTypesList.map((doc) => {
                      const isUploaded = formData.documents.some((d) => d.type === doc.id)
                      return (
                        <div key={doc.id} className={styles.docCard}>
                          <div className={styles.docIconSquare}>
                            <FileText size={20} />
                          </div>
                          <div className={styles.docInfo}>
                            <div className={styles.docTitleRow}>
                              <strong>{doc.title}</strong>
                              <span
                                className={
                                  doc.tag === 'Recommended'
                                    ? styles.recommendedBadge
                                    : styles.optionalBadge
                                }
                              >
                                {doc.tag}
                              </span>
                            </div>
                            <p>{doc.subtitle}</p>
                            <small>Accepted formats: JPG, PNG, PDF (Max 5MB)</small>
                          </div>
                          <div className={styles.docUploadAction}>
                            <button
                              type="button"
                              className={`${styles.uploadDocBtn} ${isUploaded ? styles.uploaded : ''}`}
                              onClick={() => handleAddSampleDoc(doc.title, doc.id)}
                            >
                              <Upload size={12} /> {isUploaded ? 'Uploaded' : 'Upload'}
                            </button>
                            <span className={styles.docCountText}>
                              {isUploaded ? '1/1 Uploaded' : '0/1 Uploaded'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Why Do We Need Documents Banner */}
                  <div className={styles.importantBanner}>
                    <Info size={20} className={styles.bannerAmberIcon} />
                    <div className={styles.bannerText}>
                      <strong>Why do we need documents?</strong>
                      <p>These documents help us process your return faster and ensure a smooth delivery.</p>
                    </div>
                    <div className={styles.bannerRightIllustration}>
                      <FileCheck size={20} />
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 7: HOW TO ADD RETURN DETAILS */}
              {currentStep === 7 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <div className={styles.heroHeaderRow}>
                      <div className={styles.heroHeaderText}>
                        <span className={styles.stepBadge}>Step 7</span>
                        <h2>How would you like to add return details?</h2>
                        <p>Choose the fastest way to provide your order and return information.</p>
                      </div>
                      <div className={styles.heroIllustrationCircle}>
                        <div className={styles.heroInnerIconBox}>
                          <QrCode size={24} />
                        </div>
                        <MapPin size={16} className={styles.heroFloatingPin} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.methodCardsList}>
                    {[
                      {
                        id: 'SCAN_LABEL',
                        title: 'Scan Return Label / QR Code',
                        badge: 'FASTEST',
                        subtitle: 'Scan the QR code or barcode on your return label / invoice.',
                        icon: QrCode
                      },
                      {
                        id: 'UPLOAD_SCREENSHOT',
                        title: 'Upload Screenshot',
                        subtitle: 'Upload a screenshot of your order, invoice or return details.',
                        icon: ImageIcon
                      },
                      {
                        id: 'ENTER_MANUALLY',
                        title: 'Enter Manually',
                        subtitle: 'Type your order ID, return ID and other details manually.',
                        icon: Edit3
                      }
                    ].map((item) => {
                      const IconC = item.icon
                      const isSel = formData.returnDetailsMethod === item.id
                      return (
                        <div
                          key={item.id}
                          className={`${styles.methodCard} ${isSel ? styles.selected : ''}`}
                          onClick={() => updateField('returnDetailsMethod', item.id)}
                        >
                          <div className={styles.methodIconBox}>
                            <IconC size={22} />
                          </div>
                          <div className={styles.methodText}>
                            <div className={styles.methodTitleRow}>
                              <strong>{item.title}</strong>
                              {item.badge && <span className={styles.fastestBadge}>{item.badge}</span>}
                            </div>
                            <p>{item.subtitle}</p>
                          </div>
                          <ChevronRight size={18} />
                        </div>
                      )
                    })}
                  </div>

                  {/* Why Scan Box */}
                  <div className={styles.whyScanBox}>
                    <div className={styles.whyScanTitle}>
                      <Sparkles size={16} color="#d97706" />
                      <span>Why scan?</span>
                    </div>
                    <div className={styles.whyScanBullet}>
                      <span className={styles.bulletCheck}>✓</span>
                      <span>Auto-detects order, return ID & product details</span>
                    </div>
                    <div className={styles.whyScanBullet}>
                      <span className={styles.bulletCheck}>✓</span>
                      <span>Saves time and reduces errors</span>
                    </div>
                    <div className={styles.whyScanBullet}>
                      <span className={styles.bulletCheck}>✓</span>
                      <span>Faster booking experience</span>
                    </div>
                  </div>

                  <div className={styles.orDividerRow}>
                    <div className={styles.orLine} />
                    <span className={styles.orText}>OR</span>
                    <div className={styles.orLine} />
                  </div>

                  {/* Import From Previous Returns Card */}
                  <div
                    className={styles.importPrevCard}
                    onClick={() => {
                      updateField('orderId', 'ORD-PREV-2918')
                      updateField('returnId', 'RET-PREV-1192')
                    }}
                  >
                    <div className={styles.docIconSquare}>
                      <Repeat size={18} />
                    </div>
                    <div className={styles.docInfo}>
                      <strong>Import from Previous Returns</strong>
                      <p>Select from your recent returns to prefill info</p>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>
                </section>
              )}

              {/* STEP 8: PICKUP DATE & TIME (SCHEDULE) */}
              {currentStep === 8 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 8</span>
                    <h2>Pickup Date & Time</h2>
                    <p>Choose your preferred pickup date and time.</p>
                  </div>

                  {/* Date Scroll Pills */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        <Calendar size={14} /> Select Pickup Date
                      </span>
                    </div>
                    <div className={styles.datePillsScroll}>
                      {dateOptions.map((item) => {
                        const isSel = formData.scheduledDate === item.iso
                        return (
                          <div
                            key={item.iso}
                            className={`${styles.datePill} ${isSel ? styles.selected : ''}`}
                            onClick={() => updateField('scheduledDate', item.iso)}
                          >
                            <span className={styles.pillDay}>{item.day}</span>
                            <span className={styles.pillDate}>{item.date}</span>
                            <span className={styles.pillMonth}>{item.month}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Slots 2 Columns */}
                  <div className={styles.fieldBlock}>
                    <div className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>
                        <Clock size={14} /> Select Pickup Time Slot
                      </span>
                      <small className={styles.optionalTag}>Timings shown in local time</small>
                    </div>
                    <div className={styles.timeSlotsGrid}>
                      {timeSlots.map((slot) => {
                        const isSel = formData.scheduledTimeSlot === slot.time
                        return (
                          <div
                            key={slot.time}
                            className={`${styles.timeSlotCard} ${isSel ? styles.selected : ''}`}
                            onClick={() => updateField('scheduledTimeSlot', slot.time)}
                          >
                            <div className={styles.slotTimeText}>
                              <strong>{slot.time}</strong>
                              {slot.badge && <span className={styles.slotBadge}>{slot.badge}</span>}
                            </div>
                            <div className={styles.slotCheckCircle}>
                              {isSel ? <CheckCircle2 size={16} color="#fab800" /> : <div className={styles.emptyCircle} />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Need Precise Time Box */}
                  <div className={styles.preciseTimeCard}>
                    <div className={styles.preciseIconBox}>
                      <CalendarDays size={18} />
                    </div>
                    <div className={styles.preciseText}>
                      <strong>Need Precise Time?</strong>
                      <small>Book a precise 2-hour slot for guaranteed on-time pickup.</small>
                    </div>
                    <button
                      type="button"
                      className={styles.preciseBtn}
                      onClick={() => updateField('deliveryService', 'PRECISE_TIME')}
                    >
                      Choose Precise Time
                    </button>
                  </div>

                  {/* Important Banner */}
                  <div className={styles.importantBanner}>
                    <Info size={18} className={styles.bannerAmberIcon} />
                    <div className={styles.bannerText}>
                      <strong>Important</strong>
                      <p>Our pickup executive will verify the item condition and pack it securely before dispatch.</p>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 9: REVIEW & CONFIRM */}
              {currentStep === 9 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 9</span>
                    <h2>Review & Confirm</h2>
                    <p>Please review your return details before confirming.</p>
                  </div>

                  {/* Notice Banner */}
                  <div className={styles.reviewNoticeBanner}>
                    <Shield size={16} className={styles.noticeShieldIcon} />
                    <span>You can edit any section by tapping on it.</span>
                  </div>

                  {/* Review Cards List */}
                  <div className={styles.reviewSectionsList}>
                    {/* 1. Pickup From */}
                    <div className={styles.reviewItemCard} onClick={() => setCurrentStep(2)}>
                      <div className={styles.reviewIndicatorGreen} />
                      <div className={styles.reviewCardBody}>
                        <div className={styles.reviewCardHeaderRow}>
                          <div className={styles.reviewIconAndTitle}>
                            <div className={`${styles.reviewIconBox} ${styles.iconBoxOrange}`}>
                              <Store size={18} />
                            </div>
                            <strong>Pickup From</strong>
                          </div>
                          <button
                            type="button"
                            className={styles.reviewEditBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentStep(2)
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                        </div>
                        <div className={styles.reviewDetailText}>
                          <div className={styles.reviewMainName}>{formData.pickupStoreName || 'Home'}</div>
                          <div className={styles.reviewSubAddress}>{formData.pickupAddress}</div>
                          <div className={styles.reviewSubAddress}>
                            {formData.pickupCity} {formData.pickupPostalCode}
                          </div>
                          <div className={styles.reviewContactRow}>
                            Contact: {formData.pickupContactName} | {formData.pickupPhoneNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Return To (Delivery Address) - REFLECTS SELECTED STORE / SHOP / SERVICE CENTER */}
                    <div className={styles.reviewItemCard} onClick={() => setCurrentStep(3)}>
                      <div className={styles.reviewIndicatorGreen} />
                      <div className={styles.reviewCardBody}>
                        <div className={styles.reviewCardHeaderRow}>
                          <div className={styles.reviewIconAndTitle}>
                            <div className={`${styles.reviewIconBox} ${styles.iconBoxPink}`}>
                              <MapPin size={18} />
                            </div>
                            <strong>Return To (Delivery Address)</strong>
                          </div>
                          <button
                            type="button"
                            className={styles.reviewEditBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentStep(3)
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                        </div>
                        <div className={styles.reviewDetailText}>
                          <div className={styles.reviewMainName}>
                            {formData.returnAddressType || 'Store'}
                          </div>
                          <div className={styles.reviewSubAddress}>{formData.returnAddress}</div>
                          <div className={styles.reviewSubAddress}>
                            {formData.returnCity} {formData.returnPostalCode}
                          </div>
                          <div className={styles.reviewContactRow}>
                            Contact: {formData.returnContactName} | {formData.returnPhoneNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Item Details */}
                    <div className={styles.reviewItemCard} onClick={() => setCurrentStep(5)}>
                      <div className={styles.reviewIndicatorGreen} />
                      <div className={styles.reviewCardBody}>
                        <div className={styles.reviewCardHeaderRow}>
                          <div className={styles.reviewIconAndTitle}>
                            <div className={`${styles.reviewIconBox} ${styles.iconBoxYellow}`}>
                              <Package size={18} />
                            </div>
                            <strong>Item Details</strong>
                          </div>
                          <button
                            type="button"
                            className={styles.reviewEditBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentStep(5)
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                        </div>
                        <div className={styles.reviewDetailText}>
                          <div className={styles.reviewMainName}>{formData.itemDescription || 'Item for return'}</div>
                          <div className={styles.reviewMetaRow}>
                            Qty: {formData.itemQuantity} | Weight: {formData.approxWeightKg} kg | Value: ₹{formData.declaredValue || 0}
                          </div>
                          <div className={styles.reviewConditionText}>
                            Condition: {formData.itemCondition === 'NEW_UNUSED' ? 'New / Unused' : formData.itemCondition === 'USED_GOOD' ? 'Used - Good' : 'Damaged / Defective'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Documents */}
                    <div className={styles.reviewItemCard} onClick={() => setCurrentStep(6)}>
                      <div className={styles.reviewIndicatorGreen} />
                      <div className={styles.reviewCardBody}>
                        <div className={styles.reviewCardHeaderRow}>
                          <div className={styles.reviewIconAndTitle}>
                            <div className={`${styles.reviewIconBox} ${styles.iconBoxPurple}`}>
                              <FileText size={18} />
                            </div>
                            <strong>Documents</strong>
                          </div>
                          <button
                            type="button"
                            className={styles.reviewEditBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentStep(6)
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                        </div>
                        <div className={styles.reviewDetailText}>
                          <div className={styles.reviewMainName}>Return Authorization (If any)</div>
                          <div className={styles.reviewDocBadge}>
                            <CheckCircle2 size={14} color="#16a34a" /> {formData.documents?.length || 1} Uploaded
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Pickup Schedule */}
                    <div className={styles.reviewItemCard} onClick={() => setCurrentStep(8)}>
                      <div className={styles.reviewIndicatorGreen} />
                      <div className={styles.reviewCardBody}>
                        <div className={styles.reviewCardHeaderRow}>
                          <div className={styles.reviewIconAndTitle}>
                            <div className={`${styles.reviewIconBox} ${styles.iconBoxAmber}`}>
                              <CalendarDays size={18} />
                            </div>
                            <strong>Pickup Schedule</strong>
                          </div>
                          <button
                            type="button"
                            className={styles.reviewEditBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentStep(8)
                            }}
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                        </div>
                        <div className={styles.reviewDetailText}>
                          <div className={styles.reviewMainName}>{formData.scheduledDate}</div>
                          <div className={styles.reviewSubAddress}>{formData.scheduledTimeSlot}</div>
                        </div>
                      </div>
                    </div>

                    {/* 6. Delivery Service */}
                    <div className={styles.reviewItemCard}>
                      <div className={styles.reviewIndicatorGreen} />
                      <div className={styles.reviewCardBody}>
                        <div className={styles.reviewCardHeaderRow}>
                          <div className={styles.reviewIconAndTitle}>
                            <div className={`${styles.reviewIconBox} ${styles.iconBoxRed}`}>
                              <Truck size={18} />
                            </div>
                            <strong>Delivery Service</strong>
                          </div>
                        </div>
                        <div className={styles.serviceCardsRow} style={{ marginTop: 12 }}>
                          {[
                            { id: 'STANDARD', name: 'Standard Delivery', eta: 'Delivery in 2 - 4 Working Days', price: '₹89', icon: Truck },
                            { id: 'EXPRESS', name: 'Express Delivery', eta: 'Delivery in 24 - 48 Hours', price: '₹149', icon: Rocket },
                            { id: 'PRECISE_TIME', name: 'Precise Time Delivery', eta: 'Selected 2-hr window', price: '₹199', icon: Clock }
                          ].map((svc) => {
                            const IconC = svc.icon
                            const isSel = formData.deliveryService === svc.id
                            return (
                              <div
                                key={svc.id}
                                className={`${styles.serviceCard} ${isSel ? styles.selected : ''}`}
                                onClick={() => updateField('deliveryService', svc.id)}
                              >
                                <div className={styles.serviceHeader}>
                                  <strong>{svc.name}</strong>
                                  <span className={styles.servicePrice}>{svc.price}</span>
                                </div>
                                <div className={styles.serviceEta}>{svc.eta}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 7. Payment Methods */}
                    <div className={styles.reviewItemCard}>
                      <div className={styles.reviewIndicatorGreen} />
                      <div className={styles.reviewCardBody}>
                        <div className={styles.reviewCardHeaderRow}>
                          <div className={styles.reviewIconAndTitle}>
                            <div className={`${styles.reviewIconBox} ${styles.iconBoxAmber}`}>
                              <Wallet size={18} />
                            </div>
                            <strong>Select Payment Method</strong>
                          </div>
                        </div>
                        <div className={styles.paymentMethodsGrid} style={{ marginTop: 12 }}>
                          {[
                            { id: 'PAY_ON_PICKUP', label: 'Pay on Pickup (Cash / UPI)', icon: Wallet },
                            { id: 'UPI', label: 'Instant UPI (GPay / PhonePe)', icon: Sparkles },
                            { id: 'WALLET', label: 'Delivez Wallet', icon: Wallet },
                            { id: 'CARD', label: 'Debit / Credit Card', icon: CreditCard }
                          ].map((pm) => {
                            const IconC = pm.icon
                            const isSel = formData.paymentMethod === pm.id
                            return (
                              <div
                                key={pm.id}
                                className={`${styles.paymentMethodCard} ${isSel ? styles.selected : ''}`}
                                onClick={() => updateField('paymentMethod', pm.id)}
                              >
                                <IconC size={18} color="#b45309" />
                                <span>{pm.label}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* SIDEBAR FARE SUMMARY */}
            <aside className={styles.sidebarColumn}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Fare Summary</h3>

                <div className={styles.breakdownList}>
                  {quote.breakdown.map((b) => (
                    <div
                      key={b.key}
                      className={`${styles.breakdownRow} ${b.amount < 0 ? styles.discount : ''}`}
                    >
                      <span>{b.label}</span>
                      <span>
                        {b.amount < 0 ? '-' : ''}₹{Math.abs(b.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.totalRow}>
                  <span>Total Amount</span>
                  <span className={styles.totalPrice}>₹{quote.totalAmount.toFixed(2)}</span>
                </div>

                {/* Coupon Input */}
                <div className={styles.couponWrap}>
                  <input
                    type="text"
                    className={styles.couponInput}
                    placeholder="COUPON CODE"
                    value={formData.couponCode}
                    onChange={(e) => updateField('couponCode', e.target.value)}
                  />
                  <button type="button" className={styles.applyCouponBtn}>
                    Apply
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* 5. STICKY BOTTOM ACTION BAR */}
      {currentStep <= 9 && (
        <footer className={styles.stickyBottomBar}>
          <div className={styles.bottomBarContainer}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {currentStep < 9 ? (
              <button type="button" className={styles.continueBtn} onClick={handleNext}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.continueBtn}
                disabled={submitting}
                onClick={handleConfirmBooking}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className={styles.spin} /> Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment <ChevronRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      )}

      {/* 6. AUTH MODAL */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}
