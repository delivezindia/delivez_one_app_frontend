import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  FileCheck,
  FileText,
  HeartHandshake,
  HelpCircle,
  Home,
  Info,
  Key,
  Layers,
  LoaderCircle,
  Lock,
  Luggage,
  MapPin,
  Minus,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  Plane,
  Plus,
  QrCode,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  User,
  UserCheck,
  Wallet,
  Wifi,
  X,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { getStoredUser } from '@/features/auth/services/userAuthService.js'
import {
  createLuggageBooking,
  fetchLuggageOptions,
  fetchLuggageQuote,
  validateLuggageCoupon,
  fetchLuggageTracking,
  verifyLuggageOtp,
  submitLuggagePod,
  advanceLuggageMilestone,
  processLuggagePayment,
} from '@/features/luggage-delivery/services/luggageDeliveryService.js'
import styles from './LuggageDeliveryBookingPage.module.css'

const STEPS = [
  'Service',
  'Route',
  'Pickup',
  'Delivery',
  'Transit Hub',
  'Bags',
  'Protections',
  'Add-ons',
  'Assistance',
  'Schedule',
  'Review',
  'Payment',
]

const DRAFT_KEY = 'delivez-luggage-booking-draft-v2'

function localDate(daysAhead = 0) {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
  return d.toISOString().split('T')[0]
}

function makeIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? ('lug-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8))
}

