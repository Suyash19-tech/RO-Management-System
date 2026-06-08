export type TicketStatus = "CREATED" | "ASSIGNED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "RESCHEDULE_REQUESTED";

export interface Ticket {
  id: string;
  rawId: string;
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
  rescheduleCount: number;
}

export const fetchTickets = async (): Promise<Ticket[]> => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("customer_profile");
  if (!stored || stored === "null" || stored === "undefined") return [];
  
  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch (e) {
    return [];
  }
  
  if (!parsed || !parsed.phone) return [];

  // Sync with backend to get latest admin changes (status, assigned tech, remarks)
  try {
    const res = await fetch(`http://localhost:3000/api/customers/${encodeURIComponent(parsed.phone)}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const freshProfile = await res.json();
      localStorage.setItem("customer_profile", JSON.stringify(freshProfile));
      parsed = freshProfile;
    }
  } catch(e) {
    // Backend unavailable – use cached profile, no error logging
  }
  
  if (!parsed.appointments || !Array.isArray(parsed.appointments) || parsed.appointments.length === 0) return [];

  return parsed.appointments.map((apt: any) => {
    const isCompleted = apt.status === 'COMPLETED';
    const isPending = apt.status === 'PENDING';
    
    // Map backend status to frontend TicketStatus
    let status: TicketStatus = "CREATED";
    if (apt.status === "COMPLETED" || apt.status === "Completed") status = "COMPLETED";
    else if (apt.status === "IN_PROGRESS" || apt.status === "In Progress") status = "IN_PROGRESS";
    else if (apt.status === "SCHEDULED" || apt.status === "Scheduled") status = "ACCEPTED";
    else if (apt.status === "Reschedule Requested") status = "RESCHEDULE_REQUESTED";
    
    const timeline = [
      { status: "CREATED" as TicketStatus, timestamp: apt.createdAt, description: "Service request created." }
    ];
    
    if (apt.status === "Reschedule Requested") {
      timeline.push({ status: "RESCHEDULE_REQUESTED" as TicketStatus, timestamp: new Date().toISOString(), description: `Admin requested reschedule.` });
    } else if (apt.rescheduleCount > 0) {
      timeline.push({ status: "ACCEPTED" as TicketStatus, timestamp: apt.createdAt, description: `Initial appointment confirmed.` });
      timeline.push({ status: "RESCHEDULE_REQUESTED" as TicketStatus, timestamp: apt.updatedAt || new Date().toISOString(), description: `Customer rescheduled appointment.` });
      
      if (status !== "CREATED") {
        timeline.push({ status: "ASSIGNED" as TicketStatus, timestamp: apt.updatedAt || apt.createdAt, description: `Assigned to ${apt.tech || 'Technician'}.` });
        timeline.push({ status: "ACCEPTED" as TicketStatus, timestamp: apt.updatedAt || apt.createdAt, description: `New service appointment confirmed.` });
      }
    } else if (status !== "CREATED") {
      timeline.push({ status: "ASSIGNED" as TicketStatus, timestamp: apt.createdAt, description: `Assigned to ${apt.tech || 'Technician'}.` });
      timeline.push({ status: "ACCEPTED" as TicketStatus, timestamp: apt.createdAt, description: `Service appointment confirmed.` });
    }
    
    if (isCompleted) {
      timeline.push({ status: "COMPLETED" as TicketStatus, timestamp: apt.completedAt || apt.date, description: `Service completed. ${apt.remarks ? 'Remark: ' + apt.remarks : ''}` });
    }

    return {
      id: "TKT-" + apt.id.slice(-6).toUpperCase(),
      rawId: apt.id,
      issueType: apt.type,
      status: status,
      createdAt: apt.createdAt,
      scheduledSlot: apt.time,
      technician: apt.tech && apt.tech !== 'Unassigned' ? {
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
      timeline,
      rescheduleCount: apt.rescheduleCount || 0
    };
  }).sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const fetchTicketById = async (id: string): Promise<Ticket | null> => {
  const tickets = await fetchTickets();
  return tickets.find(t => t.id === id) || null;
};

export const rescheduleTicket = async (rawId: string, newDate: string, newTime: string, incrementReschedule?: boolean): Promise<boolean> => {
  try {
    const res = await fetch(`http://localhost:3000/api/appointments/${rawId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: newDate,
        time: newTime,
        status: 'Pending',
        tech: 'Unassigned',
        remarks: `Customer selected new slot: ${newDate} ${newTime}`,
        ...(incrementReschedule && { incrementReschedule: true })
      })
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to reschedule ticket:", err);
    return false;
  }
};
