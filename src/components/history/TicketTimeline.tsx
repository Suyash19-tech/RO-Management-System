import * as React from "react";
import { TicketStatus } from "@/lib/api/history";

interface TicketTimelineProps {
  timeline: Array<{
    status: TicketStatus;
    timestamp: string;
    description: string;
  }>;
}

export function TicketTimeline({ timeline }: TicketTimelineProps) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 text-[16px] mb-8">Updates Timeline</h3>
      
      <div className="relative border-l-[2px] border-dashed border-slate-200 ml-3 space-y-8 pb-2">
        {timeline.map((item, index) => {
          const isLatest = index === timeline.length - 1;
          return (
            <div key={index} className="relative pl-8">
              {/* Timeline Node */}
              {isLatest ? (
                <div className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-blue-50 border-[4px] border-white flex items-center justify-center shadow-sm">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
              )}
              
              <div className="-mt-1.5">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={`font-bold text-[14px] uppercase tracking-wider ${isLatest ? 'text-blue-600' : 'text-slate-600'}`}>
                    {item.status.replace('_', ' ')}
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  {new Date(item.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className={`text-[13px] leading-relaxed ${isLatest ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
