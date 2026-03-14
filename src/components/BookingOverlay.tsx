import { useState, useEffect, useCallback, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LocationInput from "./booking/LocationInput";
import VehicleSelection, { type Vehicle } from "./booking/VehicleSelection";
import BookingConfirmation from "./booking/BookingConfirmation";
import EmergencyMap from "./EmergencyMap";

type BookingStep = "location" | "vehicle" | "ride";

interface BookingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingOverlay = ({ isOpen, onClose }: BookingOverlayProps) => {
  const [step, setStep] = useState<BookingStep>("location");

  // Location state
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Vehicle state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [fare, setFare] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);

  // Ride state
  const [rideStatus, setRideStatus] = useState<"confirming" | "searching" | "assigned" | "en_route" | "arriving" | "completed">("confirming");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [eta, setEta] = useState(10);
  const [progress, setProgress] = useState(0);
  const [ambulanceLocation, setAmbulanceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const rideStatusRef = useRef(rideStatus);

  const [driverInfo] = useState({
    name: "Rajesh Kumar",
    phone: "+91-9876543210",
    vehicle: "MH-12-AB-1234",
    rating: 4.8,
  });

  // Map data
  const [hospitals, setHospitals] = useState<{ id: string; name: string; address: string; lat: number; lng: number; distance?: number }[]>([]);

  useEffect(() => {
    rideStatusRef.current = rideStatus;
  }, [rideStatus]);

  // Auto-detect location on open
  useEffect(() => {
    if (isOpen && !pickupCoords) {
      detectLocation();
    }
  }, [isOpen]);

  // Ride simulation
  useEffect(() => {
    if (rideStatus !== "en_route" && rideStatus !== "arriving") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 2, 100);
        if (next >= 50 && rideStatusRef.current === "en_route") {
          setRideStatus("arriving");
          setTimeout(() => toast({ title: "📍 Almost there!", description: "Your ride is arriving" }), 0);
        }
        if (next >= 100) {
          setRideStatus("completed");
          setTimeout(() => toast({ title: "✅ Ride Completed!", description: `You've arrived at ${destinationAddress}` }), 0);
        }
        return next;
      });

      setEta((prev) => Math.max(0, prev - 1));

      // Move ambulance toward pickup, then destination
      if (pickupCoords && destinationCoords) {
        setAmbulanceLocation((prev) => {
          if (!prev) return prev;
          const step = 0.002;
          const target = rideStatusRef.current === "arriving" ? destinationCoords : pickupCoords;
          return {
            lat: prev.lat + (target.lat > prev.lat ? step : target.lat < prev.lat ? -step : 0),
            lng: prev.lng + (target.lng > prev.lng ? step : target.lng < prev.lng ? -step : 0),
          };
        });
      }
    }, 800);

    return () => clearInterval(interval);
  }, [rideStatus, pickupCoords, destinationCoords, destinationAddress]);

  const detectLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPickupCoords(coords);
          setPickupAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
          setIsLocating(false);
          toast({ title: "📍 Location Detected", description: "Your current location has been set as pickup" });

          // Reverse geocode attempt (simple)
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`)
            .then((r) => r.json())
            .then((data) => {
              if (data.display_name) {
                const short = data.display_name.split(",").slice(0, 3).join(", ");
                setPickupAddress(short);
              }
            })
            .catch(() => {});
        },
        () => {
          const defaultCoords = { lat: 23.2599, lng: 77.4126 };
          setPickupCoords(defaultCoords);
          setPickupAddress("Bhopal Center (default)");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const defaultCoords = { lat: 23.2599, lng: 77.4126 };
      setPickupCoords(defaultCoords);
      setPickupAddress("Bhopal Center (default)");
      setIsLocating(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleLocationConfirm = () => {
    if (!pickupCoords || !destinationCoords) return;
    const dist = calculateDistance(pickupCoords.lat, pickupCoords.lng, destinationCoords.lat, destinationCoords.lng);
    setDistanceKm(dist);
    setStep("vehicle");
  };

  const handleVehicleSelect = (vehicle: Vehicle, calculatedFare: number) => {
    setSelectedVehicle(vehicle);
    setFare(calculatedFare);
    setEta(vehicle.eta);
    setRideStatus("confirming");
    setProgress(0);
    setStep("ride");
  };

  const handleConfirmBooking = async () => {
    setRideStatus("searching");
    toast({ title: "🔍 Searching...", description: "Finding available drivers nearby" });

    // Set ambulance location offset from pickup
    if (pickupCoords) {
      setAmbulanceLocation({
        lat: pickupCoords.lat + 0.02 + Math.random() * 0.01,
        lng: pickupCoords.lng + 0.02 + Math.random() * 0.01,
      });
    }

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user && pickupCoords) {
      await supabase.from("ride_requests").insert({
        user_id: user.id,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        destination_hospital_id: null,
        ride_type: selectedVehicle?.type || "emergency",
        fare_estimate: fare,
        distance_km: distanceKm,
        payment_method: paymentMethod,
        status: "searching",
      });
    }

    setTimeout(() => {
      setRideStatus("assigned");
      toast({ title: "✅ Driver Assigned!", description: `${driverInfo.name} is on the way` });
    }, 2500);

    setTimeout(() => {
      setRideStatus("en_route");
    }, 4000);
  };

  const handleCancel = () => {
    if (rideStatus === "confirming") {
      setStep("vehicle");
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setStep("location");
    setRideStatus("confirming");
    setProgress(0);
    setAmbulanceLocation(null);
    setSelectedVehicle(null);
    onClose();
  };

  // Compute map center
  const mapCenter = pickupCoords || { lat: 23.2599, lng: 77.4126 };
  const showAmbulance = ["assigned", "en_route", "arriving"].includes(rideStatus) && step === "ride";

  // Build hospital list for map
  const mapHospitals = destinationCoords
    ? [{ id: "dest", name: destinationAddress, address: "", lat: destinationCoords.lat, lng: destinationCoords.lng }]
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-emergency text-emergency-foreground p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <h2 className="font-bold text-base">
            {step === "location" && "Set Location"}
            {step === "vehicle" && "Choose Vehicle"}
            {step === "ride" && "Your Ride"}
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-emergency-foreground hover:bg-emergency-foreground/20 h-8 w-8">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <EmergencyMap
          userLocation={mapCenter}
          ambulanceLocation={ambulanceLocation}
          hospitals={mapHospitals}
          selectedHospitalId={destinationCoords ? "dest" : null}
          onHospitalSelect={() => {}}
          showAmbulance={showAmbulance}
          showRouteToHospital={rideStatus === "arriving" && !!destinationCoords}
          selectedHospital={destinationCoords ? { id: "dest", name: destinationAddress, address: "", lat: destinationCoords.lat, lng: destinationCoords.lng } : null}
        />
      </div>

      {/* Bottom sheet */}
      <div className="bg-card border-t border-border rounded-t-3xl p-4 shadow-lg max-h-[55vh] overflow-y-auto shrink-0">
        {step === "location" && (
          <LocationInput
            pickupAddress={pickupAddress}
            destinationAddress={destinationAddress}
            pickupCoords={pickupCoords}
            destinationCoords={destinationCoords}
            onPickupChange={(addr, coords) => {
              setPickupAddress(addr);
              if (coords) setPickupCoords(coords);
            }}
            onDestinationChange={(addr, coords) => {
              setDestinationAddress(addr);
              setDestinationCoords(coords);
            }}
            onConfirm={handleLocationConfirm}
            isLocating={isLocating}
            onDetectLocation={detectLocation}
          />
        )}

        {step === "vehicle" && pickupCoords && destinationCoords && (
          <VehicleSelection
            distanceKm={distanceKm}
            onSelect={handleVehicleSelect}
            onBack={() => setStep("location")}
            pickupAddress={pickupAddress}
            destinationAddress={destinationAddress}
          />
        )}

        {step === "ride" && selectedVehicle && (
          <div>
            <BookingConfirmation
              vehicle={selectedVehicle}
              fare={fare}
              distanceKm={distanceKm}
              pickupAddress={pickupAddress}
              destinationAddress={destinationAddress}
              driverInfo={rideStatus !== "confirming" && rideStatus !== "searching" ? driverInfo : null}
              status={rideStatus}
              eta={eta}
              progress={progress}
              onPaymentSelect={setPaymentMethod}
              onCancel={handleCancel}
              selectedPayment={paymentMethod}
            />
            {rideStatus === "confirming" && (
              <Button className="w-full mt-3" size="lg" onClick={handleConfirmBooking}>
                Confirm & Book
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingOverlay;
