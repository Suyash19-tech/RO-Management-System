"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Info, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, Check } from "lucide-react";

interface Notification {
  id: string;
  type: "Alert" | "Warning" | "Info" | "Success";
  title: string;
  message: string;
  time: string;
  link: string;
  read: boolean;
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "Alert":
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200 shadow-sm animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        </div>
      );
    case "Warning":
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
      );
    case "Success":
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200 shadow-sm">
          <Info className="w-5 h-5 text-blue-600" />
        </div>
      );
  }
}

export function NotificationsFeed() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"All" | "Alert" | "Warning" | "Info">("All");

  const getDismissedIds = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("dismissed_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data);
      
      const dismissed = getDismissedIds();
      setDismissedIds(dismissed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const dismissNotification = (id: string) => {
    const dismissed = getDismissedIds();
    const updated = [...dismissed, id];
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
    setDismissedIds(updated);
    
    // Also dispatch storage event so header/sidebar counts update
    window.dispatchEvent(new Event("storage"));
  };

  const dismissAll = () => {
    const dismissed = getDismissedIds();
    const allIds = notifications.map(n => n.id);
    const updated = Array.from(new Set([...dismissed, ...allIds]));
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
    setDismissedIds(updated);
    
    // Also dispatch storage event so header/sidebar counts update
    window.dispatchEvent(new Event("storage"));
  };

  const visibleNotifications = notifications.filter(
    (item) => !dismissedIds.includes(item.id)
  );

  const filtered = visibleNotifications.filter(
    (item) => filterType === "All" || item.type === filterType
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
      
      {/* Header toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h3 className="font-black text-slate-900 text-base">Live System Issues & Alerts</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Realtime operational tasks and warnings requiring attention · {filtered.length} active
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={dismissAll}
            disabled={filtered.length === 0}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-350 transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
          
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            {(["All", "Alert", "Warning", "Info"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterType === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          
          <button
            onClick={fetchNotifications}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors shadow-sm cursor-pointer"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Scanning system databases...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 flex gap-4 hover:bg-slate-50/70 transition-all group"
            >
              <NotificationIcon type={item.type} />
              
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{item.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      item.type === "Alert" ? "bg-rose-50 text-rose-600"
                      : item.type === "Warning" ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-blue-600"
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-650 leading-relaxed max-w-2xl">
                    {item.message}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    {item.time}
                  </span>
                  
                  {/* Tick option to dismiss */}
                  <button
                    onClick={() => dismissNotification(item.id)}
                    className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-450 hover:text-emerald-600 rounded-xl transition-all border border-slate-100 hover:border-emerald-200 active:scale-95 cursor-pointer shadow-sm"
                    title="Mark as read (Dismiss)"
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <Link
                    href={item.link}
                    className="inline-flex items-center justify-center p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100 hover:border-blue-100 active:scale-95 cursor-pointer"
                    title="View details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-black text-slate-900">All Systems Operational</p>
              <p className="text-sm font-medium text-slate-400 mt-1 max-w-sm px-4">
                No active issues found! Stock levels are healthy, and all scheduled service contracts are up to date.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>
            Showing <span className="font-extrabold text-slate-700">{filtered.length}</span> of{" "}
            <span className="font-extrabold text-slate-700">{visibleNotifications.length}</span> active alerts
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {filtered.filter(n => n.type === "Alert").length} Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {filtered.filter(n => n.type === "Warning").length} Warnings
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
