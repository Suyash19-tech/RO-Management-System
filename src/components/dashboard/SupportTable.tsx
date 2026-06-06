"use client";

import { MoreVertical, MessageSquare, Reply, CheckCircle2, UserCircle } from "lucide-react";

const queries = [
  { id: "TKT-001", customer: "Aarav Singh", subject: "Water taste is slightly bitter after filter change", date: "26 May 2024", priority: "Medium", status: "Open" },
  { id: "TKT-002", customer: "Meera Reddy", subject: "AMC renewal link not working", date: "25 May 2024", priority: "High", status: "Open" },
  { id: "TKT-003", customer: "Rohan Das", subject: "Inquiry about upgrading to Premium model", date: "24 May 2024", priority: "Low", status: "Resolved" },
  { id: "TKT-004", customer: "Pooja Verma", subject: "Technician was late for installation", date: "23 May 2024", priority: "Medium", status: "Resolved" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Open": "bg-rose-100 text-rose-700",
    "Resolved": "bg-emerald-100 text-emerald-700",
  };
  return <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status]}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    "High": "text-rose-600 bg-rose-50 border-rose-200",
    "Medium": "text-amber-600 bg-amber-50 border-amber-200",
    "Low": "text-slate-600 bg-slate-50 border-slate-200",
  };
  return <span className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${styles[priority]}`}>{priority}</span>;
}

export function SupportTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Info</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Logged</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queries.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 max-w-[300px] truncate">{item.subject}</span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">{item.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{item.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-600">{item.date}</span></td>
                <td className="px-6 py-4"><PriorityBadge priority={item.priority} /></td>
                <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Reply"><Reply className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Mark Resolved"><CheckCircle2 className="w-4 h-4" /></button>
                  </div>
                  <div className="md:hidden flex items-center justify-end"><button className="p-1.5 text-slate-400 hover:text-slate-700"><MoreVertical className="w-4 h-4" /></button></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
