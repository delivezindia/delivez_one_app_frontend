import { useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Check,
  CreditCard,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { completeSandboxPayment } from '@/features/payments/services/sandboxPaymentService.js'
import styles from './DummyPaymentGateway.module.css'

const fallbackMethods = [
  { id: 'UPI', title: 'UPI', description: 'Simulate instant UPI approval.', icon: Smartphone },
  { id: 'CARD', title: 'Credit / Debit Card', description: 'No card number is requested.', icon: CreditCard },
  { id: 'WALLET', title: 'Digital Wallet', description: 'Simulate a wallet authorization.', icon: WalletCards },
  { id: 'NET_BANKING', title: 'Net Banking', description: 'Simulate bank authorization.', icon: Building2 },
]

function money(value, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value ?? 0))
}

function DummyPaymentGateway({ booking, serviceSlug, gatewayOptions, onSuccess, onUpdate }) {
  const methods = (gatewayOptions?.methods?.length ? gatewayOptions.methods : fallbackMethods).map((method) => ({
    ...method,
    icon: fallbackMethods.find(({ id }) => id === method.id)?.icon ?? CreditCard,
  }))
  const [method, setMethod] = useState(methods[0]?.id ?? 'UPI')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  const simulate = async (outcome) => {
    setWorking(true)
    setError('')
    try {
      const result = await completeSandboxPayment(serviceSlug, booking.id, { method, outcome })
      onUpdate?.(result.booking)
      if (result.payment.outcome === 'SUCCESS') onSuccess(result.booking)
      else setError('Dummy payment failed as requested. No money was charged—choose a method and try again.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setWorking(false)
    }
  }

  return (
    <main className={styles.page}>
      <header>
        <button type="button" onClick={() => navigateTo('/user/dashboard')} aria-label="Pay later and return to dashboard"><ArrowLeft /></button>
        <div><strong>DELIVEZ PAY</strong><span>SANDBOX CHECKOUT</span></div>
        <span><FlaskConical /></span>
      </header>

      <section className={styles.shell}>
        <div className={styles.sandboxBanner}><FlaskConical /><span><strong>Dummy payment gateway</strong><small>Testing only—no real payment, card number, UPI ID, or bank credentials are collected.</small></span></div>

        <section className={styles.amountCard}>
          <div><small>PAYMENT FOR</small><strong>{booking.bookingNumber}</strong></div>
          <p><small>Total amount</small><strong>{money(booking.totalAmount, booking.currency)}</strong></p>
        </section>

        <section className={styles.gatewayCard}>
          <div className={styles.cardHeading}><div><p>100% SANDBOX</p><h1>Choose payment method</h1><span>Select any method to simulate a successful transaction.</span></div><ShieldCheck /></div>
          <div className={styles.methods}>
            {methods.map(({ id, title, description, icon: Icon }) => (
              <button key={id} type="button" className={method === id ? styles.selected : ''} onClick={() => setMethod(id)}>
                <i>{method === id && <Check />}</i><span><Icon /></span><div><strong>{title}</strong><small>{description}</small></div>
              </button>
            ))}
          </div>

          {error && <div className={styles.error} role="alert">{error}</div>}

          <button type="button" className={styles.payButton} onClick={() => simulate('SUCCESS')} disabled={working}>
            {working ? <><LoaderCircle className={styles.spinner} /> Processing dummy payment…</> : <><LockKeyhole /> Simulate successful payment · {money(booking.totalAmount, booking.currency)}</>}
          </button>
          <button type="button" className={styles.failButton} onClick={() => simulate('FAILURE')} disabled={working}>Test failed payment</button>
          <button type="button" className={styles.laterButton} onClick={() => navigateTo('/user/dashboard')} disabled={working}>Pay later from dashboard</button>
        </section>

        <div className={styles.secureNote}><ShieldCheck /><span><strong>Safe development mode</strong><small>The backend verifies the stored booking amount and generates a clearly marked dummy reference.</small></span></div>
      </section>
    </main>
  )
}

export default DummyPaymentGateway
