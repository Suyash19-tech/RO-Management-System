import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'Active' }
    });

    // RO machines must be active and have stock > 0
    const roMachines = products.filter(p => p.category.includes('RO') && p.stock > 0);
    // AMC plans are services, stock check is not applicable
    const amcPlans = products.filter(p => p.category === 'AMC Plan');
    // Equipments must be active, not AMC plans, not RO machines, and have stock > 0
    const equipments = products
      .filter(p => p.category !== 'AMC Plan' && !p.category.includes('RO') && p.stock > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        item: p.name, // for backwards compatibility with e.item in frontend
        price: p.price,
        stock: p.stock
      }));

    return NextResponse.json({ roMachines, amcPlans, equipments });
  } catch (error) {
    console.error('Failed to fetch form options:', error);
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}
