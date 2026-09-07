import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Plane,
  Home,
  Building,
  GitFork,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Repeat
} from 'lucide-react'
import CourierServiceDetailModal from './CourierServiceDetailModal.jsx'
import styles from './CourierServiceSelectView.module.css'

export const COURIER_SERVICES = [
  {
    id: 'HOME_TO_AIRPORT',
    title: 'Home to Airport',
    desc: 'Pickup from doorstep & deliver directly to airport departure terminal',
    estimatedTime: '2 - 4 Hours',
    startingPrice: 1200,
    badge: 'POPULAR',
    fromIcon: Home,
    toIcon: Plane,
    fromLabel: 'Home / Office',
    toLabel: 'Airport Terminal',
  },
  {
    id: 'AIRPORT_TO_HOME',
    title: 'Airport to Home',
    desc: 'Collect luggage from arrival baggage belt and deliver straight to your home',
    estimatedTime: '2 - 4 Hours',
    startingPrice: 1200,
    badge: 'CONVENIENT',
    fromIcon: Plane,
    toIcon: Home,
    fromLabel: 'Baggage Belt',
    toLabel: 'Home Doorstep',
  },
  {
    id: 'HOTEL_TO_AIRPORT',
    title: 'Hotel to Airport',
    desc: 'Pickup from hotel reception/room and handover at departure terminal',
    estimatedTime: '2 - 3 Hours',
    startingPrice: 1150,
    badge: 'HOTEL DESK',
    fromIcon: Building,
    toIcon: Plane,
    fromLabel: 'Hotel Front Desk',
    toLabel: 'Airport Terminal',
  },
  {
    id: 'AIRPORT_TO_HOTEL',
    title: 'Airport to Hotel',
    desc: 'Collect from arrival belt and deliver directly to your destination hotel room',
    estimatedTime: '2 - 4 Hours',
    startingPrice: 1200,
    badge: 'EXPRESS',
    fromIcon: Plane,
    toIcon: Building,
    fromLabel: 'Arrival Belt',
    toLabel: 'Hotel Reception',
  },
  {
    id: 'HOTEL_TO_HOME',
    title: 'Hotel to Home',
    desc: 'Transfer baggage from vacation or business hotel directly to home doorstep',
    estimatedTime: '3 - 5 Hours',
    startingPrice: 1100,
    badge: 'DOORSTEP',
    fromIcon: Building,
    toIcon: Home,
    fromLabel: 'Hotel Lobby',
    toLabel: 'Home Address',
  },
  {
    id: 'HOME_TO_HOTEL',
    title: 'Home to Hotel',
    desc: 'Send heavy suitcases ahead to destination hotel before you arrive in the city',
    estimatedTime: 'Same Day',
    startingPrice: 1100,
    badge: 'TRAVEL LIGHT',
    fromIcon: Home,
    toIcon: Building,
    fromLabel: 'Home Address',
    toLabel: 'Destination Hotel',
  },
  {
    id: 'MULTI_STOP',
    title: 'Multi-Stop Route',
    desc: 'Custom delivery across multiple drop points or airport transit connections',
    estimatedTime: 'Scheduled',
    startingPrice: 1500,
    badge: 'CUSTOM',
    fromIcon: GitFork,
    toIcon: GitFork,
    fromLabel: 'Multi Pickup',
    toLabel: 'Multi Drops',
  },
]

