import * as React from "react";
import { CheckCircle2 } from "lucide-react";

export function BenefitList({ benefits }: { benefits: string[] }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">Plan Benefits</h3>
      <ul className="space-y-3">
        {benefits.map((benefit, i) => (
          <li key={i} className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00B8A9] flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UsageCard({ usage }: { usage: { allocated: number; used: number } }) {
  const remaining = usage.allocated - usage.used;
  const percentage = (usage.used / usage.allocated) * 100;

  return (
    <div className="bg-gradient-to-br from-[#0F4C81]/5 to-[#0F4C81]/10 p-5 rounded-2xl border border-[#0F4C81]/10">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="font-bold text-slate-900">Services Consumed</h3>
          <p className="text-xs text-slate-500 mt-1">{remaining} remaining out of {usage.allocated}</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-xl text-[#0F4C81] shadow-sm">
          {usage.used}
        </div>
      </div>

      <div className="h-3 bg-white/60 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#0F4C81] rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
