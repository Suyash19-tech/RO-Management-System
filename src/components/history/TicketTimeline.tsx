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
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-6">Updates Timeline</h3>
      
      <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
        {timeline.map((item, index) => {
          const isLatest = index === timeline.length - 1;
          return (
            <div key={index} className="relative pl-6">
              <div 
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${isLatest ? 'bg-[#00B8A9] shadow-sm' : 'bg-slate-300'}`} 
              />
              
              <div className="-mt-1">
                <h4 className={`font-semibold text-sm ${isLatest ? 'text-slate-900' : 'text-slate-600'}`}>
                  {item.status.replace('_', ' ')}
                </h4>
                <span className="text-[10px] font-medium text-slate-400 block mb-1">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
