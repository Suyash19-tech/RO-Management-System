"use client";

import { MoreVertical, Eye, RefreshCw, Bell, MapPin, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";

type Amc = {
  id: string;
  customerName: string;
  address: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  payment: string;
};

function Avatar({ name }: { name: string }) {
  const colors = ["bg-sky-100 text-sky-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700"];
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
    "Active": "bg-emerald-100 text-emerald-700",
    "Expiring Soon": "bg-amber-100 text-amber-700",
    "Expired": "bg-rose-100 text-rose-700",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Paid": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "Pending": "text-rose-600 bg-rose-50 border-rose-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${styles[status] || 'text-slate-600 bg-slate-50'}`}>
      {status}
    </span>
  );
}

export function AMCTable() {
  const [amcData, setAmcData] = useState<Amc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/amc')
      .then(res => res.json())
      .then(data => {
        setAmcData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch AMCs", err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading AMC contracts...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer / Location</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Period</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {amcData.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
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
                    <span className="text-sm font-bold text-slate-900">{item.plan}</span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">{item.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-slate-600">
                    <CalendarDays className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{formatDate(item.startDate)}</span>
                      <span className="text-xs text-slate-400">to {formatDate(item.endDate)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4">
                  <PaymentBadge status={item.payment} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View Contract">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Renew Contract">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Send Reminder">
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="md:hidden flex items-center justify-end">
                    <button className="p-1.5 text-slate-400 hover:text-slate-700">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {amcData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">
                  No contracts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">{amcData.length}</span> contracts
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
