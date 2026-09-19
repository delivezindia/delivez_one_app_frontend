const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/features/admin-management/services/adminManagementService.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add Luggage Admin Methods right before fetchAdminConfidentialBookings
const luggageMethods = `export async function fetchAdminLuggageBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v) })
  try {
    const res = await apiRequest(\`/admin/luggage/bookings?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminLuggageBookingById(id, { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/luggage/bookings/\${encodeURIComponent(id)}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminLuggageStatus(id, status, metadata = {}) {
  const accessToken = requireAdminToken()
  const payload = buildStatusTimingPayload(status, metadata)
  try {
    const res = await apiRequest(\`/admin/luggage/bookings/\${id}/status\`, {
      method: 'PATCH',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

`;

if (!code.includes('fetchAdminLuggageBookings')) {
  code = code.replace(
    'export async function fetchAdminConfidentialBookings(',
    luggageMethods + 'export async function fetchAdminConfidentialBookings('
  );
  console.log('1. Added fetchAdminLuggageBookings, fetchAdminLuggageBookingById, updateAdminLuggageStatus.');
}

// 2. Update fetchAdminOrderFullDetails to query luggage correctly
const oldCourierBranch = `    } else if (
      sKey === 'personal-courier' ||
      sKey === 'courier-delivery' ||
      sKey === 'luggage-delivery' ||
      sKey === 'airport-luggage'
    ) {
      const res = await apiRequest(\`/admin/courier/bookings/\${encodeURIComponent(orderId)}\`, {
        headers: { Authorization: \`Bearer \${accessToken}\` },
        signal,
      })
      if (res?.data?.booking) {
        detailedData = {
          ...res.data.booking,
          serviceKey: sKey.includes('luggage') ? 'luggage-delivery' : 'personal-courier',
          serviceName: sKey.includes('luggage') ? 'Luggage Delivery' : 'Personal Courier',
        }
      }
    }`;

const newCourierBranch = `    } else if (
      sKey === 'luggage-delivery' ||
      sKey === 'airport-luggage' ||
      sKey === 'luggage' ||
      String(orderId).startsWith('DLVZ')
    ) {
      const res = await apiRequest(\`/admin/luggage/bookings/\${encodeURIComponent(orderId)}\`, {
        headers: { Authorization: \`Bearer \${accessToken}\` },
        signal,
      })
      if (res?.data?.booking) {
        detailedData = {
          ...res.data.booking,
          serviceKey: 'luggage-delivery',
          serviceName: 'Luggage Delivery',
        }
      }
    } else if (
      sKey === 'personal-courier' ||
      sKey === 'courier-delivery' ||
      sKey === 'courier'
    ) {
      const res = await apiRequest(\`/admin/courier/bookings/\${encodeURIComponent(orderId)}\`, {
        headers: { Authorization: \`Bearer \${accessToken}\` },
        signal,
      })
      if (res?.data?.booking) {
        detailedData = {
          ...res.data.booking,
          serviceKey: 'personal-courier',
          serviceName: 'Personal Courier',
        }
      }
    }`;

if (code.includes(oldCourierBranch)) {
  code = code.replace(oldCourierBranch, newCourierBranch);
  console.log('2. Updated fetchAdminOrderFullDetails for luggage & courier.');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved adminManagementService.js successfully.');
