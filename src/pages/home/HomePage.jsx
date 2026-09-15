import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Crosshair,
  FileText,
  Gift,
  Headphones,
  HeartHandshake,
  IndianRupee,
  Info,
  Key,
  Laptop,
  Leaf,
  Lock,
  Luggage,
  Mail,
  MapPin,
  MapPinned,
  MessageSquare,
  Mic,
  Package,
  PackageCheck,
  PhoneCall,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tag,
  ThumbsUp,
  Truck,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import ServiceCard from '@/components/cards/ServiceCard/ServiceCard.jsx'
import BookingForm from '@/features/booking/components/BookingForm.jsx'
import styles from './HomePage.module.css'
import { navigateTo } from '@/app/router/navigation.js'
import { apiRequest } from '@/services/api/apiClient.js'
import { fetchPublicServices } from '@/features/services/services/publicServicesService.js'
import { mergeServiceCatalog, SERVICE_CATALOG } from '@/features/services/serviceCatalog.js'
import {
  checkPincodeServiceability,
  detectGpsLocation,
  fetchCurrentLocation,
  fetchHomeAll,
  fetchPromptExamples,
  submitSupportHelpRequest,
} from '@/features/home-content/services/homeContentService.js'
import { getStoredUser, registerUser, verifyUserOtp, getDeviceId } from '@/features/auth/services/userAuthService.js'

const DEFAULT_PROMPT_EXAMPLES = [
  {
    id: 'laptop-office',
    title: 'Pick up my laptop from office and deliver home by 8 PM',
    shortText: 'Pick up my laptop from office and deliv...',
    promptText: 'Pick up my laptop from office and deliver home by 8 PM',
    serviceSlug: 'courier-delivery',
    icon: 'laptop',
    iconColor: '#d97706',
  },
  {
    id: 'airport-luggage',
    title: 'Send my luggage to Bengaluru Airport Terminal 1',
    shortText: 'Send my luggage to Bengaluru Airport T...',
    promptText: 'Send my luggage to Bengaluru Airport Terminal 1',
    serviceSlug: 'luggage-delivery',
    icon: 'luggage',
    iconColor: '#16a34a',
  },
  {
    id: 'legal-documents',
    title: 'Deliver important documents to my lawyer',
    shortText: 'Deliver important documents to my law...',
    promptText: 'Deliver important confidential documents to my lawyer with tamper-proof void seal',
    serviceSlug: 'confidential-delivery',
    icon: 'file-text',
    iconColor: '#9333ea',
  },
  {
    id: 'birthday-gift',
    title: 'Send a birthday gift to my wife at home',
    shortText: 'Send a birthday gift to my wife at ho...',
    promptText: 'Send a surprise birthday gift to my wife at home with special gift wrap',
    serviceSlug: 'gift-delivery',
    icon: 'gift',
    iconColor: '#e11d48',
  },
  {
    id: 'zara-return',
    title: 'Pick up my return from Zara and deliver to logistics hub',
    shortText: 'Pick up my return from Zara and deliv...',
    promptText: 'Pick up my clothing return package from Zara and deliver to return center',
    serviceSlug: 'return-pickup',
    icon: 'hanger',
    iconColor: '#0284c7',
  },
  {
    id: 'forgot-keys',
    title: 'I forgot my car keys at home. Deliver to office',
    shortText: 'I forgot my car keys at home. Deliver to...',
    promptText: 'I forgot my car keys at home. Please retrieve them from home and deliver to my office immediately',
    serviceSlug: 'forgot-something',
    icon: 'key',
    iconColor: '#ea580c',
  },
]

const servicePresentation = {
  'courier-delivery': { icon: Truck, tint: '#eef7ff', accent: '#087bc1' },
  'personal-courier': { icon: Truck, tint: '#eef7ff', accent: '#087bc1' },
  'luggage-delivery': { icon: Luggage, tint: '#fff9e6', accent: '#f1ad00' },
  'airport-luggage': { icon: Luggage, tint: '#fff9e6', accent: '#f1ad00' },
  'confidential-delivery': { icon: ShieldCheck, tint: '#fdf2f2', accent: '#e00014' },
  'confidential-courier': { icon: ShieldCheck, tint: '#fdf2f2', accent: '#e00014' },
  'forgot-something': { icon: ShoppingBag, tint: '#fff9e6', accent: '#e5a100' },
  'return-pickup': { icon: RotateCcw, tint: '#fff4e8', accent: '#ed5b08' },
  'personal-return-pickup': { icon: RotateCcw, tint: '#fff4e8', accent: '#ed5b08' },
  'know-more': { icon: Info, tint: '#f5f3ff', accent: '#7c3aed' },
  'special-delivery': { icon: Package, tint: '#f5f3ff', accent: '#7c3aed' },
}

