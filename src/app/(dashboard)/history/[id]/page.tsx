"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchTicketById, Ticket } from "@/lib/api/history";

import { StatusTracker } from "@/components/history/StatusTracker";
import { TechnicianCard } from "@/components/history/TechnicianCard";
import { TicketTimeline } from "@/components/history/TicketTimeline";

export default function TicketDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTicketById(params.id as string).then((res) => {
        setTicket(res);
        setLoading(false);
      });
    }
  }, [params.id]);

  if (loading) {
    return <div className="p-6">Loading details...</div>;
  }

  if (!ticket) {
    return <div className="p-6">Ticket not found.</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as const;

  return (
    <div className="flex-1 h-full overflow-y-auto pb-20 relative">
      {/* Header */}
      <div className="pt-6 pb-4 px-3 sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-md z-20 flex items-center gap-1">
        <button 
          onClick={() => router.back()}
          className="p-1.5 hover:bg-slate-200 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{ticket.id}</span>
          <h1 className="text-[16px] font-bold text-slate-900 leading-tight">{ticket.issueType}</h1>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 space-y-4 mt-1"
      >
        <motion.div variants={item}>
          <StatusTracker currentStatus={ticket.status} />
        </motion.div>

        {ticket.technician && ticket.status !== 'COMPLETED' && (
          <motion.div variants={item}>
            <TechnicianCard technician={ticket.technician} expectedSlot={ticket.scheduledSlot} />
          </motion.div>
        )}

        {ticket.status === 'COMPLETED' && (
          <motion.div variants={item} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 p-6 rounded-[24px] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2.5 text-emerald-700 mb-3 relative z-10">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-bold text-[16px] uppercase tracking-wider">Service Completed</h3>
            </div>
            <p className="text-[14px] text-emerald-900/80 font-medium mb-4 relative z-10">{ticket.resolution}</p>
            {ticket.partsReplaced && ticket.partsReplaced.length > 0 && (
              <div className="bg-white/60 p-4 rounded-2xl relative z-10 border border-emerald-100/30">
                <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest mb-3">Parts Replaced</p>
                <div className="space-y-2">
                  {ticket.partsReplaced.map(p => (
                    <div key={p.name} className="flex justify-between items-center text-[13px] font-bold text-slate-700">
                      <span className="flex items-center gap-2"><span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center text-[10px]">{p.quantity}x</span> {p.name}</span>
                      <span>₹{p.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end relative z-10">
              <button 
                onClick={() => alert("Downloading Invoice...")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download Invoice
              </button>
            </div>
          </motion.div>
        )}

        {ticket.customerNotes && (
          <motion.div variants={item} className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-[24px] border border-amber-100/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-3 text-amber-700 mb-3 relative z-10">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold text-[15px] uppercase tracking-wider">Your Notes</h3>
            </div>
            <p className="text-[14px] text-amber-900/80 leading-relaxed relative z-10 font-medium">{ticket.customerNotes}</p>
          </motion.div>
        )}

        <motion.div variants={item}>
          <TicketTimeline timeline={ticket.timeline} />
        </motion.div>
      </motion.div>
    </div>
  );
}
