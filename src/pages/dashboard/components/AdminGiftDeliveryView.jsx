import React, { useCallback, useEffect, useState } from 'react'
import {
  Gift,
  LayoutDashboard,
  PackageCheck,
  ShoppingBag,
  Layers,
  CreditCard,
  MapPin,
  Clock,
  Settings,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Calendar,
  User,
  Phone,
  Upload,
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  Tag,
  Truck,
  Shield,
  FileText
} from 'lucide-react'
import {
  fetchGiftMetrics,
  fetchAdminGiftOrders,
  fetchAdminGiftOrder,
  updateAdminGiftOrderStatus,
  cancelAdminGiftOrder,
  fetchAdminGiftProducts,
  createAdminGiftProduct,
  updateAdminGiftProduct,
  deleteAdminGiftProduct,
  fetchAdminGiftCategories,
  createAdminGiftCategory,
  updateAdminGiftCategory,
  deleteAdminGiftCategory,
  fetchAdminGiftCards,
  createAdminGiftCard,
  updateAdminGiftCard,
  deleteAdminGiftCard,
  fetchAdminGiftLocations,
  createAdminGiftLocation,
  updateAdminGiftLocation,
  deleteAdminGiftLocation,
  fetchAdminGiftConfig,
  updateAdminGiftConfig,
  createAdminGiftSlot,
  updateAdminGiftSlot,
  deleteAdminGiftSlot
} from '@/features/admin-gift-delivery/services/adminGiftDeliveryService.js'
import styles from './AdminGiftDeliveryView.module.css'

