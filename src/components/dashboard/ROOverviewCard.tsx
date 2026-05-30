import * as React from "react";

export function ROOverviewCard() {
  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row h-auto md:h-[380px]">
      <div className="w-full md:w-[45%] flex flex-col h-64 md:h-full relative mb-6 md:mb-0">
        <h3 className="text-[17px] font-bold text-slate-800 mb-4 z-10">My RO Overview</h3>
        <div className="flex-1 relative flex items-center justify-center -ml-4 md:-ml-8 -mb-8 mt-4">
          <img 
            src="https://images.unsplash.com/photo-1544474776-904c6005dff3?q=80&w=600&auto=format&fit=crop" 
            alt="RO Render" 
            className="h-[110%] w-full object-contain mix-blend-multiply drop-shadow-2xl"
          />
        </div>
      </div>
      
      <div className="w-full md:w-[55%] flex flex-col justify-center space-y-5 md:space-y-6 md:pl-12 border-t md:border-t-0 pt-6 md:pt-0">
        <div>
          <p className="text-slate-500 text-xs font-medium mb-1">Model</p>
          <p className="text-slate-800 text-[15px] font-semibold">Aquaguard Enhance</p>
        </div>
        
        <div>
          <p className="text-slate-500 text-xs font-medium mb-1">Installation Date</p>
          <p className="text-slate-800 text-[15px] font-semibold">15 Jan, 2023</p>
        </div>
        
        <div>
          <p className="text-slate-500 text-xs font-medium mb-1">Warranty Valid Till</p>
          <p className="text-slate-800 text-[15px] font-semibold">15 Jan, 2026</p>
        </div>
        
        <div>
          <p className="text-slate-500 text-xs font-medium mb-1">AMC Status</p>
          <span className="inline-flex items-center justify-center bg-[#E8F8F0] text-[#10B981] font-bold text-xs px-3.5 py-1.5 rounded-full border border-[#10B981]/20">
            Active
          </span>
        </div>
        
        <div className="pt-2">
          <p className="text-slate-500 text-xs font-medium mb-2">Free Services</p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-800 shrink-0">2 / 4 Used</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-[#2b73f6] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
