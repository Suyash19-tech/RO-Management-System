import * as React from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(({ className, ...props }, ref) => {
  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-4 font-semibold text-slate-500 border-r border-slate-200 pr-3">+91</div>
      <input
        ref={ref}
        type="tel"
        maxLength={10}
        placeholder="Enter mobile number"
        className={cn(
          "w-full h-14 pl-16 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-lg font-medium outline-none transition-all focus:border-[#0F4C81] focus:bg-white placeholder:text-slate-400",
          className
        )}
        {...props}
      />
    </div>
  );
});
PhoneInput.displayName = "PhoneInput";

export const OTPInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      maxLength={6}
      placeholder="------"
      className={cn(
        "w-full h-14 text-center tracking-[1em] rounded-xl border-2 border-slate-100 bg-slate-50 text-2xl font-bold outline-none transition-all focus:border-[#00B8A9] focus:bg-white placeholder:text-slate-300 placeholder:tracking-normal",
        className
      )}
      {...props}
    />
  );
});
OTPInput.displayName = "OTPInput";
