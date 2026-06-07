import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [installations, appointments, amcs] = await Promise.all([
      prisma.installation.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.appointment.findMany({
        where: { status: 'Completed' },
        orderBy: { completedAt: 'desc' }
      }),
      prisma.amc.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    // ── 1. Installations → sale entries
    const installationEntries = installations.map(inst => ({
      id: inst.id,
      type: 'Installation' as const,
      customerName: inst.customerName,
      customerPhone: inst.customerPhone ?? null,
      address: inst.address,
      description: inst.model,
      subItems: inst.equipments ?? null,
      date: inst.date.toISOString(),
      totalAmount: inst.totalPrice,
      amountPaid: inst.amountPaid,
      amountDue: inst.amountDue,
      paymentMethod: inst.paymentMethod,
      paymentStatus: inst.amountDue > 0 ? (inst.amountPaid > 0 ? 'Partial' : 'Unpaid') : 'Paid',
      purchaseCost: 0, // could be extended with product.purchasePrice later
    }));

    // ── 2. Completed Appointments (Services) → sale entries
    const serviceEntries = appointments.map(apt => {
      let itemsArr: { name: string; qty: number; cost: number }[] = [];
      try { if (apt.itemsUsed) itemsArr = JSON.parse(apt.itemsUsed); } catch {}

      return {
        id: apt.id,
        type: 'Service' as const,
        customerName: apt.customerName,
        customerPhone: apt.customerPhone ?? null,
        address: apt.address,
        description: apt.type,
        subItems: itemsArr.map(i => i.name).join(', ') || null,
        date: (apt.completedAt ?? apt.createdAt).toISOString(),
        totalAmount: apt.costCharged ?? 0,
        amountPaid: apt.paymentStatus === 'Paid' ? (apt.costCharged ?? 0) : 0,
        amountDue: apt.paymentStatus === 'Unpaid' ? (apt.costCharged ?? 0) : 0,
        paymentMethod: 'Cash',
        paymentStatus: apt.paymentStatus ?? 'Unpaid',
        purchaseCost: 0,
      };
    });

    // ── 3. AMC records → sale entries
    const amcEntries = amcs.map(amc => ({
      id: amc.id,
      type: 'AMC' as const,
      customerName: amc.customerName,
      customerPhone: amc.customerPhone ?? null,
      address: amc.address,
      description: amc.plan,
      subItems: null,
      date: amc.startDate.toISOString(),
      totalAmount: amc.totalAmount,
      amountPaid: amc.amountPaid,
      amountDue: amc.balanceDue,
      paymentMethod: 'Cash',
      paymentStatus: amc.payment === 'Paid' ? 'Paid' : (amc.balanceDue > 0 ? (amc.amountPaid > 0 ? 'Partial' : 'Unpaid') : 'Paid'),
      purchaseCost: 0,
    }));

    const allEntries = [...installationEntries, ...serviceEntries, ...amcEntries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // ── Financial Summary
    const totalRevenue = allEntries.reduce((s, e) => s + e.totalAmount, 0);
    const totalCollected = allEntries.reduce((s, e) => s + e.amountPaid, 0);
    const totalDue = allEntries.reduce((s, e) => s + e.amountDue, 0);
    const totalPurchaseCost = allEntries.reduce((s, e) => s + e.purchaseCost, 0);
    const totalProfit = totalCollected - totalPurchaseCost;

    return NextResponse.json({
      entries: allEntries,
      summary: {
        totalRevenue,
        totalCollected,
        totalDue,
        totalPurchaseCost,
        totalProfit,
        installationCount: installationEntries.length,
        serviceCount: serviceEntries.length,
        amcCount: amcEntries.length,
      }
    });
  } catch (error) {
    console.error('Sales API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}
