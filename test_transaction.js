require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== START VERIFICATION ===");

  // 1. Ensure we have products with stock
  let testMachine = await prisma.product.findFirst({
    where: { category: { contains: 'RO' } }
  });

  if (!testMachine) {
    console.log("No RO product found. Creating one...");
    testMachine = await prisma.product.create({
      data: {
        name: 'Test Verify RO Machine',
        sku: 'TEST-RO-01',
        category: 'Domestic RO',
        price: 15000,
        purchasePrice: 9000,
        stock: 5,
        status: 'Active'
      }
    });
  } else {
    // Reset stock to 5 for predictable test
    testMachine = await prisma.product.update({
      where: { id: testMachine.id },
      data: { stock: 5 }
    });
  }

  let testFilter = await prisma.product.findFirst({
    where: { category: 'Filters' }
  });

  if (!testFilter) {
    console.log("No Filters product found. Creating one...");
    testFilter = await prisma.product.create({
      data: {
        name: 'Test Carbon Filter',
        sku: 'TEST-FIL-02',
        category: 'Filters',
        price: 500,
        purchasePrice: 200,
        stock: 10,
        status: 'Active'
      }
    });
  } else {
    testFilter = await prisma.product.update({
      where: { id: testFilter.id },
      data: { stock: 10 }
    });
  }

  console.log(`Initial RO Machine stock: ${testMachine.name} = ${testMachine.stock}`);
  console.log(`Initial Filter stock: ${testFilter.name} = ${testFilter.stock}`);

  // 2. Simulate Onboarding (Installment)
  console.log("\n--- Simulating Onboarding (Installment) ---");
  const onboardData = {
    name: "John Verification Doe",
    phone: "+91 99999 88888",
    address: "123 Verification Lane",
    model: testMachine.name,
    equipments: testFilter.name,
    totalPrice: 15500,
    servicesCount: 2,
  };

  // Call the onboard transaction logic (mocked logic identical to route.ts)
  const result = await prisma.$transaction(async (tx) => {
    // Find or create customer
    let customer = await tx.customer.findUnique({
      where: { phone: onboardData.phone }
    });
    if (!customer) {
      customer = await tx.customer.create({
        data: {
          name: onboardData.name,
          phone: onboardData.phone,
          address: onboardData.address,
        }
      });
    }

    // Create installation
    const installation = await tx.installation.create({
      data: {
        customerName: customer.name,
        customerPhone: customer.phone,
        address: customer.address,
        model: onboardData.model,
        equipments: onboardData.equipments,
        totalPrice: onboardData.totalPrice,
        date: new Date(),
        time: "12:00 PM",
        status: "Completed"
      }
    });

    // Decrement stock for model
    if (onboardData.model) {
      const roProduct = await tx.product.findFirst({
        where: { name: onboardData.model, category: { not: 'AMC Plan' } }
      });
      if (roProduct) {
        await tx.product.update({
          where: { id: roProduct.id },
          data: { stock: Math.max(0, roProduct.stock - 1) }
        });
      }
    }

    // Decrement stock for equipments
    if (onboardData.equipments) {
      const eqNames = onboardData.equipments.split(',').map(e => e.trim()).filter(Boolean);
      for (const eqName of eqNames) {
        const eqProduct = await tx.product.findFirst({
          where: { name: eqName, category: { not: 'AMC Plan' } }
        });
        if (eqProduct) {
          await tx.product.update({
            where: { id: eqProduct.id },
            data: { stock: Math.max(0, eqProduct.stock - 1) }
          });
        }
      }
    }

    return { customer, installation };
  });

  // Verify stock after onboarding
  const updatedMachineOnboard = await prisma.product.findUnique({ where: { id: testMachine.id } });
  const updatedFilterOnboard = await prisma.product.findUnique({ where: { id: testFilter.id } });

  console.log(`RO Machine stock after Onboard: ${updatedMachineOnboard.stock} (Expected: 4)`);
  console.log(`Filter stock after Onboard: ${updatedFilterOnboard.stock} (Expected: 9)`);

  if (updatedMachineOnboard.stock !== 4 || updatedFilterOnboard.stock !== 9) {
    console.error("FAIL: Onboard stock decrement failed!");
  } else {
    console.log("SUCCESS: Onboard stock decrement passed!");
  }

  // 3. Simulate Appointment Completion
  console.log("\n--- Simulating Appointment Completion (Service Repair) ---");
  // Create a scheduled appointment first
  const appointment = await prisma.appointment.create({
    data: {
      customerName: result.customer.name,
      customerPhone: result.customer.phone,
      address: result.customer.address,
      type: "Repair Service",
      date: new Date(),
      time: "02:00 PM",
      status: "Scheduled",
    }
  });

  const completionData = {
    status: "Completed",
    remarks: "Replaced filter successfully",
    itemsUsed: JSON.stringify([{ name: testFilter.name, qty: 2, cost: testFilter.price }]),
    costCharged: testFilter.price * 2,
    paymentStatus: "Paid",
    completedAt: new Date().toISOString()
  };

  // Run the PUT update logic inside a transaction (identical to API route.ts)
  const updatedApt = await prisma.$transaction(async (tx) => {
    const existing = await tx.appointment.findUnique({ where: { id: appointment.id } });
    if (!existing) throw new Error("Apt not found");

    const updatedApp = await tx.appointment.update({
      where: { id: appointment.id },
      data: {
        status: completionData.status,
        remarks: completionData.remarks,
        itemsUsed: completionData.itemsUsed,
        costCharged: completionData.costCharged,
        paymentStatus: completionData.paymentStatus,
        completedAt: new Date(completionData.completedAt)
      }
    });

    if (existing.status !== 'Completed' && updatedApp.status === 'Completed' && updatedApp.itemsUsed) {
      const items = JSON.parse(updatedApp.itemsUsed);
      if (Array.isArray(items)) {
        for (const item of items) {
          const prod = await tx.product.findFirst({
            where: { name: item.name }
          });
          if (prod && prod.category !== 'AMC Plan') {
            await tx.product.update({
              where: { id: prod.id },
              data: {
                stock: Math.max(0, prod.stock - (Number(item.qty) || 1))
              }
            });
          }
        }
      }
    }
    return updatedApp;
  });

  // Verify stock after appointment completion
  const updatedFilterApt = await prisma.product.findUnique({ where: { id: testFilter.id } });
  console.log(`Filter stock after Appointment Completion: ${updatedFilterApt.stock} (Expected: 7)`);

  if (updatedFilterApt.stock !== 7) {
    console.error("FAIL: Appointment completion stock decrement failed!");
  } else {
    console.log("SUCCESS: Appointment completion stock decrement passed!");
  }

  // Cleanup verify records
  await prisma.appointment.delete({ where: { id: appointment.id } });
  await prisma.installation.delete({ where: { id: result.installation.id } });
  await prisma.customer.delete({ where: { phone: onboardData.phone } });
  
  console.log("\n=== VERIFICATION COMPLETE ===");
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
