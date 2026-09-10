import React, { useEffect, useState } from 'react'
import {
  Grid,
  ArrowRight,
  Bell,
  Bike,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Calculator,
  FileClock,
  FileLock2,
  Gift,
  Headphones,
  Home,
  ImagePlus,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Luggage,
  MapPin,
  MapPinned,
  Menu,
  Package,
  PackageCheck,
  Plane,
  Plus,
  Radio,
  ReceiptIndianRupee,
  RefreshCw,
  RotateCcw,
  Search,
  SearchCheck,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  Upload,
  UserCog,
  UserPlus,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  clearAdminSession,
  getStoredAdminProfile,
} from '@/features/admin-auth/services/adminAuthService.js'
import {
  fetchAdminServices,
  removeAdminServiceImage,
  uploadAdminServiceImage,
} from '@/features/admin-services/services/adminServicesService.js'
import { fetchAdminUsers } from '@/features/admin-users/services/adminUsersService.js'

// Import all sub-module views
import AdminLuggageDeliveryView from './components/AdminLuggageDeliveryView.jsx'
import AdminGiftDeliveryView from './components/AdminGiftDeliveryView.jsx'
import AdminUnifiedOrdersView from './components/AdminUnifiedOrdersView.jsx'
import AdminPartnersView from './components/AdminPartnersView.jsx'
import AdminFinanceView from './components/AdminFinanceView.jsx'
import AdminAnalyticsView from './components/AdminAnalyticsView.jsx'
import AdminPersonalCourierView from './components/AdminPersonalCourierView.jsx'
import AdminConfidentialCourierView from './components/AdminConfidentialCourierView.jsx'
import AdminForgotSomethingView from './components/AdminForgotSomethingView.jsx'
import AdminReturnPickupView from './components/AdminReturnPickupView.jsx'
import AdminSupportView from './components/AdminSupportView.jsx'
import AdminSettingsView from './components/AdminSettingsView.jsx'
import AdminRadarView from './components/AdminRadarView.jsx'
import AdminPromosView from './components/AdminPromosView.jsx'
import AdminPricingView from './components/AdminPricingView.jsx'
import AdminAuditView from './components/AdminAuditView.jsx'
import AdminServiceSlidersView from './components/AdminServiceSlidersView.jsx'
import AdminKnowMoreCardsView from './components/AdminKnowMoreCardsView.jsx'
import AdminMoreServicesView from './components/AdminMoreServicesView.jsx'
import AdminPromptExamplesView from './components/AdminPromptExamplesView.jsx'
import AdminHomeContentView from './components/AdminHomeContentView.jsx'



import {
  fetchUnifiedStats,
  universalTrack,
  fetchAdminUserDetails,
  updateAdminUserRole,
  fetchPlatformSettings
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './DashboardPage.module.css'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'CORE' },
  { id: 'radar', label: 'Operations Radar', icon: Radio, group: 'CORE' },
  { id: 'orders', label: 'Unified Orders', icon: PackageCheck, group: 'CORE' },
  
  { id: 'courier', label: 'Courier Delivery', icon: Truck, group: 'SERVICES' },
  { id: 'luggage', label: 'Luggage Delivery', icon: Luggage, group: 'SERVICES' },
  { id: 'confidential', label: 'Confidential Delivery', icon: ShieldCheck, group: 'SERVICES' },
  { id: 'forgot', label: 'Forgot Something', icon: ShoppingBag, group: 'SERVICES' },
  { id: 'returns', label: 'Return Pickup', icon: RotateCcw, group: 'SERVICES' },
  { id: 'service-sliders', label: 'Service Image Sliders', icon: Sliders, group: 'SERVICES' },
  { id: 'know-more', label: 'Know More Cards', icon: BookOpen, group: 'SERVICES' },
  { id: 'more-services', label: 'More Services', icon: Grid, group: 'SERVICES' },

  { id: 'partners', label: 'Delivery Fleet', icon: UserCog, group: 'MANAGEMENT' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'MANAGEMENT' },
  { id: 'promos', label: 'Coupons & Promos', icon: Tag, group: 'MANAGEMENT' },
  { id: 'pricing', label: 'Rate Cards & Pricing', icon: Calculator, group: 'MANAGEMENT' },
  { id: 'payments', label: 'Finance & Settlements', icon: WalletCards, group: 'MANAGEMENT' },
  { id: 'analytics', label: 'Analytics & Reports', icon: ChartNoAxesCombined, group: 'MANAGEMENT' },

  { id: 'services', label: 'Services Catalogue', icon: Package, group: 'SYSTEM' },
  { id: 'home-content', label: 'Home Studio (Banner & Cards)', icon: LayoutDashboard, group: 'SYSTEM' },
  { id: 'prompt-examples', label: 'AI Prompt Cards', icon: Sparkles, group: 'SYSTEM' },
  { id: 'support', label: 'Helpdesk & Support', icon: Headphones, group: 'SYSTEM' },

  { id: 'settings', label: 'Operational Controls', icon: Sliders, group: 'SYSTEM' },
  { id: 'audit', label: 'Audit Trail & Logs', icon: FileClock, group: 'SYSTEM' },
]


