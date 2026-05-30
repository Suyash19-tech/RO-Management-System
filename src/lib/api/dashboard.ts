export interface DashboardData {
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

export const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    roScore: 85,
    nextService: "2024-07-15T00:00:00.000Z",
    activeAMC: true,
    amcDetails: {
      planName: "Comprehensive Gold AMC",
      expiryDate: "2025-05-30T00:00:00.000Z",
      daysRemaining: 365,
    },
    notifications: [
      {
        id: "1",
        title: "Filter Life Low",
        body: "Your pre-filter is nearing end of life.",
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "2",
        title: "Service Completed",
        body: "Rajesh completed your service request.",
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    recentTickets: [
      {
        id: "t1",
        issueType: "Regular Service",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ],
  };
};
