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
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Simulate random failure for error state demonstration
  // if (Math.random() < 0.1) throw new Error("Network error");
  
  return {
    ticketId: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    expectedResponseTime: "Within 2 Hours",
    status: "CREATED"
  };
};
