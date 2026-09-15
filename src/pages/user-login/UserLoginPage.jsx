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
  UserRound,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  fetchCurrentUser,
  getDeviceId,
  getUserAccessToken,
  loginUser,
  registerUser,
  resendUserOtp,
  verifyUserOtp,
} from '@/features/auth/services/userAuthService.js'
import { ApiError } from '@/services/api/apiClient.js'
import styles from './UserLoginPage.module.css'

function getReturnUrl() {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo')
  if (returnTo && !returnTo.startsWith('/login') && !returnTo.startsWith('/register') && !returnTo.startsWith('/signup')) {
    return returnTo
  }
  return '/dashboard'
}

function UserLoginPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(() => {
    const urlMode = new URLSearchParams(window.location.search).get('mode')
    if (urlMode === 'signup' || urlMode === 'register') return 'signup'
    if (urlMode === 'login' || urlMode === 'signin') return 'login'
    return initialMode || 'login'
  })
  const [mobileNumber, setMobileNumber] = useState(() => {
    return new URLSearchParams(window.location.search).get('phone') || ''
  })
  const [loginMethod, setLoginMethod] = useState('phone') // 'phone' | 'email'
  const [loginType, setLoginType] = useState('otp') // 'otp' | 'password'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [otpChallenge, setOtpChallenge] = useState(null)
  const [otp, setOtp] = useState('')

  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode)
    }
  }, [initialMode])

  const handleSwitchMode = (nextMode) => {
    setMode(nextMode)
    setErrorMessage('')
    setOtpChallenge(null)
    setOtp('')
    const targetPath = nextMode === 'signup' ? '/signup' : '/login'
    const returnTo = new URLSearchParams(window.location.search).get('returnTo')
    const phone = mobileNumber ? `&phone=${encodeURIComponent(mobileNumber)}` : ''
    const returnQuery = returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''
    const query = (phone || returnQuery) ? `?${(phone + returnQuery).replace(/^&/, '')}` : ''
    window.history.replaceState({}, '', `${targetPath}${query}`)
  }

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

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')
    const form = new FormData(event.currentTarget)
    const rememberMe = form.get('rememberMe') === 'on'

    try {
      if (mode === 'signup') {
        const challenge = await registerUser({
          fullName: form.get('fullName')?.toString().trim(),
          countryCode: form.get('countryCode')?.toString().trim(),
          mobileNumber: form.get('mobileNumber')?.toString().trim(),
          email: form.get('email')?.toString().trim() || undefined,
          acceptedTerms: form.get('acceptedTerms') === 'on',
          deviceId: getDeviceId(),
        })

        setOtpChallenge({ ...challenge, rememberMe: true, isSignup: true })
        setOtp('')
      } else {
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
          setOtpChallenge({ ...res, rememberMe, isSignup: false })
          setOtp('')
        } else {
          const challenge = await loginUser({
            countryCode: form.get('countryCode')?.toString().trim(),
            mobileNumber: form.get('mobileNumber')?.toString().trim(),
            rememberMe,
          })
          setOtpChallenge({ ...challenge, rememberMe, isSignup: false })
          setOtp('')
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setErrorMessage('The login credentials or password are incorrect.')
        } else if (error.status === 404) {
          setErrorMessage('No account found with this mobile number. Please sign up first.')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        setErrorMessage(error?.message ?? 'Authentication failed. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (event) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setErrorMessage('')

    try {
      const cleanOtp = String(otp ?? '').replace(/\D/g, '').slice(0, 6)
      if (cleanOtp.length !== 6) {
        setErrorMessage('Please enter the complete 6-digit verification code.')
        setLoading(false)
        return
      }

      await verifyUserOtp({
        challengeId: otpChallenge.challengeId,
        otp: cleanOtp,
        rememberMe: Boolean(otpChallenge.rememberMe),
        deviceId: getDeviceId(),
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
      setOtpChallenge((prev) => ({ ...challenge, rememberMe: prev?.rememberMe, isSignup: prev?.isSignup }))
      setOtp('')
    } catch (error) {
      setErrorMessage(error?.message ?? 'Unable to send a new OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      {/* Left Column: Hero Rider with Stats (Matching ref_01.jpeg) */}
      <section className={styles.heroPanel}>
        <div className={styles.heroImageOverlay} />
        <div className={styles.heroContent}>
          <button className={styles.brand} type="button" onClick={() => navigateTo('/')}>
            <span>DELVEZ</span>
            <span className={styles.brandDivider}>|</span>
            <b>ONE</b>
          </button>

          <div className={styles.heroCopy}>
            <div className={styles.heroPill}>
              <Truck size={15} /> Personal Logistics Platform
            </div>
            <h1>Everything you need, delivered at lightning speed.</h1>
            <p>Book couriers, secure documents in Delvez Vault, track parcels in real time, and manage returns effortlessly.</p>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <strong>25+</strong>
                <span>Cities</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <strong>1000+</strong>
                <span>Locations</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <strong>1M+</strong>
                <span>Customers</span>
              </div>
            </div>
          </div>

          <div className={styles.floatingBadge}>
            <div className={styles.badgeIcon}>
              <ShieldCheck size={18} />
            </div>
            <div className={styles.badgeText}>
              <strong>Safe, Reliable, On-Time</strong>
              <small>Customer First Logistics</small>
            </div>
          </div>
        </div>
      </section>

      {/* Center Column: Authentication Card (Matching ref_01.jpeg, ref_04.jpeg, ref_06.jpeg) */}
      <section className={styles.formPanel}>
        <div className={styles.formContainer}>
          <button className={styles.backButton} type="button" onClick={() => navigateTo('/')}>
            <ArrowLeft size={16} /> Back to website
          </button>

          {/* Stepper matching ref_01 / ref_04 */}
          <div className={styles.stepperContainer}>
            <div className={`${styles.stepItem} ${!otpChallenge ? styles.stepActive : styles.stepDone}`}>
              <span className={styles.stepNum}>1</span>
              <span className={styles.stepLabel}>{mode === 'signup' ? 'Details' : 'Phone'}</span>
            </div>
            <div className={`${styles.stepLine} ${otpChallenge ? styles.stepLineActive : ''}`} />
            <div className={`${styles.stepItem} ${otpChallenge ? styles.stepActive : ''}`}>
              <span className={styles.stepNum}>2</span>
              <span className={styles.stepLabel}>OTP Verify</span>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>3</span>
              <span className={styles.stepLabel}>Complete</span>
            </div>
          </div>

          <div className={styles.authCardHeader}>
            <div className={styles.cardLogo}>
              <span>D</span>
            </div>
            <h2>
              {otpChallenge
                ? (otpChallenge.isSignup ? 'Complete Registration' : 'Verify Mobile Number')
                : mode === 'signup' ? 'Create your account' : 'Welcome back to Delvez'}
            </h2>
            <p className={styles.cardSub}>
              {otpChallenge
                ? `Enter the 6-digit verification code sent to ${otpChallenge.destination}.`
                : mode === 'signup'
                  ? 'Sign up with your mobile number to get started with Delvez.'
                  : 'Log in with your mobile number to manage deliveries and orders.'}
            </p>
          </div>

          {errorMessage && <div className={styles.error} role="alert">{errorMessage}</div>}

          {otpChallenge ? (
            <form onSubmit={handleOtpVerify} className={styles.authForm}>
              <div className={styles.otpVerificationCard}>
                <div className={styles.otpBadge}>
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Verification code sent</strong>
                    <small>Enter the code sent to your mobile number</small>
                  </div>
                </div>

                {(otpChallenge.developmentOtp || otpChallenge.otp) && (
                  <div className={styles.devOtpBox}>
                    <span>Verification OTP: <b>{otpChallenge.developmentOtp || otpChallenge.otp}</b></span>
                    <button
                      type="button"
                      onClick={() => {
                        const code = String(otpChallenge.developmentOtp || otpChallenge.otp || '').trim()
                        setOtp(code)
                      }}
                    >
                      Use this OTP
                    </button>
                  </div>
                )}
              </div>

              <label className={styles.fieldLabel}>
                <span>6-digit verification code</span>
                <div className={styles.inputWrapper}>
                  <ShieldCheck size={18} className={styles.inputIcon} />
                  <input
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    pattern="\d{6}"
                    maxLength={6}
                    autoFocus
                    className={styles.otpInput}
                  />
                </div>
              </label>

              <button className={styles.primaryYellowBtn} type="submit" disabled={loading || String(otp).length !== 6}>
                {loading
                  ? <><LoaderCircle className={styles.spinner} size={18} /> Verifying...</>
                  : otpChallenge.isSignup ? <>Complete Registration <ArrowRight size={18} /></> : <>Verify OTP & Continue <ArrowRight size={18} /></>}
              </button>

              <div className={styles.otpActions}>
                <button
                  type="button"
                  className={styles.plainLinkBtn}
                  onClick={() => { setOtpChallenge(null); setOtp(''); }}
                >
                  <ArrowLeft size={15} /> Change Number
                </button>
                <button
                  type="button"
                  className={styles.plainLinkBtn}
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className={styles.modeTabs} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  className={`${styles.modeTab} ${mode === 'login' ? styles.modeTabActive : ''}`}
                  onClick={() => handleSwitchMode('login')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={`${styles.modeTab} ${mode === 'signup' ? styles.modeTabActive : ''}`}
                  onClick={() => handleSwitchMode('signup')}
                >
                  Create Account
                </button>
              </div>

              {mode === 'login' && loginType === 'password' && (
                <div className={styles.methodTabs} role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginMethod === 'phone'}
                    className={`${styles.methodTab} ${loginMethod === 'phone' ? styles.methodTabActive : ''}`}
                    onClick={() => { setLoginMethod('phone'); setErrorMessage(''); }}
                  >
                    <Smartphone size={16} /> Mobile Number
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginMethod === 'email'}
                    className={`${styles.methodTab} ${loginMethod === 'email' ? styles.methodTabActive : ''}`}
                    onClick={() => { setLoginMethod('email'); setErrorMessage(''); }}
                  >
                    <Mail size={16} /> Email Address
                  </button>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className={styles.authForm}>
                {mode === 'signup' && (
                  <label className={styles.fieldLabel}>
                    <span>Full name</span>
                    <div className={styles.inputWrapper}>
                      <UserRound size={18} className={styles.inputIcon} />
                      <input
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        aria-label="Full name"
                        autoComplete="name"
                        required
                        minLength="2"
                        maxLength="100"
                      />
                    </div>
                  </label>
                )}

                {(mode === 'signup' || (mode === 'login' && (loginType === 'otp' || loginMethod === 'phone'))) && (
                  <label className={styles.fieldLabel}>
                    <span>Mobile number</span>
                    <div className={styles.phoneInputWrapper}>
                      <div className={styles.flagSelector}>
                        <span className={styles.indiaFlag}>🇮🇳</span>
                        <select name="countryCode" defaultValue="+91" aria-label="Country code">
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+971">+971</option>
                        </select>
                      </div>
                      <input
                        name="mobileNumber"
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
                        placeholder="Enter 10-digit number"
                        aria-label="Mobile number"
                        autoComplete="tel-national"
                        required
                        pattern="[0-9]{7,15}"
                      />
                    </div>
                  </label>
                )}

                {mode === 'signup' && (
                  <label className={styles.fieldLabel}>
                    <span>Email address <small style={{ color: '#64748b', fontWeight: 'normal' }}>(Optional)</small></span>
                    <div className={styles.inputWrapper}>
                      <Mail size={18} className={styles.inputIcon} />
                      <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        aria-label="Email address"
                        autoComplete="email"
                      />
                    </div>
                  </label>
                )}

                {mode === 'login' && loginType === 'password' && loginMethod === 'email' && (
                  <label className={styles.fieldLabel}>
                    <span>Email address</span>
                    <div className={styles.inputWrapper}>
                      <Mail size={18} className={styles.inputIcon} />
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

                {mode === 'login' && loginType === 'password' && (
                  <label className={styles.fieldLabel}>
                    <span>Password</span>
                    <div className={styles.inputWrapper}>
                      <LockKeyhole size={18} className={styles.inputIcon} />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your account password"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className={styles.eyeToggle}
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>
                )}

                {mode === 'signup' && (
                  <label className={styles.termsLabel}>
                    <input name="acceptedTerms" type="checkbox" defaultChecked required />
                    <span>I agree to the <b>Terms & Conditions</b> and <b>Privacy Policy</b>.</span>
                  </label>
                )}

                {mode === 'login' && (
                  <div className={styles.formOptions}>
                    <label className={styles.remember}>
                      <input name="rememberMe" type="checkbox" defaultChecked />
                      <span>Remember me</span>
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
                      {loginType === 'password' ? 'Sign in with OTP' : 'Sign in with Password'}
                    </button>
                  </div>
                )}

                <button className={styles.primaryYellowBtn} type="submit" disabled={loading}>
                  {loading ? (
                    <><LoaderCircle className={styles.spinner} size={18} /> Please wait...</>
                  ) : mode === 'signup' ? (
                    <>Create Account & Send OTP <ArrowRight size={18} /></>
                  ) : loginType === 'otp' ? (
                    <>Send OTP <ArrowRight size={18} /></>
                  ) : (
                    <>Sign In <ArrowRight size={18} /></>
                  )}
                </button>
              </form>

              {/* Social Login Divider matching ref_01 */}
              <div className={styles.divider}>
                <span>OR CONTINUE WITH</span>
              </div>

              <button
                type="button"
                className={styles.googleBtn}
                onClick={() => alert('Google authentication will be linked to your active Delvez account.')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <div className={styles.switchPanel}>
                <span>{mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}</span>
                <button
                  type="button"
                  onClick={() => handleSwitchMode(mode === 'login' ? 'signup' : 'login')}
                >
                  {mode === 'login' ? 'Create account' : 'Sign in'}
                </button>
              </div>

              <div className={styles.adminLink}>
                Are you an administrator? <a href="/admin/login">Log in to Admin Portal</a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Right Column: Security & Feature Badges (Matching ref_01.jpeg) */}
      <section className={styles.sideInfoPanel}>
        <div className={styles.sideInfoWrapper}>
          <h3>Why Choose Delvez?</h3>

          <div className={styles.trustCard}>
            <div className={styles.trustCardIcon}>
              <PackageCheck size={20} />
            </div>
            <div className={styles.trustCardContent}>
              <strong>Doorstep Pickup in 30 Mins</strong>
              <p>Dedicated rider reaches your location with secure tamper-proof packaging.</p>
            </div>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustCardIcon}>
              <ShieldCheck size={20} />
            </div>
            <div className={styles.trustCardContent}>
              <strong>Delvez Vault Security</strong>
              <p>Bank-grade OTP verified confidential document & high-value package delivery.</p>
            </div>
          </div>

          <div className={styles.trustCard}>
            <div className={styles.trustCardIcon}>
              <Truck size={20} />
            </div>
            <div className={styles.trustCardContent}>
              <strong>Real-Time GPS Tracking</strong>
              <p>Live satellite tracking with dynamic ETA updates every 10 seconds.</p>
            </div>
          </div>

          <div className={styles.supportBox}>
            <strong>Need instant assistance?</strong>
            <p>Our dedicated customer support team is available 24/7 to help you.</p>
            <a href="tel:18001234567" className={styles.supportLink}>Call Support: 1800-123-4567</a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default UserLoginPage
