import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const amcs = await prisma.amc.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(amcs);
  } catch (error) {
    console.error('Failed to fetch AMCs:', error);
    return NextResponse.json({ error: 'Failed to fetch AMCs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    let totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : 0;
    if (totalAmount === 0 && data.plan) {
      const name = data.plan.toLowerCase();
      if (name.includes("premium 2-year") || name.includes("premium 2y")) totalAmount = 4000;
      else if (name.includes("premium 1-year") || name.includes("premium 1y")) totalAmount = 2500;
      else if (name.includes("standard 2-year") || name.includes("standard 2y")) totalAmount = 3000;
      else if (name.includes("basic 2-year") || name.includes("basic 2y")) totalAmount = 2000;
      else if (name.includes("basic 1-year") || name.includes("basic 1y")) totalAmount = 1500;
      else {
        const match = data.plan.match(/₹\s*([\d,]+)/);
        if (match) {
          totalAmount = parseInt(match[1].replace(/,/g, ''), 10);
        } else {
          totalAmount = 1500;
        }
      }
    }

    const amountPaid = data.amountPaid !== undefined ? Number(data.amountPaid) : (data.payment === "Paid" ? totalAmount : 0);
    const balanceDue = data.balanceDue !== undefined ? Number(data.balanceDue) : (totalAmount - amountPaid);
    const payment = balanceDue <= 0 ? 'Paid' : 'Pending';

    const amc = await prisma.amc.create({
      data: {
        id: data.id, // optionally manually provided, e.g. AMC-5091
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        address: data.address,
        plan: data.plan,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'Active',
        payment: payment,
        totalAmount: totalAmount,
        amountPaid: amountPaid,
        balanceDue: balanceDue,
      },
    });
    return NextResponse.json(amc, { status: 201 });
  } catch (error) {
    console.error('Failed to create AMC:', error);
    return NextResponse.json({ error: 'Failed to create AMC' }, { status: 500 });
  }
}
