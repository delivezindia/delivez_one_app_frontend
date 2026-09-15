import { ChevronRight } from 'lucide-react'
import styles from './ServiceCard.module.css'

const serviceImageMap = {
  'courier-delivery': '/assets/images/service_courier.jpg',
  'personal-courier': '/assets/images/service_courier.jpg',
  'confidential-delivery': '/assets/images/service_confidential.jpg',
  'confidential-courier': '/assets/images/service_confidential.jpg',
  'return-pickup': '/assets/images/service_return.jpg',
  'personal-return-pickup': '/assets/images/service_return.jpg',
  'forgot-something': '/assets/images/service_forgot.jpg',
  'luggage-delivery': '/assets/images/service_airport.jpg',
  'airport-luggage': '/assets/images/service_airport.jpg',
  'gift-delivery': '/assets/images/service_special.jpg',
  'special-delivery': '/assets/images/service_special.jpg',
  'know-more': '/assets/images/service_special.jpg',
}

const serviceSubtitles = {
  'courier-delivery': 'Local to Pan India',
  'personal-courier': 'Local to Pan India',
  'confidential-delivery': 'Secure & private',
  'confidential-courier': 'Secure & private',
  'return-pickup': 'Easy returns',
  'personal-return-pickup': 'Easy returns',
  'forgot-something': 'Instant retrieval',
  'luggage-delivery': 'Door-to-airport convenience',
  'airport-luggage': 'Door-to-airport convenience',
  'gift-delivery': 'Custom delivery solutions',
  'special-delivery': 'Custom delivery solutions',
  'know-more': 'Custom delivery solutions',
}

function ServiceCard({ service, onBook }) {
  const Icon = service.icon
  const isKnowMore = service.slug === 'know-more' || service.title === 'Special Delivery' || service.title === 'Know More'
  const fallbackImage = serviceImageMap[service.slug] || '/assets/images/service_courier.jpg'
  const imageSrc = service.imageUrl || fallbackImage
  const subtitle = service.subtitle || serviceSubtitles[service.slug] || (service.available ? 'Available across India' : 'Coming soon')

  return (
    <article
      className={styles.card}
      onClick={() => service.available && onBook(service)}
      role="button"
      tabIndex={service.available ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && service.available) {
          e.preventDefault()
          onBook(service)
        }
      }}
    >
      <div className={styles.imageContainer}>
        <img
          src={imageSrc}
          alt={service.title}
          className={styles.cardImage}
          onError={(e) => {
            if (e.currentTarget.src !== fallbackImage) {
              e.currentTarget.src = fallbackImage
            }
          }}
        />
        <div className={styles.iconFallback}>
          {Icon && <Icon size={32} />}
        </div>
      </div>

      <div className={styles.contentBody}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{service.title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.cardBottomRow}>
          <p className={styles.description}>{service.description}</p>
          <button
            type="button"
            className={styles.actionBtn}
            disabled={!service.available}
            aria-label={isKnowMore ? 'Know More' : 'Book ' + service.title}
            onClick={(e) => {
              e.stopPropagation()
              onBook(service)
            }}
          >
            <ChevronRight size={17} className={styles.arrowIcon} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ServiceCard

