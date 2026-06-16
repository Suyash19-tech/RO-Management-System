import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Fetch existing AMC contracts
    const amcs = await prisma.amc.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // If filtering by "No AMC" or "All", we should calculate people who have >1 year installations and NO active AMC
    let noAmcDues: any[] = [];
    if (statusFilter === 'All' || statusFilter === 'No AMC') {
      const customers = await prisma.customer.findMany({
        include: {
          installations: { orderBy: { date: 'desc' } },
          amcs: { orderBy: { endDate: 'desc' } }
        }
      });

      const now = new Date();
      const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

      customers.forEach(customer => {
        if (customer.installations.length === 0) return;
        const primaryInstall = customer.installations[0];
        const installDate = primaryInstall.date;
        const timeSinceInstall = now.getTime() - installDate.getTime();
        
        const hasActiveAmc = customer.amcs.some(amc => amc.endDate > now && amc.status === 'Active');

        // Show everyone who doesn't have an active AMC
        if (!hasActiveAmc) {
          noAmcDues.push({
            id: `NO-AMC-${customer.id.substring(0, 8)}`, // Fake ID for the table
            customerName: customer.name,
            customerPhone: customer.phone,
            address: customer.address,
            plan: 'None',
            startDate: primaryInstall.date,
            endDate: primaryInstall.date,
            status: 'No AMC',
            payment: 'Pending'
          });
        }
      });
    }

    return NextResponse.json([...amcs, ...noAmcDues]);
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
