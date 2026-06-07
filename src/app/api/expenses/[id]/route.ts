import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { amountPaid } = await request.json();

    const expense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const newAmountPaid = Number(amountPaid) || 0;
    const balanceDue = Math.max(0, expense.amount - newAmountPaid);

    let status = 'Paid';
    if (newAmountPaid === 0) {
      status = 'Unpaid';
    } else if (balanceDue > 0) {
      status = 'Partially Paid';
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amountPaid: newAmountPaid,
        balanceDue,
        status
      }
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Failed to update expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.expense.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
