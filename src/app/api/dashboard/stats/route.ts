import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'this_month';
  const startStr = searchParams.get('start');
  const endStr = searchParams.get('end');

  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (filter === 'this_week') {
    startDate.setDate(now.getDate() - 7);
  } else if (filter === 'this_year') {
    startDate.setMonth(now.getMonth() - 12);
  } else if (filter === 'custom' && startStr && endStr) {
    startDate = new Date(startStr);
    endDate = new Date(endStr);
    endDate.setHours(23, 59, 59, 999);
  } else {
    startDate.setDate(now.getDate() - 30);
  }
  try {
    const totalCustomers = await prisma.customer.count();
    const totalProducts = await prisma.product.count();
    const totalLeads = await prisma.lead.count();
    const totalAmcs = await prisma.amc.count();
    
    const activeAmcs = await prisma.amc.count({ where: { status: 'Active' } });
    const todayAppointments = await prisma.appointment.count({
      where: {
        status: { in: ['Scheduled', 'In Progress'] }
      }
    });

    // Fetch lists
    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      orderBy: { date: 'desc' },
    });

    const expiringAmcs = await prisma.amc.findMany({
      take: 5,
      where: {
        status: { in: ['Expiring Soon', 'Expired'] }
      },
      orderBy: { endDate: 'asc' }
    });

    const topTechnicians = await prisma.technician.findMany({
      take: 4,
      orderBy: { rating: 'desc' }
    });

    const recentInstallations = await prisma.installation.findMany({
      take: 4,
      orderBy: { date: 'desc' }
    });

    // Calculate dynamic revenue and daily chart points
    const paidAmcs = await prisma.amc.findMany({
      where: { 
        payment: 'Paid',
        startDate: { gte: startDate, lte: endDate }
      }
    });

    const totalRevenue = paidAmcs.reduce((acc, curr) => {
      return acc + (curr.plan.includes('Premium') ? 5000 : 3000);
    }, 0);

    const chartDataMap: Record<string, number> = {};

    if (filter === 'this_week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        chartDataMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
      }
      paidAmcs.forEach(amc => {
        const key = new Date(amc.startDate).toLocaleDateString('en-US', { weekday: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += amc.plan.includes('Premium') ? 5000 : 3000;
      });
    } else if (filter === 'this_year') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        chartDataMap[d.toLocaleDateString('en-US', { month: 'short' })] = 0;
      }
      paidAmcs.forEach(amc => {
        const key = new Date(amc.startDate).toLocaleDateString('en-US', { month: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += amc.plan.includes('Premium') ? 5000 : 3000;
      });
    } else if (filter === 'custom' && startStr && endStr) {
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff > 31) {
        let tempDate = new Date(startDate);
        while (tempDate <= endDate) {
          chartDataMap[tempDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })] = 0;
          tempDate.setMonth(tempDate.getMonth() + 1);
        }
        paidAmcs.forEach(amc => {
          const key = new Date(amc.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += amc.plan.includes('Premium') ? 5000 : 3000;
        });
      } else {
        let tempDate = new Date(startDate);
        while (tempDate <= endDate) {
          chartDataMap[tempDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })] = 0;
          tempDate.setDate(tempDate.getDate() + 1);
        }
        paidAmcs.forEach(amc => {
          const key = new Date(amc.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          if (chartDataMap[key] !== undefined) chartDataMap[key] += amc.plan.includes('Premium') ? 5000 : 3000;
        });
      }
    } else {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        chartDataMap[d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })] = 0;
      }
      paidAmcs.forEach(amc => {
        const key = new Date(amc.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        if (chartDataMap[key] !== undefined) chartDataMap[key] += amc.plan.includes('Premium') ? 5000 : 3000;
      });
    }

    // Generate cumulative trend line data
    let accumulated = 0;
    const revenueChartData = Object.keys(chartDataMap).map(key => {
      accumulated += chartDataMap[key];
      return {
        name: key,
        value: accumulated
      };
    });

    // Generate daily/monthly sales bar chart data
    const salesChartData = Object.keys(chartDataMap).map(key => {
      return {
        name: key,
        value: chartDataMap[key]
      };
    });

    // Aggregate appointments by status for the donut chart
    const completedCount = await prisma.appointment.count({ where: { status: 'Completed', createdAt: { gte: startDate, lte: endDate } } });
    const pendingCount = await prisma.appointment.count({ where: { status: 'Pending', createdAt: { gte: startDate, lte: endDate } } });
    const inProgressCount = await prisma.appointment.count({ where: { status: 'In Progress', createdAt: { gte: startDate, lte: endDate } } });
    const cancelledCount = await prisma.appointment.count({ where: { status: 'Cancelled', createdAt: { gte: startDate, lte: endDate } } });
    const scheduledCount = await prisma.appointment.count({ where: { status: 'Scheduled', createdAt: { gte: startDate, lte: endDate } } });

    // Combine Pending & Scheduled for simplicity in the 4-segment UI wheel
    const totalPending = pendingCount + scheduledCount;

    const servicesChartData = [
      { name: 'Completed', value: completedCount, color: '#10B981' },
      { name: 'Pending', value: totalPending, color: '#3B82F6' },
      { name: 'In Progress', value: inProgressCount, color: '#F59E0B' },
      { name: 'Cancelled', value: cancelledCount, color: '#EF4444' },
    ];

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalProducts,
        totalLeads,
        totalAmcs,
        activeAmcs,
        todayAppointments,
        revenue: totalRevenue
      },
      recentAppointments,
      expiringAmcs,
      topTechnicians,
      recentInstallations,
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
