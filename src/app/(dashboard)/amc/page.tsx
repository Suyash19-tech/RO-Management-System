"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchMyAMC, fetchAMCPlans, AMCSubscription, AMCPlan } from "@/lib/api/amc";

import { AMCHeroCard } from "@/components/amc/AMCHeroCard";
import { BenefitList, UsageCard } from "@/components/amc/AMCDetails";
import { PlanComparison, EmptyAMCState } from "@/components/amc/PlanComparison";
import { PrimaryButton } from "@/components/ui/Buttons";

export default function AMCScreen() {
  const router = useRouter();
  const [sub, setSub] = useState<AMCSubscription | null>(null);
  const [plans, setPlans] = useState<AMCPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMyAMC(), fetchAMCPlans()]).then(([subData, planData]) => {
      setSub(subData);
      setPlans(planData);
      setLoading(false);
    });
  }, []);

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
      <div className="pt-6 pb-2 px-4 sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-md z-20 flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">AMC Protection</h1>
      </div>

      {loading ? (
        <div className="p-6">Loading AMC details...</div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="px-6 mt-4 space-y-6">
          {!sub ? (
            <motion.div variants={item}>
              <EmptyAMCState />
              <PlanComparison plans={plans} />
            </motion.div>
          ) : (
            <>
              <motion.div variants={item}>
                <AMCHeroCard 
                  planName={sub.planName}
                  status={sub.status}
                  expiryDate={sub.expiryDate}
                  daysRemaining={sub.daysRemaining}
                />
              </motion.div>

              <motion.div variants={item}>
                <UsageCard usage={sub.usage} />
              </motion.div>

              <motion.div variants={item}>
                <BenefitList benefits={sub.benefits} />
              </motion.div>

              <motion.div variants={item} className="pt-2">
                <PrimaryButton className={sub.status === "EXPIRED" ? "bg-red-500 shadow-red-500/20" : ""}>
                  {sub.status === "EXPIRED" ? "Renew Now" : "Renew Early"}
                </PrimaryButton>
              </motion.div>

              {/* Show plan comparisons below if they want to upgrade upon renewal */}
              {sub.status !== "ACTIVE" && (
                <motion.div variants={item}>
                  <div className="h-px bg-slate-200 my-8" />
                  <PlanComparison plans={plans} />
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
