export const SERVICE_CATALOG = [
  {
    name: 'Courier',
    slug: 'courier-delivery',
    subtitle: 'Local to Pan India',
    tagline: 'Local to Pan India',
    shortDescription: 'Send documents & parcels anywhere in India.',
    displayOrder: 1,
  },
  {
    name: 'Confidential Delivery',
    slug: 'confidential-delivery',
    subtitle: 'Secure & private',
    tagline: 'Secure & private',
    shortDescription: 'For sensitive documents and high-value items.',
    displayOrder: 2,
  },
  {
    name: 'Return Pickup',
    slug: 'return-pickup',
    subtitle: 'Easy returns',
    tagline: 'Easy returns',
    shortDescription: 'Schedule a pickup for your online returns.',
    displayOrder: 3,
  },
  {
    name: 'Forgot Something?',
    slug: 'forgot-something',
    subtitle: 'Instant retrieval',
    tagline: 'Instant retrieval',
    shortDescription: 'We pick up and deliver what you forgot.',
    displayOrder: 4,
  },
  {
    name: 'Airport Luggage',
    slug: 'luggage-delivery',
    subtitle: 'Door-to-airport convenience',
    tagline: 'Door-to-airport convenience',
    shortDescription: 'Luggage pickup & delivery to/from airport.',
    displayOrder: 5,
  },
  {
    name: 'Special Delivery',
    slug: 'know-more',
    subtitle: 'Custom delivery solutions',
    tagline: 'Custom delivery solutions',
    shortDescription: 'For unique and special requirements.',
    displayOrder: 6,
  },
]

const SLUG_ALIASES = {
  'personal-courier': 'courier-delivery',
  'airport-luggage': 'luggage-delivery',
  'confidential-courier': 'confidential-delivery',
  'personal-return-pickup': 'return-pickup',
  'gift-delivery': 'know-more',
  'gift-and-surprise': 'know-more',
  'special-delivery': 'know-more',
}

export function getServiceBySlug(rawSlug) {
  if (!rawSlug) return null
  const slug = SLUG_ALIASES[rawSlug] || rawSlug
  return (
    SERVICE_CATALOG.find((service) => service.slug === slug || service.slug === rawSlug) ??
    null
  )
}

export function mergeServiceCatalog(services = []) {
  const liveServices = new Map()

  for (const service of services) {
    if (service.slug === 'more-services' || service.displayOrder >= 90) continue
    liveServices.set(service.slug, service)
    if (SLUG_ALIASES[service.slug]) {
      liveServices.set(SLUG_ALIASES[service.slug], service)
    }
  }

  const merged = SERVICE_CATALOG.map((fallback) => {
    const live = liveServices.get(fallback.slug) ?? {}
    return {
      ...fallback,
      ...live,
      name: live.name || fallback.name,
      subtitle: (live.description && !live.description.startsWith('[') ? live.description : null) || fallback.subtitle,
      shortDescription: live.shortDescription || fallback.shortDescription,
      displayOrder: typeof live.displayOrder === 'number' ? live.displayOrder : fallback.displayOrder,
      imageUrl: live.imageUrl || null,
      available: true,
    }
  })

  // Sort by displayOrder ascending so Row 1 has Courier & Confidential Delivery, etc.
  return merged.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99))
}

