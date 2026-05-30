import * as React from "react";

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
    <div className="bg-white rounded-[20px] border border-slate-100 shadow-md overflow-hidden w-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-bold text-slate-800 text-[15px]">My RO Overview</h3>
      </div>

      {/* Main Content Row */}
      <div className="flex flex-row items-stretch px-4 pb-5 gap-4">

        {/* Left: Image in a contained soft bg box */}
        <div className="flex-shrink-0 w-[130px] min-h-[160px] bg-gradient-to-b from-slate-50 to-blue-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100">
          <img
            src="/ro.jpeg"
            alt="RO Unit"
            className="w-full h-full max-h-[150px] object-contain drop-shadow-lg"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1544474776-904c6005dff3?q=80&w=600&auto=format&fit=crop";
            }}
          />
        </div>

        {/* Right: Specs */}
        <div className="flex flex-col justify-between flex-1 py-1">
          
          {/* Model */}
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Model</p>
            <p className="text-[15px] font-black text-slate-900 leading-tight">{model}</p>
          </div>

          {/* Installed On */}
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Installed On</p>
            <p className="text-[13px] font-bold text-[#0F4C81]">
              {new Date(installationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Warranty */}
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Warranty Till</p>
            <p className="text-[13px] font-bold text-slate-700">
              {new Date(warrantyExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* AMC Badge */}
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-1">AMC Status</p>
            {amcStatus ? (
              <span className="inline-block bg-green-50 text-green-600 font-black text-[10px] px-3 py-1 rounded-full border border-green-200">
                ● ACTIVE
              </span>
            ) : (
              <span className="inline-block bg-red-50 text-red-500 font-black text-[10px] px-3 py-1 rounded-full border border-red-200">
                ● EXPIRED
              </span>
            )}
          </div>

          {/* Free Services Progress */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Free Services</p>
              <p className="text-[11px] font-bold text-[#0052D4]">{freeServicesUsed}/{freeServicesTotal}</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#0052D4] to-[#00c6ff] h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function ROHeroCardSkeleton() {
  return <div className="h-64 bg-slate-200 animate-pulse rounded-[20px]"></div>;
}
