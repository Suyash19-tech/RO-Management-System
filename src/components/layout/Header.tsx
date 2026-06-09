"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Search, Menu, AlertTriangle, AlertCircle, Info, ChevronRight, LogOut, Check } from "lucide-react";

interface Notification {
  id: string;
  type: "Alert" | "Warning" | "Info" | "Success";
  title: string;
  message: string;
  time: string;
  link: string;
  read: boolean;
}

// Synthesize a cute, professional "pop/bloop" notification sound
const playCutePop = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      
      const dismissed = getDismissedIds();
      const visible = data.filter((n: any) => !dismissed.includes(n.id));
      
      if (typeof window !== "undefined") {
        const knownIds = JSON.parse(localStorage.getItem("admin_known_notifs") || "[]");
        let hasNew = false;
        const updatedKnownIds = [...knownIds];
        
        visible.forEach((n: any) => {
          if (!knownIds.includes(n.id)) {
            hasNew = true;
            updatedKnownIds.push(n.id);
          }
        });

        if (hasNew) {
          localStorage.setItem("admin_known_notifs", JSON.stringify(updatedKnownIds));
          playCutePop();
        }
      }
      
      setNotifications(visible);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds to keep alerts live
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync state whenever storage event fires, custom event fires, or dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSync = () => fetchNotifications();
    window.addEventListener("storage", handleSync);
    window.addEventListener("notifications_updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("notifications_updated", handleSync);
    };
  }, []);

  // Close dropdown on click outside
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

  const handleDismissSingle = (id: string) => {
    const dismissed = getDismissedIds();
    const updated = [...dismissed, id];
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
    setNotifications(prev => prev.filter(n => n.id !== id));
    window.dispatchEvent(new Event("notifications_updated"));
  };

  const dismissAll = () => {
    const dismissed = getDismissedIds();
    const allIds = notifications.map(n => n.id);
    const updated = [...new Set([...dismissed, ...allIds])];
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
    setNotifications([]);
    window.dispatchEvent(new Event("notifications_updated"));
  };

  const activeCount = notifications.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-5">
        
        {/* Notifications Popover */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2 rounded-xl text-slate-500 hover:text-slate-900 transition-all ${
              isOpen ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50"
            }`}
          >
            <Bell className="w-5 h-5" />
            {activeCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                {activeCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="fixed top-[72px] left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-3 sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-3 duration-250">
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">System Alerts</h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {activeCount > 0 ? `${activeCount} items require your attention` : "All systems normal"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {activeCount > 0 && (
                    <button 
                      onClick={dismissAll}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <Link 
                    href="/dashboard/notifications" 
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View All
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-slate-50 max-h-[350px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex gap-3 hover:bg-slate-50 transition-colors block text-left group/item relative"
                    >
                      <div className="mt-1 shrink-0">
                        {item.type === "Alert" && <span className="flex w-2 h-2 rounded-full bg-rose-500" />}
                        {item.type === "Warning" && <span className="flex w-2 h-2 rounded-full bg-amber-500" />}
                        {item.type === "Info" && <span className="flex w-2 h-2 rounded-full bg-blue-500" />}
                        {item.type === "Success" && <span className="flex w-2 h-2 rounded-full bg-emerald-500" />}
                      </div>
                      
                      <Link
                        href={item.link}
                        onClick={() => setIsOpen(false)}
                        className="flex-1 min-w-0 pr-8 block"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-extrabold text-slate-900 truncate">{item.title}</p>
                          <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{item.time}</span>
                        </div>
                        <p className="text-xs text-slate-650 mt-0.5 leading-normal line-clamp-2">
                          {item.message}
                        </p>
                      </Link>

                      {/* Instant Dismiss Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDismissSingle(item.id);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg border border-slate-100 hover:border-emerald-200 text-slate-400 transition-all md:opacity-0 md:group-hover/item:opacity-100 active:scale-95 cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 px-4 text-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      ✓
                    </div>
                    <p className="text-xs font-extrabold text-slate-800">No Active Notifications</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                      All stocks are full, and services are fully caught up.
                    </p>
                  </div>
                )}
              </div>

              {notifications.length > 5 && (
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 text-center block text-xs font-bold text-slate-600 hover:text-slate-900 border-t border-slate-100 flex items-center justify-center gap-1 transition-colors"
                >
                  See all {notifications.length} alerts <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        {/* Dynamic Premium Logout Button on Left of Admin Info */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-250 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=2563EB&color=fff" 
              alt="Admin Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Admin</span>
            <svg className="w-4 h-4 text-slate-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      {/* Custom Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-0">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Ready to leave?</h3>
              <p className="text-slate-500 text-sm font-medium">
                Are you sure you want to logout of the admin portal? You will need to sign in again to access the dashboard.
              </p>
            </div>
            <div className="p-6 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
                className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
