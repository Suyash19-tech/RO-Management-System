import * as React from "react";
import { Wrench, PackagePlus, RefreshCcw, FileText } from "lucide-react";

interface TimelineCardProps {
  timeline: Array<{
    id: string;
    type: "INSTALLATION" | "SERVICE" | "FILTER_REPLACEMENT" | "AMC_RENEWAL";
    title: string;
    date: string;
    description: string;
  }>;
}

export function TimelineCard({ timeline }: TimelineCardProps) {
  if (timeline.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "INSTALLATION": return <PackagePlus className="w-4 h-4 text-purple-500" />;
      case "FILTER_REPLACEMENT": return <RefreshCcw className="w-4 h-4 text-blue-500" />;
      case "AMC_RENEWAL": return <FileText className="w-4 h-4 text-green-500" />;
      default: return <Wrench className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-6">Service Timeline</h3>
      
      <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
        {timeline.map((item, index) => (
          <div key={item.id} className="relative pl-6">
            <div className="absolute -left-[13px] top-0 bg-white border-2 border-slate-200 p-1.5 rounded-full z-10 shadow-sm">
              {getIcon(item.type)}
            </div>
            
            <div className="-mt-1">
              <h4 className="font-semibold text-sm text-slate-800">{item.title}</h4>
              <span className="text-[10px] font-medium text-slate-400 block mb-1">
                {new Date(item.date).toLocaleDateString()}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelineCardSkeleton() {
  return <div className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>;
}
