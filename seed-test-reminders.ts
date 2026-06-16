import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Test Customer 1: 65 days ago (Free Service Due)
  const date65DaysAgo = new Date();
  date65DaysAgo.setDate(now.getDate() - 65);

  const customer1 = await prisma.customer.create({
    data: {
      name: "Test Customer 60Days",
      phone: "9999999991",
      address: "123 Free Service Lane",
      installations: {
        create: {
          customerName: "Test Customer 60Days",
          address: "123 Free Service Lane",
          model: "Aqua Grand Plus",
          date: date65DaysAgo,
          time: "10:00 AM",
          status: "Completed",
          roPrice: 15000,
          totalPrice: 15000,
          amountPaid: 15000,
          amountDue: 0,
        }
      }
    }
  });

  // Test Customer 2: 400 days ago (AMC Renewal Due)
  const date400DaysAgo = new Date();
  date400DaysAgo.setDate(now.getDate() - 400);

  const customer2 = await prisma.customer.create({
    data: {
      name: "Test Customer AMC",
      phone: "9999999992",
      address: "456 AMC Renewal St",
      installations: {
        create: {
          customerName: "Test Customer AMC",
          address: "456 AMC Renewal St",
          model: "Kent Grand Plus",
          date: date400DaysAgo,
          time: "02:00 PM",
          status: "Completed",
          roPrice: 18000,
          totalPrice: 18000,
          amountPaid: 18000,
          amountDue: 0,
        }
      }
    }
  });

  console.log("Successfully added test customers:", customer1.name, customer2.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