export default function AdminGiftDeliveryView() {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'orders' | 'products' | 'categories' | 'cards' | 'locations'
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // ---------------------------------------------------------------------------
  // Tab 1: Dashboard State
  // ---------------------------------------------------------------------------
  const [metrics, setMetrics] = useState(null)
  const loadMetrics = useCallback(async () => {
    try {
      const data = await fetchGiftMetrics()
      setMetrics(data)
    } catch (e) {
      console.error(e)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Tab 2: Orders State
  // ---------------------------------------------------------------------------
  const [orders, setOrders] = useState([])
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })
  const [orderFilters, setOrderFilters] = useState({
    search: '',
    status: 'ALL',
    paymentStatus: 'ALL',
    deliveryType: 'ALL',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortDir: 'desc'
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  const loadOrders = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const data = await fetchAdminGiftOrders({
        page,
        limit: ordersPagination.limit,
        ...orderFilters
      })
      if (data) {
        setOrders(data.orders || [])
        setOrdersPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 })
      }
    } catch (e) {
      showToast(e.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [orderFilters, ordersPagination.limit])

  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdateLoading(true)
    try {
      const updated = await updateAdminGiftOrderStatus(orderId, { status: newStatus })
      showToast(`Order ${updated.bookingNumber} marked as ${newStatus}`)
      if (selectedOrder?.id === orderId) setSelectedOrder(updated)
      loadOrders(ordersPagination.page)
      loadMetrics()
    } catch (e) {
      alert(e.message || 'Failed to update order status.')
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Tab 3: Products State
  // ---------------------------------------------------------------------------
  const [products, setProducts] = useState([])
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL')
  const [productSearch, setProductSearch] = useState('')
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    discountPrice: '',
    description: '',
    weight: '1 kg',
    serves: '6 - 8 People',
    occasionTag: 'Birthday',
    badge: '',
    stockQuantity: 100,
    isAvailable: true
  })
  const [productImageFile, setProductImageFile] = useState(null)
  const [productImagePreview, setProductImagePreview] = useState('')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminGiftProducts({
        categoryId: productCategoryFilter,
        search: productSearch
      })
      setProducts(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [productCategoryFilter, productSearch])

  const openProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod)
      setProductForm({
        name: prod.name,
        categoryId: prod.categoryId,
        price: prod.price,
        discountPrice: prod.discountPrice || '',
        description: prod.description || '',
        weight: prod.weight || '',
        serves: prod.serves || '',
        occasionTag: prod.occasionTag || 'Birthday',
        badge: prod.badge || '',
        stockQuantity: prod.stockQuantity || 100,
        isAvailable: prod.isAvailable
      })
      setProductImagePreview(prod.image || '')
    } else {
      setEditingProduct(null)
      setProductForm({
        name: '',
        categoryId: categories[0]?.id || '',
        price: '',
        discountPrice: '',
        description: '',
        weight: '1 kg',
        serves: '6 - 8 People',
        occasionTag: 'Birthday',
        badge: '',
        stockQuantity: 100,
        isAvailable: true
      })
      setProductImagePreview('')
    }
    setProductImageFile(null)
    setProductModalOpen(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      alert('Please fill product name, category, and price.')
      return
    }

    const formData = new FormData()
    Object.entries(productForm).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v)
    })
    if (productImageFile) {
      formData.append('image', productImageFile)
    }

    try {
      if (editingProduct) {
        await updateAdminGiftProduct(editingProduct.id, formData)
        showToast('Product updated successfully!')
      } else {
        await createAdminGiftProduct(formData)
        showToast('New product created successfully!')
      }
      setProductModalOpen(false)
      loadProducts()
      loadMetrics()
    } catch (err) {
      alert(err.message || 'Failed to save product.')
    }
  }

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await deleteAdminGiftProduct(prodId)
      showToast('Product deleted.')
      loadProducts()
      loadMetrics()
    } catch (e) {
      alert(e.message || 'Failed to delete product.')
    }
  }

  // ---------------------------------------------------------------------------
  // Tab 4: Categories State
  // ---------------------------------------------------------------------------
  const [categories, setCategories] = useState([])
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', iconName: 'Gift', displayOrder: 0, isActive: true })
  const [categoryImageFile, setCategoryImageFile] = useState(null)

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchAdminGiftCategories()
      setCategories(data || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!categoryForm.name) return

    const formData = new FormData()
    formData.append('name', categoryForm.name)
    formData.append('description', categoryForm.description || '')
    formData.append('iconName', categoryForm.iconName || 'Gift')
    formData.append('displayOrder', categoryForm.displayOrder || 0)
    formData.append('isActive', categoryForm.isActive)
    if (categoryImageFile) formData.append('image', categoryImageFile)

    try {
      if (editingCategory) {
        await updateAdminGiftCategory(editingCategory.id, formData)
        showToast('Category updated!')
      } else {
        await createAdminGiftCategory(formData)
        showToast('New category created!')
      }
      setCategoryModalOpen(false)
      loadCategories()
      loadMetrics()
    } catch (err) {
      alert(err.message || 'Failed to save category.')
    }
  }

  const handleDeleteCategory = async (cat) => {
    if (!cat) return
    const msg = (cat.productsCount || 0) > 0
      ? `Category "${cat.name}" currently contains ${cat.productsCount} products. Deleting this category will also remove its associated products. Are you sure?`
      : `Are you sure you want to delete category "${cat.name}"?`
    
    if (!window.confirm(msg)) return

    try {
      await deleteAdminGiftCategory(cat.id)
      showToast(`Category "${cat.name}" deleted successfully!`)
      loadCategories()
      loadMetrics()
    } catch (err) {
      alert(err.message || 'Failed to delete category.')
    }
  }

  // ---------------------------------------------------------------------------
  // Tab 5: Cards State
  // ---------------------------------------------------------------------------
  const [cards, setCards] = useState([])
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [cardForm, setCardForm] = useState({ name: '', theme: 'Birthday', minAmount: 100, maxAmount: 10000, validityDays: 365, isActive: true })
  const [cardImageFile, setCardImageFile] = useState(null)

  const loadCards = useCallback(async () => {
    try {
      const data = await fetchAdminGiftCards()
      setCards(data || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleSaveCard = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(cardForm).forEach(([k, v]) => formData.append(k, v))
    if (cardImageFile) formData.append('image', cardImageFile)

    try {
      await createAdminGiftCard(formData)
      showToast('Gift Card created!')
      setCardModalOpen(false)
      loadCards()
    } catch (err) {
      alert(err.message || 'Failed to save card design.')
    }
  }

  // ---------------------------------------------------------------------------
  // Tab 6: Locations & Config State
  // ---------------------------------------------------------------------------
  const [locations, setLocations] = useState([])
  const [config, setConfig] = useState(null)
  const [slots, setSlots] = useState([])
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [locationForm, setLocationForm] = useState({ name: '', city: '', state: '', postalCodes: '', baseDeliveryCharge: 49, minOrderAmount: 299, estimatedDeliveryTime: '2-4 Hours', isSameDayAvailable: true, isMidnightAvailable: true, isActive: true })

  const loadLocationsAndConfig = useCallback(async () => {
    try {
      const [locs, cfg] = await Promise.all([
        fetchAdminGiftLocations(),
        fetchAdminGiftConfig()
      ])
      setLocations(locs || [])
      setConfig(cfg?.config || null)
      setSlots(cfg?.slots || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleSaveLocation = async (e) => {
    e.preventDefault()
    try {
      await createAdminGiftLocation(locationForm)
      showToast('Delivery location created!')
      setLocationModalOpen(false)
      loadLocationsAndConfig()
    } catch (err) {
      alert(err.message || 'Failed to save location.')
    }
  }

  const handleSaveConfig = async (e) => {
    e.preventDefault()
    if (!config) return
    try {
      await updateAdminGiftConfig(config)
      showToast('Global settings updated!')
    } catch (err) {
      alert(err.message || 'Failed to update settings.')
    }
  }

  // Initial Data Load
  useEffect(() => {
    loadMetrics()
    loadCategories()
    if (activeTab === 'orders') loadOrders(1)
    if (activeTab === 'products') loadProducts()
    if (activeTab === 'cards') loadCards()
    if (activeTab === 'locations') loadLocationsAndConfig()
  }, [activeTab, loadMetrics, loadCategories, loadOrders, loadProducts, loadCards, loadLocationsAndConfig])

  return (
    <div className={styles.adminWrapper}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Module Header */}
      <div className={styles.moduleHeader}>
        <div>
          <h1 className={styles.moduleTitle}>
            <Gift size={26} className={styles.titleIcon} /> Gift & Celebration Management
          </h1>
          <p className={styles.moduleSubtitle}>
            Dynamic control over gift categories, handcrafted catalog, luxury add-ons, greeting cards, delivery zones & live orders.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => {
            if (activeTab === 'products') openProductModal()
            else if (activeTab === 'categories') {
              setEditingCategory(null)
              setCategoryForm({ name: '', description: '', iconName: 'Gift', displayOrder: categories.length, isActive: true })
              setCategoryModalOpen(true)
            } else if (activeTab === 'cards') {
              setCardForm({ name: '', theme: 'Birthday', minAmount: 100, maxAmount: 10000, validityDays: 365, isActive: true })
              setCardModalOpen(true)
            } else if (activeTab === 'locations') {
              setLocationModalOpen(true)
            } else {
              openProductModal()
            }
          }}
        >
          <Plus size={18} /> Add New {activeTab === 'categories' ? 'Category' : activeTab === 'cards' ? 'Card Design' : activeTab === 'locations' ? 'Location' : 'Product'}
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className={styles.tabsNav}>
        {[
          { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
          { id: 'orders', label: `Orders (${metrics?.totalOrders || 0})`, icon: PackageCheck },
          { id: 'products', label: `Products (${metrics?.activeProductsCount || products.length})`, icon: ShoppingBag },
          { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
          { id: 'cards', label: 'Greeting Cards', icon: CreditCard },
          { id: 'locations', label: 'Locations & Rules', icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: DASHBOARD & METRICS                                          */}
      {/* =================================================================== */}
      {activeTab === 'dashboard' && (
        <div className={styles.dashboardTabContent}>
          {/* KPI Stat Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIconCircle} style={{ background: '#FFF1F2', color: '#E11D48' }}>
                <Gift size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Gift Orders</span>
                <strong className={styles.statValue}>{metrics?.totalOrders || 0}</strong>
                <span className={styles.statSub}>Lifetime celebration orders</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconCircle} style={{ background: '#FEF3C7', color: '#D97706' }}>
                <TrendingUp size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Today's Orders</span>
                <strong className={styles.statValue}>{metrics?.todayOrders || 0}</strong>
                <span className={styles.statSub}>Placed since midnight</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconCircle} style={{ background: '#ECFDF5', color: '#059669' }}>
                <IndianRupee size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Revenue</span>
                <strong className={styles.statValue}>₹{metrics?.totalRevenue?.toLocaleString('en-IN') || 0}</strong>
                <span className={styles.statSub}>Excluding cancelled orders</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconCircle} style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <ShoppingBag size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Active Catalog</span>
                <strong className={styles.statValue}>{metrics?.activeProductsCount || 0}</strong>
                <span className={styles.statSub}>Across {metrics?.activeCategoriesCount || 0} categories</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Grid */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionHeading}>Live Order Status Pipeline</h2>
            <div className={styles.pipelineGrid}>
              {[
                { status: 'CONFIRMED', label: 'Confirmed', color: '#3B82F6', bg: '#EFF6FF' },
                { status: 'PREPARING_GIFT', label: 'Preparing Gift', color: '#F59E0B', bg: '#FFFBEB' },
                { status: 'GIFT_PACKED', label: 'Gift Packed', color: '#8B5CF6', bg: '#F5F3FF' },
                { status: 'ON_THE_WAY', label: 'On The Way', color: '#EC4899', bg: '#FDF2F8' },
                { status: 'ARRIVED', label: 'Arrived at Destination', color: '#06B6D4', bg: '#ECFEFF' },
                { status: 'DELIVERED', label: 'Delivered', color: '#10B981', bg: '#ECFDF5' },
                { status: 'CANCELLED', label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2' },
              ].map(st => {
                const count = metrics?.statusCounts?.[st.status] || 0
                return (
                  <div
                    key={st.status}
                    className={styles.pipelineCard}
                    style={{ background: st.bg, borderColor: st.color }}
                    onClick={() => {
                      setOrderFilters(prev => ({ ...prev, status: st.status }))
                      setActiveTab('orders')
                    }}
                  >
                    <span className={styles.pipelineLabel} style={{ color: st.color }}>{st.label}</span>
                    <strong className={styles.pipelineCount} style={{ color: st.color }}>{count}</strong>
                    <span className={styles.pipelineAction}>View Orders →</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: ORDERS MANAGEMENT                                            */}
      {/* =================================================================== */}
      {activeTab === 'orders' && (
        <div className={styles.tabContent}>
          {/* Filters Bar */}
          <div className={styles.filterCard}>
            <div className={styles.filterRow}>
              <div className={styles.searchBox}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search Order ID, recipient, customer, phone..."
                  value={orderFilters.search}
                  onChange={e => setOrderFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <select
                value={orderFilters.status}
                onChange={e => setOrderFilters(prev => ({ ...prev, status: e.target.value }))}
                className={styles.filterSelect}
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING_GIFT">Preparing Gift</option>
                <option value="GIFT_PACKED">Gift Packed</option>
                <option value="ON_THE_WAY">On The Way</option>
                <option value="ARRIVED">Arrived</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={orderFilters.deliveryType}
                onChange={e => setOrderFilters(prev => ({ ...prev, deliveryType: e.target.value }))}
                className={styles.filterSelect}
              >
                <option value="ALL">All Delivery Speeds</option>
                <option value="STANDARD">Standard</option>
                <option value="EXPRESS">Express</option>
                <option value="PRECISE_TIME">Precise Time</option>
                <option value="MIDNIGHT">Midnight</option>
              </select>

              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => loadOrders(1)}
              >
                <RefreshCw size={14} className={loading ? styles.spinner : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className={styles.tableCard}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Recipient & City</th>
                  <th>Gift Item</th>
                  <th>Delivery Slot</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyCell}>
                      No gift delivery orders found matching your filters.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <strong className={styles.orderNumberLink} onClick={() => setSelectedOrder(order)}>
                          {order.bookingNumber}
                        </strong>
                        <span className={styles.timestampCell}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        <strong>{order.user?.fullName || 'Guest Customer'}</strong>
                        <span className={styles.metaSub}>{order.user?.mobileNumber}</span>
                      </td>
                      <td>
                        <strong>{order.recipientName}</strong>
                        <span className={styles.metaSub}>{order.deliveryCity} • {order.recipientPhone}</span>
                      </td>
                      <td>
                        <strong>{order.productName}</strong>
                        <span className={styles.metaSub}>Qty: {order.productQuantity} • {order.categoryName}</span>
                      </td>
                      <td>
                        <span>{order.scheduledDate}</span>
                        <span className={styles.metaSub}>{order.scheduledTimeSlot} ({order.deliveryType})</span>
                      </td>
                      <td>
                        <strong>₹{Number(order.totalAmount)}</strong>
                        <span className={styles.metaSub}>{order.paymentMethod}</span>
                      </td>
                      <td>
                        <select
                          className={`${styles.statusBadgeSelect} ${styles['badge_' + order.status]}`}
                          value={order.status}
                          disabled={order.status === 'CANCELLED' || statusUpdateLoading}
                          onChange={e => handleUpdateStatus(order.id, e.target.value)}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING_GIFT">PREPARING</option>
                          <option value="GIFT_PACKED">PACKED</option>
                          <option value="ON_THE_WAY">ON THE WAY</option>
                          <option value="ARRIVED">ARRIVED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.iconActionBtn}
                          onClick={() => setSelectedOrder(order)}
                          title="View Order Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {ordersPagination.totalPages > 1 && (
              <div className={styles.paginationRow}>
                <span>
                  Showing Page {ordersPagination.page} of {ordersPagination.totalPages} ({ordersPagination.total} orders)
                </span>
                <div className={styles.pageBtnGroup}>
                  <button
                    type="button"
                    disabled={ordersPagination.page <= 1}
                    onClick={() => loadOrders(ordersPagination.page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={ordersPagination.page >= ordersPagination.totalPages}
                    onClick={() => loadOrders(ordersPagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PRODUCTS MANAGEMENT                                          */}
      {/* =================================================================== */}
      {activeTab === 'products' && (
        <div className={styles.tabContent}>
          <div className={styles.filterCard}>
            <div className={styles.filterRow}>
              <div className={styles.searchBox}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search product name, SKU, tag..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button type="button" className={styles.primaryBtn} onClick={() => openProductModal()}>
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className={styles.productsGrid}>
            {products.map(prod => (
              <div key={prod.id} className={styles.productCard}>
                <div className={styles.productImgBox}>
                  <img src={prod.image} alt={prod.name} />
                  {prod.badge && <span className={styles.badgePill}>{prod.badge}</span>}
                  <span className={`${styles.availPill} ${prod.isAvailable ? styles.availYes : styles.availNo}`}>
                    {prod.isAvailable ? 'In Stock' : 'Unavailable'}
                  </span>
                </div>
                <div className={styles.productCardBody}>
                  <span className={styles.catLabel}>{prod.categoryName}</span>
                  <strong className={styles.prodName}>{prod.name}</strong>
                  <p className={styles.prodDesc}>{prod.description}</p>
                  <div className={styles.prodMetaRow}>
                    <span className={styles.prodPrice}>₹{prod.price}</span>
                    {prod.discountPrice && <span className={styles.strikePrice}>₹{prod.discountPrice}</span>}
                    <span className={styles.ratingBadge}>★ {prod.rating} ({prod.reviewsCount})</span>
                  </div>
                  <div className={styles.prodCardActions}>
                    <button type="button" className={styles.editBtn} onClick={() => openProductModal(prod)}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button type="button" className={styles.deleteBtn} onClick={() => handleDeleteProduct(prod.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: CATEGORIES MANAGEMENT                                        */}
      {/* =================================================================== */}
      {activeTab === 'categories' && (
        <div className={styles.tabContent}>
          <div className={styles.categoriesGrid}>
            {categories.map(cat => (
              <div key={cat.id} className={styles.categoryCard}>
                <div className={styles.catIconWrap}>
                  <Gift size={24} />
                </div>
                <div className={styles.catInfo}>
                  <strong>{cat.name}</strong>
                  <span>Slug: {cat.slug}</span>
                  <span className={styles.prodCount}>{cat.productsCount || 0} Products</span>
                </div>
                <div className={styles.catActions}>
                  <button
                    type="button"
                    className={styles.catEditBtn}
                    title="Edit Category"
                    onClick={() => {
                      setEditingCategory(cat)
                      setCategoryForm({
                        name: cat.name,
                        description: cat.description || '',
                        iconName: cat.iconName || 'Gift',
                        displayOrder: cat.displayOrder,
                        isActive: cat.isActive
                      })
                      setCategoryModalOpen(true)
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.catDeleteBtn}
                    title="Delete Category"
                    onClick={() => handleDeleteCategory(cat)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: GREETING CARDS MANAGEMENT                                   */}
      {/* =================================================================== */}
      {activeTab === 'cards' && (
        <div className={styles.tabContent}>
          <div className={styles.cardsGrid}>
            {cards.map(card => (
              <div key={card.id} className={styles.cardItem}>
                <img src={card.previewUrl} alt={card.name} className={styles.cardPreviewImg} />
                <div className={styles.cardItemBody}>
                  <strong>{card.name}</strong>
                  <span className={styles.themeTag}>Theme: {card.theme}</span>
                  <span className={styles.validityText}>Validity: {card.validityDays} Days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 6: LOCATIONS & CONFIGURATION                                    */}
      {/* =================================================================== */}
      {activeTab === 'locations' && (
        <div className={styles.tabContent}>
          {/* Global Config Editor */}
          {config && (
            <div className={styles.configCard}>
              <h2 className={styles.sectionHeading}>Global Gift Delivery Rules & Pricing</h2>
              <form onSubmit={handleSaveConfig} className={styles.configFormGrid}>
                <div className={styles.formGroup}>
                  <label>Packaging Charge (₹)</label>
                  <input
                    type="number"
                    value={config.packagingCharge || 20}
                    onChange={e => setConfig(prev => ({ ...prev, packagingCharge: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Free Delivery Threshold (₹)</label>
                  <input
                    type="number"
                    value={config.freeDeliveryThreshold || 1500}
                    onChange={e => setConfig(prev => ({ ...prev, freeDeliveryThreshold: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Same-Day Cutoff Time</label>
                  <input
                    type="text"
                    value={config.sameDayCutoffTime || '06:00 PM'}
                    onChange={e => setConfig(prev => ({ ...prev, sameDayCutoffTime: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Handwritten Card Price (₹)</label>
                  <input
                    type="number"
                    value={config.handwrittenCardPrice || 79}
                    onChange={e => setConfig(prev => ({ ...prev, handwrittenCardPrice: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Anonymous Sender Price (₹)</label>
                  <input
                    type="number"
                    value={config.anonymousSenderPrice || 49}
                    onChange={e => setConfig(prev => ({ ...prev, anonymousSenderPrice: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Luxury Setup Experience (₹)</label>
                  <input
                    type="number"
                    value={config.luxurySetupPrice || 299}
                    onChange={e => setConfig(prev => ({ ...prev, luxurySetupPrice: e.target.value }))}
                  />
                </div>
                <button type="submit" className={styles.primaryBtn} style={{ gridColumn: '1 / -1', alignSelf: 'flex-start' }}>
                  Save Global Configuration
                </button>
              </form>
            </div>
          )}

          {/* Active Delivery Locations Zones */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
              <h2 className={styles.sectionHeading}>Delivery Zones & Cities</h2>
              <button type="button" className={styles.primaryBtn} onClick={() => setLocationModalOpen(true)}>
                <Plus size={16} /> Add Zone
              </button>
            </div>

            <div className={styles.locationsGrid}>
              {locations.map(loc => (
                <div key={loc.id} className={styles.locationCard}>
                  <div className={styles.locHeader}>
                    <strong>{loc.name}</strong>
                    <span className={styles.cityState}>{loc.city}, {loc.state}</span>
                  </div>
                  <p className={styles.pincodesList}><strong>Pincodes:</strong> {loc.postalCodes}</p>
                  <div className={styles.locCharges}>
                    <span>Base Charge: ₹{loc.baseDeliveryCharge}</span>
                    <span>Min Order: ₹{loc.minOrderAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ORDER DETAILS DRAWER                                         */}
      {/* =================================================================== */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Order #{selectedOrder.bookingNumber}</h2>
                <span className={styles.orderDateMeta}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Status Selector */}
              <div className={styles.drawerStatusBox}>
                <label>Change Order Status:</label>
                <select
                  value={selectedOrder.status}
                  onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  className={styles.statusDrawerSelect}
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING_GIFT">PREPARING GIFT</option>
                  <option value="GIFT_PACKED">GIFT PACKED</option>
                  <option value="ON_THE_WAY">ON THE WAY</option>
                  <option value="ARRIVED">ARRIVED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Gift Item Summary */}
              <div className={styles.drawerSection}>
                <h3>Gift Details</h3>
                <div className={styles.drawerGiftRow}>
                  {selectedOrder.productImage && (
                    <img src={selectedOrder.productImage} alt="" className={styles.drawerGiftImg} />
                  )}
                  <div>
                    <strong>{selectedOrder.productName}</strong>
                    <span>Qty: {selectedOrder.productQuantity} • Category: {selectedOrder.categoryName}</span>
                    <span>Weight: {selectedOrder.productWeight || '1 kg'} • Serves: {selectedOrder.productServes || '6 - 8'}</span>
                  </div>
                </div>
              </div>

              {/* Recipient & Customer */}
              <div className={styles.drawerSection}>
                <h3>Recipient & Delivery Address</h3>
                <p><strong>Recipient:</strong> {selectedOrder.recipientName} ({selectedOrder.recipientPhone})</p>
                <p><strong>Address:</strong> {selectedOrder.deliveryAddress}, {selectedOrder.deliveryCity} - {selectedOrder.deliveryPostalCode}</p>
                {selectedOrder.deliveryLandmark && <p><strong>Landmark:</strong> {selectedOrder.deliveryLandmark}</p>}
                {selectedOrder.deliveryInstructions && <p><strong>Instructions:</strong> {selectedOrder.deliveryInstructions}</p>}
                {selectedOrder.giftMessage && (
                  <div className={styles.drawerGiftMsg}>
                    <strong>Card Message:</strong>
                    <em>"{selectedOrder.giftMessage}"</em>
                  </div>
                )}
              </div>

              {/* Bill Breakdown */}
              <div className={styles.drawerSection}>
                <h3>Itemized Fare Breakdown</h3>
                <div className={styles.billLine}><span>Item Total:</span><span>₹{selectedOrder.itemTotal}</span></div>
                <div className={styles.billLine}><span>Delivery Charge:</span><span>₹{selectedOrder.deliveryCharge}</span></div>
                <div className={styles.billLine}><span>Packaging:</span><span>₹{selectedOrder.packagingCharge}</span></div>
                {selectedOrder.addonsTotal > 0 && <div className={styles.billLine}><span>Add-ons:</span><span>₹{selectedOrder.addonsTotal}</span></div>}
                {selectedOrder.discountAmount > 0 && <div className={styles.billLine} style={{ color: '#10B981' }}><span>Discount:</span><span>-₹{selectedOrder.discountAmount}</span></div>}
                <div className={styles.billLine}><span>Taxes (GST 18%):</span><span>₹{selectedOrder.taxAmount}</span></div>
                <div className={`${styles.billLine} ${styles.billTotalLine}`}>
                  <strong>Total Amount:</strong>
                  <strong>₹{selectedOrder.totalAmount} ({selectedOrder.paymentMethod} • {selectedOrder.paymentStatus})</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT                                          */}
      {/* =================================================================== */}
      {productModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setProductModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct ? 'Edit Gift Product' : 'Add New Gift Product'}</h2>
              <button type="button" onClick={() => setProductModalOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveProduct} className={styles.modalForm}>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    required
                    value={productForm.categoryId}
                    onChange={e => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow3}>
                <div className={styles.formGroup}>
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Discount Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.discountPrice}
                    onChange={e => setProductForm(prev => ({ ...prev, discountPrice: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Badge / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller"
                    value={productForm.badge}
                    onChange={e => setProductForm(prev => ({ ...prev, badge: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Weight / Size</label>
                  <input
                    type="text"
                    value={productForm.weight}
                    onChange={e => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Serves</label>
                  <input
                    type="text"
                    value={productForm.serves}
                    onChange={e => setProductForm(prev => ({ ...prev, serves: e.target.value }))}
                  />
                </div>
              </div>

              {/* Image Upload Box */}
              <div className={styles.formGroup}>
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      setProductImageFile(e.target.files[0])
                      setProductImagePreview(URL.createObjectURL(e.target.files[0]))
                    }
                  }}
                />
                {productImagePreview && (
                  <img src={productImagePreview} alt="Preview" className={styles.imageThumbPreview} />
                )}
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setProductModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD CATEGORY                                                */}
      {/* =================================================================== */}
      {categoryModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setCategoryModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
              <button type="button" onClick={() => setCategoryModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveCategory} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Category Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setCategoryImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setCategoryModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD LOCATION ZONE                                            */}
      {/* =================================================================== */}
      {locationModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setLocationModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Delivery Location Zone</h2>
              <button type="button" onClick={() => setLocationModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveLocation} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Delhi Zone"
                  value={locationForm.name}
                  onChange={e => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    value={locationForm.city}
                    onChange={e => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State *</label>
                  <input
                    type="text"
                    required
                    value={locationForm.state}
                    onChange={e => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Postal Codes (Comma-separated) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="110001, 110002, 110003"
                  value={locationForm.postalCodes}
                  onChange={e => setLocationForm(prev => ({ ...prev, postalCodes: e.target.value }))}
                />
              </div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Base Delivery Charge (₹)</label>
                  <input
                    type="number"
                    value={locationForm.baseDeliveryCharge}
                    onChange={e => setLocationForm(prev => ({ ...prev, baseDeliveryCharge: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={locationForm.minOrderAmount}
                    onChange={e => setLocationForm(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setLocationModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save Zone</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
