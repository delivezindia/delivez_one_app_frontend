const fs = require('fs');

const reviewText = `- **Order Review & Pre-Booking Fare Quote** (\`POST {{baseUrl}}/confidential-delivery/order-review\`): Pre-booking review and tariff calculation across all 9 Vault service types.
- **Submit Order Review & Rating** (\`POST {{baseUrl}}/confidential-delivery/bookings/{{bookingId}}/review\`): Customer star rating (1-5) and feedback review.
- **Get Order Review & Rating** (\`GET {{baseUrl}}/confidential-delivery/bookings/{{bookingId}}/review\`): Fetch submitted rating, feedback comment, and review timestamp.`;

const paths = [
  '../README_POSTMAN.md',
  'postman/README_POSTMAN.md',
  'C:/Users/Rax/Desktop/Postman_Confidential_Delivery/README_POSTMAN.md'
];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes('Submit Order Review & Rating')) {
      content = content.replace(
        '- **Cancel Vault Booking** (`POST {{baseUrl}}/confidential-delivery/bookings/{{bookingId}}/cancel`)',
        '- **Cancel Vault Booking** (`POST {{baseUrl}}/confidential-delivery/bookings/{{bookingId}}/cancel`)\n' + reviewText
      );
      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated', p);
    }
  }
});
