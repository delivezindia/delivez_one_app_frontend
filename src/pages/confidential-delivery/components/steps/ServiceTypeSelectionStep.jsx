import React, { useState } from 'react'
import {
  Shield,
  Zap,
  GitFork,
  Calendar,
  Briefcase,
  RotateCcw,
  Repeat,
  ShieldAlert,
  Share2,
  Clock,
  ChevronRight,
  Plane,
  Scale,
  Landmark,
  FileCheck,
  Award,
  Truck,
  Building,
  Layers,
  ChevronDown,
} from 'lucide-react'
import VaultSuitcaseGraphic from '../VaultSuitcaseGraphic.jsx'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export const POPULAR_SERVICES = [
  {
    title: 'Vault Secure',
    desc: 'Standard secure delivery with full verification and chain of custody.',
    time: '1-2 Days',
    icon: Shield,
    tag: 'Recommended',
    tagColor: '#FFCC00',
    tagTextColor: '#000000',
  },
  {
    title: 'Vault Priority',
    desc: 'Faster delivery with priority handling and dedicated partners.',
    time: 'Same / Next Day',
    icon: Zap,
    tag: 'Fastest',
    tagColor: '#D32F2F',
    tagTextColor: '#FFFFFF',
  },
  {
    title: 'Vault Direct',
    desc: 'Point-to-point delivery with no stops in between. Maximum confidentiality.',
    time: '1-2 Days',
    icon: GitFork,
    tag: '',
  },
  {
    title: 'Vault Precise',
    desc: 'Deliver at a specific date and time window of your choice.',
    time: 'Scheduled',
    icon: Calendar,
    tag: '',
  },
  {
    title: 'Vault Hand Carry',
    desc: 'Dedicated hand carry by authorized executive for highest priority items.',
    time: '1-2 Days',
    icon: Briefcase,
    tag: '',
  },
  {
    title: 'Vault Return',
    desc: 'Deliver and collect signed or processed documents and return to sender.',
    time: '1-3 Days',
    icon: RotateCcw,
    tag: '',
  },
  {
    title: 'Vault Exchange',
    desc: 'Two-way document or item exchange in a single trip.',
    time: '1-3 Days',
    icon: Repeat,
    tag: '',
  },
  {
    title: 'Vault Critical',
    desc: 'Highest level of security with armed escort and real-time monitoring.',
    time: 'Same Day',
    icon: ShieldAlert,
    tag: '',
  },
  {
    title: 'Vault MultiPoint',
    desc: 'Multiple secure stops in a single journey with optimized routing.',
    time: '1-3 Days',
    icon: Share2,
    tag: '',
  },
]

export const MORE_SERVICES = [
  { title: 'Vault Same Day', desc: 'Same day secure delivery', icon: Zap },
  { title: 'Vault Express', desc: 'Fastest available delivery', icon: Truck },
  { title: 'Vault Scheduled', desc: 'Pre-book for later', icon: Calendar },
  { title: 'Vault Intercity', desc: 'City-to-city delivery', icon: Building },
  { title: 'Vault Air', desc: 'Air-enabled intercity', icon: Plane },
  { title: 'Vault Bulk', desc: 'Bulk confidential dispatch', icon: Layers },
  { title: 'Vault Legal', desc: 'For legal & court docs', icon: Scale },
  { title: 'Vault Tender', desc: 'Tender & bid submission', icon: FileCheck },
  { title: 'Vault Banking', desc: 'For banking documents', icon: Landmark },
  { title: 'Vault Boardroom', desc: 'Board packs & contracts', icon: Award },
  { title: 'Vault White Glove', desc: 'Premium handling & support', icon: Shield },
]

export default function ServiceTypeSelectionStep({
  selectedService = 'Vault Secure',
  onSelectService,
  onContinue,
}) {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className={styles.stepContentContainer}>
      {/* Header Banner */}
      <div className={styles.serviceHeaderBanner}>
        <div className="flex-1">
          <h1 className={styles.mainStepTitle}>Choose Delivery Service Type</h1>
          <p className={styles.mainStepSubtitle}>
            Select the service that best matches your security, speed and delivery requirements.
          </p>
        </div>
        <div className="flex-shrink-0">
          <VaultSuitcaseGraphic />
        </div>
      </div>

      {/* Popular Services Section Header */}
      <div className={styles.popularServicesHeader}>
        Popular Services
      </div>

      {/* 3x3 Popular Services Grid */}
      <div className={styles.popularGrid3x3}>
        {POPULAR_SERVICES.map((srv) => {
          const isSelected = selectedService === srv.title
          const IconComp = srv.icon
          const hasTag = Boolean(srv.tag)

          return (
            <div
              key={srv.title}
              className={`${styles.popularCard} ${isSelected ? styles.popularCardActive : ''}`}
              onClick={() => onSelectService && onSelectService(srv.title)}
            >
              {hasTag && (
                <div
                  className={styles.popularCardBadge}
                  style={{ backgroundColor: srv.tagColor, color: srv.tagTextColor }}
                >
                  {srv.tag}
                </div>
              )}

              <div className={styles.popularCardIconRow}>
                <IconComp size={28} className={styles.popularCardIcon} />
              </div>

              <h3 className={styles.popularCardTitle}>{srv.title}</h3>
              <p className={styles.popularCardDesc}>{srv.desc}</p>

              <div className={styles.popularCardTimeRow}>
                <Clock size={12} className={styles.setupGoldIcon} />
                <span className={styles.popularCardTimeText}>{srv.time}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* More Services Toggle Divider */}
      <div
        className={styles.moreServicesToggleRow}
        onClick={() => setShowMore(!showMore)}
      >
        <div className={styles.moreServicesLine} />
        <div className={styles.moreServicesToggleBtn}>
          <span>More Services</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`}
          />
        </div>
        <div className={styles.moreServicesLine} />
      </div>

      {/* More Services Grid */}
      {showMore && (
        <div className={styles.moreServicesGrid}>
          {MORE_SERVICES.map((item) => {
            const isSelected = selectedService === item.title
            const IconComp = item.icon

            return (
              <div
                key={item.title}
                className={`${styles.moreServiceItem} ${isSelected ? styles.moreServiceItemActive : ''}`}
                onClick={() => onSelectService && onSelectService(item.title)}
              >
                <IconComp size={16} className={styles.setupGoldIcon} />
                <div className="flex-1 min-w-0">
                  <div className={styles.moreServiceTitle}>{item.title}</div>
                  <div className={styles.moreServiceDesc}>{item.desc}</div>
                </div>
                <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom Continue Button */}
      <div className={styles.bottomCtaSection}>
        <button
          type="button"
          className={styles.redCtaButton}
          onClick={onContinue}
        >
          <span>Continue</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
