"use client";

import { MoreVertical, Phone, Star, Map } from "lucide-react";
import { useState, useEffect } from "react";

type Technician = {
  id: string;
  name: string;
  phone: string;
  spec: string;
  status: string;
  rating: number;
  activeJobs: number;
};

function Avatar({ name }: { name: string }) {
  const colors = ["bg-indigo-100 text-indigo-700", "bg-teal-100 text-teal-700", "bg-orange-100 text-orange-700", "bg-blue-100 text-blue-700"];
  const color = colors[name.length % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);
  return <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>{initials}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "On Duty": "bg-emerald-100 text-emerald-700",
    "Off Duty": "bg-slate-100 text-slate-600",
  };
  return <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

export function TechniciansTable() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/technicians')
      .then(res => res.json())
      .then(data => {
        setTechnicians(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch technicians", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading technicians...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Technician</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {technicians.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={item.name} />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                      <span className="text-xs font-medium text-slate-500 mt-0.5">{item.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-700">{item.spec}</span></td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-slate-900">{item.rating} <span className="text-slate-400 font-medium">/ 5.0</span></span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{item.activeJobs} Active Jobs Today</span>
                  </div>
                </td>
                <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View on Map"><Map className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Call"><Phone className="w-4 h-4" /></button>
                  </div>
                  <div className="md:hidden flex items-center justify-end"><button className="p-1.5 text-slate-400 hover:text-slate-700"><MoreVertical className="w-4 h-4" /></button></div>
                </td>
              </tr>
            ))}
            {technicians.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                  No technicians found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
