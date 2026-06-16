import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/with-rate-limit';
import { eventEmitter } from '@/lib/events';

async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.customerName || !data.customerPhone || !data.address || !data.type || !data.date || !data.time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create the customer
      let customer = await tx.customer.findUnique({
        where: { phone: data.customerPhone }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: data.customerName,
            phone: data.customerPhone,
            address: data.address,
            // altPhone/email can be added later if needed
          }
        });
      } else {
        // Optionally update customer details if they've changed
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: data.customerName,
            address: data.address
          }
        });
      }

      // 2. Create the appointment
      const appointment = await tx.appointment.create({
        data: {
          customerName: customer.name,
          customerPhone: customer.phone,
          address: customer.address,
          type: data.type,
          tech: data.tech || 'Unassigned',
          date: new Date(data.date),
          time: data.time,
          status: 'Scheduled',
          remarks: data.remarks || null,
        },
      });

      return { customer, appointment };
    });

    eventEmitter.emit('appointment_update', { id: result.appointment.id, action: 'create', appointment: result.appointment });
    
    return NextResponse.json(result.appointment, { status: 201 });
  } catch (error) {
    console.error('Failed to onboard service appointment:', error);
    return NextResponse.json({ error: 'Failed to onboard service appointment' }, { status: 500 });
  }
}

// Strict rate limit: 5 onboardings per minute per IP
export const POST = withRateLimit(postHandler, { limit: 5, windowMs: 60_000 });
