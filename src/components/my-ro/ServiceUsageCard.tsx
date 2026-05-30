import * as React from "react";
import { Sparkles } from "lucide-react";

interface ServiceUsageCardProps {
  usage: {
    allocated: number;
    used: number;
    remaining: number;
  };
}

export function ServiceUsageCard({ usage }: ServiceUsageCardProps) {
  const percentage = (usage.used / usage.allocated) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00B8A9]" />
            Free Services
          </h3>
          <p className="text-xs text-slate-500 mt-1">Included in your plan</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-[#0F4C81]">{usage.remaining}</span>
          <span className="text-xs text-slate-500 block font-medium">Remaining</span>
        </div>
      </div>

      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden mt-4">
        <div 
          className="absolute top-0 left-0 h-full bg-[#0F4C81] rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] font-semibold text-slate-400">{usage.used} Used</span>
        <span className="text-[10px] font-semibold text-slate-400">{usage.allocated} Total</span>
      </div>
    </div>
  );
}

export function ServiceUsageCardSkeleton() {
  return <div className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>;
}
