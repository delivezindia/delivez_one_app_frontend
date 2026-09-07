import {
  ArrowRight,
  Box,
  Check,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'
import styles from './BookingForm.module.css'

const journey = [
  { title: 'Pickup', icon: MapPin },
  { title: 'Drop-off', icon: MapPin },
  { title: 'Service', icon: Truck },
  { title: 'Package', icon: Box },
  { title: 'Packaging', icon: PackageCheck },
  { title: 'Content', icon: PackageCheck },
  { title: 'Insurance', icon: ShieldCheck },
  { title: 'Confirm', icon: Check },
]

function BookingForm() {
  const signedIn = Boolean(getUserAccessToken())
  const hasDraft = Boolean(window.sessionStorage.getItem('delivez-personal-courier-draft-v1'))
  const buttonLabel = !signedIn ? 'Sign in & Start Booking' : hasDraft ? 'Resume Your Booking' : 'Start Step-by-Step Booking'

  return (
    <section className={styles.card} id="book-delivery" aria-labelledby="booking-heading">
      <div className={styles.headingRow}>
        <span><PackageCheck size={25} /></span>
        <div><p>PERSONAL COURIER</p><h2 id="booking-heading">Book with confidence</h2></div>
        <b>Available</b>
      </div>
      <p className={styles.intro}>A guided booking captures every delivery detail in the right order and calculates the final price securely on the server.</p>

      <ol className={styles.journey} aria-label="Personal Courier booking steps">
        {journey.map(({ title, icon: Icon }, index) => (
          <li key={title}><span><Icon size={16} /></span><div><small>Step {index + 1}</small><strong>{title}</strong></div></li>
        ))}
      </ol>

      <div className={styles.assurance}><ShieldCheck size={18} /><span><strong>Your progress is saved</strong><small>Sign in once, complete the eight steps, then review before confirming.</small></span></div>
      <button className={styles.submitButton} type="button" onClick={() => navigateTo('/book/personal-courier')}>{buttonLabel} <ArrowRight size={20} /></button>
    </section>
  )
}

export default BookingForm
