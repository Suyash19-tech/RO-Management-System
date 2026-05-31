import * as React from "react";
import { CalendarDays, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface ROHeroCardProps {
  model: string;
  installationDate: string;
  warrantyExpiry: string;
  amcStatus: boolean;
  freeServicesUsed: number;
  freeServicesTotal: number;
}

export function ROHeroCard({ model, installationDate, warrantyExpiry, amcStatus, freeServicesUsed, freeServicesTotal }: ROHeroCardProps) {
  const progressPercent = Math.min((freeServicesUsed / freeServicesTotal) * 100, 100);

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden w-full relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full opacity-60 pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h3 className="font-bold text-slate-800 text-[16px]">My RO Overview</h3>
      </div>

      {/* Main Content Row */}
      <div className="flex flex-row items-center px-5 pb-6 gap-5 relative z-10">
        
        {/* Left: Image */}
        <div className="flex-shrink-0 w-[120px] h-[150px] bg-gradient-to-b from-slate-50 to-blue-50/40 rounded-[20px] flex items-center justify-center p-3 border border-slate-100/80 shadow-inner">
          <img
            src="/ro.jpeg"
            alt="RO Unit"
            className="w-full h-full object-contain drop-shadow-xl"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1544474776-904c6005dff3?q=80&w=600&auto=format&fit=crop";
            }}
          />
        </div>

        {/* Right: Specs */}
        <div className="flex flex-col flex-1 py-1">
          
          {/* Model */}
          <div className="mb-5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Model</p>
            <p className="text-[19px] font-black text-slate-800 leading-none">{model}</p>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50/80 flex items-center justify-center flex-shrink-0 text-blue-500 border border-blue-100/50">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Installed On</p>
                <p className="text-[13px] font-bold text-slate-700">
                  {new Date(installationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-50/80 flex items-center justify-center flex-shrink-0 text-indigo-500 border border-indigo-100/50">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Warranty Till</p>
                <p className="text-[13px] font-bold text-slate-700">
                  {new Date(warrantyExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer: AMC & Services */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">AMC</p>
            {amcStatus ? (
              <span className="flex items-center gap-1 bg-green-100 text-green-700 font-bold text-[10px] px-2 py-0.5 rounded border border-green-200 uppercase tracking-wide">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-red-100 text-red-600 font-bold text-[10px] px-2 py-0.5 rounded border border-red-200 uppercase tracking-wide">
                <AlertCircle className="w-3 h-3" /> Expired
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            <span className="font-bold text-blue-600 text-xs">{freeServicesUsed}</span> / {freeServicesTotal} Free Services
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ROHeroCardSkeleton() {
  return <div className="h-72 bg-slate-200 animate-pulse rounded-[24px]"></div>;
}
