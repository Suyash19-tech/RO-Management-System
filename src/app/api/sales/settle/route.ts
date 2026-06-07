import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Settle payment for a transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, type, amount } = body;
    // type: "Installation" | "Service" | "AMC"
    // amount: the amount being settled now

    if (!id || !type || amount === undefined || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid settle request. id, type, and amount > 0 required.' }, { status: 400 });
    }

    const settleAmount = Number(amount);

    if (type === 'Installation') {
      const record = await prisma.installation.findUnique({ where: { id } });
      if (!record) return NextResponse.json({ error: 'Installation not found' }, { status: 404 });

      const newPaid = record.amountPaid + settleAmount;
      const newDue = Math.max(0, record.totalPrice - newPaid);

      const updated = await prisma.installation.update({
        where: { id },
        data: {
          amountPaid: newPaid,
          amountDue: newDue,
        }
      });

      return NextResponse.json({
        success: true,
        type: 'Installation',
        customerName: updated.customerName,
        totalAmount: updated.totalPrice,
        amountPaid: updated.amountPaid,
        amountDue: updated.amountDue,
      });

    } else if (type === 'AMC') {
      const record = await prisma.amc.findUnique({ where: { id } });
      if (!record) return NextResponse.json({ error: 'AMC not found' }, { status: 404 });

      const newPaid = record.amountPaid + settleAmount;
      const newDue = Math.max(0, record.totalAmount - newPaid);

      const updated = await prisma.amc.update({
        where: { id },
        data: {
          amountPaid: newPaid,
          balanceDue: newDue,
          payment: newDue <= 0 ? 'Paid' : 'Pending',
        }
      });

      return NextResponse.json({
        success: true,
        type: 'AMC',
        customerName: updated.customerName,
        totalAmount: updated.totalAmount,
        amountPaid: updated.amountPaid,
        amountDue: updated.balanceDue,
      });

    } else if (type === 'Service') {
      const record = await prisma.appointment.findUnique({ where: { id } });
      if (!record) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

      // Services are simpler — costCharged is the total, settle to Paid
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          paymentStatus: 'Paid',
          costCharged: record.costCharged ?? settleAmount,
        }
      });

      return NextResponse.json({
        success: true,
        type: 'Service',
        customerName: updated.customerName,
        totalAmount: updated.costCharged ?? 0,
        amountPaid: updated.costCharged ?? 0,
        amountDue: 0,
      });

    } else {
      return NextResponse.json({ error: 'Invalid type. Must be Installation, Service, or AMC.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Settle payment error:', error);
    return NextResponse.json({ error: 'Failed to settle payment' }, { status: 500 });
  }
}
