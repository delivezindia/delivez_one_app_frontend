import { useEffect, useState } from 'react'
import AdminAuthGuard from '@/features/admin-auth/components/AdminAuthGuard.jsx'
import UserAuthGuard from '@/features/auth/components/UserAuthGuard.jsx'
import AppLayout from '@/layouts/AppLayout/AppLayout.jsx'
import AdminLoginPage from '@/pages/admin-login/AdminLoginPage.jsx'
import ConfidentialDeliveryBookingPage from '@/pages/confidential-delivery/ConfidentialDeliveryBookingPage.jsx'
import VaultTrackingPage from '@/pages/confidential-delivery/VaultTrackingPage.jsx'
import ForgotSomethingBookingPage from '@/pages/forgot-something/ForgotSomethingBookingPage.jsx'
import ForgotSomethingTrackingPage from '@/pages/forgot-something/ForgotSomethingTrackingPage.jsx'
import ReturnPickupBookingPage from '@/pages/return-pickup/ReturnPickupBookingPage.jsx'
import ReturnPickupTrackingPage from '@/pages/return-pickup/ReturnPickupTrackingPage.jsx'
import ReturnPickupDetailsPage from '@/pages/return-pickup/ReturnPickupDetailsPage.jsx'
import ReturnPickupListPage from '@/pages/return-pickup/ReturnPickupListPage.jsx'
import GiftDeliveryBookingPage from '@/pages/gift-delivery/GiftDeliveryBookingPage.jsx'
import GiftDeliveryTrackingPage from '@/pages/gift-delivery/GiftDeliveryTrackingPage.jsx'
import GiftDeliveryDetailsPage from '@/pages/gift-delivery/GiftDeliveryDetailsPage.jsx'
import DashboardPage from '@/pages/dashboard/DashboardPage.jsx'
import HomePage from '@/pages/home/HomePage.jsx'
import LuggageDeliveryBookingPage from '@/pages/luggage-delivery/LuggageDeliveryBookingPage.jsx'
import PersonalCourierBookingPage from '@/pages/personal-courier/PersonalCourierBookingPage.jsx'
import CourierHomePage from '@/pages/personal-courier/CourierHomePage.jsx'
import CourierTrackingView from '@/pages/personal-courier/components/CourierTrackingView.jsx'
import CourierProofOfDeliveryView from '@/pages/personal-courier/components/CourierProofOfDeliveryView.jsx'
import SandboxPaymentPage from '@/pages/payments/SandboxPaymentPage.jsx'
import UserDashboardPage from '@/pages/user-dashboard/UserDashboardPage.jsx'
import UserLoginPage from '@/pages/user-login/UserLoginPage.jsx'
import { navigateTo, scrollToCurrentHash } from '@/app/router/navigation.js'
import { getAdminAccessToken } from '@/features/admin-auth/services/adminAuthService.js'
import { getStoredUser } from '@/features/auth/services/userAuthService.js'
import { getServiceBySlug } from '@/features/services/serviceCatalog.js'

