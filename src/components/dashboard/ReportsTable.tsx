"use client";

import { FileText, Download, MoreVertical, FileBarChart } from "lucide-react";

const reports = [
  { id: "RPT-001", name: "Monthly Sales Report", type: "Sales", date: "01 Jun 2024", size: "1.2 MB", format: "PDF" },
  { id: "RPT-002", name: "Technician Performance (May)", type: "Performance", date: "31 May 2024", size: "2.4 MB", format: "CSV" },
  { id: "RPT-003", name: "AMC Expirations (Q3)", type: "AMC", date: "28 May 2024", size: "845 KB", format: "CSV" },
  { id: "RPT-004", name: "Inventory Low Stock Alert", type: "Inventory", date: "25 May 2024", size: "156 KB", format: "PDF" },
];

export function ReportsTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Report Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Generated Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">File Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                      <FileBarChart className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                      <span className="text-xs font-medium text-slate-400 mt-0.5">{item.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">{item.type}</span></td>
                <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-700">{item.date}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${item.format === 'PDF' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.format}</span>
                    <span className="text-xs font-medium text-slate-500">{item.size}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="px-4 py-2 bg-slate-100 hover:bg-[#2563EB] hover:text-white text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ml-auto">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
