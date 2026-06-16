import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const notification = await prisma.customerNotification.create({
    data: {
      phone: "9876543210",
      type: "AMC",
      title: "Test Title",
      message: "Test Message"
    }
  });

  console.log('Created!', notification);
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
