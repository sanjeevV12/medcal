import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Star, Phone, ArrowRight, Clock, Bike, Car, Plane, Truck, ChevronLeft, CreditCard, Smartphone, Building2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RideTrackingView from "./RideTrackingView";
import { sendTelegramNotification } from "@/lib/telegram";

interface AmbulanceRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type VehicleType = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  baseFare: number;
  perKm: number;
  eta: string;
  color: string;
};

const vehicleTypes: VehicleType[] = [
  { id: "medi-bike", name: "Medi-Bike", icon: <Bike className="w-6 h-6" />, description: "First aid & rapid response", baseFare: 99, perKm: 8, eta: "4-6 min", color: "text-primary" },
  { id: "medi-auto", name: "Medi-Auto", icon: <Truck className="w-5 h-5" />, description: "Narrow streets, basic care", baseFare: 199, perKm: 12, eta: "6-8 min", color: "text-primary" },
  { id: "mayuri", name: "Mayuri Van", icon: <Car className="w-6 h-6" />, description: "Patient transport, stretcher", baseFare: 499, perKm: 18, eta: "8-12 min", color: "text-accent-foreground" },
  { id: "bls", name: "BLS Ambulance", icon: <Truck className="w-6 h-6" />, description: "Basic Life Support equipped", baseFare: 999, perKm: 25, eta: "10-15 min", color: "text-warning" },
  { id: "als", name: "ALS Ambulance", icon: <Truck className="w-6 h-6" />, description: "Advanced Life Support, ICU", baseFare: 2499, perKm: 40, eta: "12-18 min", color: "text-emergency" },
  { id: "air", name: "Air Ambulance", icon: <Plane className="w-6 h-6" />, description: "Helicopter, critical cases", baseFare: 50000, perKm: 500, eta: "20-30 min", color: "text-emergency" },
];

type PaymentMethod = "upi" | "card" | "cash";

