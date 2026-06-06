"use client";

import { Calendar, CheckCircle2, XCircle, MapPin, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Installation = {
  id: string;
  customerName: string;
  address: string;
  model: string;
  tech: string;
  date: string;
  time: string;
  status: string;
  equipments: string | null;
  servicesCount: number;
  expiryDate: string | null;
  customerPhone?: string | null;
};

function Avatar({ name, isTech = false }: { name: string, isTech?: boolean }) {
  if (name === "Unassigned") {
    return (
      <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 shrink-0">
        <Wrench className="w-3.5 h-3.5" />
      </div>
    );
  }

  const colors = isTech 
    ? ["bg-indigo-100 text-indigo-700", "bg-teal-100 text-teal-700", "bg-orange-100 text-orange-700"]
    : ["bg-sky-100 text-sky-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700"];
  
  const color = colors[name.length % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2);
  
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Pending": "bg-amber-100 text-amber-700",
    "Scheduled": "bg-blue-100 text-blue-700",
    "In Progress": "bg-purple-100 text-purple-700",
    "Completed": "bg-emerald-100 text-emerald-700",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

export function InstallationsTable({ searchTerm = "" }: { searchTerm?: string }) {
  const router = useRouter();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredInstallations = installations.filter(item => 
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetch('/api/installations')
      .then(res => res.json())
      .then(data => {
        setInstallations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch installations", err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading installations...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer / Location</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">RO Model</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Equipments</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Warranty</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInstallations.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => item.customerPhone && router.push(`/dashboard/customers/${item.customerPhone}`)}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={item.customerName} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.customerName}</p>
                      <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <p className="text-xs font-medium">{item.address}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{item.model}</span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">{item.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-slate-600 line-clamp-1 max-w-[150px]">{item.equipments || "None"}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{item.servicesCount} Services</span>
                    <span className="text-[11px] font-medium text-slate-500 mt-0.5">Exp: {item.expiryDate ? formatDate(item.expiryDate) : 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">{formatDate(item.date)}</span>
                    <span className="text-xs font-medium text-slate-500 mt-0.5">{item.time}</span>
                  </div>
                </td>
              </tr>
            ))}
            {filteredInstallations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">
                  No installations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredInstallations.length}</span> installations
        </span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#2563EB] rounded-lg">1</button>
          </div>
          <button className="px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
