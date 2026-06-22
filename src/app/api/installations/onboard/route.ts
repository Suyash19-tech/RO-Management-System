import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      phone, 
      altPhone, 
      address, 
      model, // Name of the RO Model
      equipments, // Comma separated string of equipment names
      amcPlan, // Name of AMC Plan (optional)
      roPrice,
      equipmentPrice,
      amcPrice,
      totalPrice,
      amountPaid,   // Actual amount paid by customer
      amountDue,    // Balance remaining
      servicesCount, 
      expiryDate 
    } = body;

    if (!name || !phone || !address || !model) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Execute all operations inside a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Handle Customer (Create or Update)
      let customer = await tx.customer.findUnique({
        where: { phone }
      });

      if (customer) {
        customer = await tx.customer.update({
          where: { phone },
          data: {
            name, // Update name in case it changed
            address,
            altPhone: altPhone || customer.altPhone,
          }
        });
      } else {
        customer = await tx.customer.create({
          data: {
            name,
            phone,
            address,
            altPhone: altPhone || null,
          }
        });
      }

      // 2. Create the Installation record linked to this customer
      const installation = await tx.installation.create({
        data: {
          customerName: customer.name,
          customerPhone: customer.phone,
          address: customer.address,
          model,
          equipments: equipments || null,
          servicesCount: servicesCount || 4,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          roPrice: Number(roPrice) || 0,
          equipmentPrice: Number(equipmentPrice) || 0,
          amcPrice: Number(amcPrice) || 0,
          totalPrice: Number(totalPrice) || 0,
          amountPaid: Number(amountPaid) || 0, // Use actual amount paid by customer
          amountDue: Number(amountDue) || 0,   // Use actual balance due
          date: new Date(), // Set installation logged date to now
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: 'Completed', // Since this is added post-installation by the tech on-site
        }
      });

      // 3. Auto-generate AMC record if AMC plan was selected
      let amcRecord = null;
      if (amcPlan && expiryDate) {
        amcRecord = await tx.amc.create({
          data: {
            customerName: customer.name,
            customerPhone: customer.phone,
            address: customer.address,
            plan: amcPlan,
            startDate: new Date(),
            endDate: new Date(expiryDate),
            status: 'Active',
            payment: 'Paid', // Assuming collected during install
          }
        });
      }

      // 4. Decrement Stock for RO Machine (Model)
      if (model) {
        const roProduct = await tx.product.findFirst({
          where: { name: model, category: { not: 'AMC Plan' } }
        });
        if (roProduct) {
          await tx.product.update({
            where: { id: roProduct.id },
            data: { stock: Math.max(0, roProduct.stock - 1) }
          });
        }
      }

      // 5. Decrement Stock for Equipments
      if (equipments) {
        const eqNames = equipments.split(',').map((e: string) => e.trim()).filter(Boolean);
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

      return { customer, installation, amc: amcRecord };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error onboarding new RO customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
