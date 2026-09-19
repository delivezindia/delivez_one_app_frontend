const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/pages/dashboard/components/AdminUnifiedOrdersView.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add Luggage to imports
if (!code.includes('Luggage,')) {
  code = code.replace(
    `  Package,\n  Truck,`,
    `  Package,\n  Luggage,\n  Truck,`
  );
  console.log('1. Added Luggage to imports in AdminUnifiedOrdersView.jsx');
}

// 2. Update SERVICE_CONFIG
const oldConfig = `const SERVICE_CONFIG = {
  'gift-delivery': { label: 'Gift & Surprise', icon: Gift, color: '#EF4444', bg: '#FEF2F2' },
  'personal-courier': { label: 'Personal Courier', icon: Truck, color: '#2563EB', bg: '#EFF6FF' },
  'confidential-courier': { label: 'Confidential / Luggage', icon: ShieldCheck, color: '#D97706', bg: '#FEF3C7' },
  'forgot-something': { label: 'Forgot Something', icon: ShoppingBag, color: '#7C3AED', bg: '#F5F3FF' },
  'return-pickup': { label: 'Return Pickup', icon: RotateCcw, color: '#059669', bg: '#ECFDF5' },
}`;

const newConfig = `const SERVICE_CONFIG = {
  'gift-delivery': { label: 'Gift & Surprise', icon: Gift, color: '#EF4444', bg: '#FEF2F2' },
  'personal-courier': { label: 'Personal Courier', icon: Truck, color: '#2563EB', bg: '#EFF6FF' },
  'luggage-delivery': { label: 'Luggage Delivery', icon: Luggage, color: '#D97706', bg: '#FEF3C7' },
  'airport-luggage': { label: 'Luggage Delivery', icon: Luggage, color: '#D97706', bg: '#FEF3C7' },
  'confidential-courier': { label: 'Delivez Vault (Confidential)', icon: ShieldCheck, color: '#DC2626', bg: '#FEE2E2' },
  'confidential-delivery': { label: 'Delivez Vault (Confidential)', icon: ShieldCheck, color: '#DC2626', bg: '#FEE2E2' },
  'forgot-something': { label: 'Forgot Something', icon: ShoppingBag, color: '#7C3AED', bg: '#F5F3FF' },
  'return-pickup': { label: 'Return Pickup', icon: RotateCcw, color: '#059669', bg: '#ECFDF5' },
}`;

if (code.includes(oldConfig)) {
  code = code.replace(oldConfig, newConfig);
  console.log('2. Updated SERVICE_CONFIG in AdminUnifiedOrdersView.jsx');
}

// 3. Update dropdown options
const oldDropdown = `        <select
          value={filters.serviceType}
          onChange={e => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
          className={styles.selectFilter}
        >
          <option value="ALL">All Service Categories</option>
          <option value="GIFT">Gift & Surprise Delivery</option>
          <option value="COURIER">Personal Courier</option>
          <option value="CONFIDENTIAL">Confidential & Airport Luggage</option>
          <option value="FORGOT">Forgot Something Retrieval</option>
          <option value="RETURN">Return & Exchange Pickup</option>
        </select>`;

const newDropdown = `        <select
          value={filters.serviceType}
          onChange={e => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
          className={styles.selectFilter}
        >
          <option value="ALL">All Service Categories</option>
          <option value="LUGGAGE">Luggage Delivery (Airport/Hotel)</option>
          <option value="CONFIDENTIAL">Delivez Vault (Confidential)</option>
          <option value="COURIER">Personal Courier</option>
          <option value="GIFT">Gift & Surprise Delivery</option>
          <option value="FORGOT">Forgot Something Retrieval</option>
          <option value="RETURN">Return & Exchange Pickup</option>
        </select>`;

if (code.includes(oldDropdown)) {
  code = code.replace(oldDropdown, newDropdown);
  console.log('3. Updated service dropdown in AdminUnifiedOrdersView.jsx');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved AdminUnifiedOrdersView.jsx successfully.');
