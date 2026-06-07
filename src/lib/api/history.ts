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
  paymentStatus?: string;
  costCharged?: number;
  completedAt?: string;
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
  
  let parsed = JSON.parse(stored);

  // Sync with backend to get latest admin changes (status, assigned tech, remarks)
  try {
    const res = await fetch(`http://localhost:3000/api/customers/${encodeURIComponent(parsed.phone)}`);
    if (res.ok) {
      const freshProfile = await res.json();
      localStorage.setItem("customer_profile", JSON.stringify(freshProfile));
      parsed = freshProfile;
    }
  } catch(e) {
    console.error("Failed to sync profile for tickets:", e);
  }
  
  if (!parsed.appointments || parsed.appointments.length === 0) return [];

  return parsed.appointments.map((apt: any) => {
    const isCompleted = apt.status === 'COMPLETED';
    const isPending = apt.status === 'PENDING';
    
    // Map backend status to frontend TicketStatus
    let status: TicketStatus = "CREATED";
    if (apt.status === "COMPLETED" || apt.status === "Completed") status = "COMPLETED";
    else if (apt.status === "IN_PROGRESS" || apt.status === "In Progress") status = "IN_PROGRESS";
    else if (apt.status === "SCHEDULED" || apt.status === "Scheduled") status = "ACCEPTED";
    else if (apt.status === "Reschedule Requested") status = "CREATED"; // Customer needs to see remark
    
    const timeline = [
      { status: "CREATED" as TicketStatus, timestamp: apt.createdAt, description: "Service request created." }
    ];
    
    if (apt.status === "Reschedule Requested") {
      timeline.push({ status: "CREATED" as TicketStatus, timestamp: new Date().toISOString(), description: `Admin requested reschedule.` });
    } else if (status !== "CREATED") {
      timeline.push({ status: "ASSIGNED" as TicketStatus, timestamp: apt.createdAt, description: `Assigned to ${apt.tech || 'Technician'}.` });
      timeline.push({ status: "ACCEPTED" as TicketStatus, timestamp: apt.createdAt, description: `Service appointment confirmed.` });
    }
    
    if (isCompleted) {
      timeline.push({ status: "COMPLETED" as TicketStatus, timestamp: apt.completedAt || apt.date, description: `Service completed. ${apt.remarks ? 'Remark: ' + apt.remarks : ''}` });
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
      partsReplaced: (() => { try { return apt.itemsUsed ? JSON.parse(apt.itemsUsed) : []; } catch { return []; } })(),
      paymentStatus: apt.paymentStatus || undefined,
      costCharged: apt.costCharged || 0,
      completedAt: apt.completedAt || apt.date,
      timeline
    };
  }).sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const fetchTicketById = async (id: string): Promise<Ticket | null> => {
  const tickets = await fetchTickets();
  return tickets.find(t => t.id === id) || null;
};
