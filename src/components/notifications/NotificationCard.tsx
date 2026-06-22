import * as React from "react";
import { NotificationType, Notification } from "@/lib/api/notifications";
import { Wrench, ShieldCheck, Bell, Sparkles, Server, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "SERVICE": return <Wrench className="w-5 h-5 text-blue-500" />;
    case "AMC": return <ShieldCheck className="w-5 h-5 text-[#00B8A9]" />;
    case "PROMOTION": return <Sparkles className="w-5 h-5 text-amber-500" />;
    case "SYSTEM": return <Server className="w-5 h-5 text-slate-500" />;
    case "REMINDER": return <Bell className="w-5 h-5 text-red-500" />;
  }
};

const getBg = (type: NotificationType) => {
  switch (type) {
    case "SERVICE": return "bg-blue-50 border-blue-100";
    case "AMC": return "bg-[#00B8A9]/10 border-[#00B8A9]/20";
    case "PROMOTION": return "bg-amber-50 border-amber-100";
    case "SYSTEM": return "bg-slate-100 border-slate-200";
    case "REMINDER": return "bg-red-50 border-red-100";
  }
};

export function NotificationCard({ notification, onRead }: { notification: Notification, onRead: (id: string) => void }) {
  return (
    <div 
      className={cn(
        "relative p-5 rounded-2xl border transition-all",
        !notification.read ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-transparent opacity-70"
      )}
    >
      {!notification.read && (
        <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-red-500 rounded-full" />
      )}
      
      <div className="flex gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border", getBg(notification.type))}>
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 pr-4">
          <h4 className={cn("font-bold mb-1", !notification.read ? "text-slate-900" : "text-slate-700")}>
            {notification.title}
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">{notification.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {new Date(notification.timestamp || notification.createdAt || Date.now()).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            {!notification.read && (
              <button 
                onClick={() => onRead(notification.id)}
                className="text-[10px] font-bold text-[#0F4C81] flex items-center gap-1 hover:underline active:scale-95"
              >
                <Check className="w-3 h-3" /> Mark Read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Bell className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
      <p className="text-sm text-slate-500 max-w-[250px]">
        We'll notify you when there are updates about your service or AMC.
      </p>
    </div>
  );
}
