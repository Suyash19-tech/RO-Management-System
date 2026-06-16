"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Bell, ShieldAlert, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

type Reminder = {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  address: string;
  installDate: string;
  lastServiceDate?: string;
  model: string;
};

export function RemindersList() {
  const [activeTab, setActiveTab] = useState<"FREE" | "AMC">("FREE");
  const { data, isLoading } = useSWR<{ freeServiceDues: Reminder[]; amcDues: Reminder[] }>("/api/reminders", fetcher);

  const handleSendReminder = (reminder: Reminder, type: "FREE" | "AMC") => {
    // In a real production app, this would hit an API to push to the customer app.
    toast.success(`Reminder sent to ${reminder.name}'s application!`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#0B1B3D]/20 border-t-[#0B1B3D] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) return <div className="text-rose-500 font-medium">Failed to load reminders.</div>;

  const freeServiceDues = data?.freeServiceDues || [];

  const handleSendReminder = async (customer: any) => {
    try {
      const res = await fetch('/api/customer-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customer.phone,
          type: 'SERVICE',
          title: 'Free Service Due',
          message: `Hello ${customer.name}, your RO (${customer.model}) is due for its regular free maintenance service. Please book an appointment from the app.`
        })
      });

      if (!res.ok) throw new Error('Failed to send');

      toast.success(`App Reminder sent successfully to ${customer.name}!`, {
        icon: '📱'
      });
    } catch (e) {
      toast.error('Failed to send reminder.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-200">
        <button
          className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 border-b-2 text-slate-900 border-slate-900 bg-slate-50`}
        >
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          Free Service Dues ({freeServiceDues.length})
        </button>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {freeServiceDues.length === 0 ? (
            <p className="text-slate-500 text-center py-8 font-medium">No free services due right now.</p>
          ) : (
            freeServiceDues.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EBF5FF] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-500">{item.phone}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-500">{item.address}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-bold text-[#2563EB] bg-[#EBF5FF] px-2.5 py-1 rounded-md">
                        Last Service: {item.lastServiceDate ? new Date(item.lastServiceDate).toLocaleDateString() : "Never"}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {Math.floor((new Date().getTime() - new Date(item.installDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleSendReminder(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3D] hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Send App Reminder
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
