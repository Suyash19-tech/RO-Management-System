import * as React from "react";

export function NextServiceCard({ nextService }: { nextService: string }) {
  const daysLeft = 18;
  const dateStr = "15 Jun, 2024";

  return (
    <div className="h-full w-full rounded-[2rem] bg-white p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[300px] md:h-[340px]">
      <div>
        <h3 className="text-slate-800 font-bold mb-6 text-sm md:text-base">Next Service Due</h3>
        
        <div className="flex items-baseline gap-2 text-[#2b73f6] mb-1">
          <span className="text-6xl md:text-[80px] leading-none font-bold tracking-tighter">{daysLeft}</span>
        </div>
        <p className="text-slate-500 text-sm font-medium mt-2">Days Left</p>
      </div>
      
      <div className="mt-auto">
        <p className="text-slate-600 font-medium mb-6 text-sm">{dateStr}</p>
        
        <button className="bg-[#2b73f6] text-white px-6 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-[#1f5ca3] transition-colors w-[160px] active:scale-95">
          Book Service
        </button>
      </div>
    </div>
  );
}
