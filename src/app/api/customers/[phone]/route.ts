import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ phone: string }> }) {
  try {
    const params = await props.params;
    const decodedPhone = decodeURIComponent(params.phone);
    
    const customer = await prisma.customer.findUnique({
      where: { phone: decodedPhone },
      include: {
        installations: {
          orderBy: { date: 'desc' }
        },
        amcs: {
          orderBy: { endDate: 'desc' }
        },
        appointments: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer details' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ phone: string }> }) {
  try {
    const params = await props.params;
    const decodedPhone = decodeURIComponent(params.phone);
    const body = await request.json();
    const { name, email, address, status } = body;

    const updatedCustomer = await prisma.customer.update({
      where: { phone: decodedPhone },
      data: {
        name,
        email,
        address,
        status,
      }
    });

    // If name changed, we might want to cascade update the customerName in related tables
    // since the schema currently duplicates customerName for ease of querying.
    // In a fully normalized DB, we wouldn't need this, but for now we'll sync it.
    if (name) {
      await prisma.$transaction([
        prisma.installation.updateMany({
          where: { customerPhone: decodedPhone },
          data: { customerName: name }
        }),
        prisma.amc.updateMany({
          where: { customerPhone: decodedPhone },
          data: { customerName: name }
        }),
        prisma.appointment.updateMany({
          where: { customerPhone: decodedPhone },
          data: { customerName: name }
        })
      ]);
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json({ error: 'Failed to update customer details' }, { status: 500 });
  }
}