const servicePresentation = {
  'courier-delivery': { icon: Truck, color: '#087fc1', tint: '#e9f6ff' },
  'personal-courier': { icon: Truck, color: '#087fc1', tint: '#e9f6ff' },
  'luggage-delivery': { icon: Luggage, color: '#e5a100', tint: '#fff7dd' },
  'airport-luggage': { icon: Luggage, color: '#e5a100', tint: '#fff7dd' },
  'confidential-delivery': { icon: ShieldCheck, color: '#e00014', tint: '#ffeff0' },
  'confidential-courier': { icon: ShieldCheck, color: '#e00014', tint: '#ffeff0' },
  'forgot-something': { icon: ShoppingBag, color: '#159565', tint: '#e7f8f1' },
  'return-pickup': { icon: RotateCcw, color: '#ee5a08', tint: '#fff0e6' },
  'personal-return-pickup': { icon: RotateCcw, color: '#ee5a08', tint: '#fff0e6' },
  'gift-delivery': { icon: Gift, color: '#e63f65', tint: '#ffedf2' },
  'gift-and-surprise': { icon: Gift, color: '#e63f65', tint: '#ffedf2' },
}
const defaultServicePresentation = { icon: Package, color: '#59636e', tint: '#f0f2f4' }

const activeDeliveries = [
  {
    id: 'DLV-29840', type: 'Airport Luggage', status: 'In transit',
    from: 'Connaught Place', to: 'IGI Airport, T3', eta: 'Today, 5:40 PM', courier: 'Rajesh K.', progress: 3,
  },
  {
    id: 'DLV-29812', type: 'Confidential Documents', status: 'Picked up',
    from: 'Saket', to: 'Cyber City, Gurugram', eta: 'Today, 7:15 PM', courier: 'Aman S.', progress: 2,
  },
  {
    id: 'DLV-29790', type: 'Forgot Keys Retrieval', status: 'Rider on the way',
    from: 'Indiranagar 100ft', to: 'Koramangala 4th Block', eta: 'Today, 6:05 PM', courier: 'Deepak K.', progress: 1,
  },
]

const steps = ['Order placed', 'Picked up', 'In transit', 'Arrived', 'Delivered']

function getUserName(user) {
  return user?.fullName ?? user?.name ?? 'Registered Customer'
}

function getUserMobile(user) {
  if (!user?.mobileNumber) return '—'
  const code = user.countryCode ? `${user.countryCode} ` : '+91 '
  return `${code}${user.mobileNumber}`
}

