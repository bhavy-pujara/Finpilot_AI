import { formatCurrency, formatPct, formatNumber, formatDate } from "./utils";
export { formatCurrency, formatPct, formatNumber, formatDate };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("finpilot_token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("finpilot_token", token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("finpilot_token");
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = `Request failed with status ${res.status}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

// Auth API
export const api = {
  // Auth
  login: (data: any) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: any) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => apiRequest("/auth/me"),
  updateProfile: (data: any) => apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  updatePreferences: (data: any) => apiRequest("/auth/preferences", { method: "PUT", body: JSON.stringify(data) }),

  // Dashboard
  getDashboardOverview: () => apiRequest("/dashboard/overview"),

  // Instruments & Market Data
  getInstruments: (q?: string, exchange?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (exchange) params.set("exchange", exchange);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/instruments/${qs}`);
  },
  getInstrumentDetail: (symbol: string) => apiRequest(`/instruments/${symbol}`),

  // Watchlists
  getWatchlists: () => apiRequest("/watchlists/"),
  createWatchlist: (data: any) => apiRequest("/watchlists/", { method: "POST", body: JSON.stringify(data) }),
  addWatchlistItem: (watchlistId: number, data: any) =>
    apiRequest(`/watchlists/${watchlistId}/items`, { method: "POST", body: JSON.stringify(data) }),
  removeWatchlistItem: (itemId: number) => apiRequest(`/watchlists/items/${itemId}`, { method: "DELETE" }),

  // AI Assistant
  getAIConversations: () => apiRequest("/assistant/conversations"),
  createAIConversation: (data: any) => apiRequest("/assistant/conversations", { method: "POST", body: JSON.stringify(data) }),
  getAIConversationHistory: (convId: number) => apiRequest(`/assistant/conversations/${convId}`),
  sendAIMessage: (convId: number, data: any) =>
    apiRequest(`/assistant/conversations/${convId}/messages`, { method: "POST", body: JSON.stringify(data) }),

  // AI Research Reports
  generateResearchReport: (instrumentId: number) =>
    apiRequest("/research/generate", { method: "POST", body: JSON.stringify({ instrument_id: instrumentId }) }),
  getLatestResearchReport: (instrumentId: number) => apiRequest(`/research/latest/${instrumentId}`),

  // Trade Planner
  calculateTradePlan: (data: any) =>
    apiRequest("/trade-planner/calculate", { method: "POST", body: JSON.stringify(data) }),
  saveTradePlan: (data: any) =>
    apiRequest("/trade-planner/save", { method: "POST", body: JSON.stringify(data) }),
  getTradePlans: () => apiRequest("/trade-planner/"),

  // Paper Trading Engine
  getPaperAccount: (currency: string = "INR") => apiRequest(`/paper-trading/account?currency=${currency}`),
  submitPaperOrder: (data: any, currency: string = "INR") =>
    apiRequest(`/paper-trading/orders?currency=${currency}`, { method: "POST", body: JSON.stringify(data) }),
  cancelPaperOrder: (orderId: number) => apiRequest(`/paper-trading/orders/${orderId}`, { method: "DELETE" }),
  getPaperOrders: () => apiRequest("/paper-trading/orders"),
  getPaperPositions: () => apiRequest("/paper-trading/positions"),
  getPaperTransactions: () => apiRequest("/paper-trading/transactions"),

  // Portfolio
  getPortfolioSummary: () => apiRequest("/portfolio/summary"),

  // Risk Management
  getRiskMetrics: () => apiRequest("/risk/metrics"),
  getRiskProfile: () => apiRequest("/risk/profile"),
  updateRiskProfile: (data: any) => apiRequest("/risk/profile", { method: "PUT", body: JSON.stringify(data) }),

  // Trading Journal
  getJournalEntries: () => apiRequest("/journal/"),
  createJournalEntry: (data: any) => apiRequest("/journal/", { method: "POST", body: JSON.stringify(data) }),
  updateJournalEntry: (id: number, data: any) => apiRequest(`/journal/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteJournalEntry: (id: number) => apiRequest(`/journal/${id}`, { method: "DELETE" }),
  getJournalAnalytics: () => apiRequest("/journal/analytics"),

  // Notifications
  getNotifications: () => apiRequest("/notifications/"),
  markNotificationRead: (id: number) => apiRequest(`/notifications/${id}/read`, { method: "PUT" }),
  markAllNotificationsRead: () => apiRequest("/notifications/read-all", { method: "PUT" }),

  // Broker Architecture
  getBrokerConnections: () => apiRequest("/broker/connections"),
  connectBroker: (data: any) => apiRequest("/broker/connect", { method: "POST", body: JSON.stringify(data) }),
  disconnectBroker: (brokerName: string) => apiRequest(`/broker/disconnect/${brokerName}`, { method: "DELETE" }),
  getBrokerSimulatedQuote: (broker: string, symbol: string, side: string = "BUY", quantity: number = 10) =>
    apiRequest(`/broker/quote-simulated?broker=${broker}&symbol=${symbol}&side=${side}&quantity=${quantity}`),

  // Admin Dashboard
  getAdminStats: () => apiRequest("/admin/stats"),
  getAdminUsers: () => apiRequest("/admin/users"),
  toggleUserStatus: (userId: number) => apiRequest(`/admin/users/${userId}/toggle-status`, { method: "PUT" }),
  getAdminAuditLogs: () => apiRequest("/admin/audit-logs"),

  // Legal
  getLegalDoc: (name: string) => apiRequest(`/legal/${name}`),
};
