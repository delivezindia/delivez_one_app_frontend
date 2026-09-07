import { useEffect, useState } from 'react'
import {
  ArrowLeft,
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
  UserRound,
  X,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  loginUser,
  registerUser,
  resendUserOtp,
  verifyUserOtp,
} from '@/features/auth/services/userAuthService.js'
import styles from './AuthModal.module.css'

function AuthModal({ open, isOpen, onClose, onAuthenticated, onSuccess }) {
  const modalOpen = Boolean(open ?? isOpen)
  const [mode, setMode] = useState('login')
  const [loginMethod, setLoginMethod] = useState('phone') // 'phone' | 'email'
  const [loginType, setLoginType] = useState('password') // 'password' | 'otp'
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpChallenge, setOtpChallenge] = useState(null)
  const [otp, setOtp] = useState('')

  const resetTransientState = () => {
    setLoading(false)
    setErrorMessage('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setOtpChallenge(null)
    setOtp('')
  }

  const closeModal = () => {
    resetTransientState()
    onClose?.()
  }

  useEffect(() => {
    if (!modalOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !loading) closeModal()
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [modalOpen, loading])

  if (!modalOpen) return null

  const handleAuthSuccess = (user) => {
    resetTransientState()
    if (onAuthenticated) onAuthenticated(user)
    if (onSuccess) onSuccess(user)
    onClose?.()

    if (!onAuthenticated && !onSuccess) {
      const returnTo = new URLSearchParams(window.location.search).get('returnTo')
      navigateTo(returnTo || '/user/dashboard')
    }
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const rememberMe = form.get('rememberMe') === 'on'

    setLoading(true)
    setErrorMessage('')

    try {
      if (mode === 'login') {
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
            handleAuthSuccess(res.user)
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
      } else {
        const challenge = await registerUser({
          fullName: form.get('fullName')?.toString().trim(),
          countryCode: form.get('countryCode')?.toString().trim(),
          mobileNumber: form.get('mobileNumber')?.toString().trim(),
          email: form.get('email')?.toString().trim() || undefined,
          password: form.get('password')?.toString(),
          confirmPassword: form.get('confirmPassword')?.toString(),
          acceptedTerms: form.get('acceptedTerms') === 'on',
        })

        setOtpChallenge({ ...challenge, rememberMe })
        setOtp('')
      }
    } catch (error) {
      setErrorMessage(error?.message ?? 'Unable to authenticate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const user = await verifyUserOtp({
        challengeId: otpChallenge.challengeId,
        otp,
        rememberMe: otpChallenge.rememberMe,
      })
      handleAuthSuccess(user)
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
      setErrorMessage(error?.message ?? 'Unable to generate a new OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    resetTransientState()
  }

  const returnToForm = () => {
    setOtpChallenge(null)
    setOtp('')
    setErrorMessage('')
  }

  const title = otpChallenge
    ? 'Verify your mobile'
    : mode === 'login' ? 'Welcome Back!' : 'Join Delevez'
  const description = otpChallenge
    ? `Enter the six-digit OTP generated for ${otpChallenge.destination}.`
    : mode === 'login'
      ? 'Login to your account and continue your delivery journey.'
      : 'Sign up and start your seamless delivery experience with Delevez.'

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && !loading && closeModal()}
    >
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className={styles.closeButton} type="button" onClick={closeModal} aria-label="Close" disabled={loading}>
          <X size={21} />
        </button>

        <div className={styles.brandRow} aria-label="Delevez">
          <span className={styles.brandIcon} aria-hidden="true">
            <Truck size={34} strokeWidth={2.2} />
            <PackageCheck size={19} strokeWidth={2.5} />
          </span>
          <strong>DELEVEZ</strong>
        </div>

        <header className={styles.intro}>
          <span className={styles.eyebrow}>
            {otpChallenge ? 'Secure verification' : mode === 'login' ? 'Good to see you again' : 'Create your account'}
          </span>
          <h2 id="auth-title">{title}</h2>
          <p>{description}</p>
          <i aria-hidden="true" />
        </header>

        {errorMessage && <div className={styles.error} role="alert">{errorMessage}</div>}

        {otpChallenge ? (
          <form className={styles.form} onSubmit={handleOtpSubmit}>
            <div className={styles.verificationBadge}>
              <span><ShieldCheck size={25} /></span>
              <div>
                <strong>OTP sent successfully</strong>
                <small>Use the latest code generated for your mobile number.</small>
              </div>
            </div>

            {(otpChallenge.developmentOtp || otpChallenge.otp) && (
              <div className={styles.developmentOtp} role="status">
                <span>Verification OTP</span>
                <strong>{otpChallenge.developmentOtp || otpChallenge.otp}</strong>
                <button type="button" onClick={() => setOtp(otpChallenge.developmentOtp || otpChallenge.otp)}>Use this OTP</button>
                <small>One-time verification code for your mobile number.</small>
              </div>
            )}

            <label className={styles.fieldLabel}>
              Verification Code
              <span className={`${styles.inputShell} ${styles.otpField}`}>
                <ShieldCheck size={20} />
                <input
                  name="otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  pattern="\d{6}"
                  required
                  autoFocus
                />
              </span>
            </label>

            <button className={styles.submitButton} type="submit" disabled={loading || otp.length !== 6}>
              {loading
                ? <><LoaderCircle className={styles.spinner} size={20} /> Verifying...</>
                : 'Verify OTP & Continue'}
            </button>

            <div className={styles.otpActions}>
              <button className={styles.backButton} type="button" disabled={loading} onClick={returnToForm}>
                <ArrowLeft size={17} /> Back
              </button>
              <button className={styles.resendButton} type="button" disabled={loading} onClick={handleResendOtp}>
                Resend OTP
              </button>
            </div>
          </form>
        ) : (
          <>
            {mode === 'login' && loginType === 'password' && (
              <div className={styles.methodTabs} role="tablist" aria-label="Login method">
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

            <form className={styles.form} onSubmit={handleAuthSubmit}>
              {mode === 'signup' && (
                <label className={styles.fieldLabel}>
                  Full Name
                  <span className={styles.inputShell}>
                    <UserRound size={21} />
                    <input name="fullName" placeholder="Enter your full name" required minLength="2" maxLength="100" autoComplete="name" />
                  </span>
                </label>
              )}

              {(mode === 'signup' || (mode === 'login' && (loginType === 'otp' || loginMethod === 'phone'))) && (
                <label className={styles.fieldLabel}>
                  Mobile Number
                  <span className={`${styles.inputShell} ${styles.phoneField}`}>
                    <Smartphone size={21} />
                    <select name="countryCode" defaultValue="+91" aria-label="Country code">
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                    </select>
                    <i aria-hidden="true" />
                    <input name="mobileNumber" type="tel" placeholder="Enter your mobile number" aria-label="Mobile number" autoComplete="tel-national" required pattern="[0-9]{7,15}" />
                  </span>
                </label>
              )}

              {mode === 'login' && loginType === 'password' && loginMethod === 'email' && (
                <label className={styles.fieldLabel}>
                  Email Address
                  <span className={styles.inputShell}>
                    <Mail size={21} />
                    <input name="email" type="email" placeholder="Enter your registered email" required autoComplete="email" />
                  </span>
                </label>
              )}

              {mode === 'signup' && (
                <label className={styles.fieldLabel}>
                  Email Address <small>(Optional)</small>
                  <span className={styles.inputShell}>
                    <Mail size={21} />
                    <input name="email" type="email" placeholder="Enter your email address" autoComplete="email" />
                  </span>
                </label>
              )}

              {(mode === 'signup' || (mode === 'login' && loginType === 'password')) && (
                <label className={styles.fieldLabel}>
                  Password
                  <span className={`${styles.inputShell} ${styles.passwordField}`}>
                    <LockKeyhole size={21} />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                      required
                      minLength={mode === 'login' ? undefined : '8'}
                      maxLength="72"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </span>
                </label>
              )}

              {mode === 'signup' && (
                <>
                  <label className={styles.fieldLabel}>
                    Confirm Password
                    <span className={`${styles.inputShell} ${styles.passwordField}`}>
                      <LockKeyhole size={21} />
                      <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" required minLength="8" maxLength="72" autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input name="acceptedTerms" type="checkbox" required />
                    <span>I agree to the <b>Terms & Conditions</b> and <b>Privacy Policy</b>.</span>
                  </label>
                </>
              )}

              {mode === 'login' && (
                <div className={styles.rememberRow}>
                  <label className={styles.checkboxLabel}>
                    <input name="rememberMe" type="checkbox" defaultChecked />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className={styles.loginTypeToggle}
                    onClick={() => {
                      setLoginType((current) => (current === 'password' ? 'otp' : 'password'))
                      setErrorMessage('')
                    }}
                  >
                    <KeyRound size={15} />
                    {loginType === 'password' ? 'Log in with OTP instead' : 'Log in with Password'}
                  </button>
                </div>
              )}

              <button className={styles.submitButton} type="submit" disabled={loading}>
                {loading ? (
                  <><LoaderCircle className={styles.spinner} size={20} /> Please wait...</>
                ) : mode === 'signup' ? (
                  'Sign Up'
                ) : loginType === 'otp' ? (
                  'Send OTP'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className={styles.switchMode}>
              <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
              <button type="button" disabled={loading} onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </div>
          </>
        )}

        <div className={styles.brandWave} aria-hidden="true" />
      </section>
    </div>
  )
}

export default AuthModal
