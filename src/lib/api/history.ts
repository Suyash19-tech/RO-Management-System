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
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("customer_profile");
  if (!stored) return [];
  
  const parsed = JSON.parse(stored);
  
  if (!parsed.appointments || parsed.appointments.length === 0) return [];

  return parsed.appointments.map((apt: any) => {
    const isCompleted = apt.status === 'COMPLETED';
    const isPending = apt.status === 'PENDING';
    
    // Map backend status to frontend TicketStatus
    let status: TicketStatus = "CREATED";
    if (apt.status === "COMPLETED") status = "COMPLETED";
    else if (apt.status === "IN_PROGRESS") status = "IN_PROGRESS";
    else if (apt.status === "SCHEDULED") status = "ASSIGNED";
    
    const timeline = [
      { status: "CREATED" as TicketStatus, timestamp: apt.createdAt, description: "Service request created." }
    ];
    
    if (status !== "CREATED" && status !== "ASSIGNED") {
      timeline.push({ status: "ASSIGNED" as TicketStatus, timestamp: apt.createdAt, description: `Assigned to ${apt.tech || 'Technician'}.` });
    }
    
    if (isCompleted) {
      timeline.push({ status: "COMPLETED" as TicketStatus, timestamp: apt.completedAt || apt.date, description: "Service successfully completed." });
    }

    return {
      id: "TKT-" + apt.id.slice(0, 4).toUpperCase(),
      issueType: apt.type,
      status: status,
      createdAt: apt.createdAt,
      scheduledSlot: apt.time,
      technician: apt.tech ? {
        name: apt.tech,
        phone: "N/A",
      } : undefined,
      resolution: apt.remarks,
      rating: isCompleted ? 5 : undefined,
      technicianRemarks: apt.remarks,
      partsReplaced: apt.itemsUsed ? apt.itemsUsed.split(',').map((i: string) => ({ name: i.trim(), quantity: 1, cost: 0 })) : [],
      timeline
    };
  }).sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const fetchTicketById = async (id: string): Promise<Ticket | null> => {
  const tickets = await fetchTickets();
  return tickets.find(t => t.id === id) || null;
};