export default function CourierServiceSelectView({
  selectedServiceId = 'AIRPORT_TO_HOTEL',
  onSelectService,
  onContinue,
  onBack,
}) {
  const [currentSelected, setCurrentSelected] = useState(selectedServiceId)
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [modalService, setModalService] = useState(null)

  const activeService = COURIER_SERVICES.find((s) => s.id === currentSelected) || COURIER_SERVICES[3]

  const handleCardClick = (id) => {
    setCurrentSelected(id)
    if (onSelectService) onSelectService(id, isRoundTrip)
  }

  const handleOpenModal = (e, service) => {
    e.stopPropagation()
    setModalService(service)
  }

  const handleProceed = () => {
    if (onContinue) {
      onContinue({
        serviceId: currentSelected,
        service: activeService,
        isRoundTrip,
      })
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <div className={styles.titleWrap}>
          <h1 className={styles.mainTitle}>Courier Delivery</h1>
          <p className={styles.mainSubtitle}>Select your luggage route & delivery type</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.contentWrap}>
        <div className={styles.servicesGrid}>
          {COURIER_SERVICES.map((service) => {
            const isSelected = currentSelected === service.id
            const FromIcon = service.fromIcon
            const ToIcon = service.toIcon

            return (
              <div
                key={service.id}
                className={`${styles.serviceCard} ${isSelected ? styles.serviceCardSelected : ''}`}
                onClick={() => handleCardClick(service.id)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.routePill}>
                    <div className={styles.routeIconBox}>
                      <FromIcon size={14} />
                    </div>
                    <span className={styles.routeArrow}>→</span>
                    <div className={styles.routeIconBox}>
                      <ToIcon size={14} />
                    </div>
                  </div>
                  <div className={styles.badgeWrap}>
                    <span className={styles.badge}>{service.badge}</span>
                    <button
                      className={styles.infoBtn}
                      onClick={(e) => handleOpenModal(e, service)}
                      title="View route details"
                      aria-label="View route details"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardDesc}>{service.desc}</p>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.etaBox}>
                    <Clock size={13} />
                    <span>{service.estimatedTime}</span>
                  </div>
                  <div className={styles.priceBox}>
                    <span className={styles.fromLabel}>From</span>
                    <span className={styles.priceVal}>₹{service.startingPrice}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className={styles.selectedMarker}>
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Round Trip Booking Card (Screen 02) */}
        <div className={styles.roundTripCard}>
          <div className={styles.roundTripLeft}>
            <div className={styles.roundTripIcon}>
              <Repeat size={22} />
            </div>
            <div>
              <div className={styles.roundTripTag}>ROUND TRIP AVAILABLE</div>
              <h4 className={styles.roundTripTitle}>Need return journey coverage?</h4>
              <p className={styles.roundTripDesc}>
                Save 15% discount when you book 2-way airport & hotel baggage transfers together.
              </p>
            </div>
          </div>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={isRoundTrip}
              onChange={(e) => {
                setIsRoundTrip(e.target.checked)
                if (onSelectService) onSelectService(currentSelected, e.target.checked)
              }}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>

        {/* Security / Quality Trust Bar */}
        <div className={styles.trustBar}>
          <div className={styles.trustItem}>
            <ShieldCheck size={18} className={styles.trustIcon} />
            <span>Tamper-Evident Barcode Seals</span>
          </div>
          <div className={styles.trustItem}>
            <Sparkles size={18} className={styles.trustIcon} />
            <span>₹25,000 Complimentary Insurance</span>
          </div>
          <div className={styles.trustItem}>
            <Clock size={18} className={styles.trustIcon} />
            <span>Live GPS Real-Time Tracking</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomBarInner}>
          <div className={styles.summaryCol}>
            <span className={styles.selectedRouteLabel}>Selected Route</span>
            <div className={styles.selectedRouteName}>
              {activeService.title} {isRoundTrip ? '(Round Trip)' : ''}
            </div>
          </div>
          <div className={styles.bottomPriceCol}>
            <span className={styles.bottomPriceLabel}>Est. Starting Fare</span>
            <div className={styles.bottomPriceVal}>
              ₹{isRoundTrip ? Math.round(activeService.startingPrice * 1.8) : activeService.startingPrice}
            </div>
          </div>
          <button className={styles.continueBtn} onClick={handleProceed}>
            <span>Continue to Booking</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal */}
      <CourierServiceDetailModal
        service={modalService}
        isOpen={Boolean(modalService)}
        onClose={() => setModalService(null)}
        onSelectService={(id) => {
          setCurrentSelected(id)
          if (onSelectService) onSelectService(id, isRoundTrip)
        }}
      />
    </div>
  )
}
