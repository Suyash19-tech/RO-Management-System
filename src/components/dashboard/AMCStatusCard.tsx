import * as React from "react";
import { ShieldCheck, ArrowRight, ShieldAlert } from "lucide-react";

interface AMCStatusCardProps {
  active: boolean;
  details?: {
    planName: string;
    expiryDate: string;
    daysRemaining: number;
  };
}

export function AMCStatusCard({ active, details }: AMCStatusCardProps) {
  if (!active) {
    return (
      <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">No Active AMC</h3>
            <p className="text-xs text-slate-500">Protect your RO today</p>
          </div>
        </div>
        <button className="text-[#0F4C81] font-bold text-sm bg-slate-50 px-4 py-2 rounded-lg">Buy Now</button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#00B8A9]/10 to-[#0F4C81]/5 border border-[#00B8A9]/20 rounded-2xl p-5 relative overflow-hidden">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#00B8A9]" />
            <h3 className="font-bold text-slate-900">{details?.planName}</h3>
          </div>
          <p className="text-sm text-slate-600 mb-3">Expires in {details?.daysRemaining} days</p>
          <button className="text-sm font-bold text-[#0F4C81] flex items-center gap-1 hover:underline">
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-xs font-bold text-[#00B8A9]">ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

export function AMCStatusCardSkeleton() {
  return <div className="h-28 bg-slate-200 animate-pulse rounded-2xl"></div>;
}
