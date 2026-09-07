import React, { useEffect, useState } from 'react'
import {
  Sliders,
  AlertTriangle,
  Zap,
  Radio,
  Bell,
  Save,
  CheckCircle2,
  Users,
  Percent,
  PhoneCall,
  ShieldAlert,
  Power,
  Megaphone,
  Trash2,
  Plus
} from 'lucide-react'
import {
  fetchPlatformSettings,
  updatePlatformSettings
} from '@/features/admin-management/services/adminManagementService.js'
import {
  fetchAdminBroadcasts,
  createAdminBroadcast,
  toggleAdminBroadcast,
  deleteAdminBroadcast
} from '@/features/broadcasts/services/broadcastService.js'
import styles from './AdminSettingsView.module.css'

export default function AdminSettingsView() {
  const [settings, setSettings] = useState({
    emergencyDispatchPaused: false,
    surgeMultiplier: 1.0,
    autoAssignRiders: true,
    maintenanceMode: false,
    maintenanceBanner: 'Operational Notice: Express delivery network running at 100% capacity.',
    maxActivePerRider: 3,
    payoutCommissionPercent: 20.0,
    contactHelpline: '+91 1800-DELIVEZ-SOS',
    updatedAt: '',
    updatedBy: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Broadcasts state
  const [broadcasts, setBroadcasts] = useState([])
  const [bcForm, setBcForm] = useState({ title: '', message: '', severity: 'INFO', targetCity: 'ALL' })
  const [bcPublishing, setBcPublishing] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const loadBroadcasts = () => {
    fetchAdminBroadcasts()
      .then(list => setBroadcasts(list || []))
      .catch(console.error)
  }

  useEffect(() => {
    loadBroadcasts()
  }, [])

  const handlePublishBroadcast = async (e) => {
    e.preventDefault()
    if (!bcForm.title || !bcForm.message) return
    setBcPublishing(true)
    try {
      await createAdminBroadcast(bcForm)
      showToast('Operational advisory broadcasted to network.')
      setBcForm({ title: '', message: '', severity: 'INFO', targetCity: 'ALL' })
      loadBroadcasts()
    } catch (err) {
      alert(err.message || 'Failed to publish broadcast.')
    } finally {
      setBcPublishing(false)
    }
  }

  const handleToggleBroadcast = async (id) => {
    try {
      await toggleAdminBroadcast(id)
      loadBroadcasts()
      showToast('Broadcast status updated.')
    } catch (err) {
      alert(err.message || 'Failed to toggle broadcast.')
    }
  }

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm('Delete this operational advisory?')) return
    try {
      await deleteAdminBroadcast(id)
      loadBroadcasts()
      showToast('Advisory removed from network.')
    } catch (err) {
      alert(err.message || 'Failed to delete broadcast.')
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchPlatformSettings()
      .then(data => {
        if (data) setSettings(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updatePlatformSettings(settings)
      if (updated) setSettings(updated)
      showToast('Platform operational settings saved successfully!')
    } catch (err) {
      alert(err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      {toast && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2><Sliders size={22} style={{ color: '#2563EB' }} /> Platform Operational Controls</h2>
          <p>Global dispatch configuration, dynamic surge controls, automated routing toggles and emergency failsafes.</p>
        </div>
        <button type="button" className={styles.saveBtn} disabled={saving} onClick={handleSave}>
          <Save size={15} /> {saving ? 'Applying...' : 'Save Configuration'}
        </button>
      </div>

      <div className={styles.grid}>
        {/* Emergency Kill-Switch & Dispatch Mode */}
        <div className={styles.card} style={settings.emergencyDispatchPaused ? { borderColor: '#FCA5A5', background: '#FFF5F5' } : {}}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <ShieldAlert size={22} />
            </div>
            <div className={styles.cardTitle}>
              <h3>Emergency Dispatch Controls</h3>
              <small>System-wide dispatch kill-switch</small>
            </div>
          </div>

          <div className={styles.switchRow}>
            <div className={styles.switchText}>
              <strong>Pause All Order Dispatching</strong>
              <small>Instantly halt rider allocation in case of severe storms or strikes</small>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.emergencyDispatchPaused}
                onChange={e => setSettings(prev => ({ ...prev, emergencyDispatchPaused: e.target.checked }))}
              />
              <span className={`${styles.slider} ${styles.sliderDanger}`} />
            </label>
          </div>

          <div className={styles.switchRow}>
            <div className={styles.switchText}>
              <strong>Automated Rider Matching Engine</strong>
              <small>Auto-assign nearest online rider vs manual dispatcher review</small>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.autoAssignRiders}
                onChange={e => setSettings(prev => ({ ...prev, autoAssignRiders: e.target.checked }))}
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>

        {/* Dynamic Surge Pricing */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <Zap size={22} />
            </div>
            <div className={styles.cardTitle}>
              <h3>Dynamic Surge Pricing</h3>
              <small>Real-time demand & rain multiplier</small>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Surge Rate Multiplier (1.0x to 3.0x)</label>
            <div className={styles.surgeControl}>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={settings.surgeMultiplier}
                onChange={e => setSettings(prev => ({ ...prev, surgeMultiplier: parseFloat(e.target.value) }))}
                style={{ flex: 1 }}
              />
              <span className={styles.surgeValue}>{settings.surgeMultiplier.toFixed(1)}x</span>
            </div>
            <small style={{ color: '#64748B' }}>
              {settings.surgeMultiplier === 1.0
                ? 'Standard pricing active (No extra surcharge applied).'
                : `Active Surge: Customer delivery fees increased by ${Math.round((settings.surgeMultiplier - 1) * 100)}%.`}
            </small>
          </div>
        </div>

        {/* Capacity & Dispatch Limits */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
              <Users size={22} />
            </div>
            <div className={styles.cardTitle}>
              <h3>Fleet Capacity Limits</h3>
              <small>Throttling concurrent rider workload</small>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Max Concurrent Deliveries Per Rider</label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxActivePerRider}
              onChange={e => setSettings(prev => ({ ...prev, maxActivePerRider: parseInt(e.target.value, 10) || 1 }))}
            />
            <small style={{ color: '#64748B' }}>Riders will not receive new batch trips once this ceiling is reached.</small>
          </div>

          <div className={styles.inputGroup}>
            <label>Platform Commission Margin (%)</label>
            <input
              type="number"
              min="5"
              max="40"
              step="0.5"
              value={settings.payoutCommissionPercent}
              onChange={e => setSettings(prev => ({ ...prev, payoutCommissionPercent: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        {/* Announcements & Helpline */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} style={{ background: '#FFFBEB', color: '#D97706' }}>
              <Bell size={22} />
            </div>
            <div className={styles.cardTitle}>
              <h3>Broadcast Notice & Care Desk</h3>
              <small>Public customer banner and support hotline</small>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Global Maintenance / Demand Banner</label>
            <textarea
              rows={3}
              value={settings.maintenanceBanner}
              onChange={e => setSettings(prev => ({ ...prev, maintenanceBanner: e.target.value }))}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Operations SOS Emergency Helpline</label>
            <input
              type="text"
              value={settings.contactHelpline}
              onChange={e => setSettings(prev => ({ ...prev, contactHelpline: e.target.value }))}
            />
          </div>
        </div>

        {/* Network Broadcast Management Panel */}
        <div className={styles.card} style={{ gridColumn: 'span 2' }}>
          <div className={styles.cardHead}>
            <div className={styles.cardIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <Megaphone size={22} />
            </div>
            <div className={styles.cardTitle}>
              <h3>Network Operational Broadcasts</h3>
              <small>Publish live weather, surge, or transit advisories across all customer apps & dashboards</small>
            </div>
          </div>

          <form onSubmit={handlePublishBroadcast} style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', color: '#475569' }}>Draft Operational Advisory</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Advisory Headline *</label>
                <input
                  required
                  placeholder="e.g. Heavy Rain Alert in South Bengaluru"
                  value={bcForm.title}
                  onChange={e => setBcForm(p => ({ ...p, title: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Severity Level</label>
                <select
                  value={bcForm.severity}
                  onChange={e => setBcForm(p => ({ ...p, severity: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
                >
                  <option value="INFO">Info (Blue)</option>
                  <option value="WARNING">Warning (Amber)</option>
                  <option value="EMERGENCY">Emergency (Red)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Target Zone / City</label>
                <select
                  value={bcForm.targetCity}
                  onChange={e => setBcForm(p => ({ ...p, targetCity: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
                >
                  <option value="ALL">All Cities (Global)</option>
                  <option value="BENGALURU">Bengaluru</option>
                  <option value="DELHI_NCR">Delhi NCR</option>
                  <option value="MUMBAI">Mumbai</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Detailed Advisory Message *</label>
              <textarea
                required
                rows={2}
                placeholder="Explain transit impact, extra buffer time, or alternate route recommendations..."
                value={bcForm.message}
                onChange={e => setBcForm(p => ({ ...p, message: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 13 }}
              />
            </div>

            <button
              type="submit"
              disabled={bcPublishing}
              style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> {bcPublishing ? 'Publishing...' : 'Publish to Delivez Network'}
            </button>
          </form>

          {/* Active Broadcasts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h4 style={{ margin: '0 0 6px', fontSize: 13, textTransform: 'uppercase', color: '#475569' }}>Live Published Advisories ({broadcasts.length})</h4>
            {broadcasts.length === 0 ? (
              <p style={{ color: '#94A3B8', fontSize: 13 }}>No operational broadcasts published.</p>
            ) : (
              broadcasts.map(bc => (
                <div
                  key={bc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    background: bc.severity === 'EMERGENCY' ? '#FEF2F2' : bc.severity === 'WARNING' ? '#FFFBEB' : '#EFF6FF',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: bc.severity === 'EMERGENCY' ? '#F87171' : bc.severity === 'WARNING' ? '#FCD34D' : '#93C5FD', color: '#0F172A' }}>
                        {bc.severity}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Zone: {bc.targetCity}</span>
                      <strong style={{ fontSize: 13, color: '#0F172A' }}>{bc.title}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#334155' }}>{bc.message}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleBroadcast(bc.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: bc.isActive ? '#16A34A' : '#94A3B8',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {bc.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBroadcast(bc.id)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: 4 }}
                      title="Delete Advisory"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {settings.updatedAt && (
        <small style={{ color: '#94A3B8', textAlign: 'right', display: 'block' }}>
          Last modified: {new Date(settings.updatedAt).toLocaleString('en-IN')} by {settings.updatedBy}
        </small>
      )}
    </div>
  )
}
