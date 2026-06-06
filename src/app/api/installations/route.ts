import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const installations = await prisma.installation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(installations);
  } catch (error) {
    console.error('Failed to fetch installations:', error);
    return NextResponse.json({ error: 'Failed to fetch installations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const installation = await prisma.installation.create({
      data: {
        id: data.id,
        customerName: data.customerName,
        address: data.address,
        model: data.model,
        tech: data.tech || 'Unassigned',
        date: new Date(data.date),
        time: data.time,
        status: data.status || 'Pending',
      },
    });
    return NextResponse.json(installation, { status: 201 });
  } catch (error) {
    console.error('Failed to create installation:', error);
    return NextResponse.json({ error: 'Failed to create installation' }, { status: 500 });
  }
}
