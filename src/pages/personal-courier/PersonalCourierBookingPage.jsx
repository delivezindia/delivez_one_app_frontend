import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Plane,
  Building,
  Home,
  Check,
  Clock,
  MapPin,
  Luggage,
  ShieldCheck,
  Lock,
  Sparkles,
  Phone,
  User,
  Plus,
  Minus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Wallet,
  Calendar,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  createCourierBooking,
  fetchCourierQuote,
  fetchSavedAddresses,
} from '@/features/personal-courier/services/personalCourierService.js'
import CourierServiceSelectView, { COURIER_SERVICES } from './components/CourierServiceSelectView.jsx'
import CourierTrackingView from './components/CourierTrackingView.jsx'
import CourierProofOfDeliveryView from './components/CourierProofOfDeliveryView.jsx'
import styles from './PersonalCourierBookingPage.module.css'

export default function PersonalCourierBookingPage() {
  // Step index: 0 = Route Select, 1 = Pickup, 2 = Delivery, 3 = Luggage, 4 = Addons, 5 = Schedule, 6 = Review, 7 = Payment, 8 = Confirmed
  const [currentStep, setCurrentStep] = useState(1)
  const [serviceId, setServiceId] = useState('AIRPORT_TO_HOTEL')
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [trackingViewBookingId, setTrackingViewBookingId] = useState(null)
  const [podViewBookingId, setPodViewBookingId] = useState(null)

  // Step 1: Pickup Details (Screens 09 & 10)
  const [pickupOption, setPickupOption] = useState('luggage_belt') // 'luggage_belt' | 'doorstep'
  const [pickup, setPickup] = useState({
    terminal: 'Terminal 3',
    flightNumber: 'AI 102',
    pnr: 'AB12CD',
    luggageBelt: '04',
    contactName: 'Rahul Sharma',
    countryCode: '+91',
    phoneNumber: '9876543210',
    alternatePhone: '',
    addressLine1: 'Indira Gandhi International Airport, Terminal 3',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110037',
    flightArrivalDate: '10 May 2025',
    timeSlot: '09:00 AM - 11:00 AM',
  })

  // Step 2: Delivery Details (Screens 11 & 12)
  const [deliveryOption, setDeliveryOption] = useState('hotel_reception') // 'hotel_reception' | 'doorstep' | 'airport'
  const [delivery, setDelivery] = useState({
    hotelName: 'Taj City Centre',
    roomNumber: '402',
    guestName: 'Rahul Sharma',
    contactName: 'Rahul Sharma',
    countryCode: '+91',
    phoneNumber: '9876543210',
    alternatePhone: '',
    addressLine1: 'Taj City Centre, Sector 44',
    city: 'Gurugram',
    state: 'Haryana',
    postalCode: '122004',
    specialInstructions: 'Please leave with Hotel Front Desk reception if guest has not checked in.',
    leaveAtReception: true,
  })

  // Step 3: Luggage Details (Screens 13 & 14)
  const [luggageList, setLuggageList] = useState([
    { id: 1, type: 'Check-in Bag', size: 'Large', weight: 15, tag: 'AI-48291' },
    { id: 2, type: 'Cabin Bag', size: 'Medium', weight: 13, tag: 'AI-48292' },
  ])
  const [fragile, setFragile] = useState(true)
  const [keepDry, setKeepDry] = useState(true)
  const [uprightOnly, setUprightOnly] = useState(false)

  // Step 4: Add-on Services (Screens 15 - 20)
  const [selectedAddons, setSelectedAddons] = useState([
    'AIRPORT_ASSIST',
    'SEAL_WRAP',
    'SANITISED_VAN',
  ])
  const [selectedProtection, setSelectedProtection] = useState([
    'THEFT_COVER',
    'DAMAGE_COVER',
  ])
  const [selectedAirportAssist, setSelectedAirportAssist] = useState([
    'BELT_PICKUP',
    'PORTER_HELP',
  ])

  // Step 5: Schedule (Screens 21 & 22)
  const [schedule, setSchedule] = useState({
    pickupDate: 'Today', // 'Today' | 'Tomorrow' | 'Custom'
    pickupSlot: '10:00 AM - 12:00 PM',
    deliverySpeed: 'STANDARD', // 'STANDARD' | 'FAST_TRACK' | 'CRITICAL_FLIGHT_RUSH'
    flightSyncUrgency: true,
    estimatedDelivery: '12 May 2025 by 06:00 PM',
  })

  // Step 7: Payment (Screens 25 & 26)
  const [paymentMethod, setPaymentMethod] = useState('UPI') // 'UPI' | 'CARD' | 'WALLET' | 'NET_BANKING' | 'PAY_ON_DELIVERY'
  const [promoCode, setPromoCode] = useState('DELIVEZ10')
  const [promoApplied, setPromoApplied] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [copiedId, setCopiedId] = useState(false)

  const activeService = useMemo(() => {
    return COURIER_SERVICES.find((s) => s.id === serviceId) || COURIER_SERVICES[3]
  }, [serviceId])

  // Luggage helpers
  const totalBags = luggageList.length
  const totalWeightKg = luggageList.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)

  const addLuggagePiece = () => {
    if (luggageList.length >= 6) return
    const newId = Date.now()
    setLuggageList([
      ...luggageList,
      { id: newId, type: 'Cabin Bag', size: 'Medium', weight: 10, tag: '' },
    ])
  }

  const removeLuggagePiece = (id) => {
    if (luggageList.length <= 1) return
    setLuggageList(luggageList.filter((item) => item.id !== id))
  }

  const updateLuggagePiece = (id, field, val) => {
    setLuggageList(
      luggageList.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    )
  }

  // Add-on toggle helpers
  const toggleAddon = (key, list, setList) => {
    if (list.includes(key)) {
      setList(list.filter((k) => k !== key))
    } else {
      setList([...list, key])
    }
  }

  // Fare calculations matching Screen 26
  const fareBreakdown = useMemo(() => {
    const baseFare = isRoundTrip ? 2160 : 1200
    const distanceFee = 360
    const luggageFee = totalBags > 1 ? (totalBags - 1) * 160 : 0
    const airportFee = 150

    // Addons fee
    const addonCount = selectedAddons.length + selectedProtection.length + selectedAirportAssist.length
    const addonsFee = Math.max(150, addonCount * 50)

    // Delivery speed fee
    let speedFee = 100
    if (schedule.deliverySpeed === 'FAST_TRACK') speedFee = 200
    if (schedule.deliverySpeed === 'CRITICAL_FLIGHT_RUSH') speedFee = 350

    const subtotal = baseFare + distanceFee + luggageFee + airportFee + addonsFee + speedFee
    const gst = Math.round(subtotal * 0.18 * 100) / 100
    const discount = promoApplied ? 235 : 0
    const total = Math.max(0, Math.round((subtotal + gst - discount) * 100) / 100)

    return {
      baseFare,
      distanceFee,
      luggageFee,
      airportFee,
      addonsFee,
      speedFee,
      gst,
      discount,
      total,
    }
  }, [isRoundTrip, totalBags, selectedAddons, selectedProtection, selectedAirportAssist, schedule.deliverySpeed, promoApplied])

  // Handle final booking creation
  const handleConfirmAndPay = async () => {
    setSubmitting(true)
    try {
      const payload = {
        serviceType: serviceId,
        selectedServiceId: serviceId,
        isRoundTrip,
        pickup: {
          label: `${pickup.terminal || 'Airport'} Luggage Belt ${pickup.luggageBelt || '04'}`,
          contactName: pickup.contactName,
          countryCode: pickup.countryCode || '+91',
          phoneNumber: pickup.phoneNumber,
          alternatePhone: pickup.alternatePhone || null,
          addressLine1: pickup.addressLine1,
          city: pickup.city,
          state: pickup.state,
          postalCode: pickup.postalCode,
          country: 'India',
        },
        dropoff: {
          label: `${delivery.hotelName || 'Hotel'} Reception`,
          contactName: delivery.contactName,
          countryCode: delivery.countryCode || '+91',
          phoneNumber: delivery.phoneNumber,
          alternatePhone: delivery.alternatePhone || null,
          addressLine1: delivery.addressLine1,
          city: delivery.city,
          state: delivery.state,
          postalCode: delivery.postalCode,
          country: 'India',
        },
        package: {
          luggageType: luggageList[0]?.type || 'Check-in Bag',
          luggageSize: luggageList[0]?.size || 'Large',
          pieceCount: totalBags,
          totalWeightKg: totalWeightKg,
          actualWeightKg: totalWeightKg,
          chargeableWeightKg: totalWeightKg,
          lengthCm: 55,
          widthCm: 35,
          heightCm: 25,
          declaredValue: 25000,
          fragile,
          keepDry,
          temperatureSensitive: uprightOnly,
        },
        addons: [...selectedAddons, ...selectedProtection, ...selectedAirportAssist],
        schedule: {
          pickupDate: schedule.pickupDate,
          pickupSlot: schedule.pickupSlot,
          deliverySpeed: schedule.deliverySpeed,
          estimatedDelivery: schedule.estimatedDelivery,
          flightSyncUrgency: schedule.flightSyncUrgency,
        },
        deliverySpeed: schedule.deliverySpeed,
        paymentMethod: paymentMethod === 'PAY_ON_DELIVERY' ? 'PAY_ON_DELIVERY' : 'ONLINE',
        promoCode: promoApplied ? promoCode : '',
        pickupDetails: pickup,
        deliveryDetails: delivery,
        luggage: luggageList,
        totalBags,
        totalWeightKg,
        luggageProtection: selectedProtection,
        airportAssistance: selectedAirportAssist,
      }

      const booking = await createCourierBooking(payload)
      setConfirmedBooking(booking)
      setCurrentStep(8) // Booking confirmed
    } catch (err) {
      alert('Error booking courier: ' + (err.message || 'Server error'))
    } finally {
      setSubmitting(false)
    }
  }

  // Tracking View trigger
  if (trackingViewBookingId) {
    return (
      <CourierTrackingView
        bookingId={trackingViewBookingId}
        initialBooking={confirmedBooking}
        onBack={() => setTrackingViewBookingId(null)}
      />
    )
  }

  // POD View trigger
  if (podViewBookingId) {
    return (
      <CourierProofOfDeliveryView
        bookingId={podViewBookingId}
        onBack={() => setPodViewBookingId(null)}
      />
    )
  }

  // Step 0: Route Select View
  if (currentStep === 0) {
    return (
      <CourierServiceSelectView
        selectedServiceId={serviceId}
        onSelectService={(id, roundTrip) => {
          setServiceId(id)
          setIsRoundTrip(roundTrip)
        }}
        onContinue={({ serviceId: id, isRoundTrip: rt }) => {
          setServiceId(id)
          setIsRoundTrip(rt)
          setCurrentStep(1)
        }}
        onBack={() => navigateTo('/')}
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Top Header with Stepper Progress */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <button
            className={styles.backBtn}
            onClick={() => {
              if (currentStep > 1 && currentStep < 8) {
                setCurrentStep(currentStep - 1)
              } else {
                setCurrentStep(0)
              }
            }}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.headerTitleCol}>
            <div className={styles.routeHeaderBadge}>
              {activeService.title} {isRoundTrip ? '(Round Trip)' : ''}
            </div>
            <h1 className={styles.headerTitle}>
              {currentStep === 1 && 'Step 1: Pickup Details'}
              {currentStep === 2 && 'Step 2: Delivery Details'}
              {currentStep === 3 && 'Step 3: Luggage Details'}
              {currentStep === 4 && 'Step 4: Add-on Services'}
              {currentStep === 5 && 'Step 5: Schedule Pickup & Delivery'}
              {currentStep === 6 && 'Step 6: Review Booking Summary'}
              {currentStep === 7 && 'Payment & Fare Summary'}
              {currentStep === 8 && 'Booking Confirmed'}
            </h1>
          </div>
          <div className={styles.stepCounterBadge}>
            {currentStep < 7 ? `Step ${currentStep} of 6` : currentStep === 7 ? 'Payment' : 'Done'}
          </div>
        </div>

        {/* Progress Bar */}
        {currentStep <= 6 && (
          <div className={styles.progressBarWrap}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${(currentStep / 6) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      <div className={styles.mainContent}>
        {/* ================= STEP 1: PICKUP DETAILS (Screens 09 & 10) ================= */}
        {currentStep === 1 && (
          <div className={styles.stepCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Where should we pick up your luggage?</h2>
              <p className={styles.sectionSub}>Airport arrival luggage belt or terminal collection</p>
            </div>

            {/* Handover Tabs */}
            <div className={styles.radioTabs}>
              <button
                type="button"
                className={`${styles.radioTab} ${pickupOption === 'luggage_belt' ? styles.radioTabActive : ''}`}
                onClick={() => setPickupOption('luggage_belt')}
              >
                <Luggage size={16} />
                <span>Luggage Belt Collection</span>
              </button>
              <button
                type="button"
                className={`${styles.radioTab} ${pickupOption === 'doorstep' ? styles.radioTabActive : ''}`}
                onClick={() => setPickupOption('doorstep')}
              >
                <Building size={16} />
                <span>Airport Counter / Doorstep</span>
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Airport Terminal</label>
                <select
                  value={pickup.terminal}
                  onChange={(e) => setPickup({ ...pickup, terminal: e.target.value })}
                >
                  <option value="Terminal 3">Terminal 3 (Domestic & International)</option>
                  <option value="Terminal 2">Terminal 2 (Domestic)</option>
                  <option value="Terminal 1">Terminal 1 (Domestic Departures/Arrivals)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Flight Number</label>
                <input
                  type="text"
                  placeholder="e.g. AI 102 / 6E 543"
                  value={pickup.flightNumber}
                  onChange={(e) => setPickup({ ...pickup, flightNumber: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>PNR / Booking Reference</label>
                <input
                  type="text"
                  placeholder="e.g. AB12CD"
                  value={pickup.pnr}
                  onChange={(e) => setPickup({ ...pickup, pnr: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Baggage Belt Number</label>
                <input
                  type="text"
                  placeholder="e.g. Belt 04 / Arrival Carousel"
                  value={pickup.luggageBelt}
                  onChange={(e) => setPickup({ ...pickup, luggageBelt: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Passenger / Contact Name</label>
                <input
                  type="text"
                  placeholder="Full name as on ticket"
                  value={pickup.contactName}
                  onChange={(e) => setPickup({ ...pickup, contactName: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mobile Number (for Driver OTP)</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={pickup.phoneNumber}
                  onChange={(e) => setPickup({ ...pickup, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Airport Address</label>
                <input
                  type="text"
                  value={pickup.addressLine1}
                  onChange={(e) => setPickup({ ...pickup, addressLine1: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.nextBtnRow}>
              <button
                className={styles.nextBtn}
                onClick={() => setCurrentStep(2)}
              >
                <span>Continue to Delivery Details</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DELIVERY DETAILS (Screens 11 & 12) ================= */}
        {currentStep === 2 && (
          <div className={styles.stepCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Where should we deliver your luggage?</h2>
              <p className={styles.sectionSub}>Hotel front desk, residence, or destination address</p>
            </div>

            {/* Delivery Destination Options */}
            <div className={styles.radioTabs}>
              <button
                type="button"
                className={`${styles.radioTab} ${deliveryOption === 'hotel_reception' ? styles.radioTabActive : ''}`}
                onClick={() => setDeliveryOption('hotel_reception')}
              >
                <Building size={16} />
                <span>Hotel / Resort</span>
              </button>
              <button
                type="button"
                className={`${styles.radioTab} ${deliveryOption === 'doorstep' ? styles.radioTabActive : ''}`}
                onClick={() => setDeliveryOption('doorstep')}
              >
                <Home size={16} />
                <span>Home / Office</span>
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Hotel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Taj City Centre / The Leela"
                  value={delivery.hotelName}
                  onChange={(e) => setDelivery({ ...delivery, hotelName: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Room Number (if assigned)</label>
                <input
                  type="text"
                  placeholder="e.g. Room 402 or Check-in Pending"
                  value={delivery.roomNumber}
                  onChange={(e) => setDelivery({ ...delivery, roomNumber: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Guest / Recipient Name</label>
                <input
                  type="text"
                  placeholder="Name as registered at hotel"
                  value={delivery.guestName}
                  onChange={(e) =>
                    setDelivery({ ...delivery, guestName: e.target.value, contactName: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Recipient Phone Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={delivery.phoneNumber}
                  onChange={(e) => setDelivery({ ...delivery, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Hotel Full Address</label>
                <input
                  type="text"
                  value={delivery.addressLine1}
                  onChange={(e) => setDelivery({ ...delivery, addressLine1: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>City</label>
                <input
                  type="text"
                  value={delivery.city}
                  onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Pincode</label>
                <input
                  type="text"
                  value={delivery.postalCode}
                  onChange={(e) => setDelivery({ ...delivery, postalCode: e.target.value })}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Delivery Instructions</label>
                <textarea
                  rows={2}
                  value={delivery.specialInstructions}
                  onChange={(e) => setDelivery({ ...delivery, specialInstructions: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.toggleRow}>
              <input
                type="checkbox"
                id="leaveAtReception"
                checked={delivery.leaveAtReception}
                onChange={(e) => setDelivery({ ...delivery, leaveAtReception: e.target.checked })}
              />
              <label htmlFor="leaveAtReception">
                Leave luggage with Hotel Front Desk reception if I haven't checked in yet
              </label>
            </div>

            <div className={styles.nextBtnRow}>
              <button
                className={styles.nextBtn}
                onClick={() => setCurrentStep(3)}
              >
                <span>Continue to Luggage Details</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: LUGGAGE DETAILS (Screens 13 & 14) ================= */}
        {currentStep === 3 && (
          <div className={styles.stepCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerWithCounter}>
                <div>
                  <h2 className={styles.sectionTitle}>Baggage & Piece Details</h2>
                  <p className={styles.sectionSub}>Specify each piece for tamper-evident sealing</p>
                </div>
                <div className={styles.counterControl}>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => removeLuggagePiece(luggageList[luggageList.length - 1]?.id)}
                    disabled={luggageList.length <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={styles.counterVal}>{totalBags} Bags</span>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={addLuggagePiece}
                    disabled={luggageList.length >= 6}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Luggage Piece Cards */}
            <div className={styles.luggageListWrap}>
              {luggageList.map((item, index) => (
                <div key={item.id} className={styles.luggagePieceCard}>
                  <div className={styles.pieceHeader}>
                    <span className={styles.pieceIndexBadge}>Bag #{index + 1}</span>
                    {luggageList.length > 1 && (
                      <button
                        type="button"
                        className={styles.removePieceBtn}
                        onClick={() => removeLuggagePiece(item.id)}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>

                  <div className={styles.pieceGrid}>
                    <div className={styles.formGroup}>
                      <label>Luggage Type</label>
                      <select
                        value={item.type}
                        onChange={(e) => updateLuggagePiece(item.id, 'type', e.target.value)}
                      >
                        <option value="Check-in Bag">Check-in Suitcase / Trolley</option>
                        <option value="Cabin Bag">Cabin Bag / Overhead</option>
                        <option value="Duffle Bag">Duffle Bag / Backpack</option>
                        <option value="Carton Box">Carton Box / Packaging</option>
                        <option value="Fragile Case">Fragile Equipment Case</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Bag Size</label>
                      <select
                        value={item.size}
                        onChange={(e) => updateLuggagePiece(item.id, 'size', e.target.value)}
                      >
                        <option value="Small">Cabin / Small (Up to 10 Kg)</option>
                        <option value="Medium">Medium (Up to 20 Kg)</option>
                        <option value="Large">Large (Up to 32 Kg)</option>
                        <option value="Extra Large">Extra Large (Over 32 Kg)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Approx Weight (Kg)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={item.weight}
                        onChange={(e) => updateLuggagePiece(item.id, 'weight', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Airline Baggage Tag #</label>
                      <input
                        type="text"
                        placeholder="e.g. AI-48291"
                        value={item.tag}
                        onChange={(e) => updateLuggagePiece(item.id, 'tag', e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Handling Notice */}
            <div className={styles.handlingBox}>
              <h4 className={styles.handlingTitle}>Special Handling Flags</h4>
              <div className={styles.checkGrid}>
                <label className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={fragile}
                    onChange={(e) => setFragile(e.target.checked)}
                  />
                  <span>Fragile Items Inside</span>
                </label>
                <label className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={keepDry}
                    onChange={(e) => setKeepDry(e.target.checked)}
                  />
                  <span>Keep Dry / Moisture Sensitive</span>
                </label>
                <label className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={uprightOnly}
                    onChange={(e) => setUprightOnly(e.target.checked)}
                  />
                  <span>Keep Upright Only</span>
                </label>
              </div>
            </div>

            {/* Seal Notification Banner */}
            <div className={styles.sealInfoNotice}>
              <ShieldCheck size={20} className={styles.sealInfoIcon} />
              <p>
                <strong>Tamper-Evident Security Seal:</strong> Every bag will be locked with an individual barcode seal (DLV-SEAL-88492) upon collection at the airport.
              </p>
            </div>

            <div className={styles.nextBtnRow}>
              <button
                className={styles.nextBtn}
                onClick={() => setCurrentStep(4)}
              >
                <span>Continue to Add-on Services</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: ADD-ON SERVICES (Screens 15 - 20) ================= */}
        {currentStep === 4 && (
          <div className={styles.stepCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Select Add-on Services</h2>
              <p className={styles.sectionSub}>Enhance safety, airport assistance, and luggage protection</p>
            </div>

            {/* 1. Value-Added Courier Add-ons (Screens 15 & 16) */}
            <div className={styles.addonSection}>
              <h3 className={styles.addonCategoryTitle}>Value-Added Courier Add-ons</h3>
              <div className={styles.addonGrid}>
                {[
                  { id: 'AIRPORT_ASSIST', title: 'Airport Terminal Assistance', price: 150, desc: 'Driver assists with portering & terminal escort' },
                  { id: 'SEAL_WRAP', title: 'Tamper-Evident Security Seal & Wrap', price: 100, desc: 'Heavy-duty PVC protective stretch film with barcode seal' },
                  { id: 'SANITISED_VAN', title: 'GPS Live Real-time Tracked Van', price: 100, desc: 'Dedicated air-conditioned sanitized van with continuous telemetry' },
                  { id: 'WEIGHING', title: 'Doorstep Weighing & Verification', price: 50, desc: 'Digital luggage scale check with weight certificate' },
                ].map((item) => {
                  const isChecked = selectedAddons.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`${styles.addonCard} ${isChecked ? styles.addonCardActive : ''}`}
                      onClick={() => toggleAddon(item.id, selectedAddons, setSelectedAddons)}
                    >
                      <div className={styles.addonCardTop}>
                        <h4 className={styles.addonTitle}>{item.title}</h4>
                        <span className={styles.addonPrice}>+₹{item.price}</span>
                      </div>
                      <p className={styles.addonDesc}>{item.desc}</p>
                      <div className={styles.addonSelectIndicator}>
                        {isChecked ? <CheckCircle2 size={16} /> : <div className={styles.circleUnchecked}></div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 2. Luggage Protection (Screens 17 & 18) */}
            <div className={styles.addonSection}>
              <h3 className={styles.addonCategoryTitle}>Luggage Protection & Insurance</h3>
              <div className={styles.addonGrid}>
                {[
                  { id: 'THEFT_COVER', title: 'Theft & Loss Cover (₹50,000)', price: 100, desc: 'Extended compensation guarantee in case of complete transit loss' },
                  { id: 'DAMAGE_COVER', title: 'Luggage Outer Damage Cover', price: 80, desc: 'Covers suitcase shell cracks, zip breaks, and wheel damage' },
                  { id: 'FLIGHT_DELAY', title: 'Flight Delay Baggage Hold', price: 150, desc: 'Free secure storage for up to 24 hours if flight is rescheduled' },
                ].map((item) => {
                  const isChecked = selectedProtection.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`${styles.addonCard} ${isChecked ? styles.addonCardActive : ''}`}
                      onClick={() => toggleAddon(item.id, selectedProtection, setSelectedProtection)}
                    >
                      <div className={styles.addonCardTop}>
                        <h4 className={styles.addonTitle}>{item.title}</h4>
                        <span className={styles.addonPrice}>+₹{item.price}</span>
                      </div>
                      <p className={styles.addonDesc}>{item.desc}</p>
                      <div className={styles.addonSelectIndicator}>
                        {isChecked ? <CheckCircle2 size={16} /> : <div className={styles.circleUnchecked}></div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3. Airport Assistance (Screens 19 & 20) */}
            <div className={styles.addonSection}>
              <h3 className={styles.addonCategoryTitle}>Airport Assistance Add-ons</h3>
              <div className={styles.addonGrid}>
                {[
                  { id: 'BELT_PICKUP', title: 'Luggage Belt Retrieval Assistance', price: 120, desc: 'Dedicated agent collects bags directly from luggage carousel' },
                  { id: 'PORTER_HELP', title: 'Luggage Porter Assistance', price: 120, desc: 'Airport certified porter helps load onto courier vehicle' },
                ].map((item) => {
                  const isChecked = selectedAirportAssist.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`${styles.addonCard} ${isChecked ? styles.addonCardActive : ''}`}
                      onClick={() => toggleAddon(item.id, selectedAirportAssist, setSelectedAirportAssist)}
                    >
                      <div className={styles.addonCardTop}>
                        <h4 className={styles.addonTitle}>{item.title}</h4>
                        <span className={styles.addonPrice}>+₹{item.price}</span>
                      </div>
                      <p className={styles.addonDesc}>{item.desc}</p>
                      <div className={styles.addonSelectIndicator}>
                        {isChecked ? <CheckCircle2 size={16} /> : <div className={styles.circleUnchecked}></div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={styles.nextBtnRow}>
              <button
                className={styles.nextBtn}
                onClick={() => setCurrentStep(5)}
              >
                <span>Continue to Schedule</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: SCHEDULE (Screens 21 & 22) ================= */}
        {currentStep === 5 && (
          <div className={styles.stepCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Schedule Pickup & Delivery</h2>
              <p className={styles.sectionSub}>Choose time slots and delivery speed</p>
            </div>

            {/* Pickup Date Selector */}
            <div className={styles.scheduleGroup}>
              <label className={styles.scheduleLabel}>Pickup Date</label>
              <div className={styles.datePills}>
                {['Today', 'Tomorrow', '12 May 2025'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`${styles.datePill} ${schedule.pickupDate === d ? styles.datePillActive : ''}`}
                    onClick={() => setSchedule({ ...schedule, pickupDate: d })}
                  >
                    <Calendar size={14} />
                    <span>{d}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Pills */}
            <div className={styles.scheduleGroup}>
              <label className={styles.scheduleLabel}>Preferred Time Slot</label>
              <div className={styles.slotGrid}>
                {[
                  '08:00 AM - 10:00 AM',
                  '10:00 AM - 12:00 PM',
                  '12:00 PM - 02:00 PM',
                  '02:00 PM - 04:00 PM',
                  '04:00 PM - 06:00 PM',
                  '06:00 PM - 08:00 PM',
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`${styles.slotPill} ${schedule.pickupSlot === slot ? styles.slotPillActive : ''}`}
                    onClick={() => setSchedule({ ...schedule, pickupSlot: slot })}
                  >
                    <Clock size={13} />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Speed Options */}
            <div className={styles.scheduleGroup}>
              <label className={styles.scheduleLabel}>Delivery Speed</label>
              <div className={styles.speedGrid}>
                {[
                  { id: 'STANDARD', title: 'Standard Express', time: 'Same Day by 6:00 PM', fee: 'Included' },
                  { id: 'FAST_TRACK', title: 'Fast Track Priority', time: 'Delivered in 4 Hours', fee: '+₹100' },
                  { id: 'CRITICAL_FLIGHT_RUSH', title: 'Critical Flight Rush', time: 'Direct within 2-3 Hours', fee: '+₹250' },
                ].map((speed) => (
                  <div
                    key={speed.id}
                    className={`${styles.speedCard} ${schedule.deliverySpeed === speed.id ? styles.speedCardActive : ''}`}
                    onClick={() => setSchedule({ ...schedule, deliverySpeed: speed.id })}
                  >
                    <div className={styles.speedTop}>
                      <h4>{speed.title}</h4>
                      <span className={styles.speedFee}>{speed.fee}</span>
                    </div>
                    <p className={styles.speedTime}>{speed.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Sync Toggle */}
            <div className={styles.toggleRow}>
              <input
                type="checkbox"
                id="flightSync"
                checked={schedule.flightSyncUrgency}
                onChange={(e) => setSchedule({ ...schedule, flightSyncUrgency: e.target.checked })}
              />
              <label htmlFor="flightSync">
                Sync schedule with live flight arrival (driver automatically tracks delays)
              </label>
            </div>

            <div className={styles.nextBtnRow}>
              <button
                className={styles.nextBtn}
                onClick={() => setCurrentStep(6)}
              >
                <span>Continue to Review Summary</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: REVIEW BOOKING SUMMARY (Screens 23 & 24) ================= */}
        {currentStep === 6 && (
          <div className={styles.stepCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Review Booking Summary</h2>
              <p className={styles.sectionSub}>Check your details before proceeding to payment</p>
            </div>

            <div className={styles.summaryList}>
              {/* Route */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Route Service</span>
                <div className={styles.summaryVal}>
                  <strong>{activeService.title}</strong> {isRoundTrip ? '(Round Trip)' : ''}
                </div>
              </div>

              {/* Pickup */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Pickup</span>
                <div className={styles.summaryVal}>
                  <div>{pickup.terminal} • Belt {pickup.luggageBelt}</div>
                  <div className={styles.summarySub}>Flight {pickup.flightNumber} • PNR {pickup.pnr}</div>
                  <div className={styles.summarySub}>{pickup.contactName} ({pickup.phoneNumber})</div>
                </div>
              </div>

              {/* Delivery */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Delivery Destination</span>
                <div className={styles.summaryVal}>
                  <div>{delivery.hotelName} {delivery.roomNumber ? `• Room ${delivery.roomNumber}` : ''}</div>
                  <div className={styles.summarySub}>{delivery.addressLine1}, {delivery.city}</div>
                  <div className={styles.summarySub}>Recipient: {delivery.contactName} ({delivery.phoneNumber})</div>
                </div>
              </div>

              {/* Luggage */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Luggage Consignment</span>
                <div className={styles.summaryVal}>
                  <strong>{totalBags} Bags (Total: {totalWeightKg} Kg)</strong>
                  <div className={styles.summarySub}>
                    {luggageList.map((b, i) => `Bag ${i+1}: ${b.type} (${b.weight}kg)`).join(', ')}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Pickup Slot</span>
                <div className={styles.summaryVal}>
                  <div>{schedule.pickupDate} • {schedule.pickupSlot}</div>
                  <div className={styles.summarySub}>Speed: {schedule.deliverySpeed} (Expected by 6:00 PM)</div>
                </div>
              </div>

              {/* Tamper Seal Security */}
              <div className={styles.summarySealBadge}>
                <Lock size={16} />
                <span>Assigned Tamper-Evident Seal: <strong>DLV-SEAL-88492</strong></span>
              </div>
            </div>

            <div className={styles.nextBtnRow}>
              <button
                className={styles.nextBtn}
                onClick={() => setCurrentStep(7)}
              >
                <span>Proceed to Payment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ================= PAYMENT & FARE BREAKDOWN (Screens 25 & 26) ================= */}
        {currentStep === 7 && (
          <div className={styles.paymentContainer}>
            {/* Fare Breakdown Card matching Screen 26 */}
            <div className={styles.fareBreakdownCard}>
              <h3 className={styles.fareCardTitle}>Fare Summary (Screen 26 Breakdown)</h3>

              <div className={styles.fareLines}>
                <div className={styles.fareLine}>
                  <span>Base Route Fare</span>
                  <span>₹{fareBreakdown.baseFare.toFixed(2)}</span>
                </div>
                <div className={styles.fareLine}>
                  <span>Distance Charge (18 km)</span>
                  <span>₹{fareBreakdown.distanceFee.toFixed(2)}</span>
                </div>
                <div className={styles.fareLine}>
                  <span>Luggage Handling Fee ({totalBags} Bags)</span>
                  <span>₹{fareBreakdown.luggageFee.toFixed(2)}</span>
                </div>
                <div className={styles.fareLine}>
                  <span>Airport Terminal Fee</span>
                  <span>₹{fareBreakdown.airportFee.toFixed(2)}</span>
                </div>
                <div className={styles.fareLine}>
                  <span>Add-on Services Total</span>
                  <span>₹{fareBreakdown.addonsFee.toFixed(2)}</span>
                </div>
                <div className={styles.fareLine}>
                  <span>Express Delivery Speed</span>
                  <span>₹{fareBreakdown.speedFee.toFixed(2)}</span>
                </div>
                <div className={styles.fareLine}>
                  <span>GST (18%)</span>
                  <span>₹{fareBreakdown.gst.toFixed(2)}</span>
                </div>

                {promoApplied && (
                  <div className={`${styles.fareLine} ${styles.discountLine}`}>
                    <span>Promo Discount ({promoCode})</span>
                    <span>-₹{fareBreakdown.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className={styles.fareDivider}></div>

                <div className={styles.totalLine}>
                  <span>Total Payable Amount</span>
                  <span>₹{fareBreakdown.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code Box */}
              <div className={styles.promoBox}>
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={() => setPromoApplied(true)}
                >
                  {promoApplied ? 'APPLIED ✓' : 'APPLY'}
                </button>
              </div>
            </div>

            {/* Payment Method Selector (Screen 25) */}
            <div className={styles.paymentMethodsCard}>
              <h3 className={styles.fareCardTitle}>Select Payment Method</h3>

              <div className={styles.paymentOptions}>
                {[
                  { id: 'UPI', label: 'UPI (Google Pay, PhonePe, Paytm, BHIM)', icon: Sparkles },
                  { id: 'CARD', label: 'Credit / Debit Card (Visa, Mastercard)', icon: CreditCard },
                  { id: 'WALLET', label: 'DelivEz Wallet (Balance ₹5,400)', icon: Wallet },
                  { id: 'PAY_ON_DELIVERY', label: 'Pay on Delivery / Cash', icon: Truck },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`${styles.payOption} ${paymentMethod === m.id ? styles.payOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                    />
                    <m.icon size={20} className={styles.payIcon} />
                    <span className={styles.payLabel}>{m.label}</span>
                  </label>
                ))}
              </div>

              <div className={styles.trustBadgeRow}>
                <ShieldCheck size={18} />
                <span>256-Bit SSL Encrypted • 100% Secure Checkout Guarantee</span>
              </div>

              <button
                className={styles.payBtn}
                onClick={handleConfirmAndPay}
                disabled={submitting}
              >
                {submitting ? (
                  <span>Creating Booking & Processing...</span>
                ) : (
                  <>
                    <span>Pay ₹{fareBreakdown.total.toFixed(2)} & Confirm Booking</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 8: BOOKING CONFIRMED (Screen 27) ================= */}
        {currentStep === 8 && (
          <div className={styles.confirmedCard}>
            <div className={styles.confirmedIconBox}>
              <CheckCircle2 size={48} />
            </div>

            <h2 className={styles.confirmedHeading}>Booking Confirmed Successfully!</h2>
            <p className={styles.confirmedSub}>
              Your luggage delivery has been scheduled and dispatched to our airport courier team.
            </p>

            {/* Consignment ID Banner */}
            <div className={styles.consignmentBox}>
              <span className={styles.consignmentLabel}>Consignment Booking ID</span>
              <div className={styles.consignmentRow}>
                <span className={styles.consignmentNumber}>
                  {confirmedBooking?.bookingNumber || 'DLVZ2505128947'}
                </span>
                <button
                  className={styles.copyIdBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(confirmedBooking?.bookingNumber || 'DLVZ2505128947')
                    setCopiedId(true)
                    setTimeout(() => setCopiedId(false), 2000)
                  }}
                >
                  {copiedId ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Delivery Meta Grid */}
            <div className={styles.metaGrid}>
              <div className={styles.metaCol}>
                <span className={styles.metaTitle}>Expected Delivery</span>
                <span className={styles.metaVal}>{schedule.estimatedDelivery || '12 May 2025 by 06:00 PM'}</span>
              </div>
              <div className={styles.metaCol}>
                <span className={styles.metaTitle}>Tamper Seal Number</span>
                <span className={styles.metaVal}>{confirmedBooking?.sealNumber || 'DLV-SEAL-88492'}</span>
              </div>
              <div className={styles.metaCol}>
                <span className={styles.metaTitle}>Assigned Agent</span>
                <span className={styles.metaVal}>Ravi Kumar (DL 1Z 4589)</span>
              </div>
            </div>

            {/* Actions matching APK Screen 27 */}
            <div className={styles.confirmedActions}>
              <button
                className={styles.trackLiveBtn}
                onClick={() => setTrackingViewBookingId(confirmedBooking?.bookingNumber || 'DLVZ2505128947')}
              >
                <span>Track Live Consignment</span>
                <ArrowRight size={18} />
              </button>

              <button
                className={styles.secondaryPodBtn}
                onClick={() => setPodViewBookingId(confirmedBooking?.bookingNumber || 'DLVZ2505128947')}
              >
                <span>View Proof of Delivery (POD)</span>
                <ExternalLink size={16} />
              </button>

              <button
                className={styles.newBookingBtn}
                onClick={() => {
                  setConfirmedBooking(null)
                  setCurrentStep(0)
                }}
              >
                <span>Book Another Courier</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
