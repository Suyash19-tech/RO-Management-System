require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding database...');
  
  const count = await prisma.customer.count();
  if (count > 0) {
    console.log('Database already seeded!');
    return;
  }

  await prisma.customer.createMany({
    data: [
      { name: 'Rahul Sharma', phone: '+91 98765 43210', address: 'Sector 14, Gurugram, Haryana', status: 'Active' },
      { name: 'Priya Verma', phone: '+91 98765 11111', address: 'Vasant Kunj, New Delhi', status: 'Inactive' },
      { name: 'Vikash Patel', phone: '+91 98765 22222', address: 'DLF Phase 3, Gurugram', status: 'Active' },
      { name: 'Sunil Yadav', phone: '+91 98765 33333', address: 'Rohini Sector 7, Delhi', status: 'Active' },
      { name: 'Amit Kumar', phone: '+91 98765 44444', address: 'Indirapuram, Ghaziabad', status: 'Inactive' },
      { name: 'Neha Singh', phone: '+91 98765 55555', address: 'Noida Sector 62, UP', status: 'Active' },
    ],
  });
  console.log('Customers seeded');

  await prisma.product.createMany({
    data: [
      { name: 'SardarJi Classic RO', sku: 'SRO-CLS-01', category: 'Domestic RO', price: 12500, status: 'Published' },
      { name: 'SardarJi Premium RO', sku: 'SRO-PRM-02', category: 'Domestic RO', price: 16500, status: 'Published' },
      { name: 'Pure Water RO Max', sku: 'PWR-MAX-01', category: 'Commercial RO', price: 24000, status: 'Published' },
    ],
  });
  console.log('Products seeded');

  await prisma.lead.createMany({
    data: [
      { name: 'Kunal Bhatia', phone: '+91 98765 00000', source: 'Website Form', status: 'New', rep: 'Unassigned' },
      { name: 'Pooja Sharma', phone: '+91 98765 11111', source: 'Facebook Ad', status: 'Contacted', rep: 'Ramesh Singh' },
    ],
  });
  console.log('Leads seeded');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
