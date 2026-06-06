"use client";

import { MoreVertical, CheckCircle2, Receipt, Search, Filter, Download, Plus } from "lucide-react";

const expenses = [
  { id: "EXP-801", date: "26 May 2024", category: "Inventory Purchase", vendor: "AquaTech Suppliers", amount: "₹ 45,000", loggedBy: "Sanjay Admin", status: "Approved" },
  { id: "EXP-802", date: "25 May 2024", category: "Fuel & Travel", vendor: "Indian Oil", amount: "₹ 1,500", loggedBy: "Arjun Singh", status: "Pending" },
  { id: "EXP-803", date: "25 May 2024", category: "Office Supplies", vendor: "Stationery Mart", amount: "₹ 850", loggedBy: "Neha Clerk", status: "Approved" },
  { id: "EXP-804", date: "24 May 2024", category: "Marketing", vendor: "Facebook Ads", amount: "₹ 5,000", loggedBy: "Sanjay Admin", status: "Approved" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Approved": "bg-emerald-100 text-emerald-700",
    "Pending": "bg-amber-100 text-amber-700",
  };
  return <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status]}`}>{status}</span>;
}

export function ExpensesTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expense ID & Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category / Vendor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Logged By</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{item.id}</span>
                    <span className="text-xs font-medium text-slate-500 mt-0.5">{item.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{item.category}</span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">{item.vendor}</span>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="text-sm font-black text-rose-600">{item.amount}</span></td>
                <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-600">{item.loggedBy}</span></td>
                <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
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
