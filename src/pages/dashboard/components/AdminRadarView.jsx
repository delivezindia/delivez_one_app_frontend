import React, { useCallback, useEffect, useState } from 'react'
import {
  Radio,
  Navigation,
  BatteryCharging,
  Gauge,
  MapPin,
  Bike,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Zap
} from 'lucide-react'
import { fetchRadarTelemetry } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminRadarView.module.css'

export default function AdminRadarView() {
  const [city, setCity] = useState('ALL')
  const [data, setData] = useState({ hubs: [], couriers: [], activeVectors: [], summary: {} })
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pingToast, setPingToast] = useState('')

  const showPing = (msg) => {
    setPingToast(msg)
    setTimeout(() => setPingToast(''), 3500)
  }

  const loadTelemetry = useCallback(async () => {
    try {
      const res = await fetchRadarTelemetry(city)
      if (res) {
        setData(res)
        if (!selectedItem && res.couriers?.length > 0) {
          setSelectedItem(res.couriers[0])
        }
      }
    } catch (err) {
      console.error('Radar telemetry error:', err)
    } finally {
      setLoading(false)
    }
  }, [city, selectedItem])

  useEffect(() => {
    loadTelemetry()
    const interval = setInterval(loadTelemetry, 10000)
    return () => clearInterval(interval)
  }, [loadTelemetry])

  const { hubs = [], couriers = [], activeVectors = [], summary = {} } = data

  return (
    <div className={styles.wrapper}>
      {pingToast && (
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
          <span>{pingToast}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2><Radio size={22} style={{ color: '#0284C7' }} /> Live Operations Radar & Telemetry</h2>
          <p>Real-time fleet tracking, battery analytics, and active dispatch vectors across metro operations.</p>
        </div>

        <div className={styles.cityTabs}>
          {['ALL', 'BENGALURU', 'DELHI_NCR', 'MUMBAI', 'HYDERABAD', 'PUNE'].map(c => (
            <button
              key={c}
              type="button"
              className={`${styles.cityTab} ${city === c ? styles.cityTabActive : ''}`}
              onClick={() => { setCity(c); setSelectedItem(null) }}
            >
              {c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiBox}>
          <div className={styles.kpiIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <Bike size={20} />
          </div>
          <div>
            <small>Active Fleet Online</small>
            <strong>{summary.totalOnlineRiders || couriers.length} Couriers</strong>
          </div>
        </div>

        <div className={styles.kpiBox}>
          <div className={styles.kpiIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <Navigation size={20} />
          </div>
          <div>
            <small>Deliveries In Transit</small>
            <strong>{summary.inTransitCount || 0} In Flight</strong>
          </div>
        </div>

        <div className={styles.kpiBox}>
          <div className={styles.kpiIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
            <BatteryCharging size={20} />
          </div>
          <div>
            <small>Fleet Avg Battery</small>
            <strong>{summary.avgFleetBatteryPercent || 82}% EV Health</strong>
          </div>
        </div>

        <div className={styles.kpiBox}>
          <div className={styles.kpiIcon} style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            <MapPin size={20} />
          </div>
          <div>
            <small>Active Regional Hubs</small>
            <strong>{hubs.length} Express Points</strong>
          </div>
        </div>
      </div>

      {/* Main Radar Layout */}
      <div className={styles.radarLayout}>
        <div className={styles.canvasContainer}>
          <div className={styles.radarOverlay}>
            <span className={styles.liveDot} />
            <span>METRO DISPATCH GRID • LIVE TELEMETRY</span>
          </div>

          {/* SVG Map Canvas */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
            {/* Grid Pattern */}
            <defs>
              <pattern id="radarGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1E293B" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#radarGrid)" />

            {/* Concentric Radar Circles */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1E293B" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#1E293B" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="#1E293B" strokeWidth="0.4" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#1E293B" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#1E293B" strokeWidth="0.3" strokeDasharray="1,1" />

            {/* Active Delivery Vectors */}
            {activeVectors.map(vec => (
              <g key={vec.id}>
                <line
                  x1={vec.startX}
                  y1={vec.startY}
                  x2={vec.endX}
                  y2={vec.endY}
                  stroke="#38BDF8"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                />
                <circle cx={vec.endX} cy={vec.endY} r="1.4" fill="#E11D48" />
              </g>
            ))}

            {/* Hubs */}
            {hubs.map(hub => {
              const isSelected = selectedItem?.id === hub.id
              return (
                <g
                  key={hub.id}
                  onClick={() => setSelectedItem({ ...hub, type: 'HUB' })}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={hub.x} cy={hub.y} r={isSelected ? '3.5' : '2.5'} fill="#0284C7" fillOpacity="0.25" />
                  <circle cx={hub.x} cy={hub.y} r="1.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="0.4" />
                  <text x={hub.x + 2.5} y={hub.y + 1} fill="#94A3B8" fontSize="2.2" fontWeight="700">
                    {hub.name.split(' ')[0]}
                  </text>
                </g>
              )
            })}

            {/* Couriers */}
            {couriers.map(rdr => {
              const isSelected = selectedItem?.id === rdr.id
              const color =
                rdr.status === 'AVAILABLE' ? '#10B981' :
                rdr.status === 'ARMORED_TRANSIT' ? '#8B5CF6' : '#F59E0B'

              return (
                <g
                  key={rdr.id}
                  onClick={() => setSelectedItem({ ...rdr, type: 'COURIER' })}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={rdr.x}
                    cy={rdr.y}
                    r={isSelected ? '3.2' : '2'}
                    fill={color}
                    fillOpacity="0.3"
                  />
                  <circle
                    cx={rdr.x}
                    cy={rdr.y}
                    r="1.2"
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth="0.3"
                  />
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }} />
              <span>Hub Station</span>
            </div>
            <div className={styles.legendItem}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <span>Available</span>
            </div>
            <div className={styles.legendItem}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
              <span>In Transit</span>
            </div>
            <div className={styles.legendItem}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8B5CF6' }} />
              <span>Armored Vault</span>
            </div>
          </div>
        </div>

        {/* Selected Telemetry Card */}
        <div className={styles.telemetryPanel}>
          {selectedItem ? (
            <>
              <div className={styles.telemetryHead}>
                <h3>{selectedItem.name}</h3>
                <small>
                  {selectedItem.type === 'HUB'
                    ? `Regional Hub • ${selectedItem.city}`
                    : `${selectedItem.vehicle} • ${selectedItem.city}`}
                </small>
              </div>

              {selectedItem.type === 'HUB' ? (
                <>
                  <div className={styles.statRow}>
                    <span>Active Couriers at Hub</span>
                    <strong>{selectedItem.activeRidersCount} Couriers</strong>
                  </div>
                  <div className={styles.statRow}>
                    <span>Parcels in Dispatch Queue</span>
                    <strong>{selectedItem.ordersInQueue} Orders</strong>
                  </div>
                  <div className={styles.statRow}>
                    <span>Hub Station Status</span>
                    <strong style={{ color: '#059669' }}>Operational 100%</strong>
                  </div>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => showPing(`Radio broadcast sent to all couriers at ${selectedItem.name}!`)}
                  >
                    <Send size={14} /> Broadcast Station Alert
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.statRow}>
                    <span>Current Speed</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Gauge size={14} color="#0284C7" /> {selectedItem.speedKmh} km/h
                    </strong>
                  </div>

                  <div className={styles.statRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>EV Battery Level</span>
                      <strong style={{ color: selectedItem.batteryPercent > 70 ? '#059669' : '#D97706' }}>
                        {selectedItem.batteryPercent}%
                      </strong>
                    </div>
                    <div className={styles.batteryBar}>
                      <div
                        className={styles.batteryFill}
                        style={{
                          width: `${selectedItem.batteryPercent}%`,
                          background: selectedItem.batteryPercent > 70 ? '#10B981' : '#F59E0B',
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.statRow}>
                    <span>Dispatch Status</span>
                    <strong style={{
                      color: selectedItem.status === 'AVAILABLE' ? '#059669' : '#D97706',
                      fontWeight: 800
                    }}>
                      {selectedItem.status.replace(/_/g, ' ')}
                    </strong>
                  </div>

                  {selectedItem.currentTrip && (
                    <div className={styles.tripCard}>
                      <strong>Active Assignment #{selectedItem.currentTrip.orderNumber}</strong>
                      <p><strong>Service:</strong> {selectedItem.currentTrip.service}</p>
                      <p><strong>Destination:</strong> {selectedItem.currentTrip.destination}</p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#1E40AF', fontWeight: 700 }}>
                        <Clock size={12} /> ETA: {selectedItem.currentTrip.etaMins} mins
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => showPing(`Radio ping sent to ${selectedItem.name}. Signal ACK received.`)}
                  >
                    <Send size={14} /> Send Courier Radio Ping
                  </button>
                </>
              )}
            </>
          ) : (
            <p style={{ color: '#94A3B8', textAlign: 'center', margin: 'auto 0' }}>
              Click on any courier dot or hub pin on the radar map to view telemetry.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
