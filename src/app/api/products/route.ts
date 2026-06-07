import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Auto-generate SKU if not provided
    const sku = data.sku?.trim() || `PRD-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name: String(data.name),
        sku,
        category: String(data.category || 'Domestic RO'),
        price: Number(data.price) || 0,
        purchasePrice: Number(data.purchasePrice) || 0,
        stock: Number(data.stock) || 0,
        threshold: Number(data.threshold) || 5,
        image: data.image || null,
        status: 'Active',
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
