import * as React from "react";
import { TicketStatus } from "@/lib/api/history";
import { Check, CircleDot } from "lucide-react";
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
    <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full opacity-60 pointer-events-none" />

      <h3 className="font-bold text-slate-800 text-[14px] mb-6 relative z-10">Tracker</h3>
      
      <div className="flex justify-between relative z-10 px-0.5">
        {/* Lines Container */}
        <div className="absolute top-3.5 left-5 right-5 h-1.5 -z-10">
          <div className="absolute inset-0 bg-slate-100 rounded-full" />
          <div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-blue-500/30"
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES.map((stage, i) => {
          const isPassed = i < currentIndex;
          const isActive = i === currentIndex;
          
          return (
            <div key={stage.id} className="flex flex-col items-center relative">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-500 shadow-sm",
                  isPassed 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 shadow-blue-500/20" 
                    : isActive 
                      ? "bg-white border-2 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/20 ring-4 ring-blue-50" 
                      : "bg-slate-100 text-slate-400"
                )}
              >
                {isPassed ? <Check className="w-4 h-4 font-bold" /> : isActive ? <CircleDot className="w-4 h-4 animate-pulse" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
              </div>
              <span className={cn(
                "text-[8px] font-extrabold uppercase tracking-wide text-center whitespace-nowrap absolute top-10",
                (isActive || isPassed) ? "text-slate-800" : "text-slate-400"
              )} style={{ left: '50%', transform: 'translateX(-50%)' }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Padding for absolute labels */}
      <div className="h-5" />
    </div>
  );
}
