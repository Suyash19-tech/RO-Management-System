import * as React from "react";
import { Wrench, CheckCircle2 } from "lucide-react";

interface ActivityCardProps {
  tickets: Array<{
    id: string;
    issueType: string;
    status: string;
    createdAt: string;
  }>;
}

export function ActivityCard({ tickets }: ActivityCardProps) {
  if (tickets.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {tickets.slice(0, 2).map((ticket) => (
          <div key={ticket.id} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center flex-shrink-0">
              {ticket.status === 'COMPLETED' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Wrench className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{ticket.issueType}</p>
              <p className="text-xs text-slate-500">
                {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityCardSkeleton() {
  return <div className="h-24 bg-slate-200 animate-pulse rounded-2xl"></div>;
}
