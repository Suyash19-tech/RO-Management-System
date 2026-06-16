import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        installations: { orderBy: { date: 'desc' } },
        appointments: { 
          where: { status: 'Completed' },
          orderBy: { date: 'desc' }
        }
      }
    });

    const now = new Date();
    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

    const freeServiceDues: any[] = [];

    customers.forEach(customer => {
      // We only care if they have an installation
      if (customer.installations.length === 0) return;
      const primaryInstall = customer.installations[0];
      const installDate = primaryInstall.date;

      const timeSinceInstall = now.getTime() - installDate.getTime();
      
      if (timeSinceInstall <= oneYearInMs) {
        // <= 1 year since installation, check if last service > 60 days ago
        let lastServiceDate = installDate;
        if (customer.appointments.length > 0) {
          lastServiceDate = customer.appointments[0].completedAt || customer.appointments[0].date;
        }

        const timeSinceLastService = now.getTime() - new Date(lastServiceDate).getTime();
        if (timeSinceLastService > sixtyDaysInMs) {
          freeServiceDues.push({
            id: customer.id,
            customerId: customer.id,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            installDate: primaryInstall.date,
            lastServiceDate: lastServiceDate,
            model: primaryInstall.model
          });
        }
      }
    });

    return NextResponse.json({
      freeServiceDues
    });
  } catch (error) {
    console.error('Failed to fetch reminders:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}
