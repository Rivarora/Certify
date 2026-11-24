const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const API_BASE_URL = apiBaseUrl;
export const SOCKET_BASE_URL = (import.meta.env.VITE_SOCKET_URL || apiBaseUrl).replace(/\/$/, "");
