import * as React from "react";
import { CheckCircle2, Navigation, ArrowRight } from "lucide-react";

interface SuccessStateProps {
  ticketId: string;
  expectedTime: string;
  onTrack: () => void;
  onHome: () => void;
}

export function SuccessState({ ticketId, expectedTime, onTrack, onHome }: SuccessStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 h-full bg-white">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
        <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={2.5} />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Request Created!</h2>
      <p className="text-slate-500 mb-8 max-w-[250px]">
        Our team has received your service request and will assign a technician soon.
      </p>

      <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-slate-500">Ticket ID</span>
          <span className="font-bold text-slate-900">{ticketId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Expected Response</span>
          <span className="font-bold text-[#00B8A9]">{expectedTime}</span>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button 
          onClick={onTrack}
          className="w-full bg-[#0F4C81] text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Navigation className="w-5 h-5" /> Track Request
        </button>
        <button 
          onClick={onHome}
          className="w-full bg-white text-[#0F4C81] border-2 border-slate-100 py-4 rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
