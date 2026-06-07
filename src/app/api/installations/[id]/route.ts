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
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update installation:', error);
    return NextResponse.json({ error: error.message || 'Failed to update installation' }, { status: 500 });
  }
}
