"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchTickets, Ticket } from "@/lib/api/history";
import { TicketCard } from "@/components/history/TicketCard";
import { WaterDropLoader } from "@/components/ui/WaterDropLoader";
import { EmptyState } from "@/components/history/EmptyState";

export default function ServiceHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      fetchTickets().then((data) => {
        if (mounted) {
          setTickets(data);
          setLoading(false);
        }
      });
    };
    
    load();
    const interval = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeTickets = tickets.filter(t => t.status !== "COMPLETED");
  const completedTickets = tickets.filter(t => t.status === "COMPLETED");
  
  const displayTickets = activeTab === "ACTIVE" ? activeTickets : completedTickets;

  return (
    <div className="flex-1 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="pt-6 pb-2 px-4 bg-white z-20 flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Service Tickets</h1>
      </div>

      {/* Segment Control */}
      <div className="bg-white px-6 pb-4 border-b border-slate-100 shadow-sm">
        <div className="flex bg-slate-100 rounded-xl p-1 relative">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${activeTab === "ACTIVE" ? "text-[#0F4C81]" : "text-slate-500"}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${activeTab === "COMPLETED" ? "text-[#0F4C81]" : "text-slate-500"}`}
          >
            History
          </button>
          {/* Animated Background Indicator */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-in-out ${activeTab === "COMPLETED" ? "translate-x-full" : "translate-x-0"}`} 
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
        {loading ? (
          <WaterDropLoader />
        ) : (
          <AnimatePresence mode="popLayout">
            {displayTickets.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <EmptyState 
                  title={activeTab === "ACTIVE" ? "No Active Tickets" : "No Service History"} 
                  message={activeTab === "ACTIVE" ? "Your RO is running smoothly. Relax!" : "You haven't completed any services yet."} 
                />
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {displayTickets.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <TicketCard ticket={ticket} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
