"use client";

import { Bell } from "lucide-react";
import { NotificationsFeed } from "@/components/dashboard/NotificationsFeed";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mx-auto pb-10 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">System alerts, updates, and important reminders.</p>
        </div>
      </div>
      <div className="flex-1">
        <NotificationsFeed />
      </div>
    </div>
  );
}
