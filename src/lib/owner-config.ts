export const WHATSAPP_NUMBER = "+2348000000000"; // Replace with actual number
export const OWNER_NAME = "Mr. Solomon Adebayo";

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=${encodeURIComponent(message)}`;

export const DEFAULT_WHATSAPP_MESSAGE = `Hello ${OWNER_NAME}, I'm a property owner and I want the Thérizo 90-day Sales Audit.\n\nLocation: ___\nProperty type: ___\nAsking price: ___\nTitle: ___`;

export const ACCESS_REQUEST_MESSAGE = `Hello ${OWNER_NAME}, I'd like to request access to the Thérizo Owner Briefing.`;

export const trackEvent = (event: string, data?: Record<string, unknown>) => {
  console.log(`[therizo-analytics] ${event}`, data ?? "");
};

export const SUBMISSION_STATUSES = [
  "New",
  "Contacted",
  "Inspection",
  "Offer",
  "Closed",
  "Not Fit",
] as const;
