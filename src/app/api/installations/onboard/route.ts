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
      servicesCount, 
      expiryDate 
    } = body;

    if (!name || !phone || !address || !model) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Handle Customer (Create or Update)
    let customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (customer) {
      customer = await prisma.customer.update({
        where: { phone },
        data: {
          name, // Update name in case it changed
          address,
          altPhone: altPhone || customer.altPhone,
        }
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          name,
          phone,
          address,
          altPhone: altPhone || null,
        }
      });
    }

    // 2. Create the Installation record linked to this customer
    const installation = await prisma.installation.create({
      data: {
        customerName: customer.name,
        customerPhone: customer.phone,
        address: customer.address,
        model,
        equipments: equipments || null,
        servicesCount: servicesCount || 2,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        roPrice: Number(roPrice) || 0,
        equipmentPrice: Number(equipmentPrice) || 0,
        amcPrice: Number(amcPrice) || 0,
        totalPrice: Number(totalPrice) || 0,
        amountPaid: Number(totalPrice) || 0, // Assuming full payment collected on install for now
        amountDue: 0,
        date: new Date(), // Set installation logged date to now
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed', // Since this is added post-installation by the tech on-site
      }
    });

    // 3. Auto-generate AMC record if AMC plan was selected
    let amcRecord = null;
    if (amcPlan && expiryDate) {
      amcRecord = await prisma.amc.create({
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

    return NextResponse.json({ success: true, customer, installation, amc: amcRecord });
  } catch (error) {
    console.error('Error onboarding new RO customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
