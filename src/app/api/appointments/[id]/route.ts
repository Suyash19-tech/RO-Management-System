import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    const data = await request.json();

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.appointment.findUnique({
        where: { id }
      });

      if (!existing) {
        throw new Error('Appointment not found');
      }

      const updatedApp = await tx.appointment.update({
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
          ...(data.incrementReschedule && { rescheduleCount: { increment: 1 } }),
        },
      });

      // Stock decrement logic when transitioning to Completed status
      if (existing.status !== 'Completed' && updatedApp.status === 'Completed' && updatedApp.itemsUsed) {
        try {
          const items = JSON.parse(updatedApp.itemsUsed);
          if (Array.isArray(items)) {
            for (const item of items) {
              const prod = await tx.product.findFirst({
                where: { name: item.name }
              });
              if (prod && prod.category !== 'AMC Plan') {
                await tx.product.update({
                  where: { id: prod.id },
                  data: {
                    stock: Math.max(0, prod.stock - (Number(item.qty) || 1))
                  }
                });
              }
            }
          }
        } catch (err) {
          console.error('Failed to parse itemsUsed or update stock in transaction:', err);
        }
      }

      // Decrement installation service count if complimentary/Free service is completed
      if (existing.status !== 'Completed' && updatedApp.status === 'Completed' && updatedApp.paymentStatus === 'Free' && updatedApp.customerPhone) {
        const installation = await tx.installation.findFirst({
          where: { customerPhone: updatedApp.customerPhone, servicesCount: { gt: 0 } },
          orderBy: { createdAt: 'desc' }
        });
        if (installation) {
          await tx.installation.update({
            where: { id: installation.id },
            data: { servicesCount: { decrement: 1 } }
          });
        }
      }

      return updatedApp;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update appointment:', error);
    return NextResponse.json({ error: error.message || 'Failed to update appointment' }, { status: 500 });
  }
}
