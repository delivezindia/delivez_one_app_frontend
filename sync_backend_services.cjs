const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('C:/Users/Rax/Desktop/Delivery_app_site_backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

const servicesToSync = [
  {
    slug: 'courier-delivery',
    name: 'Courier',
    shortDescription: 'Send documents & parcels anywhere in India.',
    description: 'Local to Pan India',
    displayOrder: 1,
    imageFile: 'service_courier.jpg',
  },
  {
    slug: 'confidential-delivery',
    name: 'Confidential Delivery',
    shortDescription: 'For sensitive documents and high-value items.',
    description: 'Secure & private',
    displayOrder: 2,
    imageFile: 'service_confidential.jpg',
  },
  {
    slug: 'return-pickup',
    name: 'Return Pickup',
    shortDescription: 'Schedule a pickup for your online returns.',
    description: 'Easy returns',
    displayOrder: 3,
    imageFile: 'service_return.jpg',
  },
  {
    slug: 'forgot-something',
    name: 'Forgot Something?',
    shortDescription: 'We pick up and deliver what you forgot.',
    description: 'Instant retrieval',
    displayOrder: 4,
    imageFile: 'service_forgot.jpg',
  },
  {
    slug: 'luggage-delivery',
    name: 'Airport Luggage',
    shortDescription: 'Luggage pickup & delivery to/from airport.',
    description: 'Door-to-airport convenience',
    displayOrder: 5,
    imageFile: 'service_airport.jpg',
  },
  {
    slug: 'know-more',
    name: 'Special Delivery',
    shortDescription: 'For unique and special requirements.',
    description: 'Custom delivery solutions',
    displayOrder: 6,
    imageFile: 'service_special.jpg',
  },
];

async function main() {
  console.log('Starting services database sync...');
  for (const s of servicesToSync) {
    const imgPath = path.join(__dirname, 'public', 'assets', 'images', s.imageFile);
    let imgBuffer = null;
    if (fs.existsSync(imgPath)) {
      imgBuffer = fs.readFileSync(imgPath);
    }

    const updated = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        shortDescription: s.shortDescription,
        description: s.description,
        displayOrder: s.displayOrder,
        isActive: true,
        imageData: imgBuffer,
        imageMimeType: imgBuffer ? 'image/jpeg' : null,
        imageFileName: imgBuffer ? s.imageFile : null,
      },
      create: {
        slug: s.slug,
        name: s.name,
        shortDescription: s.shortDescription,
        description: s.description,
        displayOrder: s.displayOrder,
        isActive: true,
        imageData: imgBuffer,
        imageMimeType: imgBuffer ? 'image/jpeg' : null,
        imageFileName: imgBuffer ? s.imageFile : null,
      },
    });

    console.log(`Synced: [${updated.displayOrder}] ${updated.slug} -> ${updated.name} (hasImage: ${Boolean(updated.imageMimeType)})`);
  }

  // Set more-services to displayOrder 99
  await prisma.service.updateMany({
    where: { slug: 'more-services' },
    data: { displayOrder: 99 },
  });

  console.log('Services sync complete!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error syncing services:', err);
  process.exit(1);
});
