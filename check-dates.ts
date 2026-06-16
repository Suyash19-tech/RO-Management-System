import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: {
      installations: { orderBy: { date: 'desc' } },
      amcs: { orderBy: { endDate: 'desc' } }
    }
  });

  const now = new Date();
  const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

  console.log(`Total Customers: ${customers.length}`);
  
  customers.forEach(customer => {
    if (customer.installations.length === 0) {
      console.log(`Customer ${customer.name} has no installations.`);
      return;
    }
    const primaryInstall = customer.installations[0];
    const timeSinceInstall = now.getTime() - primaryInstall.date.getTime();
    const daysSinceInstall = Math.floor(timeSinceInstall / (1000 * 60 * 60 * 24));
    
    const hasActiveAmc = customer.amcs.some(amc => amc.endDate > now && amc.status === 'Active');
    
    console.log(`Customer: ${customer.name} | Days Since Install: ${daysSinceInstall} | Has Active AMC: ${hasActiveAmc}`);
    
    if (timeSinceInstall > oneYearInMs && !hasActiveAmc) {
      console.log(`  -> QUALIFIES FOR 'NO AMC'`);
    } else {
      console.log(`  -> DOES NOT QUALIFY`);
    }
  });
}

main().then(() => prisma.$disconnect());
