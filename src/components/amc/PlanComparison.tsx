import * as React from "react";
import { AMCPlan } from "@/lib/api/amc";
import { Check, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlanComparison({ plans }: { plans: AMCPlan[] }) {
  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-bold text-slate-900 mb-2">Available Plans</h3>
      {plans.map((plan) => (
        <div 
          key={plan.id}
          className={cn(
            "relative p-5 rounded-2xl border-2 transition-all overflow-hidden",
            plan.recommended 
              ? "border-[#00B8A9] bg-[#00B8A9]/5" 
              : "border-slate-100 bg-white"
          )}
        >
          {plan.recommended && (
            <div className="absolute top-0 right-0 bg-[#00B8A9] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
              RECOMMENDED
            </div>
          )}
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-bold text-slate-900">{plan.name}</h4>
            <div className="text-right">
              <span className="text-lg font-black text-[#0F4C81]">₹{plan.pricing}</span>
              <span className="text-[10px] text-slate-500 block">/ year</span>
            </div>
          </div>
          
          <ul className="space-y-2 mb-6">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Check className="w-3.5 h-3.5 text-[#00B8A9]" /> {f}
              </li>
            ))}
          </ul>
          
          <button className={cn(
            "w-full py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform",
            plan.recommended ? "bg-[#0F4C81] text-white shadow-lg" : "bg-slate-100 text-[#0F4C81]"
          )}>
            Select Plan
          </button>
        </div>
      ))}
    </div>
  );
}

export function EmptyAMCState() {
  return (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Protection</h2>
      <p className="text-sm text-slate-500 max-w-[250px] mx-auto mb-6">
        Your RO unit is currently unprotected. Regular maintenance ensures pure water and prevents costly breakdowns.
      </p>
    </div>
  );
}
