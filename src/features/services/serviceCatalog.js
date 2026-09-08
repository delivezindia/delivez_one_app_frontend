export const SERVICE_CATALOG = [
  {
    name: 'Courier Delivery',
    slug: 'courier-delivery',
    tagline: 'Deliver anywhere',
    shortDescription: 'Send documents, parcels, and everyday items anywhere.',
  },
  {
    name: 'Luggage Delivery',
    slug: 'luggage-delivery',
    tagline: 'Deliver your luggage',
    shortDescription: 'Convenient pickup and secure transit for your luggage.',
  },
  {
    name: 'Confidential Delivery',
    slug: 'confidential-delivery',
    tagline: 'Keep it private',
    shortDescription: 'Private and secure delivery with strict handling controls.',
  },
  {
    name: 'Forgot Something?',
    slug: 'forgot-something',
    tagline: 'Quick retrieval',
    shortDescription: 'Quick retrieval and delivery of items you left behind.',
  },
  {
    name: 'Return Pickup',
    slug: 'return-pickup',
    tagline: 'Easy returns',
    shortDescription: 'Easy pickup and returns for personal and retail orders.',
  },
  {
    name: 'Know More',
    slug: 'know-more',
    tagline: 'Custom & Enterprise',
    shortDescription: 'Explore our full range of tailored logistics, enterprise solutions, and 24/7 support.',
  },
]

const SLUG_ALIASES = {
  'personal-courier': 'courier-delivery',
  'airport-luggage': 'luggage-delivery',
  'confidential-courier': 'confidential-delivery',
  'personal-return-pickup': 'return-pickup',
  'gift-delivery': 'know-more',
  'gift-and-surprise': 'know-more',
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
    liveServices.set(service.slug, service)
    if (SLUG_ALIASES[service.slug]) {
      liveServices.set(SLUG_ALIASES[service.slug], service)
    }
  }

  return SERVICE_CATALOG.map((fallback) => {
    const live = liveServices.get(fallback.slug) ?? {}
    return {
      ...fallback,
      ...live,
      name: live.name || fallback.name,
      shortDescription: live.shortDescription || live.description || fallback.shortDescription,
      available: true,
    }
  })
}
