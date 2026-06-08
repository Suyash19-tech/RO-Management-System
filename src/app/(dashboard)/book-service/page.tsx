"use client";
import toast from "react-hot-toast";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createTicket, CreateTicketPayload } from "@/lib/api/tickets";
import { fetchMyRODetails, ROUnitDetails } from "@/lib/api/ro-unit";
import { SuccessState } from "@/components/book-service/SuccessState";
import {
  Droplet, Activity, Wrench, Volume2, ShieldAlert, Sparkles, Plus,
  CheckCircle2, ShieldCheck, Wallet, Sun, Cloud, Moon,
  ChevronRight, Calendar, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- STEP DEFINITIONS ---------------------------------------
const STEPS = [
  { id: 1, label: "Issue",   icon: ShieldAlert },
  { id: 2, label: "Type",    icon: ShieldCheck },
  { id: 3, label: "Schedule", icon: Calendar },
  { id: 4, label: "Review",  icon: CheckCircle2 },
];

// --- ISSUE OPTIONS -------------------------------------------
const ISSUES = [
  { id: "Water Taste Problem",  icon: Droplet,     color: "from-blue-500 to-cyan-400",    bg: "bg-blue-50",   text: "text-blue-600", borderActive: "border-blue-100 bg-blue-50/20", checkBg: "bg-blue-500", shadow: "shadow-[0_8px_24px_rgba(59,130,246,0.12)]" },
  { id: "Low Water Flow",       icon: Activity,    color: "from-teal-500 to-emerald-400", bg: "bg-teal-50",   text: "text-teal-600", borderActive: "border-teal-100 bg-teal-50/20", checkBg: "bg-teal-500", shadow: "shadow-[0_8px_24px_rgba(20,184,166,0.12)]" },
  { id: "Leakage",              icon: ShieldAlert, color: "from-red-500 to-rose-400",     bg: "bg-red-50",    text: "text-red-600", borderActive: "border-red-100 bg-red-50/20", checkBg: "bg-red-500", shadow: "shadow-[0_8px_24px_rgba(239,68,68,0.12)]" },
  { id: "Noise Issue",          icon: Volume2,     color: "from-purple-500 to-violet-400",bg: "bg-purple-50", text: "text-purple-600", borderActive: "border-purple-100 bg-purple-50/20", checkBg: "bg-purple-500", shadow: "shadow-[0_8px_24px_rgba(168,85,247,0.12)]" },
  { id: "Filter Replacement",   icon: Sparkles,    color: "from-amber-500 to-yellow-400", bg: "bg-amber-50",  text: "text-amber-600", borderActive: "border-amber-100 bg-amber-50/20", checkBg: "bg-amber-500", shadow: "shadow-[0_8px_24px_rgba(245,158,11,0.12)]" },
  { id: "General Service",      icon: Wrench,      color: "from-slate-500 to-gray-400",   bg: "bg-slate-50",  text: "text-slate-600", borderActive: "border-slate-200 bg-slate-50/20", checkBg: "bg-slate-600", shadow: "shadow-[0_8px_24px_rgba(100,116,139,0.12)]" },
  { id: "Other",                icon: Plus,        color: "from-indigo-500 to-blue-400",  bg: "bg-indigo-50", text: "text-indigo-600", borderActive: "border-indigo-100 bg-indigo-50/20", checkBg: "bg-indigo-500", shadow: "shadow-[0_8px_24px_rgba(99,102,241,0.12)]" },
];

// --- SERVICE TYPES --------------------------------------------
const SERVICE_TYPES = [
  {
    id: "FREE",
    label: "Free Service",
    desc: "2 visits remaining this year",
    badge: "2 Left",
    badgeColor: "bg-emerald-100 text-emerald-700",
    gradient: "from-emerald-500 to-teal-500",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    borderActive: "border-emerald-200 bg-emerald-50/10",
    checkBg: "border-emerald-500 bg-emerald-500",
    shadow: "shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
  },
  {
    id: "AMC",
    label: "AMC Service",
    desc: "Covered under your Gold Plan",
    badge: "Gold",
    badgeColor: "bg-amber-100 text-amber-700",
    gradient: "from-blue-600 to-indigo-600",
    icon: ShieldCheck,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderActive: "border-blue-200 bg-blue-50/10",
    checkBg: "border-[#0052D4] bg-[#0052D4]",
    shadow: "shadow-[0_8px_24px_rgba(59,130,246,0.08)]"
  },
  {
    id: "PAID",
    label: "Paid Service",
    desc: "Standard rates apply — ₹299 onwards",
    badge: "Pay Now",
    badgeColor: "bg-orange-100 text-orange-700",
    gradient: "from-orange-500 to-amber-500",
    icon: Wallet,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    borderActive: "border-orange-200 bg-orange-50/10",
    checkBg: "border-orange-500 bg-orange-500",
    shadow: "shadow-[0_8px_24px_rgba(249,115,22,0.08)]"
  },
];

// --- SLOTS ----------------------------------------------------
const TIME_SLOTS = [
  { id: "Morning (9-12)",   label: "Morning",   time: "9:00 – 12:00", icon: Sun,    gradient: "from-amber-400 to-orange-400" },
  { id: "Afternoon (12-4)", label: "Afternoon", time: "12:00 – 4:00", icon: Cloud,  gradient: "from-sky-400 to-blue-500" },
  { id: "Evening (4-7)",    label: "Evening",   time: "4:00 – 7:00",  icon: Moon,   gradient: "from-indigo-500 to-purple-600" },
];

// --- MAIN PAGE ------------------------------------------------
export default function BookServiceScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; time: string } | null>(null);
  const [roData, setRoData] = useState<ROUnitDetails | null>(null);

  useEffect(() => {
    fetchMyRODetails().then(setRoData);
  }, []);

  const [payload, setPayload] = useState<CreateTicketPayload>({
    issueType: "",
    serviceType: "FREE",
    preferredDate: "",
    preferredSlot: "",
    notes: "",
    photos: [],
  });

  const isStepUnlocked = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return !!payload.issueType;
    if (stepId === 3) return !!payload.issueType && !!payload.serviceType;
    if (stepId === 4) return !!payload.issueType && !!payload.serviceType && !!payload.preferredDate && !!payload.preferredSlot;
    return false;
  };

  const dates = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      d.setHours(0, 0, 0, 0); // normalize to midnight
      return {
        full: d.toISOString(),
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" }),
      };
    });
  }, []);

  const handleNext = () => { if (step < 4) setStep(step + 1); else submitTicket(); };
  const handleBack = () => { if (step > 1) setStep(step - 1); else router.back(); };

  const submitTicket = async () => {
    setIsSubmitting(true);
    try {
      const res = await createTicket(payload);
      setSuccessData({ id: res.ticketId, time: res.expectedResponseTime });
    } catch {
      toast.error("Failed to book service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!payload.issueType;
    if (step === 2) return !!payload.serviceType;
    if (step === 3) return !!payload.preferredDate && !!payload.preferredSlot;
    return true;
  };

  const selectedIssue = ISSUES.find(i => i.id === payload.issueType);
  
  // Dynamically update the SERVICE_TYPES with actual remaining free services and AMC status
  const dynamicServiceTypes = useMemo(() => {
    return SERVICE_TYPES.map(type => {
      if (type.id === "FREE" && roData) {
        const isExhausted = roData.serviceUsage.remaining === 0;
        return {
          ...type,
          desc: isExhausted ? "No visits remaining" : `${roData.serviceUsage.remaining} visits remaining this year`,
          badge: isExhausted ? "0 Left" : `${roData.serviceUsage.remaining} Left`,
          disabled: isExhausted,
        };
      }
      if (type.id === "AMC" && roData) {
        const hasActiveAmc = roData.amc.active;
        return {
          ...type,
          desc: hasActiveAmc ? `Covered under your ${roData.amc.planName}` : "No active AMC plan",
          badge: hasActiveAmc ? "Active" : "Inactive",
          disabled: !hasActiveAmc,
        };
      }
      return { ...type, disabled: false };
    });
  }, [roData]);

  // Ensure selected service type is not disabled
  useEffect(() => {
    if (dynamicServiceTypes.length > 0) {
      const selected = dynamicServiceTypes.find(t => t.id === payload.serviceType);
      if (selected && selected.disabled) {
        const firstAvailable = dynamicServiceTypes.find(t => !t.disabled);
        if (firstAvailable) {
          setPayload(prev => ({ ...prev, serviceType: firstAvailable.id as any }));
        }
      }
    }
  }, [dynamicServiceTypes, payload.serviceType]);

  const selectedService = dynamicServiceTypes.find(s => s.id === payload.serviceType);
  const selectedSlot = TIME_SLOTS.find(s => s.id === payload.preferredSlot);
  const selectedDate = dates.find(d => d.full === payload.preferredDate);

  if (successData) {
    return (
      <SuccessState
        ticketId={successData.id}
        expectedTime={successData.time}
        onTrack={() => router.push(`/history/${successData.id}`)}
        onHome={() => router.push("/home")}
      />
    );
  }

  return (
    <div className="min-h-full bg-[#F0F4FF] flex flex-col">

      {/* ── Top Hero Header Card (floating style with premium length/height) ── */}
      <div className="bg-gradient-to-br from-[#0052D4] via-[#003B9D] to-[#1a1a6e] mx-4 mt-3 px-5 py-6 rounded-[24px] relative overflow-hidden shadow-md">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 right-10 w-24 h-24 bg-white/5 rounded-full" />

        {/* Title — centered */}
        <div className="mb-4 text-center flex flex-col items-center justify-center relative z-10">
          <h1 className="text-[23px] font-black text-white leading-tight mb-1">Book your Appointment</h1>
          <p className="text-white/70 text-[12.5px] font-semibold max-w-[280px]">We'll send a technician right to your door</p>
        </div>

        {/* Step Pills — centered, upscaled, premium glassmorphism */}
        <div className="flex items-center justify-center gap-1.5 md:gap-2 max-w-full relative z-10">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            const clickable = isStepUnlocked(s.id);
            return (
              <div key={s.id} className="flex items-center gap-1.5 md:gap-2">
                <button
                  type="button"
                  onClick={() => { if (clickable) setStep(s.id); }}
                  disabled={!clickable}
                  className={cn(
                    "flex items-center justify-center font-black transition-all duration-300 focus:outline-none outline-none select-none border rounded-full",
                    active
                      ? "px-3.5 py-1.5 text-[11.5px] gap-1.5 bg-white text-[#0052D4] border-white shadow-[0_4px_12px_rgba(255,255,255,0.15)] cursor-default"
                      : cn(
                          "w-8.5 h-8.5 p-0 text-[10px]",
                          done
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.12)] cursor-pointer hover:bg-emerald-100/80 active:scale-95"
                            : clickable
                            ? "bg-white/10 text-white/80 border-white/10 cursor-pointer hover:bg-white/20 hover:text-white active:scale-95"
                            : "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                        )
                  )}
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <s.icon className="w-3.5 h-3.5 flex-shrink-0" />}
                  {active && <span>{s.label}</span>}
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "w-3 md:w-4 h-0.5 rounded-full flex-shrink-0 transition-colors duration-300",
                    done ? "bg-emerald-400" : "bg-white/10"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="flex-1 bg-[#F0F4FF] px-4 pt-4 pb-28 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >

            {/* ── STEP 1: Issue ── */}
            {step === 1 && (
              <div>
                <p className="text-[17px] font-black text-slate-800 mb-0.5">What's the issue?</p>
                <p className="text-slate-500 text-[12px] mb-4">Select the primary reason for your service call</p>
                <div className="grid grid-cols-2 gap-3">
                  {ISSUES.map((issue) => {
                    const active = payload.issueType === issue.id;
                    return (
                      <button
                        key={issue.id}
                        onClick={() => setPayload({ ...payload, issueType: issue.id })}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-200 active:scale-95",
                          active
                            ? cn("bg-white border-solid", issue.borderActive, issue.shadow)
                            : "border-transparent bg-white/75 hover:bg-white"
                        )}
                      >
                        {active && (
                          <span className={cn("absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-white", issue.checkBg)}>
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </span>
                        )}
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center",
                          active ? `bg-gradient-to-br ${issue.color}` : issue.bg
                        )}>
                          <issue.icon className={cn("w-5.5 h-5.5", active ? "text-white" : issue.text)} />
                        </div>
                        <span className={cn(
                          "text-[12px] font-extrabold text-center leading-tight px-0.5",
                          active ? "text-slate-900" : "text-slate-600"
                        )}>
                          {issue.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 2: Service Type ── */}
            {step === 2 && (
              <div>
                <p className="text-[18px] font-black text-slate-800 mb-1">Service Type</p>
                <p className="text-slate-500 text-[13px] mb-5">Choose how you'd like to proceed</p>
                <div className="space-y-3">
                  {dynamicServiceTypes.map((type) => {
                    const active = payload.serviceType === type.id;
                    const disabled = type.disabled;
                    return (
                      <button
                        key={type.id}
                        disabled={disabled}
                        onClick={() => setPayload({ ...payload, serviceType: type.id as any })}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-[20px] border-2 transition-all duration-200 text-left",
                          disabled ? "opacity-50 cursor-not-allowed grayscale-[0.5] border-slate-200 bg-slate-50" : "active:scale-[0.98]",
                          !disabled && active
                            ? cn("bg-white border-solid", type.borderActive, type.shadow)
                            : !disabled && "border-transparent bg-white/70 hover:bg-white"
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                          active ? `bg-gradient-to-br ${type.gradient}` : type.iconBg
                        )}>
                          <type.icon className={cn("w-7 h-7", active ? "text-white" : type.iconColor)} />
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-black text-slate-900 text-[14px]">{type.label}</h3>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", type.badgeColor)}>
                              {type.badge}
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 font-medium">{type.desc}</p>
                        </div>

                        {/* Radio */}
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          active ? type.checkBg : "border-slate-300"
                        )}>
                          {active && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 3: Schedule ── */}
            {step === 3 && (
              <div>
                <p className="text-[18px] font-black text-slate-800 mb-1">When should we visit?</p>
                <p className="text-slate-500 text-[13px] mb-5">Pick a date and time that works for you</p>

                {/* Date Row */}
                <div className="mb-6">
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Select Date
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-hide">
                    {dates.map((d, i) => {
                      const active = payload.preferredDate === d.full;
                      return (
                        <button
                          key={i}
                          onClick={() => setPayload({ ...payload, preferredDate: d.full })}
                          className={cn(
                            "snap-start flex-shrink-0 w-[60px] py-3 rounded-2xl flex flex-col items-center gap-0.5 transition-all duration-200 active:scale-95",
                            active
                              ? "bg-gradient-to-b from-[#0052D4] to-[#003B9D] shadow-[0_6px_20px_rgba(0,82,212,0.3)]"
                              : "bg-white"
                          )}
                        >
                          <span className={cn("text-[10px] font-bold uppercase", active ? "text-blue-200" : "text-slate-400")}>
                            {d.day}
                          </span>
                          <span className={cn("text-[22px] font-black leading-none", active ? "text-white" : "text-slate-800")}>
                            {d.date}
                          </span>
                          <span className={cn("text-[9px] font-medium", active ? "text-blue-200" : "text-slate-400")}>
                            {d.month}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Select Time
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const active = payload.preferredSlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setPayload({ ...payload, preferredSlot: slot.id })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-200 active:scale-95",
                            active ? "bg-white shadow-[0_4px_20px_rgba(0,82,212,0.15)]" : "bg-white/70 hover:bg-white"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            active ? `bg-gradient-to-br ${slot.gradient}` : "bg-slate-100"
                          )}>
                            <slot.icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400")} />
                          </div>
                          <div className="text-center">
                            <p className={cn("text-[11px] font-black", active ? "text-slate-900" : "text-slate-600")}>
                              {slot.label}
                            </p>
                            <p className={cn("text-[9px] font-semibold leading-none mt-0.5", active ? "text-slate-500" : "text-slate-400")}>
                              {slot.time}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Review ── */}
            {step === 4 && (
              <div>
                <p className="text-[18px] font-black text-slate-800 mb-1">Review & Confirm</p>
                <p className="text-slate-500 text-[13px] mb-5">Almost there! Verify your booking details</p>

                {/* Summary Card */}
                <div className="bg-white rounded-[20px] shadow-sm p-5 mb-4 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    {selectedIssue && (
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", selectedIssue.color)}>
                        <selectedIssue.icon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Issue</p>
                      <p className="font-black text-slate-900">{payload.issueType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    {selectedService && (
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", selectedService.gradient)}>
                        <selectedService.icon className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Service</p>
                      <p className="font-black text-slate-900">{selectedService?.label}</p>
                    </div>
                    {selectedService && (
                      <span className={cn("ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full", selectedService.badgeColor)}>
                        {selectedService.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052D4] to-[#003B9D] flex flex-col items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Schedule</p>
                      <p className="font-black text-slate-900">
                        {selectedDate ? `${selectedDate.day}, ${selectedDate.date} ${selectedDate.month}` : "—"}
                      </p>
                      <p className="text-[12px] text-[#0052D4] font-semibold">{selectedSlot?.time}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <p className="text-[12px] font-bold text-slate-600 mb-2">Additional Notes <span className="text-slate-400 font-normal">(optional)</span></p>
                  <textarea
                    value={payload.notes}
                    onChange={(e) => setPayload({ ...payload, notes: e.target.value })}
                    placeholder="E.g., water smells slightly chlorinated..."
                    className="w-full h-28 p-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:border-[#0052D4] outline-none transition-all resize-none text-[13px]"
                  />
                </div>

                {/* Trust Badges */}
                <div className="flex gap-2">
                  {["Verified Technician", "On-Time Guarantee", "Free Reschedule"].map(badge => (
                    <span key={badge} className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-200 flex-1 justify-center text-center leading-tight">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Fixed Footer CTA — sits above 70px bottom nav ── */}
      <div className="fixed bottom-[70px] left-0 right-0 z-50 px-4 pb-4 pt-3 bg-gradient-to-t from-[#F0F4FF] via-[#F0F4FF]/90 to-transparent">
        <button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_8px_24px_rgba(0,82,212,0.35)]",
            canProceed() && !isSubmitting
              ? "bg-gradient-to-r from-[#0052D4] to-[#003B9D] text-white active:scale-[0.97] hover:shadow-[0_12px_28px_rgba(0,82,212,0.4)]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Processing...
            </span>
          ) : step === 4 ? (
            <>Confirm Booking <CheckCircle2 className="w-5 h-5" /></>
          ) : (
            <>Continue <ChevronRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
