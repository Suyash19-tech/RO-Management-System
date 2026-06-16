import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const notifications = [];

    // 1. Low Stock Alerts
    const products = await prisma.product.findMany();
    for (const p of products) {
      if (p.category === 'AMC Plan') continue;
      const stock = p.stock ?? 0;
      const threshold = p.threshold ?? 5;

      if (stock === 0) {
        notifications.push({
          id: `low-stock-out-${p.id}`,
          type: 'Alert',
          title: 'Stock Out Alert',
          message: `Out of stock: ${p.name}`,
          time: 'Restock needed',
          date: p.updatedAt,
          link: '/dashboard/inventory',
          read: false
        });
      } else if (stock <= threshold) {
        notifications.push({
          id: `low-stock-warn-${p.id}`,
          type: 'Warning',
          title: 'Low Stock Warning',
          message: `Low stock: ${p.name} (${stock} units)`,
          time: 'Low Stock',
          date: p.updatedAt,
          link: '/dashboard/inventory',
          read: false
        });
      }
    }

    // 2. Upcoming Service & Repair Appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ['Scheduled', 'Pending', 'In Progress'] }
      },
      orderBy: { date: 'asc' }
    });

    for (const appt of appointments) {
      const apptDate = new Date(appt.date);
      // Format appt date for display
      const dateStr = apptDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      
      const isToday = apptDate.toDateString() === now.toDateString();
      const isPast = apptDate < now && !isToday;
      
      let relativeTime = `${dateStr} @ ${appt.time}`;
      let type = 'Info';
      let title = `Upcoming ${appt.type}`;

      if (isToday) {
        relativeTime = `TODAY @ ${appt.time}`;
        type = 'Alert';
        title = `TODAY: ${appt.type}`;
      } else if (isPast) {
        relativeTime = `PAST DUE (${dateStr})`;
        type = 'Alert';
        title = `OVERDUE: ${appt.type}`;
      }

      notifications.push({
        id: `appt-${appt.id}`,
        type,
        title,
        message: `Service Request: ${appt.customerName} (${appt.time})`,
        time: relativeTime,
        date: apptDate,
        link: '/dashboard/appointments',
        read: false
      });
    }

    // 3. Upcoming Installations
    const installations = await prisma.installation.findMany({
      where: {
        status: { in: ['Pending', 'Scheduled', 'In Progress'] }
      },
      orderBy: { date: 'asc' }
    });

    for (const inst of installations) {
      const instDate = new Date(inst.date);
      const dateStr = instDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      
      const isToday = instDate.toDateString() === now.toDateString();
      const isPast = instDate < now && !isToday;
      
      let relativeTime = `${dateStr} @ ${inst.time}`;
      let type = 'Info';
      let title = 'Upcoming Installation';

      if (isToday) {
        relativeTime = `TODAY @ ${inst.time}`;
        type = 'Alert';
        title = 'TODAY: Installation';
      } else if (isPast) {
        relativeTime = `PAST DUE (${dateStr})`;
        type = 'Alert';
        title = 'OVERDUE: Installation';
      }

      notifications.push({
        id: `inst-${inst.id}`,
        type,
        title,
        message: `Installation: ${inst.customerName} (${inst.model})`,
        time: relativeTime,
        date: instDate,
        link: '/dashboard/installations',
        read: false
      });
    }

    // 4. Expiring AMC Plans
    const amcs = await prisma.amc.findMany({
      where: {
        status: { in: ['Active', 'Expiring Soon'] }
      }
    });

    for (const amc of amcs) {
      const endDate = new Date(amc.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        const dateStr = endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        
        let type = 'Warning';
        let timeText = `Expires in ${diffDays} days`;
        let title = 'AMC Expiring Soon';

        if (diffDays < 0) {
          type = 'Alert';
          timeText = `Expired ${Math.abs(diffDays)} days ago`;
          title = 'AMC Expired';
        } else if (diffDays === 0) {
          type = 'Alert';
          timeText = 'Expires today';
          title = 'AMC Expires TODAY';
        }

        notifications.push({
          id: `amc-${amc.id}`,
          type,
          title,
          message: `Expiring soon: ${amc.customerName} (${amc.plan})`,
          time: timeText,
          date: endDate,
          link: '/dashboard/amc',
          read: false
        });
      }
    }

    // 5. Unsettled Balances (Outstanding Payments)
    const pendingAmcs = await prisma.amc.findMany({
      where: { balanceDue: { gt: 0 } }
    });

    for (const amc of pendingAmcs) {
      notifications.push({
        id: `pay-amc-${amc.id}`,
        type: 'Warning',
        title: 'Outstanding AMC Balance',
        message: `Dues pending: ₹${amc.balanceDue.toLocaleString('en-IN')} - ${amc.customerName}`,
        time: 'Pending Payment',
        date: amc.updatedAt,
        link: '/dashboard/amc',
        read: false
      });
    }

    const pendingInsts = await prisma.installation.findMany({
      where: { amountDue: { gt: 0 } }
    });

    for (const inst of pendingInsts) {
      notifications.push({
        id: `pay-inst-${inst.id}`,
        type: 'Warning',
        title: 'Outstanding Installation Balance',
        message: `Dues pending: ₹${inst.amountDue.toLocaleString('en-IN')} - ${inst.customerName}`,
        time: 'Pending Payment',
        date: inst.updatedAt,
        link: '/dashboard/installations',
        read: false
      });
    }

    // 6. Free Service and AMC Reminders
    const customers = await prisma.customer.findMany({
      include: {
        installations: { orderBy: { date: 'desc' } },
        amcs: { orderBy: { endDate: 'desc' } },
        appointments: { 
          where: { status: 'Completed' },
          orderBy: { date: 'desc' }
        }
      }
    });

    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;

    customers.forEach(customer => {
      if (customer.installations.length === 0) return;
      const primaryInstall = customer.installations[0];
      const installDate = primaryInstall.date;
      const timeSinceInstall = now.getTime() - installDate.getTime();
      
      const hasActiveAmc = customer.amcs.some(amc => new Date(amc.endDate) > now && amc.status === 'Active');

      if (timeSinceInstall > oneYearInMs) {
        if (!hasActiveAmc) {
          notifications.push({
            id: `amc-due-${customer.id}`,
            type: 'Warning',
            title: 'AMC Renewal Due',
            message: `${customer.name} has completed 1 year without AMC.`,
            time: 'Over 1 Year',
            date: installDate,
            link: '/dashboard/reminders',
            read: false
          });
        }
      } else {
        let lastServiceDate = installDate;
        if (customer.appointments.length > 0) {
          lastServiceDate = customer.appointments[0].completedAt || customer.appointments[0].date;
        }

        const timeSinceLastService = now.getTime() - new Date(lastServiceDate).getTime();
        if (timeSinceLastService > sixtyDaysInMs) {
          notifications.push({
            id: `service-due-${customer.id}`,
            type: 'Info',
            title: 'Free Service Due',
            message: `${customer.name} is due for their bi-monthly free service.`,
            time: '> 60 days since last service',
            date: lastServiceDate,
            link: '/dashboard/reminders',
            read: false
          });
        }
      }
    });

    // Sort notifications by date (newest/most urgent first)
    // Urgent types (Alert) bubble to top, then sorted by date
    notifications.sort((a, b) => {
      const typePriority: Record<string, number> = { Alert: 1, Warning: 2, Info: 3, Success: 4 };
      const priorityDiff = (typePriority[a.type] || 3) - (typePriority[b.type] || 3);
      if (priorityDiff !== 0) return priorityDiff;
      return b.date.getTime() - a.date.getTime();
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to aggregate notifications:', error);
    return NextResponse.json({ error: 'Failed to aggregate notifications' }, { status: 500 });
  }
}
