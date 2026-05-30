export interface ROUnitDetails {
  id: string;
  publicId: string;
  brand: string;
  model: string;
  capacity: string;
  installationDate: string;
  warrantyExpiry: string;
  warrantyStatus: "ACTIVE" | "EXPIRED";
  
  roScore: number;
  breakdown: {
    serviceStatus: "GOOD" | "DUE_SOON" | "OVERDUE";
    filterStatus: "GOOD" | "REPLACE_SOON" | "CRITICAL";
    membraneStatus: "GOOD" | "REPLACE_SOON" | "CRITICAL";
    openComplaints: number;
  };
  
  serviceUsage: {
    allocated: number;
    used: number;
    remaining: number;
  };
  
  amc: {
    active: boolean;
    planName?: string;
    expiryDate?: string;
    daysRemaining?: number;
  };
  
  timeline: Array<{
    id: string;
    type: "INSTALLATION" | "SERVICE" | "FILTER_REPLACEMENT" | "AMC_RENEWAL";
    title: string;
    date: string;
    description: string;
  }>;
  
  technicianNotes: string[];
}

export const fetchMyRODetails = async (): Promise<ROUnitDetails> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    id: "ro_123",
    publicId: "RO-A9B2C4",
    brand: "Aquaguard",
    model: "Marvel NXT",
    capacity: "7 Ltr",
    installationDate: "2023-05-30T00:00:00.000Z",
    warrantyExpiry: "2024-05-30T00:00:00.000Z",
    warrantyStatus: "ACTIVE",
    roScore: 85,
    breakdown: {
      serviceStatus: "GOOD",
      filterStatus: "GOOD",
      membraneStatus: "GOOD",
      openComplaints: 0,
    },
    serviceUsage: {
      allocated: 3,
      used: 1,
      remaining: 2,
    },
    amc: {
      active: true,
      planName: "Comprehensive Gold AMC",
      expiryDate: "2025-05-30T00:00:00.000Z",
      daysRemaining: 365,
    },
    timeline: [
      {
        id: "ev_2",
        type: "SERVICE",
        title: "Routine Maintenance",
        date: "2023-11-15T00:00:00.000Z",
        description: "Carbon filter changed, TDS adjusted to 80.",
      },
      {
        id: "ev_1",
        type: "INSTALLATION",
        title: "RO Installed",
        date: "2023-05-30T00:00:00.000Z",
        description: "Initial installation completed by Techie Kumar.",
      }
    ],
    technicianNotes: [
      "Membrane health is currently good, but may require replacement in the next 3 months depending on local TDS levels.",
      "Customer requested lower TDS setting."
    ],
  };
};