function App() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handleRouteChange = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  useEffect(() => {
    scrollToCurrentHash()
  }, [pathname])

  if (
    pathname === '/login' ||
    pathname === '/user/login' ||
    pathname === '/signup' ||
    pathname === '/register' ||
    pathname === '/user/signup' ||
    pathname === '/user/register'
  ) {
    return (
      <UserLoginPage
        initialMode={pathname.includes('signup') || pathname.includes('register') ? 'signup' : 'login'}
      />
    )
  }

  if (pathname === '/admin/login') {
    return <AdminLoginPage />
  }

  if (pathname === '/admin' || pathname === '/admin/dashboard' || pathname === '/admin-dashboard') {
    return (
      <AdminAuthGuard>
        <DashboardPage />
      </AdminAuthGuard>
    )
  }

  if (pathname === '/dashboard') {
    const stored = getStoredUser()
    const isAdmin = stored?.role === 'ADMIN' || Boolean(getAdminAccessToken())
    if (isAdmin) {
      return (
        <AdminAuthGuard>
          <DashboardPage />
        </AdminAuthGuard>
      )
    }
    return (
      <UserAuthGuard>
        <UserDashboardPage />
      </UserAuthGuard>
    )
  }

  if (pathname === '/user/dashboard') {
    return (
      <UserAuthGuard>
        <UserDashboardPage />
      </UserAuthGuard>
    )
  }

  // Gift Delivery Booking Route (Redirect to services since module was replaced with Know More)
  if (/^\/(book\/(gift-delivery|gift-and-surprise|gifts)|gift-delivery|gifts|gift-and-surprise)\/?$/.test(pathname)) {
    window.location.replace('/#services')
    return null
  }

  // Gift Delivery Live Tracking Route
  const giftTrackingRoute = pathname.match(/^\/(?:track\/gift-delivery|gift-delivery\/track)\/(.+)\/?$/)
  if (giftTrackingRoute) {
    return <GiftDeliveryTrackingPage bookingId={giftTrackingRoute[1]} />
  }

  // Gift Delivery Details Route
  const giftDetailsRoute = pathname.match(/^\/(?:gift-delivery\/details|gifts|gift-delivery)\/(DLVZ[0-9]+|[0-9a-fA-F-]{36})\/?$/)
  if (giftDetailsRoute) {
    return <GiftDeliveryDetailsPage bookingId={giftDetailsRoute[1]} />
  }

  // Return Pickup List Route
  if (/^\/(returns|user\/returns)\/?$/.test(pathname)) {
    return (
      <UserAuthGuard>
        <ReturnPickupListPage />
      </UserAuthGuard>
    )
  }

  // Return Pickup Booking Route
  if (/^\/(book\/(return-pickup|personal-return-pickup)|return-pickup|returns\/book)\/?$/.test(pathname)) {
    return <ReturnPickupBookingPage />
  }

  // Return Pickup Live Tracking Route
  const returnTrackingRoute = pathname.match(/^\/(?:track\/return-pickup|return-pickup\/track)\/(.+)\/?$/)
  if (returnTrackingRoute) {
    return <ReturnPickupTrackingPage bookingId={returnTrackingRoute[1]} />
  }

  // Return Pickup Details Route
  const returnDetailsRoute = pathname.match(/^\/(?:return-pickup\/details|returns|return-pickup)\/(DRVZ-RET-[a-zA-Z0-9-]+|[0-9a-fA-F-]{36})\/?$/)
  if (returnDetailsRoute) {
    return <ReturnPickupDetailsPage bookingId={returnDetailsRoute[1]} />
  }

  // Forgot Something Booking Route
  if (/^\/(book\/(forgot-something|fetch)|forgot-something|fetch)\/?$/.test(pathname)) {
    return <ForgotSomethingBookingPage />
  }

  // Forgot Something Live Tracking Route
  const forgotTrackingRoute = pathname.match(/^\/(?:track\/forgot-something|forgot-something\/track)\/(.+)\/?$/)
  if (forgotTrackingRoute) {
    return <ForgotSomethingTrackingPage bookingId={forgotTrackingRoute[1]} />
  }

  // Vault / Confidential Delivery Booking
  if (/^\/(book\/(confidential-delivery|confidential-courier|vault)|vault|book\/vault)\/?$/.test(pathname)) {
    return <ConfidentialDeliveryBookingPage />
  }

  // Courier Proof of Delivery (POD) Route (Screens 32 & 33)
  const podRoute = pathname.match(/^\/(?:track\/(?:pod|proof-of-delivery)|(?:courier|personal-courier|courier-delivery|luggage-delivery|luggage)\/(?:pod|proof-of-delivery))\/(.+)\/?$/)
  if (podRoute) {
    return <CourierProofOfDeliveryView bookingId={podRoute[1]} onBack={() => navigateTo(`/track/courier/${podRoute[1]}`)} />
  }

  // Courier & Luggage Tracking Route (Screens 28 - 31)
  const courierTrackingRoute = pathname.match(/^\/(?:track\/(?:personal-courier|courier-delivery|courier|luggage-delivery|luggage)|(?:personal-courier|courier-delivery|courier|luggage-delivery|luggage)\/track)\/(.+)\/?$/)
  if (courierTrackingRoute) {
    return <CourierTrackingView bookingId={courierTrackingRoute[1]} onBack={() => navigateTo('/user/dashboard')} />
  }

  // Vault / Universal Live Tracking Route
  const trackingRoute = pathname.match(/^\/(vault\/track|track)\/(.+)\/?$/)
  if (trackingRoute) {
    const trackId = trackingRoute[2]
    // Any courier / luggage tracking number: DLZC, PC, CC, DLVZ (with length >= 13 or DLVZ2505128947)
    if (
      trackId.startsWith('DLZC') ||
      trackId.startsWith('PC') ||
      trackId === 'DLVZ2505128947' ||
      (trackId.startsWith('DLVZ') && trackId.length >= 13) ||
      (trackId.startsWith('DLZ') && !trackId.startsWith('DLVZ'))
    ) {
      return <CourierTrackingView bookingId={trackId} onBack={() => navigateTo('/user/dashboard')} />
    }
    // Gift delivery tracking is strictly 12 chars (DLVZ + 8 digits)
    if (trackId.startsWith('DLVZ') && trackId.length === 12) {
      return <GiftDeliveryTrackingPage bookingId={trackId} />
    }
    // Fallback for any other DLVZ
    if (trackId.startsWith('DLVZ')) {
      return <CourierTrackingView bookingId={trackId} onBack={() => navigateTo('/user/dashboard')} />
    }
    if (trackId.startsWith('DRVZ-RET') || trackId.startsWith('RBK')) {
      return <ReturnPickupTrackingPage bookingId={trackId} />
    }
    if (trackId.startsWith('DZ') || trackId.startsWith('FS-')) {
      return <ForgotSomethingTrackingPage bookingId={trackId} />
    }
    return <VaultTrackingPage vaultId={trackId} />
  }

  // Courier & Luggage Module (Screens 01 - 33: Landing, Service Detail Modals, 8-Step Booking, Confirmed Screen, Tracking, POD)
  if (/^\/(courier|courier-delivery|courier-home|personal-courier|luggage-delivery|book\/(personal-courier|courier-delivery|courier|luggage-delivery|airport-luggage))\/?$/.test(pathname)) {
    return (
      <UserAuthGuard>
        <PersonalCourierBookingPage serviceSlug={pathname.includes('luggage') ? 'luggage-delivery' : 'personal-courier'} />
      </UserAuthGuard>
    )
  }

  // Legacy Luggage Delivery Booking (optional fallback)
  if (/^\/(legacy-luggage|book\/legacy-luggage)\/?$/.test(pathname)) {
    return (
      <UserAuthGuard>
        <LuggageDeliveryBookingPage />
      </UserAuthGuard>
    )
  }

  // Payment Route
  const paymentRoute = pathname.match(/^\/pay\/(gift-delivery|luggage-delivery|confidential-courier|confidential-delivery|personal-courier|courier-delivery|forgot-something|return-pickup|returns)\/(.+)\/?$/)
  if (paymentRoute) {
    return (
      <UserAuthGuard>
        <SandboxPaymentPage serviceSlug={paymentRoute[1]} bookingId={paymentRoute[2]} />
      </UserAuthGuard>
    )
  }

  // Generic Service Booking
  const bookingRoute = pathname.match(/^\/book\/([a-z0-9-]+)\/?$/)
  const selectedService = bookingRoute ? getServiceBySlug(bookingRoute[1]) : null

  if (selectedService) {
    if (selectedService.slug === 'gift-delivery') {
      return <GiftDeliveryBookingPage />
    }
    if (selectedService.slug === 'forgot-something') {
      return <ForgotSomethingBookingPage />
    }
    if (selectedService.slug === 'return-pickup' || selectedService.slug === 'personal-return-pickup') {
      return <ReturnPickupBookingPage />
    }
    return (
      <UserAuthGuard>
        <PersonalCourierBookingPage serviceSlug={selectedService.slug} />
      </UserAuthGuard>
    )
  }

  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  )
}

export default App
