import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit } from '@/lib/with-rate-limit';

async function getHandler(_req: NextRequest): Promise<NextResponse> {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        installations: true,
        amcs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const mappedCustomers = customers.map((c) => {
      // 1. Check if they have a recent installation (within 1 year)
      const hasRecentInstallation = c.installations.some(
        (inst) => new Date(inst.date) >= oneYearAgo
      );

      // 2. Check if they have an active AMC
      const hasActiveAmc = c.amcs.some(
        (amc) => new Date(amc.endDate) > now && amc.status === 'Active'
      );

      // Dynamic status: Active if has recent installation or active AMC, otherwise Inactive
      const status = (hasRecentInstallation || hasActiveAmc) ? 'Active' : 'Inactive';

      // Keep response shape clean by removing relations
      const { installations, amcs, ...customerWithoutRelations } = c;
      return {
        ...customerWithoutRelations,
        status,
      };
    });

    return NextResponse.json(mappedCustomers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        status: data.status || 'Active',
      },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

// Moderate: 60 requests per minute per IP
export const GET = withRateLimit(getHandler, { limit: 60, windowMs: 60_000 });
