import * as React from "react";
import { CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES = [
  { id: "FREE", label: "Free Service", icon: CheckCircle2, desc: "2 Remaining", active: true, color: "text-[#00B8A9]" },
  { id: "AMC", label: "AMC Service", icon: ShieldCheck, desc: "Gold Plan Active", active: true, color: "text-[#0F4C81]" },
  { id: "PAID", label: "Paid Service", icon: Wallet, desc: "Standard Rates Apply", active: true, color: "text-amber-500" },
];

interface ServiceTypeCardProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function ServiceTypeCard({ selected, onSelect }: ServiceTypeCardProps) {
  return (
    <div className="space-y-4">
      {TYPES.map((type) => (
        <button
          key={type.id}
          disabled={!type.active}
          onClick={() => onSelect(type.id)}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95 text-left",
            selected === type.id 
              ? "border-[#00B8A9] bg-[#00B8A9]/5" 
              : "border-slate-100 bg-white hover:border-slate-200",
            !type.active && "opacity-50 grayscale cursor-not-allowed"
          )}
        >
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50", selected === type.id ? 'bg-white shadow-sm' : '')}>
            <type.icon className={cn("w-6 h-6", type.color)} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">{type.label}</h3>
            <p className="text-xs font-medium text-slate-500">{type.desc}</p>
          </div>
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
            selected === type.id ? "border-[#00B8A9] bg-[#00B8A9]" : "border-slate-300"
          )}>
            {selected === type.id && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </button>
      ))}
    </div>
  );
}
