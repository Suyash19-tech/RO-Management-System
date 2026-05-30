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
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] h-full overflow-y-auto pb-20 relative">
      {/* Header */}
      <div className="pt-6 pb-4 px-4 sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-md z-20 flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <div>
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">{ticket.id}</span>
          <h1 className="text-lg font-bold text-slate-900">{ticket.issueType}</h1>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="px-6 space-y-5 mt-2"
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
          <motion.div variants={item} className="bg-green-50 border border-green-200 p-5 rounded-2xl">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold">Service Completed</h3>
            </div>
            <p className="text-sm text-green-800/80 font-medium mb-3">{ticket.resolution}</p>
            {ticket.partsReplaced && ticket.partsReplaced.length > 0 && (
              <div className="bg-white/60 p-3 rounded-xl">
                <p className="text-[10px] font-bold text-green-700 uppercase mb-2">Parts Replaced</p>
                {ticket.partsReplaced.map(p => (
                  <div key={p.name} className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{p.quantity}x {p.name}</span>
                    <span>₹{p.cost}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {ticket.customerNotes && (
          <motion.div variants={item} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold">Your Notes</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{ticket.customerNotes}</p>
          </motion.div>
        )}

        <motion.div variants={item}>
          <TicketTimeline timeline={ticket.timeline} />
        </motion.div>
      </motion.div>
    </div>
  );
}
