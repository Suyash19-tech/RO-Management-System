"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  Wrench, 
  Settings, 
  Calendar,
  ClipboardList,
  Package,
  ShoppingCart,
  PhoneCall,
  MessageSquare,
  BarChart2,
  CreditCard,
  Bell
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Installations", href: "/dashboard/installations", icon: Wrench },
  { name: "Services", href: "/dashboard/services", icon: ClipboardList },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "AMC Management", href: "/dashboard/amc", icon: Settings },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Sales & Orders", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "Leads & Enquiries", href: "/dashboard/leads", icon: PhoneCall },
  { name: "Support / Queries", href: "/dashboard/support", icon: MessageSquare },
  { name: "Technicians", href: "/dashboard/technicians", icon: Users },
  { name: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart2 },
  { name: "Expenses", href: "/dashboard/expenses", icon: CreditCard },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();

  return (
    <div className={`h-screen bg-[#0B1B3D] text-white flex flex-col flex-shrink-0 sticky top-0 overflow-y-auto transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}>
      <div className="p-6 flex items-center gap-3 shrink-0">
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

      <nav className="flex-1 px-4 pb-6 space-y-1 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.name === "Dashboard");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[#2563EB] text-white shadow-md" 
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
