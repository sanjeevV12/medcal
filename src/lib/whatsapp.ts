import { toast } from "@/hooks/use-toast";

// Admin WhatsApp number in international format (no +)
export const ADMIN_WHATSAPP = "917479898265";

/** Strip the HTML tags used in Telegram messages so WhatsApp shows clean text. */
const toPlainText = (message: string) =>
  message.replace(/<\/?[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();

export const buildWhatsAppLink = (message: string, phone: string = ADMIN_WHATSAPP) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(toPlainText(message))}`;

/**
 * Opens WhatsApp with the details pre-filled. If the browser blocks the popup,
 * the user gets a toast telling them to use the WhatsApp button instead.
 */
export const openWhatsApp = (message: string, phone: string = ADMIN_WHATSAPP) => {
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
