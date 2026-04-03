import { supabase } from "@/integrations/supabase/client";

export const sendTelegramNotification = async (message: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-telegram", {
      body: { message },
    });
    if (error) {
      console.error("Telegram notification error:", error);
    }
    return data;
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
};
