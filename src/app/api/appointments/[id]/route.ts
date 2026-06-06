import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    const data = await request.json();

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(data.time !== undefined && { time: data.time }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.tech !== undefined && { tech: data.tech }),
        ...(data.status !== undefined && { status: data.status }),
        // Completion fields
        ...(data.remarks !== undefined && { remarks: data.remarks }),
        ...(data.itemsUsed !== undefined && { itemsUsed: data.itemsUsed }),
        ...(data.costCharged !== undefined && { costCharged: parseFloat(data.costCharged) }),
        ...(data.paymentStatus !== undefined && { paymentStatus: data.paymentStatus }),
        ...(data.completedAt !== undefined && { completedAt: new Date(data.completedAt) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
