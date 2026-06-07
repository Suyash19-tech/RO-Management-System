import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const category = String(data.category);
    const description = String(data.description || '');
    const amount = Number(data.amount) || 0;
    const amountPaid = Number(data.amountPaid) || 0;
    const balanceDue = amount - amountPaid;
    
    // Status depends on payment
    let status = 'Paid';
    if (amountPaid === 0) {
      status = 'Unpaid';
    } else if (balanceDue > 0) {
      status = 'Partially Paid';
    }

    const vendor = data.vendor ? String(data.vendor) : null;
    const loggedBy = data.loggedBy ? String(data.loggedBy) : 'Admin';
    const date = data.date ? new Date(data.date) : new Date();

    const productId = data.productId ? String(data.productId) : null;
    const quantity = data.quantity ? Number(data.quantity) : null;
    let productName: string | null = null;

    // Run in a transaction if we need to update stock
    const result = await prisma.$transaction(async (tx) => {
      if (category === 'Inventory Purchase' && productId && quantity && quantity > 0) {
        const product = await tx.product.findUnique({
          where: { id: productId }
        });

        if (product) {
          productName = product.name;
          // Increment stock
          await tx.product.update({
            where: { id: productId },
            data: {
              stock: {
                increment: quantity
              }
            }
          });
        }
      }

      const expense = await tx.expense.create({
        data: {
          category,
          description,
          amount,
          amountPaid,
          balanceDue,
          status,
          vendor,
          loggedBy,
          date,
          productId,
          productName,
          quantity
        }
      });

      return expense;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
