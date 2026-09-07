import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  clearAdminSession,
  fetchAdminProfile,
  getAdminAccessToken,
  loginAdmin,
} from '@/features/admin-auth/services/adminAuthService.js'
import { ApiError } from '@/services/api/apiClient.js'
import styles from './AdminLoginPage.module.css'

function getRouteMessage() {
  const reason = new URLSearchParams(window.location.search).get('reason')
  if (reason === 'forbidden') return 'This account does not have administrator access.'
  if (reason === 'expired') return 'Your administrator session expired. Please log in again.'
  return ''
}

function AdminLoginPage() {
  const [loginMethod, setLoginMethod] = useState('phone') // 'phone' | 'email'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(getRouteMessage)

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      if (!getAdminAccessToken()) return

      try {
        await fetchAdminProfile()
        if (active) navigateTo('/dashboard')
      } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
          clearAdminSession()
          return
        }
        if (active) setErrorMessage(error?.message ?? 'Unable to restore the administrator session.')
      }
    }

    restoreSession()
    return () => { active = false }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')
    const form = new FormData(event.currentTarget)

    try {
      if (loginMethod === 'email') {
        await loginAdmin({
          email: form.get('email').trim(),
          password: form.get('password'),
          rememberMe: form.get('rememberMe') === 'on',
        })
      } else {
        await loginAdmin({
          countryCode: form.get('countryCode').trim(),
          mobileNumber: form.get('mobileNumber').trim(),
          password: form.get('password'),
          rememberMe: form.get('rememberMe') === 'on',
        })
      }
      await fetchAdminProfile()
      navigateTo('/dashboard')
    } catch (error) {
      clearAdminSession()

      if (error instanceof ApiError) {
        if (error.status === 401) setErrorMessage('The login credentials or password are incorrect.')
        else if (error.status === 403) setErrorMessage('These credentials do not belong to an administrator.')
        else setErrorMessage(error.message)
      } else {
        setErrorMessage('Administrator login failed. Please check that the backend server is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <button className={styles.brand} type="button" onClick={() => navigateTo('/')}>
          <span>Delivez</span><b>ONE</b>
        </button>
        <div className={styles.brandCopy}>
          <span className={styles.shield}><ShieldCheck size={31} /></span>
          <p>SECURE ADMINISTRATION</p>
          <h1>Run every delivery from one command center.</h1>
          <span>Manage services, orders, partners, customers, payments, and live operations securely.</span>
        </div>
        <div className={styles.securityNote}>
          <LockKeyhole size={19} />
          <span><strong>Administrator-only access</strong><small>Public registration cannot create admin accounts.</small></span>
        </div>
      </section>

      <section className={styles.formPanel}>
        <button className={styles.backButton} type="button" onClick={() => navigateTo('/')}><ArrowLeft size={17} /> Back to website</button>

        <div className={styles.formContainer}>
          <span className={styles.formIcon}><KeyRound size={24} /></span>
          <p className={styles.eyebrow}>ADMIN PORTAL</p>
          <h2>Welcome back</h2>
          <p className={styles.intro}>Sign in with the administrator account provisioned by your server.</p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: loginMethod === 'phone' ? '2px solid var(--color-danger, #e00014)' : '1px solid #dce0e4',
                background: loginMethod === 'phone' ? 'rgba(224, 0, 20, 0.06)' : '#fff',
                fontWeight: loginMethod === 'phone' ? '700' : '500',
                color: loginMethod === 'phone' ? 'var(--color-danger, #e00014)' : '#555',
                cursor: 'pointer',
                fontSize: '0.78rem',
              }}
            >
              Mobile Number
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: loginMethod === 'email' ? '2px solid var(--color-danger, #e00014)' : '1px solid #dce0e4',
                background: loginMethod === 'email' ? 'rgba(224, 0, 20, 0.06)' : '#fff',
                fontWeight: loginMethod === 'email' ? '700' : '500',
                color: loginMethod === 'email' ? 'var(--color-danger, #e00014)' : '#555',
                cursor: 'pointer',
                fontSize: '0.78rem',
              }}
            >
              Email Address
            </button>
          </div>

          {errorMessage && <div className={styles.error} role="alert">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            {loginMethod === 'email' ? (
              <label>
                Email address
                <div className={styles.phoneField}>
                  <Mail size={18} />
                  <input
                    name="email"
                    type="email"
                    placeholder="admin@delevez.com"
                    aria-label="Email address"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>
            ) : (
              <label>
                Mobile number
                <div className={styles.phoneField}>
                  <Smartphone size={18} />
                  <input className={styles.countryCode} name="countryCode" defaultValue="+91" aria-label="Country code" required pattern="\+[0-9]{1,4}" />
                  <span />
                  <input name="mobileNumber" type="tel" placeholder="9999999999" aria-label="Mobile number" autoComplete="tel-national" required pattern="[0-9]{7,15}" />
                </div>
              </label>
            )}

            <label>
              Password
              <div className={styles.passwordField}>
                <LockKeyhole size={18} />
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your admin password" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input name="rememberMe" type="checkbox" />
                <span /> Remember me on this device
              </label>
            </div>

            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? <><LoaderCircle size={19} /> Verifying...</> : <>Sign in to dashboard <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className={styles.help}>Default credentials: admin@delevez.com / +91 9999999999 (Admin@123456)</p>
        </div>
      </section>
    </main>
  )
}

export default AdminLoginPage
