import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    const data = await request.json();

    const updated = await prisma.installation.update({
      where: { id },
      data: {
        ...(data.tech !== undefined && { tech: data.tech }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.customerName !== undefined && { customerName: data.customerName }),
        ...(data.customerPhone !== undefined && { customerPhone: data.customerPhone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.roPrice !== undefined && { roPrice: Number(data.roPrice) }),
        ...(data.equipmentPrice !== undefined && { equipmentPrice: Number(data.equipmentPrice) }),
        ...(data.amcPrice !== undefined && { amcPrice: Number(data.amcPrice) }),
        ...(data.discount !== undefined && { discount: Number(data.discount) }),
        ...(data.totalPrice !== undefined && { totalPrice: Number(data.totalPrice) }),
        ...(data.amountPaid !== undefined && { amountPaid: Number(data.amountPaid) }),
        ...(data.amountDue !== undefined && { amountDue: Number(data.amountDue) }),
        ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update installation:', error);
    return NextResponse.json({ error: error.message || 'Failed to update installation' }, { status: 500 });
  }
}
