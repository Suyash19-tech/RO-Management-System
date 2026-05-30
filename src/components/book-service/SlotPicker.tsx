import * as React from "react";
import { cn } from "@/lib/utils";

interface SlotPickerProps {
  date: string;
  setDate: (d: string) => void;
  slot: string;
  setSlot: (s: string) => void;
}

export function SlotPicker({ date, setDate, slot, setSlot }: SlotPickerProps) {
  // Generate next 4 days for simple date selection
  const dates = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    return {
      full: d.toISOString(),
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate()
    };
  });

  const SLOTS = ["Morning (9-12)", "Afternoon (12-4)", "Evening (4-7)"];

  return (
    <div className="space-y-8">
      {/* Date Selection */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 ml-1">Preferred Date</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x scrollbar-hide">
          {dates.map((d, i) => {
            const isSelected = date === d.full;
            return (
              <button
                key={i}
                onClick={() => setDate(d.full)}
                className={cn(
                  "snap-start flex-shrink-0 w-[4.5rem] py-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                  isSelected ? "border-[#00B8A9] bg-[#00B8A9]/10 text-[#0F4C81]" : "border-slate-100 bg-white text-slate-500"
                )}
              >
                <span className="text-xs font-semibold uppercase">{d.day}</span>
                <span className={cn("text-xl font-bold", isSelected ? "text-[#0F4C81]" : "text-slate-800")}>{d.date}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot Selection */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 ml-1">Preferred Time</h3>
        <div className="grid gap-3">
          {SLOTS.map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left font-semibold transition-all active:scale-95",
                slot === s ? "border-[#00B8A9] bg-[#00B8A9]/10 text-[#0F4C81]" : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
