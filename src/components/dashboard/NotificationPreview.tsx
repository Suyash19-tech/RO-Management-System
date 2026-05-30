import * as React from "react";
import { Bell } from "lucide-react";

interface NotificationPreviewProps {
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    read: boolean;
  }>;
}

export function NotificationPreview({ notifications }: NotificationPreviewProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>
          <h3 className="font-bold text-slate-900">Notifications</h3>
        </div>
        <button className="text-xs font-bold text-[#0F4C81]">View All</button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-2">No new notifications</p>
        ) : (
          notifications.slice(0, 3).map((n) => (
            <div key={n.id} className="flex gap-3 items-start">
              <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${n.read ? 'bg-slate-200' : 'bg-[#00B8A9]'}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{n.body}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function NotificationPreviewSkeleton() {
  return <div className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>;
}
