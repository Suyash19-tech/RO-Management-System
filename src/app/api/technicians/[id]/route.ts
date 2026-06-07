import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update technician details or status
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { name, phone, spec, status, rating, activeJobs } = body;

    const updated = await prisma.technician.update({
      where: { id },
      data: {
        name,
        phone,
        spec,
        status,
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        activeJobs: activeJobs !== undefined ? parseInt(activeJobs) : undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update technician:', error);
    return NextResponse.json({ error: 'Failed to update technician' }, { status: 500 });
  }
}

// Delete a technician
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    await prisma.technician.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Technician deleted successfully' });
  } catch (error) {
    console.error('Failed to delete technician:', error);
    return NextResponse.json({ error: 'Failed to delete technician' }, { status: 500 });
  }
}
