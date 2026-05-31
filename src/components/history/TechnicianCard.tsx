import * as React from "react";
import { PhoneCall } from "lucide-react";

interface TechnicianCardProps {
  technician: { name: string; phone: string; photo?: string };
  expectedSlot?: string;
}

export function TechnicianCard({ technician, expectedSlot }: TechnicianCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-[24px] shadow-lg relative overflow-hidden border border-slate-700/50">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-full pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <h3 className="text-[11px] uppercase tracking-widest font-extrabold text-slate-400">Technician Details</h3>
        {expectedSlot && (
          <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-widest backdrop-blur-sm">
            {expectedSlot}
          </span>
        )}
      </div>

      <div className="flex items-center gap-5 relative z-10">
        <div className="relative">
          <img 
            src={technician.photo || "https://ui-avatars.com/api/?name=" + technician.name} 
            alt={technician.name} 
            className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover shadow-lg bg-slate-800"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-black text-[20px] leading-tight mb-1 text-white">{technician.name}</h4>
          <p className="text-[12px] font-medium text-slate-400">Verified Professional</p>
        </div>
        
        <a 
          href={`tel:${technician.phone}`} 
          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10"
        >
          <PhoneCall className="w-5 h-5 fill-current" />
        </a>
      </div>
    </div>
  );
}
