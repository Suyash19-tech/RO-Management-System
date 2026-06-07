export interface AMCPlan {
  id: string;
  name: string;
  pricing: number;
  features: string[];
  recommended?: boolean;
}

export interface AMCSubscription {
  id: string;
  planId: string;
  planName: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  expiryDate: string;
  daysRemaining: number;
  benefits: string[];
  usage: {
    allocated: number;
    used: number;
  };
  history: Array<{
    id: string;
    type: "PURCHASED" | "RENEWED" | "EXPIRED";
    date: string;
    description: string;
  }>;
}

export const fetchAMCPlans = async (): Promise<AMCPlan[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    {
      id: "silver",
      name: "Silver Plan",
      pricing: 1999,
      features: ["2 Free Services", "Standard Support"],
    },
    {
      id: "gold",
      name: "Comprehensive Gold",
      pricing: 3499,
      features: ["3 Free Services", "Membrane Included", "Priority Support", "15% Parts Discount"],
      recommended: true,
    },
    {
      id: "platinum",
      name: "Platinum Care",
      pricing: 5999,
      features: ["4 Free Services", "All Parts Covered", "Same Day Visit", "24/7 Helpline"],
    }
  ];
};

export const fetchMyAMC = async (): Promise<AMCSubscription | null> => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("customer_profile");
  if (!stored) return null;
  const parsed = JSON.parse(stored);
  
  const activeAmc = parsed.amcs?.find((a: any) => a.status === 'Active' || a.status === 'ACTIVE');
  if (!activeAmc) return null;

  const expiry = new Date(activeAmc.endDate);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  let status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" = "ACTIVE";
  if (daysRemaining === 0) status = "EXPIRED";
  else if (daysRemaining <= 30) status = "EXPIRING_SOON";

  return {
    id: activeAmc.id,
    planId: "dynamic",
    planName: activeAmc.plan || "Standard Plan",
    status,
    expiryDate: activeAmc.endDate,
    daysRemaining,
    benefits: [
      "Standard Servicing",
      "Priority Customer Support"
    ],
    usage: {
      allocated: 3, // Fallback if not tracked on amc record
      used: parsed.appointments?.filter((a: any) => a.status === 'COMPLETED').length || 0
    },
    history: parsed.amcs?.map((a: any) => ({
      id: a.id,
      type: a.status === "EXPIRED" ? "EXPIRED" : "PURCHASED",
      date: a.startDate,
      description: `${a.status === "EXPIRED" ? "Expired" : "Purchased"} ${a.plan} plan.`
    })) || []
  };
};
