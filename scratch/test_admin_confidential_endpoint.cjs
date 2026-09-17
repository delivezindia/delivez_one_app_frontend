const http = require('http');
const { PrismaClient } = require('c:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/@prisma/client');
const jwt = require('c:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/jsonwebtoken');

const prisma = new PrismaClient();

async function testEndpoint() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  const confidentialBooking = await prisma.confidentialCourierBooking.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!admin || !confidentialBooking) {
    console.log('Admin or booking not found.');
    await prisma.$disconnect();
    return;
  }

  const token = jwt.sign(
    { sub: admin.id, userId: admin.id, role: admin.role },
    process.env.JWT_SECRET || 'delivez_backend_jwt_secret_dev_key_2026',
    { expiresIn: '1h' }
  );

  const req = http.request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/v1/admin/confidential/bookings/${confidentialBooking.id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        console.log('Status code:', res.statusCode);
        console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
      });
    }
  );

  req.on('error', (err) => console.error('Req error:', err));
  req.end();

  await prisma.$disconnect();
}

testEndpoint();
