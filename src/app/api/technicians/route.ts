import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const technicians = await prisma.technician.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(technicians);
  } catch (error) {
    console.error('Failed to fetch technicians:', error);
    return NextResponse.json({ error: 'Failed to fetch technicians' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const technician = await prisma.technician.create({
      data: {
        id: data.id,
        name: data.name,
        phone: data.phone,
        spec: data.spec,
        status: data.status || 'On Duty',
        rating: parseFloat(data.rating) || 5.0,
        activeJobs: parseInt(data.activeJobs) || 0,
      },
    });
    return NextResponse.json(technician, { status: 201 });
  } catch (error) {
    console.error('Failed to create technician:', error);
    return NextResponse.json({ error: 'Failed to create technician' }, { status: 500 });
  }
}
