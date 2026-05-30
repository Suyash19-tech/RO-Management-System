import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ROCareBreakdownProps {
  score: number;
  breakdown: {
    serviceStatus: "GOOD" | "DUE_SOON" | "OVERDUE";
    filterStatus: "GOOD" | "REPLACE_SOON" | "CRITICAL";
    membraneStatus: "GOOD" | "REPLACE_SOON" | "CRITICAL";
    openComplaints: number;
  };
}

export function ROCareBreakdown({ breakdown }: ROCareBreakdownProps) {
  const getStatusDisplay = (status: string) => {
    if (status === 'GOOD') return { color: "text-slate-600", dot: "bg-[#00B8A9]", label: "Good" };
    if (status === 'DUE_SOON' || status === 'REPLACE_SOON') return { color: "text-slate-600", dot: "bg-amber-400", label: "Moderate" };
    return { color: "text-red-500", dot: "bg-red-500", label: "Critical" };
  };

  const indicators = [
    { label: "Filters", status: breakdown.filterStatus },
    { label: "Membrane", status: breakdown.membraneStatus },
    { label: "UV Lamp", status: "GOOD" },
    { label: "Tank", status: "GOOD" },
    { label: "Water Quality", status: breakdown.serviceStatus },
  ];

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full w-full">
      <h3 className="font-bold text-slate-900 text-lg mb-6">RO Health Breakdown</h3>

      <div className="space-y-5 flex-1">
        {indicators.map((item, i) => {
          const display = getStatusDisplay(item.status);
          return (
            <div key={i} className="flex items-center justify-between group border-b border-slate-50 pb-4 last:border-0 last:pb-0">
              <span className="text-[13px] md:text-sm font-semibold text-slate-700">{item.label}</span>
              <div className="flex items-center gap-2.5">
                <span className={cn("text-[13px] font-medium", display.color)}>
                  {display.label}
                </span>
                <span className={cn("w-2.5 h-2.5 rounded-full shadow-sm", display.dot)} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <button className="flex items-center gap-2 text-[#0052D4] font-bold text-[13px] md:text-sm hover:underline">
          View Full Health Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ROCareBreakdownSkeleton() {
  return <div className="h-64 bg-slate-200 animate-pulse rounded-[2rem]"></div>;
}
