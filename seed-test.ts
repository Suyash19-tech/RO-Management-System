import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  
  // Test Customer 1: Installed 60 days back, no AMC. (Should appear in Free Service Reminders)
  const c1 = await prisma.customer.create({
    data: {
      name: 'Test FreeService Due',
      phone: '9876543210',
      address: '123 Fake Street, Delhi',
      installations: {
        create: [{
          customerName: 'Test FreeService Due',
          address: '123 Fake Street, Delhi',
          model: 'Aquaguard X1',
          date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          time: '10:00 AM',
          status: 'Completed'
        }]
      }
    }
  });

  // Test Customer 2: Installed 400 days back, AMC ended 10 days back. (Should appear in No AMC filter since they have >1yr install and NO ACTIVE AMC)
  const c2 = await prisma.customer.create({
    data: {
      name: 'Test No AMC User',
      phone: '9876543211',
      address: '456 Fake Street, Delhi',
      installations: {
        create: [{
          customerName: 'Test No AMC User',
          address: '456 Fake Street, Delhi',
          model: 'Kent Grand Plus',
          date: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000), // 400 days ago
          time: '11:00 AM',
          status: 'Completed'
        }]
      },
      amcs: {
        create: [{
          customerName: 'Test No AMC User',
          address: '456 Fake Street, Delhi',
          plan: 'Basic 1-Year AMC',
          startDate: new Date(now.getTime() - 375 * 24 * 60 * 60 * 1000), // Started 1 year ago (approx)
          endDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // Ended 10 days ago
          status: 'Expired',
          totalAmount: 1500,
          amountPaid: 1500,
          balanceDue: 0
        }]
      }
    }
  });

  console.log('Seeded test customers!');
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
