import * as React from "react";
import { cn } from "@/lib/utils";

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppShell({ className, children, ...props }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center sm:p-4">
      {/* 
        Mobile First: Full width/height on mobile.
        Desktop: Constrained to a mobile-sized card (max-w-md), simulating a native app feel.
      */}
      <div 
        className={cn(
          "w-full h-[100dvh] sm:h-auto sm:min-h-[800px] sm:max-w-[430px]",
          "bg-white sm:rounded-[2rem] sm:shadow-2xl overflow-hidden relative flex flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
