"use client";

import { useEffect } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  useEffect(() => {
    const profileStr = localStorage.getItem("customer_profile");
    if (!profileStr || profileStr === "null" || profileStr === "undefined") return;

    const profile = JSON.parse(profileStr);
    if (!profile.phone) return;

    const subscribeToPush = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.warn('Push messaging is not supported');
          return;
        }

        // We only ask for permission if it hasn't been denied
        if (Notification.permission === 'denied') {
          console.warn('Notification permission denied by user.');
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        
        // Wait for user permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Get existing subscription or create new one
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BPi4mtpJ4qpMIdAzkhmdM0dBVWyJWCU9Xn64MnrWAPSoykalBJ2kCn6g2WbFS0ocBxlCbtIq1Do-uMKadItOBc0";
          if (!publicVapidKey) {
            console.error('VAPID public key not found');
            return;
          }

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });
        }

        // Send to backend
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
        await fetch(`${adminUrl}/api/push-subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription,
            phone: profile.phone
          })
        });

        console.log('Successfully subscribed to push notifications');

      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
      }
    };

    subscribeToPush();
  }, []);

  return null;
}
