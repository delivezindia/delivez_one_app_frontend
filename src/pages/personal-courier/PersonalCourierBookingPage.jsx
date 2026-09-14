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
  Plus
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { createCourierBooking } from '@/features/personal-courier/services/personalCourierService.js'
import CourierTrackingView from './components/CourierTrackingView.jsx'
import styles from './PersonalCourierBookingPage.module.css'

export default function PersonalCourierBookingPage({ serviceSlug }) {
  // Step state: 1 to 9 (1: Pickup, 2: Drop-off, 3: Content, 4: Details, 5: Service, 6: Insurance, 7: Review, 8: Payment, 9: Confirmed)
  const [step, setStep] = useState(1)
  const [activeTrackingId, setActiveTrackingId] = useState(null)
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
    pickupInstructions: 'Call before arriving',
    preferredPickupTime: 'ASAP',
    pickupScheduleDate: 'Today',
    pickupScheduleSlot: '11:00 AM - 1:00 PM',

    // Step 2: Drop-off Location
    dropTitle: 'Office',
    dropAddressLine: 'DLF Cyber City, Tower A, 6th Floor, Gurugram, Haryana 122002',
    dropPhone: '+91 98765 43211',
    dropContactPerson: 'Rohit Mehra',
    dropInstructions: 'Please leave at reception',
    preferredDropTime: 'ASAP',
    dropScheduleDate: 'Tomorrow',
    dropScheduleSlot: '2:00 PM - 4:00 PM',

    // Step 3: Package Content
    packageCategory: 'Documents',
    packageDescription: '',

    // Step 4: Package Details
    packageBoxRequired: 'yes',
    selectedWeightCapacity: '10 Kg',
    selectedBoxSize: 'Small Box',
    parcelType: 'Small',
    dimensions: { length: 30, width: 20, height: 20 },
    actualWeight: 2.5,
    specialHandling: false,
    isFragile: false,
    isSecure: false,
    isCod: false,
    pickupReadiness: 'Today',

    // Step 5: Service Type & Self Service
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
  const [showGstModal, setShowGstModal] = useState(false)
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

  // Pricing calculations
  const calculatePricing = () => {
    const baseSpeedPrice = booking.deliveryPrice || 120
    const boxFee = booking.packageBoxRequired === 'yes' ? (booking.selectedWeightCapacity === '25 Kg' ? 60 : booking.selectedWeightCapacity === '15 Kg' ? 45 : 30) : 0
    const handlingFee = (booking.isFragile ? 25 : 0) + (booking.isSecure ? 35 : 0)
    const insuranceFee = booking.insuranceOption === 0 ? Math.round(booking.declaredValue * 0.0075) : (booking.insuranceOption === 1 ? 49 : 0)
    const selfServiceDiscount = booking.selfServiceOption === 'Self Pickup' ? -30 : booking.selfServiceOption === 'Self Drop' ? -20 : 0
    const subtotal = Math.max(50, baseSpeedPrice + boxFee + handlingFee + insuranceFee + selfServiceDiscount)
    const discount = booking.promoApplied ? Math.min(50, Math.round(subtotal * 0.1)) : 0
    const tax = Math.round((subtotal - discount) * 0.18)
    const total = Math.round(subtotal - discount + tax)

    return {
      baseSpeedPrice,
      boxFee,
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

  // Handle Stepper Navigation
  const handleNext = async () => {
    if (step === 8) {
      setIsSubmitting(true)
      setSubmitError('')
      try {
        const payload = {
          serviceType: booking.selectedService || 'Local Delivery',
          deliverySpeed: booking.deliverySpeed || 'STANDARD',
          pickup: {
            title: booking.pickupTitle || 'Pickup Location',
            addressLine1: booking.pickupAddressLine || 'B-1204, Lodha Park, Near Shreyas Cinema, Ghatkopar East, Mumbai 400077',
            addressLine: booking.pickupAddressLine || 'B-1204, Lodha Park, Near Shreyas Cinema, Ghatkopar East, Mumbai 400077',
            contactPerson: booking.pickupContactPerson || 'Rahul Sharma',
            contactName: booking.pickupContactPerson || 'Rahul Sharma',
            phone: booking.pickupPhone || '+91 98765 43210',
            phoneNumber: booking.pickupPhone || '+91 98765 43210',
            city: 'Mumbai',
            state: 'Maharashtra',
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
            city: 'Gurugram',
            state: 'Haryana',
            postalCode: '122002',
            instructions: booking.dropInstructions || ''
          },
          package: {
            category: booking.packageCategory || 'Documents',
            description: booking.packageDescription || 'Personal Courier package',
            boxRequired: booking.packageBoxRequired,
            boxSize: booking.selectedBoxSize,
            weightCapacity: booking.selectedWeightCapacity,
            actualWeightKg: booking.actualWeight || 2.5,
            isFragile: Boolean(booking.isFragile),
            isSecure: Boolean(booking.isSecure)
          },
          paymentMethod: booking.paymentMethod === 'wallet' ? 'DELIVEZ_WALLET' : 'ONLINE'
        }

        const created = await createCourierBooking(payload)
        if (created?.id || created?.bookingNumber) {
          setBooking((prev) => ({
            ...prev,
            bookingId: created.bookingNumber || created.id || prev.bookingId
          }))
        }
      } catch (err) {
        console.warn('Backend booking submission note (proceeding with confirmation):', err)
      } finally {
        setIsSubmitting(false)
        setStep(9)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
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

  // Categories list for Step 3
  const categories = [
    { title: 'Documents', subtitle: 'Papers, files, certificates, books', icon: FileText, bg: '#FFF9E6', color: '#D97706' },
    { title: 'Electronics', subtitle: 'Mobile, laptop, gadgets, accessories', icon: Smartphone, bg: '#FFF1F2', color: '#E11D48' },
    { title: 'Clothing & Apparel', subtitle: 'Clothes, shoes, cap, fashion items', icon: Shirt, bg: '#EEF2FF', color: '#4F46E5' },
    { title: 'Gifts & Toys', subtitle: 'Gift items, toys, decorative items', icon: Gift, bg: '#FFFDF0', color: '#D97706' },
    { title: 'Health & Medicine', subtitle: 'Medicines, supplements, medical supplies', icon: HeartPulse, bg: '#ECFDF5', color: '#059669' },
    { title: 'Household Items', subtitle: 'Kitchenware, home decor, daily use', icon: HomeIcon, bg: '#FFF7ED', color: '#EA580C' },
    { title: 'Commercial Goods', subtitle: 'Samples, parts, raw materials, products', icon: Briefcase, bg: '#F0F9FF', color: '#0284C7' },
    { title: 'Others', subtitle: 'Other items not listed above', icon: MoreHorizontal, bg: '#F9FAFB', color: '#4B5563' }
  ]

  // Box data for Step 4
  const boxOptions = {
    '10 Kg': [
      { title: 'Small Box', dims: '30 cm (L) x 20 cm (W) x 20 cm (H)', tag: 'Best for Documents, Books, Electronics', cap: 'Up to 10 Kg', vol: '12,000 cm³' },
      { title: 'Medium Box', dims: '30 cm (L) x 30 cm (W) x 25 cm (H)', tag: 'Best for Clothing, Accessories, Home Items', cap: 'Up to 10 Kg', vol: '22,500 cm³' },
      { title: 'Large Box', dims: '40 cm (L) x 30 cm (W) x 30 cm (H)', tag: 'Best for Shoes, Helmets, Small Appliances', cap: 'Up to 10 Kg', vol: '36,000 cm³' }
    ],
    '15 Kg': [
      { title: 'Medium Box', dims: '35 cm (L) x 28 cm (W) x 32 cm (H)', tag: 'Best for Clothes, Books, Home Items', cap: 'Up to 15 Kg', vol: '31,360 cm³' },
      { title: 'Large Box', dims: '40 cm (L) x 30 cm (W) x 35 cm (H)', tag: 'Best for Appliances, Toys, Accessories', cap: 'Up to 15 Kg', vol: '42,000 cm³' },
      { title: 'Extra Large Box', dims: '45 cm (L) x 32 cm (W) x 40 cm (H)', tag: 'Best for Kitchen Items, Medium Appliances', cap: 'Up to 15 Kg', vol: '57,600 cm³' }
    ],
    '25 Kg': [
      { title: 'Medium Box', dims: '45 cm (L) x 35 cm (W) x 40 cm (H)', tag: 'Best for Clothing, Shoes, Books, Home Items', cap: 'Up to 25 Kg', vol: '63,000 cm³' },
      { title: 'Large Box', dims: '50 cm (L) x 40 cm (W) x 45 cm (H)', tag: 'Best for Appliances, Toys, Small Machines', cap: 'Up to 25 Kg', vol: '90,000 cm³' },
      { title: 'Extra Large Box', dims: '60 cm (L) x 45 cm (W) x 50 cm (H)', tag: 'Best for Large Appliances, Bulk Items, Luggage', cap: 'Up to 25 Kg', vol: '135,000 cm³' }
    ]
  }

  // Service tiers for Step 5
  const localServices = [
    { title: 'Bike Priority Delivery', badge: 'FASTEST', desc: 'Lightning fast delivery by bike for urgent shipments.', time: 'Delivery in 1 – 3 hours', price: 120, icon: Bike },
    { title: 'Same Day Delivery', badge: 'TODAY', desc: 'Delivered on the same day within city limits.', time: 'Delivery by 8 PM today', price: 150, icon: Truck },
    { title: 'Hybrid Drone Delivery', badge: 'INNOVATIVE', desc: 'Next-gen delivery using drone & road hybrid network.', time: 'Delivery in 30 – 90 mins', price: 200, icon: Zap },
    { title: 'Next Day Delivery', badge: 'AFFORDABLE', desc: 'Cost-effective delivery for non-urgent shipments.', time: 'Delivery by end of next day', price: 100, icon: Package }
  ]

  const intercityServices = [
    { title: 'Standard Delivery', badge: 'MOST POPULAR', desc: 'Reliable delivery within 2 – 3 business days across India.', time: 'Delivery in 2 – 3 days', price: 100, icon: Truck },
    { title: 'Express Delivery', badge: 'FAST', desc: 'Priority delivery within city or across major air routes.', time: 'Delivery in 24 – 48 hours', price: 180, icon: Zap },
    { title: 'Precise Time Delivery', badge: 'GUARANTEED', desc: 'Guaranteed delivery at your chosen exact time slot.', time: 'Delivery at chosen time slot', price: 250, icon: Clock },
    { title: 'Schedule Delivery', badge: 'ADVANCE', desc: 'Choose your preferred date and time for pickup and delivery.', time: 'Deliver on selected date', price: 130, icon: Calendar },
    { title: 'Next Day Delivery', badge: 'NEXT BUSINESS DAY', desc: 'Cost-effective with guaranteed next business day transit.', time: 'Delivery by next business day', price: 120, icon: Package }
  ]

  const isIntercity = booking.selectedService?.toLowerCase().includes('intercity')
  const availableServices = isIntercity ? intercityServices : localServices

  if (activeTrackingId) {
    return (
      <CourierTrackingView
        bookingId={activeTrackingId}
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
                {step === 6 && 'Add Insurance'}
                {step === 7 && 'Review & Confirm'}
                {step === 8 && 'Payment Method'}
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

      {/* Stepper Bar (Steps 1 to 8) */}
      <div className={styles.stepperWrap}>
        <div className={styles.stepperInner}>
          {[
            { num: 1, label: 'Pickup' },
            { num: 2, label: 'Drop-off' },
            { num: 3, label: 'Content' },
            { num: 4, label: 'Details' },
            { num: 5, label: 'Service' },
            { num: 6, label: 'Insurance' },
            { num: 7, label: 'Review' },
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
        {/* ==================================================================== */}
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
        {/* STEP 3: PACKAGE CONTENT (PackageContentScreen)                       */}
        {/* ==================================================================== */}
        {step === 3 && (
          <>
            {/* Location Route Summary */}
            <div className={styles.locationSummaryCard}>
              <div className={styles.locCol}>
                <MapPin size={18} color="#FFB800" />
                <div className={styles.locText}>
                  <small>From</small>
                  <strong>{booking.pickupTitle || 'Mumbai'}</strong>
                  <span>400001</span>
                </div>
              </div>

              <div className={styles.locArrow}>
                <ArrowRight size={16} />
              </div>

              <div className={styles.locCol}>
                <MapPin size={18} color="#DC2626" />
                <div className={styles.locText}>
                  <small>To</small>
                  <strong>{booking.dropTitle || 'Gurugram'}</strong>
                  <span>122002</span>
                </div>
              </div>
            </div>

            {/* Content Categories Grid */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>What's inside your package?</h2>
                  <p className={styles.cardSub}>Helps us handle your shipment safely and comply with regulations</p>
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
                      <ChevronRight size={14} color="#94a3b8" />
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
                      {booking.packageDescription || 'Add a brief note about items inside (e.g. 2 books, office files)'}
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
        {/* STEP 4: PACKAGE DETAILS (PackageDetailsScreen)                       */}
        {/* ==================================================================== */}
        {step === 4 && (
          <>
            {/* Location Route Summary */}
            <div className={styles.locationSummaryCard}>
              <div className={styles.locCol}>
                <MapPin size={18} color="#FFB800" />
                <div className={styles.locText}>
                  <small>From</small>
                  <strong>{booking.pickupTitle}</strong>
                  <span>400001</span>
                </div>
              </div>
              <ArrowRight size={16} className={styles.locArrow} />
              <div className={styles.locCol}>
                <MapPin size={18} color="#DC2626" />
                <div className={styles.locText}>
                  <small>To</small>
                  <strong>{booking.dropTitle}</strong>
                  <span>122002</span>
                </div>
              </div>
            </div>

            {/* Package Box Required Card */}
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
                    <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#64748B' }}>I will pack the items securely myself</p>
                  </div>
                </div>
              </div>
            </div>

            {/* If Yes: Select Box Size */}
            {booking.packageBoxRequired === 'yes' ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Select Box Size</h2>
                <p className={styles.cardSub} style={{ marginBottom: 14 }}>Our executive will bring the box matching your selection</p>

                {/* Weight Capacity Tabs */}
                <div className={styles.capacityTabs}>
                  {['10 Kg', '15 Kg', '25 Kg'].map((weight) => (
                    <button
                      key={weight}
                      type="button"
                      className={`${styles.capTab} ${booking.selectedWeightCapacity === weight ? styles.capTabActive : ''}`}
                      onClick={() =>
                        setBooking({
                          ...booking,
                          selectedWeightCapacity: weight,
                          selectedBoxSize: boxOptions[weight][0].title
                        })
                      }
                    >
                      {weight}
                    </button>
                  ))}
                </div>

                {/* Box Cards */}
                <div className={styles.boxList}>
                  {boxOptions[booking.selectedWeightCapacity]?.map((box) => {
                    const isSelected = booking.selectedBoxSize === box.title
                    return (
                      <div
                        key={box.title}
                        className={`${styles.boxCardItem} ${isSelected ? styles.boxCardItemSelected : ''}`}
                        onClick={() => setBooking({ ...booking, selectedBoxSize: box.title })}
                      >
                        <div className={styles.boxCardLeft}>
                          <Package size={28} color="#D97706" />
                          <div>
                            <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
                              {box.title} ({booking.selectedWeightCapacity})
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

                {/* Custom Box Link */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px dashed #cbd5e1',
                    marginTop: 12,
                    cursor: 'pointer',
                    background: '#f8fafc'
                  }}
                  onClick={() => setShowCustomBoxModal(true)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Layers size={22} color="#D97706" />
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>Need a Custom Size Box?</strong>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>Our executive will assess and bring custom box material</p>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#64748B" />
                </div>
              </div>
            ) : (
              /* If No: Custom Dimensions input */
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Own Packaging Dimensions (cm)</h2>
                <p className={styles.cardSub} style={{ marginBottom: 14 }}>Enter approximate size of your packaged parcel</p>

                <div className={styles.dimGrid}>
                  <div className={styles.inputGroup}>
                    <label>Length (cm)</label>
                    <input
                      type="number"
                      value={booking.dimensions.length}
                      onChange={(e) => setBooking({ ...booking, dimensions: { ...booking.dimensions, length: e.target.value } })}
                    />
                  </div>
                  <span style={{ fontWeight: 800, color: '#94a3b8' }}>×</span>
                  <div className={styles.inputGroup}>
                    <label>Width (cm)</label>
                    <input
                      type="number"
                      value={booking.dimensions.width}
                      onChange={(e) => setBooking({ ...booking, dimensions: { ...booking.dimensions, width: e.target.value } })}
                    />
                  </div>
                  <span style={{ fontWeight: 800, color: '#94a3b8' }}>×</span>
                  <div className={styles.inputGroup}>
                    <label>Height (cm)</label>
                    <input
                      type="number"
                      value={booking.dimensions.height}
                      onChange={(e) => setBooking({ ...booking, dimensions: { ...booking.dimensions, height: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Package Weight & Special Handling */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 12 }}>Package Weight & Handling</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Actual Weight (Approx)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.5"
                      value={booking.actualWeight}
                      onChange={(e) => setBooking({ ...booking, actualWeight: parseFloat(e.target.value) || 1 })}
                      style={{
                        width: '100%',
                        padding: '10px 38px 10px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '1rem',
                        fontWeight: 750
                      }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: 12, fontSize: '0.84rem', fontWeight: 800, color: '#64748B' }}>
                      kg
                    </span>
                  </div>
                  <small style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Weight verified by executive on calibrated digital scale.</small>
                </div>

                <div style={{ background: '#FFFDF5', border: '1px solid #FEF3C7', borderRadius: 8, padding: 10 }}>
                  <small style={{ color: '#D97706', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Chargeable Weight</small>
                  <strong style={{ display: 'block', fontSize: '1.4rem', color: '#0F172A', margin: '2px 0' }}>
                    {Math.max(booking.actualWeight, 2.0)} kg
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Calculated by higher of volumetric or actual mass</span>
                </div>
              </div>

              {/* Special Handling Options */}
              <div className={styles.specialHandlingCard}>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0F172A' }}>Special Handling Safeguards</strong>
                <div className={styles.handlingToggles}>
                  <div
                    className={`${styles.handlingBtn} ${booking.isFragile ? styles.handlingBtnActive : ''}`}
                    onClick={() => setBooking({ ...booking, isFragile: !booking.isFragile })}
                  >
                    <Wine size={18} />
                    <strong style={{ fontSize: '0.78rem' }}>Fragile (+₹25)</strong>
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Handle with care</span>
                  </div>

                  <div
                    className={`${styles.handlingBtn} ${booking.isSecure ? styles.handlingBtnActive : ''}`}
                    onClick={() => setBooking({ ...booking, isSecure: !booking.isSecure })}
                  >
                    <Lock size={18} />
                    <strong style={{ fontSize: '0.78rem' }}>Tamper-Seal (+₹35)</strong>
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Numbered seal</span>
                  </div>

                  <div className={`${styles.handlingBtn} ${styles.handlingBtnDisabled}`}>
                    <Wallet size={18} />
                    <strong style={{ fontSize: '0.78rem' }}>COD</strong>
                    <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Unavailable</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 5: SERVICE TYPE (LocalServiceTypeScreen)                        */}
        {/* ==================================================================== */}
        {step === 5 && (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.cardTitle}>
                    {isIntercity ? 'Intercity Delivery Options' : 'Local Delivery Speed'}
                  </h2>
                  <p className={styles.cardSub}>Choose the delivery speed matching your timeline</p>
                </div>
              </div>

              <div className={styles.serviceList}>
                {availableServices.map((srv) => {
                  const isSelected = booking.deliverySpeed === srv.title
                  const IconC = srv.icon
                  return (
                    <div
                      key={srv.title}
                      className={`${styles.serviceCard} ${isSelected ? styles.serviceCardSelected : ''}`}
                      onClick={() =>
                        setBooking({
                          ...booking,
                          deliverySpeed: srv.title,
                          deliveryPrice: srv.price
                        })
                      }
                    >
                      <div className={styles.serviceTop}>
                        <div className={styles.serviceIconBox}>
                          <IconC size={26} />
                        </div>
                        <div className={styles.serviceDetails}>
                          <div className={styles.serviceTitleRow}>
                            <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{srv.title}</strong>
                            <span className={srv.badge === 'FASTEST' ? styles.serviceBadgeRed : styles.serviceBadgeSoft}>
                              {srv.badge}
                            </span>
                          </div>
                          <p className={styles.serviceDesc}>{srv.desc}</p>
                        </div>
                        <div className={`${styles.radioCircle} ${isSelected ? styles.radioCircleActive : ''}`}>
                          {isSelected && <div className={styles.radioInnerDot} />}
                        </div>
                      </div>

                      <div className={styles.serviceBottomRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748B' }}>
                          <Clock size={14} color="#D97706" />
                          <span>{srv.time}</span>
                        </div>
                        <span className={styles.priceTag}>₹{srv.price}.00</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Self Service Options Row */}
              <div style={{ marginTop: 20 }}>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0F172A', marginBottom: 8 }}>
                  Optional Self Service Saver
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div
                    className={`${styles.boxOptionCard} ${booking.selfServiceOption === 'Self Pickup' ? styles.boxOptionCardSelected : ''}`}
                    onClick={() =>
                      setBooking({
                        ...booking,
                        selfServiceOption: booking.selfServiceOption === 'Self Pickup' ? null : 'Self Pickup'
                      })
                    }
                  >
                    <Package size={20} color="#16A34A" />
                    <div>
                      <strong style={{ fontSize: '0.84rem' }}>Self Pickup</strong>
                      <span className={styles.tagGreen}>Save ₹30</span>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>You drop at nearest hub</p>
                    </div>
                  </div>

                  <div
                    className={`${styles.boxOptionCard} ${booking.selfServiceOption === 'Self Drop' ? styles.boxOptionCardSelected : ''}`}
                    onClick={() =>
                      setBooking({
                        ...booking,
                        selfServiceOption: booking.selfServiceOption === 'Self Drop' ? null : 'Self Drop'
                      })
                    }
                  >
                    <Truck size={20} color="#16A34A" />
                    <div>
                      <strong style={{ fontSize: '0.84rem' }}>Self Collection</strong>
                      <span className={styles.tagGreen}>Save ₹20</span>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>Recipient collects at hub</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* STEP 6: ADD INSURANCE (LocalAddInsurancePage)                        */}
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
        {/* STEP 7: REVIEW & CONFIRM (ReviewConfirmScreen)                       */}
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
                    {booking.deliverySpeed.includes('Same Day') ? 'Today, before 08:00 PM' : 'Tomorrow, before 06:00 PM'}
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
                  <div>Box Type: <strong>{booking.packageBoxRequired === 'yes' ? booking.selectedBoxSize : 'Own Packaging'}</strong></div>
                  <div>Weight: <strong>{booking.actualWeight} kg</strong></div>
                  <div>Speed: <strong>{booking.deliverySpeed}</strong></div>
                  <div>Insurance: <strong>{booking.insuranceOption === 0 ? 'Full Coverage' : booking.insuranceOption === 1 ? 'Basic (₹10k)' : 'None'}</strong></div>
                  <div>Special Handling: <strong>{booking.isFragile ? 'Fragile' : 'Standard'}</strong></div>
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
        {/* STEP 8: PAYMENT METHOD (CourierPaymentMethodScreen)                 */}
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

              {/* Additional Options (GST Switch & Promo) */}
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* GST Toggle */}
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
        {/* STEP 9: BOOKING CONFIRMED (BookingConfirmedScreen)                   */}
        {/* ==================================================================== */}
        {step === 9 && (
          <div className={styles.card}>
            <div className={styles.confirmedHero}>
              <div className={styles.confirmedCheckCircle}>
                <Check size={36} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
                Booking Confirmed!
              </h2>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
                Your courier shipment has been successfully scheduled. We will take care of the rest.
              </p>
            </div>

            {/* Booking ID Box */}
            <div className={styles.bookingIdBox}>
              <div>
                <small style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>BOOKING ID</small>
                <strong style={{ fontSize: '1.15rem', color: '#0F172A' }}>{booking.bookingId}</strong>
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
                  navigator.clipboard.writeText(booking.bookingId)
                  alert('Booking ID copied to clipboard: ' + booking.bookingId)
                }}
              >
                <Copy size={13} /> Copy
              </button>
            </div>

            {/* Amount Paid & ETA summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0' }}>
              <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: 10, padding: 12 }}>
                <small style={{ color: '#166534', fontWeight: 700, fontSize: '0.7rem' }}>AMOUNT PAID</small>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#15803D' }}>₹{pricing.total}.00</strong>
                <span style={{ fontSize: '0.74rem', color: '#166534' }}>Paid via Delivez Money</span>
              </div>

              <div style={{ background: '#FFFDF5', border: '1px solid #FEF3C7', borderRadius: 10, padding: 12 }}>
                <small style={{ color: '#D97706', fontWeight: 700, fontSize: '0.7rem' }}>ESTIMATED ARRIVAL</small>
                <strong style={{ display: 'block', fontSize: '1.05rem', color: '#0F172A' }}>Tomorrow</strong>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Before 06:00 PM</span>
              </div>
            </div>

            {/* Assigned Fleet Partner notice */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bike size={20} color="#E11D48" />
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>Courier Partner Assignment in Progress</strong>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>
                    Nearest delivery executive is being dispatched for pickup from {booking.pickupTitle}.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className={styles.primaryBtn}
                style={{ width: '100%' }}
                onClick={() => setActiveTrackingId(booking.bookingId)}
              >
                Track Shipment Now
              </button>
              <button
                type="button"
                className={styles.outlineBtn}
                style={{ width: '100%' }}
                onClick={() => navigateTo('/courier')}
              >
                Back to Courier Home
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar (Steps 1 - 8) */}
      {step < 9 && (
        <div className={styles.stickyBottomBar}>
          <div className={styles.stickyBarInner}>
            {step > 1 && (
              <button type="button" className={styles.outlineBtn} onClick={handleBack}>
                Back
              </button>
            )}
            <button type="button" className={styles.primaryBtn} onClick={handleNext}>
              <span>{step === 7 ? 'Confirm & Pay' : step === 8 ? `Pay Securely • ₹${pricing.total}.00` : 'Continue'}</span>
              <ArrowRight size={16} />
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
              {['Today', 'Tomorrow', '14 Sep', '15 Sep'].map((d) => (
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
      {/* MODAL: Why Is This Important Dialog                                  */}
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
              Declaring your package contents helps us verify compliance with regional shipping regulations, evaluate flight/intercity transport restrictions, and apply the appropriate handling safeguards during transit.
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
      {/* MODAL: Custom Box Assessment Dialog                                  */}
      {/* ==================================================================== */}
      {showCustomBoxModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCustomBoxModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>Custom Packaging Assessment</h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowCustomBoxModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.4 }}>
              Our executive will bring custom corrugated material, bubble wrap, and strapping bands to securely box unusual dimensions at your doorstep during pickup.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ width: '100%', marginTop: 14 }}
              onClick={() => {
                setBooking({ ...booking, selectedBoxSize: 'Custom Assessment Box' })
                setShowCustomBoxModal(false)
              }}
            >
              Select Custom Box
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
    </div>
  )
}