export default function LuggageDeliveryBookingPage() {
  const user = getStoredUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [options, setOptions] = useState(null)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // Service drawer toggles
  const [expandedServiceId, setExpandedServiceId] = useState(null)

  // Booking Flow State
  const [serviceId, setServiceId] = useState('home_airport')
  const [routeType, setRouteType] = useState('single_trip')

  const [pickupDetails, setPickupDetails] = useState({
    addressLine: 'Flat 402, Green Valley Apartments',
    landmark: 'Near City Centre Metro',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110037',
    contactName: user?.fullName || 'Rahul Sharma',
    contactPhone: user?.mobileNumber || '+91 9876543210',
    altPhone: '',
    email: user?.email || 'rahul@example.com',
    instructions: 'Ring bell on arrival. 4th floor, lift available.',
  })

  const [deliveryDetails, setDeliveryDetails] = useState({
    addressLine: 'Terminal 3 Departure Ramp, Pillar 4',
    landmark: 'Opposite Gate 4 Entry',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110037',
    contactName: user?.fullName || 'Rahul Sharma',
    contactPhone: user?.mobileNumber || '+91 9876543210',
    altPhone: '',
    email: user?.email || 'rahul@example.com',
    instructions: 'Meet passenger at departure pillar 4 near airline sign.',
  })

  // Flight Details (for airport services)
  const [flightDetails, setFlightDetails] = useState({
    airportName: 'Indira Gandhi International Airport (DEL)',
    terminal: 'T3',
    gatePillar: 'Gate 4 / Pillar 4',
    airline: 'IndiGo Airlines',
    flightNumber: '6E-2134',
    flightDate: localDate(1),
    flightTime: '18:30',
    boardingTime: '17:45',
    pnr: 'QZ89LM',
    passengerName: user?.fullName || 'Rahul Sharma',
    mobile: user?.mobileNumber || '+91 9876543210',
    instructions: 'Will call courier 30 mins before arrival at departure gate.',
  })

  // Hotel Details (for hotel services)
  const [hotelDetails, setHotelDetails] = useState({
    hotelName: 'The Leela Palace New Delhi',
    address: 'Diplomatic Enclave, Chanakyapuri',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110023',
    roomNumber: 'Suite 408',
    bookingRef: 'LEELA-782190',
    checkInDate: localDate(0),
    checkOutDate: localDate(2),
    guestName: user?.fullName || 'Rahul Sharma',
    mobile: user?.mobileNumber || '+91 9876543210',
    frontDeskContact: '+91 11 3933 1234',
    allowStaffCoordination: true,
    specialInstructions: 'Luggage can be handed over to concierge if guest is out.',
  })

  // Multi-stop list
  const [multiStops, setMultiStops] = useState([
    { id: 'stop_1', type: 'HOME', title: 'Pickup Residence', address: 'Green Valley, Delhi' },
    { id: 'stop_2', type: 'HOTEL', title: 'Hotel Drop-off', address: 'The Leela Palace, Chanakyapuri' },
    { id: 'stop_3', type: 'AIRPORT', title: 'Final Terminal Drop', address: 'IGI Airport T3, Gate 4' },
  ])

  // Luggage Items list
  const [luggageItems, setLuggageItems] = useState([
    {
      id: 'bag_1',
      type: 'SUITCASE_TROLLEY',
      size: 'medium',
      quantity: 1,
      weightKg: 18,
      description: 'Navy blue hard-shell Delsey trolley with TSA lock',
      isFragile: false,
    },
  ])

  // Protections & Add-ons & Assistance
  const [selectedProtections, setSelectedProtections] = useState(['tamper_tag'])
  const [selectedAddOns, setSelectedAddOns] = useState(['photo_pickup', 'priority'])
  const [selectedAirportAssistance, setSelectedAirportAssistance] = useState([])

  // Schedule & Speed
  const [schedule, setSchedule] = useState({
    pickupDate: localDate(0),
    pickupTimeSlot: '02:00 PM - 04:00 PM',
    deliveryDate: localDate(0),
    deliveryTimeSlot: '06:00 PM - 08:00 PM',
    deliverySpeed: 'STANDARD',
    flightBasedUrgency: true,
    exactTime: '',
  })

  // GST Invoice
  const [gstInvoice, setGstInvoice] = useState({
    requestInvoice: false,
    businessName: '',
    gstin: '',
    legalName: '',
    registeredAddress: '',
    state: 'Delhi',
    pincode: '110001',
    saveGst: true,
  })

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('wallet')

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMessage, setCouponMessage] = useState(null)

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode || '').trim().toUpperCase()
    if (!code) return
    try {
      setCouponLoading(true)
      setCouponMessage(null)
      const res = await validateLuggageCoupon(code, quote?.subtotal || 0, {
        serviceId,
        routeType,
        luggageItems,
        selectedProtections,
        selectedAddOns,
        selectedAirportAssistance,
        deliverySpeed: schedule.deliverySpeed,
      })
      if (res?.valid) {
        setAppliedCoupon({
          code: res.coupon_code || code,
          discountAmount: res.discount_amount,
          message: res.message,
        })
        setCouponCode(code)
        setCouponMessage({ type: 'success', text: res.message || `Coupon ${code} applied!` })
      } else {
        setAppliedCoupon(null)
        setCouponMessage({ type: 'error', text: res?.message || 'Invalid coupon code' })
      }
    } catch (err) {
      setAppliedCoupon(null)
      setCouponMessage({ type: 'error', text: err.message || 'Failed to apply coupon' })
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponMessage(null)
  }

  // Booking Result & Live Tracking Modal
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [trackingData, setTrackingData] = useState(null)
  const [showPodModal, setShowPodModal] = useState(false)
  const [podForm, setPodForm] = useState({
    receiverName: 'Rahul Sharma',
    receiverRelation: 'Self',
    otp: '',
    sealIntact: true,
  })
  const [podSubmitting, setPodSubmitting] = useState(false)

  // 1. Fetch Discovery Options on Mount
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoadingOptions(true)
        const data = await fetchLuggageOptions()
        if (mounted) {
          setOptions(data)
          setLoadingOptions(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load luggage delivery services')
          setLoadingOptions(false)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // 2. Fetch live quote whenever relevant parameters change
  useEffect(() => {
    let active = true
    async function getQuote() {
      try {
        setQuoteLoading(true)
        const q = await fetchLuggageQuote({
          serviceId,
          routeType,
          luggageItems,
          selectedProtections,
          selectedAddOns,
          selectedAirportAssistance,
          deliverySpeed: schedule.deliverySpeed,
          distanceKm: 22,
          applied_coupon: appliedCoupon ? { code: appliedCoupon.code } : null,
          couponCode: appliedCoupon?.code,
        })
        if (active) {
          setQuote(q)
          setQuoteLoading(false)
        }
      } catch (err) {
        if (active) {
          setQuoteLoading(false)
        }
      }
    }
    getQuote()
    return () => { active = false }
  }, [
    serviceId,
    routeType,
    luggageItems,
    selectedProtections,
    selectedAddOns,
    selectedAirportAssistance,
    schedule.deliverySpeed,
    appliedCoupon,
  ])

  // Helper to determine if service involves Airport
  const isAirportService = useMemo(() => {
    return serviceId.includes('airport') || serviceId === 'multi_stop'
  }, [serviceId])

  // Helper to determine if service involves Hotel
  const isHotelService = useMemo(() => {
    return serviceId.includes('hotel') || serviceId === 'multi_stop'
  }, [serviceId])

  // Selected Service Object
  const currentService = useMemo(() => {
    if (!options?.services) return null
    return options.services.find((s) => s.id === serviceId) || options.services[0]
  }, [options, serviceId])

  // Toggle helpers
  const toggleProtection = (id) => {
    setSelectedProtections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleAssistance = (id) => {
    setSelectedAirportAssistance((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Luggage Bag helpers
  const addBag = () => {
    setLuggageItems((prev) => [
      ...prev,
      {
        id: 'bag_' + (prev.length + 1),
        type: 'SUITCASE_TROLLEY',
        size: 'medium',
        quantity: 1,
        weightKg: 15,
        description: 'Check-in luggage bag',
        isFragile: false,
      },
    ])
  }

  const removeBag = (index) => {
    if (luggageItems.length <= 1) return
    setLuggageItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateBag = (index, field, value) => {
    setLuggageItems((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    )
  }

  // Handle final booking submission
  const handleConfirmAndPay = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        serviceId,
        routeType,
        pickupDetails,
        deliveryDetails,
        flightDetails: isAirportService ? flightDetails : null,
        hotelDetails: isHotelService ? hotelDetails : null,
        multiStops: serviceId === 'multi_stop' ? multiStops : null,
        luggageItems,
        selectedProtections,
        selectedAddOns,
        selectedAirportAssistance,
        schedule,
        gstInvoice: gstInvoice.requestInvoice ? gstInvoice : null,
        paymentMethod: paymentMethod.toUpperCase(),
        distanceKm: 22,
        applied_coupon: appliedCoupon ? { code: appliedCoupon.code } : null,
        couponCode: appliedCoupon?.code,
      }

      const booking = await createLuggageBooking(payload, makeIdempotencyKey())

      // Process sandbox payment
      if (paymentMethod !== 'cash_on_delivery') {
        await processLuggagePayment(booking.bookingNumber, {
          method: paymentMethod.toUpperCase(),
          outcome: 'SUCCESS',
        })
      }

      setConfirmedBooking(booking)
      setSubmitting(false)
    } catch (err) {
      setSubmitting(false)
      setError(err.message || 'Booking creation failed. Please try again.')
    }
  }

  // Load Tracking
  const loadTracking = async (bookingId) => {
    try {
      const tracking = await fetchLuggageTracking(bookingId)
      setTrackingData(tracking)
    } catch (err) {
      setError(err.message || 'Failed to load live tracking')
    }
  }

  // Simulation: Advance Milestone
  const handleAdvanceMilestone = async () => {
    if (!confirmedBooking) return
    try {
      const updated = await advanceLuggageMilestone(confirmedBooking.bookingNumber)
      setConfirmedBooking(updated)
      await loadTracking(updated.bookingNumber)
      setNotice(`Shipment advanced to: ${updated.status}`)
      setTimeout(() => setNotice(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to advance milestone')
    }
  }

  // Submit POD
  const handleSubmitPod = async () => {
    if (!confirmedBooking) return
    try {
      setPodSubmitting(true)
      const res = await submitLuggagePod(confirmedBooking.bookingNumber, podForm)
      setConfirmedBooking(res.booking)
      await loadTracking(res.booking.bookingNumber)
      setShowPodModal(false)
      setPodSubmitting(false)
      setNotice('Proof of Delivery (POD) verified and recorded!')
      setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      setPodSubmitting(false)
      setError(err.message || 'Failed to submit POD')
    }
  }

  if (loadingOptions) {
    return (
      <div className={styles.loading}>
        <LoaderCircle />
        <strong>Loading Luggage Delivery module...</strong>
        <span>Fetching airport, hotel, and doorstep transfer services</span>
      </div>
    )
  }

  // ==========================================
  // CONFIRMATION & LIVE TRACKING VIEW
  // ==========================================
  if (confirmedBooking) {
    const isDelivered = confirmedBooking.status === 'DELIVERED'
    const milestones = trackingData?.milestones || confirmedBooking.milestones || []
    const currentMilestoneIdx = trackingData?.currentMilestoneIndex ?? confirmedBooking.currentMilestoneIndex ?? 0

    return (
      <div className={styles.confirmation}>
        <header>
          <button type="button" onClick={() => setConfirmedBooking(null)}>
            <ArrowLeft />
          </button>
          <div>
            <strong>Delivez</strong>
            <span>LUGGAGE TRANSIT & TRACKING</span>
          </div>
          <button type="button" onClick={() => navigateTo('/help')}>
            <HelpCircle />
          </button>
        </header>

        {notice && (
          <div className={styles.notice}>
            <CheckCircle2 /> {notice}
          </div>
        )}
        {error && (
          <div className={styles.error}>
            <ShieldAlert /> {error}
          </div>
        )}

        <div className={styles.confirmationHero}>
          <span>
            {isDelivered ? <Award /> : <PackageCheck />}
          </span>
          <div>
            <p>
              <CheckCircle2 /> {isDelivered ? 'LUGGAGE DELIVERED' : 'BOOKING CONFIRMED & DISPATCHED'}
            </p>
            <h1>{isDelivered ? 'Safe Handover Completed!' : 'Luggage Transfer in Motion'}</h1>
            <small>
              Your bags are monitored end-to-end under barcode tamper-evident seal and active GPS surveillance.
            </small>
          </div>
        </div>

        {/* Booking Number Card */}
        <div className={styles.bookingId}>
          <div>
            <small>OFFICIAL BOOKING REFERENCE</small>
            <strong>{confirmedBooking.bookingNumber}</strong>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(confirmedBooking.bookingNumber)
              setNotice('Booking ID copied to clipboard!')
              setTimeout(() => setNotice(null), 2500)
            }}
          >
            <Copy /> Copy ID
          </button>
        </div>

        {/* OTP Cards for Pickup & Delivery */}
        <div className={styles.confirmationGrid}>
          <section>
            <Key />
            <div>
              <small>PICKUP VERIFICATION OTP</small>
              <strong style={{ fontSize: '18px', color: '#b45309' }}>
                {confirmedBooking.pickupOtp || '4821'}
              </strong>
            </div>
          </section>
          <section>
            <ShieldCheck />
            <div>
              <small>DELIVERY HANDOVER OTP</small>
              <strong style={{ fontSize: '18px', color: '#15803d' }}>
                {confirmedBooking.deliveryOtp || '9382'}
              </strong>
            </div>
          </section>
        </div>

        {/* Driver & Concierge Details */}
        {confirmedBooking.driverDetails && (
          <div className={styles.panel} style={{ marginTop: '16px' }}>
            <div className={styles.panelHeading} style={{ marginBottom: '12px' }}>
              <div>
                <h2>Dedicated Luggage Handler</h2>
                <p>Delivez certified baggage executive assigned to your transfer</p>
              </div>
              <span className={styles.trustBadge}>
                <ShieldCheck /> Verified Executive
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ffbd0a', display: 'grid', placeItems: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                RK
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '16px', display: 'block' }}>{confirmedBooking.driverDetails.name}</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Vehicle: {confirmedBooking.driverDetails.vehicleNumber} • Rating: ⭐ {confirmedBooking.driverDetails.rating}
                </span>
              </div>
              <a
                href={`tel:${confirmedBooking.driverDetails.phone}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: '#10b981', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '12px' }}
              >
                <Phone size={14} /> Call Driver
              </a>
            </div>
          </div>
        )}

        {/* 10-Milestone Journey Timeline (Matching jurney_timeline.dart) */}
        <div className={styles.panel} style={{ marginTop: '16px' }}>
          <div className={styles.panelHeading} style={{ marginBottom: '8px' }}>
            <div>
              <h2>Journey Timeline (10 Milestones)</h2>
              <p>Real-time checkpoint scan progress from doorstep pickup to delivery</p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>
              Step {currentMilestoneIdx + 1} of 10
            </span>
          </div>

          <div className={styles.timelineContainer}>
            {milestones.map((m, idx) => {
              const isPassed = idx < currentMilestoneIdx
              const isCurrent = idx === currentMilestoneIdx
              return (
                <div key={m.id || idx} className={styles.timelineItem}>
                  <div
                    className={`${styles.timelineMarker} ${
                      isPassed || (isDelivered && idx === 9)
                        ? styles.timelineMarkerCompleted
                        : isCurrent
                        ? styles.timelineMarkerActive
                        : ''
                    }`}
                  />
                  <div
                    className={`${styles.timelineCard} ${
                      isPassed || (isDelivered && idx === 9)
                        ? styles.timelineCardCompleted
                        : isCurrent
                        ? styles.timelineCardActive
                        : ''
                    }`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px' }}>
                        {idx + 1}. {m.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: isPassed || (isDelivered && idx === 9) ? '#dcfce7' : isCurrent ? '#fef3c7' : '#f1f5f9',
                          color: isPassed || (isDelivered && idx === 9) ? '#166534' : isCurrent ? '#92400e' : '#64748b',
                        }}
                      >
                        {isPassed || (isDelivered && idx === 9) ? 'COMPLETED' : isCurrent ? 'ACTIVE NOW' : 'PENDING'}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                      {m.subtitle}
                    </p>
                    {m.timestamp && (
                      <small style={{ display: 'block', marginTop: '4px', fontSize: '10px', color: '#94a3b8' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Verified
                      </small>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Milestone Advancement & POD Actions for Demo / Testing */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {!isDelivered && (
              <button
                type="button"
                className={styles.continueButton}
                style={{ flex: 1, minHeight: '44px', fontSize: '13px' }}
                onClick={handleAdvanceMilestone}
              >
                <ChevronRight /> Advance Next Milestone (Simulate GPS)
              </button>
            )}
            <button
              type="button"
              className={styles.backButton}
              style={{ flex: 1, minHeight: '44px', fontSize: '13px', borderColor: '#10b981', color: '#047857' }}
              onClick={() => setShowPodModal(true)}
            >
              <FileCheck /> {isDelivered ? 'View Proof of Delivery (POD)' : 'Complete Handover & POD'}
            </button>
          </div>
        </div>

        {/* Proof of Delivery (POD) Modal matching pod.dart */}
        {showPodModal && (
          <div className={styles.podModalBackdrop} onClick={() => setShowPodModal(false)}>
            <div className={styles.podModalContent} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px' }}>Proof of Delivery (POD)</h2>
                  <small style={{ color: '#64748b' }}>Verification data required by Delivez Luggage Protocol</small>
                </div>
                <button type="button" onClick={() => setShowPodModal(false)} style={{ border: 0, background: 'none', cursor: 'pointer' }}>
                  <X />
                </button>
              </div>

              <div className={styles.stack}>
                <label className={styles.valueField} style={{ maxWidth: 'none' }}>
                  <span>Recipient Full Name</span>
                  <input
                    type="text"
                    value={podForm.receiverName}
                    onChange={(e) => setPodForm({ ...podForm, receiverName: e.target.value })}
                  />
                </label>

                <label className={styles.valueField} style={{ maxWidth: 'none' }}>
                  <span>Relation to Passenger / Guest</span>
                  <select
                    style={{ width: '100%', minHeight: '45px', border: '1px solid #d9dde2', borderRadius: '11px', padding: '0 12px' }}
                    value={podForm.receiverRelation}
                    onChange={(e) => setPodForm({ ...podForm, receiverRelation: e.target.value })}
                  >
                    <option value="Self">Self (Passenger)</option>
                    <option value="Family Member">Family Member</option>
                    <option value="Hotel Front Desk">Hotel Concierge / Front Desk</option>
                    <option value="Airport Representative">Airport Representative</option>
                    <option value="Colleague">Colleague / Friend</option>
                  </select>
                </label>

                <label className={styles.valueField} style={{ maxWidth: 'none' }}>
                  <span>Delivery OTP Verification Code</span>
                  <input
                    type="text"
                    placeholder="Enter 4-digit Delivery OTP"
                    value={podForm.otp}
                    onChange={(e) => setPodForm({ ...podForm, otp: e.target.value })}
                  />
                </label>

                <div className={styles.compliance}>
                  <input
                    type="checkbox"
                    checked={podForm.sealIntact}
                    onChange={(e) => setPodForm({ ...podForm, sealIntact: e.target.checked })}
                  />
                  <span>
                    <strong>Tamper-proof Barcode Seal Verified Intact</strong>
                    <small>I confirm that the serialized tamper-proof security seal on all bags was intact prior to opening.</small>
                  </span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Handover Photos & Seal Proof</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div style={{ height: '75px', borderRadius: '8px', background: '#e2e8f0', display: 'grid', placeItems: 'center', fontSize: '10px', color: '#64748b' }}>
                      Delivery Photo
                    </div>
                    <div style={{ height: '75px', borderRadius: '8px', background: '#e2e8f0', display: 'grid', placeItems: 'center', fontSize: '10px', color: '#64748b' }}>
                      Seal Close-up
                    </div>
                    <div style={{ height: '75px', borderRadius: '8px', background: '#e2e8f0', display: 'grid', placeItems: 'center', fontSize: '10px', color: '#64748b' }}>
                      Doorstep / Desk
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.continueButton}
                  style={{ marginTop: '16px' }}
                  disabled={podSubmitting}
                  onClick={handleSubmitPod}
                >
                  {podSubmitting ? <LoaderCircle className={styles.spinner} /> : <FileCheck />}
                  <span>{podSubmitting ? 'Recording POD...' : 'Confirm & Sign Proof of Delivery'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.confirmationActions}>
          <button type="button" onClick={() => loadTracking(confirmedBooking.bookingNumber)}>
            Refresh Live GPS
          </button>
          <button type="button" onClick={() => { setConfirmedBooking(null); setCurrentStep(0); }}>
            Book Another Transfer
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // MAIN 12-STEP BOOKING FLOW
  // ==========================================
  return (
    <div className={styles.page}>
      {/* Sticky Header */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => {
            if (currentStep > 0) setCurrentStep((p) => p - 1)
            else navigateTo('/')
          }}
        >
          <ArrowLeft />
        </button>
        <div className={styles.brand} onClick={() => navigateTo('/')} style={{ cursor: 'pointer' }}>
          <strong>Delivez</strong>
          <span>LUGGAGE DELIVERY</span>
        </div>
        <button type="button" className={styles.help} onClick={() => navigateTo('/help')}>
          <HelpCircle />
          <span>Concierge Help</span>
        </button>
      </header>

      {/* 12-Step Progress Tracker */}
      <nav className={styles.progress}>
        <div style={{ gridTemplateColumns: `repeat(${STEPS.length}, 1fr)` }}>
          {STEPS.map((label, idx) => {
            const isDone = idx < currentStep
            const isCurr = idx === currentStep
            return (
              <button
                key={label}
                type="button"
                className={isDone ? styles.completeStep : isCurr ? styles.currentStep : ''}
                onClick={() => {
                  if (idx <= currentStep) setCurrentStep(idx)
                }}
              >
                <i>{isDone ? <Check size={14} /> : idx + 1}</i>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className={styles.layout}>
        <main className={styles.workflow}>
          {error && (
            <div className={styles.error}>
              <ShieldAlert />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 0: CHOOSE YOUR SERVICE (7 SERVICES from choose_your_service.dart) */}
          {currentStep === 0 && (
            <div className={styles.stack}>
              <div className={styles.titleRow}>
                <div>
                  <p>STEP 1 OF 12</p>
                  <h1>Choose Your Luggage Transfer Service</h1>
                  <span>Specialized airport, hotel, and multi-stop baggage courier solutions.</span>
                </div>
                <div className={styles.trustBadge}>
                  <ShieldCheck />
                  <span>
                    <strong>Tamper-Proof Guarantee</strong>
                    <small>Barcoded security seals included</small>
                  </span>
                </div>
              </div>

              <div className={styles.serviceCardGrid}>
                {options?.services?.map((srv) => {
                  const isSelected = srv.id === serviceId
                  const isExpanded = expandedServiceId === srv.id
                  return (
                    <div
                      key={srv.id}
                      className={`${styles.serviceCard} ${isSelected ? styles.serviceCardSelected : ''}`}
                      onClick={() => setServiceId(srv.id)}
                    >
                      <div>
                        <div className={styles.serviceCardHeader}>
                          <div className={styles.serviceIconWrap}>
                            {srv.id.includes('airport') ? (
                              <Plane size={24} />
                            ) : srv.id.includes('hotel') ? (
                              <Building2 size={24} />
                            ) : (
                              <Luggage size={24} />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <span className={styles.serviceTagPill}>{srv.tag}</span>
                            <h3 style={{ margin: '2px 0', fontSize: '17px', color: '#0f172a' }}>{srv.title}</h3>
                            <span className={styles.servicePrice}>{srv.startingPrice} <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>base fare</small></span>
                          </div>
                          {isSelected && (
                            <div className={styles.itemCheckBadge} style={{ background: '#fab800', color: '#0f172a' }}>
                              <Check size={14} />
                            </div>
                          )}
                        </div>

                        <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                          {srv.description}
                        </p>

                        {/* Expandable Highlights & Specs */}
                        <div className={styles.serviceHighlights}>
                          <strong>Highlights:</strong>
                          <ul>
                            {srv.highlights.slice(0, 3).map((hl, i) => (
                              <li key={i}>{hl}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          className={styles.detailsToggleBtn}
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedServiceId(isExpanded ? null : srv.id)
                          }}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          <span>{isExpanded ? 'Hide service specifications' : 'View service specifications'}</span>
                        </button>

                        {isExpanded && (
                          <div className={styles.serviceDetailsDrawer} onClick={(e) => e.stopPropagation()}>
                            <strong style={{ display: 'block', marginBottom: '6px' }}>Service Specifications:</strong>
                            <div className={styles.infoTableGrid}>
                              {srv.infoTable?.map((row, i) => (
                                <div key={i}>
                                  <dt>{row.key}</dt>
                                  <dd>{row.value}</dd>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 1: ROUTE SELECTION (rout_selection.dart) */}
          {currentStep === 1 && (
            <div className={styles.stack}>
              <div className={styles.titleRow}>
                <div>
                  <p>STEP 2 OF 12</p>
                  <h1>Select Route Configuration</h1>
                  <span>Choose one-way transfer, round trip, or multi-stop customized journey.</span>
                </div>
              </div>

              <div className={styles.cardList}>
                {options?.routes?.map((rt) => {
                  const isSelected = rt.id === routeType
                  return (
                    <div
                      key={rt.id}
                      className={`${styles.selectCard} ${isSelected ? styles.selectedCard : ''}`}
                      onClick={() => setRouteType(rt.id)}
                    >
                      <div className={styles.cardIcon}>
                        {rt.id === 'single_trip' ? <ArrowRight /> : rt.id === 'round_trip' ? <RotateCcw /> : <Layers />}
                      </div>
                      <div className={styles.cardCopy}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#d97706' }}>{rt.tag}</span>
                        <strong>{rt.title}</strong>
                        <small>{rt.subtitle}</small>
                      </div>
                      <i>{isSelected ? <Check size={14} /> : null}</i>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PICKUP DETAILS (pickup_detail.dart) */}
          {currentStep === 2 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 3 OF 12</p>
                  <h2>Pickup Point Details</h2>
                  <p>Where should our luggage handler collect your bags?</p>
                </div>
                <span className={styles.trustBadge}>
                  <MapPin /> Doorstep Verified
                </span>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.wideField}>
                  <span>Pickup Street Address / Hotel / Terminal</span>
                  <input
                    type="text"
                    value={pickupDetails.addressLine}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, addressLine: e.target.value })}
                  />
                </label>
                <label>
                  <span>Landmark / Gate / Building</span>
                  <input
                    type="text"
                    value={pickupDetails.landmark}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, landmark: e.target.value })}
                  />
                </label>
                <label>
                  <span>City</span>
                  <input
                    type="text"
                    value={pickupDetails.city}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, city: e.target.value })}
                  />
                </label>
                <label>
                  <span>State</span>
                  <input
                    type="text"
                    value={pickupDetails.state}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, state: e.target.value })}
                  />
                </label>
                <label>
                  <span>Pincode</span>
                  <input
                    type="text"
                    value={pickupDetails.pincode}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, pincode: e.target.value })}
                  />
                </label>
                <label>
                  <span>Contact Person Name</span>
                  <input
                    type="text"
                    value={pickupDetails.contactName}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, contactName: e.target.value })}
                  />
                </label>
                <label>
                  <span>Primary Mobile Number</span>
                  <input
                    type="tel"
                    value={pickupDetails.contactPhone}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, contactPhone: e.target.value })}
                  />
                </label>
                <label className={styles.wideField}>
                  <span>Special Pickup Instructions for Driver</span>
                  <textarea
                    rows={2}
                    value={pickupDetails.instructions}
                    onChange={(e) => setPickupDetails({ ...pickupDetails, instructions: e.target.value })}
                    style={{ width: '100%', borderRadius: '11px', border: '1px solid #d9dde2', padding: '10px' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: DELIVERY DETAILS (delivery_detail.dart) */}
          {currentStep === 3 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 4 OF 12</p>
                  <h2>Delivery Destination Details</h2>
                  <p>Where should our fleet safely deliver your luggage?</p>
                </div>
                <span className={styles.trustBadge}>
                  <ShieldCheck /> Destination Handover
                </span>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.wideField}>
                  <span>Delivery Address / Hotel / Departure Terminal</span>
                  <input
                    type="text"
                    value={deliveryDetails.addressLine}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, addressLine: e.target.value })}
                  />
                </label>
                <label>
                  <span>Landmark / Departure Pillar</span>
                  <input
                    type="text"
                    value={deliveryDetails.landmark}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, landmark: e.target.value })}
                  />
                </label>
                <label>
                  <span>City</span>
                  <input
                    type="text"
                    value={deliveryDetails.city}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                  />
                </label>
                <label>
                  <span>State</span>
                  <input
                    type="text"
                    value={deliveryDetails.state}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })}
                  />
                </label>
                <label>
                  <span>Pincode</span>
                  <input
                    type="text"
                    value={deliveryDetails.pincode}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, pincode: e.target.value })}
                  />
                </label>
                <label>
                  <span>Recipient Name</span>
                  <input
                    type="text"
                    value={deliveryDetails.contactName}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, contactName: e.target.value })}
                  />
                </label>
                <label>
                  <span>Recipient Phone Number</span>
                  <input
                    type="tel"
                    value={deliveryDetails.contactPhone}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, contactPhone: e.target.value })}
                  />
                </label>
                <label className={styles.wideField}>
                  <span>Handover Instructions</span>
                  <textarea
                    rows={2}
                    value={deliveryDetails.instructions}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, instructions: e.target.value })}
                    style={{ width: '100%', borderRadius: '11px', border: '1px solid #d9dde2', padding: '10px' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: TRANSIT HUB DETAILS (flight_travel_detail.dart / hotel_detail.dart) */}
          {currentStep === 4 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 5 OF 12</p>
                  <h2>Transit Hub Information</h2>
                  <p>Flight, Hotel, and Gate coordination specifications</p>
                </div>
              </div>

              {/* Flight Details if airport service */}
              {isAirportService && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#0f172a', marginBottom: '14px' }}>
                    <Plane size={18} color="#d97706" /> Flight & Travel Details
                  </h3>
                  <div className={styles.fieldGrid}>
                    <label>
                      <span>Airport Name</span>
                      <input
                        type="text"
                        value={flightDetails.airportName}
                        onChange={(e) => setFlightDetails({ ...flightDetails, airportName: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Terminal (T1, T2, T3)</span>
                      <input
                        type="text"
                        value={flightDetails.terminal}
                        onChange={(e) => setFlightDetails({ ...flightDetails, terminal: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Airline</span>
                      <input
                        type="text"
                        value={flightDetails.airline}
                        onChange={(e) => setFlightDetails({ ...flightDetails, airline: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Flight Number</span>
                      <input
                        type="text"
                        value={flightDetails.flightNumber}
                        onChange={(e) => setFlightDetails({ ...flightDetails, flightNumber: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Flight Date & Departure/Arrival Time</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                          type="date"
                          value={flightDetails.flightDate}
                          onChange={(e) => setFlightDetails({ ...flightDetails, flightDate: e.target.value })}
                        />
                        <input
                          type="time"
                          value={flightDetails.flightTime}
                          onChange={(e) => setFlightDetails({ ...flightDetails, flightTime: e.target.value })}
                        />
                      </div>
                    </label>
                    <label>
                      <span>PNR / Booking Reference</span>
                      <input
                        type="text"
                        value={flightDetails.pnr}
                        onChange={(e) => setFlightDetails({ ...flightDetails, pnr: e.target.value })}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Hotel Details if hotel service */}
              {isHotelService && (
                <div style={{ marginTop: isAirportService ? '20px' : '0', paddingTop: isAirportService ? '20px' : '0', borderTop: isAirportService ? '1px dashed #cbd5e1' : 'none' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#0f172a', marginBottom: '14px' }}>
                    <Building2 size={18} color="#d97706" /> Hotel Reservation & Concierge Details
                  </h3>
                  <div className={styles.fieldGrid}>
                    <label>
                      <span>Hotel Name</span>
                      <input
                        type="text"
                        value={hotelDetails.hotelName}
                        onChange={(e) => setHotelDetails({ ...hotelDetails, hotelName: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Room Number / Reservation Code</span>
                      <input
                        type="text"
                        value={hotelDetails.roomNumber}
                        onChange={(e) => setHotelDetails({ ...hotelDetails, roomNumber: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Guest Name on Reservation</span>
                      <input
                        type="text"
                        value={hotelDetails.guestName}
                        onChange={(e) => setHotelDetails({ ...hotelDetails, guestName: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Hotel Reception Desk Phone</span>
                      <input
                        type="text"
                        value={hotelDetails.frontDeskContact}
                        onChange={(e) => setHotelDetails({ ...hotelDetails, frontDeskContact: e.target.value })}
                      />
                    </label>
                    <label className={styles.wideField}>
                      <div className={styles.toggleRow} style={{ border: 0, padding: 0 }}>
                        <span>
                          <strong>Authorize Hotel Front Desk Coordination</strong>
                          <small>Allows Delivez concierge to collect/drop luggage directly with bell captain.</small>
                        </span>
                        <input
                          type="checkbox"
                          checked={hotelDetails.allowStaffCoordination}
                          onChange={(e) => setHotelDetails({ ...hotelDetails, allowStaffCoordination: e.target.checked })}
                        />
                        <i />
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: LUGGAGE & BAGS (luggage_detail.dart) */}
          {currentStep === 5 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 6 OF 12</p>
                  <h2>Luggage Specification & Bag Count</h2>
                  <p>Specify sizes, weight, and bag categories for correct vehicle allocation</p>
                </div>
                <button type="button" onClick={addBag}>
                  <Plus size={14} /> Add Another Bag
                </button>
              </div>

              <div className={styles.stack}>
                {luggageItems.map((bag, idx) => (
                  <div key={bag.id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', background: '#fafbfc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>Luggage #{idx + 1}</strong>
                      {luggageItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBag(idx)}
                          style={{ border: 0, background: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className={styles.fieldGrid}>
                      <label>
                        <span>Luggage Type</span>
                        <select
                          value={bag.type}
                          onChange={(e) => updateBag(idx, 'type', e.target.value)}
                          style={{ width: '100%', minHeight: '45px', border: '1px solid #d9dde2', borderRadius: '11px', padding: '0 12px' }}
                        >
                          {options?.types?.map((t) => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span>Baggage Size</span>
                        <select
                          value={bag.size}
                          onChange={(e) => updateBag(idx, 'size', e.target.value)}
                          style={{ width: '100%', minHeight: '45px', border: '1px solid #d9dde2', borderRadius: '11px', padding: '0 12px' }}
                        >
                          {options?.sizes?.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title} ({s.description}) {s.fee > 0 ? `(+₹${s.fee})` : ''}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span>Weight (approx. kg)</span>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={bag.weightKg}
                          onChange={(e) => updateBag(idx, 'weightKg', Number(e.target.value))}
                        />
                      </label>

                      <label>
                        <span>Color / Identifiable Features</span>
                        <input
                          type="text"
                          placeholder="e.g. Navy blue with yellow ribbon"
                          value={bag.description}
                          onChange={(e) => updateBag(idx, 'description', e.target.value)}
                        />
                      </label>

                      <label className={styles.wideField}>
                        <div className={styles.toggleRow} style={{ border: 0, padding: 0 }}>
                          <span>
                            <strong>Fragile / Delicate Items Inside</strong>
                            <small>Requires special upright handling and additional shock-absorbent cushioning.</small>
                          </span>
                          <input
                            type="checkbox"
                            checked={bag.isFragile}
                            onChange={(e) => updateBag(idx, 'isFragile', e.target.checked)}
                          />
                          <i />
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: LUGGAGE PROTECTION (luggage_protection.dart) */}
          {currentStep === 6 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 7 OF 12</p>
                  <h2>Luggage Protection Options (5 Tiers)</h2>
                  <p>Security seals, lock straps, waterproof wrap, and smart RFID tracking</p>
                </div>
              </div>

              <div className={styles.gridPills}>
                {options?.protections?.map((prot) => {
                  const isChecked = selectedProtections.includes(prot.id)
                  return (
                    <div
                      key={prot.id}
                      className={`${styles.itemSelectionCard} ${isChecked ? styles.itemSelectionCardActive : ''}`}
                      onClick={() => toggleProtection(prot.id)}
                    >
                      <div style={{ paddingRight: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{prot.title}</strong>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a' }}>+₹{prot.price}</span>
                        </div>
                        <small style={{ display: 'block', color: '#64748b', fontSize: '11px', margin: '4px 0' }}>
                          {prot.description}
                        </small>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {prot.features?.map((f, i) => (
                            <span key={i} style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.itemCheckBadge}>
                        {isChecked ? <Check size={14} /> : <Plus size={14} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 7: 16 ADD-ONS (add_ons.dart) */}
          {currentStep === 7 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 8 OF 12</p>
                  <h2>Add-on Services (16 Options)</h2>
                  <p>Customize security, priority dispatch, photos, and insurance</p>
                </div>
              </div>

              <div className={styles.gridPills}>
                {options?.addOns?.map((addon) => {
                  const isChecked = selectedAddOns.includes(addon.id)
                  return (
                    <div
                      key={addon.id}
                      className={`${styles.itemSelectionCard} ${isChecked ? styles.itemSelectionCardActive : ''}`}
                      onClick={() => toggleAddOn(addon.id)}
                    >
                      <div style={{ paddingRight: '10px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                          {addon.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '13px', color: '#0f172a' }}>{addon.title}</strong>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a' }}>+₹{addon.price}</span>
                        </div>
                        <small style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                          {addon.description}
                        </small>
                      </div>
                      <div className={styles.itemCheckBadge}>
                        {isChecked ? <Check size={14} /> : <Plus size={14} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 8: AIRPORT ASSISTANCE (airport_assitance.dart) */}
          {currentStep === 8 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 9 OF 12</p>
                  <h2>Airport Passenger Assistance (5 Plans)</h2>
                  <p>Terminal Meet & Assist, Electric Buggy, and Porter services</p>
                </div>
              </div>

              <div className={styles.gridPills}>
                {options?.airportAssistance?.map((assist) => {
                  const isChecked = selectedAirportAssistance.includes(assist.id)
                  return (
                    <div
                      key={assist.id}
                      className={`${styles.itemSelectionCard} ${isChecked ? styles.itemSelectionCardActive : ''}`}
                      onClick={() => toggleAssistance(assist.id)}
                    >
                      <div style={{ paddingRight: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{assist.title}</strong>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a' }}>+₹{assist.price}</span>
                        </div>
                        <small style={{ display: 'block', color: '#64748b', fontSize: '11px', margin: '4px 0' }}>
                          {assist.description}
                        </small>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {assist.features?.map((f, i) => (
                            <span key={i} style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                              ✓ {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.itemCheckBadge}>
                        {isChecked ? <Check size={14} /> : <Plus size={14} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 9: SCHEDULE & SPEED (schedule.dart) */}
          {currentStep === 9 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 10 OF 12</p>
                  <h2>Pickup & Delivery Schedule</h2>
                  <p>Choose your timing slot and delivery speed preference</p>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <label>
                  <span>Pickup Date</span>
                  <input
                    type="date"
                    value={schedule.pickupDate}
                    onChange={(e) => setSchedule({ ...schedule, pickupDate: e.target.value })}
                  />
                </label>
                <label>
                  <span>Pickup Time Slot</span>
                  <select
                    value={schedule.pickupTimeSlot}
                    onChange={(e) => setSchedule({ ...schedule, pickupTimeSlot: e.target.value })}
                    style={{ width: '100%', minHeight: '45px', border: '1px solid #d9dde2', borderRadius: '11px', padding: '0 12px' }}
                  >
                    <option>08:00 AM - 10:00 AM</option>
                    <option>10:00 AM - 12:00 PM</option>
                    <option>12:00 PM - 02:00 PM</option>
                    <option>02:00 PM - 04:00 PM</option>
                    <option>04:00 PM - 06:00 PM</option>
                    <option>06:00 PM - 08:00 PM</option>
                  </select>
                </label>
                <label>
                  <span>Delivery Date</span>
                  <input
                    type="date"
                    value={schedule.deliveryDate}
                    onChange={(e) => setSchedule({ ...schedule, deliveryDate: e.target.value })}
                  />
                </label>
                <label>
                  <span>Delivery Time Slot</span>
                  <select
                    value={schedule.deliveryTimeSlot}
                    onChange={(e) => setSchedule({ ...schedule, deliveryTimeSlot: e.target.value })}
                    style={{ width: '100%', minHeight: '45px', border: '1px solid #d9dde2', borderRadius: '11px', padding: '0 12px' }}
                  >
                    <option>Within 3-4 hours of pickup</option>
                    <option>04:00 PM - 06:00 PM</option>
                    <option>06:00 PM - 08:00 PM</option>
                    <option>08:00 PM - 10:00 PM</option>
                  </select>
                </label>

                <div className={styles.wideField} style={{ marginTop: '10px' }}>
                  <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Delivery Speed Option</strong>
                  <div className={styles.speedGrid}>
                    {[
                      { id: 'STANDARD', title: 'Standard', desc: 'Included in base fare', surge: 0 },
                      { id: 'EXPRESS', title: 'Express (+₹99)', desc: 'Priority transit lane', surge: 99 },
                      { id: 'PRECISE_TIME', title: 'Exact Time (+₹149)', desc: 'Precise 15-min window', surge: 149 },
                    ].map((sp) => (
                      <div
                        key={sp.id}
                        className={`${styles.selectCard} ${schedule.deliverySpeed === sp.id ? styles.selectedCard : ''}`}
                        onClick={() => setSchedule({ ...schedule, deliverySpeed: sp.id })}
                      >
                        <div className={styles.cardIcon}>
                          <Clock />
                        </div>
                        <div className={styles.cardCopy}>
                          <strong>{sp.title}</strong>
                          <small>{sp.desc}</small>
                        </div>
                        <i>{schedule.deliverySpeed === sp.id ? <Check size={14} /> : null}</i>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.wideField}>
                  <div className={styles.toggleRow}>
                    <span>
                      <strong>Flight-Based Urgency Coordination</strong>
                      <small>Our operations desk monitors flight delays and automatically adjusts terminal delivery time.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={schedule.flightBasedUrgency}
                      onChange={(e) => setSchedule({ ...schedule, flightBasedUrgency: e.target.checked })}
                    />
                    <i />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: REVIEW & GST (review_summary.dart) */}
          {currentStep === 10 && (
            <div className={styles.reviewLayout}>
              <div className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 11 OF 12</p>
                    <h2>Review Luggage Transfer Summary</h2>
                    <p>Verify all details and view official price breakdown</p>
                  </div>
                </div>

                <div className={styles.reviewCards}>
                  <section>
                    <div>
                      <span><Luggage /></span>
                      <h2>Service & Route</h2>
                    </div>
                    <p>
                      <strong>{currentService?.title}</strong>
                      <span>Route: {routeType === 'single_trip' ? 'Single Trip (1-way)' : routeType === 'round_trip' ? 'Round Trip (Return included)' : 'Multi-stop Route'}</span>
                      <small>{luggageItems.length} Luggage Bag(s) registered</small>
                    </p>
                  </section>

                  <section>
                    <div>
                      <span><MapPin /></span>
                      <h2>Locations</h2>
                    </div>
                    <p>
                      <strong>From: {pickupDetails.addressLine}</strong>
                      <span>To: {deliveryDetails.addressLine}</span>
                      <small>{pickupDetails.city} • Approx 22 km transit</small>
                    </p>
                  </section>
                </div>

                {/* GST Invoice Section */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                  <div className={styles.toggleRow} style={{ border: 0 }}>
                    <span>
                      <strong>Request GST Tax Invoice</strong>
                      <small>Enter your corporate business GSTIN to claim 18% input tax credit.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={gstInvoice.requestInvoice}
                      onChange={(e) => setGstInvoice({ ...gstInvoice, requestInvoice: e.target.checked })}
                    />
                    <i />
                  </div>

                  {gstInvoice.requestInvoice && (
                    <div className={styles.fieldGrid} style={{ marginTop: '14px' }}>
                      <label>
                        <span>Business Legal Name</span>
                        <input
                          type="text"
                          placeholder="e.g. Acme Corporation Pvt Ltd"
                          value={gstInvoice.businessName}
                          onChange={(e) => setGstInvoice({ ...gstInvoice, businessName: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>GSTIN (15-digit)</span>
                        <input
                          type="text"
                          placeholder="07AAAAA0000A1Z5"
                          value={gstInvoice.gstin}
                          onChange={(e) => setGstInvoice({ ...gstInvoice, gstin: e.target.value })}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Promo / Coupon Code Section */}
                <div className={styles.fareCard} style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Tag size={18} style={{ color: '#6366f1' }} />
                    <h3 style={{ margin: 0, fontSize: '15px' }}>Apply Promo / Coupon Code</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. DELIVEZ10, WELCOME50, AIRPORT100"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        fontWeight: '600',
                      }}
                      disabled={appliedCoupon !== null}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        style={{
                          padding: '0 16px',
                          borderRadius: '8px',
                          border: '1px solid #ef4444',
                          background: '#fef2f2',
                          color: '#ef4444',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponCode.trim()}
                        style={{
                          padding: '0 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#6366f1',
                          color: '#fff',
                          fontWeight: '600',
                          cursor: couponLoading ? 'wait' : 'pointer',
                        }}
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    )}
                  </div>
                  {couponMessage && (
                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '12px',
                        color: couponMessage.type === 'success' ? '#10b981' : '#ef4444',
                        fontWeight: '500',
                      }}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Suggested:</span>
                    {['DELIVEZ10', 'WELCOME50', 'AIRPORT100'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleApplyCoupon(code)}
                        style={{
                          border: '1px dashed #cbd5e1',
                          background: 'transparent',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className={styles.fareCard} style={{ marginTop: '20px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '16px' }}>Detailed Fare Breakdown</h3>
                  <dl className={styles.fareList}>
                    <div>
                      <dt>Base Luggage Fare ({currentService?.title})</dt>
                      <dd>₹{quote?.baseFare || currentService?.baseFare || 499}</dd>
                    </div>
                    {quote?.distanceFare > 0 && (
                      <div>
                        <dt>Transit Distance Surcharge ({quote.distanceKm} km)</dt>
                        <dd>+₹{quote.distanceFare}</dd>
                      </div>
                    )}
                    {quote?.bagCountFare > 0 && (
                      <div>
                        <dt>Additional Bags ({quote.bagCount - 1} extra)</dt>
                        <dd>+₹{quote.bagCountFare}</dd>
                      </div>
                    )}
                    {quote?.bagSizeSurge > 0 && (
                      <div>
                        <dt>Oversized / Check-in Dimensions Surcharge</dt>
                        <dd>+₹{quote.bagSizeSurge}</dd>
                      </div>
                    )}
                    {quote?.weightSurge > 0 && (
                      <div>
                        <dt>Excess Weight Surcharge ({quote.weightKg} kg)</dt>
                        <dd>+₹{quote.weightSurge}</dd>
                      </div>
                    )}
                    {quote?.airportHandlingFee > 0 && (
                      <div>
                        <dt>Airport Terminal Coordination Fee</dt>
                        <dd>+₹{quote.airportHandlingFee}</dd>
                      </div>
                    )}
                    {quote?.hotelHandlingFee > 0 && (
                      <div>
                        <dt>Hotel Concierge Handover Fee</dt>
                        <dd>+₹{quote.hotelHandlingFee}</dd>
                      </div>
                    )}
                    {quote?.protectionsFare > 0 && (
                      <div>
                        <dt>Luggage Protections ({quote.protectionsList?.length || 'selected'} items)</dt>
                        <dd>+₹{quote.protectionsFare}</dd>
                      </div>
                    )}
                    {quote?.addOnsFare > 0 && (
                      <div>
                        <dt>Add-ons ({quote.addOnsList?.length || 'selected'} items)</dt>
                        <dd>+₹{quote.addOnsFare}</dd>
                      </div>
                    )}
                    {quote?.assistanceFare > 0 && (
                      <div>
                        <dt>Airport Assistance ({quote.assistanceList?.length || 'selected'} services)</dt>
                        <dd>+₹{quote.assistanceFare}</dd>
                      </div>
                    )}
                    {quote?.deliverySpeedFare > 0 && (
                      <div>
                        <dt>Delivery Speed Surcharge</dt>
                        <dd>+₹{quote.deliverySpeedFare}</dd>
                      </div>
                    )}
                    {quote?.discountAmount > 0 && (
                      <div style={{ color: '#10b981' }}>
                        <dt>Promo Discount ({appliedCoupon?.code || quote?.discount?.coupon_code})</dt>
                        <dd>-₹{quote.discountAmount}</dd>
                      </div>
                    )}
                    <div>
                      <dt>GST (18% Input Tax)</dt>
                      <dd>+₹{quote?.gstAmount || 90}</dd>
                    </div>
                    <div className={styles.totalRow}>
                      <dt>Total Amount Payable</dt>
                      <dd>₹{quote?.totalAmount || 589}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* STEP 11: PAYMENT (payment_method.dart) */}
          {currentStep === 11 && (
            <div className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <p style={{ color: '#d97706', fontSize: '11px', fontWeight: 700, margin: '0 0 4px' }}>STEP 12 OF 12</p>
                  <h2>Choose Payment Method</h2>
                  <p>100% secure payment gateway with instant booking confirmation</p>
                </div>
                <span className={styles.trustBadge}>
                  <Lock /> 256-Bit SSL Encrypted
                </span>
              </div>

              <div className={styles.stack}>
                {[
                  { id: 'wallet', title: 'Delivez Wallet', desc: 'Instant checkout with wallet balance', icon: <Wallet /> },
                  { id: 'upi', title: 'UPI (GPay / PhonePe / Paytm / QR)', desc: 'Instant UPI app transfer or QR code scan', icon: <QrCode /> },
                  { id: 'card', title: 'Credit / Debit Cards', desc: 'Visa, MasterCard, RuPay, Diners', icon: <CreditCard /> },
                  { id: 'netbanking', title: 'Net Banking', desc: 'All Indian major banks supported', icon: <Building2 /> },
                  { id: 'cash_on_delivery', title: 'Pay on Handover / Delivery', desc: 'Pay via cash or UPI to executive upon delivery', icon: <PackageCheck /> },
                ].map((pm) => (
                  <div
                    key={pm.id}
                    className={`${styles.selectCard} ${paymentMethod === pm.id ? styles.selectedCard : ''}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <div className={styles.cardIcon}>{pm.icon}</div>
                    <div className={styles.cardCopy}>
                      <strong>{pm.title}</strong>
                      <small>{pm.desc}</small>
                    </div>
                    <i>{paymentMethod === pm.id ? <Check size={14} /> : null}</i>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar Order Summary */}
        <aside className={styles.summary}>
          <p>TRANSFER SUMMARY</p>
          <h2>
            <Luggage />
            <span>{currentService?.title || 'Luggage Delivery'}</span>
          </h2>

          <dl>
            <div>
              <dt>Service Type</dt>
              <dd>{currentService?.tag || 'Doorstep Pickup'}</dd>
            </div>
            <div>
              <dt>Route Plan</dt>
              <dd>{routeType.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt>Baggage Count</dt>
              <dd>{luggageItems.length} Bag(s)</dd>
            </div>
            <div>
              <dt>Security Tags</dt>
              <dd>{selectedProtections.length} Protection(s)</dd>
            </div>
          </dl>

          <div className={styles.summaryTrust}>
            <ShieldCheck />
            <div>
              <strong>Delivez SafeBaggage Guarantee</strong>
              <small>Tamper-evident serialized seal & ₹25,000 transit cover.</small>
            </div>
          </div>

          <div className={styles.summaryTotal}>
            <span>Estimated Total:</span>
            <strong>{quoteLoading ? '...' : `₹${quote?.totalAmount || 499}`}</strong>
          </div>
        </aside>
      </div>

      {/* Persistent Bottom Action Bar */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerStep}>
            <small>STEP {currentStep + 1} OF 12</small>
            <strong>{STEPS[currentStep]}</strong>
          </div>

          {currentStep > 0 && (
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setCurrentStep((p) => p - 1)}
            >
              <ArrowLeft />
              <span>Back</span>
            </button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              className={styles.continueButton}
              onClick={() => setCurrentStep((p) => p + 1)}
            >
              <span>Continue</span>
              <ArrowRight />
            </button>
          ) : (
            <button
              type="button"
              className={styles.continueButton}
              disabled={submitting}
              onClick={handleConfirmAndPay}
              style={{ background: '#e00014', color: '#ffffff' }}
            >
              {submitting ? (
                <LoaderCircle className={styles.spinner} />
              ) : (
                <Lock size={18} />
              )}
              <span>{submitting ? 'Confirming Transfer...' : `Pay ₹${quote?.totalAmount || 499} Securely`}</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
