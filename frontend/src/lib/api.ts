const rawBaseUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = (rawBaseUrl || "").replace(/\/$/, "");

export const apiUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const assetUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  const cleaned = path.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleaned}`;
};
