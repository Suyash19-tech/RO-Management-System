import * as React from "react";
import { cn } from "@/lib/utils";

export const PrimaryButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "w-full bg-[#0F4C81] text-white rounded-xl py-4 font-semibold text-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
PrimaryButton.displayName = "PrimaryButton";

export const SecondaryButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "w-full bg-white text-[#0F4C81] border-2 border-[#0F4C81]/10 rounded-xl py-4 font-semibold text-lg transition-all active:scale-[0.98] hover:bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SecondaryButton.displayName = "SecondaryButton";
