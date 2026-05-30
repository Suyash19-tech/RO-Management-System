import * as React from "react";
import { Wrench, ChevronRight } from "lucide-react";
import { Ticket } from "@/lib/api/history";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/history/${ticket.id}`} className="block">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-50 text-[#0F4C81] rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{ticket.id}</span>
              <h3 className="font-bold text-slate-900">{ticket.issueType}</h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </div>
        
        <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-2">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Status</p>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#00B8A9]/10 text-[#00B8A9]">
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Created</p>
            <p className="text-xs font-medium text-slate-700">{new Date(ticket.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TicketCardSkeleton() {
  return <div className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>;
}
