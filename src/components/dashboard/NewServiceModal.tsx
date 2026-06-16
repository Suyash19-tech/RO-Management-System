"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { X, Calendar, User, MapPin, Phone, Clock, Wrench, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

type Technician = {
  id: string;
  name: string;
  status: string;
};

const TIME_SLOTS = [
  { label: "Morning  (10:00 AM – 12:00 PM)", value: "Morning (10AM-12PM)" },
  { label: "Afternoon (12:00 PM – 3:00 PM)", value: "Afternoon (12PM-3PM)" },
  { label: "Evening  (3:00 PM – 6:00 PM)", value: "Evening (3PM-6PM)" },
  { label: "Night    (After 6:00 PM)", value: "Night (After 6PM)" },
];

export function NewServiceModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    type: "First-time Service", // Default type for onboarding via service
    date: "",
    time: "",
    tech: "Unassigned",
    remarks: "",
  });

  const { data: techData } = useSWR<Technician[]>('/api/technicians', fetcher);
  const technicians = Array.isArray(techData) ? techData.filter((t) => t.status === "On Duty") : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!form.customerName || !form.customerPhone || !form.address) {
      toast.error("Please fill all customer details.");
      return;
    }
    if (form.customerPhone.length < 10) {
      toast.error("Enter a valid 10-digit phone number.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.type) {
      toast.error("Please select service details.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to create service onboarding");
      }

      toast.success("Customer onboarded successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during onboarding.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1B3D] px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-white">
            <Wrench className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold">New Service Onboarding</h2>
              <p className="text-xs font-medium text-blue-200 mt-0.5">Register a new customer via service visit.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step === 1 ? "bg-[#0B1B3D] text-white" : "bg-emerald-500 text-white"}`}>
              {step === 1 ? "1" : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <span className={`ml-2 text-xs font-bold ${step === 1 ? "text-[#0B1B3D]" : "text-emerald-600"}`}>Customer Info</span>
            <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${step > 1 ? "bg-emerald-400" : "bg-slate-200"}`} />
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step === 2 ? "bg-[#0B1B3D] text-white" : "bg-slate-100 text-slate-400"}`}>
              2
            </div>
            <span className={`ml-2 text-xs font-bold ${step === 2 ? "text-[#0B1B3D]" : "text-slate-400"}`}>Service Details</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Full Address *</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete installation/service address"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] outline-none resize-none transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                >
                  <option value="First-time Service">First-time Service</option>
                  <option value="Repair Service">Repair Service</option>
                  <option value="Routine Maintenance">Routine Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time Slot *</label>
                  <select
                    name="time"
                    value={form.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                  >
                    <option value="">— Select Slot —</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Technician</label>
                <select
                  name="tech"
                  value={form.tech}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                >
                  <option value="Unassigned">Unassigned</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks (Optional)</label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleInputChange}
                  placeholder="Any initial notes for the technician..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#2563EB] outline-none resize-none transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
              <button onClick={handleNext} className="px-6 py-2.5 bg-[#0B1B3D] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">Next Step</button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {submitting ? "Saving..." : "Create Onboarding"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
