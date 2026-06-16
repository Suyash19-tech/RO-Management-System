import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const notifications = await prisma.customerNotification.findMany({
      where: { phone },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notifications, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Failed to fetch customer notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch customer notifications' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { phone, type, title, message } = data;

    if (!phone || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = await prisma.customerNotification.create({
      data: {
        phone,
        type: type || 'REMINDER',
        title,
        message
      }
    });

    return NextResponse.json(notification, { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    console.error('Failed to create customer notification:', error);
    return NextResponse.json({ error: 'Failed to create customer notification' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
