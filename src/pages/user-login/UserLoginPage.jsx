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
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Truck,
  UserCheck,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import AuthModal from '@/features/auth/components/AuthModal.jsx'
import {
  fetchCurrentUser,
  getUserAccessToken,
  loginUser,
  resendUserOtp,
  verifyUserOtp,
} from '@/features/auth/services/userAuthService.js'
import { ApiError } from '@/services/api/apiClient.js'
import styles from './UserLoginPage.module.css'

function getReturnUrl() {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo')
  return returnTo || '/user/dashboard'
}

function UserLoginPage() {
  const [loginMethod, setLoginMethod] = useState('phone') // 'phone' | 'email'
  const [loginType, setLoginType] = useState('password') // 'password' | 'otp'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [signupModalOpen, setSignupModalOpen] = useState(false)
  const [otpChallenge, setOtpChallenge] = useState(null)
  const [otp, setOtp] = useState('')

  useEffect(() => {
    let active = true

    const checkExistingSession = async () => {
      if (!getUserAccessToken()) return

      try {
        await fetchCurrentUser()
        if (active) navigateTo(getReturnUrl())
      } catch {
        // Session invalid, continue showing login page
      }
    }

    checkExistingSession()
    return () => { active = false }
  }, [])

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')
    const form = new FormData(event.currentTarget)
    const rememberMe = form.get('rememberMe') === 'on'

    try {
      if (loginType === 'password') {
        const payload = loginMethod === 'email'
          ? {
            email: form.get('email')?.toString().trim(),
            password: form.get('password')?.toString(),
            rememberMe,
          }
          : {
            countryCode: form.get('countryCode')?.toString().trim(),
            mobileNumber: form.get('mobileNumber')?.toString().trim(),
            password: form.get('password')?.toString(),
            rememberMe,
          }

        const res = await loginUser(payload)
        if (!res.isOtp) {
          navigateTo(getReturnUrl())
          return
        }
        setOtpChallenge({ ...res, rememberMe })
        setOtp('')
      } else {
        const challenge = await loginUser({
          countryCode: form.get('countryCode')?.toString().trim(),
          mobileNumber: form.get('mobileNumber')?.toString().trim(),
          rememberMe,
        })
        setOtpChallenge({ ...challenge, rememberMe })
        setOtp('')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setErrorMessage('The login credentials or password are incorrect.')
        } else if (error.status === 404) {
          setErrorMessage('No account found with these details. Please sign up first.')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage('Login failed. Please check that the server is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      await verifyUserOtp({
        challengeId: otpChallenge.challengeId,
        otp,
        rememberMe: otpChallenge.rememberMe,
      })
      navigateTo(getReturnUrl())
    } catch (error) {
      setErrorMessage(error?.message ?? 'OTP verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const challenge = await resendUserOtp(otpChallenge.challengeId)
      setOtpChallenge({ ...challenge, rememberMe: otpChallenge.rememberMe })
      setOtp('')
    } catch (error) {
      setErrorMessage(error?.message ?? 'Unable to send a new OTP. Please try again.')
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
          <span className={styles.iconBadge}><Truck size={34} strokeWidth={2.2} /></span>
          <p>CUSTOMER ACCESS</p>
          <h1>Everything you need, delivered at lightning speed.</h1>
          <span>Book couriers, secure documents in Delivez Vault, track parcels in real time, and manage returns effortlessly.</span>
        </div>

        <div className={styles.perksNote}>
          <ShieldCheck size={22} />
          <span>
            <strong>Bank-grade Security & Privacy</strong>
            <small>Encrypted authentication and tamper-proof package tracking.</small>
          </span>
        </div>
      </section>

      <section className={styles.formPanel}>
        <button className={styles.backButton} type="button" onClick={() => navigateTo('/')}>
          <ArrowLeft size={17} /> Back to website
        </button>

        <div className={styles.formContainer}>
          <span className={styles.formIcon}><UserCheck size={26} /></span>
          <p className={styles.eyebrow}>CUSTOMER ACCOUNT</p>
          <h2>Welcome back</h2>
          <p className={styles.intro}>
            {otpChallenge
              ? `Enter the 6-digit verification code sent to ${otpChallenge.destination}.`
              : 'Log in to track orders, manage deliveries, and access your profile.'}
          </p>

          {errorMessage && <div className={styles.error} role="alert">{errorMessage}</div>}

          {otpChallenge ? (
            <form onSubmit={handleOtpVerify}>
              <div className={styles.otpVerificationCard}>
                <div className={styles.otpBadge}>
                  <ShieldCheck size={22} />
                  <div>
                    <strong>Verification code sent</strong>
                    <small>Enter the code sent to your mobile number</small>
                  </div>
                </div>

                {otpChallenge.developmentOtp && (
                  <div className={styles.devOtpBox}>
                    <span>Development OTP: <b>{otpChallenge.developmentOtp}</b></span>
                    <button type="button" onClick={() => setOtp(otpChallenge.developmentOtp)}>
                      Use this OTP
                    </button>
                  </div>
                )}
              </div>

              <label>
                6-digit verification code
                <div className={styles.phoneField}>
                  <ShieldCheck size={18} />
                  <input
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    pattern="\d{6}"
                    autoFocus
                  />
                </div>
              </label>

              <button className={styles.submitButton} type="submit" disabled={loading || otp.length !== 6}>
                {loading ? <><LoaderCircle className={styles.spinner} size={19} /> Verifying...</> : <>Verify OTP & Continue <ArrowRight size={18} /></>}
              </button>

              <div className={styles.otpRow}>
                <button
                  type="button"
                  className={styles.backButton}
                  style={{ position: 'static' }}
                  onClick={() => { setOtpChallenge(null); setOtp(''); }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  className={styles.typeToggle}
                  style={{ marginLeft: 'auto' }}
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          ) : (
            <>
              {loginType === 'password' && (
                <div className={styles.methodTabs} role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginMethod === 'phone'}
                    className={`${styles.methodTab} ${loginMethod === 'phone' ? styles.methodTabActive : ''}`}
                    onClick={() => { setLoginMethod('phone'); setErrorMessage(''); }}
                  >
                    <Smartphone size={17} /> Mobile Number
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginMethod === 'email'}
                    className={`${styles.methodTab} ${loginMethod === 'email' ? styles.methodTabActive : ''}`}
                    onClick={() => { setLoginMethod('email'); setErrorMessage(''); }}
                  >
                    <Mail size={17} /> Email Address
                  </button>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                {(loginType === 'otp' || loginMethod === 'phone') ? (
                  <label>
                    Mobile number
                    <div className={styles.phoneField}>
                      <Smartphone size={18} />
                      <select className={styles.countryCode} name="countryCode" defaultValue="+91" aria-label="Country code">
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+971">+971</option>
                      </select>
                      <span />
                      <input
                        name="mobileNumber"
                        type="tel"
                        placeholder="Enter 10-digit number"
                        aria-label="Mobile number"
                        autoComplete="tel-national"
                        required
                        pattern="[0-9]{7,15}"
                      />
                    </div>
                  </label>
                ) : (
                  <label>
                    Email address
                    <div className={styles.phoneField}>
                      <Mail size={18} />
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        aria-label="Email address"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </label>
                )}

                {loginType === 'password' && (
                  <label>
                    Password
                    <div className={styles.passwordField}>
                      <LockKeyhole size={18} />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your account password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>
                )}

                <div className={styles.formOptions}>
                  <label className={styles.remember}>
                    <input name="rememberMe" type="checkbox" defaultChecked />
                    Remember me on this device
                  </label>

                  <button
                    type="button"
                    className={styles.typeToggle}
                    onClick={() => {
                      setLoginType((t) => (t === 'password' ? 'otp' : 'password'))
                      setErrorMessage('')
                    }}
                  >
                    <KeyRound size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {loginType === 'password' ? 'Sign in with OTP instead' : 'Sign in with Password'}
                  </button>
                </div>

                <button className={styles.submitButton} type="submit" disabled={loading}>
                  {loading ? (
                    <><LoaderCircle className={styles.spinner} size={19} /> Please wait...</>
                  ) : loginType === 'otp' ? (
                    <>Send verification code <ArrowRight size={18} /></>
                  ) : (
                    <>Sign in to your account <ArrowRight size={18} /></>
                  )}
                </button>
              </form>

              <div className={styles.switchPanel}>
                <span>Don't have an account yet?</span>
                <button type="button" onClick={() => setSignupModalOpen(true)}>
                  Create account
                </button>
              </div>

              <div className={styles.adminLink}>
                Are you an administrator? <a href="/admin/login">Log in to Admin Portal</a>
              </div>
            </>
          )}
        </div>
      </section>

      {signupModalOpen && (
        <AuthModal
          open={signupModalOpen}
          onClose={() => setSignupModalOpen(false)}
          onSuccess={() => navigateTo(getReturnUrl())}
        />
      )}
    </main>
  )
}

export default UserLoginPage
