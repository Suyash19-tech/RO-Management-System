import * as React from "react";
import { PhoneCall } from "lucide-react";

interface TechnicianCardProps {
  technician: { name: string; phone: string; photo?: string };
  expectedSlot?: string;
}

export function TechnicianCard({ technician, expectedSlot }: TechnicianCardProps) {
  return (
    <div className="bg-[#0F4C81] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-white/80">Technician Details</h3>
        {expectedSlot && (
          <span className="text-[10px] font-bold bg-[#00B8A9] px-2 py-0.5 rounded-full">{expectedSlot}</span>
        )}
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <img 
          src={technician.photo || "https://ui-avatars.com/api/?name=" + technician.name} 
          alt={technician.name} 
          className="w-14 h-14 rounded-full border-2 border-white/20"
        />
        <div className="flex-1">
          <h4 className="font-bold text-lg">{technician.name}</h4>
          <p className="text-xs text-white/70">Verified Professional</p>
        </div>
        <button className="w-10 h-10 bg-white text-[#0F4C81] rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-md">
          <PhoneCall className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
