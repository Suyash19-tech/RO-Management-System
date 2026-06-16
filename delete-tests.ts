import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.customer.deleteMany({
    where: {
      name: {
        in: ['Test FreeService Due', 'Test No AMC User', 'Test Customer AMC']
      }
    }
  });

  console.log('Deleted test customers!');
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
