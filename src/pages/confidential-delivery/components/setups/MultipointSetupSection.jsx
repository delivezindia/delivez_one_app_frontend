import React, { useState } from 'react'
import {
  Share2,
  MapPin,
  Clock,
  Compass,
  Plus,
  Trash2,
  Edit,
  GripVertical,
  CheckCircle2,
  ArrowUpDown,
  Info,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

const DEFAULT_STOPS = [
  {
    id: 1,
    name: 'Stop 1',
    badge: 'First Delivery',
    address: '123, MG Road, Indiranagar',
    contact: 'Rahul Sharma',
    time: '10:00 AM - 11:00 AM',
  },
  {
    id: 2,
    name: 'Stop 2',
    badge: '',
    address: '45, 2nd Cross, Koramangala',
    contact: 'Priya Nair',
    time: '12:00 PM - 01:00 PM',
  },
  {
    id: 3,
    name: 'Stop 3',
    badge: '',
    address: '78, 5th Main, HSR Layout',
    contact: 'Ankit Verma',
    time: '02:00 PM - 03:00 PM',
  },
  {
    id: 4,
    name: 'Final Stop',
    badge: 'Last Delivery',
    address: '9/1, Sarjapur Road',
    contact: 'Meera Iyer',
    time: '04:00 PM - 05:00 PM',
  },
]

export default function MultipointSetupSection({ data = {}, onChange }) {
  const stops = data.stops || DEFAULT_STOPS
  const timeWindow = data.timeWindow || false
  const notifyRecipients = data.notifyRecipients !== false
  const collectPod = data.collectPod || false
  const returnOrigin = data.returnOrigin || false
  const specialInstructions = data.specialInstructions || ''

  const [showAddModal, setShowAddModal] = useState(false)
  const [newStop, setNewStop] = useState({
    name: `Stop ${stops.length + 1}`,
    address: '',
    contact: '',
    time: '11:00 AM - 12:00 PM',
  })

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  const handleAddStop = () => {
    if (!newStop.address || !newStop.contact) {
      alert('Please enter both address and contact person for this stop.')
      return
    }
    const updated = [
      ...stops,
      {
        id: Date.now(),
        name: newStop.name || `Stop ${stops.length + 1}`,
        badge: '',
        address: newStop.address,
        contact: newStop.contact,
        time: newStop.time,
      },
    ]
    handleUpdate({ stops: updated })
    setShowAddModal(false)
    setNewStop({ name: `Stop ${updated.length + 1}`, address: '', contact: '', time: '11:00 AM - 12:00 PM' })
  }

  const handleDeleteStop = (id) => {
    if (stops.length <= 2) {
      alert('A multi-point route requires at least 2 stops.')
      return
    }
    handleUpdate({ stops: stops.filter((s) => s.id !== id) })
  }

  return (
    <div className={styles.setupCard}>
      {/* 1. ROUTE SUMMARY */}
      <div className={styles.setupSectionHeader}>
        <MapPin size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>ROUTE SUMMARY</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className={styles.summaryBox}>
            <div className={styles.summaryBoxTop}>
              <MapPin size={14} className={styles.setupGoldIcon} />
              <span className={styles.summaryBoxTitle}>Total Stops</span>
            </div>
            <div className={styles.summaryBoxVal}>{stops.length}</div>
            <div className={styles.summaryBoxSub}>Including final stop</div>
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryBoxTop}>
              <Compass size={14} className={styles.setupGoldIcon} />
              <span className={styles.summaryBoxTitle}>Estimated Distance</span>
            </div>
            <div className={styles.summaryBoxVal}>{25 * stops.length} km</div>
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryBoxTop}>
              <Clock size={14} className={styles.setupGoldIcon} />
              <span className={styles.summaryBoxTitle}>Estimated Time</span>
            </div>
            <div className={styles.summaryBoxVal}>{stops.length}h 15m</div>
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryBoxTop}>
              <Share2 size={14} className={styles.setupGoldIcon} />
              <span className={styles.summaryBoxTitle}>Service Type</span>
            </div>
            <div className={styles.summaryBoxVal} style={{ fontSize: '0.9rem' }}>Multi Point</div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 2. DELIVERY POINTS */}
      <div className={styles.setupHeaderWithAction}>
        <div className={styles.setupSectionHeader} style={{ padding: 0 }}>
          <MapPin size={18} className={styles.setupGoldIcon} />
          <span className={styles.setupTitle}>DELIVERY POINTS</span>
        </div>
        <button
          type="button"
          className={styles.setupActionBtn}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={14} />
          <span>Add Stop</span>
        </button>
      </div>

      <div className={styles.setupSectionBody}>
        <p className="text-xs text-slate-500 mb-3">
          Add all delivery points in the order they should be visited.
        </p>

        <div className="flex flex-col gap-2">
          {stops.map((stop, idx) => (
            <div key={stop.id} className={styles.stopItemCard}>
              <GripVertical size={18} className="text-slate-400 cursor-grab flex-shrink-0" />
              <div className={styles.stopNumberBadge}>
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{stop.name}</span>
                  {stop.badge && (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      ({stop.badge})
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {stop.address}
                </div>
              </div>

              <div className="hidden sm:block text-xs min-w-[120px]">
                <span className="text-slate-400 block text-[10px]">Contact Person</span>
                <span className="font-medium text-slate-800">{stop.contact}</span>
              </div>

              <div className="hidden sm:block text-xs min-w-[110px]">
                <span className="text-slate-400 block text-[10px]">ETA</span>
                <span className="font-medium text-slate-800">{stop.time}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded"
                  onClick={() => {
                    const newAddr = prompt('Edit address for this stop:', stop.address)
                    if (newAddr) {
                      const updated = stops.map((s) => (s.id === stop.id ? { ...s, address: newAddr } : s))
                      handleUpdate({ stops: updated })
                    }
                  }}
                  title="Edit Stop"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  onClick={() => handleDeleteStop(stop.id)}
                  title="Remove Stop"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Optimize Route Notice */}
        <div className={`${styles.noticeBox} mt-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Info size={16} className={styles.setupGoldIcon} />
            <span className={styles.noticeText}>
              Stops will be visited in the order listed above.
            </span>
          </div>
          <button
            type="button"
            className={styles.setupActionBtn}
            onClick={() => alert('Route optimized! Shortest transit sequence applied.')}
          >
            <ArrowUpDown size={14} />
            <span>Optimize Route</span>
          </button>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 3. ADDITIONAL OPTIONS */}
      <div className={styles.setupSectionHeader}>
        <CheckCircle2 size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>ADDITIONAL OPTIONS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className={styles.toggleRowItem}>
          <div className="flex-1">
            <div className={styles.toggleTitle}>Time Window for Each Stop</div>
            <div className={styles.toggleDesc}>Set specific time windows for each delivery point.</div>
          </div>
          <input
            type="checkbox"
            className={styles.goldSwitch}
            checked={timeWindow}
            onChange={(e) => handleUpdate({ timeWindow: e.target.checked })}
          />
        </div>

        <div className={styles.toggleRowItem}>
          <div className="flex-1">
            <div className={styles.toggleTitle}>Notify Recipients</div>
            <div className={styles.toggleDesc}>Send SMS/Email notifications to recipients before delivery.</div>
          </div>
          <input
            type="checkbox"
            className={styles.goldSwitch}
            checked={notifyRecipients}
            onChange={(e) => handleUpdate({ notifyRecipients: e.target.checked })}
          />
        </div>

        <div className={styles.toggleRowItem}>
          <div className="flex-1">
            <div className={styles.toggleTitle}>Collect POD at Each Stop</div>
            <div className={styles.toggleDesc}>Require signature or OTP confirmation at every delivery point.</div>
          </div>
          <input
            type="checkbox"
            className={styles.goldSwitch}
            checked={collectPod}
            onChange={(e) => handleUpdate({ collectPod: e.target.checked })}
          />
        </div>

        <div className={styles.toggleRowItem}>
          <div className="flex-1">
            <div className={styles.toggleTitle}>Return to Origin (if Undelivered)</div>
            <div className={styles.toggleDesc}>Return the shipment to pickup address if all attempts fail.</div>
          </div>
          <input
            type="checkbox"
            className={styles.goldSwitch}
            checked={returnOrigin}
            onChange={(e) => handleUpdate({ returnOrigin: e.target.checked })}
          />
        </div>

        {/* 4. SPECIAL INSTRUCTIONS */}
        <div className="mt-4">
          <label className={styles.inputLabel}>SPECIAL INSTRUCTIONS (OPTIONAL)</label>
          <div className="relative mt-2">
            <textarea
              className={styles.textareaField}
              placeholder="Add any special instructions for multi point delivery..."
              maxLength={250}
              value={specialInstructions}
              onChange={(e) => handleUpdate({ specialInstructions: e.target.value })}
            />
            <span className={styles.charCount}>
              {specialInstructions.length}/250
            </span>
          </div>
        </div>
      </div>

      {/* Modal to add stop */}
      {showAddModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3 className="font-bold text-lg mb-3">Add Delivery Stop</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Stop Name</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={newStop.name}
                  onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Address *</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Street, Landmark, Area"
                  value={newStop.address}
                  onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Contact Person *</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Full Name & Phone"
                  value={newStop.contact}
                  onChange={(e) => setNewStop({ ...newStop, contact: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">ETA Time Window</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. 03:00 PM - 04:00 PM"
                  value={newStop.time}
                  onChange={(e) => setNewStop({ ...newStop, time: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={handleAddStop}
              >
                Add Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
