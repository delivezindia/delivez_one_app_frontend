import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  clearUserSession,
  fetchCurrentUser,
  getStoredUser,
  getUserAccessToken,
} from '@/features/auth/services/userAuthService.js'
import styles from './UserAuthGuard.module.css'

function UserAuthGuard({ children }) {
  const [state, setState] = useState(() => {
    const token = getUserAccessToken()
    const user = getStoredUser()
    return {
      checking: !token || !user,
      error: '',
    }
  })
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const loginPath = `/login?returnTo=${encodeURIComponent(returnTo)}`

    const token = getUserAccessToken()
    if (!token) {
      const redirectTimer = window.setTimeout(() => navigateTo(loginPath), 0)
      return () => window.clearTimeout(redirectTimer)
    }

    if (!getStoredUser()) {
      setState({ checking: true, error: '' })
    }

    fetchCurrentUser()
      .then(() => {
        if (active) setState({ checking: false, error: '' })
      })
      .catch((error) => {
        if (!active) return
        if (error?.status === 401 || error?.status === 403) {
          clearUserSession()
          navigateTo(loginPath)
          return
        }
        if (getStoredUser()) {
          setState({ checking: false, error: '' })
          return
        }
        setState({
          checking: false,
          error: error?.message ?? 'Unable to verify your account.',
        })
      })

    return () => { active = false }
  }, [retryKey])

  if (state.error) {
    return (
      <main className={styles.statePage}>
        <section>
          <h1>Could not load your account</h1>
          <p>{state.error}</p>
          <div>
            <button type="button" onClick={() => setRetryKey((key) => key + 1)}>Try again</button>
            <button className={styles.secondary} type="button" onClick={() => navigateTo('/')}>Go home</button>
          </div>
        </section>
      </main>
    )
  }

  if (state.checking) {
    return (
      <main className={styles.statePage}>
        <div className={styles.loading}><LoaderCircle /><p>Loading your account…</p></div>
      </main>
    )
  }

  return children
}

export default UserAuthGuard
