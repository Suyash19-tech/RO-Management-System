import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/with-rate-limit';

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          include: {
            installations: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const appointment = await prisma.appointment.create({
      data: {
        id: data.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        address: data.address,
        type: data.type,
        tech: data.tech || 'Unassigned',
        date: new Date(data.date),
        time: data.time,
        status: data.status || 'Scheduled',
      },
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

// Strict: 5 bookings per minute per IP
export const POST = withRateLimit(postHandler, { limit: 5, windowMs: 60_000 });
