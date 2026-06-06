"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  linkText?: string;
  linkHref?: string;
}

export function StatCard({
  title,
  value,
  trend,
  trendDirection,
  icon: Icon,
  iconBgColor,
  iconColor,
  linkText,
  linkHref,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className={`flex items-center gap-1 text-sm font-semibold ${trendDirection === "up" ? "text-emerald-600" : "text-rose-600"}`}>
          {trendDirection === "up" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {trend}
        </div>
        {linkText && (
          <a href={linkHref || "#"} className="text-sm font-medium text-[#2563EB] hover:underline">
            {linkText}
          </a>
        )}
      </div>
    </div>
  );
}
