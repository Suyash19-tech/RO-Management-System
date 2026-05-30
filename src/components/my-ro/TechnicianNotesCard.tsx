import * as React from "react";
import { MessageSquareText } from "lucide-react";

interface TechnicianNotesCardProps {
  notes: string[];
}

export function TechnicianNotesCard({ notes }: TechnicianNotesCardProps) {
  if (notes.length === 0) return null;

  return (
    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-amber-800">
        <MessageSquareText className="w-5 h-5" />
        <h3 className="font-bold">Technician Notes</h3>
      </div>
      
      <ul className="space-y-3">
        {notes.map((note, index) => (
          <li key={index} className="flex gap-2">
            <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <p className="text-xs font-medium text-amber-900/80 leading-relaxed">{note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TechnicianNotesCardSkeleton() {
  return <div className="h-24 bg-slate-200 animate-pulse rounded-2xl"></div>;
}
