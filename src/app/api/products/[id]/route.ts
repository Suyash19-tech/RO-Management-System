import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: String(data.name || ''),
        category: String(data.category || 'Domestic RO'),
        price: Number(data.price) || 0,
        purchasePrice: Number(data.purchasePrice) || 0,
        stock: Math.round(Number(data.stock) || 0),
        threshold: Math.round(Number(data.threshold) || 5),
        image: data.image ? String(data.image) : null,
        status: String(data.status || 'Active'),
      },
    });
    return NextResponse.json(product);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to update product:', msg);
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'SKU already exists for another product' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// PATCH — for stock adjustments only
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { stock } = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: { stock: Math.max(0, Math.round(Number(stock) || 0)) },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to adjust stock:', error);
    return NextResponse.json({ error: 'Failed to adjust stock' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
