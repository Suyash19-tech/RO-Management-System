"use client";

import { MessageSquare, Search, Filter, Download } from "lucide-react";
import { SupportTable } from "@/components/dashboard/SupportTable";

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support / Queries</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage general customer support tickets and non-technical inquiries.</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search tickets..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]" />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors">
            <Filter className="w-4 h-4 text-slate-500" />Filter
          </button>
        </div>
      </div>
      <div className="flex-1">
        <SupportTable />
      </div>
    </div>
  );
}
