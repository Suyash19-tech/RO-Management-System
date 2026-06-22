"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, ArrowRight } from "lucide-react";
import { fetchTickets } from "@/lib/api/history";

interface CustomerNotification {
  id: string;
  type: "Info" | "Success";
  title: string;
  message: string;
  link: string;
  date: number; // timestamp
}

// Synthesize a cute, professional "pop/bloop" notification sound
const playCutePop = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    // Start at a lower frequency and quickly pitch up for a "pop" character
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    // Quick attack and smooth, fast decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio context errors (e.g. if autoplay policy blocks it initially)
  }
};

export function CustomerNotifications() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      // 1. Fetch real notifications from the backend
      let realNotifs: CustomerNotification[] = [];
      try {
        let phone = "9876543210";
        if (typeof window !== "undefined") {
          const profile = localStorage.getItem("customer_profile");
          if (profile) {
            const parsed = JSON.parse(profile);
            if (parsed.phone) phone = parsed.phone;
          }
        }
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
        const res = await fetch(`${adminUrl}/api/customer-notifications?phone=${phone}`);
        if (res.ok) {
          const data = await res.json();
          realNotifs = data.map((n: any) => ({
            id: n.id,
            type: "Info",
            title: n.title,
            message: n.message,
            link: "/notifications", // Link to full notifications page if you have one, or just "#"
            date: new Date(n.createdAt).getTime(),
          }));
        }
      } catch (e) {}

      // 2. Fetch ticket-based notifications
      const tickets = await fetchTickets();
      const generated: CustomerNotification[] = [...realNotifs];

      if (tickets && tickets.length > 0) {
        tickets.forEach((t) => {
          if (!t || !t.rawId) return;
          if (t.status === "ASSIGNED" || t.status === "ACCEPTED" || t.status === "IN_PROGRESS") {
            generated.push({
              id: `confirmed-${t.rawId}`,
              type: "Info",
              title: "Service Confirmed!",
              message: `Tech Assigned: ${t.technician?.name || 'Our Technician'}`,
              link: `/history/${t.id}`,
              date: new Date(t.createdAt).getTime(),
            });
          }
          if (t.status === "COMPLETED") {
            generated.push({
              id: `invoice-${t.rawId}`,
              type: "Success",
              title: "Invoice Ready",
              message: "Service completed. Tap to view.",
              link: `/history/${t.id}`,
              date: t.completedAt ? new Date(t.completedAt).getTime() : Date.now(),
            });
          }
        });
      }

      // Sort newest first
      generated.sort((a, b) => b.date - a.date);

      if (typeof window !== "undefined") {
        const dismissed = JSON.parse(localStorage.getItem("cust_dismissed_notifs") || "[]");
        const visible = generated.filter((n) => !dismissed.includes(n.id));
        
        // Check for strictly *new* notifications to play sound
        const knownIds = JSON.parse(localStorage.getItem("cust_known_notifs") || "[]");
        let hasNew = false;
        const updatedKnownIds = [...knownIds];

        visible.forEach(n => {
          if (!knownIds.includes(n.id)) {
            hasNew = true;
            updatedKnownIds.push(n.id);
          }
        });

        if (hasNew) {
          localStorage.setItem("cust_known_notifs", JSON.stringify(updatedKnownIds));
          playCutePop();
        }

        setNotifications(visible);
      }
    } catch (e) {
      // Silently fail — notifications are non-critical
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const dismissNotification = (id: string) => {
    const dismissed = JSON.parse(localStorage.getItem("cust_dismissed_notifs") || "[]");
    dismissed.push(id);
    localStorage.setItem("cust_dismissed_notifs", JSON.stringify(dismissed));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    const dismissed = JSON.parse(localStorage.getItem("cust_dismissed_notifs") || "[]");
    const allIds = notifications.map(n => n.id);
    const updated = [...new Set([...dismissed, ...allIds])];
    localStorage.setItem("cust_dismissed_notifs", JSON.stringify(updated));
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all text-slate-600 ${isOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
      >
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm">
            {notifications.length}
          </span>
        )}
        <Bell className="w-6 h-6" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="fixed top-[70px] left-4 right-4 md:absolute md:top-auto md:left-auto md:right-0 md:mt-3 md:w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-slate-900">Updates</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {notifications.length} New
              </span>
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={dismissAll}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div key={item.id} className="p-4 flex gap-3 hover:bg-slate-50 transition-colors group relative">
                  <div className="mt-1 shrink-0">
                    {item.type === "Success" ? (
                      <span className="flex w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    ) : (
                      <span className="flex w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                    )}
                  </div>
                  <Link href={item.link} onClick={() => setIsOpen(false)} className="flex-1 min-w-0 pr-8 block">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.message}</p>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      dismissNotification(item.id);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-50 hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 px-6 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-sm font-extrabold text-slate-800">You're all caught up!</p>
                <p className="text-xs text-slate-400 mt-1">We'll notify you when your service updates.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
