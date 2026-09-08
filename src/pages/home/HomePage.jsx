import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  FileLock2,
  Gift,
  Headphones,
  IndianRupee,
  Info,
  Luggage,
  MapPinned,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
  X,
} from 'lucide-react'
import deliveryHero from '@/assets/images/delivery-hero-v2.png'
import ServiceCard from '@/components/cards/ServiceCard/ServiceCard.jsx'
import BookingForm from '@/features/booking/components/BookingForm.jsx'
import styles from './HomePage.module.css'
import { navigateTo } from '@/app/router/navigation.js'
import { apiRequest } from '@/services/api/apiClient.js'
import { fetchPublicServices } from '@/features/services/services/publicServicesService.js'
import { mergeServiceCatalog, SERVICE_CATALOG } from '@/features/services/serviceCatalog.js'

const highlights = [
  { title: '100% Safe', subtitle: '& Secure', icon: ShieldCheck, color: '#f4a900' },
  { title: 'On-Time', subtitle: 'Delivery', icon: Clock3, color: '#e63b3b' },
  { title: '24/7', subtitle: 'Support', icon: Headphones, color: '#238b57' },
  { title: 'Affordable', subtitle: 'Pricing', icon: IndianRupee, color: '#7048b8' },
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

function HomePage() {
  const [serviceCatalog, setServiceCatalog] = useState({ items: SERVICE_CATALOG, error: '' })
  const [trackingStatus, setTrackingStatus] = useState(null)
  const [knowMoreOpen, setKnowMoreOpen] = useState(false)

  useEffect(() => {
    let active = true
    fetchPublicServices()
      .then((items) => active && setServiceCatalog({ items: mergeServiceCatalog(items), error: '' }))
      .catch(() => active && setServiceCatalog({ items: SERVICE_CATALOG, error: 'Live service availability could not be refreshed.' }))
    return () => { active = false }
  }, [])

  const services = useMemo(() => serviceCatalog.items.map((service, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: service.name,
    description: service.shortDescription,
    imageUrl: service.imageUrl,
    slug: service.slug,
    available: true,
    icon: servicePresentation[service.slug]?.icon ?? PackageCheck,
    tint: servicePresentation[service.slug]?.tint ?? '#f5f7f9',
    accent: servicePresentation[service.slug]?.accent ?? '#52606d',
  })), [serviceCatalog.items])

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

  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState('')

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

  return (
    <>
      <section id="home" className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1>Anything.<br />Anytime.<br />Anywhere.<br /><span>Delivez One.</span></h1>
            <span className={styles.underline} aria-hidden="true" />
            <p className={styles.intro}>Your trusted partner for all your personal delivery needs.</p>
            <div className={styles.highlights}>
              {highlights.map(({ title, subtitle, icon: Icon, color }) => (
                <div key={title} className={styles.highlight} style={{ '--highlight-color': color }}>
                  <span><Icon size={25} /></span><strong>{title}</strong><small>{subtitle}</small>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.cityGlow} />
            <img src={deliveryHero} alt="Yellow delivery scooter and mobile route tracking" />
          </div>

          <BookingForm />
        </div>
      </section>

      <section id="services" className={styles.servicesSection}>
        <div className={styles.sectionHeading}>
          <span /><div><p>Everything you need</p><h2>Our Services</h2></div><span />
        </div>
        <div className={styles.servicesGrid}>
          {services.map((service) => <ServiceCard key={service.title} service={service} onBook={bookService} />)}
        </div>
        {serviceCatalog.error && <p className={styles.catalogNotice} role="status">{serviceCatalog.error} Showing the last known service catalog.</p>}
      </section>

      <section className={styles.trustBar} aria-label="Why choose Delivez One">
        {trustItems.map(({ title, text, icon: Icon }) => (
          <div key={title} className={styles.trustItem}>
            <span><Icon size={29} /></span><div><strong>{title}</strong><small>{text}</small></div>
          </div>
        ))}
      </section>

      <section id="track-order" className={styles.trackSection}>
        <div className={styles.trackCopy}>
          <p className={styles.kicker}>Live delivery updates</p>
          <h2>Know exactly where your delivery is.</h2>
          <p>Enter your tracking ID to see the latest status and estimated arrival time.</p>
        </div>
        <form className={styles.trackForm} onSubmit={trackOrder}>
          <label htmlFor="tracking-id">Tracking ID / Vault ID</label>
          <div>
            <MapPinned size={21} />
            <input id="tracking-id" name="trackingId" placeholder="e.g. DV-250811-8F7X or DLV-20841" required />
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
              <span>Order {trackingStatus.trackingId} • {trackingStatus.serviceName}</span>
              <strong>{trackingStatus.step}</strong>
              <small>Estimated arrival: {trackingStatus.eta} {trackingStatus.partnerName ? `• Courier: ${trackingStatus.partnerName}` : ''}</small>
            </div>
          )}
        </form>
      </section>

      <section id="download-app" className={styles.downloadSection}>
        <div className={styles.phoneBadge}><Smartphone size={36} /></div>
        <div>
          <p className={styles.kicker}>Deliveries in your pocket</p>
          <h2>Download the Delivez One app</h2>
          <p>Book, pay, and track deliveries from anywhere.</p>
        </div>
        <div className={styles.storeButtons}>
          <a href="https://play.google.com" target="_blank" rel="noreferrer"><small>GET IT ON</small><strong>Google Play</strong></a>
          <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer"><small>DOWNLOAD ON THE</small><strong>App Store</strong></a>
        </div>
      </section>

      {/* Know More Interactive Modal */}
      {knowMoreOpen && (
        <div className={styles.knowMoreOverlay} onClick={() => setKnowMoreOpen(false)}>
          <div className={styles.knowMoreModal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.knowMoreClose}
              onClick={() => setKnowMoreOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className={styles.knowMoreKicker}>
              <Sparkles size={14} />
              <span>Delivez ONE Ecosystem</span>
            </div>

            <h2 className={styles.knowMoreTitle}>Know More About Delivez One</h2>
            <p className={styles.knowMoreSubtitle}>
              On-demand, hyper-local, and specialized logistics built for speed, safety, and confidentiality.
            </p>

            <div className={styles.knowMoreServicesList}>
              <div className={styles.knowMoreServiceItem}>
                <div className={styles.knowMoreServiceIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <ShieldCheck size={20} />
                </div>
                <div className={styles.knowMoreServiceInfo}>
                  <strong>Delivez Vault (Confidential Delivery)</strong>
                  <p>Bank-grade encrypted custody, tamper-evident packaging, and high-security document transit.</p>
                </div>
              </div>

              <div className={styles.knowMoreServiceItem}>
                <div className={styles.knowMoreServiceIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <Truck size={20} />
                </div>
                <div className={styles.knowMoreServiceInfo}>
                  <strong>Courier Delivery</strong>
                  <p>Rapid city-wide point-to-point dispatch for everyday parcels, packages, and documents.</p>
                </div>
              </div>

              <div className={styles.knowMoreServiceItem}>
                <div className={styles.knowMoreServiceIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                  <Luggage size={20} />
                </div>
                <div className={styles.knowMoreServiceInfo}>
                  <strong>Luggage Delivery</strong>
                  <p>Airport pickups, hotel baggage transfers, and luggage deliveries without having to wait.</p>
                </div>
              </div>

              <div className={styles.knowMoreServiceItem}>
                <div className={styles.knowMoreServiceIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <ShoppingBag size={20} />
                </div>
                <div className={styles.knowMoreServiceInfo}>
                  <strong>Delivez Fetch (Forgot Something?)</strong>
                  <p>Left your charger, keys, or medicines behind? We pick them up and bring them straight to you.</p>
                </div>
              </div>

              <div className={styles.knowMoreServiceItem}>
                <div className={styles.knowMoreServiceIcon} style={{ background: '#ffedd5', color: '#ea580c' }}>
                  <RotateCcw size={20} />
                </div>
                <div className={styles.knowMoreServiceInfo}>
                  <strong>Delivez Back (Return Pickup)</strong>
                  <p>Fast doorstep pickups for e-commerce return parcels, retail exchanges, and personal returns.</p>
                </div>
              </div>
            </div>

            <div className={styles.knowMoreEnterpriseBox}>
              <strong>Enterprise & Custom Business Logistics</strong>
              <p>
                Need scheduled daily routes, dedicated corporate couriers, or bulk consignment rates?
                Our enterprise logistics team provides dedicated account managers and GST invoicing.
              </p>
            </div>

            <div className={styles.knowMoreFooterActions}>
              <button
                type="button"
                className={styles.knowMorePrimaryBtn}
                onClick={() => {
                  setKnowMoreOpen(false)
                  const el = document.getElementById('services')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span>Explore Services</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className={styles.knowMoreSecondaryBtn}
                onClick={() => {
                  setKnowMoreOpen(false)
                  const el = document.getElementById('support')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HomePage
