import React, { useEffect, useState } from 'react'
import {
  Undo2,
  Package,
  Search,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Store,
  MapPin,
  Loader2,
  CalendarDays
} from 'lucide-react'
import { fetchReturnPickupBookings } from '@/features/return-pickup/services/returnPickupService.js'
import styles from './ReturnPickupListPage.module.css'

export default function ReturnPickupListPage() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await fetchReturnPickupBookings({ status: activeTab, search: searchQuery })
      if (res?.bookings) {
        setBookings(res.bookings)
      } else {
        setBookings([])
      }
    } catch (err) {
      console.warn('Could not fetch return bookings from API, using fallback sample:', err)
      setBookings([
        {
          id: 'DRVZ-RET-080525-00123',
          bookingNumber: 'DRVZ-RET-080525-00123',
          status: 'DELIVERED',
          destinationName: 'ABC Retail Returns Hub',
          itemDescription: 'Sony Wireless Headphones (Black)',
          itemQuantity: 1,
          totalAmount: 108.00,
          scheduledDate: '08 May 2026',
          scheduledTimeSlot: '11:00 AM - 1:00 PM',
          deliveryService: 'STANDARD',
          pickupCity: 'Bengaluru'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [activeTab])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadBookings()
  }

  return (
    <div className={styles.listPageWrapper}>
      {/* Header */}
      <header className={styles.listHeader}>
        <div className={styles.headerInner}>
          <div className={styles.titleCol}>
            <div className={styles.badgeRow}>
              <span className={styles.brandBadge}>DELIVEZ BACK</span>
              <span className={styles.secureTag}>
                <ShieldCheck size={13} /> 100% Damage Protected
              </span>
            </div>
            <h1>My Return Pickups</h1>
            <p>Track, manage, and download invoices for all your return shipments.</p>
          </div>

          <button
            type="button"
            className={styles.newReturnBtn}
            onClick={() => window.location.href = '/book/return-pickup'}
          >
            <Plus size={16} />
            <span>Book New Return</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className={styles.listContainer}>
        {/* Filter Tabs & Search Bar */}
        <div className={styles.controlsRow}>
          <div className={styles.tabsList}>
            {[
              { id: 'ALL', label: 'All Returns' },
              { id: 'ACTIVE', label: 'In Progress' },
              { id: 'COMPLETED', label: 'Delivered' },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? styles.activeTab : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by ID, product, or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className={styles.loadingBox}>
            <Loader2 className={styles.spinner} size={32} color="#d97706" />
            <span>Loading your returns...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className={styles.emptyBox}>
            <Package size={48} color="#cbd5e1" />
            <h3>No returns found</h3>
            <p>You haven't placed any return pickup requests under this filter.</p>
            <button
              type="button"
              className={styles.emptyActionBtn}
              onClick={() => window.location.href = '/book/return-pickup'}
            >
              <Plus size={16} />
              <span>Book a Return Pickup</span>
            </button>
          </div>
        ) : (
          <div className={styles.bookingCardsGrid}>
            {bookings.map(b => {
              const isDelivered = b.status === 'DELIVERED'
              const isCancelled = b.status === 'CANCELLED'
              return (
                <article key={b.id || b.bookingNumber} className={styles.returnCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <span className={styles.storeBadge}>
                        <Store size={14} /> {b.destinationName || 'Seller Hub'}
                      </span>
                      <strong className={styles.bookingNumberText}>{b.bookingNumber || b.id}</strong>
                    </div>
                    <span className={`${styles.statusBadge} ${styles[b.status] || ''}`}>
                      {isDelivered ? 'Delivered' : isCancelled ? 'Cancelled' : b.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.itemTitleRow}>
                      <Package size={18} color="#d97706" />
                      <div>
                        <strong>{b.itemDescription || 'Electronic / Retail Item'}</strong>
                        <small>Qty: {b.itemQuantity || 1} • {b.deliveryService || 'Standard'} Speed</small>
                      </div>
                    </div>

                    <div className={styles.cardMetaGrid}>
                      <div className={styles.metaItem}>
                        <CalendarDays size={14} color="#64748b" />
                        <span>Pickup: {b.scheduledDate || 'Today'} ({b.scheduledTimeSlot || '11 AM - 1 PM'})</span>
                      </div>
                      <div className={styles.metaItem}>
                        <MapPin size={14} color="#64748b" />
                        <span>City: {b.pickupCity || 'Bengaluru'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.priceCol}>
                      <small>Total Amount</small>
                      <strong>₹{(Number(b.totalAmount) || 108).toFixed(2)}</strong>
                    </div>

                    <div className={styles.actionButtonsRow}>
                      <button
                        type="button"
                        className={styles.detailsBtn}
                        onClick={() => window.location.href = `/return-pickup/details/${b.bookingNumber || b.id}`}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className={styles.trackBtn}
                        onClick={() => window.location.href = `/track/return-pickup/${b.bookingNumber || b.id}`}
                      >
                        <span>Track Live</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
