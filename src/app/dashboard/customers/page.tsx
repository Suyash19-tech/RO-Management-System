"use client";

import { CustomersTable } from "@/components/dashboard/CustomersTable";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-5 max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customers</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          All your registered customers — tap any card to open the full profile.
        </p>
      </div>

      <CustomersTable />
    </div>
  );
}
