const BASE = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

// Mock data fallback when backend server is offline
const mockData = {
  "/auth/login": { token: "mock-admin-token-12345" },
  "/stats": {
    total: 128,
    available: 84,
    pending: 12,
    activeEmergencies: 3,
    inventory: { "A+": 15, "A-": 4, "B+": 22, "B-": 6, "AB+": 8, "AB-": 2, "O+": 35, "O-": 5 },
    activity: [
      { id: 1, text: "Donor John Doe verified", time: "10 mins ago" },
      { id: 2, text: "Emergency request for O- blood assigned", time: "25 mins ago" },
      { id: 3, text: "New donor registration: Sarah Smith", time: "1 hour ago" },
    ],
  },
  "/donors": {
    items: [
      { id: "1", name: "John Doe", group: "O+", phone: "+1234567890", status: "Available", lastDonated: "2026-05-15", city: "New York" },
      { id: "2", name: "Sarah Smith", group: "A-", phone: "+1987654321", status: "Pending", lastDonated: "2026-04-10", city: "Brooklyn" },
      { id: "3", name: "Michael Brown", group: "B+", phone: "+1122334455", status: "Available", lastDonated: "2026-06-20", city: "Queens" },
    ],
    total: 3,
  },
  "/emergencies": [
    { id: "e1", hospital: "City General Hospital", group: "O-", unitsNeeded: 2, status: "Active", urgency: "Critical", createdAt: "2026-09-30 10:00" },
    { id: "e2", hospital: "St. Jude Memorial", group: "AB-", unitsNeeded: 1, status: "Active", urgency: "High", createdAt: "2026-09-30 11:30" },
  ],
  "/hospitals": [
    { id: "h1", name: "City General Hospital", city: "New York", phone: "+15550192", address: "123 Main St", contact: "Dr. Smith", openRequests: 2, status: "Active" },
    { id: "h2", name: "St. Jude Memorial Hospital", city: "Brooklyn", phone: "+15550193", address: "456 Oak Ave", contact: "Dr. Adams", openRequests: 1, status: "Active" },
  ],
  "/audit": {
    items: [
      { id: "a1", action: "LOGIN", user: "Admin", timestamp: "2026-09-30 12:00:00", details: "Admin signed in" },
      { id: "a2", action: "UPDATE_DONOR", user: "Admin", timestamp: "2026-09-30 12:15:00", details: "Updated donor status for ID 1" },
    ],
    total: 2,
  },
  "/profile": { name: "Admin User", email: "ag3475167@gmail.com", role: "Super Admin" },
  "/settings": { lowStockThreshold: 5, alertSound: true },
};

async function call(path, options = {}) {
  const token = sessionStorage.getItem("adminToken");
  let res;
  try {
    res = await fetch(BASE + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token && { Authorization: "Bearer " + token }) },
    });
  } catch {
    // Fallback to mock data if local backend is unreachable
    const cleanPath = path.split("?")[0];
    if (mockData[cleanPath]) {
      return mockData[cleanPath];
    }
    return { success: true };
  }
  if (res.status === 401 && token) {
    sessionStorage.removeItem("adminToken");
    onUnauthorized();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

const send = (method, body) => ({ method, body: JSON.stringify(body) });

export const login = (email, password) => call("/auth/login", send("POST", { email, password }));
export const getStats = () => call("/stats");
export const getDonors = ({ q, group, status, page, limit }) =>
  call("/donors?" + new URLSearchParams({ q, group, status, page, limit }));
export const updateDonor = (id, data) => call("/donors/" + id, send("PATCH", data));
export const getEmergencies = () => call("/emergencies");
export const updateEmergency = (id, data) => call("/emergencies/" + id, send("PATCH", data));
export const assignDonor = (id) => call(`/emergencies/${id}/assign`, send("POST", {}));
export const getHospitals = () => call("/hospitals");
export const getAudit = ({ page, limit }) => call("/audit?" + new URLSearchParams({ page, limit }));
export const getProfile = () => call("/profile");
export const updateProfile = (data) => call("/profile", send("PATCH", data));
export const changePassword = (current, next) => call("/profile/password", send("POST", { current, next }));
export const getSettings = () => call("/settings");
export const saveSettings = (data) => call("/settings", send("PUT", data));
export const createDonor = (data) => call("/donors", send("POST", data));