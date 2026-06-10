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

export const fetchProfile = async (): Promise<UserProfile | null> => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("customer_profile");
  if (!stored || stored === "null" || stored === "undefined") return null;
  let parsed; try { parsed = JSON.parse(stored); } catch(e) { return null; }
  if (!parsed) return null;
  
  // Attempt to fetch fresh data
  try {
    const res = await fetch(`/admin-api/customers/${parsed.phone}`);
    if (res.ok) {
      const fresh = await res.json();
      localStorage.setItem("customer_profile", JSON.stringify(fresh));
      Object.assign(parsed, fresh);
    }
  } catch (e) {
    console.error("Could not fetch fresh profile", e);
  }

  return {
    id: parsed.id,
    name: parsed.name || "Unknown",
    phone: parsed.phone,
    email: parsed.email || "",
    customerSince: parsed.createdAt,
    addresses: [
      {
        id: "addr_1",
        label: "Primary Address",
        fullAddress: parsed.address || "N/A",
        isPrimary: true
      }
    ],
    roSummary: {
      totalUnits: parsed.installations?.length || 0,
      amcStatus: parsed.amcs?.some((a: any) => a.status === 'ACTIVE') ? "ACTIVE" : "NONE",
      totalServices: parsed.appointments?.filter((a: any) => a.status?.toUpperCase() === 'COMPLETED').length || 0
    },
    settings: {
      pushNotifications: true,
      smsNotifications: true,
      whatsappNotifications: true,
      darkMode: false
    }
  };
};

export const updateProfile = async (data: Partial<UserProfile>) => {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("customer_profile");
  if (!stored || stored === "null" || stored === "undefined") return false;
  let parsed; try { parsed = JSON.parse(stored); } catch(e) { return false; }
  if (!parsed) return false;

  try {
    const res = await fetch(`/admin-api/customers/${parsed.phone}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        address: data.addresses?.[0]?.fullAddress
      })
    });
    if (res.ok) {
      const updated = await res.json();
      localStorage.setItem("customer_profile", JSON.stringify({ ...parsed, ...updated }));
      return true;
    }
  } catch (e) {
    console.error("Failed to update profile", e);
  }
  return false;
};
