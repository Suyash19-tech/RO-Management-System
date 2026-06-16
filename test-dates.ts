import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: { installations: true, appointments: true }
  });
  console.log(JSON.stringify(customers.map(c => ({
    name: c.name,
    installs: c.installations.map(i => i.date),
    appts: c.appointments.map(a => a.date)
  })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
