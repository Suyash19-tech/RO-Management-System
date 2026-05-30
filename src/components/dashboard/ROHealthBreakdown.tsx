import * as React from "react";
import { ArrowRight } from "lucide-react";

const HEALTH_DATA = [
  { label: "Filters", status: "Good", color: "bg-[#10B981]" },
  { label: "Membrane", status: "Moderate", color: "bg-amber-400" },
  { label: "UV Lamp", status: "Good", color: "bg-[#10B981]" },
  { label: "Tank", status: "Good", color: "bg-[#10B981]" },
  { label: "Water Quality", status: "Good", color: "bg-[#10B981]" },
];

export function ROHealthBreakdown() {
  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col h-[380px]">
      <h3 className="text-[17px] font-bold text-slate-800 mb-8">RO Health Breakdown</h3>
      
      <div className="flex-1 flex flex-col justify-between mb-8">
        {HEALTH_DATA.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
            <span className="text-slate-600 font-medium text-sm">{item.label}</span>
            <div className="flex items-center gap-2.5">
              <span className="text-slate-800 font-semibold text-sm">{item.status}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            </div>
          </div>
        ))}
      </div>
      
      <button className="flex items-center gap-2 text-[#2b73f6] font-bold text-sm hover:underline mt-auto">
        View Full Health Report
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
