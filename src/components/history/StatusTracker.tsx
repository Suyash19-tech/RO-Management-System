import * as React from "react";
import { TicketStatus } from "@/lib/api/history";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES: { id: TicketStatus, label: string }[] = [
  { id: "CREATED", label: "Created" },
  { id: "ASSIGNED", label: "Assigned" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" }
];

export function StatusTracker({ currentStatus }: { currentStatus: TicketStatus }) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStatus);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <h3 className="font-bold text-slate-900 mb-6">Tracker</h3>
      
      <div className="flex justify-between relative px-2">
        {/* Background Line */}
        <div className="absolute top-3 left-6 right-6 h-1 bg-slate-100 -z-10" />
        
        {/* Fill Line */}
        <div 
          className="absolute top-3 left-6 h-1 bg-[#00B8A9] -z-10 transition-all duration-700 ease-out"
          style={{ width: `calc(${(currentIndex / (STAGES.length - 1)) * 100}% - 32px)` }}
        />

        {STAGES.map((stage, i) => {
          const isPassed = i < currentIndex;
          const isActive = i === currentIndex;
          const isPending = i > currentIndex;
          
          return (
            <div key={stage.id} className="flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors duration-500",
                  isPassed ? "bg-[#00B8A9]" : isActive ? "bg-[#0F4C81] ring-4 ring-[#0F4C81]/20" : "bg-slate-200"
                )}
              >
                {isPassed ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider text-center w-16",
                (isActive || isPassed) ? "text-slate-800" : "text-slate-400"
              )}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
