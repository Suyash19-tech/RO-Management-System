import * as React from "react";
import { UserProfile } from "@/lib/api/profile";
import { User, MapPin, Settings, HelpCircle, LogOut, FileText, Smartphone, Bell, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileHeader({ user }: { user: UserProfile }) {
  return (
    <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-6 pt-10 pb-16 rounded-b-[3rem] text-white relative shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
      
      <div className="flex items-center gap-5 relative z-10">
        <div className="relative">
          <div className="w-20 h-20 bg-white/10 rounded-full border-4 border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm shadow-xl">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black">{user.name.charAt(0)}</span>
            )}
          </div>
          <div className="absolute bottom-0 right-1 w-4 h-4 bg-green-400 border-2 border-indigo-900 rounded-full" />
        </div>
        <div>
          <h2 className="text-[22px] font-black leading-tight tracking-wide">{user.name}</h2>
          <p className="text-[13px] text-blue-100 font-medium mb-1.5">{user.phone}</p>
          <span className="text-[10px] font-extrabold bg-white/15 px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md border border-white/10">
            Member since {new Date(user.customerSince).getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[24px] border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 overflow-hidden">
      <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 px-1">{title}</h3>
      <div className="space-y-1.5">
        {children}
      </div>
    </div>
  );
}

export function ActionRow({ icon: Icon, label, value, badge, onClick, hideArrow, dangerous }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3.5 rounded-2xl transition-all active:scale-[0.98]",
        dangerous ? "hover:bg-red-50/50 text-red-600 bg-red-50/30 border border-red-100" : "hover:bg-slate-50 text-slate-700 bg-transparent"
      )}
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <div className={cn(
          "w-10 h-10 rounded-[14px] shrink-0 flex items-center justify-center shadow-sm", 
          dangerous ? "bg-red-100/80 text-red-500" : "bg-blue-50/50 text-blue-500 border border-blue-100/50"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-start text-left flex-1 min-w-0 pr-2">
          <span className={cn("font-bold text-[14px] truncate w-full", dangerous && "text-red-600")}>{label}</span>
          {value && <span className="text-[13px] font-medium text-slate-500 truncate w-full mt-0.5">{value}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wider">{badge}</span>}
        {!hideArrow && (
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </button>
  );
}

export function ToggleRow({ icon: Icon, label, enabled, onToggle }: any) {
  return (
    <div className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-slate-50 text-slate-600 border border-slate-100 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-[14px] text-slate-700">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-14 h-8 rounded-full transition-all duration-300 relative shadow-inner border",
          enabled ? "bg-emerald-500 border-emerald-600" : "bg-slate-200 border-slate-300"
        )}
      >
        <span className={cn(
          "absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md",
          enabled ? "translate-x-6" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}
