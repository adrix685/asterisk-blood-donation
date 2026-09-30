// api.js - every call goes to the real backend. No fake data: if the server
// fails, the error is thrown so the UI can show it instead of pretending it saved.
const BASE = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

async function call(path, options = {}) {
  const token = sessionStorage.getItem("adminToken");
  let res;
  try {
    res = await fetch(BASE + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token && { Authorization: "Bearer " + token }) },
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection.");
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
export const getStats = () => call("/stats"); // { total, available, pending, activeEmergencies, inventory, activity }

// search / filter / pagination are done by the server
export const getDonors = ({ q, group, status, page, limit }) =>
  call("/donors?" + new URLSearchParams({ q, group, status, page, limit })); // { items, total }
export const updateDonor = (id, data) => call("/donors/" + id, send("PATCH", data));

export const getEmergencies = () => call("/emergencies");
export const updateEmergency = (id, data) => call("/emergencies/" + id, send("PATCH", data));
// the server picks the donor: same group, verified, 90+ days since last donation, nearest first
export const assignDonor = (id) => call(`/emergencies/${id}/assign`, send("POST", {}));

export const getHospitals = () => call("/hospitals");
export const getAudit = ({ page, limit }) => call("/audit?" + new URLSearchParams({ page, limit })); // { items, total }
export const getProfile = () => call("/profile");
export const updateProfile = (data) => call("/profile", send("PATCH", data));
export const changePassword = (current, next) => call("/profile/password", send("POST", { current, next }));
export const getSettings = () => call("/settings");
export const saveSettings = (data) => call("/settings", send("PUT", data));

export const createDonor = (data) => call("/donors", send("POST", data));