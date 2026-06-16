import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.amc.deleteMany({
    where: { customerPhone: { in: ['9999999991', '9999999992'] } }
  });
  
  await prisma.installation.deleteMany({
    where: { customerPhone: { in: ['9999999991', '9999999992'] } }
  });
  
  await prisma.customerNotification.deleteMany({
    where: { phone: { in: ['9999999991', '9999999992'] } }
  });
  
  await prisma.customer.deleteMany({
    where: { phone: { in: ['9999999991', '9999999992'] } }
  });

  console.log('Fake customers deleted.');
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
