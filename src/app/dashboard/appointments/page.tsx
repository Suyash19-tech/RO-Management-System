"use client";

import { AppointmentsTable } from "@/components/dashboard/AppointmentsTable";

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Manage all scheduled services — track active jobs and view completed service history with invoices.
        </p>
      </div>

      <AppointmentsTable />
    </div>
  );
}
