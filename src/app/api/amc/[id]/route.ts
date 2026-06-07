import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const data = await request.json();

    const amc = await prisma.amc.findUnique({
      where: { id }
    });

    if (!amc) {
      return NextResponse.json({ error: 'AMC not found' }, { status: 404 });
    }

    let totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : amc.totalAmount;
    let amountPaid = data.amountPaid !== undefined ? Number(data.amountPaid) : amc.amountPaid;

    // Support toggling payment status directly
    if (data.payment !== undefined) {
      if (data.payment === "Paid" && data.amountPaid === undefined) {
        amountPaid = totalAmount > 0 ? totalAmount : 1500; // fallback if totalAmount is 0
        if (totalAmount === 0) totalAmount = amountPaid;
      } else if (data.payment === "Pending" && data.amountPaid === undefined && amountPaid >= totalAmount) {
        amountPaid = 0;
      }
    }

    const balanceDue = Math.max(0, totalAmount - amountPaid);
    const payment = balanceDue <= 0 ? 'Paid' : 'Pending';

    const updateData: any = {};
    if (data.customerName !== undefined) updateData.customerName = data.customerName;
    if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.plan !== undefined) updateData.plan = data.plan;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.status !== undefined) updateData.status = data.status;

    updateData.totalAmount = totalAmount;
    updateData.amountPaid = amountPaid;
    updateData.balanceDue = balanceDue;
    updateData.payment = payment;

    const updatedAmc = await prisma.amc.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedAmc);
  } catch (error) {
    console.error(`Failed to update AMC with ID ${error}:`, error);
    return NextResponse.json({ error: 'Failed to update AMC' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    await prisma.amc.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'AMC deleted successfully' });
  } catch (error) {
    console.error(`Failed to delete AMC with ID ${error}:`, error);
    return NextResponse.json({ error: 'Failed to delete AMC' }, { status: 500 });
  }
}
