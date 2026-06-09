import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { getMemoryCache, setMemoryCache } from '@/lib/memory-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'this_month';
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');

    const cacheKey = `dashboard:stats:${filter}:${startStr || ''}:${endStr || ''}`;

    // 1. Check L1 Cache (Local Node.js In-Memory) - Latency: < 0.1ms
    const l1Cached = getMemoryCache(cacheKey);
    if (l1Cached) {
      return NextResponse.json(l1Cached);
    }

    // 2. Check L2 Cache (Distributed Upstash Redis) - Latency: ~300ms (geographical RTT)
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          // Robust parse: Upstash Redis REST client sometimes auto-deserializes JSON strings to objects
          const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
          
          // Populate L1 cache for subsequent requests
          setMemoryCache(cacheKey, parsed, 60);
          return NextResponse.json(parsed);
        }
      } catch (err) {
        console.error('Redis cache read error:', err);
      }
    }

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

    // Optimized parallel database queries (down from 18 to 14, using aggregates/groupBy and projection selects)
    const [
      totalCustomers,
      totalProducts,
      activeAmcs,
      products,
      todayAppointments,
      installations,
      amcs,
      appointments,
      expensesSum,
      appointmentStatusCounts,
      recentAppointments,
      recentInstallations,
      expiringAmcs,
      topTechnicians
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.amc.count({ where: { status: 'Active' } }),
      prisma.product.findMany({
        where: { category: { not: 'AMC Plan' } },
        select: { stock: true, threshold: true }
      }),
      prisma.appointment.count({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          status: { in: ['Scheduled', 'In Progress'] }
        }
      }),
      prisma.installation.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true, amountPaid: true, amountDue: true }
      }),
      prisma.amc.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true, amountPaid: true, balanceDue: true }
      }),
      prisma.appointment.findMany({
        where: { 
          status: 'Completed',
          completedAt: { gte: startDate, lte: endDate } 
        },
        select: { completedAt: true, costCharged: true }
      }),
      prisma.expense.aggregate({
        where: { date: { gte: startDate, lte: endDate } },
        _sum: { amountPaid: true, balanceDue: true }
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { status: true }
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

    // Dynamic Financial Metric Calculations
    const installRevenue = installations.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
    const amcRevenue = amcs.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
    const apptRevenue = appointments.reduce((sum, item) => sum + (item.costCharged || 0), 0);
    const totalRevenue = installRevenue + amcRevenue + apptRevenue;

    const totalExpenses = expensesSum._sum.amountPaid || 0;
    const supplierDues = expensesSum._sum.balanceDue || 0;

    const installDues = installations.reduce((sum, item) => sum + (item.amountDue || 0), 0);
    const amcDues = amcs.reduce((sum, item) => sum + (item.balanceDue || 0), 0);
    const customerDues = installDues + amcDues;

    const netProfit = totalRevenue - totalExpenses;

    // Process appointment status counts from groupBy
    let completedCount = 0;
    let pendingCount = 0;
    let scheduledCount = 0;
    let inProgressCount = 0;
    let cancelledCount = 0;

    appointmentStatusCounts.forEach(item => {
      if (item.status === 'Completed') completedCount = item._count.status;
      else if (item.status === 'Pending') pendingCount = item._count.status;
      else if (item.status === 'Scheduled') scheduledCount = item._count.status;
      else if (item.status === 'In Progress') inProgressCount = item._count.status;
      else if (item.status === 'Cancelled') cancelledCount = item._count.status;
    });

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

    const result = {
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
    };

    // Save to L1 Memory Cache (60 seconds)
    setMemoryCache(cacheKey, result, 60);

    // Save to L2 Redis Cache (60 seconds)
    if (redis) {
      try {
        await redis.setex(cacheKey, 60, result);
      } catch (err) {
        console.error('Redis cache write error:', err);
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
