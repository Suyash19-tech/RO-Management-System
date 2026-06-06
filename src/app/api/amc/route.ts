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
    const amc = await prisma.amc.create({
      data: {
        id: data.id, // optionally manually provided, e.g. AMC-5091
        customerName: data.customerName,
        address: data.address,
        plan: data.plan,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'Active',
        payment: data.payment || 'Paid',
      },
    });
    return NextResponse.json(amc, { status: 201 });
  } catch (error) {
    console.error('Failed to create AMC:', error);
    return NextResponse.json({ error: 'Failed to create AMC' }, { status: 500 });
  }
}
