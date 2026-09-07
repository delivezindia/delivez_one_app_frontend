import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Printer,
  Gift,
  MapPin,
  Calendar,
  Shield,
  Clock,
  User,
  CreditCard,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  Navigation
} from 'lucide-react'
import {
  fetchGiftDeliveryBookingById,
  fetchGiftDeliveryInvoice
} from '@/features/gift-delivery/services/giftDeliveryService.js'
import styles from './GiftDeliveryDetailsPage.module.css'

export default function GiftDeliveryDetailsPage({ bookingId }) {
  const [booking, setBooking] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const b = await fetchGiftDeliveryBookingById(bookingId)
        setBooking(b)
        try {
          const inv = await fetchGiftDeliveryInvoice(bookingId)
          setInvoice(inv)
        } catch {
          // invoice optional
        }
      } catch (err) {
        console.error('Failed to load gift details:', err)
      } finally {
        setLoading(false)
      }
    }
    if (bookingId) loadData()
  }, [bookingId])

  const handlePrint = () => {
    window.print()
  }

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Gift size={32} className={styles.pulse} />
        <p>Loading gift order details...</p>
      </div>
    )
  }

  return (
    <div className={styles.detailsPage}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => (window.location.href = '/user/dashboard')}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>Gift Order Details</h2>
        <button type="button" className={styles.printBtn} onClick={handlePrint} title="Print Invoice">
          <Printer size={18} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {/* Order Header Card */}
        <div className={styles.card}>
          <div className={styles.orderHeaderRow}>
            <div>
              <span className={styles.metaLabel}>Order Number</span>
              <div className={styles.orderNumberRow}>
                <strong className={styles.orderNumber}>{booking?.bookingNumber || bookingId}</strong>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => handleCopyId(booking?.bookingNumber || bookingId)}
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <span className={`${styles.statusBadge} ${styles['status_' + (booking?.status || 'CONFIRMED')]}`}>
              {booking?.status || 'CONFIRMED'}
            </span>
          </div>
        </div>

        {/* Gift Product Summary */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Item Information</h3>
          <div className={styles.giftRow}>
            <img
              src={booking?.gift?.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80'}
              alt={booking?.gift?.name}
              className={styles.giftImg}
            />
            <div className={styles.giftInfo}>
              <strong>{booking?.gift?.name || 'Chocolate Truffle Cake'}</strong>
              <p>{booking?.gift?.description}</p>
              <div className={styles.tagsRow}>
                <span>Qty: {booking?.gift?.quantity || 1}</span>
                {booking?.gift?.weight && <span>Weight: {booking.gift.weight}</span>}
                {booking?.gift?.serves && <span>Serves: {booking.gift.serves}</span>}
              </div>
              <strong className={styles.giftPrice}>₹{booking?.gift?.price}</strong>
            </div>
          </div>

          {booking?.gift?.message && (
            <div className={styles.greetingCardBox}>
              <div className={styles.cardThemeHeader}>
                <Gift size={16} />
                <span>Greeting Card: {booking.gift.greetingCard?.name || 'Happy Birthday Celebration'}</span>
              </div>
              <p className={styles.cardMessageText}>"{booking.gift.message}"</p>
            </div>
          )}
        </div>

        {/* Delivery & Schedule */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Recipient & Delivery Schedule</h3>
          <div className={styles.infoRow}>
            <User size={16} />
            <div>
              <span className={styles.infoLabel}>Deliver to:</span>
              <strong>{booking?.recipient?.name || 'Rahul Sharma'} ({booking?.recipient?.phone})</strong>
            </div>
          </div>
          <div className={styles.infoRow}>
            <MapPin size={16} />
            <div>
              <span className={styles.infoLabel}>Delivery Address:</span>
              <p>{booking?.recipient?.address}, {booking?.recipient?.city} - {booking?.recipient?.postalCode}</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <Calendar size={16} />
            <div>
              <span className={styles.infoLabel}>Scheduled Date & Time:</span>
              <p>{booking?.scheduledDate} ({booking?.scheduledTimeSlot}) • {booking?.deliveryType}</p>
            </div>
          </div>
        </div>

        {/* Itemized Bill / Invoice */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>Payment Receipt & Tax Invoice</h3>
            <span className={styles.sacBadge}>SAC: 996812</span>
          </div>

          <div className={styles.receiptLine}>
            <span>Item Total</span>
            <span>₹{booking?.itemTotal || 699}</span>
          </div>
          <div className={styles.receiptLine}>
            <span>Delivery Charges ({booking?.deliveryType || 'Standard'})</span>
            <span>₹{booking?.deliveryCharge || 49}</span>
          </div>
          <div className={styles.receiptLine}>
            <span>Packaging & Premium Box</span>
            <span>₹{booking?.packagingCharge || 20}</span>
          </div>
          {booking?.addonsTotal > 0 && (
            <div className={styles.receiptLine}>
              <span>Add-ons & Premium Setup</span>
              <span>₹{booking.addonsTotal}</span>
            </div>
          )}
          {booking?.discountAmount > 0 && (
            <div className={`${styles.receiptLine} ${styles.discountText}`}>
              <span>Discount</span>
              <span>-₹{booking.discountAmount}</span>
            </div>
          )}
          <div className={styles.receiptLine}>
            <span>Taxes (GST 18%)</span>
            <span>₹{booking?.taxAmount || 38}</span>
          </div>
          <div className={`${styles.receiptLine} ${styles.totalRow}`}>
            <strong>Grand Total</strong>
            <strong>₹{booking?.totalAmount || 806}</strong>
          </div>
          <div className={styles.paymentMethodLine}>
            <span>Paid via: <strong>{booking?.paymentMethod || 'UPI'}</strong></span>
            <span>Ref: {booking?.paymentReference || 'PAY-GIFT-1234'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionsGrid}>
          <button
            type="button"
            className={styles.trackBtn}
            onClick={() => {
              window.location.href = `/gift-delivery/track/${booking?.bookingNumber || bookingId}`
            }}
          >
            <Navigation size={16} /> Track Live Delivery
          </button>
        </div>
      </main>
    </div>
  )
}
