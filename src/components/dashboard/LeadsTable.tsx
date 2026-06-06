"use client";

import { MoreVertical, PhoneCall, MessageCircle, UserCheck, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: string;
  rep: string;
  date: string;
};

function Avatar({ name }: { name: string }) {
  if (name === "Unassigned") return <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 bg-slate-50 shrink-0" />;
  const colors = ["bg-sky-100 text-sky-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700"];
  const color = colors[name.length % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);
  return <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${color}`}>{initials}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "New": "bg-blue-100 text-blue-700",
    "Contacted": "bg-amber-100 text-amber-700",
    "Converted": "bg-emerald-100 text-emerald-700",
    "Dead": "bg-slate-100 text-slate-600",
  };
  return <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leads", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading leads...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Info</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Source & Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Rep</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    <span className="text-sm font-medium text-slate-600 mt-0.5">{item.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{item.source}</span>
                    <span className="text-xs font-medium text-slate-500 mt-0.5">
                      {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar name={item.rep} />
                    <span className={`text-sm font-semibold ${item.rep === 'Unassigned' ? 'text-slate-400 italic' : 'text-slate-700'}`}>{item.rep}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Call Lead"><PhoneCall className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Send WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Mark Converted"><UserCheck className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Mark Dead"><XCircle className="w-4 h-4" /></button>
                  </div>
                  <div className="md:hidden flex items-center justify-end"><button className="p-1.5 text-slate-400 hover:text-slate-700"><MoreVertical className="w-4 h-4" /></button></div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">Showing <span className="font-bold text-slate-900">{leads.length}</span> leads</span>
      </div>
    </div>
  );
}
