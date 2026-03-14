import { useState } from "react";
import { MapPin, Phone, Star, CreditCard, Banknote, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "./VehicleSelection";

interface BookingConfirmationProps {
  vehicle: Vehicle;
  fare: number;
  distanceKm: number;
  pickupAddress: string;
  destinationAddress: string;
  driverInfo: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
  } | null;
  status: "confirming" | "searching" | "assigned" | "en_route" | "arriving" | "completed";
  eta: number;
  progress: number;
  onPaymentSelect: (method: string) => void;
  onCancel: () => void;
  selectedPayment: string;
}

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, description: "GPay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: CreditCard, description: "Credit/Debit Card" },
  { id: "cash", label: "Cash", icon: Banknote, description: "Pay after ride" },
];

const statusMessages: Record<string, { title: string; emoji: string }> = {
  confirming: { title: "Confirm Your Booking", emoji: "📋" },
  searching: { title: "Finding your ride...", emoji: "🔍" },
  assigned: { title: "Driver Assigned!", emoji: "✅" },
  en_route: { title: "On the way to you", emoji: "🚑" },
  arriving: { title: "Almost there!", emoji: "📍" },
  completed: { title: "Ride Completed", emoji: "🎉" },
};

const BookingConfirmation = ({
  vehicle,
  fare,
  distanceKm,
  pickupAddress,
  destinationAddress,
  driverInfo,
  status,
  eta,
  progress,
  onPaymentSelect,
  onCancel,
  selectedPayment,
}: BookingConfirmationProps) => {
  const msg = statusMessages[status];

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className="text-center">
        <span className="text-3xl">{msg.emoji}</span>
        <h2 className="text-lg font-bold text-foreground mt-1">{msg.title}</h2>
      </div>

      {/* Progress bar (visible during active ride) */}
      {status !== "confirming" && status !== "completed" && (
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{status === "searching" ? "Searching..." : `ETA: ${eta} min`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Driver info */}
      {driverInfo && status !== "confirming" && status !== "searching" && (
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
            👨‍⚕️
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-foreground">{driverInfo.name}</p>
            <p className="text-xs text-muted-foreground">{driverInfo.vehicle}</p>
            <div className="flex items-center gap-1 text-xs text-warning">
              <Star className="w-3 h-3 fill-warning" />
              {driverInfo.rating}
            </div>
          </div>
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <a href={`tel:${driverInfo.phone}`}>
              <Phone className="w-4 h-4 text-success" />
            </a>
          </Button>
        </div>
      )}

      {/* Ride summary */}
      <div className="p-3 bg-muted/50 rounded-xl space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-success mt-1.5 shrink-0" />
          <p className="text-sm text-foreground">{pickupAddress}</p>
        </div>
        <div className="ml-1 w-0.5 h-4 bg-border" />
        <div className="flex items-start gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-emergency mt-1.5 shrink-0" />
          <p className="text-sm text-foreground">{destinationAddress}</p>
        </div>
      </div>

      {/* Vehicle + fare info */}
      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{vehicle.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{vehicle.name}</p>
            <p className="text-xs text-muted-foreground">{distanceKm.toFixed(1)} km</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">₹{fare}</p>
          <p className="text-[10px] text-muted-foreground">Estimated fare</p>
        </div>
      </div>

      {/* Payment method (only in confirming stage) */}
      {status === "confirming" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Payment Method</p>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isActive = selectedPayment === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => onPaymentSelect(method.id)}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-primary/5 border-primary"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {status === "confirming" && (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={!selectedPayment}>
            Confirm Booking
          </Button>
        </div>
      )}

      {status === "completed" && (
        <div className="space-y-3 text-center">
          <div className="p-4 bg-success/10 border border-success/30 rounded-xl">
            <p className="text-success font-semibold">Ride completed successfully!</p>
            <p className="text-2xl font-bold text-foreground mt-1">₹{fare}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Paid via {selectedPayment.toUpperCase()}
            </p>
          </div>
          <Button className="w-full" onClick={onCancel}>
            Done
          </Button>
        </div>
      )}

      {(status === "searching" || status === "assigned" || status === "en_route" || status === "arriving") && (
        <Button variant="destructive" className="w-full" onClick={onCancel}>
          Cancel Ride
        </Button>
      )}
    </div>
  );
};

export default BookingConfirmation;
