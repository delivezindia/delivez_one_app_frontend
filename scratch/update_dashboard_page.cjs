const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/pages/dashboard/DashboardPage.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update Lifetime Bookings count
const oldCountCalc = `                      (customerDetails?.giftDeliveryBookings?.length || 0) +
                      (customerDetails?.courierBookings?.length || 0) +
                      (customerDetails?.confidentialCourierBookings?.length || 0) +
                      (customerDetails?.forgotSomethingBookings?.length || 0) +
                      (customerDetails?.returnPickupBookings?.length || 0)`;

const newCountCalc = `                      (customerDetails?.giftDeliveryBookings?.length || 0) +
                      (customerDetails?.courierBookings?.length || 0) +
                      (customerDetails?.luggageDeliveryBookings?.length || 0) +
                      (customerDetails?.confidentialCourierBookings?.length || 0) +
                      (customerDetails?.forgotSomethingBookings?.length || 0) +
                      (customerDetails?.returnPickupBookings?.length || 0)`;

if (code.includes(oldCountCalc)) {
  code = code.replace(oldCountCalc, newCountCalc);
  console.log('1. Updated customer lifetime bookings count.');
}

// 2. Add luggageDeliveryBookings mapping right after courierBookings
const courierMapBlock = `                        {(customerDetails?.courierBookings || []).map(c => (
                          <div
                            key={c.id}
                            className={styles.orderHistoryItem}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedCustomer(null)
                              handleOpenOrderDetail(c, 'personal-courier')
                            }}
                            title="Open Single Order Details"
                          >
                            <div>
                              <strong style={{ color: '#2563EB', display: 'block' }}>Courier: #{c.bookingNumber}</strong>
                              <small>{c.serviceType}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong>₹{c.totalAmount}</strong>
                              <small style={{ display: 'block', color: '#64748B' }}>{c.status}</small>
                            </div>
                          </div>
                        ))}`;

const luggageMapBlock = `

                        {(customerDetails?.luggageDeliveryBookings || []).map(lg => (
                          <div
                            key={lg.id}
                            className={styles.orderHistoryItem}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedCustomer(null)
                              handleOpenOrderDetail(lg, 'luggage-delivery')
                            }}
                            title="Open Single Order Details"
                          >
                            <div>
                              <strong style={{ color: '#D97706', display: 'block' }}>Luggage: #{lg.bookingNumber}</strong>
                              <small>{(lg.serviceId || 'Airport Luggage').replace(/_/g, ' ')}</small>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong>₹{lg.totalAmount}</strong>
                              <small style={{ display: 'block', color: '#64748B' }}>{lg.status}</small>
                            </div>
                          </div>
                        ))}`;

if (code.includes(courierMapBlock) && !code.includes('customerDetails?.luggageDeliveryBookings')) {
  code = code.replace(courierMapBlock, courierMapBlock + luggageMapBlock);
  console.log('2. Added luggage bookings to customer modal in DashboardPage.jsx.');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved DashboardPage.jsx successfully.');
