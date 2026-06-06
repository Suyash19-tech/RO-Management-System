import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const item = await prisma.inventoryItem.create({
      data: {
        id: data.id,
        item: data.item,
        sku: data.sku,
        category: data.category,
        stock: parseInt(data.stock) || 0,
        reorder: parseInt(data.reorder) || 10,
        status: data.status || 'In Stock',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
