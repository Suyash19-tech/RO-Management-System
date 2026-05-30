import * as React from "react";
import { Calendar, Package, FileText, ShieldPlus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "book", title: "Book Service", sub: "Schedule service", href: "/book-service", icon: Calendar, color: "text-[#2b73f6]", bg: "bg-[#2b73f6]/10", cardBg: "bg-[#f4f8ff]" },
  { id: "ro", title: "My RO", sub: "View Details", href: "/my-ro", icon: Package, color: "text-[#10B981]", bg: "bg-[#10B981]/10", cardBg: "bg-[#f2fbf6]" },
  { id: "history", title: "History", sub: "Past services", href: "/history", icon: FileText, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", cardBg: "bg-[#f7f5fe]" },
  { id: "amc", title: "Warranty", sub: "AMC status", href: "/amc", icon: ShieldPlus, color: "text-[#D97706]", bg: "bg-[#D97706]/10", cardBg: "bg-[#fffaf2]" },
];

export function QuickActionGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {ACTIONS.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-3xl transition-transform hover:scale-[1.02] active:scale-[0.98] aspect-square w-full shadow-sm overflow-hidden",
            action.cardBg
          )}
        >
          <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-sm mb-2", action.bg)}>
            <action.icon className={cn("w-5 h-5 md:w-6 md:h-6", action.color)} strokeWidth={2.2} />
          </div>
          <h4 className="font-bold text-slate-800 text-[13px] md:text-[15px] mb-0.5 text-center leading-tight">{action.title}</h4>
          <p className="text-slate-500 text-[10px] md:text-xs font-medium text-center">{action.sub}</p>
        </Link>
      ))}
    </div>
  );
}
