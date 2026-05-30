import * as React from "react";
import { UserProfile } from "@/lib/api/profile";
import { User, MapPin, Settings, HelpCircle, LogOut, FileText, Smartphone, Bell, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileHeader({ user }: { user: UserProfile }) {
  return (
    <div className="bg-[#0F4C81] p-6 pb-12 rounded-b-[2.5rem] text-white relative shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white/20 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold">{user.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-white/80">{user.phone}</p>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">
            Member since {new Date(user.customerSince).getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 overflow-hidden">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export function ActionRow({ icon: Icon, label, value, onClick, hideArrow, dangerous }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.98]",
        dangerous ? "hover:bg-red-50 text-red-600" : "hover:bg-slate-50 text-slate-700"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", dangerous ? "bg-red-100" : "bg-slate-100 text-slate-500")}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-medium text-slate-400">{value}</span>}
        {!hideArrow && (
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </button>
  );
}

export function ToggleRow({ icon: Icon, label, enabled, onToggle }: any) {
  return (
    <div className="w-full flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500">
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-semibold text-sm text-slate-700">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-11 h-6 rounded-full transition-colors relative",
          enabled ? "bg-[#00B8A9]" : "bg-slate-200"
        )}
      >
        <span className={cn(
          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
          enabled ? "translate-x-5" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}