const trustItems = [
  { title: 'Safe & Secure', text: 'Your safety is our priority', icon: ShieldCheck },
  { title: 'Fast Delivery', text: 'Quick pickups and on-time deliveries', icon: Clock3 },
  { title: 'Affordable Pricing', text: 'Best rates for every delivery', icon: IndianRupee },
  { title: '24/7 Support', text: 'We are here to help anytime', icon: Headphones },
  { title: 'Real-time Tracking', text: 'Follow your order every step', icon: MapPinned },
]

// 9 Feature items matching reference ref_02.jpeg exactly
const whyChooseDelvezOne = [
  { icon: MapPin, title: 'Pan India Network', text: 'Reach across India' },
  { icon: Truck, title: 'Real-Time Tracking', text: 'Know where your shipment is' },
  { icon: ShieldCheck, title: 'Secure & Trusted', text: 'For your valuable items' },
  { icon: Calendar, title: 'Flexible Scheduling', text: 'Pickup at your convenience' },
  { icon: Wallet, title: 'Multiple Payment Options', text: 'UPI, Card, Net Banking or Delvez Money' },
  { icon: Headphones, title: 'Dedicated Support', text: 'Help when you need it' },
  { icon: Leaf, title: 'Eco-Friendly Fleet', text: 'Cleaner deliveries for a greener tomorrow' },
  { icon: IndianRupee, title: 'Transparent Pricing', text: 'No hidden charges' },
  { icon: Shield, title: 'Insured Deliveries', text: 'Added protection for peace of mind' },
]

const chipIconMap = {
  calculator: Calculator,
  calendar: Calendar,
  wallet: Wallet,
  tag: Tag,
}

const actionIconMap = {
  box: Package,
  truck: Truck,
  'map-pin': MapPin,
  headset: Headphones,
}

