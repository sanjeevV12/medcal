import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Fallback admin WhatsApp number in international format (no +)
export const ADMIN_WHATSAPP = "917479898265";

export type NotifyKind = "booking" | "driver";

let cached: { booking: string; driver: string } | null = null;

const sanitize = (value?: string | null) =>
  (value || "").replace(/[^0-9]/g, "") || ADMIN_WHATSAPP;

/** Reads the admin-configured WhatsApp recipients (cached for the session). */
export const getWhatsAppNumbers = async () => {
  if (cached) return cached;
  try {
    const { data } = await supabase
      .from("notification_settings")
      .select("booking_whatsapp, driver_whatsapp")
      .limit(1)
      .maybeSingle();
    cached = {
      booking: sanitize(data?.booking_whatsapp),
      driver: sanitize(data?.driver_whatsapp),
    };
  } catch {
    cached = { booking: ADMIN_WHATSAPP, driver: ADMIN_WHATSAPP };
  }
  return cached;
};

/** Clears the cache after the admin saves new numbers. */
export const clearWhatsAppCache = () => {
  cached = null;
};

/** Strip the HTML tags used in Telegram messages so WhatsApp shows clean text. */
const toPlainText = (message: string) =>
  message.replace(/<\/?[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();

export const buildWhatsAppLink = (message: string, phone: string = ADMIN_WHATSAPP) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(toPlainText(message))}`;

/**
 * Opens WhatsApp with the details pre-filled, using the recipient configured
 * by the admin for this kind of notification.
 */
export const openWhatsApp = async (message: string, kind: NotifyKind = "booking") => {
  const numbers = await getWhatsAppNumbers();
  const phone = kind === "driver" ? numbers.driver : numbers.booking;
  const url = buildWhatsAppLink(message, phone);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    toast({
      title: "Allow pop-ups to open WhatsApp",
      description: "Tap the 'Send on WhatsApp' button to share these details.",
    });
  }
  return url;
};
