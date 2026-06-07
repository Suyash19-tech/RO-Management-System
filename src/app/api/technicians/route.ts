import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const technicians = await prisma.technician.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const activeApts = await prisma.appointment.groupBy({
      by: ['tech'],
      where: { status: { in: ['Scheduled', 'In Progress'] } },
      _count: { tech: true }
    });

    const activeInsts = await prisma.installation.groupBy({
      by: ['tech'],
      where: { status: { in: ['Pending', 'Scheduled', 'In Progress'] } },
      _count: { tech: true }
    });

    const activeMap = new Map();
    for (const a of activeApts) activeMap.set(a.tech, (activeMap.get(a.tech) || 0) + a._count.tech);
    for (const a of activeInsts) activeMap.set(a.tech, (activeMap.get(a.tech) || 0) + a._count.tech);

    const enriched = technicians.map(t => ({
      ...t,
      activeJobs: activeMap.get(t.name) || 0
    }));

    return NextResponse.json(enriched);
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