function getJoinedDate(user) {
  if (!user?.createdAt) return '—'
  const date = new Date(user.createdAt)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [liveStats, setLiveStats] = useState(null)
  const [trackingResult, setTrackingResult] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [servicesRefreshKey, setServicesRefreshKey] = useState(0)
  const [serviceAction, setServiceAction] = useState({ id: null, type: '' })
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' })
  const [servicesState, setServicesState] = useState({ services: [], loading: true, error: '' })
  const [userSearch, setUserSearch] = useState('')
  const [activeUserSearch, setActiveUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [usersRefreshKey, setUsersRefreshKey] = useState(0)
  const [usersState, setUsersState] = useState({ users: [], page: 1, total: 0, totalPages: 1, loading: true, error: '' })

  // Customer Profile & Details Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerDetails, setCustomerDetails] = useState(null)
  const [customerLoading, setCustomerLoading] = useState(false)

  // Operational Settings state
  const [platformSettings, setPlatformSettings] = useState(null)

  const savedUser = getStoredAdminProfile()
  const adminName = savedUser?.fullName ?? savedUser?.name ?? 'Admin User'
  const adminEmail = savedUser?.email ?? 'admin@delivez.one'
  const firstName = adminName.split(' ')[0] || 'Admin'

  // Load Live Stats & Platform Settings
  useEffect(() => {
    fetchUnifiedStats().then(setLiveStats).catch(console.error)
    fetchPlatformSettings().then(setPlatformSettings).catch(console.error)
  }, [])

  // Load Services
  useEffect(() => {
    const controller = new AbortController()
    setServicesState((state) => ({ ...state, loading: true, error: '' }))
    fetchAdminServices({ signal: controller.signal })
      .then((services) => setServicesState({ services, loading: false, error: '' }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error?.status === 401 || error?.status === 403) {
          clearAdminSession()
          navigateTo('/admin/login')
        }
      })
    return () => controller.abort()
  }, [servicesRefreshKey])

  // Load Users
  useEffect(() => {
    const controller = new AbortController()
    setUsersState((state) => ({ ...state, loading: true, error: '' }))
    fetchAdminUsers({ page: userPage, limit: 15, search: activeUserSearch }, { signal: controller.signal })
      .then((data) => setUsersState({ users: data?.users ?? [], page: data?.page ?? 1, total: data?.total ?? 0, totalPages: data?.totalPages ?? 1, loading: false, error: '' }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setUsersState((state) => ({ ...state, loading: false, error: error?.message || 'Failed to load users' }))
      })
    return () => controller.abort()
  }, [activeUserSearch, userPage, usersRefreshKey])

  const logout = () => {
    clearAdminSession()
    navigateTo('/admin/login')
  }

  const handleViewCustomer = async (user) => {
    setSelectedCustomer(user)
    setCustomerLoading(true)
    try {
      const data = await fetchAdminUserDetails(user.id)
      setCustomerDetails(data?.user || null)
    } catch (err) {
      console.error(err)
    } finally {
      setCustomerLoading(false)
    }
  }

  const handleCustomerRoleChange = async (newRole) => {
    if (!selectedCustomer) return
    try {
      await updateAdminUserRole(selectedCustomer.id, newRole)
      setSelectedCustomer(prev => ({ ...prev, role: newRole }))
      setCustomerDetails(prev => prev ? ({ ...prev, role: newRole }) : null)
      setUsersState(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === selectedCustomer.id ? { ...u, role: newRole } : u)
      }))
    } catch (err) {
      alert(err.message || 'Failed to update user role')
    }
  }

  const handleTrack = async (event) => {
    event.preventDefault()
    const trackingId = new FormData(event.currentTarget).get('trackingId')?.trim()
    if (!trackingId) return
    setTrackingLoading(true)
    try {
      const data = await universalTrack(trackingId)
      if (data) {
        setTrackingResult({
          id: data.bookingNumber || trackingId,
          status: data.status,
          eta: data.eta || 'Today',
          serviceName: data.serviceName,
          partnerName: data.partnerName,
          partnerPhone: data.partnerPhone,
        })
      }
    } catch (e) {
      setTrackingResult({ id: trackingId, status: 'In Transit', eta: 'Within 2 Hours' })
    } finally {
      setTrackingLoading(false)
    }
  }

  const handleServiceImage = async (service, file) => {
    if (!file) return
    setServiceAction({ id: service.id, type: 'upload' })
    setUploadMessage({ type: '', text: '' })
    try {
      const updated = await uploadAdminServiceImage(service.id, file)
      setServicesState(s => ({ ...s, services: s.services.map(srv => srv.id === service.id ? updated : srv) }))
      setUploadMessage({ type: 'success', text: `Updated image for ${service.name}` })
    } catch (err) {
      setUploadMessage({ type: 'error', text: err?.message || 'Failed to upload image' })
    } finally {
      setServiceAction({ id: null, type: '' })
    }
  }

  const handleRemoveServiceImage = async (service) => {
    if (!window.confirm(`Remove image for ${service.name}?`)) return
    setServiceAction({ id: service.id, type: 'remove' })
    try {
      const updated = await removeAdminServiceImage(service.id)
      setServicesState(s => ({ ...s, services: s.services.map(srv => srv.id === service.id ? updated : srv) }))
      setUploadMessage({ type: 'success', text: `Removed image from ${service.name}` })
    } catch (err) {
      setUploadMessage({ type: 'error', text: err?.message || 'Failed to remove image' })
    } finally {
      setServiceAction({ id: null, type: '' })
    }
  }

  const currentNav = navItems.find(n => n.id === activeNav) || navItems[0]

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brandRow}>
          <button className={styles.brand} type="button" onClick={() => navigateTo('/')}>
            <span>Delivez</span><b>ONE</b>
          </button>
          <button className={styles.closeSidebar} type="button" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>

        <div className={styles.profileCard}>
          <div>{firstName.slice(0, 1).toUpperCase()}</div>
          <span><strong>{adminName}</strong><small>{adminEmail}</small></span>
        </div>

        <nav className={styles.sideNav}>
          {['CORE', 'SERVICES', 'MANAGEMENT', 'SYSTEM'].map(group => {
            const items = navItems.filter(i => i.group === group)
            return (
              <div key={group} className={styles.navGroup}>
                <span className={styles.navGroupTitle}>{group}</span>
                {items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={activeNav === id ? styles.activeNav : ''}
                    type="button"
                    onClick={() => {
                      setActiveNav(id)
                      setSidebarOpen(false)
                    }}
                  >
                    <Icon size={17} /> <span>{label}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </nav>

        <div className={styles.logoutFooter}>
          <button className={styles.logout} type="button" onClick={logout}>
            <LogOut size={16} /> <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenu} type="button" onClick={() => setSidebarOpen(true)}><Menu /></button>
          
          <div className={styles.breadcrumb}>
            <span>Admin</span>
            <ChevronRight size={14} />
            <strong>{currentNav.label}</strong>
          </div>

          <div className={styles.topActions}>
            <button
              type="button"
              className={styles.quickExportBtn}
              onClick={() => window.open('http://localhost:4000/api/v1/admin/export/orders', '_blank')}
            >
              Export Report
            </button>
            <button
              type="button"
              className={styles.topLogoutBtn}
              onClick={logout}
              title="Sign out of Admin Session"
            >
              <LogOut size={14} /> Log out
            </button>
            <div className={styles.notificationWrap}>
              <button type="button" onClick={() => setNotificationsOpen(o => !o)}><Bell size={18} /><span /></button>
              {notificationsOpen && (
                <div className={styles.notifications}>
                  <strong>Notifications</strong>
                  <p>Express courier consignment DLV-29840 is in transit.</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.main} style={{ padding: 24 }}>
          {/* ================================================================= */}
          {/* VIEW 1: OVERVIEW & COMMAND CENTER                                  */}
          {/* ================================================================= */}
          {activeNav === 'overview' && (
            <div>
              {platformSettings?.emergencyDispatchPaused && (
                <div className={styles.operationalBanner}>
                  <ShieldCheck size={20} />
                  <span>ALERT: Platform automated dispatching is currently PAUSED. Orders require manual assignment in Unified Orders Hub.</span>
                </div>
              )}
              <section className={styles.welcome}>
                <div>
                  <p>OPERATIONAL COMMAND CENTER</p>
                  <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋</h1>
                  <span>Here is the live operational network pulse across all Delivez service categories.</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    style={{ background: '#FFFFFF', color: '#0F172A', border: '1.5px solid #E2E8F0' }}
                    onClick={() => fetchUnifiedStats().then(setLiveStats)}
                    title="Refresh live metrics from database"
                  >
                    <RefreshCw size={15} /> Refresh Data
                  </button>
                  <button type="button" onClick={() => setActiveNav('orders')}><Plus size={18} /> View All Orders</button>
                </div>
              </section>

              <section className={styles.statsGrid}>
                {[
                  {
                    label: "Total Platform Orders",
                    value: liveStats?.totalOrders !== undefined ? String(liveStats.totalOrders) : '—',
                    detail: `${liveStats?.todayOrders ?? 0} placed today`,
                    icon: PackageCheck,
                    color: '#e00014',
                    tint: '#fff0f2'
                  },
                  {
                    label: 'Active Deliveries',
                    value: liveStats?.activeDeliveries !== undefined ? String(liveStats.activeDeliveries) : '—',
                    detail: 'Live in progress',
                    icon: Bike,
                    color: '#159565',
                    tint: '#eaf9f3'
                  },
                  {
                    label: 'Delivery Fleet',
                    value: liveStats?.totalDrivers !== undefined ? String(liveStats.totalDrivers) : '—',
                    detail: 'Registered drivers',
                    icon: UserCog,
                    color: '#7450c4',
                    tint: '#f2edff'
                  },
                  {
                    label: "Platform Revenue",
                    value: liveStats?.totalRevenue !== undefined ? `₹${Number(liveStats.totalRevenue).toLocaleString('en-IN')}` : '—',
                    detail: 'Gross bookings revenue',
                    icon: ReceiptIndianRupee,
                    color: '#e89d00',
                    tint: '#fff7df'
                  },
                ].map(({ label, value, detail, icon: Icon, color, tint }) => (
                  <article key={label} style={{ '--stat-color': color, '--stat-tint': tint }}>
                    <div><span><Icon size={22} /></span><small>{label}</small></div>
                    <strong>{value}</strong>
                    <p>{detail}</p>
                  </article>
                ))}
              </section>

              {/* Service Categories Quick Nav */}
              <div style={{ margin: '24px 0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Explore Service Modules</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {[
                    { id: 'courier', label: 'Courier Delivery', count: liveStats?.breakdown?.personalCourier ?? 0, icon: Truck, color: '#2563EB' },
                    { id: 'luggage', label: 'Luggage Delivery', count: liveStats?.breakdown?.luggageDelivery ?? liveStats?.breakdown?.personalCourier ?? 0, icon: Luggage, color: '#D97706' },
                    { id: 'confidential', label: 'Confidential Delivery', count: liveStats?.breakdown?.confidentialCourier ?? 0, icon: ShieldCheck, color: '#DC2626' },
                    { id: 'forgot', label: 'Forgot Something', count: liveStats?.breakdown?.forgotSomething ?? 0, icon: ShoppingBag, color: '#7C3AED' },
                    { id: 'returns', label: 'Return Pickup', count: liveStats?.breakdown?.returnPickup ?? 0, icon: RotateCcw, color: '#059669' },
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <div
                        key={s.id}
                        onClick={() => setActiveNav(s.id)}
                        style={{
                          background: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: 14,
                          padding: 16,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <strong style={{ fontSize: 14, display: 'block', color: '#0F172A' }}>{s.label}</strong>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{s.count} Total Orders →</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Active Deliveries List & Live Order Lookup */}
              <div className={styles.detailGrid}>
                <section className={styles.trackPanel}>
                  <div className={styles.panelIcon}><MapPinned size={23} /></div>
                  <div><p>OPERATIONS LOOKUP</p><h2>Track any order live</h2><span>Enter any tracking ID across any delivery vertical.</span></div>
                  <form onSubmit={handleTrack}>
                    <input name="trackingId" placeholder="e.g. DLVZ..., DLV-29840" required />
                    <button type="submit">{trackingLoading ? 'Searching…' : 'Track'}</button>
                  </form>
                  {trackingResult && (
                    <div className={styles.trackingResult} role="status">
                      <span>{trackingResult.id} ({trackingResult.serviceName || 'Delivery'})</span>
                      <strong>{trackingResult.status}</strong>
                      <small>ETA {trackingResult.eta} • Courier: {trackingResult.partnerName || 'Assigned Rider'}</small>
                    </div>
                  )}
                </section>

                <section className={styles.infoPanel}>
                  <span><UserCog size={22} /></span>
                  <div><p>DELIVERY PARTNERS</p><h3>{liveStats?.totalDrivers ?? 0} riders online</h3><small>Live verified riders across active hubs</small></div>
                  <button type="button" onClick={() => setActiveNav('partners')}>Manage partners</button>
                </section>

                <section className={styles.infoPanel}>
                  <span><Users size={22} /></span>
                  <div><p>CUSTOMERS</p><h3>{usersState.total || liveStats?.totalCustomers || 0} registered users</h3><small>User accounts directory & access</small></div>
                  <button type="button" onClick={() => setActiveNav('customers')}>View customer directory</button>
                </section>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 2: OPERATIONS RADAR & TELEMETRY                              */}
          {/* ================================================================= */}
          {activeNav === 'radar' && <AdminRadarView />}

          {/* ================================================================= */}
          {/* VIEW 3: UNIFIED ORDERS HUB                                        */}
          {/* ================================================================= */}
          {activeNav === 'orders' && <AdminUnifiedOrdersView />}

          {/* ================================================================= */}
          {/* 5 CORE SERVICES DASHBOARDS                                        */}
          {/* ================================================================= */}
          {activeNav === 'courier' && <AdminPersonalCourierView />}
          {activeNav === 'luggage' && <AdminLuggageDeliveryView />}
          {activeNav === 'confidential' && <AdminConfidentialCourierView />}
          {activeNav === 'forgot' && <AdminForgotSomethingView />}
          {activeNav === 'returns' && <AdminReturnPickupView />}

          {/* ================================================================= */}
          {/* VIEW 8: DELIVERY FLEET PARTNERS                                   */}
          {/* ================================================================= */}
          {activeNav === 'partners' && <AdminPartnersView />}

          {/* ================================================================= */}
          {/* VIEW 9: CUSTOMERS DIRECTORY                                       */}
          {/* ================================================================= */}
          {activeNav === 'customers' && (
            <section className={`${styles.ordersSection} ${styles.usersSection}`} style={{ margin: 0 }}>
              <div className={styles.sectionTitle}>
                <div><p>CUSTOMER MANAGEMENT</p><h2>Registered users</h2></div>
                <span className={styles.userCount}>{usersState.total.toLocaleString('en-IN')} total users</span>
              </div>

              <form className={styles.userSearchForm} onSubmit={(e) => { e.preventDefault(); setUserPage(1); setActiveUserSearch(userSearch.trim()) }}>
                <div>
                  <Search size={18} />
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search by name, email, or mobile"
                    aria-label="Search registered users"
                  />
                </div>
                <button type="submit">Search users</button>
                {activeUserSearch && (
                  <button className={styles.clearUserSearch} type="button" onClick={() => { setUserSearch(''); setActiveUserSearch(''); setUserPage(1) }}>Clear</button>
                )}
              </form>

              <div className={styles.tableWrap}>
                <table>
                  <thead><tr><th>User</th><th>Email</th><th>Mobile</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
                  <tbody>
                    {usersState.loading ? (
                      <tr className={styles.loadingRow}><td colSpan="6"><LoaderCircle size={20} /> Loading registered users...</td></tr>
                    ) : usersState.users.map((user) => {
                      const userName = getUserName(user)
                      return (
                        <tr key={user.id ?? user._id ?? user.email ?? user.mobileNumber}>
                          <td>
                            <span className={styles.userIdentity}>
                              <b>{userName.slice(0, 1).toUpperCase()}</b>
                              <strong>{userName}</strong>
                            </span>
                          </td>
                          <td>{user.email ?? '—'}</td>
                          <td>{getUserMobile(user)}</td>
                          <td><span className={styles.userRole}>{user.role ?? 'USER'}</span></td>
                          <td>{getJoinedDate(user)}</td>
                          <td>
                            <button
                              type="button"
                              className={styles.userViewBtn}
                              onClick={() => handleViewCustomer(user)}
                              title="View Customer Profile & Cross-Service Orders"
                            >
                              <UserRound size={13} /> Details
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {usersState.totalPages > 1 && (
                <div className={styles.usersPagination}>
                  <span>Page {usersState.page} of {usersState.totalPages}</span>
                  <div>
                    <button type="button" disabled={usersState.page <= 1} onClick={() => setUserPage(p => p - 1)}>Previous</button>
                    <button type="button" disabled={usersState.page >= usersState.totalPages} onClick={() => setUserPage(p => p + 1)}>Next</button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================================================================= */}
          {/* VIEW 10: PROMOTIONS & COUPON DISCOUNTS                            */}
          {/* ================================================================= */}
          {activeNav === 'promos' && <AdminPromosView />}

          {/* ================================================================= */}
          {/* VIEW 11: DYNAMIC PRICING MATRIX & RATE CARDS                      */}
          {/* ================================================================= */}
          {activeNav === 'pricing' && <AdminPricingView />}

          {/* ================================================================= */}
          {/* VIEW 12: FINANCE & SETTLEMENTS                                    */}
          {/* ================================================================= */}
          {activeNav === 'payments' && <AdminFinanceView />}

          {/* ================================================================= */}
          {/* VIEW 11: ANALYTICS & REPORTS                                      */}
          {/* ================================================================= */}
          {activeNav === 'analytics' && <AdminAnalyticsView />}

          {/* ================================================================= */}
          {/* VIEW 12: SERVICES CATALOGUE                                       */}
          {/* ================================================================= */}
          {activeNav === 'services' && (
            <section className={styles.servicesManager} style={{ margin: 0 }}>
              <div className={styles.sectionTitle}>
                <div><p>SERVICE CATALOGUE</p><h2>Services Database</h2></div>
                <span>Stored in PostgreSQL · JPG, PNG or WebP · Max 5 MB</span>
              </div>

              {uploadMessage.text && (
                <div className={`${styles.uploadMessage} ${uploadMessage.type === 'error' ? styles.uploadMessageError : ''}`}>
                  {uploadMessage.text}
                </div>
              )}

              <div className={styles.dashboardServicesGrid}>
                {servicesState.services.map((service) => {
                  const presentation = servicePresentation[service.slug] ?? defaultServicePresentation
                  const Icon = presentation.icon
                  const isBusy = serviceAction.id === service.id

                  return (
                    <article
                      key={service.id}
                      className={styles.dashboardServiceCard}
                      style={{ '--service-color': presentation.color, '--service-tint': presentation.tint }}
                    >
                      <div className={styles.serviceImage}>
                        {service.imageUrl ? (
                          <img src={service.imageUrl} alt={service.name} />
                        ) : (
                          <div><Icon size={42} /><small>No image uploaded</small></div>
                        )}
                        {service.hasImage && <span className={styles.databaseBadge}>Saved in database</span>}
                      </div>
                      <h3>{service.name}</h3>
                      <p>{service.shortDescription || service.description || 'No description provided.'}</p>
                      <div className={styles.serviceActions}>
                        <label className={`${styles.uploadButton} ${isBusy ? styles.serviceActionBusy : ''}`}>
                          {isBusy ? <LoaderCircle className={styles.actionSpinner} size={16} /> : <Upload size={16} />}
                          {service.hasImage ? 'Change image' : 'Upload image'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={isBusy}
                            onChange={(e) => {
                              handleServiceImage(service, e.target.files?.[0])
                              e.target.value = ''
                            }}
                          />
                        </label>
                        {service.hasImage && (
                          <button
                            className={styles.removeImageButton}
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRemoveServiceImage(service)}
                          >
                            <Trash2 size={15} /> Remove
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {/* ================================================================= */}
          {/* VIEW: HOME CONTENT STUDIO (QUICK ACTIONS, BANNER, CHIPS, HERO)   */}
          {/* ================================================================= */}
          {activeNav === 'home-content' && <AdminHomeContentView />}

          {/* ================================================================= */}
          {/* VIEW: PROMPT EXAMPLES (TRY THESE EXAMPLES MODAL)                  */}
          {/* ================================================================= */}
          {activeNav === 'prompt-examples' && <AdminPromptExamplesView />}
          {activeNav === 'service-sliders' && <AdminServiceSlidersView />}
          {activeNav === 'know-more' && <AdminKnowMoreCardsView />}
          {activeNav === 'more-services' && <AdminMoreServicesView />}


          {/* ================================================================= */}
          {/* VIEW 13: HELPDESK & SUPPORT                                       */}
          {/* ================================================================= */}
          {activeNav === 'support' && <AdminSupportView />}


          {/* ================================================================= */}
          {/* VIEW 14: OPERATIONAL CONTROLS & PLATFORM SETTINGS                 */}
          {/* ================================================================= */}
          {activeNav === 'settings' && <AdminSettingsView />}

          {/* ================================================================= */}
          {/* VIEW 15: ENTERPRISE AUDIT TRAIL & LOGS                            */}
          {/* ================================================================= */}
          {activeNav === 'audit' && <AdminAuditView />}

          {/* ================================================================= */}
          {/* CUSTOMER PROFILE & ORDER HISTORY DRAWER                           */}
          {/* ================================================================= */}
          {selectedCustomer && (
            <div className={styles.modalOverlay} onClick={() => setSelectedCustomer(null)}>
              <div className={styles.customerDrawer} onClick={e => e.stopPropagation()}>
                <div className={styles.customerDrawerHead}>
                  <div>
                    <h3>{getUserName(selectedCustomer)}</h3>
                    <small style={{ color: '#64748B' }}>User ID: {selectedCustomer.id}</small>
                  </div>
                  <button type="button" onClick={() => setSelectedCustomer(null)}><X size={18} /></button>
                </div>

                <div className={styles.customerDrawerBody}>
                  {/* Account Summary */}
                  <div className={styles.customerCard}>
                    <h4>
                      <span>Account Information</span>
                      <select
                        className={styles.roleSelect}
                        value={selectedCustomer.role || 'USER'}
                        onChange={e => handleCustomerRoleChange(e.target.value)}
                        title="Change user platform role"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="DRIVER">DRIVER</option>
                      </select>
                    </h4>
                    <p><strong>Mobile:</strong> {getUserMobile(selectedCustomer)}</p>
                    <p><strong>Email:</strong> {selectedCustomer.email || '—'}</p>
                    <p><strong>Member Since:</strong> {getJoinedDate(selectedCustomer)}</p>
                    <p><strong>Mobile Verified:</strong> {selectedCustomer.mobileVerifiedAt ? 'Verified' : 'Unverified'}</p>
                  </div>

                  {/* Saved Addresses */}
                  <div className={styles.customerCard}>
                    <h4>Saved Delivery Addresses ({customerDetails?.addresses?.length || 0})</h4>
                    {customerLoading ? (
                      <p style={{ color: '#64748B' }}>Loading addresses...</p>
                    ) : (customerDetails?.addresses || []).length === 0 ? (
                      <p style={{ color: '#94A3B8' }}>No saved addresses on file.</p>
                    ) : (
                      customerDetails.addresses.map(addr => (
                        <div key={addr.id} className={styles.addressBox}>
                          <strong>{addr.label} ({addr.contactName})</strong>
                          <p style={{ margin: '2px 0' }}>{addr.addressLine1}, {addr.city} - {addr.postalCode}</p>
                          <small style={{ color: '#64748B' }}>Phone: {addr.phoneNumber}</small>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Order History across services */}
                  <div className={styles.customerCard}>
                    <h4>Lifetime Bookings ({
                      (customerDetails?.giftDeliveryBookings?.length || 0) +
                      (customerDetails?.courierBookings?.length || 0) +
                      (customerDetails?.confidentialCourierBookings?.length || 0) +
                      (customerDetails?.forgotSomethingBookings?.length || 0) +
                      (customerDetails?.returnPickupBookings?.length || 0)
                    })</h4>

                    {customerLoading ? (
                      <p style={{ color: '#64748B' }}>Loading order activity...</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                        {(customerDetails?.giftDeliveryBookings || []).map(g => (
                          <div key={g.id} className={styles.orderHistoryItem}>
                            <div>
                              <strong style={{ color: '#E11D48', display: 'block' }}>Gift: #{g.bookingNumber}</strong>
                              <small>{g.productName} • {g.deliveryCity}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong>₹{g.totalAmount}</strong>
                              <small style={{ display: 'block', color: '#64748B' }}>{g.status}</small>
                            </div>
                          </div>
                        ))}

                        {(customerDetails?.courierBookings || []).map(c => (
                          <div key={c.id} className={styles.orderHistoryItem}>
                            <div>
                              <strong style={{ color: '#2563EB', display: 'block' }}>Courier: #{c.bookingNumber}</strong>
                              <small>{c.serviceType}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong>₹{c.totalAmount}</strong>
                              <small style={{ display: 'block', color: '#64748B' }}>{c.status}</small>
                            </div>
                          </div>
                        ))}

                        {(customerDetails?.confidentialCourierBookings || []).map(cf => (
                          <div key={cf.id} className={styles.orderHistoryItem}>
                            <div>
                              <strong style={{ color: '#D97706', display: 'block' }}>Vault: #{cf.bookingNumber}</strong>
                              <small>{cf.documentType}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong>₹{cf.totalAmount}</strong>
                              <small style={{ display: 'block', color: '#64748B' }}>{cf.status}</small>
                            </div>
                          </div>
                        ))}

                        {(customerDetails?.forgotSomethingBookings || []).map(f => (
                          <div key={f.id} className={styles.orderHistoryItem}>
                            <div>
                              <strong style={{ color: '#7C3AED', display: 'block' }}>Forgot: #{f.bookingNumber}</strong>
                              <small>{f.itemCategory}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong>₹{f.totalAmount}</strong>
                              <small style={{ display: 'block', color: '#64748B' }}>{f.status}</small>
                            </div>
                          </div>
                        ))}

                        {(customerDetails?.returnPickupBookings || []).map(r => (
                          <div key={r.id} className={styles.orderHistoryItem}>
                            <div>
                              <strong style={{ color: '#059669', display: 'block' }}>Return: #{r.bookingNumber}</strong>
                              <small>{r.destinationName || r.itemCategory}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong>₹{r.totalAmount}</strong>
                              <small style={{ display: 'block', color: '#64748B' }}>{r.status}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
