import { useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import DummyPaymentGateway from '@/features/payments/components/DummyPaymentGateway.jsx'
import { fetchSandboxPaymentBooking } from '@/features/payments/services/sandboxPaymentService.js'

function SandboxPaymentPage({ serviceSlug, bookingId }) {
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    let active = true
    fetchSandboxPaymentBooking(serviceSlug, bookingId)
      .then((result) => {
        if (!active) return
        const isPayOnDelivery = result.paymentMethod === 'PAY_ON_DELIVERY' || result.paymentMethod === 'CASH'
        if (isPayOnDelivery) setError('This booking uses pay on delivery and does not need online payment.')
        else if (result.paymentStatus === 'PAID') setComplete(true)
        setBooking(result)
      })
      .catch((requestError) => active && setError(requestError.message))
    return () => { active = false }
  }, [serviceSlug, bookingId])

  const getTrackUrl = () => {
    if (!booking) return '/user/dashboard'
    const id = booking.bookingNumber || booking.id
    if (serviceSlug === 'forgot-something' || serviceSlug === 'fetch') return `/track/forgot-something/${id}`
    if (serviceSlug === 'gift-delivery' || serviceSlug === 'gifts') return `/gift-delivery/track/${id}`
    if (serviceSlug === 'return-pickup' || serviceSlug === 'returns') return `/return-pickup/track/${id}`
    if (serviceSlug === 'confidential-delivery' || serviceSlug === 'confidential-courier') return `/vault/track/${id}`
    return `/track/courier/${id}`
  }

  if (!booking && !error) return <main style={stateStyle}><LoaderCircle style={{ animation: 'spin 1s linear infinite' }} /> Loading sandbox payment…</main>
  if (error) return <main style={stateStyle}><strong>{error}</strong><button style={buttonStyle} type="button" onClick={() => navigateTo('/user/dashboard')}>Return to dashboard</button></main>
  if (complete) return <main style={stateStyle}><CheckCircle2 color="#198346" size={46} /><h1 style={{ margin: 0 }}>Payment Complete!</h1><p style={{ margin: 0, color: '#68707a' }}>This retrieval booking is verified, paid, and confirmed.</p><button style={buttonStyle} type="button" onClick={() => navigateTo(getTrackUrl())}>Track Live Retrieval</button></main>

  return <DummyPaymentGateway booking={booking} serviceSlug={serviceSlug} onUpdate={setBooking} onSuccess={(paidBooking) => { setBooking(paidBooking); setComplete(true) }} />
}

const stateStyle = { minHeight: '100vh', display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 14, padding: 24, background: '#f4f6f8', fontFamily: 'Inter, sans-serif', textAlign: 'center' }
const buttonStyle = { minHeight: 44, padding: '0 18px', border: 0, borderRadius: 10, background: '#e00014', color: '#fff', fontWeight: 800, cursor: 'pointer' }

export default SandboxPaymentPage
