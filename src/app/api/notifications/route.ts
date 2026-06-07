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
          message: `Inventory for '${p.name}' is completely OUT of stock. Please purchase immediately.`,
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
          message: `Inventory for '${p.name}' is low (${stock} units left). Threshold is ${threshold}.`,
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
        message: `${appt.type} for ${appt.customerName} is scheduled. Tech assigned: ${appt.tech || 'Unassigned'}.`,
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
        message: `Installation for ${inst.customerName} (${inst.model}) is pending. Tech: ${inst.tech || 'Unassigned'}.`,
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
          message: `${amc.plan} for ${amc.customerName} expires on ${dateStr}. Action required: Schedule renewal.`,
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
        message: `AMC balance of ₹${amc.balanceDue.toLocaleString('en-IN')} is outstanding for ${amc.customerName} (${amc.plan}).`,
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
        message: `Installation balance of ₹${inst.amountDue.toLocaleString('en-IN')} is outstanding for ${inst.customerName} (${inst.model}).`,
        time: 'Pending Payment',
        date: inst.updatedAt,
        link: '/dashboard/installations',
        read: false
      });
    }

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
