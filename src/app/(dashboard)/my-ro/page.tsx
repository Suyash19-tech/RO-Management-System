"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { fetchMyRODetails, ROUnitDetails } from "@/lib/api/ro-unit";

import { ROHeroCard } from "@/components/my-ro/ROHeroCard";
import { ROCareBreakdown } from "@/components/my-ro/ROCareBreakdown";
import { ServiceUsageCard } from "@/components/my-ro/ServiceUsageCard";
import { WaterDropLoader } from "@/components/ui/WaterDropLoader";

export default function MyROScreen() {

  const [data, setData] = useState<ROUnitDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRODetails().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  } as const;

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as const;

  return (
    <div className="flex-1 bg-[#F8FAFC] h-full overflow-y-auto pb-20 relative">
      {loading ? (
        <WaterDropLoader />
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 pt-3"
        >
          {/* Top Row: Side by Side on Desktop */}
          <div className="flex flex-col md:flex-row gap-6">
            <motion.div variants={item} className="w-full md:w-3/5">
              <ROHeroCard 
                model={data!.model}
                installationDate={data!.installationDate}
                warrantyExpiry={data!.warrantyExpiry}
                amcStatus={data!.amc.active}
                freeServicesUsed={data!.serviceUsage.used}
                freeServicesTotal={data!.serviceUsage.allocated}
              />
            </motion.div>

            <motion.div variants={item} className="w-full md:w-2/5">
              <ROCareBreakdown score={data!.roScore} breakdown={data!.breakdown} />
            </motion.div>
          </div>

          <motion.div variants={item}>
            <ServiceUsageCard usage={data!.serviceUsage} />
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}
