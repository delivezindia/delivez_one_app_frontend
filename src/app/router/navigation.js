export function navigateTo(destination) {
  const url = new URL(destination, window.location.origin)
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
  window.dispatchEvent(new PopStateEvent('popstate'))

  requestAnimationFrame(() => {
    if (url.hash) {
      document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

export function scrollToCurrentHash() {
  const hash = window.location.hash
  if (!hash) return
  window.requestAnimationFrame(() => {
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
