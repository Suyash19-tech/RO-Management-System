"use client";

import { SalesTable } from "@/components/dashboard/SalesTable";

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales & Revenue</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            All incoming money, dues, and transaction history across installations, services & AMC.
          </p>
        </div>
      </div>
      <SalesTable />
    </div>
  );
}
