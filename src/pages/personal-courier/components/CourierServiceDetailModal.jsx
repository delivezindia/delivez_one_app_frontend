import React, { useState } from 'react'
import {
  X,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plane,
  Building,
  Home,
  Luggage,
  Sparkles,
  Lock,
  Truck,
  ArrowRight,
  Info
} from 'lucide-react'
import styles from './CourierServiceDetailModal.module.css'

export default function CourierServiceDetailModal({ service, isOpen, onClose, onSelectService }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'details'

  if (!isOpen || !service) return null

  const handleProceed = () => {
    onSelectService(service.id)
    onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.serviceBadge}>{service.badge || 'POPULAR ROUTE'}</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
          <h2 className={styles.title}>{service.title}</h2>
          <p className={styles.subtitle}>{service.desc}</p>
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <Clock size={16} />
              <span>Est. Transit: {service.estimatedTime || '2 - 4 Hours'}</span>
            </div>
            <div className={styles.metaItem}>
              <Sparkles size={16} />
              <span>Starting from ₹{service.startingPrice || 1200}</span>
            </div>
          </div>

          {/* Navigation Tabs (Overview & Service Details) */}
          <div className={styles.tabNav}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'details' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Service Details & Policy
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          {activeTab === 'overview' ? (
            <div className={styles.tabContent}>
              {/* Highlights */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>What's Included</h3>
                <div className={styles.highlightsGrid}>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightIcon}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4>Doorstep & Terminal Handover</h4>
                      <p>Pick up directly at luggage belt, hotel front desk, or residence.</p>
                    </div>
                  </div>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightIcon}>
                      <Lock size={18} />
                    </div>
                    <div>
                      <h4>Tamper-Evident Security Seal</h4>
                      <p>Unique barcoded security seal applied immediately upon bag collection.</p>
                    </div>
                  </div>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightIcon}>
                      <Truck size={18} />
                    </div>
                    <div>
                      <h4>Sanitized Tracked Vehicle</h4>
                      <p>Dedicated courier transit in temperature-controlled sanitized van.</p>
                    </div>
                  </div>
                  <div className={styles.highlightCard}>
                    <div className={styles.highlightIcon}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4>Complimentary Insurance</h4>
                      <p>Up to ₹25,000 complimentary protection against loss or damage.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>How It Works</h3>
                <div className={styles.timeline}>
                  <div className={styles.timelineStep}>
                    <div className={styles.stepNumber}>1</div>
                    <div className={styles.stepContent}>
                      <h4>Book & Schedule</h4>
                      <p>Enter flight or hotel details, select luggage count and preferred time slot.</p>
                    </div>
                  </div>
                  <div className={styles.timelineStep}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                      <h4>Agent Pickup & Barcode Seal</h4>
                      <p>Our verified driver arrives, inspects weight, and locks luggage with a security seal.</p>
                    </div>
                  </div>
                  <div className={styles.timelineStep}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                      <h4>Live GPS Tracking</h4>
                      <p>Track your consignment in real-time on our interactive map with driver updates.</p>
                    </div>
                  </div>
                  <div className={styles.timelineStep}>
                    <div className={styles.stepNumber}>4</div>
                    <div className={styles.stepContent}>
                      <h4>OTP Handover & Verified POD</h4>
                      <p>Delivered securely to hotel reception or doorstep with photographic proof & OTP.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Handover Guarantee */}
              <div className={styles.bannerBox}>
                <ShieldCheck size={28} className={styles.bannerIcon} />
                <div>
                  <h4>100% Secure Handover Guarantee</h4>
                  <p>Every piece of luggage is photographed before transit and sealed in front of you or airport authority.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.tabContent}>
              {/* Baggage & Weight Policy */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Weight & Size Guidelines</h3>
                <div className={styles.policyTable}>
                  <div className={styles.policyRow}>
                    <span className={styles.policyLabel}>Standard Allowance</span>
                    <span className={styles.policyVal}>Up to 2 bags included (Max 30 Kg total)</span>
                  </div>
                  <div className={styles.policyRow}>
                    <span className={styles.policyLabel}>Excess Luggage Rate</span>
                    <span className={styles.policyVal}>₹80 per extra bag / ₹20 per excess kg</span>
                  </div>
                  <div className={styles.policyRow}>
                    <span className={styles.policyLabel}>Luggage Types Accepted</span>
                    <span className={styles.policyVal}>Suitcases, trolleys, duffle bags, backpacks, golf bags</span>
                  </div>
                </div>
              </div>

              {/* Supported Hubs */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Supported Hubs & Terminals</h3>
                <p className={styles.policyDesc}>
                  We operate 24/7 across all major domestic & international terminals:
                </p>
                <div className={styles.tagGrid}>
                  <span className={styles.hubTag}>Indira Gandhi T1, T2, T3 (DEL)</span>
                  <span className={styles.hubTag}>Chhatrapati Shivaji T1 & T2 (BOM)</span>
                  <span className={styles.hubTag}>Kempegowda T1 & T2 (BLR)</span>
                  <span className={styles.hubTag}>All 5-Star & Partner City Hotels</span>
                </div>
              </div>

              {/* Prohibited Items */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Prohibited Items Notice</h3>
                <div className={styles.warningBox}>
                  <AlertCircle size={20} className={styles.warningIcon} />
                  <p>
                    Strictly prohibited: Flammable liquids, firearms, compressed gases, unregistered lithium batteries, and illegal contraband.
                  </p>
                </div>
              </div>

              {/* Cancellation & Reschedule */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Cancellation & Reschedule</h3>
                <p className={styles.policyDesc}>
                  Free cancellation up to 2 hours before scheduled pickup. Flexible reschedule available anytime through tracking portal.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <div className={styles.footerPrice}>
            <span className={styles.footerPriceLabel}>Base Route Price</span>
            <span className={styles.footerPriceVal}>₹{service.startingPrice || 1200}</span>
          </div>
          <button className={styles.proceedBtn} onClick={handleProceed}>
            <span>Book This Route</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
