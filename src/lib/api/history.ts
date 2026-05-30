export type TicketStatus = "CREATED" | "ASSIGNED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED";

export interface Ticket {
  id: string;
  issueType: string;
  status: TicketStatus;
  createdAt: string;
  scheduledSlot?: string;
  technician?: {
    name: string;
    phone: string;
    photo?: string;
  };
  resolution?: string;
  rating?: number;
  customerNotes?: string;
  technicianRemarks?: string;
  partsReplaced?: Array<{ name: string; quantity: number; cost: number }>;
  photos?: string[];
  timeline: Array<{
    status: TicketStatus;
    timestamp: string;
    description: string;
  }>;
}

export const fetchTickets = async (): Promise<Ticket[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  return [
    {
      id: "TKT-4921",
      issueType: "Water Taste Problem",
      status: "IN_PROGRESS",
      createdAt: new Date().toISOString(),
      scheduledSlot: "Today, Morning (9-12)",
      technician: {
        name: "Rajesh Kumar",
        phone: "+91 9876543210",
        photo: "https://i.pravatar.cc/150?u=rajesh"
      },
      customerNotes: "Water is tasting slightly bitter for the last 2 days.",
      timeline: [
        { status: "CREATED", timestamp: new Date(Date.now() - 7200000).toISOString(), description: "Service request created." },
        { status: "ASSIGNED", timestamp: new Date(Date.now() - 3600000).toISOString(), description: "Assigned to Rajesh Kumar." },
        { status: "ACCEPTED", timestamp: new Date(Date.now() - 1800000).toISOString(), description: "Technician is on the way." },
        { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 900000).toISOString(), description: "Work has started." }
      ]
    },
    {
      id: "TKT-1044",
      issueType: "Filter Replacement",
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      resolution: "Replaced Carbon and Sediment Filters.",
      rating: 5,
      technicianRemarks: "Filters were heavily choked due to high TDS. Advised customer to monitor flow.",
      partsReplaced: [
        { name: "Carbon Filter", quantity: 1, cost: 450 },
        { name: "Sediment Filter", quantity: 1, cost: 350 }
      ],
      timeline: [
        { status: "CREATED", timestamp: new Date(Date.now() - 86400000 * 45).toISOString(), description: "Service request created." },
        { status: "COMPLETED", timestamp: new Date(Date.now() - 86400000 * 44).toISOString(), description: "Service successfully completed." }
      ]
    }
  ];
};

export const fetchTicketById = async (id: string): Promise<Ticket | null> => {
  const tickets = await fetchTickets();
  return tickets.find(t => t.id === id) || null;
};
