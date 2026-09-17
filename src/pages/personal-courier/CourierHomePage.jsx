import React, { useState } from 'react'
import {
  Bike,
  Truck,
  FileText,
  Package,
  Zap,
  Rocket,
  Search,
  MapPin,
  Bell,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Calendar,
  Clock,
  ShieldCheck,
  Headphones,
  Navigation,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import CourierTrackingView from './components/CourierTrackingView.jsx'
import styles from './CourierHomePage.module.css'

export default function CourierHomePage({ onBookCourier, onSelectService, onTrackShipment }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [quickTrackId, setQuickTrackId] = useState('')
  const [activeTrackingId, setActiveTrackingId] = useState(null)

  const handleStartBooking = (serviceTitle = 'Local Delivery') => {
    if (onSelectService) {
      onSelectService(serviceTitle)
    } else {
      navigateTo(`/book/personal-courier?service=${encodeURIComponent(serviceTitle)}`)
    }
  }

  const handleTrack = (trackingNumber) => {
    const cleanId = trackingNumber.replace('#', '').trim()
    if (onTrackShipment) {
      onTrackShipment(cleanId)
    } else {
      setActiveTrackingId(cleanId)
    }
  }

  const handleQuickTrackSubmit = (e) => {
    e.preventDefault()
    if (!quickTrackId.trim()) return
    handleTrack(quickTrackId.trim())
  }

  const services = [
    {
      id: 'local',
      title: 'Local Delivery',
      sub: 'Within the city',
      icon: Bike,
      iconColor: '#fab800',
      bgColor: '#fffdf5'
    },
    {
      id: 'intercity',
      title: 'Intercity',
      sub: 'Across India',
      icon: Truck,
      iconColor: '#fab800',
      bgColor: '#fffdf5'
    },
    {
      id: 'documents',
      title: 'Documents',
      sub: 'Papers & files',
      icon: FileText,
      iconColor: '#fab800',
      bgColor: '#fffdf5'
    },
    {
      id: 'parcel',
      title: 'Parcel',
      sub: 'Boxes & items',
      icon: Package,
      iconColor: '#fab800',
      bgColor: '#fffdf5'
    },
    {
      id: 'sameday',
      title: 'Same Day',
      sub: 'Delivered today',
      icon: Zap,
      iconColor: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      id: 'express',
      title: 'Express',
      sub: 'Next business day',
      icon: Rocket,
      iconColor: '#4B5563',
      bgColor: '#F3F4F6'
    }
  ]

  const recentShipments = [
    {
      trackingNumber: '#DLZ78291',
      statusLabel: 'Out for Delivery',
      isOutForDelivery: true,
      route: 'Mumbai, MH → Pune, MH',
      date: 'May 18, 2025 • by 10:30 AM',
      etaText: 'Today, 10:30 AM',
      isDocument: false,
      progressPercent: 85
    },
    {
      trackingNumber: '#DLZ78110',
      statusLabel: 'In Transit',
      isOutForDelivery: false,
      route: 'Bengaluru, KA → Hyderabad, TG',
      date: 'May 17, 2025 • by 02:15 PM',
      etaText: 'Tomorrow, 02:15 PM',
      isDocument: true,
      progressPercent: 55
    }
  ]

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
      {/* 1. Header (Logo, Deliver To, Search, Notifications, Profile) */}
      <header className={styles.topHeader}>
        <div className={styles.headerInner}>
          <div className={styles.brandRow}>
            {/* Brand Logo */}
            <div className={styles.brandLogo} onClick={() => navigateTo('/')}>
              <div className={styles.brandDashes}>
                <div className={styles.dash} />
                <div className={styles.dash} style={{ width: 10 }} />
              </div>
              <div className={styles.brandTextWrap}>
                <span className={styles.brandName}>DELIVEZ</span>
                <span className={styles.brandSub}>COURIER</span>
              </div>
            </div>

            {/* Desktop Center Utility Bar: Deliver to & Search */}
            <div className={styles.desktopCenterBar}>
              <div className={styles.locationBar} title="Change delivery location">
                <MapPin size={18} className={styles.iconRed} />
                <div className={styles.locationText}>
                  <small>Deliver to</small>
                  <span className={styles.locName}>
                    221B Baker Street, Marylebone
                    <ChevronDown size={14} />
                  </span>
                </div>
              </div>

              <div className={styles.searchBar}>
                <Search size={17} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search courier services, tracking, or locations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Header Right */}
            <div className={styles.headerRight}>
              <button
                type="button"
                className={styles.dashboardLinkBtn}
                onClick={() => navigateTo('/user/dashboard')}
              >
                Dashboard
              </button>

              <button
                type="button"
                className={styles.notifBtn}
                aria-label="Notifications"
                onClick={() => navigateTo('/user/dashboard')}
              >
                <Bell size={20} />
                <span className={styles.notifBadge}>3</span>
              </button>

              <div
                className={styles.avatarWrap}
                onClick={() => navigateTo('/user/dashboard')}
                title="Account Profile"
              >
                <div className={styles.avatar}>
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                    alt="User Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile sub-bar */}
          <div className={styles.mobileSubBar}>
            <div className={styles.locationBar}>
              <MapPin size={16} className={styles.iconRed} />
              <div className={styles.locationText}>
                <small>Deliver to</small>
                <span className={styles.locName}>
                  221B Baker Street, Marylebone
                  <ChevronDown size={14} />
                </span>
              </div>
            </div>

            <div className={styles.searchBar}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search services or tracking"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.bodyContent}>
        {/* 2. Hero Banner Card */}
        <section className={styles.heroBanner}>
          <div className={styles.heroCopy}>
            <h2>
              Send Anything, <br />
              <span className={styles.heroAnywhere}>Anywhere</span>
            </h2>
            <p>
              Fast, reliable & secure deliveries across the city and beyond with real-time GPS tracking and tamper-proof handling.
            </p>

            <div className={styles.heroTrustPills}>
              <span className={styles.trustPill}>
                <ShieldCheck size={14} color="#D97706" />
                Verified Couriers
              </span>
              <span className={styles.trustPill}>
                <Clock size={14} color="#D97706" />
                Instant Pickup in 45 Mins
              </span>
              <span className={styles.trustPill}>
                <Zap size={14} color="#D97706" />
                Live GPS Routing
              </span>
            </div>

            <button
              type="button"
              className={styles.bookBtn}
              onClick={() => handleStartBooking('Local Delivery')}
            >
              <span>Book Courier</span>
              <div className={styles.btnArrowCircle}>
                <ArrowRight size={14} />
              </div>
            </button>
          </div>

          <div className={styles.heroIllustration}>
            <svg
              className={styles.bikeSvg}
              viewBox="0 0 200 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Decorative Scooter Delivery Illustration */}
              <circle cx="50" cy="105" r="24" stroke="#0F172A" strokeWidth="8" fill="#FFFFFF" />
              <circle cx="50" cy="105" r="8" fill="#fab800" />
              <circle cx="155" cy="105" r="24" stroke="#0F172A" strokeWidth="8" fill="#FFFFFF" />
              <circle cx="155" cy="105" r="8" fill="#fab800" />
              <path d="M50 105 L80 105 L105 75 L145 75 L155 105" stroke="#0F172A" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M100 75 L125 35 L140 35" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
              {/* Delivery Box */}
              <rect x="52" y="42" width="46" height="38" rx="6" fill="#fab800" stroke="#0F172A" strokeWidth="5" />
              <path d="M52 58 L98 58" stroke="#0F172A" strokeWidth="4" />
              <path d="M75 42 L75 80" stroke="#0F172A" strokeWidth="3" strokeDasharray="4 2" />
              {/* Headlight & Seat */}
              <path d="M125 45 C125 45 132 42 136 48" stroke="#fab800" strokeWidth="7" strokeLinecap="round" />
              <polygon points="144,32 155,30 152,38" fill="#fab800" />
            </svg>
          </div>
        </section>

        {/* 3. Two-Column Desktop / Responsive Layout */}
        <div className={styles.desktopMainGrid}>
          {/* Left Column: Services Grid & How It Works */}
          <div className={styles.servicesColumn}>
            <div className={styles.sectionHeader}>
              <div>
                <h3>Our Courier Services</h3>
                <p>Select a courier category to begin your doorstep booking</p>
              </div>
              <button
                type="button"
                className={styles.exploreAllBtn}
                onClick={() => handleStartBooking('Local Delivery')}
              >
                View all services →
              </button>
            </div>

            {/* Grid of 6 Services */}
            <div className={styles.servicesGrid}>
              {services.map((item) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={item.id}
                    className={styles.serviceTile}
                    onClick={() => handleStartBooking(item.title)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.tileTop}>
                      <div
                        className={styles.tileIcon}
                        style={{ backgroundColor: item.bgColor, color: item.iconColor }}
                      >
                        <IconComponent size={22} />
                      </div>
                      <span className={styles.chevron}>›</span>
                    </div>

                    <div className={styles.tileBottom}>
                      <strong>{item.title}</strong>
                      <p>{item.sub}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Feature Benefits Bar */}
            <div className={styles.featureBenefitsBar}>
              <div className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>Insured Transit</strong>
                  <p>Up to ₹50,000 coverage against theft, tampering, and physical damage.</p>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <Zap size={20} />
                </div>
                <div>
                  <strong>Live GPS & OTP</strong>
                  <p>Encrypted OTP verification at both pickup and doorstep delivery.</p>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div className={styles.benefitIcon}>
                  <Headphones size={20} />
                </div>
                <div>
                  <strong>Dedicated Fleet</strong>
                  <p>Background-verified delivery partners on two-wheelers and mini-vans.</p>
                </div>
              </div>
            </div>

            {/* How It Works Timeline */}
            <div className={styles.recentSection} style={{ marginTop: 10 }}>
              <div className={styles.recentHead}>
                <h3>How it Works</h3>
                <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Simple 3-step process</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 8 }}>
                <div style={{ textAlign: 'center', padding: '16px 8px', background: '#fffdf5', borderRadius: 14, border: '1px solid #fef3c7' }}>
                  <div style={{ width: 44, height: 44, margin: '0 auto 8px', borderRadius: '50%', background: '#fef3c7', color: '#0d0f12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={22} color="#fab800" />
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0F172A', marginBottom: 3 }}>1. Book</strong>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.3 }}>Enter details and choose a service</p>
                </div>

                <div style={{ textAlign: 'center', padding: '16px 8px', background: '#FFFBEB', borderRadius: 14 }}>
                  <div style={{ width: 44, height: 44, margin: '0 auto 8px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bike size={22} />
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0F172A', marginBottom: 3 }}>2. Pickup</strong>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.3 }}>We pick up from your doorstep</p>
                </div>

                <div style={{ textAlign: 'center', padding: '16px 8px', background: '#F0FDF4', borderRadius: 14 }}>
                  <div style={{ width: 44, height: 44, margin: '0 auto 8px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0F172A', marginBottom: 3 }}>3. Deliver</strong>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', lineHeight: 1.3 }}>We deliver safely to recipient</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Shipments, Quick Track, Support */}
          <div className={styles.sidebarColumn}>
            {/* Recent Shipments */}
            <div className={styles.recentSection}>
              <div className={styles.recentHead}>
                <h3>Recent Shipments</h3>
                <button
                  type="button"
                  className={styles.viewAllBtn}
                  onClick={() => navigateTo('/user/dashboard')}
                >
                  View all →
                </button>
              </div>

              {recentShipments.map((shipment) => (
                <div
                  key={shipment.trackingNumber}
                  className={styles.shipmentCard}
                  onClick={() => handleTrack(shipment.trackingNumber)}
                >
                  <div
                    className={styles.shipmentIconBox}
                    style={{
                      background: '#fffdf5',
                      color: '#fab800'
                    }}
                  >
                    {shipment.isDocument ? <FileText size={22} /> : <Package size={22} />}
                  </div>

                  <div className={styles.shipmentInfo}>
                    <div className={styles.shipmentTopRow}>
                      <strong>{shipment.trackingNumber}</strong>
                      <span
                        className={
                          shipment.isOutForDelivery
                            ? styles.statusOutDelivery
                            : styles.statusInTransit
                        }
                      >
                        {shipment.statusLabel}
                      </span>
                    </div>

                    <p className={styles.routeCities}>{shipment.route}</p>

                    <div className={styles.progressBarWrap}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${shipment.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.shipmentEta}>
                    <small>ETA</small>
                    <span className={styles.etaGreen}>{shipment.etaText}</span>
                    <button
                      type="button"
                      style={{
                        marginTop: 4,
                        padding: '5px 12px',
                        borderRadius: 6,
                        border: '1px solid #fab800',
                        background: '#fab800',
                        color: '#0d0f12',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTrack(shipment.trackingNumber)
                      }}
                    >
                      Track ›
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Consignment Tracking Form */}
            <div className={styles.quickTrackCard}>
              <div className={styles.quickTrackHead}>
                <Navigation size={22} className={styles.quickTrackIcon} />
                <div>
                  <strong>Quick Consignment Lookup</strong>
                  <p>Enter any Consignment or AWB number to track delivery progress in real-time.</p>
                </div>
              </div>

              <form onSubmit={handleQuickTrackSubmit} className={styles.quickTrackForm}>
                <input
                  type="text"
                  placeholder="e.g. DLVZ2505128947 or DLZ78291"
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value)}
                />
                <button type="submit">Track</button>
              </form>
            </div>

            {/* 24/7 Priority Support Card */}
            <div className={styles.supportCard}>
              <div className={styles.supportIcon}>
                <Headphones size={22} />
              </div>
              <div>
                <strong>Need Courier Help?</strong>
                <p>24/7 Priority Dispatch & Courier Support Desk</p>
                <a href="tel:+911800234567" className={styles.supportPhone}>
                  +91 1800-DELIVEZ (Toll Free)
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
