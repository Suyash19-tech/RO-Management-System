"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, Notification } from "@/lib/api/notifications";
import { NotificationCard, EmptyNotifications } from "@/components/notifications/NotificationCard";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications().then(data => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRead = async (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    await markNotificationRead(id);
  };

  const handleReadAll = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    await markAllNotificationsRead();
  };

  return (
    <div className="flex-1 bg-white h-full overflow-y-auto pb-20 relative">
      {/* Header */}
      <div className="pt-6 pb-4 px-4 sticky top-0 bg-white/90 backdrop-blur-md z-20 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleReadAll}
            className="text-[10px] font-bold text-[#0F4C81] flex items-center gap-1 hover:underline p-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Read All
          </button>
        )}
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
            <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
            <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <NotificationCard notification={n} onRead={handleRead} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
