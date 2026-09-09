import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Crosshair,
  FileText,
  Gift,
  Headphones,
  IndianRupee,
  Info,
  Key,
  Laptop,
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
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tag,
  Truck,
  Wallet,
  X,
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
import { getStoredUser } from '@/features/auth/services/userAuthService.js'

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
}

const trustItems = [
  { title: 'Safe & Secure', text: 'Your safety is our priority', icon: ShieldCheck },
  { title: 'Fast Delivery', text: 'Quick pickups and on-time deliveries', icon: Clock3 },
  { title: 'Affordable Pricing', text: 'Best rates for every delivery', icon: IndianRupee },
  { title: '24/7 Support', text: 'We are here to help anytime', icon: Headphones },
  { title: 'Real-time Tracking', text: 'Follow your order every step', icon: MapPinned },
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

    // 1. Fetch live services
    fetchPublicServices()
      .then((items) => active && setServiceCatalog({ items: mergeServiceCatalog(items), error: '' }))
      .catch(() => active && setServiceCatalog({ items: SERVICE_CATALOG, error: 'Live service catalog fallback.' }))

    // 2. Fetch master home data (Location, Hero, Quick Actions, Banner, Chips, Support, Prompt Examples)
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

    // Fallback/Direct prompt examples fetch
    fetchPromptExamples().then((items) => {
      if (active && items && items.length > 0) {
        setPromptExamples(items)
      }
    })

    // 3. Proactively get high-accuracy current location from device GPS
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (!active) return
          const detected = await detectGpsLocation(pos.coords.latitude, pos.coords.longitude)
          if (detected && active) {
            setCurrentLocation(detected)
          }
        },
        () => {
          // Keep network IP-detected location if GPS permission not granted
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 120000 },
      )
    }

    return () => {
      active = false
    }
  }, [])

  const services = useMemo(
    () =>
      serviceCatalog.items.map((service, index) => ({
        number: String(index + 1).padStart(2, '0'),
        title: service.name,
        description: service.shortDescription,
        imageUrl: service.imageUrl,
        slug: service.slug,
        available: true,
        icon: servicePresentation[service.slug]?.icon ?? PackageCheck,
        tint: servicePresentation[service.slug]?.tint ?? '#f5f7f9',
        accent: servicePresentation[service.slug]?.accent ?? '#52606d',
      })),
    [serviceCatalog.items],
  )

  const bookService = (service) => {
    if (service.slug === 'confidential-delivery' || service.slug === 'confidential-courier') {
      navigateTo('/book/confidential-delivery')
    } else if (
      service.slug === 'luggage-delivery' ||
      service.slug === 'airport-luggage' ||
      service.slug === 'courier-delivery' ||
      service.slug === 'personal-courier'
    ) {
      navigateTo('/courier')
    } else if (service.slug === 'know-more' || service.slug === 'gift-delivery') {
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
          // Fallback to IP detected current location
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

  const renderExampleIcon = (item) => {
    if (item.hasCustomImage && item.imageUrl) {
      return <img src={item.imageUrl} alt={item.title} className={styles.exampleCardCustomImage} />
    }
    const color = item.iconColor || '#d97706'
    switch (item.icon?.toLowerCase()) {
      case 'laptop':
        return <Laptop size={22} style={{ color }} />
      case 'luggage':
      case 'suitcase':
        return <Luggage size={22} style={{ color }} />
      case 'file-text':
      case 'document':
      case 'documents':
        return <FileText size={22} style={{ color }} />
      case 'gift':
        return <Gift size={22} style={{ color }} />
      case 'hanger':
      case 'clothing':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3c0 1.3.8 2.4 2 2.8V9L3.5 16A2 2 0 0 0 5 19h14a2 2 0 0 0 1.5-3L13 9V7.8A3 3 0 0 0 12 2z"/>
          </svg>
        )
      case 'key':
      case 'keys':
        return <Key size={22} style={{ color }} />
      default:
        return <Sparkles size={20} style={{ color }} />
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
    if (trackingId.startsWith('DV-') || trackingId.includes('VAULT')) {
      navigateTo(`/vault/track/${trackingId}`)
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

  const hero = homeData?.hero || {
    greetingPrefix: 'Hi',
    defaultName: 'Arjun',
    greetingEmoji: '👋',
    headline: 'What do you need delivered today?',
    highlightWord: 'delivered',
    subtitle: 'AI will take care of the rest.',
    searchTitle: 'Tell us in your own words... ?',
    searchPlaceholder: 'Example: Pick up my laptop from office and deliver home by 8 PM.',
    sideImageUrl: 'http://localhost:4000/api/v1/home/hero/image',
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

  // Render hero headline with highlighted word
  const renderHeadline = () => {
    const text = hero.headline || 'What do you need delivered today?'
    const highlight = hero.highlightWord || 'delivered'
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className={styles.highlightText}>
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  return (
    <>
      {/* 1. Top Dynamic Location Bar (Matching Mobile Screenshot 2) */}
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

      {/* 2. Dynamic Hero Section (Matching Mobile Screenshot 2) */}
      <section id="home" className={styles.dynamicHero}>
        <div className={styles.dynamicHeroInner}>
          <div className={styles.heroContentLeft}>
            <div className={styles.userGreeting}>
              {hero.greetingPrefix || 'Hi'}, {user?.fullName?.split(' ')[0] || hero.defaultName || 'Arjun'}{' '}
              {hero.greetingEmoji || '👋'}
            </div>

            <h1 className={styles.dynamicHeroTitle}>{renderHeadline()}</h1>

            <p className={styles.dynamicHeroSubtitle}>{hero.subtitle}</p>

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
                    {hero.searchTitle || 'Tell us in your own words...'}
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
                  placeholder={hero.searchPlaceholder || 'Example: Pick up my laptop from office and deliver home by 8 PM.'}
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
          </div>

          {/* Side Image / Golden Mascot (from Backend /api/v1/home/hero/image) */}
          <div className={styles.heroMascotCol}>
            <div className={styles.mascotGlow} />
            <img
              src={hero.sideImageUrl || 'http://localhost:4000/api/v1/home/hero/image'}
              alt="Delivez AI Delivery Mascot"
              className={styles.mascotImg}
              onError={(e) => {
                e.currentTarget.src = 'http://localhost:4000/api/v1/home/hero/image'
              }}
            />
          </div>

          {/* Desktop Booking Calculator / Direct Form */}
          <div className={styles.desktopBookingCol}>
            <BookingForm />
          </div>
        </div>
      </section>

      {/* 3. Our Services Section with "View All ->" */}
      <section id="services" className={styles.servicesSection}>
        <div className={styles.sectionHeadingHeader}>
          <h2>Our Services</h2>
          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={() => {
              const grid = document.querySelector(`.${styles.servicesGrid}`)
              if (grid) grid.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            View All <ArrowRight size={15} />
          </button>
        </div>
        <div className={styles.servicesGrid}>
          {services.map((service) => (
            <ServiceCard key={service.title} service={service} onBook={bookService} />
          ))}
        </div>
        {serviceCatalog.error && (
          <p className={styles.catalogNotice} role="status">
            {serviceCatalog.error} Showing the latest known service catalog.
          </p>
        )}
      </section>

      {/* 4. Dynamic 4 Quick Action Cards (Ship Now, Track Shipment, Find Pincode, Help & Support - Screenshot 1) */}
      <section className={styles.quickActionsSection} aria-label="Quick Actions">
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
                  {action.imageUrl ? (
                    <img src={action.imageUrl} alt={action.title} className={styles.actionCustomImg} />
                  ) : (
                    <IconComponent size={24} />
                  )}
                </div>
                <strong className={styles.actionCardTitle}>{action.title}</strong>
                <span className={styles.actionCardSubtitle}>{action.subtitle}</span>
                {action.badge && <span className={styles.actionCardBadge}>{action.badge}</span>}
              </button>
            )
          })}
        </div>
      </section>

      {/* 5. Yellow Promo Banner (Matching Mobile Screenshot 1) */}
      {promoBanner.isActive !== false && (
        <section className={styles.promoBannerSection}>
          <div
            className={styles.promoBannerCard}
            style={{
              ...(promoBanner.backgroundColor ? { background: promoBanner.backgroundColor } : {}),
              ...(promoBanner.textColor ? { color: promoBanner.textColor } : {}),
            }}
          >
            <div className={styles.bannerIconBlock}>
              {promoBanner.imageUrl ? (
                <img
                  src={promoBanner.imageUrl}
                  alt={promoBanner.title || 'Promo'}
                  className={styles.bannerCustomImage}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <Package size={34} className={styles.bannerBoxIcon} />
              )}
            </div>
            <div className={styles.bannerTextBlock}>
              <h3 style={promoBanner.textColor ? { color: promoBanner.textColor } : {}}>
                {promoBanner.title}
              </h3>
              <p style={promoBanner.textColor ? { color: promoBanner.textColor, opacity: 0.9 } : {}}>
                {promoBanner.subtitle}
              </p>
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
        </section>
      )}

      {/* 6. Secondary Quick Action Chips (Matching Mobile Screenshot 1) */}
      <section className={styles.actionChipsSection}>
        <div className={styles.chipsScrollRow}>
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
                <div className={styles.chipIconDot}>
                  <Icon size={16} />
                </div>
                <span>{chip.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 7. Trust Bar */}
      <section className={styles.trustBar} aria-label="Why choose Delivez One">
        {trustItems.map(({ title, text, icon: Icon }) => (
          <div key={title} className={styles.trustItem}>
            <span>
              <Icon size={29} />
            </span>
            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
          </div>
        ))}
      </section>

      {/* 8. Live Tracking Section */}
      <section id="track-order" className={styles.trackSection}>
        <div className={styles.trackCopy}>
          <p className={styles.kicker}>Live delivery updates</p>
          <h2>Know exactly where your delivery is.</h2>
          <p>Enter your tracking ID to see the latest status, GPS telemetry, and estimated arrival time.</p>
        </div>
        <form className={styles.trackForm} onSubmit={trackOrder}>
          <label htmlFor="tracking-id">Tracking ID / Vault ID</label>
          <div>
            <MapPinned size={21} />
            <input id="tracking-id" name="trackingId" placeholder="e.g. DV-250811-8F7X or DLVZ2505128947" required />
            <button type="submit" disabled={trackingLoading}>
              {trackingLoading ? 'Searching…' : 'Track'} <ArrowRight size={18} />
            </button>
          </div>
          {trackingError && (
            <div className={styles.trackResult} style={{ background: '#fef2f2', color: '#b91c1c' }} role="alert">
              <strong>{trackingError}</strong>
            </div>
          )}
          {trackingStatus && (
            <div className={styles.trackResult} role="status">
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
      </section>

      {/* 9. Download App Section */}
      <section id="download-app" className={styles.downloadSection}>
        <div className={styles.phoneBadge}>
          <Smartphone size={36} />
        </div>
        <div>
          <p className={styles.kicker}>Deliveries in your pocket</p>
          <h2>Download the Delivez One app</h2>
          <p>Book, pay, and track deliveries from anywhere.</p>
        </div>
        <div className={styles.storeButtons}>
          <a href="https://play.google.com" target="_blank" rel="noreferrer">
            <small>GET IT ON</small>
            <strong>Google Play</strong>
          </a>
          <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">
            <small>DOWNLOAD ON THE</small>
            <strong>App Store</strong>
          </a>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* Modal 1: Find Pincode Serviceability */}
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

      {/* Modal 2: 24/7 Help & Support */}
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
                  <strong>{homeData?.support?.helpline || '+91 1800-DELIVEZ-SOS'}</strong>
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

      {/* Modal 3: Know More Services Modal */}
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

      {/* Modal 4: Try These Examples Modal (Matching Mobile Screenshot) */}
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
                  <div className={styles.exampleIconBox}>
                    {renderExampleIcon(item)}
                  </div>
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
    </>
  )
}


export default HomePage
