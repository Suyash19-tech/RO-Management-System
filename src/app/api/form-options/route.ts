import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'Published' }
    });
    
    const inventory = await prisma.inventoryItem.findMany({
      where: { status: { not: 'Out of Stock' } }
    });

    const roMachines = products.filter(p => p.category.includes('RO'));
    const amcPlans = products.filter(p => p.category === 'AMC Plan');

    return NextResponse.json({ roMachines, amcPlans, equipments: inventory });
  } catch (error) {
    console.error('Failed to fetch form options:', error);
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}
