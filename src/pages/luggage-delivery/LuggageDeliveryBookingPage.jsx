import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Copy,
  Crosshair,
  FileText,
  HeartPulse,
  HelpCircle,
  Home,
  Info,
  LoaderCircle,
  LockKeyhole,
  Luggage,
  MapPin,
  Minus,
  PackageCheck,
  Plane,
  Plus,
  Save,
  Scale,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { getStoredUser } from '@/features/auth/services/userAuthService.js'
import DummyPaymentGateway from '@/features/payments/components/DummyPaymentGateway.jsx'
import {
  fetchSavedAddresses,
  saveAddress,
} from '@/features/personal-courier/services/personalCourierService.js'
import {
  createLuggageBooking,
  fetchLuggageOptions,
  fetchLuggageQuote,
} from '@/features/luggage-delivery/services/luggageDeliveryService.js'
import styles from './LuggageDeliveryBookingPage.module.css'

const STEPS = ['Pickup', 'Delivery', 'Luggage & Items', 'Security', 'Schedule', 'Review']
const DRAFT_KEY = 'delivez-luggage-delivery-draft-v1'

function localDateTime(hoursAhead = 2) {
  const date = new Date(Date.now() + hoursAhead * 60 * 60 * 1000)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16)
}

function makeIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? ('luggage-' + Date.now() + '-' + Math.random().toString(36).slice(2))
}

function emptyAddress(user, label) {
  return {
    label,
    contactName: user?.fullName ?? '',
    countryCode: user?.countryCode ?? '+91',
    phoneNumber: user?.mobileNumber ?? '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    latitude: null,
    longitude: null,
  }
}

function initialDraft(user) {
  return {
    pickup: emptyAddress(user, 'Hotel / Residence'),
    dropoff: { ...emptyAddress(null, 'Airport / Destination'), countryCode: '+91' },
    document: {
      type: 'OTHER',
      envelopeSize: 'LARGE',
      pageCount: 1,
      description: 'Luggage bag and personal belongings',
      containsOriginals: true,
      requiresReturn: false,
      declaredValue: 25000,
      complianceAccepted: true,
    },
    security: {
      level: 'TAMPER_EVIDENT',
      handoverMethod: 'OTP_AND_SIGNATURE',
      recipientIdRequired: true,
      pickupProofRequired: true,
    },
    schedule: {
      type: 'ASAP',
      scheduledPickupAt: localDateTime(3),
    },
    deliverySpeed: 'PRIORITY',
    paymentMethod: 'PAY_ON_DELIVERY',
    idempotencyKey: makeIdempotencyKey(),
  }
}

