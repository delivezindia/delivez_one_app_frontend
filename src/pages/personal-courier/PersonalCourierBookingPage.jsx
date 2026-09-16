import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Copy,
  Info,
  Radio,
  FileText,
  Smartphone,
  Shirt,
  Gift,
  HeartPulse,
  Home as HomeIcon,
  Briefcase,
  MoreHorizontal,
  Package,
  Layers,
  Wine,
  Lock,
  CreditCard,
  Wallet,
  Zap,
  ChevronRight,
  Bike,
  Truck,
  ExternalLink,
  Edit2,
  Receipt,
  X,
  Plus,
  Scale,
  HelpCircle,
  Leaf,
  Box,
  Plane,
  Navigation
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'
import AuthModal from '@/features/auth/components/AuthModal.jsx'
import { createCourierBooking, fetchCourierQuote } from '@/features/personal-courier/services/personalCourierService.js'
import CourierTrackingView from './components/CourierTrackingView.jsx'
import styles from './PersonalCourierBookingPage.module.css'

export default function PersonalCourierBookingPage({ serviceSlug }) {
  // Stepper state: 1 to 9
  // 1: Pickup, 2: Drop-off, 3: Content, 4: Package, 5: Service, 6: Insurance, 7: Summary, 8: Payment, 9: Confirmed
  const [step, setStep] = useState(1)
  const [activeTrackingId, setActiveTrackingId] = useState(null)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // URL / initial service heuristic
  const searchParams = new URLSearchParams(window.location.search)
  const initialServiceName = searchParams.get('service') || (serviceSlug?.includes('intercity') ? 'Intercity' : 'Local Delivery')

  // Booking model state
  const [booking, setBooking] = useState({
    selectedService: initialServiceName,
    deliverySpeed: 'Bike Priority Delivery',
    deliveryPrice: 120,

    // Step 1: Pickup Location
    pickupTitle: 'Home',
    pickupAddressLine: 'B-1204, Lodha Park, Near Shreyas Cinema, Ghatkopar East, Mumbai 400077',
    pickupPhone: '+91 98765 43210',
    pickupContactPerson: 'Rahul Sharma',
    pickupCity: 'Lucknow',
    pickupState: 'Maharashtra',
    pickupInstructions: 'Call before arriving',
    preferredPickupTime: 'ASAP',
    pickupScheduleDate: 'Today',
    pickupScheduleSlot: '11:00 AM - 1:00 PM',

    // Step 2: Drop-off Location
    dropTitle: 'Office',
    dropAddressLine: 'DLF Cyber City, Tower A, 6th Floor, Gurugram, Haryana 122002',
    dropPhone: '+91 98765 43211',
    dropContactPerson: 'Rohit Mehra',
    dropCity: 'Gurugram',
    dropState: 'Haryana',
    dropInstructions: 'Please leave at reception',
    preferredDropTime: 'ASAP',
    dropScheduleDate: 'Tomorrow',
    dropScheduleSlot: '2:00 PM - 4:00 PM',

    // Step 3: Package Content (Screen 1)
    packageCategory: 'Electronics',
    packageDescription: '',

    // Step 4: Package Details (Screens 2, 3, 4, 5, 6, 7, 8, 9)
    parcelType: 'Medium', // Small | Medium | Large
    dimensions: { length: 30, width: 20, height: 10 },
    packageBoxRequired: 'yes', // 'yes' | 'no'
    selectedWeightCapacity: '10 Kg', // '10 Kg' | '15 Kg' | '25 Kg'
    selectedBoxSize: 'Small Box (10 Kg)',
    isCustomBox: false,
    customBoxDetails: {
      expectedWeight: '',
      length: '',
      width: '',
      height: '',
      category: 'Electronics',
      instructions: ''
    },
    actualWeight: 2.5,
    packagingType: 'STANDARD', // 'STANDARD' | 'EXTRA_SECURE' | 'WOODEN_CRATE'
    specialHandling: false,
    isFragile: false,
    isSecure: false,
    isCod: false,
    pickupReadiness: 'Today',

    // Step 5: Service Type & Self Service (Screens 10 & 11)
    selfServiceOption: null, // null | 'Self Pickup' | 'Self Drop'

    // Step 6: Insurance
    insuranceOption: 0, // 0 = Insure (Full), 1 = Basic (10k), 2 = None
    declaredValue: 25000,

    // Step 8: Payment
    paymentMethod: 'wallet',
    promoCode: 'DELIVEZ10',
    promoApplied: true,
    isGstEnabled: false,
    gstDetails: {
      businessName: 'Delivez Technologies Pvt. Ltd.',
      gstin: '27ABCDE1234F1Z5',
      legalName: 'Delivez Technologies Pvt. Ltd.',
      billingAddress: '501, 5th Floor, Tower A, Corporate Park, Andheri East, Mumbai 400093',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400093'
    },

    // Step 9: Confirmed
    bookingId: 'DLZC' + Math.floor(10000000 + Math.random() * 90000000)
  })

  // Modal Dialogs state
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleTarget, setScheduleTarget] = useState('pickup') // 'pickup' | 'drop'
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showDescModal, setShowDescModal] = useState(false)
  const [showCustomBoxModal, setShowCustomBoxModal] = useState(false)
  const [showPackagingModal, setShowPackagingModal] = useState(false)
  const [showPackagingWhyModal, setShowPackagingWhyModal] = useState(false)
  const [showGstModal, setShowGstModal] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [showNewPickupAddressForm, setShowNewPickupAddressForm] = useState(false)
  const [showNewDropAddressForm, setShowNewDropAddressForm] = useState(false)

  // Saved Addresses
  const [savedPickupAddresses, setSavedPickupAddresses] = useState([
    {
      id: 'p1',
      title: 'Home',
      addressLine: 'B-1204, Lodha Park, Near Shreyas Cinema, Ghatkopar East, Mumbai 400077',
      phone: '+91 98765 43210'
    },
    {
      id: 'p2',
      title: 'Warehouse Hub',
      addressLine: 'Unit 4B, Godown Area, Kanjurmarg West, Mumbai 400078',
      phone: '+91 98765 99887'
    }
  ])

  const [savedDropAddresses, setSavedDropAddresses] = useState([
    {
      id: 'd1',
      title: 'Office',
      addressLine: 'DLF Cyber City, Tower A, 6th Floor, Gurugram, Haryana 122002',
      phone: '+91 98765 43211'
    },
    {
      id: 'd2',
      title: 'Client Branch',
      addressLine: 'Ground Floor, Galleria Market, DLF Phase 4, Gurugram 122009',
      phone: '+91 98111 22334'
    }
  ])

  // Helper calculation for Volumetric & Chargeable Weight
  const lengthVal = Number(booking.dimensions.length) || 0
  const widthVal = Number(booking.dimensions.width) || 0
  const heightVal = Number(booking.dimensions.height) || 0
  const volumetricWeightKg = lengthVal && widthVal && heightVal ? Math.round(((lengthVal * widthVal * heightVal) / 5000) * 10) / 10 : 0
  const chargeableWeightKg = Math.max(Number(booking.actualWeight) || 0, volumetricWeightKg)

  // Pricing calculations
  const calculatePricing = () => {
    let baseSpeedPrice = booking.deliveryPrice || 120
    if (booking.deliverySpeed?.includes('Bike')) baseSpeedPrice = 120
    else if (booking.deliverySpeed?.includes('Same Day')) baseSpeedPrice = 150
    else if (booking.deliverySpeed?.includes('Drone')) baseSpeedPrice = 200
    else if (booking.deliverySpeed?.includes('Next Day')) baseSpeedPrice = 100

    const boxFee = booking.packageBoxRequired === 'yes' ? (booking.selectedWeightCapacity === '25 Kg' ? 60 : booking.selectedWeightCapacity === '15 Kg' ? 45 : 30) : 0
    const packagingUpgradeFee = booking.packagingType === 'WOODEN_CRATE' ? 149 : booking.packagingType === 'EXTRA_SECURE' ? 49 : 0
    const handlingFee = (booking.isFragile ? 25 : 0) + (booking.isSecure ? 35 : 0)
    const insuranceFee = booking.insuranceOption === 0 ? Math.round((Number(booking.declaredValue) || 25000) * 0.0075) : (booking.insuranceOption === 1 ? 49 : 0)
    const selfServiceDiscount = booking.selfServiceOption === 'Self Pickup' ? 50 : booking.selfServiceOption === 'Self Drop' ? 40 : 0

    const subtotal = Math.max(40, baseSpeedPrice + boxFee + packagingUpgradeFee + handlingFee + insuranceFee - selfServiceDiscount)
    const discount = booking.promoApplied ? Math.min(50, Math.round(subtotal * 0.1)) : 0
    const tax = Math.round((subtotal - discount) * 0.18)
    const total = Math.round(subtotal - discount + tax)

    return {
      baseSpeedPrice,
      boxFee,
      packagingUpgradeFee,
      handlingFee,
      insuranceFee,
      selfServiceDiscount,
      subtotal,
      discount,
      tax,
      total
    }
  }

  const pricing = calculatePricing()

  // Real backend booking execution
  const executeBookingCreation = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        serviceType: booking.deliverySpeed || 'BIKE_PRIORITY',
        deliverySpeed: booking.deliverySpeed || 'BIKE_PRIORITY',
        selfServiceOption: booking.selfServiceOption === 'Self Pickup' ? 'SELF_PICKUP' : booking.selfServiceOption === 'Self Drop' ? 'SELF_DROP' : null,
        packageCategory: booking.packageCategory,
        category: booking.packageCategory,
        contentCategory: booking.packageCategory,
        pickup: {
          title: booking.pickupTitle || 'Pickup Location',
          addressLine1: booking.pickupAddressLine || 'B-1204, Lodha Park, Near Shreyas Cinema, Ghatkopar East, Mumbai 400077',
          addressLine: booking.pickupAddressLine || 'B-1204, Lodha Park, Near Shreyas Cinema, Ghatkopar East, Mumbai 400077',
          contactPerson: booking.pickupContactPerson || 'Rahul Sharma',
          contactName: booking.pickupContactPerson || 'Rahul Sharma',
          phone: booking.pickupPhone || '+91 98765 43210',
          phoneNumber: booking.pickupPhone || '+91 98765 43210',
          city: booking.pickupCity || 'Lucknow',
          state: booking.pickupState || 'Maharashtra',
          postalCode: '400077',
          preferredTime: booking.preferredPickupTime || 'ASAP',
          instructions: booking.pickupInstructions || ''
        },
        dropoff: {
          title: booking.dropTitle || 'Drop-off Location',
          addressLine1: booking.dropAddressLine || 'DLF Cyber City, Tower A, 6th Floor, Gurugram, Haryana 122002',
          addressLine: booking.dropAddressLine || 'DLF Cyber City, Tower A, 6th Floor, Gurugram, Haryana 122002',
          contactPerson: booking.dropContactPerson || 'Rohit Mehra',
          contactName: booking.dropContactPerson || 'Rohit Mehra',
          phone: booking.dropPhone || '+91 98765 43211',
          phoneNumber: booking.dropPhone || '+91 98765 43211',
          city: booking.dropCity || 'Gurugram',
          state: booking.dropState || 'Haryana',
          postalCode: '122002',
          instructions: booking.dropInstructions || ''
        },
        package: {
          parcelSize: booking.parcelType?.toUpperCase() || 'MEDIUM',
          actualWeightKg: Number(booking.actualWeight) || 2.5,
          chargeableWeightKg: chargeableWeightKg,
          lengthCm: Number(booking.dimensions.length) || 30,
          widthCm: Number(booking.dimensions.width) || 20,
          heightCm: Number(booking.dimensions.height) || 10,
          dimensions: {
            length: Number(booking.dimensions.length) || 30,
            width: Number(booking.dimensions.width) || 20,
            height: Number(booking.dimensions.height) || 10,
            lengthCm: Number(booking.dimensions.length) || 30,
            widthCm: Number(booking.dimensions.width) || 20,
            heightCm: Number(booking.dimensions.height) || 10,
          },
          needsBox: booking.packageBoxRequired === 'yes',
          boxSize: booking.selectedBoxSize,
          weightCapacity: booking.selectedWeightCapacity,
          isCustomBox: Boolean(booking.isCustomBox),
          customBoxDetails: booking.isCustomBox ? booking.customBoxDetails : null,
          packagingType: booking.packageBoxRequired === 'no' ? 'OWN_PACKAGING' : (booking.packagingType || 'STANDARD'),
          specialHandling: Boolean(booking.specialHandling),
          fragile: Boolean(booking.isFragile),
          secureHandling: Boolean(booking.isSecure),
          packageCategory: booking.packageCategory,
          category: booking.packageCategory,
          contentCategory: booking.packageCategory,
          contentDescription: booking.packageDescription || 'Personal Courier package',
          declaredValue: Number(booking.declaredValue) || 25000,
          insuranceType: booking.insuranceOption === 0 ? 'FULL' : booking.insuranceOption === 1 ? 'BASIC' : 'NONE'
        },
        paymentMethod: booking.paymentMethod === 'wallet' ? 'DELIVEZ_WALLET' : 'ONLINE'
      }

      const created = await createCourierBooking(payload)
      if (created?.id || created?.bookingNumber) {
        setConfirmedBooking(created)
        setBooking((prev) => ({
          ...prev,
          ...created,
          bookingId: created.bookingNumber || created.id || prev.bookingId,
          packageCategory: created.category || created.itemCategory || created.contentCategory || created.packageDetails?.category || prev.packageCategory,
          actualWeight: created.actualWeightKg ?? created.packageDetails?.actualWeightKg ?? prev.actualWeight,
          chargeableWeightKg: created.chargeableWeightKg ?? created.packageDetails?.chargeableWeightKg ?? prev.chargeableWeightKg,
          deliverySpeed: created.serviceName ?? created.serviceSpeed ?? created.deliverySpeed ?? prev.deliverySpeed,
          packagingType: created.packagingName ?? created.packagingType ?? prev.packagingType,
          selfServiceOption: created.selfServiceLabel ?? created.selfServiceOption ?? prev.selfServiceOption,
        }))
        setStep(9)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        throw new Error('Could not retrieve booking reference from response.')
      }
    } catch (err) {
      console.error('Courier booking creation error:', err)
      setSubmitError(err?.message || 'Failed to complete booking with server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Stepper Navigation
  const handleNext = async () => {
    if (step === 8) {
      // Check user authentication
      const token = getUserAccessToken()
      if (!token) {
        setAuthModalOpen(true)
        return
      }
      await executeBookingCreation()
      return
    }

    if (step < 9) {
      setStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigateTo('/courier')
    }
  }

  // Categories list for Step 3 (Screen 1)
  const categories = [
    { title: 'Documents', subtitle: 'Papers, files, certificates, books, etc.', icon: FileText, bg: '#FFF9E6', color: '#D97706' },
    { title: 'Electronics', subtitle: 'Mobile, laptop, gadgets, accessories, etc.', icon: Smartphone, bg: '#FFF1F2', color: '#E11D48' },
    { title: 'Clothing & Apparel', subtitle: 'Clothes, shoes, cap, fashion items, etc.', icon: Shirt, bg: '#EEF2FF', color: '#4F46E5' },
    { title: 'Gifts & Toys', subtitle: 'Gift items, toys, decorative items, etc.', icon: Gift, bg: '#FFFDF0', color: '#D97706' },
    { title: 'Health & Medicine', subtitle: 'Medicines, supplements, medical ...', icon: HeartPulse, bg: '#ECFDF5', color: '#059669' },
    { title: 'Household Items', subtitle: 'Kitchenware, home decor, daily use items, ...', icon: HomeIcon, bg: '#FFF7ED', color: '#EA580C' },
    { title: 'Commercial Goods', subtitle: 'Samples, parts, raw materials, products, etc.', icon: Briefcase, bg: '#F0F9FF', color: '#0284C7' },
    { title: 'Others', subtitle: 'Other items not listed above.', icon: MoreHorizontal, bg: '#F9FAFB', color: '#4B5563' }
  ]

  // Box data for Step 4 (Screens 3 & 4)
  const boxOptions = {
    '10 Kg': [
      { title: 'Small Box (10 Kg)', dims: '30 cm (L) x 20 cm (W) x 20 cm (H)', l: 30, w: 20, h: 20, tag: 'Best for Documents, Books, Electronics', cap: 'Up to 10 Kg', vol: 'Volume: 12,000 cm³' },
      { title: 'Medium Box (10 Kg)', dims: '30 cm (L) x 30 cm (W) x 25 cm (H)', l: 30, w: 30, h: 25, tag: 'Best for Clothing, Accessories, Home Items', cap: 'Up to 10 Kg', vol: 'Volume: 22,500 cm³' },
      { title: 'Large Box (10 Kg)', dims: '40 cm (L) x 30 cm (W) x 30 cm (H)', l: 40, w: 30, h: 30, tag: 'Best for Shoes, Helmets, Small Appliances', cap: 'Up to 10 Kg', vol: 'Volume: 36,000 cm³' }
    ],
    '15 Kg': [
      { title: 'Small Box (15 Kg)', dims: '35 cm (L) x 25 cm (W) x 25 cm (H)', l: 35, w: 25, h: 25, tag: 'Best for Books, Electronics, Heavy Items', cap: 'Up to 15 Kg', vol: 'Volume: 21,875 cm³' },
      { title: 'Medium Box (15 Kg)', dims: '40 cm (L) x 30 cm (W) x 30 cm (H)', l: 40, w: 30, h: 30, tag: 'Best for Clothes, Appliances, Home Items', cap: 'Up to 15 Kg', vol: 'Volume: 36,000 cm³' },
      { title: 'Large Box (15 Kg)', dims: '45 cm (L) x 35 cm (W) x 35 cm (H)', l: 45, w: 35, h: 35, tag: 'Best for Multiple Clothes, Blankets, Kitchenware', cap: 'Up to 15 Kg', vol: 'Volume: 55,125 cm³' }
    ],
    '25 Kg': [
      { title: 'Medium Box (25 Kg)', dims: '45 cm (L) x 35 cm (W) x 40 cm (H)', l: 45, w: 35, h: 40, tag: 'Best for Clothing, Shoes, Books, Home Items', cap: 'Up to 25 Kg', vol: 'Volume: 63,000 cm³' },
      { title: 'Large Box (25 Kg)', dims: '50 cm (L) x 40 cm (W) x 45 cm (H)', l: 50, w: 40, h: 45, tag: 'Best for Appliances, Toys, Small Machines', cap: 'Up to 25 Kg', vol: 'Volume: 90,000 cm³' },
      { title: 'Extra Large Box (25 Kg)', dims: '60 cm (L) x 45 cm (W) x 50 cm (H)', l: 60, w: 45, h: 50, tag: 'Best for Large Appliances, Bulk Items, Luggage', cap: 'Up to 25 Kg', vol: 'Volume: 135,000 cm³' }
    ]
  }

  // Packaging options (Screens 7 & 8)
  const packagingOptions = [
    {
      id: 'STANDARD',
      title: 'Delivez Standard Packaging',
      badge: 'Recommended',
      price: 0,
      priceLabel: 'Included in shipping cost',
      icon: Box,
      points: [
        'Strong & durable packaging',
        'Secure handling',
        'Suitable for most items',
        'Included in shipping cost'
      ]
    },
    {
      id: 'EXTRA_SECURE',
      title: 'Extra Secure Packaging',
      badge: '',
      price: 49,
      priceLabel: '₹ 49.00',
      icon: Layers,
      points: [
        'Double wall box',
        'Extra cushioning',
        'Better protection for fragile items',
        'Additional charges apply'
      ]
    },
    {
      id: 'WOODEN_CRATE',
      title: 'Wooden Crate Packaging',
      badge: '',
      price: 149,
      priceLabel: '₹ 149.00',
      icon: HomeIcon,
      points: [
        'Maximum protection',
        'Ideal for heavy or fragile items',
        'Shock & impact resistant',
        'Additional charges apply'
      ]
    }
  ]

  // Service tiers for Step 5 (Screens 10 & 11)
  const localServices = [
    {
      title: 'Bike Priority Delivery',
      badge: 'FASTEST',
      badgeClass: styles.serviceBadgeFastest,
      desc: 'Lightning fast delivery by bike for urgent and time-sensitive shipments.',
      time: 'Delivery in 1 – 3 hours',
      price: 120,
      icon: Bike,
      tags: ['Fastest', 'Real-time Tracking', 'High Priority']
    },
    {
      title: 'Same Day Delivery',
      badge: 'TODAY',
      badgeClass: styles.serviceBadgeToday,
      desc: 'Delivered on the same day within city limits.',
      time: 'Delivery by 8 PM today',
      price: 150,
      icon: Truck,
      tags: ['Same Day', 'Reliable', 'Doorstep Delivery']
    },
    {
      title: 'Hybrid Drone Delivery',
      badge: '',
      desc: 'Next-gen delivery using drone & road hybrid network.',
      time: 'Delivery in 30 – 90 mins (if eligible)',
      price: 200,
      icon: Plane,
      tags: ['Eco-friendly', 'Innovative', 'Secure']
    },
    {
      title: 'Next Day Delivery',
      badge: '',
      desc: 'Cost-effective delivery for non-urgent shipments.',
      time: 'Delivery by end of next day',
      price: 100,
      icon: Package,
      tags: ['Next Day', 'Affordable', 'Reliable']
    }
  ]

  if (activeTrackingId) {
    return (
      <CourierTrackingView
        bookingId={activeTrackingId}
        initialBooking={confirmedBooking || booking}
        onBack={() => setActiveTrackingId(null)}
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="Go Back">
              <ArrowLeft size={18} />
            </button>
            <div className={styles.headerTitleCol}>
              <h1 className={styles.headerTitle}>
                {step === 1 && 'Pickup Location'}
                {step === 2 && 'Drop-off Location'}
                {step === 3 && 'Package Content'}
                {step === 4 && 'Package Details'}
                {step === 5 && 'Service Type'}
                {step === 6 && 'Insurance'}
                {step === 7 && 'Summary'}
                {step === 8 && 'Payment'}
                {step === 9 && 'Booking Confirmed'}
              </h1>
              <p className={styles.headerSub}>Step {step} of 8 • Personal Courier</p>
            </div>
          </div>

          <span className={styles.serviceBadge}>
            <Package size={13} />
            {booking.selectedService}
          </span>
        </div>
      </header>

      {/* Stepper Bar (Steps 1 to 8 matching WhatsApp Screenshots) */}
      <div className={styles.stepperWrap}>
        <div className={styles.stepperInner}>
          {[
            { num: 1, label: 'Pickup' },
            { num: 2, label: 'Drop-off' },
            { num: 3, label: 'Content' },
            { num: 4, label: 'Package' },
            { num: 5, label: 'service' },
            { num: 6, label: 'Insurance' },
            { num: 7, label: 'Summary' },
            { num: 8, label: 'Payment' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                className={styles.stepItem}
                onClick={() => {
                  if (s.num < step) setStep(s.num)
                }}
              >
                <div
                  className={`${styles.stepCircle} ${
                    step === s.num ? styles.stepCircleActive : step > s.num ? styles.stepCircleCompleted : ''
                  }`}
                >
                  {step > s.num ? <Check size={14} /> : s.num}
                </div>
                <span className={`${styles.stepLabel} ${step === s.num ? styles.stepLabelActive : ''}`}>
                  {s.label}
                </span>
              </div>
              {idx < 7 && (
                <div
                  className={`${styles.stepLine} ${step > s.num ? styles.stepLineCompleted : ''}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Step Container */}
      <main className={styles.mainContent}>
        {/* STEP 1: PICKUP LOCATION (LocalPickupLocationPage)                   */}
        {/* ==================================================================== */}
        {step === 1 && (
          <>
            {/* Saved Addresses Section */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Saved Addresses</h2>
                  <p className={styles.cardSub}>Select where our courier should collect the parcel</p>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#E11D48',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.86rem'
                  }}
                  onClick={() => setShowNewPickupAddressForm(!showNewPickupAddressForm)}
                >
                  {showNewPickupAddressForm ? 'Cancel' : '+ Add New'}
                </button>
              </div>

              <div className={styles.addressList}>
                {savedPickupAddresses.map((addr) => {
                  const isSelected = booking.pickupAddressLine === addr.addressLine
                  return (
                    <div
                      key={addr.id}
                      className={`${styles.addressItem} ${isSelected ? styles.addressItemSelected : ''}`}
                      onClick={() =>
                        setBooking({
                          ...booking,
                          pickupTitle: addr.title,
                          pickupAddressLine: addr.addressLine,
                          pickupPhone: addr.phone
                        })
                      }
                    >
                      <div className={styles.addressIconWrap}>
                        <MapPin size={18} />
                      </div>
                      <div className={styles.addressBody}>
                        <div className={styles.addressTitle}>{addr.title}</div>
                        <div className={styles.addressLine}>{addr.addressLine}</div>
                        <div className={styles.addressPhone}>{addr.phone}</div>
                      </div>
                      <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleActive : ''}`}>
                        {isSelected && <div className={styles.radioInnerDot} />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Inline Add Address Form */}
              {showNewPickupAddressForm && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 12 }}>
                  <strong style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Enter New Pickup Address</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Address Line 1 (Flat, House no, Building)"
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                      id="newPickupLine1"
                    />
                    <input
                      type="text"
                      placeholder="Area / Landmark / Sector"
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                      id="newPickupArea"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="City (e.g. Mumbai)"
                        defaultValue="Mumbai"
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        id="newPickupCity"
                      />
                      <input
                        type="text"
                        placeholder="Pincode (e.g. 400077)"
                        defaultValue="400077"
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        id="newPickupPincode"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Contact Person"
                        defaultValue={booking.pickupContactPerson}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        id="newPickupName"
                      />
                      <input
                        type="text"
                        placeholder="Mobile Number"
                        defaultValue={booking.pickupPhone}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        id="newPickupPhone"
                      />
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '9px 16px',
                        background: '#0f172a',
                        color: '#fff',
                        borderRadius: 8,
                        fontWeight: 750,
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: 4
                      }}
                      onClick={() => {
                        const line1 = document.getElementById('newPickupLine1')?.value
                        const area = document.getElementById('newPickupArea')?.value
                        const city = document.getElementById('newPickupCity')?.value
                        const pincode = document.getElementById('newPickupPincode')?.value
                        const name = document.getElementById('newPickupName')?.value
                        const phone = document.getElementById('newPickupPhone')?.value

                        if (line1 && phone) {
                          const full = `${line1}, ${area || ''}, ${city} ${pincode}`.trim()
                          const newAddr = { id: 'p' + Date.now(), title: name ? `Other (${name})` : 'Other', addressLine: full, phone }
                          setSavedPickupAddresses([...savedPickupAddresses, newAddr])
                          setBooking({
                            ...booking,
                            pickupTitle: newAddr.title,
                            pickupAddressLine: full,
                            pickupPhone: phone,
                            pickupContactPerson: name || booking.pickupContactPerson
                          })
                          setShowNewPickupAddressForm(false)
                        }
                      }}
                    >
                      Save Pickup Address
                    </button>
                  </div>
                </div>
              )}

              {/* Map Preview Card */}
              <div className={styles.mapPreviewBox}>
                <div className={styles.mapFloatingCard}>
                  <strong>{booking.pickupTitle} • Current Pickup Point</strong>
                  <span>{booking.pickupAddressLine}</span>
                </div>
                <MapPin size={34} className={styles.mapPinCenter} />
                <button
                  type="button"
                  className={styles.mapLocateBtn}
                  title="Detect my location"
                  onClick={() => alert('GPS location acquired: Ghatkopar East, Mumbai')}
                >
                  <MapPin size={16} />
                </button>
              </div>
            </div>

            {/* Preferred Pickup Time Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>Preferred Pickup Time</h2>
              <div className={styles.timingGrid}>
                {/* ASAP Option */}
                <div
                  className={`${styles.timingCard} ${booking.preferredPickupTime === 'ASAP' ? styles.timingCardSelected : ''}`}
                  onClick={() => setBooking({ ...booking, preferredPickupTime: 'ASAP' })}
                >
                  <div className={styles.timingLeft}>
                    <div className={styles.timingIconBox} style={{ background: '#FFF0B3', color: '#D97706' }}>
                      <Zap size={22} />
                    </div>
                    <div>
                      <div className={styles.timingTitleRow}>
                        <span className={styles.timingTitle}>ASAP</span>
                        <span className={styles.tagGreen}>Recommended</span>
                      </div>
                      <p className={styles.timingSub}>Pickup as soon as driver partner is assigned (30-45 mins)</p>
                    </div>
                  </div>
                  <div className={`${styles.radioCircle} ${booking.preferredPickupTime === 'ASAP' ? styles.radioCircleActive : ''}`}>
                    {booking.preferredPickupTime === 'ASAP' && <div className={styles.radioInnerDot} />}
                  </div>
                </div>

                {/* Schedule Later Option */}
                <div
                  className={`${styles.timingCard} ${booking.preferredPickupTime === 'SCHEDULE' ? styles.timingCardSelected : ''}`}
                  onClick={() => {
                    setScheduleTarget('pickup')
                    setShowScheduleModal(true)
                  }}
                >
                  <div className={styles.timingLeft}>
                    <div className={styles.timingIconBox} style={{ background: '#F1F5F9', color: '#475569' }}>
                      <Calendar size={22} />
                    </div>
                    <div>
                      <span className={styles.timingTitle}>Schedule Later</span>
                      <p className={styles.timingSub}>
                        {booking.preferredPickupTime === 'SCHEDULE'
                          ? `${booking.pickupScheduleDate}, ${booking.pickupScheduleSlot}`
                          : 'Pick a custom pickup date and time slot'}
                      </p>
                    </div>
                  </div>
                  <div className={`${styles.radioCircle} ${booking.preferredPickupTime === 'SCHEDULE' ? styles.radioCircleActive : ''}`}>
                    {booking.preferredPickupTime === 'SCHEDULE' && <div className={styles.radioInnerDot} />}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: DROP-OFF LOCATION (LocalDropOffLocationPage)                 */}
        {/* ==================================================================== */}
        {step === 2 && (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Saved Drop-off Addresses</h2>
                  <p className={styles.cardSub}>Where should we deliver your package?</p>
                </div>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#E11D48',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.86rem'
                  }}
                  onClick={() => setShowNewDropAddressForm(!showNewDropAddressForm)}
                >
                  {showNewDropAddressForm ? 'Cancel' : '+ Add New'}
                </button>
              </div>

              <div className={styles.addressList}>
                {savedDropAddresses.map((addr) => {
                  const isSelected = booking.dropAddressLine === addr.addressLine
                  return (
                    <div
                      key={addr.id}
                      className={`${styles.addressItem} ${isSelected ? styles.addressItemSelected : ''}`}
                      onClick={() =>
                        setBooking({
                          ...booking,
                          dropTitle: addr.title,
                          dropAddressLine: addr.addressLine,
                          dropPhone: addr.phone
                        })
                      }
                    >
                      <div className={styles.addressIconWrap}>
                        <MapPin size={18} />
                      </div>
                      <div className={styles.addressBody}>
                        <div className={styles.addressTitle}>{addr.title}</div>
                        <div className={styles.addressLine}>{addr.addressLine}</div>
                        <div className={styles.addressPhone}>{addr.phone}</div>
                      </div>
                      <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleActive : ''}`}>
                        {isSelected && <div className={styles.radioInnerDot} />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Inline Add Drop Address Form */}
              {showNewDropAddressForm && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 12 }}>
                  <strong style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem' }}>Enter New Drop-off Address</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Address Line 1 (Flat, House no, Building)"
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                      id="newDropLine1"
                    />
                    <input
                      type="text"
                      placeholder="Area / Locality / Landmark"
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                      id="newDropArea"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="City"
                        defaultValue="Gurugram"
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        id="newDropCity"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        defaultValue="122002"
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        id="newDropPincode"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Recipient Name"
                        defaultValue={booking.dropContactPerson}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        id="newDropName"
                      />
                      <input
                        type="text"
                        placeholder="Recipient Phone"
                        defaultValue={booking.dropPhone}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        id="newDropPhone"
                      />
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '9px 16px',
                        background: '#0f172a',
                        color: '#fff',
                        borderRadius: 8,
                        fontWeight: 750,
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: 4
                      }}
                      onClick={() => {
                        const line1 = document.getElementById('newDropLine1')?.value
                        const area = document.getElementById('newDropArea')?.value
                        const city = document.getElementById('newDropCity')?.value
                        const pincode = document.getElementById('newDropPincode')?.value
                        const name = document.getElementById('newDropName')?.value
                        const phone = document.getElementById('newDropPhone')?.value

                        if (line1 && phone) {
                          const full = `${line1}, ${area || ''}, ${city} ${pincode}`.trim()
                          const newAddr = { id: 'd' + Date.now(), title: name ? `Other (${name})` : 'Other', addressLine: full, phone }
                          setSavedDropAddresses([...savedDropAddresses, newAddr])
                          setBooking({
                            ...booking,
                            dropTitle: newAddr.title,
                            dropAddressLine: full,
                            dropPhone: phone,
                            dropContactPerson: name || booking.dropContactPerson
                          })
                          setShowNewDropAddressForm(false)
                        }
                      }}
                    >
                      Save Drop Address
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery Instructions */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                    Delivery Instructions (Optional)
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {booking.dropInstructions.length}/150
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={150}
                  value={booking.dropInstructions}
                  onChange={(e) => setBooking({ ...booking, dropInstructions: e.target.value })}
                  placeholder="E.g. Call upon arrival, leave at reception"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Map Preview Box */}
              <div className={styles.mapPreviewBox} style={{ marginTop: 14 }}>
                <div className={styles.mapFloatingCard}>
                  <strong>{booking.dropTitle} • Destination Point</strong>
                  <span>{booking.dropAddressLine}</span>
                </div>
                <MapPin size={34} className={styles.mapPinCenter} style={{ color: '#0F172A' }} />
              </div>
            </div>

            {/* Timing Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>Preferred Drop-off Time</h2>
              <div className={styles.timingGrid}>
                <div
                  className={`${styles.timingCard} ${booking.preferredDropTime === 'ASAP' ? styles.timingCardSelected : ''}`}
                  onClick={() => setBooking({ ...booking, preferredDropTime: 'ASAP' })}
                >
                  <div className={styles.timingLeft}>
                    <div className={styles.timingIconBox} style={{ background: '#FFF0B3', color: '#D97706' }}>
                      <Zap size={22} />
                    </div>
                    <div>
                      <div className={styles.timingTitleRow}>
                        <span className={styles.timingTitle}>Direct Drop</span>
                        <span className={styles.tagGreen}>Fastest</span>
                      </div>
                      <p className={styles.timingSub}>Deliver immediately following courier pickup</p>
                    </div>
                  </div>
                  <div className={`${styles.radioCircle} ${booking.preferredDropTime === 'ASAP' ? styles.radioCircleActive : ''}`}>
                    {booking.preferredDropTime === 'ASAP' && <div className={styles.radioInnerDot} />}
                  </div>
                </div>

                <div
                  className={`${styles.timingCard} ${booking.preferredDropTime === 'SCHEDULE' ? styles.timingCardSelected : ''}`}
                  onClick={() => {
                    setScheduleTarget('drop')
                    setShowScheduleModal(true)
                  }}
                >
                  <div className={styles.timingLeft}>
                    <div className={styles.timingIconBox} style={{ background: '#F1F5F9', color: '#475569' }}>
                      <Calendar size={22} />
                    </div>
                    <div>
                      <span className={styles.timingTitle}>Schedule Delivery Slot</span>
                      <p className={styles.timingSub}>
                        {booking.preferredDropTime === 'SCHEDULE'
                          ? `${booking.dropScheduleDate}, ${booking.dropScheduleSlot}`
                          : 'Deliver at a specific time slot'}
                      </p>
                    </div>
                  </div>
                  <div className={`${styles.radioCircle} ${booking.preferredDropTime === 'SCHEDULE' ? styles.radioCircleActive : ''}`}>
                    {booking.preferredDropTime === 'SCHEDULE' && <div className={styles.radioInnerDot} />}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        

        {/* ==================================================================== */}
        {/* STEP 3: PACKAGE CONTENT (Screen 1)                                   */}
        {/* ==================================================================== */}
        {step === 3 && (
          <>
            {/* Location Route Summary */}
            <div className={styles.locationSummaryCard}>
              <div className={styles.locCol}>
                <MapPin size={18} color="#FFB800" />
                <div className={styles.locText}>
                  <small>From</small>
                  <strong>{booking.pickupCity || 'Lucknow'}, {booking.pickupState || 'Maharashtra'}</strong>
                </div>
              </div>

              <div className={styles.locArrow}>
                <ArrowRight size={16} />
              </div>

              <div className={styles.locCol}>
                <MapPin size={18} color="#DC2626" />
                <div className={styles.locText}>
                  <small>To</small>
                  <strong>{booking.dropCity || 'Gurugram'}, {booking.dropState || 'Haryana'}</strong>
                </div>
              </div>
            </div>

            {/* Content Categories Grid */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>What's inside your package?</h2>
                  <p className={styles.cardSub}>This helps us handle your shipment safely and as per regulations.</p>
                </div>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    border: 'none',
                    background: 'transparent',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowInfoModal(true)}
                >
                  <Info size={14} />
                  Why is this important?
                </button>
              </div>

              <div className={styles.categoriesGrid}>
                {categories.map((cat) => {
                  const IconComp = cat.icon
                  const isSelected = booking.packageCategory === cat.title
                  return (
                    <div
                      key={cat.title}
                      className={`${styles.catTile} ${isSelected ? styles.catTileSelected : ''}`}
                      onClick={() => setBooking({ ...booking, packageCategory: cat.title })}
                    >
                      <div className={styles.catIconBox} style={{ background: cat.bg, color: cat.color }}>
                        <IconComp size={20} />
                      </div>
                      <div className={styles.catText}>
                        <div className={styles.catTitle}>{cat.title}</div>
                        <div className={styles.catSub}>{cat.subtitle}</div>
                      </div>
                      <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleActive : ''}`}>
                        {isSelected && <div className={styles.radioInnerDot} />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Describe your package box */}
              <div className={styles.describeBox} style={{ marginTop: 16 }}>
                <div className={styles.describeLeft}>
                  <div className={styles.describeIconCircle}>
                    <Edit2 size={18} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0F172A' }}>
                      Describe your package <span style={{ color: '#64748b', fontWeight: 500 }}>(Optional)</span>
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: booking.packageDescription ? '#0f172a' : '#64748b' }}>
                      {booking.packageDescription || 'Add a brief description of your package'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.describeBtn}
                  onClick={() => setShowDescModal(true)}
                >
                  {booking.packageDescription ? 'Edit Description' : 'Add Description'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: PACKAGE DETAILS (Screens 2, 3, 4, 5, 6, 7, 8, 9)             */}
        {/* ==================================================================== */}
        {step === 4 && (
          <>
            {/* Location Route Summary */}
            <div className={styles.locationSummaryCard}>
              <div className={styles.locCol}>
                <MapPin size={18} color="#FFB800" />
                <div className={styles.locText}>
                  <small>From</small>
                  <strong>{booking.pickupCity || 'Lucknow'}, {booking.pickupState || 'Maharashtra'}</strong>
                </div>
              </div>
              <ArrowRight size={16} className={styles.locArrow} />
              <div className={styles.locCol}>
                <MapPin size={18} color="#DC2626" />
                <div className={styles.locText}>
                  <small>To</small>
                  <strong>{booking.dropCity || 'Gurugram'}, {booking.dropState || 'Haryana'}</strong>
                </div>
              </div>
            </div>

            {/* Package Information Card (Parcel Type + Dimensions) (Screen 2) */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 4 }}>Package Information</h2>
              
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0F172A', marginTop: 12 }}>Parcel Type</strong>
              <div className={styles.parcelTypeGrid}>
                {/* Small */}
                <div
                  className={`${styles.parcelTypeCard} ${booking.parcelType === 'Small' ? styles.parcelTypeCardSelected : ''}`}
                  onClick={() => {
                    setBooking({
                      ...booking,
                      parcelType: 'Small',
                      dimensions: { length: 30, width: 20, height: 10 }
                    })
                  }}
                >
                  <div className={styles.parcelTypeTop}>
                    <Package size={24} className={styles.parcelTypeIconBox} />
                    <div className={`${styles.radioCircle} ${booking.parcelType === 'Small' ? styles.radioCircleActive : ''}`}>
                      {booking.parcelType === 'Small' && <div className={styles.radioInnerDot} />}
                    </div>
                  </div>
                  <div>
                    <div className={styles.parcelTypeName}>Small</div>
                    <div className={styles.parcelTypeWeight}>Up to 2 kg</div>
                    <div className={styles.parcelTypeDims}>Max. 30 x 20 x 10 cm</div>
                  </div>
                </div>

                {/* Medium */}
                <div
                  className={`${styles.parcelTypeCard} ${booking.parcelType === 'Medium' ? styles.parcelTypeCardSelected : ''}`}
                  onClick={() => {
                    setBooking({
                      ...booking,
                      parcelType: 'Medium',
                      dimensions: { length: 45, width: 35, height: 30 }
                    })
                  }}
                >
                  <div className={styles.parcelTypeTop}>
                    <Package size={24} className={styles.parcelTypeIconBox} />
                    <div className={`${styles.radioCircle} ${booking.parcelType === 'Medium' ? styles.radioCircleActive : ''}`}>
                      {booking.parcelType === 'Medium' && <div className={styles.radioInnerDot} />}
                    </div>
                  </div>
                  <div>
                    <div className={styles.parcelTypeName}>Medium</div>
                    <div className={styles.parcelTypeWeight}>2 - 10 kg</div>
                    <div className={styles.parcelTypeDims}>Max. 45 x 35 x 30 cm</div>
                  </div>
                </div>

                {/* Large */}
                <div
                  className={`${styles.parcelTypeCard} ${booking.parcelType === 'Large' ? styles.parcelTypeCardSelected : ''}`}
                  onClick={() => {
                    setBooking({
                      ...booking,
                      parcelType: 'Large',
                      dimensions: { length: 60, width: 45, height: 45 }
                    })
                  }}
                >
                  <div className={styles.parcelTypeTop}>
                    <Package size={24} className={styles.parcelTypeIconBox} />
                    <div className={`${styles.radioCircle} ${booking.parcelType === 'Large' ? styles.radioCircleActive : ''}`}>
                      {booking.parcelType === 'Large' && <div className={styles.radioInnerDot} />}
                    </div>
                  </div>
                  <div>
                    <div className={styles.parcelTypeName}>Large</div>
                    <div className={styles.parcelTypeWeight}>10 - 25 kg</div>
                    <div className={styles.parcelTypeDims}>Max. 60 x 45 x 45 cm</div>
                  </div>
                </div>
              </div>

              {/* Package Dimensions (cm) */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>Package Dimensions (cm)</strong>
                  <Info size={14} color="#64748B" />
                </div>

                <div className={styles.dimensionsRow}>
                  <div className={styles.dimInputBox}>
                    <small style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', marginBottom: 2 }}>Length</small>
                    <input
                      type="number"
                      placeholder="Enter length"
                      className={styles.dimInputField}
                      value={booking.dimensions.length}
                      onChange={(e) => setBooking({ ...booking, dimensions: { ...booking.dimensions, length: e.target.value } })}
                    />
                  </div>
                  <span className={styles.dimTimes}>×</span>
                  <div className={styles.dimInputBox}>
                    <small style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', marginBottom: 2 }}>Width</small>
                    <input
                      type="number"
                      placeholder="Enter width"
                      className={styles.dimInputField}
                      value={booking.dimensions.width}
                      onChange={(e) => setBooking({ ...booking, dimensions: { ...booking.dimensions, width: e.target.value } })}
                    />
                  </div>
                  <span className={styles.dimTimes}>×</span>
                  <div className={styles.dimInputBox}>
                    <small style={{ display: 'block', fontSize: '0.7rem', color: '#64748B', marginBottom: 2 }}>Height</small>
                    <input
                      type="number"
                      placeholder="Enter height"
                      className={styles.dimInputField}
                      value={booking.dimensions.height}
                      onChange={(e) => setBooking({ ...booking, dimensions: { ...booking.dimensions, height: e.target.value } })}
                    />
                  </div>
                </div>
                <p className={styles.dimensionsHelper}>Dimensions help us choose the best packaging and calculate accurate charges.</p>
              </div>
            </div>

            {/* Package Box Required? Card (Screen 2 & 3) */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 12 }}>Package Box Required?</h2>
              <div className={styles.boxRequiredRow}>
                {/* Option Yes */}
                <div
                  className={`${styles.boxOptionCard} ${booking.packageBoxRequired === 'yes' ? styles.boxOptionCardSelected : ''}`}
                  onClick={() => setBooking({ ...booking, packageBoxRequired: 'yes' })}
                >
                  <div className={`${styles.radioCircle} ${booking.packageBoxRequired === 'yes' ? styles.radioCircleActive : ''}`}>
                    {booking.packageBoxRequired === 'yes' && <div className={styles.radioInnerDot} />}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0F172A' }}>Yes, I need a box</strong>
                    <span className={styles.tagGreen} style={{ display: 'inline-block', margin: '3px 0' }}>Recommended</span>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>Delivez will bring a packaging box during pickup</p>
                  </div>
                </div>

                {/* Option No */}
                <div
                  className={`${styles.boxOptionCard} ${booking.packageBoxRequired === 'no' ? styles.boxOptionCardSelected : ''}`}
                  onClick={() => setBooking({ ...booking, packageBoxRequired: 'no' })}
                >
                  <div className={`${styles.radioCircle} ${booking.packageBoxRequired === 'no' ? styles.radioCircleActive : ''}`}>
                    {booking.packageBoxRequired === 'no' && <div className={styles.radioInnerDot} />}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0F172A' }}>No, I have my own packaging</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748B' }}>I will pack the item myself</p>
                  </div>
                </div>
              </div>
            </div>

            {/* If Yes: Select Box Size (Screens 3 & 4) */}
            {booking.packageBoxRequired === 'yes' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Select a Box Size</h2>
                <p className={styles.cardSub} style={{ marginBottom: 12 }}>(Delivez will bring the box during pickup)</p>

                {/* Executive tip banner */}
                <div style={{ background: '#FFFDF5', border: '1px solid #FEF3C7', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <HelpCircle size={18} color="#D97706" />
                  <span style={{ fontSize: '0.8rem', color: '#78350F' }}>Our executive will bring the right size box based on your item.</span>
                </div>

                {/* Choose by Weight Capacity Tabs */}
                <strong style={{ display: 'block', fontSize: '0.86rem', color: '#0F172A', marginBottom: 8 }}>Choose by Weight Capacity</strong>
                <div className={styles.capacityTabs}>
                  {['10 Kg', '15 Kg', '25 Kg'].map((weight) => (
                    <button
                      key={weight}
                      type="button"
                      className={`${styles.capTab} ${booking.selectedWeightCapacity === weight ? styles.capTabActive : ''}`}
                      onClick={() => {
                        const firstBox = boxOptions[weight][0]
                        setBooking({
                          ...booking,
                          selectedWeightCapacity: weight,
                          selectedBoxSize: firstBox.title,
                          dimensions: { length: firstBox.l, width: firstBox.w, height: firstBox.h }
                        })
                      }}
                    >
                      {weight}
                    </button>
                  ))}
                </div>

                {/* Available Box Sizes Cards */}
                <strong style={{ display: 'block', fontSize: '0.86rem', color: '#0F172A', margin: '14px 0 8px' }}>
                  Available Box Sizes for {booking.selectedWeightCapacity}
                </strong>
                <div className={styles.boxList}>
                  {boxOptions[booking.selectedWeightCapacity]?.map((box) => {
                    const isSelected = booking.selectedBoxSize === box.title
                    return (
                      <div
                        key={box.title}
                        className={`${styles.boxCardItem} ${isSelected ? styles.boxCardItemSelected : ''}`}
                        onClick={() => {
                          setBooking({
                            ...booking,
                            selectedBoxSize: box.title,
                            isCustomBox: false,
                            dimensions: { length: box.l, width: box.w, height: box.h }
                          })
                        }}
                      >
                        <div className={styles.boxCardLeft}>
                          <Package size={28} color="#D97706" />
                          <div>
                            <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
                              {box.title}
                            </strong>
                            <div style={{ fontSize: '0.76rem', color: '#64748B' }}>{box.dims}</div>
                            <span className={styles.boxTag}>{box.tag}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleActive : ''}`} style={{ margin: '0 0 6px auto' }}>
                            {isSelected && <div className={styles.radioInnerDot} />}
                          </div>
                          <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0F172A' }}>{box.cap}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{box.vol}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <small style={{ display: 'block', color: '#64748B', fontSize: '0.74rem', margin: '8px 0 14px' }}>
                  (i) Actual weight and dimensions will be verified at pickup.
                </small>

                {/* No Box Size Fits? Custom Box Card */}
                <div style={{ marginTop: 10 }}>
                  <strong style={{ display: 'block', fontSize: '0.84rem', color: '#0F172A', marginBottom: 6 }}>No box size fits?</strong>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: booking.isCustomBox ? '1.5px solid #fab800' : '1.5px solid #cbd5e1',
                      background: booking.isCustomBox ? '#fffdf5' : '#ffffff',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowCustomBoxModal(true)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Layers size={22} color="#D97706" />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                          {booking.isCustomBox ? 'Custom Box Selected' : 'Custom Box'}
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                          Our executive will assess your item and bring the right size box.
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#64748B" />
                  </div>
                </div>
              </div>
            )}

            {/* Package Weight Card (Screens 4 & 5) */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>Package Weight</h2>
              <div className={styles.weightGrid}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Scale size={16} color="#D97706" />
                    <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>Actual Weight</strong>
                  </div>
                  <div className={styles.actualWeightBox}>
                    <Scale size={18} className={styles.actualWeightScaleIcon} />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Enter weight"
                      className={styles.actualWeightInput}
                      value={booking.actualWeight || ''}
                      onChange={(e) => setBooking({ ...booking, actualWeight: parseFloat(e.target.value) || '' })}
                    />
                  </div>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
                    Weight will be used to calculate shipping charges.
                  </span>
                </div>

                <div className={styles.chargeableCard}>
                  <div className={styles.chargeableLabel}>Chargeable Weight</div>
                  <div className={styles.chargeableValue}>
                    {chargeableWeightKg ? `${chargeableWeightKg} kg` : '-- kg'}
                  </div>
                  <div className={styles.chargeableSub}>Will be calculated automatically</div>
                </div>
              </div>

              {/* Packaging Selector Row Card (Screen 5) */}
              <div
                className={styles.packagingRowCard}
                onClick={() => setShowPackagingModal(true)}
              >
                <div className={styles.packagingLeft}>
                  <div className={styles.packagingIconCircle}>
                    <Box size={20} />
                  </div>
                  <div>
                    <div className={styles.packagingTitle}>Packaging</div>
                    <div className={styles.packagingSub}>
                      {booking.packagingType === 'WOODEN_CRATE'
                        ? 'Wooden Crate Packaging (+₹149)'
                        : booking.packagingType === 'EXTRA_SECURE'
                        ? 'Extra Secure Packaging (+₹49)'
                        : 'Choose how your package will be packed.'}
                    </div>
                  </div>
                </div>
                <div className={styles.packagingRightLink}>
                  <span>Select Packaging</span>
                  <ChevronRight size={16} />
                </div>
              </div>

              {/* Special Handling Toggle Row (Screens 5 & 9) */}
              <div className={styles.specialHandlingRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={20} color="#3B82F6" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0F172A' }}>
                      Special Handling <span style={{ color: '#64748b', fontWeight: 500 }}>(Optional)</span>
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Does your package require special handling?</span>
                  </div>
                </div>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={booking.specialHandling}
                    onChange={(e) => {
                      const val = e.target.checked
                      setBooking({
                        ...booking,
                        specialHandling: val,
                        isFragile: val ? booking.isFragile || true : false,
                        isSecure: val ? booking.isSecure : false
                      })
                    }}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              {/* Handling Options (Screen 9) */}
              {booking.specialHandling && (
                <div style={{ marginTop: 8, marginBottom: 12 }}>
                  <strong style={{ display: 'block', fontSize: '0.84rem', color: '#0F172A', marginBottom: 6 }}>Handling Options</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {/* Fragile */}
                    <div
                      className={`${styles.handlingBtn} ${booking.isFragile ? styles.handlingBtnActive : ''}`}
                      onClick={() => setBooking({ ...booking, isFragile: !booking.isFragile })}
                    >
                      <Wine size={18} />
                      <strong style={{ fontSize: '0.78rem' }}>Fragile (+₹25)</strong>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Handle with care</span>
                    </div>

                    {/* Secure */}
                    <div
                      className={`${styles.handlingBtn} ${booking.isSecure ? styles.handlingBtnActive : ''}`}
                      onClick={() => setBooking({ ...booking, isSecure: !booking.isSecure })}
                    >
                      <Lock size={18} />
                      <strong style={{ fontSize: '0.78rem' }}>Secure (+₹35)</strong>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Extra security</span>
                    </div>

                    {/* Cash on Delivery */}
                    <div className={`${styles.handlingBtn} ${styles.handlingBtnDisabled}`}>
                      <Wallet size={18} />
                      <strong style={{ fontSize: '0.78rem' }}>Cash on Delivery</strong>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>(Not available)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Safe & Secure transit banner */}
              <div className={styles.trustBanner}>
                <CheckCircle2 size={18} color="#16A34A" />
                <span>100% Safe & Secure transit. Verified executives with tamper-proof handling.</span>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 5: SERVICE TYPE (Screens 10 & 11)                               */}
        {/* ==================================================================== */}
        {step === 5 && (
          <>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Service Type</h2>
              <p className={styles.cardSub}>Choose the service that best suits your delivery needs</p>

              {/* Service Tiers List */}
              <div className={styles.serviceTiersList}>
                {localServices.map((srv) => {
                  const isSelected = booking.deliverySpeed === srv.title
                  const IconComp = srv.icon
                  return (
                    <div
                      key={srv.title}
                      className={`${styles.serviceTierCard} ${isSelected ? styles.serviceTierCardSelected : ''}`}
                      onClick={() =>
                        setBooking({
                          ...booking,
                          deliverySpeed: srv.title,
                          deliveryPrice: srv.price
                        })
                      }
                    >
                      <div className={styles.serviceTierTop}>
                        <div className={styles.serviceTierIconBox}>
                          <IconComp size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className={styles.serviceTierTitleRow}>
                            <span className={styles.serviceTierName}>{srv.title}</span>
                            {srv.badge && (
                              <span className={srv.badgeClass}>{srv.badge}</span>
                            )}
                          </div>
                          <p className={styles.serviceTierDesc}>{srv.desc}</p>
                        </div>
                        <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleActive : ''}`}>
                          {isSelected && <div className={styles.radioInnerDot} />}
                        </div>
                      </div>

                      {/* Feature Tags */}
                      <div className={styles.serviceTagList}>
                        {srv.tags.map((tag) => (
                          <span key={tag} className={styles.serviceTagPill}>
                            {tag === 'Fastest' && <Zap size={12} color="#DC2626" />}
                            {tag === 'Real-time Tracking' && <MapPin size={12} color="#D97706" />}
                            {tag === 'High Priority' && <CheckCircle2 size={12} color="#16A34A" />}
                            {tag === 'Eco-friendly' && <Leaf size={12} color="#16A34A" />}
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Bottom Time & Price */}
                      <div className={styles.serviceTierBottom}>
                        <div className={styles.serviceDeliveryTime}>
                          <Clock size={14} />
                          <span>{srv.time}</span>
                        </div>
                        <div className={styles.servicePriceTag}>
                          From ₹{srv.price}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Self Service Options (Screen 11) */}
              <div style={{ marginTop: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ background: '#16A34A', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                    NEW
                  </span>
                  <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>Self Service Options</strong>
                </div>

                <div className={styles.selfServiceGrid}>
                  {/* Self Pickup */}
                  <div
                    className={`${styles.selfServiceCard} ${booking.selfServiceOption === 'Self Pickup' ? styles.selfServiceCardSelected : ''}`}
                    onClick={() =>
                      setBooking({
                        ...booking,
                        selfServiceOption: booking.selfServiceOption === 'Self Pickup' ? null : 'Self Pickup'
                      })
                    }
                  >
                    <div className={styles.selfServiceHead}>
                      <div className={styles.selfServiceLeft}>
                        <div className={styles.selfServiceIconBox}>
                          <Package size={18} />
                        </div>
                        <div>
                          <div className={styles.selfServiceTitle}>Self Pickup</div>
                        </div>
                      </div>
                      <span className={styles.selfServiceSaveBadge}>Save Time</span>
                      <div className={`${styles.radioCircle} ${booking.selfServiceOption === 'Self Pickup' ? styles.radioCircleActive : ''}`}>
                        {booking.selfServiceOption === 'Self Pickup' && <div className={styles.radioInnerDot} />}
                      </div>
                    </div>

                    <div className={styles.selfServiceFee}>₹50</div>
                    <div className={styles.selfServiceDesc}>You drop the parcel at our nearest Delivez location.</div>
                    <div className={styles.selfServiceTags}>
                      <span className={styles.selfServiceTagItem}>⚡ Quick Drop</span>
                      <span className={styles.selfServiceTagItem}>₹ Lower Cost</span>
                    </div>
                  </div>

                  {/* Self Drop */}
                  <div
                    className={`${styles.selfServiceCard} ${booking.selfServiceOption === 'Self Drop' ? styles.selfServiceCardSelected : ''}`}
                    onClick={() =>
                      setBooking({
                        ...booking,
                        selfServiceOption: booking.selfServiceOption === 'Self Drop' ? null : 'Self Drop'
                      })
                    }
                  >
                    <div className={styles.selfServiceHead}>
                      <div className={styles.selfServiceLeft}>
                        <div className={styles.selfServiceIconBox} style={{ background: '#F0FDF4', color: '#15803D' }}>
                          <HomeIcon size={18} />
                        </div>
                        <div>
                          <div className={styles.selfServiceTitle}>Self Drop</div>
                        </div>
                      </div>
                      <span className={styles.selfServiceSaveBadge}>Save Time</span>
                      <div className={`${styles.radioCircle} ${booking.selfServiceOption === 'Self Drop' ? styles.radioCircleActive : ''}`}>
                        {booking.selfServiceOption === 'Self Drop' && <div className={styles.radioInnerDot} />}
                      </div>
                    </div>

                    <div className={styles.selfServiceFee}>₹40</div>
                    <div className={styles.selfServiceDesc}>You drop the parcel at our destination hub.</div>
                    <div className={styles.selfServiceTags}>
                      <span className={styles.selfServiceTagItem}>⏱ Flexible</span>
                      <span className={styles.selfServiceTagItem}>₹ Lower Cost</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note on service availability */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 14, fontSize: '0.74rem', color: '#64748B' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Note: Service availability depends on pickup and delivery locations.</span>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 6: INSURANCE (LocalAddInsurancePage)                            */}
        {/* ==================================================================== */}
        {step === 6 && (
          <>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Protect Your Shipment</h2>
              <p className={styles.cardSub} style={{ marginBottom: 14 }}>
                Transit insurance safeguards against loss, theft, tampering or transit damage
              </p>

              {/* Insurance Option 1: Full */}
              <div
                className={`${styles.insuranceOptionCard} ${booking.insuranceOption === 0 ? styles.insuranceOptionCardSelected : ''}`}
                onClick={() => setBooking({ ...booking, insuranceOption: 0 })}
              >
                <div className={`${styles.radioCircle} ${booking.insuranceOption === 0 ? styles.radioCircleActive : ''}`}>
                  {booking.insuranceOption === 0 && <div className={styles.radioInnerDot} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={18} color="#16A34A" />
                    <strong style={{ fontSize: '0.94rem', color: '#0F172A' }}>Insure Shipment (Full Protection)</strong>
                    <span className={styles.tagGreen}>Recommended</span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Comprehensive 100% coverage up to declared consignment value (0.75% fee)
                  </p>
                </div>
              </div>

              {/* Insurance Option 2: Basic */}
              <div
                className={`${styles.insuranceOptionCard} ${booking.insuranceOption === 1 ? styles.insuranceOptionCardSelected : ''}`}
                onClick={() => setBooking({ ...booking, insuranceOption: 1 })}
              >
                <div className={`${styles.radioCircle} ${booking.insuranceOption === 1 ? styles.radioCircleActive : ''}`}>
                  {booking.insuranceOption === 1 && <div className={styles.radioInnerDot} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={18} color="#D97706" />
                    <strong style={{ fontSize: '0.94rem', color: '#0F172A' }}>Basic Carrier Coverage (₹49)</strong>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Limited coverage as per standard carrier terms up to ₹10,000 maximum liability
                  </p>
                </div>
              </div>

              {/* Insurance Option 3: None */}
              <div
                className={`${styles.insuranceOptionCard} ${booking.insuranceOption === 2 ? styles.insuranceOptionCardSelected : ''}`}
                onClick={() => setBooking({ ...booking, insuranceOption: 2 })}
              >
                <div className={`${styles.radioCircle} ${booking.insuranceOption === 2 ? styles.radioCircleActive : ''}`}>
                  {booking.insuranceOption === 2 && <div className={styles.radioInnerDot} />}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.94rem', color: '#0F172A' }}>No Insurance</strong>
                  <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    I understand the risk of transit loss and opt out of insurance protection
                  </p>
                </div>
              </div>

              {/* Declared Value Input Box (Shown if option 0) */}
              {booking.insuranceOption === 0 && (
                <div style={{ marginTop: 14, background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                    Declare Shipment Value (INR)
                  </label>
                  <div className={styles.declaredValueBox}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#64748B' }}>₹</span>
                    <input
                      type="number"
                      className={styles.declaredInput}
                      value={booking.declaredValue}
                      onChange={(e) => setBooking({ ...booking, declaredValue: parseInt(e.target.value) || 0 })}
                    />
                    <div style={{ textAlign: 'right' }}>
                      <small style={{ display: 'block', fontSize: '0.7rem', color: '#64748B' }}>Premium (0.75%)</small>
                      <strong style={{ fontSize: '1.1rem', color: '#E11D48' }}>
                        ₹{Math.round(booking.declaredValue * 0.0075)}.00
                      </strong>
                    </div>
                  </div>
                  <small style={{ display: 'block', marginTop: 4, fontSize: '0.72rem', color: '#94a3b8' }}>
                    Minimum insurable value: ₹1,000 • Maximum coverage: ₹5,000,000 per consignment.
                  </small>
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 7: REVIEW & CONFIRM (Summary)                                   */}
        {/* ==================================================================== */}
        {step === 7 && (
          <>
            <div className={styles.reviewGrid}>
              {/* ETA Banner */}
              <div className={styles.etaBanner}>
                <Clock size={24} color="#D97706" />
                <div>
                  <small style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                    Estimated Arrival (ETA)
                  </small>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#0F172A' }}>
                    {booking.deliverySpeed.includes('Same Day') ? 'Today, before 08:00 PM' : booking.deliverySpeed.includes('Bike') ? 'Today, in 1 - 3 hours' : 'Tomorrow, before 06:00 PM'}
                  </strong>
                </div>
              </div>

              {/* Pickup Review Card */}
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={18} color="#FFB800" />
                    <strong style={{ fontSize: '0.94rem' }}>Pickup Details</strong>
                  </div>
                  <button type="button" className={styles.editBtn} onClick={() => setStep(1)}>
                    <Edit2 size={13} /> Edit
                  </button>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#334155' }}>
                  <strong>{booking.pickupContactPerson}</strong> ({booking.pickupPhone})
                  <div style={{ color: '#64748B', marginTop: 2 }}>{booking.pickupAddressLine}</div>
                  <div style={{ marginTop: 4, fontSize: '0.76rem', color: '#D97706' }}>
                    Pickup Mode: {booking.preferredPickupTime === 'ASAP' ? 'ASAP (Immediate Dispatch)' : `${booking.pickupScheduleDate}, ${booking.pickupScheduleSlot}`}
                  </div>
                </div>
              </div>

              {/* Drop-off Review Card */}
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={18} color="#DC2626" />
                    <strong style={{ fontSize: '0.94rem' }}>Drop-off Details</strong>
                  </div>
                  <button type="button" className={styles.editBtn} onClick={() => setStep(2)}>
                    <Edit2 size={13} /> Edit
                  </button>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#334155' }}>
                  <strong>{booking.dropContactPerson}</strong> ({booking.dropPhone})
                  <div style={{ color: '#64748B', marginTop: 2 }}>{booking.dropAddressLine}</div>
                  {booking.dropInstructions && (
                    <div style={{ marginTop: 4, fontSize: '0.76rem', color: '#64748B' }}>
                      Note: {booking.dropInstructions}
                    </div>
                  )}
                </div>
              </div>

              {/* Package & Service Summary Card */}
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Package size={18} color="#2563EB" />
                    <strong style={{ fontSize: '0.94rem' }}>Package & Service Breakdown</strong>
                  </div>
                  <button type="button" className={styles.editBtn} onClick={() => setStep(4)}>
                    <Edit2 size={13} /> Edit
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.8rem' }}>
                  <div>Category: <strong>{booking.packageCategory}</strong></div>
                  <div>Parcel Type: <strong>{booking.parcelType}</strong></div>
                  <div>Dimensions: <strong>{booking.dimensions.length} x {booking.dimensions.width} x {booking.dimensions.height} cm</strong></div>
                  <div>Actual Weight: <strong>{booking.actualWeight} kg</strong></div>
                  <div>Chargeable Weight: <strong>{chargeableWeightKg} kg</strong></div>
                  <div>Packaging: <strong>{booking.packagingType === 'WOODEN_CRATE' ? 'Wooden Crate' : booking.packagingType === 'EXTRA_SECURE' ? 'Extra Secure' : 'Delivez Standard'}</strong></div>
                  <div>Box Type: <strong>{booking.packageBoxRequired === 'yes' ? (booking.isCustomBox ? 'Custom Box' : booking.selectedBoxSize) : 'Own Packaging'}</strong></div>
                  <div>Service Speed: <strong>{booking.deliverySpeed}</strong></div>
                  {booking.selfServiceOption && (
                    <div>Self-Service: <strong style={{ color: '#16A34A' }}>{booking.selfServiceOption} (Save ₹{booking.selfServiceOption === 'Self Pickup' ? 50 : 40})</strong></div>
                  )}
                  <div>Special Handling: <strong>{booking.isFragile ? 'Fragile (+₹25)' : 'Standard'} {booking.isSecure ? '• Secure (+₹35)' : ''}</strong></div>
                  <div>Insurance: <strong>{booking.insuranceOption === 0 ? 'Full Coverage' : booking.insuranceOption === 1 ? 'Basic (₹10k)' : 'None'}</strong></div>
                </div>

                {/* Price Summary inside Review */}
                <div style={{ marginTop: 14, background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span>Delivery Speed Charge</span>
                    <strong>₹{pricing.baseSpeedPrice}.00</strong>
                  </div>
                  {pricing.boxFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B', marginBottom: 3 }}>
                      <span>Packaging Box Fee</span>
                      <span>₹{pricing.boxFee}.00</span>
                    </div>
                  )}
                  {pricing.packagingUpgradeFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B', marginBottom: 3 }}>
                      <span>Packaging Upgrade ({booking.packagingType === 'WOODEN_CRATE' ? 'Wooden Crate' : 'Extra Secure'})</span>
                      <span>₹{pricing.packagingUpgradeFee}.00</span>
                    </div>
                  )}
                  {pricing.handlingFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B', marginBottom: 3 }}>
                      <span>Special Handling (Fragile/Seal)</span>
                      <span>₹{pricing.handlingFee}.00</span>
                    </div>
                  )}
                  {pricing.insuranceFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B', marginBottom: 3 }}>
                      <span>Transit Insurance Fee</span>
                      <span>₹{pricing.insuranceFee}.00</span>
                    </div>
                  )}
                  {pricing.selfServiceDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#16A34A', marginBottom: 3 }}>
                      <span>Self Service Discount ({booking.selfServiceOption})</span>
                      <span>- ₹{pricing.selfServiceDiscount}.00</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#16A34A', marginBottom: 3 }}>
                    <span>Promo Discount (DELIVEZ10)</span>
                    <span>- ₹{pricing.discount}.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B', marginBottom: 6 }}>
                    <span>Taxes (GST 18%)</span>
                    <span>₹{pricing.tax}.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: 6, fontSize: '1.1rem', fontWeight: 900, color: '#0F172A' }}>
                    <span>Total Payable</span>
                    <span style={{ color: '#E11D48' }}>₹{pricing.total}.00</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 8: PAYMENT METHOD (Screen 8)                                    */}
        {/* ==================================================================== */}
        {step === 8 && (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>Choose Payment Method</h2>
                  <p className={styles.cardSub}>Select your preferred payment option to complete booking securely</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#E8F5E9', border: '1px solid #A5D6A7', padding: '4px 8px', borderRadius: 6, fontSize: '0.72rem', color: '#2E7D32', fontWeight: 800 }}>
                  <ShieldCheck size={14} />
                  100% Secure Payment
                </div>
              </div>

              {/* Error Notice if Submission Failed */}
              {submitError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #F87171', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#991B1B', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                    <AlertCircle size={16} />
                    <span>Booking Submission Issue</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>{submitError}</p>
                </div>
              )}

              {/* Payment Methods List */}
              <div className={styles.paymentList}>
                {/* Delivez Money Wallet */}
                <div
                  className={`${styles.paymentTile} ${booking.paymentMethod === 'wallet' ? styles.paymentTileSelected : ''}`}
                  onClick={() => setBooking({ ...booking, paymentMethod: 'wallet' })}
                >
                  <div className={styles.paymentLeft}>
                    <div className={`${styles.radioCircle} ${booking.paymentMethod === 'wallet' ? styles.radioCircleActive : ''}`}>
                      {booking.paymentMethod === 'wallet' && <div className={styles.radioInnerDot} />}
                    </div>
                    <Wallet size={20} color="#D97706" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>Delivez Money (Wallet)</strong>
                        <span className={styles.tagGreen}>Preferred</span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: 700 }}>
                        ₹1,245.60 Available Balance
                      </span>
                    </div>
                  </div>
                </div>

                {/* UPI */}
                <div
                  className={`${styles.paymentTile} ${booking.paymentMethod === 'upi' ? styles.paymentTileSelected : ''}`}
                  onClick={() => setBooking({ ...booking, paymentMethod: 'upi' })}
                >
                  <div className={styles.paymentLeft}>
                    <div className={`${styles.radioCircle} ${booking.paymentMethod === 'upi' ? styles.radioCircleActive : ''}`}>
                      {booking.paymentMethod === 'upi' && <div className={styles.radioInnerDot} />}
                    </div>
                    <Zap size={20} color="#2563EB" />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>UPI (Google Pay, PhonePe, Paytm)</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Instant scan & pay via any UPI app</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </div>

                {/* Credit / Debit Card */}
                <div
                  className={`${styles.paymentTile} ${booking.paymentMethod === 'card' ? styles.paymentTileSelected : ''}`}
                  onClick={() => setBooking({ ...booking, paymentMethod: 'card' })}
                >
                  <div className={styles.paymentLeft}>
                    <div className={`${styles.radioCircle} ${booking.paymentMethod === 'card' ? styles.radioCircleActive : ''}`}>
                      {booking.paymentMethod === 'card' && <div className={styles.radioInnerDot} />}
                    </div>
                    <CreditCard size={20} color="#0F172A" />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>Credit / Debit Card</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Visa, MasterCard, RuPay accepted</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </div>

                {/* Net Banking */}
                <div
                  className={`${styles.paymentTile} ${booking.paymentMethod === 'netbanking' ? styles.paymentTileSelected : ''}`}
                  onClick={() => setBooking({ ...booking, paymentMethod: 'netbanking' })}
                >
                  <div className={styles.paymentLeft}>
                    <div className={`${styles.radioCircle} ${booking.paymentMethod === 'netbanking' ? styles.radioCircleActive : ''}`}>
                      {booking.paymentMethod === 'netbanking' && <div className={styles.radioInnerDot} />}
                    </div>
                    <Briefcase size={20} color="#475569" />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>Net Banking</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>All major Indian banks supported</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </div>
              </div>

              {/* Additional Options (GST Switch) */}
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Receipt size={18} color="#E11D48" />
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>GST / Business Tax Invoice</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Add company details for input tax credit claim</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: booking.isGstEnabled ? '#E11D48' : '#ffffff',
                      color: booking.isGstEnabled ? '#ffffff' : '#334155',
                      fontSize: '0.78rem',
                      fontWeight: 750,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (!booking.isGstEnabled) setShowGstModal(true)
                      setBooking({ ...booking, isGstEnabled: !booking.isGstEnabled })
                    }}
                  >
                    {booking.isGstEnabled ? 'Added ✓' : '+ Add GST'}
                  </button>
                </div>
              </div>

              {/* Fare Summary Table */}
              <div className={styles.fareTable} style={{ marginTop: 14 }}>
                <strong style={{ display: 'block', fontSize: '0.86rem', color: '#0F172A', marginBottom: 6 }}>Fare Summary</strong>
                <div className={styles.fareRow}>
                  <span>Base Courier Fee</span>
                  <span>₹{pricing.baseSpeedPrice}.00</span>
                </div>
                {pricing.boxFee > 0 && (
                  <div className={styles.fareRow}>
                    <span>Packaging Box Fee</span>
                    <span>₹{pricing.boxFee}.00</span>
                  </div>
                )}
                {pricing.packagingUpgradeFee > 0 && (
                  <div className={styles.fareRow}>
                    <span>Packaging Upgrade ({booking.packagingType === 'WOODEN_CRATE' ? 'Wooden Crate' : 'Extra Secure'})</span>
                    <span>₹{pricing.packagingUpgradeFee}.00</span>
                  </div>
                )}
                {pricing.handlingFee > 0 && (
                  <div className={styles.fareRow}>
                    <span>Handling Protection</span>
                    <span>₹{pricing.handlingFee}.00</span>
                  </div>
                )}
                {pricing.insuranceFee > 0 && (
                  <div className={styles.fareRow}>
                    <span>Transit Insurance</span>
                    <span>₹{pricing.insuranceFee}.00</span>
                  </div>
                )}
                {pricing.selfServiceDiscount > 0 && (
                  <div className={styles.fareRow} style={{ color: '#16A34A', fontWeight: 700 }}>
                    <span>Self Service Discount ({booking.selfServiceOption})</span>
                    <span>- ₹{pricing.selfServiceDiscount}.00</span>
                  </div>
                )}
                <div className={styles.fareRow} style={{ color: '#16A34A', fontWeight: 700 }}>
                  <span>Discount (DELIVEZ10)</span>
                  <span>- ₹{pricing.discount}.00</span>
                </div>
                <div className={styles.fareRow}>
                  <span>Taxes (GST 18%)</span>
                  <span>₹{pricing.tax}.00</span>
                </div>
                <div className={`${styles.fareRow} ${styles.fareRowTotal}`}>
                  <span>Total Amount</span>
                  <span style={{ color: '#DC2626' }}>₹{pricing.total}.00</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 9: BOOKING CONFIRMED (Screen 9)                                 */}
        {/* ==================================================================== */}
        {step === 9 && (() => {
          const displayBooking = confirmedBooking || booking
          const displayId = displayBooking.bookingNumber || displayBooking.bookingId || 'DLVZ2609165141'
          const pkgDetails = displayBooking.packageDetails || displayBooking.package || {}
          
          // Category
          const displayCategory = displayBooking.category || displayBooking.itemCategory || pkgDetails.category || pkgDetails.contentCategory || booking.packageCategory || 'General Items'
          
          // Packaging
          const displayPackaging = displayBooking.packagingName || pkgDetails.packagingName || displayBooking.packagingType || (booking.packagingType === 'WOODEN_CRATE' ? 'Reinforced Wooden Crate' : booking.packagingType === 'EXTRA_SECURE' ? 'Extra Secure Box (+Bubble)' : 'Delivez Standard Box')
          
          // Service
          const displayService = displayBooking.serviceName || displayBooking.serviceSpeed || displayBooking.deliverySpeed || booking.deliverySpeed || 'Bike Priority Delivery'
          const displaySelfService = displayBooking.selfServiceLabel || (booking.selfServiceOption && booking.selfServiceOption !== 'Full Doorstep' ? booking.selfServiceOption : null)

          // Weights & Dimensions
          const actualWt = Number(displayBooking.actualWeightKg ?? pkgDetails.actualWeightKg ?? booking.actualWeight ?? 2.5)
          const chargeableWt = Number(displayBooking.chargeableWeightKg ?? pkgDetails.chargeableWeightKg ?? chargeableWeightKg ?? actualWt)
          const dims = pkgDetails.dimensions || displayBooking.dimensions || booking.dimensions || { lengthCm: 30, widthCm: 20, heightCm: 10 }
          const lengthVal = dims.lengthCm ?? dims.length ?? 30
          const widthVal = dims.widthCm ?? dims.width ?? 20
          const heightVal = dims.heightCm ?? dims.height ?? 10
          const volumeLiters = ((lengthVal * widthVal * heightVal) / 1000).toFixed(1)

          // Box
          const boxDesc = pkgDetails.boxSize || booking.selectedBoxSize || (booking.packageBoxRequired === 'yes' ? 'Standard Box' : 'Own Packaging')

          // Total Paid
          const amountPaid = displayBooking.totalAmount ? Number(displayBooking.totalAmount).toFixed(2) : `${pricing.total}.00`

          return (
            <div className={styles.confirmedCard}>
              {/* Hero Banner */}
              <div className={styles.confirmedHero}>
                <div className={styles.confirmedCheckCircle}>
                  <Check size={36} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
                  Booking Confirmed &amp; Scheduled!
                </h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
                  Your personal courier shipment has been registered and scheduled with our delivery network.
                </p>
              </div>

              {/* Booking Reference Box */}
              <div className={styles.bookingIdBox}>
                <div>
                  <small style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
                    CONSIGNMENT TRACKING NUMBER
                  </small>
                  <strong style={{ fontSize: '1.25rem', color: '#0F172A', letterSpacing: '0.02em' }}>
                    {displayId}
                  </strong>
                </div>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '0.78rem',
                    fontWeight: 750,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(displayId)
                    alert('Consignment ID copied to clipboard: ' + displayId)
                  }}
                >
                  <Copy size={13} /> Copy
                </button>
              </div>

              {/* Dynamic Declared Item Category Card */}
              <div style={{ background: '#FFFDF5', border: '1.5px solid #FEF3C7', borderRadius: 12, padding: 14, margin: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF08A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#854D0E' }}>
                      <Package size={18} />
                    </div>
                    <div>
                      <small style={{ display: 'block', fontSize: '0.7rem', color: '#854D0E', fontWeight: 800, textTransform: 'uppercase' }}>DECLARED ITEM CATEGORY</small>
                      <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>{displayCategory}</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '3px 8px', borderRadius: 999 }}>
                    ✓ Transport Compliant
                  </span>
                </div>
                {booking.packageDescription && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                    "{booking.packageDescription}"
                  </p>
                )}
              </div>

              {/* Dynamic Package Information & Dimensions Specs Grid */}
              <div style={{ margin: '16px 0' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Box size={16} color="#E11D48" /> Dynamic Package &amp; Packaging Specs
                </h4>
                
                <div className={styles.confirmedSpecGrid}>
                  <div className={styles.confirmedSpecItem}>
                    <span className={styles.confirmedSpecLabel}>Actual vs Chargeable Weight</span>
                    <span className={styles.confirmedSpecValue}>{actualWt} Kg actual / {chargeableWt} Kg billable</span>
                    <span className={styles.confirmedSpecSub}>Max(Actual, Volumetric) applied</span>
                  </div>

                  <div className={styles.confirmedSpecItem}>
                    <span className={styles.confirmedSpecLabel}>Package Dimensions (L × W × H)</span>
                    <span className={styles.confirmedSpecValue}>{lengthVal} × {widthVal} × {heightVal} cm</span>
                    <span className={styles.confirmedSpecSub}>Volume: {volumeLiters} Liters</span>
                  </div>

                  <div className={styles.confirmedSpecItem}>
                    <span className={styles.confirmedSpecLabel}>Packaging Specification</span>
                    <span className={styles.confirmedSpecValue}>{displayPackaging}</span>
                    <span className={styles.confirmedSpecSub}>Box capacity: {boxDesc}</span>
                  </div>

                  <div className={styles.confirmedSpecItem}>
                    <span className={styles.confirmedSpecLabel}>Service &amp; Speed Tier</span>
                    <span className={styles.confirmedSpecValue}>{displayService}</span>
                    <span className={styles.confirmedSpecSub}>Guaranteed SLA timeline</span>
                  </div>
                </div>

                {/* Badges / Special Handling Tags */}
                <div className={styles.confirmedPillsRow}>
                  {displaySelfService && (
                    <span className={`${styles.confirmedPill} ${styles.confirmedPillGreen}`}>
                      ✓ {displaySelfService}
                    </span>
                  )}
                  {booking.isFragile && (
                    <span className={`${styles.confirmedPill} ${styles.confirmedPillRose}`}>
                      ⚠ Fragile Goods Handling Active
                    </span>
                  )}
                  {booking.isSecure && (
                    <span className={styles.confirmedPill}>
                      🔒 Tamper-Evident Security Seal Applied
                    </span>
                  )}
                  <span className={`${styles.confirmedPill} ${styles.confirmedPillAmber}`}>
                    🛡 ₹{booking.declaredValue || 25000} Transit Protection
                  </span>
                </div>
              </div>

              {/* Origin to Destination Route Preview */}
              <div className={styles.routePreviewCard}>
                <div className={styles.routePoint}>
                  <div className={styles.routeDotPickup} />
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: '#0F172A' }}>Pickup: {booking.pickupContactPerson} ({booking.pickupCity})</strong>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>{booking.pickupAddressLine}</p>
                    <small style={{ color: '#0F172A', fontWeight: 600 }}>Phone: {booking.pickupPhone}</small>
                  </div>
                </div>
                <div className={styles.routePoint}>
                  <div className={styles.routeDotDelivery} />
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: '#0F172A' }}>Delivery: {booking.dropContactPerson} ({booking.dropCity})</strong>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B' }}>{booking.dropAddressLine}</p>
                    <small style={{ color: '#0F172A', fontWeight: 600 }}>Phone: {booking.dropPhone}</small>
                  </div>
                </div>
              </div>

              {/* Amount Paid summary */}
              <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: 12, padding: 14, margin: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <small style={{ color: '#166534', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>TOTAL AMOUNT PAID</small>
                  <strong style={{ display: 'block', fontSize: '1.35rem', color: '#15803D' }}>₹{amountPaid}</strong>
                  <span style={{ fontSize: '0.74rem', color: '#166534' }}>Paid via {booking.paymentMethod === 'wallet' ? 'Delivez Wallet' : 'Online Payment (Razorpay/UPI)'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: '#15803D', color: '#FFFFFF', padding: '4px 10px', borderRadius: 999, fontSize: '0.74rem', fontWeight: 800 }}>
                    PAYMENT SUCCESS
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48 }}
                  onClick={() => setActiveTrackingId(displayId)}
                >
                  <Navigation size={18} />
                  <span>Track Consignment (Live GPS &amp; Stepper)</span>
                </button>
                <button
                  type="button"
                  className={styles.outlineBtn}
                  style={{ width: '100%', height: 44 }}
                  onClick={() => navigateTo('/courier')}
                >
                  Back to Courier Home
                </button>
              </div>
            </div>
          )
        })()}
      </main>

      {/* Sticky Bottom Action Bar (Steps 1 - 8) */}
      {step < 9 && (
        <div className={styles.stickyBottomBar}>
          <div className={styles.stickyBarInner}>
            {step > 1 && (
              <button type="button" className={styles.outlineBtn} onClick={handleBack} disabled={isSubmitting}>
                Back
              </button>
            )}
            <button type="button" className={styles.primaryBtn} onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Scheduling Courier Booking...</span>
              ) : (
                <>
                  <span>
                    {step === 7
                      ? 'Confirm & Pay'
                      : step === 8
                      ? `Pay Securely • ₹${pricing.total}.00`
                      : step === 4 || step === 3
                      ? 'Save & Continue'
                      : 'Continue'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: Packaging Selection Dialog (Screens 7 & 8)                    */}
      {/* ==================================================================== */}
      {showPackagingModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPackagingModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Choose Packaging Type</h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowPackagingModal(false)}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 0 }}>
              We will pack your item safely using the best suitable packaging.
            </p>

            {/* Why our packaging is safe link */}
            <div style={{ marginBottom: 14 }}>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
                onClick={() => setShowPackagingWhyModal(true)}
              >
                <ShieldCheck size={16} color="#dc2626" />
                <span>Why our packaging is safe?</span>
                <HelpCircle size={14} color="#94a3b8" />
              </button>
            </div>

            {/* Options List */}
            {packagingOptions.map((opt) => {
              const isSel = booking.packagingType === opt.id
              const IconComp = opt.icon
              return (
                <div
                  key={opt.id}
                  className={`${styles.packagingOptionCard} ${isSel ? styles.packagingOptionCardSelected : ''}`}
                  onClick={() => {
                    setBooking({ ...booking, packagingType: opt.id })
                  }}
                >
                  <div className={styles.packagingOptionHead}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FFFDF5', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong style={{ fontSize: '0.94rem', color: '#0F172A' }}>{opt.title}</strong>
                        {opt.badge && (
                          <span className={styles.tagGreen}>{opt.badge}</span>
                        )}
                      </div>
                    </div>
                    <div className={`${styles.radioCircle} ${isSel ? styles.radioCircleActive : ''}`}>
                      {isSel && <div className={styles.radioInnerDot} />}
                    </div>
                  </div>

                  <ul className={styles.packagingBulletList}>
                    {opt.points.map((pt, i) => (
                      <li key={i} className={styles.packagingBulletItem}>
                        <Check size={12} color="#D97706" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {opt.price > 0 && (
                    <div className={styles.packagingPriceRow}>
                      {opt.priceLabel}
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0' }}>
              <Leaf size={16} color="#16A34A" />
              <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>
                We use eco-friendly & recyclable packaging materials.
              </span>
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => setShowPackagingModal(false)}
            >
              Save & Continue →
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: Custom Box Details (Screen 6)                                 */}
      {/* ==================================================================== */}
      {showCustomBoxModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCustomBoxModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h3 className={styles.modalTitle}>Custom Box Details</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                  Our executive will assess your item and bring the right size box.
                </p>
              </div>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowCustomBoxModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Expected Weight */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Expected Weight of Shipment
                </label>
                <div style={{ position: 'relative' }}>
                  <Scale size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748B' }} />
                  <input
                    type="text"
                    placeholder="Enter expected weight"
                    value={booking.customBoxDetails?.expectedWeight || ''}
                    onChange={(e) => setBooking({
                      ...booking,
                      customBoxDetails: { ...booking.customBoxDetails, expectedWeight: e.target.value }
                    })}
                    style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <small style={{ fontSize: '0.72rem', color: '#64748B' }}>Helps us bring the right box for your item.</small>
              </div>

              {/* Estimated Dimensions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Estimated Dimensions <span style={{ color: '#64748B', fontWeight: 500 }}>(Optional)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    placeholder="Length"
                    value={booking.customBoxDetails?.length || ''}
                    onChange={(e) => setBooking({
                      ...booking,
                      customBoxDetails: { ...booking.customBoxDetails, length: e.target.value }
                    })}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <span>×</span>
                  <input
                    type="number"
                    placeholder="Width"
                    value={booking.customBoxDetails?.width || ''}
                    onChange={(e) => setBooking({
                      ...booking,
                      customBoxDetails: { ...booking.customBoxDetails, width: e.target.value }
                    })}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <span>×</span>
                  <input
                    type="number"
                    placeholder="Height"
                    value={booking.customBoxDetails?.height || ''}
                    onChange={(e) => setBooking({
                      ...booking,
                      customBoxDetails: { ...booking.customBoxDetails, height: e.target.value }
                    })}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <small style={{ fontSize: '0.72rem', color: '#64748B' }}>If you are not sure, our executive will measure at pickup.</small>
              </div>

              {/* Item Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  Item Category <span style={{ color: '#64748B', fontWeight: 500 }}>(Optional)</span>
                </label>
                <select
                  value={booking.customBoxDetails?.category || 'Electronics'}
                  onChange={(e) => setBooking({
                    ...booking,
                    customBoxDetails: { ...booking.customBoxDetails, category: e.target.value }
                  })}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Documents">Documents</option>
                  <option value="Clothing & Apparel">Clothing & Apparel</option>
                  <option value="Gifts & Toys">Gifts & Toys</option>
                  <option value="Health & Medicine">Health & Medicine</option>
                  <option value="Household Items">Household Items</option>
                  <option value="Commercial Goods">Commercial Goods</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Additional Instructions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                    Additional Instructions <span style={{ color: '#64748B', fontWeight: 500 }}>(Optional)</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {(booking.customBoxDetails?.instructions || '').length}/150
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={150}
                  placeholder="E.g. Electronics item with fragile glass screen"
                  value={booking.customBoxDetails?.instructions || ''}
                  onChange={(e) => setBooking({
                    ...booking,
                    customBoxDetails: { ...booking.customBoxDetails, instructions: e.target.value }
                  })}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              {/* How it works info */}
              <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1D4ED8', fontWeight: 700, fontSize: '0.82rem' }}>
                  <Info size={16} />
                  <span>How it works</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#1E40AF' }}>
                  Our executive will evaluate your item at pickup, measure exact dimensions, and pack it safely in a tailor-made box.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => {
                setBooking({
                  ...booking,
                  isCustomBox: true,
                  selectedBoxSize: 'Custom Box'
                })
                setShowCustomBoxModal(false)
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: Why Our Packaging Is Safe Dialog                              */}
      {/* ==================================================================== */}
      {showPackagingWhyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPackagingWhyModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Why is Delivez packaging safe?</h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowPackagingWhyModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
              All Delivez shipments use certified heavy-duty 5-ply corrugated cardboard boxes, anti-shock bubble wrapping, moisture barriers, and tamper-evident numbered barcode seals. Every parcel is handled exclusively by verified fleet executives.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ width: '100%', marginTop: 14 }}
              onClick={() => setShowPackagingWhyModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: Why Is Content Declaration Important                          */}
      {/* ==================================================================== */}
      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Why is declaring contents important?</h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowInfoModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.45 }}>
              Declaring your package contents helps us verify compliance with regional shipping regulations, evaluate courier transport restrictions, and apply the appropriate handling safeguards during transit.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ width: '100%', marginTop: 14 }}
              onClick={() => setShowInfoModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: Describe Package Dialog                                       */}
      {/* ==================================================================== */}
      {showDescModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDescModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Describe Package Contents</h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowDescModal(false)}>
                <X size={16} />
              </button>
            </div>
            <textarea
              rows={4}
              maxLength={150}
              placeholder="E.g. 2 books, office hard drive, and contract documents"
              value={booking.packageDescription}
              onChange={(e) => setBooking({ ...booking, packageDescription: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ width: '100%', marginTop: 14 }}
              onClick={() => setShowDescModal(false)}
            >
              Save Description
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: Schedule Date & Time Slot Picker                              */}
      {/* ==================================================================== */}
      {showScheduleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowScheduleModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>
                {scheduleTarget === 'pickup' ? 'Select Pickup Date & Time' : 'Select Drop-off Date & Time'}
              </h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowScheduleModal(false)}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 0 }}>
              Choose your preferred date and convenient time window
            </p>

            {/* Dates selector */}
            <strong style={{ display: 'block', fontSize: '0.84rem', color: '#0F172A', margin: '12px 0 6px' }}>Select Date</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['Today', 'Tomorrow', '17 Sep', '18 Sep'].map((d) => (
                <button
                  key={d}
                  type="button"
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    background: booking[`${scheduleTarget}ScheduleDate`] === d ? '#FFF1F2' : '#ffffff',
                    borderColor: booking[`${scheduleTarget}ScheduleDate`] === d ? '#E11D48' : '#cbd5e1',
                    fontWeight: 750,
                    fontSize: '0.8rem',
                    color: booking[`${scheduleTarget}ScheduleDate`] === d ? '#E11D48' : '#334155',
                    cursor: 'pointer'
                  }}
                  onClick={() => setBooking({ ...booking, [`${scheduleTarget}ScheduleDate`]: d })}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Time slots selector */}
            <strong style={{ display: 'block', fontSize: '0.84rem', color: '#0F172A', margin: '16px 0 6px' }}>Select Time Slot</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { slot: '9:00 AM - 11:00 AM', tag: 'Fastest' },
                { slot: '11:00 AM - 1:00 PM', tag: 'Most Preferred' },
                { slot: '1:00 PM - 3:00 PM', tag: '' },
                { slot: '3:00 PM - 5:00 PM', tag: '' },
                { slot: '5:00 PM - 7:00 PM', tag: '' },
                { slot: '7:00 PM - 9:00 PM', tag: '' }
              ].map((item) => (
                <button
                  key={item.slot}
                  type="button"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    background: booking[`${scheduleTarget}ScheduleSlot`] === item.slot ? '#FFFDF5' : '#ffffff',
                    borderColor: booking[`${scheduleTarget}ScheduleSlot`] === item.slot ? '#FFC107' : '#cbd5e1',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onClick={() => setBooking({ ...booking, [`${scheduleTarget}ScheduleSlot`]: item.slot })}
                >
                  <strong style={{ display: 'block', fontSize: '0.78rem', color: '#0F172A' }}>{item.slot}</strong>
                  {item.tag && <span style={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: 800 }}>{item.tag}</span>}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              style={{ width: '100%', marginTop: 20 }}
              onClick={() => {
                setBooking({
                  ...booking,
                  [`preferred${scheduleTarget === 'pickup' ? 'Pickup' : 'Drop'}Time`]: 'SCHEDULE'
                })
                setShowScheduleModal(false)
              }}
            >
              Confirm Slot
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: GST / Business Invoice Sheet                                  */}
      {/* ==================================================================== */}
      {showGstModal && (
        <div className={styles.modalOverlay} onClick={() => setShowGstModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>GST / Business Tax Invoice</h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowGstModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.84rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 2 }}>Company Name *</label>
                <input
                  type="text"
                  value={booking.gstDetails.businessName}
                  onChange={(e) => setBooking({ ...booking, gstDetails: { ...booking.gstDetails, businessName: e.target.value } })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 2 }}>GSTIN *</label>
                  <input
                    type="text"
                    value={booking.gstDetails.gstin}
                    onChange={(e) => setBooking({ ...booking, gstDetails: { ...booking.gstDetails, gstin: e.target.value } })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 2 }}>State *</label>
                  <input
                    type="text"
                    value={booking.gstDetails.state}
                    onChange={(e) => setBooking({ ...booking, gstDetails: { ...booking.gstDetails, state: e.target.value } })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 2 }}>Registered Address *</label>
                <input
                  type="text"
                  value={booking.gstDetails.billingAddress}
                  onChange={(e) => setBooking({ ...booking, gstDetails: { ...booking.gstDetails, billingAddress: e.target.value } })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => {
                setBooking({ ...booking, isGstEnabled: true })
                setShowGstModal(false)
              }}
            >
              Save GST Invoice Details
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: Auth Modal for seamless login / signup upon booking checkout   */}
      {/* ==================================================================== */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthenticated={() => {
            setAuthModalOpen(false)
            executeBookingCreation()
          }}
          onSuccess={() => {
            setAuthModalOpen(false)
            executeBookingCreation()
          }}
        />
      )}
    </div>
  )
}
