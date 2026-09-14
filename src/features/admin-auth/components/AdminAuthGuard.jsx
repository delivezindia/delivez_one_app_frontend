import { useEffect, useState } from 'react'
import { CircleAlert, LoaderCircle, ShieldAlert } from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  clearAdminSession,
  fetchAdminProfile,
  getAdminAccessToken,
  getStoredAdminProfile,
} from '@/features/admin-auth/services/adminAuthService.js'
import styles from './AdminAuthGuard.module.css'

function AdminAuthGuard({ children }) {
  const [status, setStatus] = useState('checking')
  const [errorMessage, setErrorMessage] = useState('')
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    const verifyAdministrator = async () => {
      setStatus('checking')
      setErrorMessage('')
      setIsRateLimited(false)

      if (!getAdminAccessToken()) {
        navigateTo('/admin/login')
        return
      }

      try {
        await fetchAdminProfile()
        if (active) setStatus('authenticated')
      } catch (error) {
        if (!active) return

        if (error?.status === 401 || error?.status === 403) {
          clearAdminSession()
          const reason = error?.status === 403 ? 'forbidden' : 'expired'
          navigateTo(`/admin/login?reason=${reason}`)
          return
        }

        // If rate limited (status 429), check if we have a cached admin profile to restore
        if (error?.status === 429) {
          const cachedProfile = getStoredAdminProfile()
          if (cachedProfile) {
            console.warn('[AdminAuthGuard] Server returned 429 Rate Limit. Restoring session from cached admin profile.')
            setStatus('authenticated')
            return
          }
          setIsRateLimited(true)
          setErrorMessage('Too many requests. The API rate limit has been reached on the server (HTTP 429). Please wait a moment before trying again.')
          setStatus('error')
          return
        }

        setErrorMessage(error?.message ?? 'Unable to verify administrator access.')
        setStatus('error')
      }
    }

    verifyAdministrator()
    return () => { active = false }
  }, [retryKey])

  if (status === 'error') {
    return (
      <main className={styles.loading} aria-live="polite">
        {isRateLimited ? (
          <ShieldAlert className={styles.errorIcon} size={36} color="#fab800" />
        ) : (
          <CircleAlert className={styles.errorIcon} size={30} />
        )}
        <h1>{isRateLimited ? 'Server Rate Limit Reached (429)' : 'Could not reach the administrator API'}</h1>
        <p>{errorMessage}</p>
        <div className={styles.actions}>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
            Try again
          </button>
          <button
            className={styles.secondaryAction}
            type="button"
            onClick={() => {
              clearAdminSession()
              navigateTo('/admin/login')
            }}
          >
            Use another account
          </button>
        </div>
      </main>
    )
  }

  if (status !== 'authenticated') {
    return (
      <main className={styles.loading} aria-live="polite">
        <LoaderCircle className={styles.spinner} size={28} />
        <p>Verifying administrator access…</p>
      </main>
    )
  }

  return children
}

export default AdminAuthGuard
