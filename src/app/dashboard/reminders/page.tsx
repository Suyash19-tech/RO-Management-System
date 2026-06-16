"use client";

import { RemindersList } from "@/components/dashboard/RemindersList";

export default function RemindersPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Reminders</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track customers due for their bi-monthly free service and expiring 1-year free periods.
          </p>
        </div>
      </div>

      <RemindersList />
    </div>
  );
}
