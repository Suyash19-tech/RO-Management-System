export interface DashboardData {
  user?: {
    name: string;
    phone: string;
  };
  roScore: number;
  nextService: string;
  activeAMC: boolean;
  amcDetails?: {
    planName: string;
    expiryDate: string;
    daysRemaining: number;
  };
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
  }>;
  recentTickets: Array<{
    id: string;
    issueType: string;
    status: string;
    createdAt: string;
  }>;
}

export const fetchDashboardData = async (): Promise<DashboardData | null> => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("customer_profile");
  if (!stored || stored === "null" || stored === "undefined") return null;
  let parsed; try { parsed = JSON.parse(stored); } catch(e) { return null; }
  if (!parsed) return null;
  
  const amc = parsed.amcs?.find((a: any) => a.status === 'ACTIVE');
  const recentTickets = parsed.appointments?.slice(0, 3).map((apt: any) => ({
    id: apt.id,
    issueType: apt.type,
    status: apt.status,
    createdAt: apt.date
  })) || [];

  return {
    roScore: 90,
    nextService: parsed.appointments?.find((a: any) => a.status !== 'COMPLETED')?.date || "No upcoming service",
    activeAMC: !!amc,
    amcDetails: amc ? {
      planName: amc.plan,
      expiryDate: amc.endDate,
      daysRemaining: Math.ceil((new Date(amc.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    } : undefined,
    notifications: [
      {
        id: "1",
        title: "Welcome to Sardarji RO",
        body: "Your profile is set up and active.",
        read: false,
        createdAt: parsed.createdAt,
      }
    ],
    recentTickets,
  };
};
