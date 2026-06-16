"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { 
  Home, 
  Users, 
  Wrench, 
  Calendar,
  ClipboardList,
  Package,
  ShoppingCart,
  CreditCard,
  Bell,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Boxes,
  Briefcase
} from "lucide-react";

interface SidebarGroup {
  id: string;
  name: string;
  icon: any;
  items: {
    name: string;
    href: string;
    icon: any;
  }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    id: "analytics",
    name: "Analytics & Finance",
    icon: BarChart3,
    items: [
      { name: "Command Center", href: "/dashboard", icon: Home },
      { name: "Sales & Orders", href: "/dashboard/sales", icon: ShoppingCart },
      { name: "Expense Outflows", href: "/dashboard/expenses", icon: CreditCard },
      { name: "Staff Technicians", href: "/dashboard/technicians", icon: Users },
    ]
  },
  {
    id: "inventory",
    name: "Inventory Control",
    icon: Boxes,
    items: [
      { name: "Stock Levels", href: "/dashboard/inventory", icon: Package },
      { name: "Product Catalog", href: "/dashboard/products", icon: Package },
    ]
  },
  {
    id: "clients",
    name: "Customer Relations",
    icon: Users,
    items: [
      { name: "Client Directory", href: "/dashboard/customers", icon: Users },
      { name: "Service Contracts (AMC)", href: "/dashboard/amc", icon: Calendar },
      { name: "Service Reminders", href: "/dashboard/reminders", icon: Bell },
    ]
  },
  {
    id: "operations",
    name: "Field Operations",
    icon: Briefcase,
    items: [
      { name: "New Installations", href: "/dashboard/installations", icon: Wrench },
      { name: "Repair Requests & Appointments", href: "/dashboard/services", icon: ClipboardList },
      { name: "Service Schedule", href: "/dashboard/appointments", icon: Calendar },
    ]
  }
];

export function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar?: () => void }) {
  const pathname = usePathname();
  const [dismissedTrigger, setDismissedTrigger] = useState(0);

  const { data: rawNotifications, mutate: mutateNotifications } = useSWR<any[]>("/api/notifications", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const getDismissedIds = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("dismissed_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const dismissed = getDismissedIds();
  const notificationCount = Array.isArray(rawNotifications)
    ? rawNotifications.filter((n: any) => !dismissed.includes(n.id)).length
    : 0;

  // Expanded state for collapsible groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    analytics: true,
    inventory: false,
    clients: false,
    operations: false,
  });

  // Automatically expand group containing active route on mount
  useEffect(() => {
    sidebarGroups.forEach(group => {
      const hasActiveChild = group.items.some(item => item.href === pathname);
      if (hasActiveChild) {
        setExpandedGroups(prev => ({
          ...prev,
          [group.id]: true
        }));
      }
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Sync count on local storage triggers and custom event
  useEffect(() => {
    const handleStorageChange = () => {
      setDismissedTrigger(prev => prev + 1);
      mutateNotifications();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notifications_updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("notifications_updated", handleStorageChange);
    };
  }, [mutateNotifications]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed md:sticky top-0 left-0 z-50 h-[100dvh] bg-[#0B1B3D] text-white flex flex-col flex-shrink-0 overflow-y-auto transition-transform duration-300 md:transition-all ${
          isOpen ? 'translate-x-0 w-[85vw] sm:w-80 md:w-64' : '-translate-x-full md:translate-x-0 w-[85vw] sm:w-80 md:w-0'
        }`}
      >
      {/* Brand Logo Header */}
      <div className="p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative flex items-center justify-center rounded-full bg-white overflow-hidden shadow-sm shrink-0">
            <img 
              src="/Sardarji_RO_logo.png" 
              alt="Sardarji RO Logo" 
              className="w-[115%] h-[115%] object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-widest leading-tight">SARDARJI</span>
            <span className="text-lg font-bold text-[#00B8A9] tracking-widest leading-tight">RO</span>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 px-4 pb-6 space-y-2.5 mt-2">
        {sidebarGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups[group.id];
          const hasActiveChild = group.items.some(item => item.href === pathname);

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header Dropdown Trigger */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer outline-none ${
                  hasActiveChild 
                    ? "text-[#00B8A9]" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GroupIcon className="w-5 h-5" />
                  <span>{group.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>

              {/* Collapsible Sub-Items */}
              {isExpanded && (
                <div className="space-y-0.5 pl-3 border-l border-slate-700/50 ml-5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                          isActive 
                            ? "bg-[#2563EB] text-white shadow-sm" 
                            : "text-slate-350 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Root-Level Standalone Item: Notifications */}
        <div className="pt-2 border-t border-slate-700/50 mt-4 space-y-1">
          <Link
            href="/dashboard/notifications"
            className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              pathname === "/dashboard/notifications"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span>Notifications Alerts</span>
            </div>
            {notificationCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                {notificationCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </div>
    </>
  );
}
