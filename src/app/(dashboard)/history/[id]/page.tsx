"use client";
import toast from "react-hot-toast";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchTicketById, Ticket, rescheduleTicket } from "@/lib/api/history";
import { fetchProfile } from "@/lib/api/profile";
import { ServiceInvoiceModal } from "@/components/ui/InvoiceModal";
import { AlertCircle, CalendarDays, Clock, Send } from "lucide-react";

import { StatusTracker } from "@/components/history/StatusTracker";
import { TechnicianCard } from "@/components/history/TechnicianCard";
import { TicketTimeline } from "@/components/history/TicketTimeline";

export default function TicketDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showCustomerRescheduleForm, setShowCustomerRescheduleForm] = useState(false);

  useEffect(() => {
    fetchProfile().then(p => setProfile(p));
    
    let mounted = true;
    const load = () => {
      if (params.id) {
        fetchTicketById(params.id as string).then((res) => {
          if (mounted) {
            setTicket(res);
            setLoading(false);
          }
        });
      }
    };
    
    load();
    const interval = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
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

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleSlot) return;
    setIsRescheduling(true);
    
    // If ticket was already confirmed (ASSIGNED/ACCEPTED) and the customer initiates this, it uses their 1-time limit.
    const isAfterConfirmation = (ticket.status === 'ASSIGNED' || ticket.status === 'ACCEPTED');
    const isCustomerInitiated = showCustomerRescheduleForm;
    const incrementReschedule = isCustomerInitiated && isAfterConfirmation;

    const success = await rescheduleTicket(ticket.rawId, rescheduleDate, rescheduleSlot, incrementReschedule);
    if (success) {
      toast.success("Reschedule request submitted successfully.");
      setTicket({ 
        ...ticket, 
        status: "CREATED", 
        rescheduleCount: ticket.rescheduleCount + (incrementReschedule ? 1 : 0) 
      });
      setRescheduleDate("");
      setRescheduleSlot("");
      setShowCustomerRescheduleForm(false);
    } else {
      toast.error("Failed to submit reschedule request.");
    }
    setIsRescheduling(false);
  };

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

        {ticket.status === 'RESCHEDULE_REQUESTED' && (
          <motion.div variants={item} className="bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-full shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 leading-tight">Action Required</h3>
                <p className="text-sm font-medium text-amber-700 mt-1">
                  The admin has requested to reschedule your appointment. Please pick a new date and time.
                </p>
                {ticket.technicianRemarks && (
                  <div className="mt-2 p-3 bg-amber-100/50 rounded-lg text-xs font-semibold text-amber-800 italic">
                    "{ticket.technicianRemarks.split('| Customer:')[0].replace('Admin: ', '')}"
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-amber-200/50 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Select Date</label>
                <input 
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-white px-4 py-3 rounded-xl border border-amber-200 font-bold text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Preferred Time Slot</label>
                <select 
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full bg-white px-4 py-3 rounded-xl border border-amber-200 font-bold text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all appearance-none"
                >
                  <option value="" disabled>-- Select Time Slot --</option>
                  <option value="Morning (10AM-12PM)">Morning (10:00 AM – 12:00 PM)</option>
                  <option value="Afternoon (12PM-3PM)">Afternoon (12:00 PM – 3:00 PM)</option>
                  <option value="Evening (3PM-6PM)">Evening (3:00 PM – 6:00 PM)</option>
                  <option value="Night (After 6PM)">Night (After 6:00 PM)</option>
                </select>
              </div>

              <button 
                onClick={handleRescheduleSubmit}
                disabled={!rescheduleDate || !rescheduleSlot || isRescheduling}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isRescheduling ? "Submitting..." : <><Send className="w-4 h-4" /> Submit New Slot</>}
              </button>
            </div>
          </motion.div>
        )}

        {ticket.technician && ticket.status !== 'COMPLETED' && ticket.status !== 'RESCHEDULE_REQUESTED' && (
          <motion.div variants={item}>
            <TechnicianCard technician={ticket.technician} expectedSlot={ticket.scheduledSlot} />
          </motion.div>
        )}

        {!ticket.technician && ticket.status !== 'COMPLETED' && ticket.status !== 'RESCHEDULE_REQUESTED' && (
          <motion.div variants={item} className="bg-[#0B1B3D] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
            <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1.5 opacity-80">Technician Details</h3>
            <p className="text-sm font-medium leading-relaxed mt-2 text-blue-100">
              We will assign you a technician as soon as we get confirmation for your appointment.
            </p>
          </motion.div>
        )}

        {/* Customer Reschedule Button & Form */}
        {ticket.status !== 'COMPLETED' && ticket.status !== 'RESCHEDULE_REQUESTED' && !showCustomerRescheduleForm && ticket.rescheduleCount < 1 && (
          <motion.div variants={item}>
            <button 
              onClick={() => setShowCustomerRescheduleForm(true)}
              className="w-full py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              <CalendarDays className="w-5 h-5 text-slate-400" />
              Reschedule Appointment
            </button>
          </motion.div>
        )}

        {showCustomerRescheduleForm && (
          <motion.div variants={item} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden mt-2">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-slate-400"/> Reschedule Appointment</h3>
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">Select Date</label>
                <input 
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">Preferred Time Slot</label>
                <select 
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-800 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all appearance-none"
                >
                  <option value="" disabled>-- Select Time Slot --</option>
                  <option value="Morning (10AM-12PM)">Morning (10:00 AM – 12:00 PM)</option>
                  <option value="Afternoon (12PM-3PM)">Afternoon (12:00 PM – 3:00 PM)</option>
                  <option value="Evening (3PM-6PM)">Evening (3:00 PM – 6:00 PM)</option>
                  <option value="Night (After 6PM)">Night (After 6:00 PM)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setShowCustomerRescheduleForm(false);
                    setRescheduleDate("");
                    setRescheduleSlot("");
                  }}
                  className="flex-1 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRescheduleSubmit}
                  disabled={!rescheduleDate || !rescheduleSlot || isRescheduling}
                  className="flex-[2] py-3.5 bg-[#0B1B3D] hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                >
                  {isRescheduling ? "Submitting..." : <><Send className="w-4 h-4" /> Confirm</>}
                </button>
              </div>
            </div>
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
                onClick={() => setShowInvoice(true)}
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

      {showInvoice && profile && (
        <ServiceInvoiceModal ticket={ticket} profile={profile} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}
