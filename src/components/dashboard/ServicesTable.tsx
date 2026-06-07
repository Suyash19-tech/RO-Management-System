"use client";

import { MapPin, Calendar, Clock, User, Wrench, ChevronRight, FileText, CheckCircle2, AlertCircle, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Appointment = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  address: string;
  type: string;
  tech: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  remarks?: string;
};

function Avatar({ name, isTech = false }: { name: string, isTech?: boolean }) {
  if (name === "Unassigned") {
    return (
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 shrink-0">
        <User className="w-4 h-4" />
      </div>
    );
  }

  const colors = isTech 
    ? ["bg-indigo-100 text-indigo-700", "bg-teal-100 text-teal-700", "bg-orange-100 text-orange-700"]
    : ["bg-sky-100 text-sky-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700", "bg-amber-100 text-amber-700"];
  
  const color = colors[name.length % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${color}`}>
      {initials}
    </div>
  );
}

const TIME_SLOTS = [
  { label: "Morning  (10:00 AM – 12:00 PM)", value: "Morning (10AM-12PM)" },
  { label: "Afternoon (12:00 PM – 3:00 PM)", value: "Afternoon (12PM-3PM)" },
  { label: "Evening  (3:00 PM – 6:00 PM)",  value: "Evening (3PM-6PM)" },
  { label: "Night    (After 6:00 PM)",       value: "Night (After 6PM)" },
];

export function ServicesTable() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<{ id: string; name: string; status: string }[]>([]);
  
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  
  // Assign Form State
  const [assignTime, setAssignTime] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [assignTech, setAssignTech] = useState("Unassigned");
  const [adminRemark, setAdminRemark] = useState("");
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  // Fetch only PENDING appointments (unconfirmed service requests)
  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments?status=Pending');
      const data = await res.json();
      // Filter client-side too as safety net
      const pending = Array.isArray(data) ? data.filter((a: Appointment) => a.status === 'Pending') : [];
      setAppointments(pending);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch('/api/technicians');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTechnicians(data);
      }
    } catch (err) {
      console.error("Failed to load technicians for assignment list:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchTechnicians();
  }, []);

  // Fetch Customer Details when Modal Opens
  useEffect(() => {
    if (selectedApt && selectedApt.customerPhone) {
      setFetchingCustomer(true);
      setCustomerDetails(null);
      setNotified(false);
      
      // Init form
      setAssignTime(selectedApt.time || "");
      setAssignDate(selectedApt.date ? selectedApt.date.split('T')[0] : "");
      setAssignTech(selectedApt.tech);
      setAdminRemark("");

      fetch(`/api/customers/${encodeURIComponent(selectedApt.customerPhone)}`)
        .then(res => res.json())
        .then(data => {
          setCustomerDetails(data);
          setFetchingCustomer(false);
        })
        .catch(err => {
          console.error(err);
          setFetchingCustomer(false);
        });
    }
  }, [selectedApt]);

  const handleConfirmAppointment = async () => {
    if (!selectedApt) return;
    setNotifying(true);

    try {
      // 1. Update Appointment in DB — mark as Scheduled so it moves to Appointments tab
      await fetch(`/api/appointments/${selectedApt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: assignTime,
          date: assignDate,
          tech: assignTech,
          status: 'Scheduled',
          remarks: adminRemark ? `Admin: ${adminRemark} | Customer: ${selectedApt.remarks || ''}` : selectedApt.remarks
        })
      });

      // 2. Show success, then close modal & refresh (confirmed apt disappears from this tab)
      setTimeout(() => {
        setNotifying(false);
        setNotified(true);
        fetchAppointments();
        // Auto-close modal after 2s so user can see the card has moved
        setTimeout(() => {
          setSelectedApt(null);
          setNotified(false);
        }, 2000);
      }, 1500);

    } catch (error) {
      console.error("Failed to update appointment", error);
      setNotifying(false);
      alert("Failed to confirm appointment.");
    }
  };

  const handleRequestReschedule = async () => {
    if (!selectedApt) return;
    setNotifying(true);

    try {
      await fetch(`/api/appointments/${selectedApt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Reschedule Requested',
          remarks: adminRemark ? `Admin: ${adminRemark} | Customer: ${selectedApt.remarks || ''}` : selectedApt.remarks
        })
      });

      setTimeout(() => {
        setNotifying(false);
        setNotified(true);
        fetchAppointments();
        setTimeout(() => {
          setSelectedApt(null);
          setNotified(false);
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Failed to request reschedule", error);
      setNotifying(false);
      alert("Failed to request reschedule.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading service tickets...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">All queries handled!</h3>
        <p className="text-slate-500 mt-1 max-w-sm">No pending service requests. All confirmed appointments have moved to the Appointments tab.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((apt) => (
          <div 
            key={apt.id}
            onClick={() => setSelectedApt(apt)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar name={apt.customerName} />
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">{apt.customerName}</h3>
                  <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <p className="text-xs font-medium line-clamp-1">{apt.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue / Query</span>
              <p className="font-semibold text-slate-800">{apt.type}</p>
              <p className="text-xs text-slate-500 mt-1">Logged: {new Date(apt.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Technician</span>
                 <span className={`text-sm font-semibold ${apt.tech === 'Unassigned' ? 'text-amber-600' : 'text-slate-900'}`}>{apt.tech}</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-400 group-hover:text-[#2563EB] transition-colors">
                 <ChevronRight className="w-4 h-4" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Query Modal */}
      {selectedApt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden">
            
            {/* Header */}
            <div className="bg-[#0B1B3D] px-6 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-white">
                <Wrench className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-lg font-bold">Service Query</h2>
                  <p className="text-xs font-medium text-blue-200 mt-0.5">Ticket ID: {selectedApt.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApt(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-6 max-h-[80vh]">
              
              {/* Customer Info Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div>
                  <h3 className="font-black text-xl text-slate-900 mb-1">{selectedApt.customerName}</h3>
                  <p className="text-sm text-slate-600 font-medium">{selectedApt.address}</p>
                  <p className="text-sm text-slate-600 font-medium mt-0.5">Ph: {selectedApt.customerPhone}</p>
                </div>
                {selectedApt.customerPhone && (
                  <Link 
                    href={`/dashboard/customers/${encodeURIComponent(selectedApt.customerPhone)}`}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-[#2563EB] text-slate-700 rounded-lg text-sm font-bold shadow-sm transition-all"
                  >
                    <User className="w-4 h-4" /> View Full Profile
                  </Link>
                )}
              </div>

              {/* Service Requested & Remaining Services */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-5">
                   <h4 className="text-xs font-bold text-amber-600/80 uppercase tracking-widest mb-2">Query Raised</h4>
                   <p className="font-bold text-slate-900 text-lg">{selectedApt.type}</p>
                   <p className="text-xs text-slate-500 font-medium mt-1 mb-3">Logged on {new Date(selectedApt.createdAt).toLocaleDateString()}</p>
                   
                   <div className="pt-3 border-t border-amber-200/50 space-y-2">
                     <div>
                       <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest">Requested Slot</span>
                       <p className="text-sm font-semibold text-slate-800">{selectedApt.date ? new Date(selectedApt.date).toLocaleDateString() : 'N/A'} • {selectedApt.time || 'N/A'}</p>
                     </div>
                     {selectedApt.remarks && (
                       <div>
                         <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest">Customer Remarks</span>
                         <p className="text-sm font-medium text-slate-700 italic">"{selectedApt.remarks}"</p>
                       </div>
                     )}
                   </div>
                </div>
                
                <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-5">
                   <h4 className="text-xs font-bold text-emerald-600/80 uppercase tracking-widest mb-2">Service Remaining</h4>
                   {fetchingCustomer ? (
                     <p className="text-sm font-medium text-slate-500 animate-pulse">Checking profile records...</p>
                   ) : customerDetails ? (
                     <div>
                       {customerDetails.installations?.length > 0 ? (
                         <div>
                           <p className="font-black text-slate-900 text-xl">{customerDetails.installations[0].servicesCount} Services <span className="text-sm font-medium text-slate-500">Left</span></p>
                           <p className="text-xs font-medium text-emerald-700 mt-1">From Installation on {new Date(customerDetails.installations[0].date).toLocaleDateString()}</p>
                         </div>
                       ) : customerDetails.amcs?.length > 0 ? (
                         <div>
                           <p className="font-bold text-slate-900">{customerDetails.amcs[0].plan}</p>
                           <p className="text-xs font-medium text-emerald-700 mt-1">Active AMC</p>
                         </div>
                       ) : (
                         <p className="text-sm font-bold text-rose-600">No active warranty or AMC found.</p>
                       )}
                     </div>
                   ) : (
                     <p className="text-sm font-medium text-slate-500">Record unavailable.</p>
                   )}
                </div>
              </div>

              {/* Action Area: Assign Time & Tech */}
              <div className="border-t border-slate-200 pt-6 mt-2">
                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2563EB]" /> Schedule & Dispatch
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                    <input 
                      type="date" 
                      value={assignDate}
                      onChange={(e) => setAssignDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-[#2563EB] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Slot</label>
                    <select
                      value={assignTime}
                      onChange={(e) => setAssignTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-[#2563EB] outline-none"
                    >
                      <option value="">— Select Slot —</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Tech</label>
                    <select 
                      value={assignTech}
                      onChange={(e) => setAssignTech(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-[#2563EB] outline-none"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.name}>
                          {tech.name} {tech.status === "Off Duty" ? "(Off Duty)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message / Remark to Customer (Optional)</label>
                  <textarea 
                    value={adminRemark}
                    onChange={(e) => setAdminRemark(e.target.value)}
                    placeholder="E.g., 'We are fully booked this morning. Could we reschedule to the afternoon?'"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-[#2563EB] outline-none resize-none h-20"
                  />
                </div>

                {/* Confirm Button */}
                {notified ? (
                  <div className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                       <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800">Appointment Confirmed!</p>
                      <p className="text-sm font-medium text-emerald-600">SMS / WhatsApp Notification sent to customer.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleRequestReschedule}
                      disabled={notifying || !adminRemark}
                      className="flex-1 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      Request Reschedule
                    </button>
                    <button 
                      onClick={handleConfirmAppointment}
                      disabled={notifying || !assignDate || !assignTime}
                      className="flex-[2] py-3.5 bg-[#0B1B3D] hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      {notifying ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending...
                        </span>
                      ) : (
                        <>Confirm Appointment <CheckCircle2 className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
