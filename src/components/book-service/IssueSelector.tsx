import * as React from "react";
import { Droplet, Activity, Wrench, Volume2, ShieldAlert, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ISSUES = [
  { id: "Water Taste Problem", icon: Droplet },
  { id: "Low Water Flow", icon: Activity },
  { id: "Leakage", icon: ShieldAlert },
  { id: "Noise Issue", icon: Volume2 },
  { id: "Filter Replacement", icon: Sparkles },
  { id: "General Service", icon: Wrench },
  { id: "Other", icon: Plus },
];

interface IssueSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function IssueSelector({ selected, onSelect }: IssueSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ISSUES.map((issue) => (
        <button
          key={issue.id}
          onClick={() => onSelect(issue.id)}
          className={cn(
            "p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all active:scale-95",
            selected === issue.id 
              ? "border-[#00B8A9] bg-[#00B8A9]/10 text-[#0F4C81]" 
              : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
          )}
        >
          <issue.icon className={cn("w-7 h-7", selected === issue.id ? "text-[#00B8A9]" : "text-slate-400")} />
          <span className="text-xs font-semibold text-center leading-tight">
            {issue.id}
          </span>
        </button>
      ))}
    </div>
  );
}