function toRequest(draft) {
  return {
    pickup: {
      ...draft.pickup,
      latitude: draft.pickup.latitude ? Number(draft.pickup.latitude) : undefined,
      longitude: draft.pickup.longitude ? Number(draft.pickup.longitude) : undefined,
    },
    dropoff: {
      ...draft.dropoff,
      latitude: draft.dropoff.latitude ? Number(draft.dropoff.latitude) : undefined,
      longitude: draft.dropoff.longitude ? Number(draft.dropoff.longitude) : undefined,
    },
    document: {
      type: draft.document.type,
      envelopeSize: draft.document.envelopeSize,
      pageCount: Number(draft.document.pageCount),
      description: draft.document.description?.trim() || undefined,
      containsOriginals: Boolean(draft.document.containsOriginals),
      requiresReturn: Boolean(draft.document.requiresReturn),
      declaredValue: draft.document.declaredValue ? Number(draft.document.declaredValue) : undefined,
      complianceAccepted: Boolean(draft.document.complianceAccepted),
    },
    security: {
      level: draft.security.level,
      handoverMethod: draft.security.handoverMethod,
      recipientIdRequired: Boolean(draft.security.recipientIdRequired),
      pickupProofRequired: Boolean(draft.security.pickupProofRequired),
    },
    schedule: {
      type: draft.schedule.type,
      scheduledAt: draft.schedule.type === 'SCHEDULED'
        ? (draft.schedule.scheduledPickupAt ? new Date(draft.schedule.scheduledPickupAt).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString())
        : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      scheduledPickupAt: draft.schedule.type === 'SCHEDULED'
        ? (draft.schedule.scheduledPickupAt ? new Date(draft.schedule.scheduledPickupAt).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString())
        : new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
    deliverySpeed: draft.deliverySpeed,
    paymentMethod: draft.paymentMethod,
  }
}

function stepError(stepIndex, draft) {
  if (stepIndex === 0) {
    const { contactName, phoneNumber, addressLine1, city, state, postalCode } = draft.pickup
    if (!contactName.trim()) return 'Please enter the pickup contact person name.'
    if (!phoneNumber.trim()) return 'Please enter the pickup contact mobile number.'
    if (!addressLine1.trim()) return 'Please provide the pickup address line.'
    if (!city.trim() || !state.trim()) return 'Please provide city and state for pickup.'
    if (!/^\d{6}$/.test(postalCode.trim())) return 'Pickup postal code must be a 6-digit number.'
  }

  if (stepIndex === 1) {
    const { contactName, phoneNumber, addressLine1, city, state, postalCode } = draft.dropoff
    if (!contactName.trim()) return 'Please enter the recipient or destination contact name.'
    if (!phoneNumber.trim()) return 'Please enter the recipient mobile number.'
    if (!addressLine1.trim()) return 'Please provide the delivery address line / airport terminal.'
    if (!city.trim() || !state.trim()) return 'Please provide city and state for delivery.'
    if (!/^\d{6}$/.test(postalCode.trim())) return 'Delivery postal code must be a 6-digit number.'
  }

  if (stepIndex === 2) {
    if (!draft.document.complianceAccepted) {
      return 'Please confirm the luggage declaration and aviation safety policy.'
    }
  }

  return ''
}

function LuggageDeliveryBookingPage() {
  const user = getStoredUser()
  const [options, setOptions] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState(() => {
    try {
      const cached = window.sessionStorage.getItem(DRAFT_KEY)
      if (cached) return JSON.parse(cached)
    } catch {
      // ignore
    }
    return initialDraft(user)
  })
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [working, setWorking] = useState(false)
  const [booking, setBooking] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true

    Promise.allSettled([fetchLuggageOptions(), fetchSavedAddresses()])
      .then(([optRes, addrRes]) => {
        if (!active) return
        if (optRes.status === 'fulfilled') setOptions(optRes.value)
        else setError(optRes.reason?.message ?? 'Could not load luggage delivery options.')

        if (addrRes.status === 'fulfilled') setSavedAddresses(addrRes.value ?? [])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // ignore
    }
  }, [draft])

  useEffect(() => {
    if (!draft.pickup.postalCode || !draft.dropoff.postalCode) return

    let active = true
    setQuoteLoading(true)

    fetchLuggageQuote(toRequest(draft))
      .then((data) => {
        if (active) setQuote(data)
      })
      .catch(() => {
        if (active) setQuote(null)
      })
      .finally(() => {
        if (active) setQuoteLoading(false)
      })

    return () => { active = false }
  }, [
    draft.pickup.postalCode,
    draft.dropoff.postalCode,
    draft.document.type,
    draft.document.envelopeSize,
    draft.document.pageCount,
    draft.document.requiresReturn,
    draft.security.level,
    draft.security.handoverMethod,
    draft.deliverySpeed,
  ])

  const update = (section, field, value) => {
    setError('')
    setNotice('')
    setDraft((current) => ({
      ...current,
      [section]: typeof field === 'string' ? { ...current[section], [field]: value } : field,
    }))
  }

  const applySavedAddress = (target, addr) => {
    update(target, {
      label: addr.label,
      contactName: addr.contactName,
      countryCode: addr.countryCode,
      phoneNumber: addr.phoneNumber,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || 'India',
      latitude: addr.latitude,
      longitude: addr.longitude,
    })
    setNotice('Applied ' + addr.label + ' address to ' + target + '.')
  }

  const saveCurrentAddress = async (target) => {
    const payload = draft[target]
    if (!payload.addressLine1 || !payload.city || !payload.postalCode) {
      setError('Please complete the ' + target + ' address details before saving.')
      return
    }
    setWorking(true)
    try {
      const saved = await saveAddress(payload)
      setSavedAddresses((prev) => [saved, ...prev])
      setNotice((payload.label || 'Address') + ' saved to your address book.')
    } catch (err) {
      setError(err.message)
    } finally {
      setWorking(false)
    }
  }

  const next = () => {
    const err = stepError(step, draft)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => {
    if (step === 0) return navigateTo('/user/dashboard')
    setError('')
    setStep((s) => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmBooking = async () => {
    setWorking(true)
    setError('')
    try {
      const created = await createLuggageBooking(toRequest(draft), draft.idempotencyKey)
      setBooking(created)
      window.sessionStorage.removeItem(DRAFT_KEY)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    } finally {
      setWorking(false)
    }
  }

  const copyBookingId = () => {
    if (!booking?.bookingNumber) return
    navigator.clipboard?.writeText(booking.bookingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className={styles.loading}>
        <LoaderCircle className={styles.spinner} />
        <p>Loading luggage delivery options...</p>
      </main>
    )
  }

  if (!options) {
    return (
      <main className={styles.loading}>
        <Info className={styles.failureIcon} />
        <p>{error || 'Luggage Delivery is temporarily unavailable.'}</p>
        <button type="button" onClick={() => window.location.reload()}>Try again</button>
      </main>
    )
  }

  if (booking && booking.paymentMethod === 'ONLINE' && booking.paymentStatus !== 'PAID') {
    return (
      <DummyPaymentGateway
        booking={booking}
        serviceSlug="luggage-delivery"
        gatewayOptions={options.sandboxGateway}
        onUpdate={setBooking}
        onSuccess={setBooking}
      />
    )
  }

  if (booking) {
    return (
      <div className={styles.confirmation}>
        <header>
          <button type="button" onClick={() => navigateTo('/user/dashboard')} aria-label="Return to dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <strong>DELIVEZ</strong>
            <span>LUGGAGE DELIVERY</span>
          </div>
          <button type="button" onClick={() => window.print()} aria-label="Print receipt">
            <ClipboardCheck size={18} />
          </button>
        </header>

        <section className={styles.confirmationHero}>
          <span><CheckCircle2 size={45} /></span>
          <div>
            <p><CheckCircle2 size={16} /> BOOKING CONFIRMED</p>
            <h1>Your luggage delivery is scheduled.</h1>
            <small>Your bags will be collected, sealed with tamper-evident tags, and delivered on schedule.</small>
          </div>
        </section>

        <div className={styles.bookingId}>
          <div>
            <small>TRACKING NUMBER</small>
            <strong>{booking.bookingNumber}</strong>
          </div>
          <button type="button" onClick={copyBookingId}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy Tracking Number'}
          </button>
        </div>

        <section className={styles.confirmationRoute}>
          <h2>Delivery Route</h2>
          <div>
            <span><MapPin size={18} /></span>
            <p>
              <strong>{booking.addresses?.pickup?.contactName || 'Pickup Location'}</strong>
              <small>{booking.addresses?.pickup?.addressLine1}, {booking.addresses?.pickup?.city}</small>
            </p>
            <ArrowRight size={16} />
            <p>
              <strong>{booking.addresses?.dropoff?.contactName || 'Delivery Location'}</strong>
              <small>{booking.addresses?.dropoff?.addressLine1}, {booking.addresses?.dropoff?.city}</small>
            </p>
            <span><Luggage size={18} /></span>
          </div>
        </section>

        <div className={styles.confirmationActions} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            style={{ background: '#e00014', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px' }}
            onClick={() => navigateTo('/track/courier/' + (booking.bookingNumber || booking.id))}
          >
            Track Live Consignment (Screens 28–31) →
          </button>
          <button
            type="button"
            style={{ background: '#1e293b', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px' }}
            onClick={() => navigateTo('/courier/pod/' + (booking.bookingNumber || booking.id))}
          >
            View Proof of Delivery / POD (Screens 32–33)
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '10px', fontWeight: '600' }}
              onClick={() => navigateTo('/user/dashboard')}
            >
              View in Dashboard
            </button>
            <button
              type="button"
              style={{ background: '#fff', color: '#e00014', border: '1px solid #e00014', padding: '12px', borderRadius: '10px', fontWeight: '600' }}
              onClick={() => window.location.reload()}
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.iconButton} onClick={() => navigateTo('/user/dashboard')} aria-label="Back to dashboard">
          <ArrowLeft size={22} />
        </button>

        <button type="button" className={styles.brand} onClick={() => navigateTo('/')}>
          <strong>DELIVEZ</strong>
          <span>LUGGAGE DELIVERY</span>
        </button>

        <button type="button" className={styles.help} onClick={() => navigateTo('/#support')}>
          <HelpCircle size={18} />
          <span>Need help?</span>
        </button>
      </header>

      <div className={styles.progress}>
        <div>
          {STEPS.map((name, i) => (
            <button
              key={name}
              type="button"
              className={i === step ? styles.currentStep : i < step ? styles.completeStep : ''}
              onClick={() => i < step && setStep(i)}
            >
              <i>{i < step ? <Check size={16} /> : i + 1}</i>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      <main className={styles.layout}>
        <div className={styles.workflow}>
          <div className={styles.titleRow}>
            <div>
              <p>STEP {step + 1} OF 6</p>
              <h1>
                {step === 0 && 'Where should we pick up?'}
                {step === 1 && 'Where should we deliver?'}
                {step === 2 && 'Luggage & item details'}
                {step === 3 && 'Security & custody level'}
                {step === 4 && 'When should we pick up?'}
                {step === 5 && 'Review and confirm'}
              </h1>
              <span>
                {step === 0 && 'Enter your home, hotel, or airport terminal pickup address.'}
                {step === 1 && 'Enter the recipient or destination flight terminal details.'}
                {step === 2 && 'Select baggage size, count, and declared value.'}
                {step === 3 && 'Choose tamper-evident sealing and OTP delivery controls.'}
                {step === 4 && 'Choose immediate courier dispatch or scheduled transit.'}
                {step === 5 && 'Verify all route details and choose your payment method.'}
              </span>
            </div>
            <div className={styles.trustBadge}>
              <Luggage size={22} />
              <span>
                <strong>Airport & City Transit</strong>
                <small>Tamper-Evident Seals</small>
              </span>
            </div>
          </div>

          {error && <div className={styles.error} role="alert"><Info size={18} /> {error}</div>}
          {notice && <div className={styles.notice} role="status"><CheckCircle2 size={18} /> {notice}</div>}

          <div className={styles.stack}>
            {step === 0 && (
              <section className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <h2>Pickup Address & Contact</h2>
                    <p>Our courier partner will arrive here to collect your luggage.</p>
                  </div>
                </div>

                {savedAddresses.length > 0 && (
                  <div className={styles.savedGrid} style={{ marginBottom: '18px' }}>
                    {savedAddresses.map((addr) => (
                      <button key={addr.id} type="button" onClick={() => applySavedAddress('pickup', addr)}>
                        <MapPin size={20} />
                        <span>
                          <strong>{addr.label}</strong>
                          <small>{addr.addressLine1}, {addr.city}</small>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                )}

                <div className={styles.fieldGrid}>
                  <label>
                    <span>Contact Person Name *</span>
                    <input
                      value={draft.pickup.contactName}
                      onChange={(e) => update('pickup', 'contactName', e.target.value)}
                      placeholder="e.g. Ravi Kishan"
                      required
                    />
                  </label>

                  <label>
                    <span>Mobile Number *</span>
                    <div className={styles.phoneInput}>
                      <input value="+91" readOnly />
                      <input
                        value={draft.pickup.phoneNumber}
                        onChange={(e) => update('pickup', 'phoneNumber', e.target.value)}
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </label>

                  <label className={styles.wideField}>
                    <span>Pickup Address Line (Hotel / Residence / Terminal) *</span>
                    <input
                      value={draft.pickup.addressLine1}
                      onChange={(e) => update('pickup', 'addressLine1', e.target.value)}
                      placeholder="Hotel name, room/flat number, building, street"
                      required
                    />
                  </label>

                  <label>
                    <span>City *</span>
                    <input
                      value={draft.pickup.city}
                      onChange={(e) => update('pickup', 'city', e.target.value)}
                      placeholder="City"
                      required
                    />
                  </label>

                  <label>
                    <span>State *</span>
                    <input
                      value={draft.pickup.state}
                      onChange={(e) => update('pickup', 'state', e.target.value)}
                      placeholder="State"
                      required
                    />
                  </label>

                  <label className={styles.wideField}>
                    <span>Postal Code (6 digits) *</span>
                    <input
                      value={draft.pickup.postalCode}
                      onChange={(e) => update('pickup', 'postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 110001"
                      required
                    />
                  </label>
                </div>

                <button type="button" className={styles.saveAddress} disabled={working} onClick={() => saveCurrentAddress('pickup')}>
                  <Save size={16} /> Save address for future bookings
                </button>
              </section>
            )}

            {step === 1 && (
              <section className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <h2>Destination / Airport Drop-off</h2>
                    <p>Where your luggage will be delivered safely.</p>
                  </div>
                </div>

                {savedAddresses.length > 0 && (
                  <div className={styles.savedGrid} style={{ marginBottom: '18px' }}>
                    {savedAddresses.map((addr) => (
                      <button key={addr.id} type="button" onClick={() => applySavedAddress('dropoff', addr)}>
                        <MapPin size={20} />
                        <span>
                          <strong>{addr.label}</strong>
                          <small>{addr.addressLine1}, {addr.city}</small>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                )}

                <div className={styles.fieldGrid}>
                  <label>
                    <span>Recipient / Flight Terminal Desk *</span>
                    <input
                      value={draft.dropoff.contactName}
                      onChange={(e) => update('dropoff', 'contactName', e.target.value)}
                      placeholder="e.g. Terminal 3 Gate 4 Desk / Aman"
                      required
                    />
                  </label>

                  <label>
                    <span>Recipient Mobile Number *</span>
                    <div className={styles.phoneInput}>
                      <input value="+91" readOnly />
                      <input
                        value={draft.dropoff.phoneNumber}
                        onChange={(e) => update('dropoff', 'phoneNumber', e.target.value)}
                        placeholder="9876543211"
                        required
                      />
                    </div>
                  </label>

                  <label className={styles.wideField}>
                    <span>Destination Address / Airport Terminal *</span>
                    <input
                      value={draft.dropoff.addressLine1}
                      onChange={(e) => update('dropoff', 'addressLine1', e.target.value)}
                      placeholder="Airport terminal gate, hotel address, or residence"
                      required
                    />
                  </label>

                  <label>
                    <span>City *</span>
                    <input
                      value={draft.dropoff.city}
                      onChange={(e) => update('dropoff', 'city', e.target.value)}
                      placeholder="City"
                      required
                    />
                  </label>

                  <label>
                    <span>State *</span>
                    <input
                      value={draft.dropoff.state}
                      onChange={(e) => update('dropoff', 'state', e.target.value)}
                      placeholder="State"
                      required
                    />
                  </label>

                  <label className={styles.wideField}>
                    <span>Postal Code (6 digits) *</span>
                    <input
                      value={draft.dropoff.postalCode}
                      onChange={(e) => update('dropoff', 'postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 110037"
                      required
                    />
                  </label>
                </div>

                <button type="button" className={styles.saveAddress} disabled={working} onClick={() => saveCurrentAddress('dropoff')}>
                  <Save size={16} /> Save address for future bookings
                </button>
              </section>
            )}

            {step === 2 && (
              <section className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <h2>Luggage Bag & Item Details</h2>
                    <p>Select baggage dimensions and piece count.</p>
                  </div>
                </div>

                <div className={styles.envelopeGrid}>
                  {[
                    { id: 'A4', title: 'Cabin Bag / Small', desc: 'Up to 7 kg • Backpack / Duffel' },
                    { id: 'LEGAL', title: 'Medium Suitcase', desc: 'Up to 15 kg • Standard Trolley' },
                    { id: 'LARGE', title: 'Large Luggage', desc: 'Up to 30 kg • Heavy Check-in' },
                  ].map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      className={`${styles.selectCard} ${draft.document.envelopeSize === size.id ? styles.selectedCard : ''}`}
                      onClick={() => update('document', 'envelopeSize', size.id)}
                    >
                      <div className={styles.cardIcon}><Luggage size={22} /></div>
                      <div className={styles.cardCopy}>
                        <strong>{size.title}</strong>
                        <small>{size.desc}</small>
                      </div>
                      <i>{draft.document.envelopeSize === size.id ? <Check size={14} /> : null}</i>
                    </button>
                  ))}
                </div>

                <div className={styles.counterRow}>
                  <div>
                    <strong>Number of Bags / Pieces</strong>
                    <small>Specify the exact count for verified handover tag generation.</small>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => update('document', 'pageCount', Math.max(1, draft.document.pageCount - 1))}
                    >
                      <Minus size={15} />
                    </button>
                    <input value={draft.document.pageCount} readOnly />
                    <button
                      type="button"
                      onClick={() => update('document', 'pageCount', Math.min(20, draft.document.pageCount + 1))}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <div className={styles.textareaField} style={{ marginTop: '18px' }}>
                  <span>Luggage Description / Flight Info</span>
                  <textarea
                    value={draft.document.description}
                    onChange={(e) => update('document', 'description', e.target.value)}
                    placeholder="e.g. 2 Blue Samsonite trolley bags, Flight AI-804"
                  />
                </div>

                <label className={styles.compliance}>
                  <input
                    type="checkbox"
                    checked={draft.document.complianceAccepted}
                    onChange={(e) => update('document', 'complianceAccepted', e.target.checked)}
                  />
                  <span>
                    <strong>Aviation & Transport Safety Compliance</strong>
                    <small>I certify that this luggage does not contain hazardous, flammable, or contraband materials under civil aviation laws.</small>
                  </span>
                </label>
              </section>
            )}

            {step === 3 && (
              <section className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <h2>Security & Custody Controls</h2>
                    <p>Choose tamper protection and handover protocols.</p>
                  </div>
                </div>

                <div className={styles.cardList}>
                  {[
                    { id: 'SECURE_SEAL', title: 'Standard Secure Seal', desc: 'Barcoded poly-seal and delivery status alerts.' },
                    { id: 'TAMPER_EVIDENT', title: 'Tamper-Evident Security Seal', desc: 'Numbered void-tape security seal with photographed custody log.' },
                    { id: 'CHAIN_OF_CUSTODY', title: 'Chain of Custody (Strict)', desc: 'Dedicated direct-route rider with GPS milestone telemetry.' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      className={`${styles.selectCard} ${draft.security.level === sec.id ? styles.selectedCard : ''}`}
                      onClick={() => update('security', 'level', sec.id)}
                    >
                      <div className={styles.cardIcon}><ShieldCheck size={22} /></div>
                      <div className={styles.cardCopy}>
                        <strong>{sec.title}</strong>
                        <small>{sec.desc}</small>
                      </div>
                      <i>{draft.security.level === sec.id ? <Check size={14} /> : null}</i>
                    </button>
                  ))}
                </div>

                <div className={styles.speedGrid} style={{ marginTop: '18px' }}>
                  {[
                    { id: 'STANDARD', title: 'Standard Speed', desc: 'Delivery within 4-6 hours' },
                    { id: 'PRIORITY', title: 'Priority Express', desc: 'Delivery within 2-3 hours (Airport Urgent)' },
                    { id: 'EXPRESS', title: 'Direct Transit', desc: 'Direct direct-rider delivery without hub stops' },
                  ].map((speed) => (
                    <button
                      key={speed.id}
                      type="button"
                      className={`${styles.selectCard} ${draft.deliverySpeed === speed.id ? styles.selectedCard : ''}`}
                      onClick={() => update('deliverySpeed', speed.id)}
                    >
                      <div className={styles.cardIcon}><Clock3 size={22} /></div>
                      <div className={styles.cardCopy}>
                        <strong>{speed.title}</strong>
                        <small>{speed.desc}</small>
                      </div>
                      <i>{draft.deliverySpeed === speed.id ? <Check size={14} /> : null}</i>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 4 && (
              <section className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div>
                    <h2>Schedule Pickup</h2>
                    <p>Choose when our rider should collect your bags.</p>
                  </div>
                </div>

                <div className={styles.twoColumns}>
                  <button
                    type="button"
                    className={`${styles.selectCard} ${draft.schedule.type === 'ASAP' ? styles.selectedCard : ''}`}
                    onClick={() => update('schedule', 'type', 'ASAP')}
                  >
                    <div className={styles.cardIcon}><Clock3 size={24} /></div>
                    <div className={styles.cardCopy}>
                      <strong>Immediate Pickup (ASAP)</strong>
                      <small>Courier is dispatched within 15-30 minutes.</small>
                    </div>
                    <i>{draft.schedule.type === 'ASAP' ? <Check size={14} /> : null}</i>
                  </button>

                  <button
                    type="button"
                    className={`${styles.selectCard} ${draft.schedule.type === 'SCHEDULED' ? styles.selectedCard : ''}`}
                    onClick={() => update('schedule', 'type', 'SCHEDULED')}
                  >
                    <div className={styles.cardIcon}><CalendarDays size={24} /></div>
                    <div className={styles.cardCopy}>
                      <strong>Scheduled Pickup</strong>
                      <small>Choose your departure or hotel checkout time.</small>
                    </div>
                    <i>{draft.schedule.type === 'SCHEDULED' ? <Check size={14} /> : null}</i>
                  </button>
                </div>

                {draft.schedule.type === 'SCHEDULED' && (
                  <div className={styles.dateField}>
                    <span>Pickup Date & Time</span>
                    <input
                      type="datetime-local"
                      value={draft.schedule.scheduledPickupAt}
                      onChange={(e) => update('schedule', 'scheduledPickupAt', e.target.value)}
                    />
                  </div>
                )}
              </section>
            )}

            {step === 5 && (
              <div className={styles.reviewLayout}>
                <section className={styles.reviewCards}>
                  <section>
                    <div>
                      <span><MapPin size={17} /></span>
                      <h2>Pickup Details</h2>
                      <button type="button" onClick={() => setStep(0)}>Edit</button>
                    </div>
                    <p>
                      <strong>{draft.pickup.contactName} ({draft.pickup.phoneNumber})</strong>
                      <span>{draft.pickup.addressLine1}</span>
                      <small>{draft.pickup.city}, {draft.pickup.state} - {draft.pickup.postalCode}</small>
                    </p>
                  </section>

                  <section>
                    <div>
                      <span><MapPin size={17} /></span>
                      <h2>Delivery Details</h2>
                      <button type="button" onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <p>
                      <strong>{draft.dropoff.contactName} ({draft.dropoff.phoneNumber})</strong>
                      <span>{draft.dropoff.addressLine1}</span>
                      <small>{draft.dropoff.city}, {draft.dropoff.state} - {draft.dropoff.postalCode}</small>
                    </p>
                  </section>
                </section>

                <section className={styles.fareCard}>
                  <dl className={styles.fareList}>
                    <div><dt>Base Transit Charge</dt><dd>₹{quote?.breakdown?.baseCharge ?? 199}</dd></div>
                    <div><dt>Distance ({quote?.distanceKm ?? 10} km)</dt><dd>₹{quote?.breakdown?.distanceCharge ?? 120}</dd></div>
                    <div><dt>Tamper-Evident Security Seal</dt><dd>₹{quote?.breakdown?.securityCharge ?? 49}</dd></div>
                    <div><dt>Handover Verification & OTP</dt><dd>₹{quote?.breakdown?.handoverCharge ?? 29}</dd></div>
                    <div><dt>GST / Applicable Taxes</dt><dd>₹{quote?.breakdown?.taxAmount ?? 71}</dd></div>
                    <div className={styles.totalRow}><dt>Total Amount</dt><dd>₹{quote?.totalAmount ?? 468}</dd></div>
                  </dl>
                </section>

                <section className={styles.paymentSelection}>
                  <div>
                    <h2>Choose Payment Method</h2>
                    <p>Select how you wish to pay for your luggage delivery.</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`${styles.selectCard} ${draft.paymentMethod === 'PAY_ON_DELIVERY' ? styles.selectedCard : ''}`}
                      onClick={() => update('paymentMethod', null, 'PAY_ON_DELIVERY')}
                    >
                      <div className={styles.cardIcon}><PackageCheck size={22} /></div>
                      <div className={styles.cardCopy}>
                        <strong>Pay on Delivery / Cash</strong>
                        <small>Pay our rider via Cash or UPI QR on delivery.</small>
                      </div>
                      <i>{draft.paymentMethod === 'PAY_ON_DELIVERY' ? <Check size={14} /> : null}</i>
                    </button>

                    <button
                      type="button"
                      className={`${styles.selectCard} ${draft.paymentMethod === 'ONLINE' ? styles.selectedCard : ''}`}
                      onClick={() => update('paymentMethod', null, 'ONLINE')}
                    >
                      <div className={styles.cardIcon}><ShieldCheck size={22} /></div>
                      <div className={styles.cardCopy}>
                        <strong>Pay Online (UPI / Cards)</strong>
                        <small>Complete instant sandbox payment gateway checkout.</small>
                      </div>
                      <i>{draft.paymentMethod === 'ONLINE' ? <Check size={14} /> : null}</i>
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        <aside className={styles.summary}>
          <p>LUGGAGE DELIVERY SUMMARY</p>
          <h2><Luggage size={18} /> Booking Quote</h2>
          <dl>
            <div><dt>Baggage Size</dt><dd>{draft.document.envelopeSize}</dd></div>
            <div><dt>Pieces Count</dt><dd>{draft.document.pageCount} Bags</dd></div>
            <div><dt>Security Protocol</dt><dd>{draft.security.level.replace(/_/g, ' ')}</dd></div>
            <div><dt>Transit Speed</dt><dd>{draft.deliverySpeed}</dd></div>
          </dl>

          <div className={styles.summaryTotal}>
            <span>Estimated Total</span>
            <strong>{quoteLoading ? '...' : ('₹' + (quote?.totalAmount ?? 468))}</strong>
          </div>
        </aside>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerStep}>
            <small>STEP {step + 1} OF 6</small>
            <strong>{STEPS[step]}</strong>
          </div>

          <button type="button" className={styles.backButton} onClick={back} disabled={working}>
            <ArrowLeft size={16} /> {step === 0 ? 'Dashboard' : 'Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" className={styles.continueButton} onClick={next}>
              Continue to {STEPS[step + 1]} <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className={styles.continueButton} onClick={confirmBooking} disabled={working}>
              {working ? 'Scheduling Booking...' : 'Confirm Luggage Booking'}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default LuggageDeliveryBookingPage
