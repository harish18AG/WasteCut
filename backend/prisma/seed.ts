import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing database records
  await prisma.report.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.pickup.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.donation.deleteMany({});
  await prisma.ngoProfile.deleteMany({});
  await prisma.donorProfile.deleteMany({});
  await prisma.recipientProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned old database records.');

  // 2. Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@wastecut.org',
      passwordHash,
      name: 'Harish (Admin)',
      phone: '9150478209',
      role: 'ADMIN',
    },
  });

  // 4. Create Donor Users
  const donor1User = await prisma.user.create({
    data: {
      email: 'massgaming077@gmail.com',
      passwordHash,
      name: 'Haarish (Donor)',
      phone: '8825878943',
      role: 'DONOR',
    },
  });
  const donor1 = await prisma.donorProfile.create({
    data: {
      userId: donor1User.id,
      donorType: 'RESTAURANT',
      address: 'Veeramamnunivar Street, Manavalanagar, Tiruvallur, Tamil Nadu, 602001',
      latitude: 13.106374,
      longitude: 79.912048,
    },
  });

  const donor2User = await prisma.user.create({
    data: {
      email: 'bakery@sweet.com',
      passwordHash,
      name: 'Golden Grain Bakery',
      phone: '+15550222',
      role: 'DONOR',
    },
  });
  const donor2 = await prisma.donorProfile.create({
    data: {
      userId: donor2User.id,
      donorType: 'BAKERY',
      address: 'Rajaji Salai, Tiruvallur, Tamil Nadu, 602001',
      latitude: 13.116500,
      longitude: 79.920000,
    },
  });

  // 5. Create NGO Users
  const ngoUser = await prisma.user.create({
    data: {
      email: 'harish123@gmail.com',
      passwordHash,
      name: 'Harish (NGO)',
      phone: '9150478209',
      role: 'NGO',
    },
  });
  const ngo = await prisma.ngoProfile.create({
    data: {
      userId: ngoUser.id,
      registrationId: 'REG-NGO-998877',
      address: 'Jawaharlal Nehru Road, Tiruvallur, Tamil Nadu, 602001',
      latitude: 13.108000,
      longitude: 79.915000,
    },
  });

  // 6. Create Recipient Users
  const recipientUser = await prisma.user.create({
    data: {
      email: 'harish@gmail.com',
      passwordHash,
      name: 'Harish (Recipient)',
      phone: '9150478209',
      role: 'RECIPIENT',
    },
  });
  const recipient = await prisma.recipientProfile.create({
    data: {
      userId: recipientUser.id,
      address: 'Kanchipuram High Road, Tiruvallur, Tamil Nadu, 602001',
      latitude: 13.110000,
      longitude: 79.918000,
    },
  });

  console.log('👤 Created users and role profiles.');

  console.log('🎉 Seeding successfully completed! Database is in a clean starting state.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
