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
  if (!stored) throw new Error("No customer profile found");
  const parsed = JSON.parse(stored);

  try {
    const res = await fetch("http://localhost:3000/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: parsed.name,
        customerPhone: parsed.phone,
        address: parsed.address || "No Address Provided",
        type: payload.issueType,
        date: payload.preferredDate,
        time: payload.preferredSlot,
        status: "Pending",
        remarks: payload.notes
      })
    });

    if (!res.ok) throw new Error("Failed to create appointment on backend");
    
    const data = await res.json();
    return {
      ticketId: data.id,
      expectedResponseTime: "Within 2 Hours",
      status: "CREATED"
    };
  } catch (err) {
    console.error("Error creating ticket:", err);
    throw err;
  }
};
