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
  rawInstallation: any;
}

export const fetchMyRODetails = async (): Promise<ROUnitDetails | null> => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("customer_profile");
  if (!stored || stored === "null" || stored === "undefined") return null;
  let parsed; try { parsed = JSON.parse(stored); } catch(e) { return null; }
  if (!parsed) return null;
  
  const installation = parsed.installations?.[0];
  if (!installation) return null;

  const amc = parsed.amcs?.find((a: any) => a.status === 'ACTIVE');
  
  const timeline: ROUnitDetails["timeline"] = [];
  if (installation) {
    timeline.push({
      id: "ev_1",
      type: "INSTALLATION",
      title: "RO Installed",
      date: installation.date,
      description: `Initial installation completed.`
    });
  }

  const completedServices = parsed.appointments?.filter((a: any) => 
    a.status?.toUpperCase() === 'COMPLETED' && 
    (a.paymentStatus === 'Free' || a.type?.includes('Free Service'))
  ).length || 0;
  const remainingServices = installation ? (installation.servicesCount !== undefined ? installation.servicesCount : 3) : 3;
  const totalAllocated = remainingServices + completedServices;

  // Add completed services to timeline
  parsed.appointments?.filter((a: any) => a.status?.toUpperCase() === 'COMPLETED').forEach((apt: any) => {
    timeline.push({
      id: apt.id,
      type: "SERVICE",
      title: apt.type,
      date: apt.date,
      description: apt.remarks || "Service completed successfully."
    });
  });

  return {
    id: installation.id,
    publicId: "RO-" + installation.id.slice(0,6).toUpperCase(),
    brand: "Sardarji RO",
    model: installation.model || "Standard Model",
    capacity: "Unknown",
    installationDate: installation.date,
    warrantyExpiry: new Date(new Date(installation.date).setFullYear(new Date(installation.date).getFullYear() + 1)).toISOString(),
    warrantyStatus: new Date() > new Date(new Date(installation.date).setFullYear(new Date(installation.date).getFullYear() + 1)) ? "EXPIRED" : "ACTIVE",
    roScore: 90,
    breakdown: {
      serviceStatus: "GOOD",
      filterStatus: "GOOD",
      membraneStatus: "GOOD",
      openComplaints: parsed.appointments?.filter((a: any) => a.status?.toUpperCase() !== 'COMPLETED').length || 0,
    },
    serviceUsage: {
      allocated: totalAllocated,
      used: completedServices,
      remaining: remainingServices,
    },
    amc: {
      active: !!amc,
      planName: amc?.plan || "No Active Plan",
      expiryDate: amc?.endDate,
      daysRemaining: amc?.endDate ? Math.ceil((new Date(amc.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
    },
    timeline: timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    technicianNotes: [
      "Device is running efficiently."
    ],
    rawInstallation: installation,
  };
};
