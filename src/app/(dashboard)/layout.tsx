"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, Wrench, History, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingBubbles } from "@/components/layout/FloatingBubbles";
import { CustomerNotifications } from "@/components/layout/CustomerNotifications";

const MOBILE_NAV = [
  { label: "Home", href: "/home", icon: LayoutDashboard },
  { label: "My RO", href: "/my-ro", icon: Settings },
  { label: "Book", href: "/book-service", icon: Wrench },
  { label: "History", href: "/history", icon: History },
  { label: "Profile", href: "/profile", icon: User },
];



export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const profile = localStorage.getItem("customer_profile");
    if (!profile || profile === "null" || profile === "undefined") {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F8FAFC] font-sans w-full relative">
      <FloatingBubbles />
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Using a text logo for "Customer App (Web)" or the actual logo image if available */}
          <div className="flex items-center gap-3">
             <img src="/Sardarji_RO_logo.png" alt="Sardarji RO Logo" className="w-auto h-12 md:h-16 object-contain" />
             <span className="hidden md:block font-bold text-[#185A9D] text-xl border-l-2 border-slate-200 pl-3 ml-1">Customer App</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <CustomerNotifications />
          <button onClick={() => router.push('/profile')} className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white font-bold shadow-md hover:opacity-90 transition-opacity">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto px-3 md:px-6 pb-32 md:pb-16 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-[70px] bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-safe z-50">
        {MOBILE_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-[#2b73f6]" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
