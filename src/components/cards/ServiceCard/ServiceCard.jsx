import { ArrowRight } from 'lucide-react'
import styles from './ServiceCard.module.css'

function ServiceCard({ service, onBook }) {
  const Icon = service.icon
  return (
    <article
      className={styles.card}
      style={{ '--card-tint': service.tint, '--card-accent': service.accent, cursor: service.available ? 'pointer' : 'default' }}
      onClick={() => service.available && onBook(service)}
    >
      <span className={styles.number}>{service.number}</span>
      <span className={`${styles.availability} ${service.available ? styles.live : ''}`}>{service.available ? 'Available' : 'Coming soon'}</span>
      <div className={styles.artwork} aria-hidden="true"><span className={styles.artworkShadow} />{service.imageUrl ? <img src={service.imageUrl} alt="" /> : <Icon size={68} strokeWidth={1.65} />}</div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <button
        type="button"
        disabled={!service.available}
        onClick={(e) => {
          e.stopPropagation();
          onBook(service);
        }}
      >
        {service.available ? 'Start Booking' : 'Not Available Yet'} {service.available && <ArrowRight size={18} />}
      </button>
    </article>
  )
}

export default ServiceCard
