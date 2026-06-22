export type NotificationType = "SERVICE" | "AMC" | "REMINDER" | "PROMOTION" | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt?: string;
  timestamp?: string;
  read: boolean;
}

export const fetchNotifications = async (phone: string = "9876543210"): Promise<Notification[]> => {
  try {
    const res = await fetch(`/admin-api/customer-notifications?phone=${phone}`);
    if (res.ok) {
      const data = await res.json();
      return data.map((n: any) => ({
        ...n,
        timestamp: n.createdAt
      }));
    }
  } catch (error) {
    console.error("Failed to fetch real notifications, falling back to mock", error);
  }
  
  // Fallback to mock data if API is down
  return [
    {
      id: "n5",
      type: "SYSTEM",
      title: "Welcome to Sardarji RO",
      message: "Thanks for installing our app. We are here for pure water.",
      timestamp: new Date(Date.now() - 3600000 * 240).toISOString(),
      read: true
    }
  ];
};

export const markNotificationRead = async (id: string) => {
  // Can be implemented by PUT to /api/customer-notifications/[id]
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
};

export const markAllNotificationsRead = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
};
