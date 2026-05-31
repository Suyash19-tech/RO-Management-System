import * as React from "react";
import { Wrench, ChevronRight, CheckCircle2, Clock, CalendarDays } from "lucide-react";
import { Ticket } from "@/lib/api/history";
import Link from "next/link";
import { cn } from "@/lib/utils";

const getStatusDetails = (status: string) => {
  switch (status) {
    case 'COMPLETED': 
      return { color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 };
    case 'IN_PROGRESS': 
      return { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock };
    case 'ASSIGNED': 
    case 'ACCEPTED':
      return { color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: Clock };
    default: 
      return { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: Clock };
  }
};

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const { color, icon: StatusIcon } = getStatusDetails(ticket.status);

  return (
    <Link href={`/history/${ticket.id}`} className="block group">
      <div className="bg-white rounded-[22px] p-5 border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-slate-200 active:scale-[0.98] transition-all duration-300 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />

        <div className="flex justify-between items-start mb-5 relative z-10">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-100 text-slate-700 rounded-2xl flex items-center justify-center shadow-inner">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1 block">{ticket.id}</span>
              <h3 className="font-bold text-slate-800 text-[16px] leading-tight group-hover:text-blue-600 transition-colors">{ticket.issueType}</h3>
            </div>
          </div>
          <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-slate-100 pt-4 relative z-10">
          <div>
            <span className={cn(
              "flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",
              color
            )}>
              <StatusIcon className="w-3 h-3" />
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[12px] font-semibold">{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TicketCardSkeleton() {
  return <div className="h-36 bg-slate-200 animate-pulse rounded-[22px]"></div>;
}
