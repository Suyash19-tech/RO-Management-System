import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const instCount = await prisma.installation.count();
    const aptCount = await prisma.appointment.count();
    const amcCount = await prisma.amc.count();
    const total = instCount + aptCount + amcCount;
    return NextResponse.json({ count: total });
  } catch (error) {
    console.error('Failed to get invoice count:', error);
    return NextResponse.json({ count: 0 });
  }
}
