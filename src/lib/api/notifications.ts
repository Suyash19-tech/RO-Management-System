export type NotificationType = "SERVICE" | "AMC" | "REMINDER" | "PROMOTION" | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return [
    {
      id: "n1",
      type: "SERVICE",
      title: "Technician Assigned",
      message: "Rajesh Kumar has been assigned to your service request (TKT-4921).",
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: "n2",
      type: "REMINDER",
      title: "Filter Life Low",
      message: "Your pre-filter is nearing end of life. Book a service soon.",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: false
    },
    {
      id: "n3",
      type: "AMC",
      title: "AMC Expiring in 35 days",
      message: "Your Comprehensive Gold AMC is expiring soon. Renew now to avoid interruption in coverage.",
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      read: true
    },
    {
      id: "n4",
      type: "PROMOTION",
      title: "Monsoon Discount!",
      message: "Get 20% off on all spare parts this monsoon season.",
      timestamp: new Date(Date.now() - 3600000 * 120).toISOString(),
      read: true
    },
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
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
};

export const markAllNotificationsRead = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return true;
};
