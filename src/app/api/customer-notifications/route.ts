import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

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

    // Send native web push to all user's registered devices
    try {
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        // Configure Web Push with VAPID keys
        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || 'mailto:support@sardarjiro.com',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );

        const subscriptions = await prisma.pushSubscription.findMany({
          where: { customerPhone: phone }
        });

        const payload = JSON.stringify({
          title: title,
          body: message,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          url: '/'
        });

        const pushPromises = subscriptions.map(sub => 
          webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            }, 
            payload
          ).catch(e => {
            console.error('Failed to send push to one device (might be unsubscribed):', e);
            if (e.statusCode === 410 || e.statusCode === 404) {
              return prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
          })
        );
        
        await Promise.all(pushPromises);
      }
    } catch (pushError) {
      console.error('Global push error:', pushError);
      // We don't fail the API request if push fails, it's a progressive enhancement
    }

    return NextResponse.json(notification, { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error: any) {
    console.error('Failed to create customer notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to create customer notification' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
