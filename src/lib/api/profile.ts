export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  customerSince: string;
  avatar?: string;
  addresses: Array<{
    id: string;
    label: string;
    fullAddress: string;
    isPrimary: boolean;
  }>;
  roSummary: {
    totalUnits: number;
    amcStatus: "ACTIVE" | "EXPIRED" | "NONE";
    totalServices: number;
  };
  settings: {
    pushNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    darkMode: boolean;
  };
}

export const fetchProfile = async (): Promise<UserProfile> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return {
    id: "cus_01",
    name: "Rahul Sharma",
    phone: "+91 9876543210",
    email: "rahul.sharma@example.com",
    customerSince: "2023-05-30T00:00:00.000Z",
    addresses: [
      {
        id: "addr_1",
        label: "Home",
        fullAddress: "142 Model Town, Near Gulati Chowk, Ludhiana, Punjab 141002",
        isPrimary: true
      },
      {
        id: "addr_2",
        label: "Office",
        fullAddress: "Phase 8, Industrial Area, Mohali, Punjab",
        isPrimary: false
      }
    ],
    roSummary: {
      totalUnits: 1,
      amcStatus: "ACTIVE",
      totalServices: 4
    },
    settings: {
      pushNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      darkMode: false
    }
  };
};

export const updateProfile = async (data: Partial<UserProfile>) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return true;
};
