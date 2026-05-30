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
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  // Return null to test empty state. For now, returning active state.
  return {
    id: "sub_01",
    planId: "gold",
    planName: "Comprehensive Gold",
    status: "ACTIVE",
    expiryDate: new Date(Date.now() + 86400000 * 35).toISOString(), // 35 days left
    daysRemaining: 35,
    benefits: [
      "3 Free Services",
      "Membrane Included",
      "Priority Support",
      "15% Parts Discount"
    ],
    usage: {
      allocated: 3,
      used: 2
    },
    history: [
      { id: "h1", type: "PURCHASED", date: new Date(Date.now() - 86400000 * 330).toISOString(), description: "Purchased 1-year Comprehensive Gold AMC." }
    ]
  };
};
