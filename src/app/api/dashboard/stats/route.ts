import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'this_month';
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now);

    // Set end date to end of today
    endDate.setHours(23, 59, 59, 999);

    if (filter === 'this_week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === 'this_year') {
      startDate.setMonth(now.getMonth() - 12);
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === 'custom' && startStr && endStr) {
      startDate = new Date(startStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // default: this_month (last 30 days)
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    // Today's Scheduled Appointments date bounds
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Run all database query metrics in a single parallel execution
    const [
      totalCustomers,
      totalProducts,
      activeAmcs,
      products,
      todayAppointments,
      installations,
      amcs,
      appointments,
      expenses,
      completedCount,
      pendingCount,
      scheduledCount,
      inProgressCount,
      cancelledCount,
      recentAppointments,
      recentInstallations,
      expiringAmcs,
      topTechnicians
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.amc.count({ where: { status: 'Active' } }),
      prisma.product.findMany({ where: { category: { not: "AMC Plan" } } }),
      prisma.appointment.count({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          status: { in: ['Scheduled', 'In Progress'] }
        }
      }),
      prisma.installation.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.amc.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.appointment.findMany({
        where: { 
          status: 'Completed',
          completedAt: { gte: startDate, lte: endDate } 
        }
      }),
      prisma.expense.findMany({
        where: { date: { gte: startDate, lte: endDate } }
      }),
      prisma.appointment.count({
        where: { status: 'Completed', createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.appointment.count({
        where: { status: 'Pending', createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.appointment.count({
        where: { status: 'Scheduled', createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.appointment.count({
        where: { status: 'In Progress', createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.appointment.count({
        where: { status: 'Cancelled', createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { customer: true }
      }),
      prisma.installation.findMany({
        take: 5,
        orderBy: { date: 'desc' }
      }),
      prisma.amc.findMany({
        take: 5,
        where: { status: { in: ['Expiring Soon', 'Expired'] } },
        orderBy: { endDate: 'asc' }
      }),
      prisma.technician.findMany({
        take: 4,
        orderBy: { rating: 'desc' }
      })
    ]);
    
    // Inventory alerts
    const lowStockCount = products.filter(p => p.stock <= (p.threshold ?? 5)).length;

    // 2. Dynamic Financial Metric Calculations (Installations, AMCs, Appointments, Expenses)
    // Inflow Revenue: Installations cash + AMC cash + Paid Appointment charges
    const installRevenue = installations.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
    const amcRevenue = amcs.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
    const apptRevenue = appointments.reduce((sum, item) => sum + (item.costCharged || 0), 0);
    const totalRevenue = installRevenue + amcRevenue + apptRevenue;

    // Outflow Expenses: Actual cash paid to vendors/suppliers/marketing
    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amountPaid || 0), 0);

    // Outstanding Supplier Dues (Expenses balanceDue)
    const supplierDues = expenses.reduce((sum, item) => sum + (item.balanceDue || 0), 0);

    // Outstanding Customer Dues (Installations amountDue + AMCs balanceDue)
    const installDues = installations.reduce((sum, item) => sum + (item.amountDue || 0), 0);
    const amcDues = amcs.reduce((sum, item) => sum + (item.balanceDue || 0), 0);
    const customerDues = installDues + amcDues;

    // Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // 3. Dynamic Chart Map Construction
    const chartDataMap: Record<string, number> = {};

    if (filter === 'this_week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        chartDataMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
      }
      installations.forEach(item => {
        const key = new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
      });
      amcs.forEach(item => {
        const key = new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
      });
      appointments.forEach(item => {
        if (item.completedAt) {
          const key = new Date(item.completedAt).toLocaleDateString('en-US', { weekday: 'short' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += item.costCharged || 0;
        }
      });
    } else if (filter === 'this_year') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        chartDataMap[d.toLocaleDateString('en-US', { month: 'short' })] = 0;
      }
      installations.forEach(item => {
        const key = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
      });
      amcs.forEach(item => {
        const key = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
      });
      appointments.forEach(item => {
        if (item.completedAt) {
          const key = new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += item.costCharged || 0;
        }
      });
    } else if (filter === 'custom' && startStr && endStr) {
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff > 31) {
        let tempDate = new Date(startDate);
        while (tempDate <= endDate) {
          chartDataMap[tempDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })] = 0;
          tempDate.setMonth(tempDate.getMonth() + 1);
        }
        installations.forEach(item => {
          const key = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
        });
        amcs.forEach(item => {
          const key = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
        });
        appointments.forEach(item => {
          if (item.completedAt) {
            const key = new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            if (chartDataMap[key] !== undefined) chartDataMap[key] += item.costCharged || 0;
          }
        });
      } else {
        let tempDate = new Date(startDate);
        while (tempDate <= endDate) {
          chartDataMap[tempDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })] = 0;
          tempDate.setDate(tempDate.getDate() + 1);
        }
        installations.forEach(item => {
          const key = new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
        });
        amcs.forEach(item => {
          const key = new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
        });
        appointments.forEach(item => {
          if (item.completedAt) {
            const key = new Date(item.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            if (chartDataMap[key] !== undefined) chartDataMap[key] += item.costCharged || 0;
          }
        });
      }
    } else {
      // default: last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        chartDataMap[d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })] = 0;
      }
      installations.forEach(item => {
        const key = new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
      });
      amcs.forEach(item => {
        const key = new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += item.amountPaid || 0;
      });
      appointments.forEach(item => {
        if (item.completedAt) {
          const key = new Date(item.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += item.costCharged || 0;
        }
      });
    }

    // Cumulative Line Chart Points
    let accumulated = 0;
    const revenueChartData = Object.keys(chartDataMap).map(key => {
      accumulated += chartDataMap[key];
      return {
        name: key,
        value: accumulated
      };
    });

    // Discrete Daily Sales Bar Chart Points
    const salesChartData = Object.keys(chartDataMap).map(key => {
      return {
        name: key,
        value: chartDataMap[key]
      };
    });

    const servicesChartData = [
      { name: 'Completed', value: completedCount, color: '#10B981' },
      { name: 'Pending / Scheduled', value: pendingCount + scheduledCount, color: '#3B82F6' },
      { name: 'In Progress', value: inProgressCount, color: '#F59E0B' },
      { name: 'Cancelled', value: cancelledCount, color: '#EF4444' },
    ];

    // Recent lists are pre-fetched in the parallel block at the top

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalProducts,
        activeAmcs,
        todayAppointments,
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit,
        customerDues,
        supplierDues,
        lowStockCount
      },
      recentAppointments,
      recentInstallations,
      expiringAmcs,
      topTechnicians,
      charts: {
        revenueChartData,
        salesChartData,
        servicesChartData
      }
    });

  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
