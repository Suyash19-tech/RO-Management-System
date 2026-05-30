"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTicket, CreateTicketPayload } from "@/lib/api/tickets";

import { IssueSelector } from "@/components/book-service/IssueSelector";
import { ServiceTypeCard } from "@/components/book-service/ServiceTypeCard";
import { SlotPicker } from "@/components/book-service/SlotPicker";
import { NotesInput } from "@/components/book-service/NotesInput";
import { SuccessState } from "@/components/book-service/SuccessState";
import { PrimaryButton } from "@/components/ui/Buttons";

const STEPS = [
  { id: 1, title: "What's the issue?", subtitle: "Select the primary reason for service" },
  { id: 2, title: "Service Type", subtitle: "Choose how you'd like to proceed" },
  { id: 3, title: "When should we visit?", subtitle: "Select your preferred time" },
  { id: 4, title: "Additional Details", subtitle: "Any other context for our technician?" }
];

export default function BookServiceScreen() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{id: string, time: string} | null>(null);

  // Form State
  const [payload, setPayload] = useState<CreateTicketPayload>({
    issueType: "",
    serviceType: "FREE",
    preferredDate: "",
    preferredSlot: "",
    notes: "",
    photos: []
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else submitTicket();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const submitTicket = async () => {
    setIsSubmitting(true);
    try {
      const res = await createTicket(payload);
      setSuccessData({ id: res.ticketId, time: res.expectedResponseTime });
    } catch (e) {
      alert("Failed to book service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if next button is disabled
  const isNextDisabled = () => {
    if (step === 1 && !payload.issueType) return true;
    if (step === 2 && !payload.serviceType) return true;
    if (step === 3 && (!payload.preferredDate || !payload.preferredSlot)) return true;
    return false;
  };

  if (successData) {
    return (
      <SuccessState 
        ticketId={successData.id} 
        expectedTime={successData.time}
        onTrack={() => alert("Tracking feature coming soon!")}
        onHome={() => router.push("/home")}
      />
    );
  }

  const currentStepInfo = STEPS.find(s => s.id === step)!;

  return (
    <div className="flex-1 bg-white h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="pt-6 pb-4 px-4 sticky top-0 bg-white z-20">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full active:scale-95">
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <span className="text-xs font-bold text-[#0F4C81] bg-blue-50 px-3 py-1 rounded-full">
            Step {step} of 4
          </span>
          <div className="w-9" /> {/* Spacer */}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00B8A9] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area with Sliding Animation */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-28 relative">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{currentStepInfo.title}</h1>
        <p className="text-sm text-slate-500 mb-8">{currentStepInfo.subtitle}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <IssueSelector 
                selected={payload.issueType} 
                onSelect={(v) => setPayload({...payload, issueType: v})} 
              />
            )}
            
            {step === 2 && (
              <ServiceTypeCard 
                selected={payload.serviceType}
                onSelect={(v: any) => setPayload({...payload, serviceType: v})}
              />
            )}

            {step === 3 && (
              <SlotPicker 
                date={payload.preferredDate}
                setDate={(v) => setPayload({...payload, preferredDate: v})}
                slot={payload.preferredSlot}
                setSlot={(v) => setPayload({...payload, preferredSlot: v})}
              />
            )}

            {step === 4 && (
              <NotesInput 
                notes={payload.notes!}
                setNotes={(v) => setPayload({...payload, notes: v})}
                photos={payload.photos!}
                setPhotos={(v) => setPayload({...payload, photos: v})}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Fixed Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
        <PrimaryButton 
          onClick={handleNext}
          disabled={isNextDisabled() || isSubmitting}
        >
          {isSubmitting ? "Processing..." : step === 4 ? "Confirm Booking" : "Continue"}
        </PrimaryButton>
      </div>
    </div>
  );
}
