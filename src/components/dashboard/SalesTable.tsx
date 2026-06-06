"use client";

import { MoreVertical, ShoppingCart, Eye, MapPin, Receipt, CheckCircle2 } from "lucide-react";

const orders = [
  { id: "ORD-9901", customer: "Priya Verma", address: "Vasant Kunj, New Delhi", product: "SardarJi Premium RO", date: "26 May 2024", amount: "₹ 16,500", payment: "Paid", status: "Delivered" },
  { id: "ORD-9902", customer: "Rahul Sharma", address: "Sector 14, Gurugram", product: "Pure Water RO X1", date: "25 May 2024", amount: "₹ 12,500", payment: "Pending", status: "Processing" },
  { id: "ORD-9903", customer: "Amit Kumar", address: "Indirapuram, Ghaziabad", product: "Alkaline Copper Filter", date: "24 May 2024", amount: "₹ 1,200", payment: "Paid", status: "Shipped" },
  { id: "ORD-9904", customer: "Sunil Yadav", address: "Rohini Sector 7, Delhi", product: "SardarJi Classic RO", date: "23 May 2024", amount: "₹ 10,500", payment: "Paid", status: "Delivered" },
  { id: "ORD-9905", customer: "Neha Singh", address: "Noida Sector 62, UP", product: "RO Membrane 75 GPD", date: "22 May 2024", amount: "₹ 850", payment: "Paid", status: "Delivered" },
];

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
    "Delivered": "bg-emerald-100 text-emerald-700",
    "Shipped": "bg-blue-100 text-blue-700",
    "Processing": "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Paid": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "Pending": "text-amber-600 bg-amber-50 border-amber-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}

export function SalesTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer / Location</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfillment</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={item.customer} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.customer}</p>
                      <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <p className="text-xs font-medium">{item.address}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{item.product}</span>
                    <span className="text-xs font-medium text-slate-400 mt-0.5">{item.id} • {item.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-slate-900">{item.amount}</span>
                </td>
                <td className="px-6 py-4">
                  <PaymentBadge status={item.payment} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View Order">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Download Invoice">
                      <Receipt className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Mark Delivered">
                      <CheckCircle2 className="w-4 h-4" />
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
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">1</span> to <span className="font-bold text-slate-900">5</span> of <span className="font-bold text-slate-900">89</span> orders
        </span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>Previous</button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#2563EB] rounded-lg">1</button>
            <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">2</button>
          </div>
          <button className="px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
