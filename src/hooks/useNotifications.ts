import { toast } from "@/hooks/use-toast";

interface NotificationData {
  type: 'booking_confirmation' | 'payment_receipt' | 'responder_assigned' | 'service_complete';
  phone: string;
  name: string;
  serviceType: string;
  amount?: string;
  bookingId?: string;
  responderName?: string;
}

export const sendNotification = async (data: NotificationData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const messages: Record<NotificationData['type'], { title: string; body: string }> = {
    booking_confirmation: {
      title: "📱 SMS Sent!",
      body: `Booking confirmation sent to ${data.phone}\n\nHi ${data.name}, your ${data.serviceType} booking is confirmed. Booking ID: ${data.bookingId || 'MED' + Date.now().toString().slice(-8)}`
    },
    payment_receipt: {
      title: "📱 Receipt Sent!",
      body: `Payment receipt sent to ${data.phone}\n\nHi ${data.name}, payment of ${data.amount} for ${data.serviceType} received successfully.`
    },
    responder_assigned: {
      title: "📱 Update Sent!",
      body: `Notification sent to ${data.phone}\n\nHi ${data.name}, ${data.responderName || 'Your responder'} has been assigned and is on the way.`
    },
    service_complete: {
      title: "📱 Thank You Sent!",
      body: `Feedback request sent to ${data.phone}\n\nHi ${data.name}, thank you for using our ${data.serviceType} service. Rate your experience!`
    }
  };

  const message = messages[data.type];
  
  toast({
    title: message.title,
    description: message.body.split('\n\n')[1],
  });

  console.log(`[Demo Notification] ${data.type}:`, {
    to: data.phone,
    message: message.body
  });

  return { success: true, type: 'demo' };
};

export const sendWhatsAppNotification = async (data: NotificationData) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  toast({
    title: "💬 WhatsApp Sent!",
    description: `Message sent to ${data.phone} via WhatsApp`,
  });

  console.log(`[Demo WhatsApp] ${data.type}:`, data);

  return { success: true, type: 'demo' };
};