const AmbulanceRequestSheet = ({ open, onOpenChange }: AmbulanceRequestSheetProps) => {
  const [step, setStep] = useState<"location" | "vehicle" | "drivers" | "confirm" | "payment" | "booked">("location");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [distanceKm, setDistanceKm] = useState(5);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    if (open) {
      setStep("location");
      setSelectedVehicle(null);
      setPickup("");
      setDestination("");
    }
  }, [open]);

  const detectLocation = () => {
    setDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
            const data = await res.json();
            setPickup(data.display_name?.split(",").slice(0, 3).join(",") || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          } catch {
            setPickup(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          }
          setDetectingLocation(false);
        },
        () => {
          toast({ title: "Location access denied", variant: "destructive" });
          setDetectingLocation(false);
        }
      );
    }
  };

  const calculateFare = (vehicle: VehicleType) => vehicle.baseFare + vehicle.perKm * distanceKm;

  const handleLocationNext = () => {
    if (!pickup || !destination) {
      toast({ title: "Enter both pickup and destination", variant: "destructive" });
      return;
    }
    setDistanceKm(Math.floor(Math.random() * 15) + 3);
    setStep("vehicle");
  };

  const handleVehicleSelect = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setStep("drivers");
  };

  const [selectedDriver, setSelectedDriver] = useState<{ name: string; plate: string; phone: string } | null>(null);
  const [showTracking, setShowTracking] = useState(false);

  const handleDriverSelect = (driver: { name: string; plate: string; phone: string }) => {
    setSelectedDriver(driver);
    setStep("confirm");
  };

  const handleConfirmRide = () => {
    setStep("payment");
  };

  const sendTelegramBookingNotification = (driverPhone: string) => {
    if (!selectedVehicle) return;

    const fare = calculateFare(selectedVehicle);

    const msg = `🚑 <b>New Ambulance Booking!</b>\n\n📍 Pickup: ${pickup}\n🏥 Destination: ${destination}\n🚗 Vehicle: ${selectedVehicle.name}\n👤 Driver: ${selectedDriver?.name || "N/A"}\n🔢 Plate: ${selectedDriver?.plate || "N/A"}\n📞 Driver Phone: ${driverPhone}\n💰 Fare: ₹${fare.toLocaleString()}\n💳 Payment: ${paymentMethod}`;
    sendTelegramNotification(msg);
  };

  const handlePayment = async () => {
    if (paymentMethod === "upi" && !upiId) {
      toast({ title: "Enter UPI ID", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user && selectedVehicle) {
      await supabase.from("ride_requests").insert({
        user_id: user.id,
        pickup_lat: 23.2599,
        pickup_lng: 77.4126,
        ride_type: selectedVehicle.id,
        fare_estimate: calculateFare(selectedVehicle),
        distance_km: distanceKm,
        payment_method: paymentMethod,
        status: "searching",
      });
    }

    // Send Telegram notification to admin
    sendTelegramBookingNotification(selectedDriver?.phone || "");

    setStep("booked");
    toast({ title: "🚑 Ride Confirmed!", description: `Your ${selectedVehicle?.name} is on the way! Booking details sent via WhatsApp.` });
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-hero p-5 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground flex items-center gap-2 text-lg">
              {step !== "location" && step !== "booked" && (
                <button onClick={() => setStep(step === "vehicle" ? "location" : step === "drivers" ? "vehicle" : step === "confirm" ? "drivers" : step === "payment" ? "confirm" : "location")} className="p-1 rounded-full hover:bg-primary-foreground/20">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {step === "location" && "Where do you need help?"}
              {step === "vehicle" && "Choose Vehicle"}
              {step === "drivers" && "Available Nearby"}
              {step === "confirm" && "Confirm Ride"}
              {step === "payment" && "Payment"}
              {step === "booked" && "Ride Confirmed!"}
            </DialogTitle>
          </DialogHeader>
          {step === "vehicle" && (
            <p className="text-primary-foreground/80 text-sm mt-1">
              📍 {distanceKm} km estimated distance
            </p>
          )}
        </div>

        <div className="p-5">
          {/* Step 1: Location */}
          {step === "location" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  Pickup Location
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter pickup address"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={detectLocation} disabled={detectingLocation} className="shrink-0">
                    <Navigation className={`w-4 h-4 ${detectingLocation ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-px h-6 bg-border relative">
                  <div className="absolute -left-1 top-1/2 w-2.5 h-2.5 rounded-full border-2 border-muted-foreground bg-background" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emergency" />
                  Destination (Hospital)
                </label>
                <Input
                  placeholder="Enter hospital or destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <Button onClick={handleLocationNext} className="w-full" size="lg">
                Find Vehicles
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Vehicle Selection */}
          {step === "vehicle" && (
            <div className="space-y-3">
              {vehicleTypes.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary hover:bg-accent/30 transition-all text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${vehicle.color} group-hover:scale-110 transition-transform`}>
                    {vehicle.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{vehicle.name}</h4>
                      <span className="font-bold text-foreground">₹{calculateFare(vehicle).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{vehicle.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-success flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {vehicle.eta}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Available Drivers */}
          {step === "drivers" && selectedVehicle && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 mb-1">
                <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${selectedVehicle.color}`}>
                  {selectedVehicle.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedVehicle.name}</p>
                  <p className="text-xs text-muted-foreground">₹{calculateFare(selectedVehicle).toLocaleString()} estimated</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Available nearby</p>

              {[
                { name: "Rajesh Kumar", rating: 4.8, trips: 1240, eta: "3 min away", plate: "MP-09-AB-1234", photo: "RK", phone: "9876543210" },
                { name: "Sunil Verma", rating: 4.6, trips: 890, eta: "5 min away", plate: "MP-09-CD-5678", photo: "SV", phone: "9876543211" },
                { name: "Amit Sharma", rating: 4.9, trips: 2100, eta: "7 min away", plate: "MP-09-EF-9012", photo: "AS", phone: "9876543212" },
              ].map((driver, i) => (
                <button
                  key={i}
                  onClick={() => handleDriverSelect({ name: driver.name, plate: driver.plate, phone: driver.phone })}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary hover:bg-accent/30 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {driver.photo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm">{driver.name}</h4>
                      <span className="text-xs text-success font-medium">{driver.eta}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{driver.plate}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-foreground flex items-center gap-1">
                        <Star className="w-3 h-3 text-warning fill-warning" /> {driver.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">{driver.trips.toLocaleString()} trips</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === "confirm" && selectedVehicle && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary">
                <div className={`w-14 h-14 rounded-xl bg-background flex items-center justify-center ${selectedVehicle.color}`}>
                  {selectedVehicle.icon}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-lg">{selectedVehicle.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedVehicle.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-success mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="text-sm font-medium text-foreground">{pickup}</p>
                  </div>
                </div>
                <div className="ml-1.5 w-px h-4 bg-border" />
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-emergency mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm font-medium text-foreground">{destination}</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base fare</span>
                  <span className="text-foreground">₹{selectedVehicle.baseFare}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distance ({distanceKm} km × ₹{selectedVehicle.perKm})</span>
                  <span className="text-foreground">₹{selectedVehicle.perKm * distanceKm}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span className="text-foreground">Total Estimate</span>
                  <span className="text-primary text-lg">₹{calculateFare(selectedVehicle).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
                <Clock className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Estimated arrival: {selectedVehicle.eta}</p>
                  <p className="text-xs text-muted-foreground">Driver details will be shared after confirmation</p>
                </div>
              </div>

              <Button onClick={handleConfirmRide} size="lg" className="w-full" variant="emergency">
                Confirm Ride – ₹{calculateFare(selectedVehicle).toLocaleString()}
              </Button>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === "payment" && selectedVehicle && (
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-3xl font-bold text-foreground">₹{calculateFare(selectedVehicle).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: "upi" as const, label: "UPI", icon: <Smartphone className="w-5 h-5" />, sub: "GPay, PhonePe" },
                  { key: "card" as const, label: "Card", icon: <CreditCard className="w-5 h-5" />, sub: "Credit/Debit" },
                  { key: "cash" as const, label: "Cash", icon: <span className="text-lg">💵</span>, sub: "Pay after ride" },
                ]).map((pm) => (
                  <button
                    key={pm.key}
                    onClick={() => setPaymentMethod(pm.key)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${paymentMethod === pm.key ? "border-primary bg-accent/30" : "border-border"}`}
                  >
                    <div className="flex justify-center mb-1 text-primary">{pm.icon}</div>
                    <p className="text-sm font-medium text-foreground">{pm.label}</p>
                    <p className="text-[10px] text-muted-foreground">{pm.sub}</p>
                  </button>
                ))}
              </div>

              {paymentMethod === "upi" && (
                <Input placeholder="Enter UPI ID (e.g. name@upi)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              )}

              {paymentMethod === "cash" && (
                <p className="text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg">
                  💰 Pay the driver in cash after the ride is completed.
                </p>
              )}

              <Button onClick={handlePayment} size="lg" className="w-full">
                {paymentMethod === "cash" ? "Confirm Ride" : "Pay & Confirm"}
              </Button>
            </div>
          )}

          {/* Step 5: Booked */}
          {step === "booked" && selectedVehicle && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Ride Confirmed!</h3>
                <p className="text-muted-foreground text-sm mt-1">Your {selectedVehicle.name} is being assigned</p>
              </div>

              <div className="bg-secondary rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="font-medium text-foreground">{selectedVehicle.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ETA</span>
                  <span className="font-medium text-success">{selectedVehicle.eta}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fare</span>
                  <span className="font-bold text-primary">₹{calculateFare(selectedVehicle).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium text-foreground capitalize">{paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Driver details incoming</p>
                  <p className="text-xs text-muted-foreground">You'll receive a call shortly</p>
                </div>
              </div>

              <Button onClick={() => { onOpenChange(false); setShowTracking(true); }} className="w-full" size="lg" variant="emergency">
                🗺️ Track Ambulance Live
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full" size="lg">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <RideTrackingView
      isOpen={showTracking}
      onClose={() => setShowTracking(false)}
      driverName={selectedDriver?.name || "Driver"}
      driverPhone={selectedDriver?.phone || ""}
      vehiclePlate={selectedDriver?.plate || ""}
      vehicleName={selectedVehicle?.name || "Ambulance"}
      pickup={pickup}
      destination={destination}
      fare={selectedVehicle ? calculateFare(selectedVehicle) : 0}
      paymentMethod={paymentMethod}
    />
    </>
  );
};

export { AmbulanceRequestSheet };
export default AmbulanceRequestSheet;
