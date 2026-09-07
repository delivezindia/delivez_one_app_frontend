import React, { useEffect, useState } from 'react'
import {
  Calculator,
  Save,
  CheckCircle2,
  Sliders,
  DollarSign,
  TrendingUp,
  Shield,
  Truck,
  RotateCcw,
  ShoppingBag,
  Gift,
  HelpCircle
} from 'lucide-react'
import {
  fetchPricingMatrix,
  updateServicePricing
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminPricingView.module.css'

export default function AdminPricingView() {
  const [rateCards, setRateCards] = useState({})
  const [activeKey, setActiveKey] = useState('personal-courier')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Simulator Inputs
  const [simDistance, setSimDistance] = useState(8)
  const [simWeight, setSimWeight] = useState(4)
  const [simNight, setSimNight] = useState(false)
  const [simSelectedAddons, setSimSelectedAddons] = useState([])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  useEffect(() => {
    fetchPricingMatrix()
      .then(res => {
        if (res?.rateCards) setRateCards(res.rateCards)
      })
      .catch(console.error)
  }, [])

  const currentCard = rateCards[activeKey] || {
    baseFare: 49,
    baseKmIncluded: 3,
    perKmRate: 14,
    weightSurchargePerKg: 25,
    nightSurcharge: 30,
    specialAddons: {},
    minimumCharge: 49,
    taxPercentage: 18,
  }

  const handleCardChange = (field, val) => {
    setRateCards(prev => ({
      ...prev,
      [activeKey]: {
        ...prev[activeKey],
        [field]: Number(val) || 0,
      },
    }))
  }

  const handleAddonChange = (addonKey, val) => {
    setRateCards(prev => ({
      ...prev,
      [activeKey]: {
        ...prev[activeKey],
        specialAddons: {
          ...prev[activeKey].specialAddons,
          [addonKey]: Number(val) || 0,
        },
      },
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateServicePricing(activeKey, currentCard)
      if (updated) {
        setRateCards(prev => ({ ...prev, [activeKey]: updated }))
      }
      showToast(`Rate card for ${currentCard.serviceName || activeKey} saved successfully!`)
    } catch (err) {
      alert(err.message || 'Failed to save rate card')
    } finally {
      setSaving(false)
    }
  }

  // Calculate simulated fare
  const extraKm = Math.max(0, simDistance - (currentCard.baseKmIncluded || 0))
  const distanceCost = extraKm * (currentCard.perKmRate || 0)
  const extraWeight = Math.max(0, simWeight - 3)
  const weightCost = extraWeight * (currentCard.weightSurchargePerKg || 0)
  const nightCost = simNight ? (currentCard.nightSurcharge || 0) : 0
  const addonsCost = simSelectedAddons.reduce((acc, k) => acc + (currentCard.specialAddons?.[k] || 0), 0)

  const subtotal = (currentCard.baseFare || 0) + distanceCost + weightCost + nightCost + addonsCost
  const tax = Math.round(subtotal * ((currentCard.taxPercentage || 18) / 100))
  const totalCustomerFare = Math.max(currentCard.minimumCharge || 0, subtotal + tax)
  const driverPayout = Math.round(totalCustomerFare * 0.80)
  const platformMargin = totalCustomerFare - driverPayout

  const serviceIcons = {
    'personal-courier': Truck,
    'confidential-courier': Shield,
    'forgot-something': ShoppingBag,
    'return-pickup': RotateCcw,
    'gift-delivery': Gift,
  }

  return (
    <div className={styles.wrapper}>
      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#0F172A',
          color: '#fff',
          padding: '12px 18px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2><Calculator size={22} style={{ color: '#2563EB' }} /> Dynamic Rate Cards & Pricing Matrix</h2>
          <p>Configure base fares, distance slabs, weight surcharges and preview real-time customer and driver payout splits.</p>
        </div>
      </div>

      {/* Service Tabs */}
      <div className={styles.serviceTabs}>
        {Object.keys(rateCards).map(key => {
          const Icon = serviceIcons[key] || Truck
          return (
            <button
              key={key}
              type="button"
              className={`${styles.serviceTab} ${activeKey === key ? styles.serviceTabActive : ''}`}
              onClick={() => { setActiveKey(key); setSimSelectedAddons([]) }}
            >
              <Icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {rateCards[key].serviceName || key}
            </button>
          )
        })}
      </div>

      <div className={styles.layout}>
        {/* Rate Card Editor */}
        <form onSubmit={handleSave} className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3>{currentCard.serviceName} Rate Card</h3>
              <small>Configure base parameters and kilometer charges</small>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '4px 8px', borderRound: 6 }}>
              Active in Production
            </span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Base Fare (₹)</label>
              <input
                type="number"
                value={currentCard.baseFare}
                onChange={e => handleCardChange('baseFare', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Base Distance Included (km)</label>
              <input
                type="number"
                value={currentCard.baseKmIncluded}
                onChange={e => handleCardChange('baseKmIncluded', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Per-Km Charge Thereafter (₹/km)</label>
              <input
                type="number"
                value={currentCard.perKmRate}
                onChange={e => handleCardChange('perKmRate', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Weight Surcharge (&gt;3kg) (₹/kg)</label>
              <input
                type="number"
                value={currentCard.weightSurchargePerKg}
                onChange={e => handleCardChange('weightSurchargePerKg', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Night Delivery Fee (10 PM - 6 AM) (₹)</label>
              <input
                type="number"
                value={currentCard.nightSurcharge}
                onChange={e => handleCardChange('nightSurcharge', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Minimum Booking Floor (₹)</label>
              <input
                type="number"
                value={currentCard.minimumCharge}
                onChange={e => handleCardChange('minimumCharge', e.target.value)}
              />
            </div>
          </div>

          {/* Addons */}
          {currentCard.specialAddons && Object.keys(currentCard.specialAddons).length > 0 && (
            <div className={styles.addonsSection}>
              <h4>Special Add-On Surcharges (₹)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {Object.entries(currentCard.specialAddons).map(([addonKey, addonPrice]) => (
                  <div key={addonKey} className={styles.inputGroup}>
                    <label style={{ textTransform: 'capitalize' }}>{addonKey.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      type="number"
                      value={addonPrice}
                      onChange={e => handleAddonChange(addonKey, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Rate Card Changes'}
          </button>
        </form>

        {/* Live Simulator */}
        <div className={styles.simulatorBox}>
          <div className={styles.simHead}>
            <Calculator size={18} />
            <h4>Live Trip Fare Simulator</h4>
          </div>

          <div className={styles.sliderRow}>
            <label>
              <span>Trip Distance:</span>
              <strong>{simDistance} km</strong>
            </label>
            <input
              type="range"
              min="1"
              max="40"
              value={simDistance}
              onChange={e => setSimDistance(Number(e.target.value))}
            />
          </div>

          <div className={styles.sliderRow}>
            <label>
              <span>Package Weight:</span>
              <strong>{simWeight} kg</strong>
            </label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={simWeight}
              onChange={e => setSimWeight(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="simNight"
              checked={simNight}
              onChange={e => setSimNight(e.target.checked)}
            />
            <label htmlFor="simNight" style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A' }}>
              Night Surcharge (+₹{currentCard.nightSurcharge})
            </label>
          </div>

          {/* Add-on toggles */}
          {currentCard.specialAddons && Object.keys(currentCard.specialAddons).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF' }}>Include Add-Ons:</span>
              {Object.entries(currentCard.specialAddons).map(([k, p]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={simSelectedAddons.includes(k)}
                    onChange={e => {
                      if (e.target.checked) setSimSelectedAddons(prev => [...prev, k])
                      else setSimSelectedAddons(prev => prev.filter(x => x !== k))
                    }}
                  />
                  <span>{k.replace(/([A-Z])/g, ' $1')} (+₹{p})</span>
                </label>
              ))}
            </div>
          )}

          {/* Calc Output */}
          <div className={styles.calcOutput}>
            <div className={styles.fareHeadline}>
              <span>Estimated Customer Total</span>
              <strong>₹{totalCustomerFare}</strong>
            </div>

            <div className={styles.splitRow}>
              <span>Base Fare (First {currentCard.baseKmIncluded}km)</span>
              <strong>₹{currentCard.baseFare}</strong>
            </div>
            <div className={styles.splitRow}>
              <span>Distance Charge ({extraKm} extra km)</span>
              <strong>+₹{distanceCost}</strong>
            </div>
            {weightCost > 0 && (
              <div className={styles.splitRow}>
                <span>Weight Surcharge ({extraWeight}kg extra)</span>
                <strong>+₹{weightCost}</strong>
              </div>
            )}
            {nightCost > 0 && (
              <div className={styles.splitRow}>
                <span>Night Delivery Surcharge</span>
                <strong>+₹{nightCost}</strong>
              </div>
            )}
            {addonsCost > 0 && (
              <div className={styles.splitRow}>
                <span>Selected Add-ons</span>
                <strong>+₹{addonsCost}</strong>
              </div>
            )}
            <div className={styles.splitRow}>
              <span>GST & Surcharges ({currentCard.taxPercentage}%)</span>
              <strong>+₹{tax}</strong>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8, marginTop: 4 }}>
              <div className={styles.splitRow} style={{ color: '#059669', fontWeight: 700 }}>
                <span>Partner Payout (80% Fleet Share)</span>
                <strong>₹{driverPayout}</strong>
              </div>
              <div className={styles.splitRow} style={{ color: '#2563EB', fontWeight: 700 }}>
                <span>Platform Margin (20% Net Commission)</span>
                <strong>₹{platformMargin}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