function HomePage() {
  const [user, setUser] = useState(() => getStoredUser())
  const [serviceCatalog, setServiceCatalog] = useState({ items: SERVICE_CATALOG, error: '' })
  const [trackingStatus, setTrackingStatus] = useState(null)
  const [knowMoreOpen, setKnowMoreOpen] = useState(false)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState('')

  // Dynamic Home Backend Data
  const [homeData, setHomeData] = useState(null)
  const [currentLocation, setCurrentLocation] = useState({
    label: 'Home',
    addressLine: '123, MG Road, Bengaluru, Karnataka 560001',
    city: 'Bengaluru',
  })
  const [locationPresets, setLocationPresets] = useState([])
  const [locationPickerOpen, setLocationPickerOpen] = useState(false)
  const [detectingGps, setDetectingGps] = useState(false)

  // Quick Auth Card State
  const [quickPhone, setQuickPhone] = useState('')
  const [quickAuthStep, setQuickAuthStep] = useState(1)
  const [quickAuthLoading, setQuickAuthLoading] = useState(false)
  const [quickAuthError, setQuickAuthError] = useState('')

  // Modals for Quick Actions
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false)
  const [pincodeInput, setPincodeInput] = useState('')
  const [pincodeResult, setPincodeResult] = useState(null)
  const [pincodeChecking, setPincodeChecking] = useState(false)

  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [supportInquirySent, setSupportInquirySent] = useState(false)
  const [supportFormLoading, setSupportFormLoading] = useState(false)

  // AI Prompt Bar
  const [promptText, setPromptText] = useState('')
  const [examplesModalOpen, setExamplesModalOpen] = useState(false)
  const [promptExamples, setPromptExamples] = useState(DEFAULT_PROMPT_EXAMPLES)

  useEffect(() => {
    const handleAuthChange = () => setUser(getStoredUser())
    window.addEventListener('auth:change', handleAuthChange)
    return () => window.removeEventListener('auth:change', handleAuthChange)
  }, [])

  useEffect(() => {
    let active = true

    fetchPublicServices()
      .then((items) => active && setServiceCatalog({ items: mergeServiceCatalog(items), error: '' }))
      .catch(() => active && setServiceCatalog({ items: SERVICE_CATALOG, error: 'Live service catalog fallback.' }))

    fetchHomeAll().then((data) => {
      if (!active || !data) return
      setHomeData(data)
      if (data.location?.current) {
        setCurrentLocation(data.location.current)
      }
      if (data.location?.presets) {
        setLocationPresets(data.location.presets)
      }
      if (data.promptExamples && data.promptExamples.length > 0) {
        setPromptExamples(data.promptExamples)
      }
    })

    fetchPromptExamples().then((items) => {
      if (active && items && items.length > 0) {
        setPromptExamples(items)
      }
    })

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (!active) return
          const detected = await detectGpsLocation(pos.coords.latitude, pos.coords.longitude)
          if (detected && active) {
            setCurrentLocation(detected)
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 120000 },
      )
    }

    return () => {
      active = false
    }
  }, [])

  const services = useMemo(() => {
    return serviceCatalog.items.map((service, index) => ({
      number: String(index + 1).padStart(2, '0'),
      title: service.name,
      subtitle: service.subtitle,
      description: service.shortDescription,
      imageUrl: service.imageUrl,
      slug: service.slug,
      displayOrder: service.displayOrder ?? index + 1,
      available: true,
      icon: servicePresentation[service.slug]?.icon ?? PackageCheck,
      tint: servicePresentation[service.slug]?.tint ?? '#f5f7f9',
      accent: servicePresentation[service.slug]?.accent ?? '#52606d',
    }))
  }, [serviceCatalog.items])

  const bookService = (service) => {
    if (service.slug === 'confidential-delivery' || service.slug === 'confidential-courier') {
      navigateTo('/book/confidential-delivery')
    } else if (
      service.slug === 'luggage-delivery' ||
      service.slug === 'airport-luggage'
    ) {
      navigateTo('/luggage-delivery')
    } else if (
      service.slug === 'courier-delivery' ||
      service.slug === 'personal-courier'
    ) {
      navigateTo('/courier')
    } else if (
      service.slug === 'know-more' ||
      service.slug === 'special-delivery' ||
      service.slug === 'gift-delivery'
    ) {
      setKnowMoreOpen(true)
    } else {
      navigateTo(`/book/${service.slug}`)
    }
  }

  const handleGpsDetect = () => {
    setDetectingGps(true)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const detected = await detectGpsLocation(pos.coords.latitude, pos.coords.longitude)
          setDetectingGps(false)
          if (detected) {
            setCurrentLocation(detected)
            setLocationPickerOpen(false)
          }
        },
        async () => {
          const loc = await fetchCurrentLocation()
          setDetectingGps(false)
          if (loc) {
            setCurrentLocation(loc)
            setLocationPickerOpen(false)
          } else {
            alert('Could not detect location. Please select from the list.')
          }
        },
        { enableHighAccuracy: true, timeout: 8000 },
      )
    } else {
      fetchCurrentLocation().then((loc) => {
        setDetectingGps(false)
        if (loc) {
          setCurrentLocation(loc)
          setLocationPickerOpen(false)
        }
      })
    }
  }

  const selectLocationPreset = (preset) => {
    setCurrentLocation({
      label: preset.label,
      addressLine: preset.addressLine,
      city: preset.city,
      state: preset.state,
      postalCode: preset.postalCode,
      latitude: preset.latitude,
      longitude: preset.longitude,
      isServiceable: true,
    })
    setLocationPickerOpen(false)
  }

  const handleQuickActionClick = (action) => {
    if (action.actionTarget === 'PINCODE_MODAL') {
      setPincodeModalOpen(true)
      setPincodeResult(null)
      setPincodeInput('')
    } else if (action.actionTarget === 'SUPPORT_MODAL') {
      setSupportModalOpen(true)
      setSupportInquirySent(false)
    } else if (action.actionTarget === '#track-order') {
      const el = document.getElementById('track-order')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      const input = document.getElementById('tracking-id')
      if (input) input.focus()
    } else if (action.actionTarget.startsWith('/')) {
      navigateTo(action.actionTarget)
    } else {
      window.location.hash = action.actionTarget
    }
  }

  const handleCheckPincodeSubmit = async (e) => {
    e.preventDefault()
    if (!pincodeInput.trim()) return
    setPincodeChecking(true)
    setPincodeResult(null)
    const res = await checkPincodeServiceability(pincodeInput.trim())
    setPincodeChecking(false)
    setPincodeResult(res)
  }

  const handleSupportSubmit = async (e) => {
    e.preventDefault()
    setSupportFormLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await submitSupportHelpRequest({
        name: formData.get('name'),
        mobileNumber: formData.get('mobileNumber'),
        message: formData.get('message'),
        subject: formData.get('subject') || 'Customer Assistance',
      })
      setSupportInquirySent(true)
    } catch {
      alert('Unable to submit your message. Please try again.')
    } finally {
      setSupportFormLoading(false)
    }
  }

  const handleSelectExample = (item) => {
    setPromptText(item.promptText || item.title)
    setExamplesModalOpen(false)
    const input = document.getElementById('ai-prompt-input')
    if (input) {
      input.focus()
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handlePromptSubmit = (e) => {
    e.preventDefault()
    if (promptText.trim()) {
      navigateTo('/courier')
    }
  }

  const handleQuickSendOtp = (e) => {
    e.preventDefault()
    const cleanPhone = quickPhone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      setQuickAuthError('Please enter a valid 10-digit mobile number.')
      return
    }
    setQuickAuthError('')
    navigateTo(`/signup?phone=${encodeURIComponent(cleanPhone)}`)
  }

  const trackOrder = async (event) => {
    event.preventDefault()
    setTrackingError('')
    const trackingId = new FormData(event.currentTarget).get('trackingId').trim().toUpperCase()
    if (!trackingId) return

    if (
      trackingId.startsWith('DLZC') ||
      trackingId.startsWith('PC') ||
      trackingId === 'DLVZ2505128947' ||
      (trackingId.startsWith('DLVZ') && trackingId.length >= 13) ||
      (trackingId.startsWith('DLZ') && !trackingId.startsWith('DLVZ'))
    ) {
      navigateTo(`/track/courier/${trackingId}`)
      return
    }
    if (trackingId.startsWith('DLVZ') && trackingId.length === 12) {
      navigateTo(`/gift-delivery/track/${trackingId}`)
      return
    }
    if (trackingId.startsWith('DLVZ')) {
      navigateTo(`/track/courier/${trackingId}`)
      return
    }
    if (trackingId.startsWith('DRVZ-RET') || trackingId.startsWith('RBK')) {
      navigateTo(`/return-pickup/track/${trackingId}`)
      return
    }
    if (trackingId.startsWith('DZ') || trackingId.startsWith('FS-')) {
      navigateTo(`/track/forgot-something/${trackingId}`)
      return
    }

    setTrackingLoading(true)
    try {
      const res = await apiRequest(`/track/${encodeURIComponent(trackingId)}`)
      const d = res?.data
      if (d) {
        setTrackingStatus({
          trackingId: d.bookingNumber || trackingId,
          serviceName: d.serviceName,
          step: d.status?.replaceAll('_', ' '),
          eta: d.eta || 'Today',
          partnerName: d.partnerName,
          address: d.address,
        })
      } else {
        setTrackingError('No shipment found with this tracking ID.')
        setTrackingStatus(null)
      }
    } catch {
      setTrackingError('No active shipment found with this ID. Please check and try again.')
      setTrackingStatus(null)
    } finally {
      setTrackingLoading(false)
    }
  }

  const quickActions = homeData?.quickActions || [
    { id: 'ship-now', title: 'Ship Now', subtitle: 'Book a new shipment', icon: 'box', actionTarget: '/courier', badge: 'Fast' },
    { id: 'track-shipment', title: 'Track Shipment', subtitle: 'Track your shipments', icon: 'truck', actionTarget: '#track-order', badge: 'Live' },
    { id: 'find-pincode', title: 'Find Pincode', subtitle: 'Check service availability', icon: 'map-pin', actionTarget: 'PINCODE_MODAL', badge: 'Check' },
    { id: 'help-support', title: 'Help & Support', subtitle: '24/7 assistance', icon: 'headset', actionTarget: 'SUPPORT_MODAL', badge: '24/7' },
  ]

  const promoBanner = homeData?.banner || {
    title: 'Priority. Protection. Performance.',
    subtitle: 'Delivered the Delivez way.',
    buttonText: 'Know More',
    buttonLink: '#services',
  }

  const actionChips = homeData?.chips || [
    { id: 'price-calculator', label: 'Price Calculator', icon: 'calculator', target: '#services' },
    { id: 'schedule-pickup', label: 'Schedule Pickup', icon: 'calendar', target: '/courier' },
    { id: 'delivez-money', label: 'Delivez Money', icon: 'wallet', target: '#wallet' },
    { id: 'best-offers', label: 'Best Offers', icon: 'tag', target: '#services' },
  ]

  return (
    <div className={styles.pageWrapper}>
      {/* ========================================================= */}
      {/* MAIN 3-COLUMN HERO SECTION (MATCHING ref_02.jpeg) */}
      {/* ========================================================= */}
      <section className={styles.mainHomeGridSection}>
        <div className={styles.mainHomeGrid}>
          {/* ----------------- COLUMN 1: LEFT HERO & STATS & RIDER ----------------- */}
          <div className={styles.heroColumnLeft}>
            <div className={styles.heroTextGroup}>
              <h1 className={styles.heroHeading}>
                Personal<br />
                Logistics.<br />
                One App.<br />
                Every Need.
              </h1>
              <p className={styles.heroSubheading}>
                Send. Move. Return. Anytime. Anywhere in India.
              </p>
            </div>

            {/* 3 Metric Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <strong className={styles.statNumber}>25+</strong>
                <span className={styles.statLabel}>Cities</span>
              </div>
              <div className={styles.statBox}>
                <strong className={styles.statNumber}>1000+</strong>
                <span className={styles.statLabel}>Service Locations</span>
              </div>
              <div className={styles.statBox}>
                <strong className={styles.statNumber}>1M+</strong>
                <span className={styles.statLabel}>Happy Customers</span>
              </div>
            </div>

            {/* Courier Rider Card matching reference design */}
            <div className={styles.riderCard}>
              <img
                src="/assets/images/rider_hero_landing.jpg"
                alt="Delivez Courier Delivery Partner"
                className={styles.riderImg}
              />
            </div>
          </div>

          {/* ----------------- COLUMN 2: SERVICES & WHY CHOOSE DELVEZ ----------------- */}
          <div className={styles.centerColumn}>
            {/* Services Section */}
            <div className={styles.servicesHeaderRow}>
              <div>
                <h2 className={styles.sectionTitle}>Our Services</h2>
                <p className={styles.sectionSubtitle}>One app for all your personal logistics needs.</p>
              </div>
              <button
                type="button"
                className={styles.viewAllServicesLink}
                onClick={() => {
                  const el = document.getElementById('services-grid-anchor')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                View All <ArrowRight size={15} />
              </button>
            </div>

            {/* 2-Column Grid of 6 Services */}
            <div id="services-grid-anchor" className={styles.servicesGridTwoCol}>
              {services.slice(0, 6).map((service) => (
                <ServiceCard key={service.title} service={service} onBook={bookService} />
              ))}
            </div>

            {/* Why Choose Delvez One */}
            <div id="why-choose-us" className={styles.whyChooseSection}>
              <h2 className={styles.whyChooseTitle}>Why Choose Delvez One</h2>
              <div className={styles.whyChooseGrid}>
                {whyChooseDelvezOne.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <div key={item.title} className={styles.whyChooseCard}>
                      <div className={styles.whyChooseIconBadge}>
                        <ItemIcon size={18} />
                      </div>
                      <div className={styles.whyChooseContent}>
                        <strong className={styles.whyChooseItemTitle}>{item.title}</strong>
                        <span className={styles.whyChooseItemText}>{item.text}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ----------------- COLUMN 3: AUTH CARD & BADGES ----------------- */}
          <div className={styles.authColumnRight}>
            <div className={styles.authCardSticky}>
              {user ? (
                /* Already Logged In Quick View */
                <div className={styles.userActiveCard}>
                  <div className={styles.userActiveAvatar}>
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <h3 className={styles.userActiveGreeting}>Welcome, {user.fullName?.split(' ')[0] || 'Member'}!</h3>
                  <p className={styles.userActiveSub}>Your personal logistics dashboard is ready.</p>
                  <button
                    type="button"
                    className={styles.sendOtpBtn}
                    onClick={() => navigateTo('/user/dashboard')}
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </button>
                  <button
                    type="button"
                    className={styles.googleAuthBtn}
                    onClick={() => navigateTo('/courier')}
                  >
                    <Truck size={18} /> Book a Delivery
                  </button>
                </div>
              ) : (
                /* Guest Sign-up Form matching ref_02.jpeg */
                <>
                  {/* Stepper (1 Verify Mobile, 2 Basic Details, 3 Account Ready) */}
                  <div className={styles.authStepper}>
                    <div className={styles.stepperItemActive}>
                      <div className={styles.stepCircleActive}>1</div>
                      <span className={styles.stepTextActive}>Verify Mobile</span>
                    </div>
                    <div className={styles.stepperLine} />
                    <div className={styles.stepperItem}>
                      <div className={styles.stepCircle}>2</div>
                      <span className={styles.stepText}>Basic Details<br /><small>(Optional)</small></span>
                    </div>
                    <div className={styles.stepperLine} />
                    <div className={styles.stepperItem}>
                      <div className={styles.stepCircle}>3</div>
                      <span className={styles.stepText}>Account Ready</span>
                    </div>
                  </div>

                  <h3 className={styles.authCardTitle}>Create your account</h3>
                  <p className={styles.authCardSubtitle}>Enter your mobile number to get started.</p>

                  <form onSubmit={handleQuickSendOtp} className={styles.quickAuthForm}>
                    <label htmlFor="quick-mobile-input" className={styles.mobileInputLabel}>
                      Mobile Number
                    </label>
                    <div className={styles.phoneInputGroup}>
                      <div className={styles.flagPicker}>
                        <span className={styles.indiaFlag}>🇮🇳</span>
                        <span className={styles.countryCode}>+91</span>
                        <ChevronDown size={14} />
                      </div>
                      <input
                        id="quick-mobile-input"
                        type="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
                        className={styles.phoneInputBox}
                        required
                      />
                    </div>

                    {quickAuthError && (
                      <p className={styles.quickAuthError}>{quickAuthError}</p>
                    )}

                    <button type="submit" className={styles.sendOtpBtn}>
                      Send OTP
                    </button>

                    <p className={styles.authTermsText}>
                      By continuing, you agree to our{' '}
                      <a href="#terms">Terms & Conditions</a> and{' '}
                      <a href="#privacy">Privacy Policy</a>.
                    </p>

                    <div className={styles.orDivider}>
                      <span>Or continue with</span>
                    </div>

                    <button
                      type="button"
                      className={styles.googleAuthBtn}
                      onClick={() => navigateTo('/login')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <div className={styles.authCardSwitchRow}>
                      <span>Already have an account?</span>{' '}
                      <button
                        type="button"
                        className={styles.authCardSwitchBtn}
                        onClick={() => navigateTo('/login')}
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* 3 Bottom Trust Highlights */}
              <div className={styles.authTrustBlock}>
                <div className={styles.authTrustItem}>
                  <Zap size={22} className={styles.authTrustIcon} />
                  <div>
                    <strong>Quick Sign Up</strong>
                    <small>Get started in seconds</small>
                  </div>
                </div>
                <div className={styles.authTrustItem}>
                  <Lock size={22} className={styles.authTrustIcon} />
                  <div>
                    <strong>Your Data is Safe</strong>
                    <small>We respect your privacy</small>
                  </div>
                </div>
                <div className={styles.authTrustItem}>
                  <Users size={22} className={styles.authTrustIcon} />
                  <div>
                    <strong>Trusted by</strong>
                    <small>1M+ customers</small>
                  </div>
                </div>
              </div>

              {/* Delvez One Bottom Logo */}
              <div className={styles.authCardBrandFooter}>
                <div className={styles.authBrandLogo}>
                  DELVE<span style={{ color: '#ef4444' }}>Z</span> | ONE
                </div>
                <p className={styles.authBrandSlogan}>Personal Logistics. One App. Every Need.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. TOP DYNAMIC LOCATION BAR */}
      {/* ========================================================= */}
      <section className={styles.locationBarSection} aria-label="Current Delivery Location">
        <div className={styles.locationBarInner}>
          <div className={styles.locationBarCard}>
            <div className={styles.locationIconBadge}>
              <MapPin size={20} className={styles.pinIcon} />
            </div>

            <div className={styles.locationTextGroup}>
              <button
                type="button"
                className={styles.locationLabelBtn}
                onClick={() => setLocationPickerOpen(!locationPickerOpen)}
              >
                <span>Deliver to:</span> <strong>{currentLocation.label || 'Home'}</strong>
                <ChevronDown size={15} />
              </button>
              <p className={styles.locationAddressText} title={currentLocation.addressLine}>
                {currentLocation.addressLine}
              </p>
            </div>

            <button
              type="button"
              className={styles.chooseLocationBtn}
              onClick={handleGpsDetect}
              disabled={detectingGps}
              title="Detect your live location via GPS"
            >
              <span>{detectingGps ? 'Detecting…' : 'Choose Location'}</span>
              <div className={styles.targetIconCircle}>
                <Crosshair size={18} />
              </div>
            </button>
          </div>

          {/* Location Presets Picker Dropdown */}
          {locationPickerOpen && (
            <div className={styles.presetsDropdown}>
              <div className={styles.presetsHeader}>
                <strong>Select Delivery Location</strong>
                <button type="button" onClick={() => setLocationPickerOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <button type="button" className={styles.detectGpsOption} onClick={handleGpsDetect}>
                <Crosshair size={17} />
                <span>Use Current Live GPS Location</span>
              </button>
              <div className={styles.presetsList}>
                {locationPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={styles.presetItem}
                    onClick={() => selectLocationPreset(preset)}
                  >
                    <MapPin size={16} />
                    <div>
                      <strong>{preset.label}</strong>
                      <small>{preset.addressLine}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. AI PROMPT & QUICK ACTIONS */}
      {/* ========================================================= */}
      <section className={styles.secondaryFeaturesSection}>
        <div className={styles.secondaryFeaturesInner}>
          {/* AI Natural Language Prompt Input Bar */}
          <form className={styles.aiPromptCard} onSubmit={handlePromptSubmit}>
            <button
              type="button"
              className={styles.sparkleBadge}
              onClick={() => setExamplesModalOpen(true)}
              title="Try these prompt examples"
            >
              <Sparkles size={20} />
            </button>
            <div className={styles.promptInputArea}>
              <div className={styles.promptLabelRow}>
                <label htmlFor="ai-prompt-input" className={styles.promptLabel}>
                  Tell us in your own words...
                </label>
                <button
                  type="button"
                  className={styles.examplesTriggerBtn}
                  onClick={() => setExamplesModalOpen(true)}
                  title="View prompt examples"
                >
                  <Sparkles size={12} />
                  <span>Try examples</span>
                </button>
              </div>
              <input
                id="ai-prompt-input"
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Example: Pick up my laptop from office and deliver home by 8 PM."
                className={styles.promptInput}
              />
            </div>

            <button
              type="button"
              className={styles.micBtn}
              title="Voice prompt"
              onClick={() => alert('Listening for your voice instructions... (speak now)')}
            >
              <Mic size={20} />
            </button>
          </form>

          {/* Quick Actions 4 Cards */}
          <div className={styles.quickActionsGrid}>
            {quickActions.map((action) => {
              const IconComponent = actionIconMap[action.icon] || Package
              return (
                <button
                  key={action.id}
                  type="button"
                  className={styles.quickActionCard}
                  onClick={() => handleQuickActionClick(action)}
                >
                  <div className={styles.actionIconContainer}>
                    <IconComponent size={22} />
                  </div>
                  <div className={styles.actionCardContent}>
                    <strong className={styles.actionCardTitle}>{action.title}</strong>
                    <span className={styles.actionCardSubtitle}>{action.subtitle}</span>
                  </div>
                  {action.badge && <span className={styles.actionCardBadge}>{action.badge}</span>}
                </button>
              )
            })}
          </div>

          {/* Yellow Promo Banner */}
          {promoBanner.isActive !== false && (
            <div className={styles.promoBannerCard}>
              <div className={styles.bannerIconBlock}>
                <Package size={32} className={styles.bannerBoxIcon} />
              </div>
              <div className={styles.bannerTextBlock}>
                <h3>{promoBanner.title}</h3>
                <p>{promoBanner.subtitle}</p>
              </div>
              <button
                type="button"
                className={styles.bannerCtaBtn}
                onClick={() => {
                  if (promoBanner.buttonLink?.startsWith('/')) {
                    navigateTo(promoBanner.buttonLink)
                  } else {
                    setKnowMoreOpen(true)
                  }
                }}
              >
                <span>{promoBanner.buttonText || 'Know More'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Action Chips */}
          <div className={styles.actionChipsRow}>
            {actionChips.map((chip) => {
              const Icon = chipIconMap[chip.icon] || Tag
              return (
                <button
                  key={chip.id}
                  type="button"
                  className={styles.chipPill}
                  onClick={() => {
                    if (chip.target?.startsWith('/')) {
                      navigateTo(chip.target)
                    } else {
                      window.location.hash = chip.target
                    }
                  }}
                >
                  <Icon size={15} />
                  <span>{chip.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. LIVE TRACKING SECTION */}
      {/* ========================================================= */}
      <section id="track-order" className={styles.trackSection}>
        <div className={styles.trackSectionInner}>
          <div className={styles.trackCopy}>
            <p className={styles.kicker}>Live delivery updates</p>
            <h2>Know exactly where your delivery is.</h2>
            <p>Enter your tracking ID to see the latest status, GPS telemetry, and estimated arrival time.</p>
          </div>
          <form className={styles.trackForm} onSubmit={trackOrder}>
            <label htmlFor="tracking-id">Tracking ID / Vault ID</label>
            <div className={styles.trackInputRow}>
              <MapPinned size={20} className={styles.trackPinIcon} />
              <input
                id="tracking-id"
                name="trackingId"
                placeholder="e.g. DZ789456123 or DLVZ2505128947"
                required
              />
              <button type="submit" disabled={trackingLoading} className={styles.trackSubmitBtn}>
                {trackingLoading ? 'Searching…' : 'Track'} <ArrowRight size={17} />
              </button>
            </div>
            {trackingError && (
              <div className={styles.trackResultError} role="alert">
                <strong>{trackingError}</strong>
              </div>
            )}
            {trackingStatus && (
              <div className={styles.trackResultCard} role="status">
                <span>
                  Order {trackingStatus.trackingId} • {trackingStatus.serviceName}
                </span>
                <strong>{trackingStatus.step}</strong>
                <small>
                  Estimated arrival: {trackingStatus.eta}{' '}
                  {trackingStatus.partnerName ? `• Courier: ${trackingStatus.partnerName}` : ''}
                </small>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. DOWNLOAD APP SECTION */}
      {/* ========================================================= */}
      <section id="download-app" className={styles.downloadSection}>
        <div className={styles.downloadInner}>
          <div className={styles.phoneBadge}>
            <Smartphone size={36} />
          </div>
          <div className={styles.downloadCopy}>
            <p className={styles.kicker}>Deliveries in your pocket</p>
            <h2>Download the Delivez One app</h2>
            <p>Book, pay, and track deliveries from anywhere across India.</p>
          </div>
          <div className={styles.storeButtons}>
            <a href="https://play.google.com" target="_blank" rel="noreferrer" className={styles.storeBtn}>
              <small>GET IT ON</small>
              <strong>Google Play</strong>
            </a>
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" className={styles.storeBtn}>
              <small>DOWNLOAD ON THE</small>
              <strong>App Store</strong>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODALS (Pincode, Support, Know More, Examples) */}
      {/* ========================================================= */}
      {pincodeModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setPincodeModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <MapPin size={22} className={styles.modalHeaderIcon} />
                <h3>Check Pincode Serviceability</h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setPincodeModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <p className={styles.modalIntro}>
              Enter your 6-digit postal code to check instant delivery availability and turnaround time.
            </p>
            <form onSubmit={handleCheckPincodeSubmit} className={styles.pincodeForm}>
              <div className={styles.pincodeInputRow}>
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode (e.g. 560001)"
                  className={styles.pincodeInputBox}
                  autoFocus
                />
                <button type="submit" disabled={pincodeChecking || pincodeInput.length !== 6} className={styles.pincodeCheckBtn}>
                  {pincodeChecking ? 'Checking…' : 'Check'}
                </button>
              </div>
            </form>
            {pincodeResult && (
              <div className={styles.pincodeResultCard}>
                <div className={styles.pincodeResultTop}>
                  <CheckCircle2 size={24} className={styles.successIcon} />
                  <div>
                    <strong>Pincode {pincodeResult.pincode}: Serviceable</strong>
                    <p>{pincodeResult.city}, {pincodeResult.state}</p>
                  </div>
                </div>
                <div className={styles.pincodeResultGrid}>
                  <div>
                    <small>Estimated Speed</small>
                    <strong>{pincodeResult.estimatedDelivery || 'Same Day Express'}</strong>
                  </div>
                  <div>
                    <small>Cash on Delivery</small>
                    <strong>{pincodeResult.codAvailable ? 'Available' : 'Prepaid Only'}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.bookNowBtn}
                  onClick={() => {
                    setPincodeModalOpen(false)
                    navigateTo('/courier')
                  }}
                >
                  Book Delivery Now <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {supportModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setSupportModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <Headphones size={22} className={styles.modalHeaderIcon} />
                <h3>24/7 Help & Support</h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setSupportModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.supportChannelsGrid}>
              <a href={`tel:${homeData?.support?.helpline || '+9118003354839'}`} className={styles.supportChannelCard}>
                <PhoneCall size={22} />
                <div>
                  <small>Toll Free Helpline</small>
                  <strong>{homeData?.support?.helpline || '+91 1800-DELVEZ-SOS'}</strong>
                </div>
              </a>
              <a
                href={`https://wa.me/${(homeData?.support?.whatsapp || '+919876543210').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className={styles.supportChannelCard}
              >
                <MessageSquare size={22} />
                <div>
                  <small>WhatsApp Support</small>
                  <strong>Chat with an Agent</strong>
                </div>
              </a>
              <a href={`mailto:${homeData?.support?.email || 'support@delivez.com'}`} className={styles.supportChannelCard}>
                <Mail size={22} />
                <div>
                  <small>Email Helpdesk</small>
                  <strong>{homeData?.support?.email || 'support@delivez.com'}</strong>
                </div>
              </a>
            </div>
            {supportInquirySent ? (
              <div className={styles.supportSuccessCard}>
                <CheckCircle2 size={32} className={styles.successIcon} />
                <h4>Inquiry Submitted</h4>
                <p>Thank you. Our dedicated support team will reach out to you within 15 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className={styles.supportForm}>
                <h4>Need quick assistance? Leave a message:</h4>
                <input name="name" placeholder="Your Name" defaultValue={user?.fullName || ''} required />
                <input name="mobileNumber" placeholder="Mobile Number" defaultValue={user?.mobileNumber || ''} required />
                <textarea name="message" rows={3} placeholder="How can we assist you today?" required />
                <button type="submit" disabled={supportFormLoading} className={styles.supportSubmitBtn}>
                  {supportFormLoading ? 'Sending…' : 'Submit Assistance Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {knowMoreOpen && (
        <div className={styles.modalOverlay} onClick={() => setKnowMoreOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <Info size={22} className={styles.modalHeaderIcon} />
                <h3>Delivez One — Know More</h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setKnowMoreOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <p className={styles.modalIntro}>
              Explore our full range of tailored logistics, enterprise solutions, and 24/7 dedicated support.
            </p>
            <div className={styles.knowMoreList}>
              <div className={styles.knowMoreItem}>
                <strong>Custom Enterprise Logistics</strong>
                <p>High-volume recurring pickups and scheduled B2B distributions with dedicated account managers.</p>
              </div>
              <div className={styles.knowMoreItem}>
                <strong>Delivez Vault (Confidential Delivery)</strong>
                <p>Armed executive escorts, tamper-evident seals, and zero-compromise security for sensitive documents.</p>
              </div>
              <div className={styles.knowMoreItem}>
                <strong>Special Occasions & Care Deliveries</strong>
                <p>White-glove handover of gifts, birthday treats, and delicate hand-wrapped packages.</p>
              </div>
            </div>
            <button type="button" className={styles.bookNowBtn} onClick={() => setKnowMoreOpen(false)}>
              Back to Home
            </button>
          </div>
        </div>
      )}

      {examplesModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setExamplesModalOpen(false)}>
          <div className={styles.examplesModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.examplesModalHeader}>
              <div className={styles.examplesModalTitleGroup}>
                <Sparkles size={22} className={styles.examplesSparkleIcon} />
                <h3>Try these examples</h3>
              </div>
            </div>
            <div className={styles.examplesGrid}>
              {(promptExamples.length > 0 ? promptExamples : DEFAULT_PROMPT_EXAMPLES).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.exampleCard}
                  onClick={() => handleSelectExample(item)}
                >
                  <span className={styles.exampleCardText}>
                    {item.shortText || (item.title.length > 38 ? item.title.slice(0, 35) + '...' : item.title)}
                  </span>
                </button>
              ))}
            </div>
            <div className={styles.examplesModalFooter}>
              <button
                type="button"
                className={styles.examplesCloseBtn}
                onClick={() => setExamplesModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
