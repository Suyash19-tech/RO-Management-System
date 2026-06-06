"use client";

import { Bell, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";

const notifications = [
  { id: "NOT-001", type: "Alert", title: "Low Stock Warning", message: "Inventory for 'Inline Carbon Filter' has reached 0 units. Please restock immediately.", time: "10 mins ago", read: false },
  { id: "NOT-002", type: "Info", title: "New Lead Assigned", message: "A new lead from Website Form (Kunal Bhatia) is awaiting assignment.", time: "1 hour ago", read: false },
  { id: "NOT-003", type: "Success", title: "Payment Received", message: "Payment of ₹16,500 received for Order ORD-9901 (Priya Verma).", time: "2 hours ago", read: true },
  { id: "NOT-004", type: "Warning", title: "AMC Expiring Soon", message: "AMC for Rahul Sharma expires in 14 days. Reminder email has not been sent.", time: "5 hours ago", read: true },
  { id: "NOT-005", type: "Info", title: "Technician Status Change", message: "Suresh Prajapati has marked their status as Off Duty.", time: "Yesterday", read: true },
];

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "Alert": return <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-rose-600" /></div>;
    case "Warning": return <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><AlertCircle className="w-5 h-5 text-amber-600" /></div>;
    case "Success": return <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>;
    default: return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Info className="w-5 h-5 text-blue-600" /></div>;
  }
}

export function NotificationsFeed() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">Recent Alerts</h3>
        <button className="text-sm font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">Mark all as read</button>
      </div>
      <div className="divide-y divide-slate-100">
        {notifications.map((item) => (
          <div key={item.id} className={`p-4 flex gap-4 hover:bg-slate-50 transition-colors ${!item.read ? 'bg-blue-50/30' : ''}`}>
            <NotificationIcon type={item.type} />
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{item.title}</span>
                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{item.time}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.message}</p>
            </div>
            {!item.read && (
              <div className="flex items-center justify-center px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
