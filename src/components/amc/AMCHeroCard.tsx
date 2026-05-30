import * as React from "react";
import { ShieldCheck, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AMCHeroCardProps {
  planName: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  expiryDate: string;
  daysRemaining: number;
}

export function AMCHeroCard({ planName, status, expiryDate, daysRemaining }: AMCHeroCardProps) {
  const isExpiring = status === "EXPIRING_SOON" || daysRemaining <= 45;
  const isExpired = status === "EXPIRED";

  const getTheme = () => {
    if (isExpired) return "bg-slate-100 text-slate-800 border-slate-200";
    if (isExpiring) return "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-orange-500/30";
    return "bg-gradient-to-br from-[#0F4C81] to-[#0a355c] text-white shadow-[#0F4C81]/30";
  };

  const getIcon = () => {
    if (isExpired) return <AlertCircle className="w-10 h-10 text-slate-400" />;
    if (isExpiring) return <Clock className="w-10 h-10 text-white/90" />;
    return <ShieldCheck className="w-10 h-10 text-[#00B8A9]" />;
  };

  return (
    <div className={cn("p-6 rounded-[2rem] shadow-xl relative overflow-hidden transition-all", getTheme())}>
      {/* Background Graphic */}
      <div className="absolute -right-12 -bottom-12 opacity-10">
        <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="50" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            {getIcon()}
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block mb-1">Status</span>
            <span className={cn(
              "text-xs font-bold px-3 py-1 rounded-full",
              isExpired ? "bg-red-100 text-red-600" : "bg-white/20 text-white"
            )}>
              {isExpired ? "EXPIRED" : isExpiring ? "EXPIRING SOON" : "ACTIVE"}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1">{planName}</h2>
        <p className="text-sm opacity-80 mb-6">Premium Care Protection</p>

        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Valid Until</p>
            <p className="text-sm font-bold">{new Date(expiryDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Remaining</p>
            <p className="text-lg font-black">{daysRemaining} Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
