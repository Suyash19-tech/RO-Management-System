export interface CreateTicketPayload {
  issueType: string;
  serviceType: "FREE" | "AMC" | "PAID";
  preferredDate: string;
  preferredSlot: string;
  notes?: string;
  photos?: string[];
}

export interface TicketResponse {
  ticketId: string;
  expectedResponseTime: string;
  status: "CREATED";
}

export const createTicket = async (payload: CreateTicketPayload): Promise<TicketResponse> => {
  if (typeof window === "undefined") throw new Error("Window not defined");
  const stored = localStorage.getItem("customer_profile");
  if (!stored || stored === "null" || stored === "undefined") throw new Error("No customer profile found");
  let parsed; try { parsed = JSON.parse(stored); } catch(e) { throw new Error("Invalid customer profile"); }
  if (!parsed) throw new Error("No customer profile found");

  try {
    const res = await fetch("http://localhost:3000/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: parsed.name,
        customerPhone: parsed.phone,
        address: parsed.address || "No Address Provided",
        type: `${payload.issueType} — ${payload.serviceType === 'FREE' ? 'Free Service' : payload.serviceType === 'AMC' ? 'AMC Service' : 'Paid Service'}`,
        date: payload.preferredDate,
        time: payload.preferredSlot,
        status: "Pending",
        remarks: payload.notes
      })
    });

    if (!res.ok) throw new Error("Failed to create appointment on backend");

    const data = await res.json();
    
    // Refresh localStorage locally to avoid CORS / latency
    try {
      if (!parsed.appointments) parsed.appointments = [];
      parsed.appointments.unshift(data); // Add to beginning
      localStorage.setItem("customer_profile", JSON.stringify(parsed));
    } catch(e) {}

    return {
      ticketId: "TKT-" + data.id.slice(-6).toUpperCase(),
      expectedResponseTime: "Within 2 Hours",
      status: "CREATED"
    };
  } catch (err) {
    console.error("Error creating ticket:", err);
    throw err;
  }
};
