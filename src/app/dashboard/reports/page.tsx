"use client";

import { BarChart2, Plus } from "lucide-react";
import { ReportsTable } from "@/components/dashboard/ReportsTable";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Generate and download data reports across all business operations.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm shadow-blue-600/20 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          Generate New Report
        </button>
      </div>
      <div className="flex-1">
        <ReportsTable />
      </div>
    </div>
  );
}
