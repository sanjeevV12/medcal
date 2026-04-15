import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation, Star, Phone, ArrowRight, Clock, Bike, Car, Plane, Truck, ChevronLeft, CreditCard, Smartphone, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RideTrackingView from "./RideTrackingView";
import { sendTelegramNotification } from "@/lib/telegram";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  { id: "medi-bike", name: "Medi-Bike", icon: <Bike className="w-6 h-6" />, description: "First aid & rapid response", baseFare: 0, perKm: 50, eta: "", color: "text-primary" },
  { id: "medi-auto", name: "Medi-Auto", icon: <Truck className="w-5 h-5" />, description: "Narrow streets, basic care", baseFare: 0, perKm: 55, eta: "", color: "text-primary" },
  { id: "mayuri", name: "Mayuri Van", icon: <Car className="w-6 h-6" />, description: "Patient transport, stretcher", baseFare: 0, perKm: 60, eta: "", color: "text-accent-foreground" },
  { id: "bls", name: "BLS Ambulance", icon: <Truck className="w-6 h-6" />, description: "Basic Life Support equipped", baseFare: 0, perKm: 65, eta: "", color: "text-warning" },
  { id: "als", name: "ALS Ambulance", icon: <Truck className="w-6 h-6" />, description: "Advanced Life Support, ICU", baseFare: 0, perKm: 70, eta: "", color: "text-emergency" },
  { id: "air", name: "Air Ambulance", icon: <Plane className="w-6 h-6" />, description: "Helicopter, critical cases", baseFare: 5000, perKm: 75, eta: "", color: "text-emergency" },
];

type PaymentMethod = "upi" | "card" | "cash";

const BHOPAL_CENTER = { lat: 23.2599, lng: 77.4126 };

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const AmbulanceRequestSheet = ({ open, onOpenChange }: AmbulanceRequestSheetProps) => {
  const [step, setStep] = useState<"vehicle" | "drivers" | "confirm" | "booked" | "complete" | "payment" | "done">("vehicle");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [distanceKm, setDistanceKm] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(BHOPAL_CENTER);
  const [userAddress, setUserAddress] = useState("Detecting location...");
  const [detectingLocation, setDetectingLocation] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<{ name: string; plate: string; phone: string } | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [dbDrivers, setDbDrivers] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [nearbyHospital, setNearbyHospital] = useState<{ name: string; distance: number } | null>(null);
  const [nearestDriverDistances, setNearestDriverDistances] = useState<Record<string, number>>({});

  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const vehicleMarkersRef = useRef<L.LayerGroup | null>(null);
  const pulseRef = useRef<L.Circle | null>(null);

  // Auto-detect location on open
  useEffect(() => {
    if (!open) return;
    setStep("vehicle");
    setSelectedVehicle(null);
    setSelectedDriver(null);
    setDetectingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`);
            const data = await res.json();
            setUserAddress(data.display_name?.split(",").slice(0, 3).join(",") || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
          } catch {
            setUserAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
          }
          // Find nearest hospital for distance estimation
          fetchNearestHospital(coords.lat, coords.lng);
          setDetectingLocation(false);
        },
        () => {
          setUserCoords(BHOPAL_CENTER);
          setUserAddress("Bhopal Center (Location denied)");
          fetchNearestHospital(BHOPAL_CENTER.lat, BHOPAL_CENTER.lng);
          setDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setDetectingLocation(false);
      fetchNearestHospital(BHOPAL_CENTER.lat, BHOPAL_CENTER.lng);
    }
  }, [open]);

  const fetchNearestHospital = async (lat: number, lng: number) => {
    const { data } = await supabase.from("hospitals").select("name, latitude, longitude").eq("emergency_available", true).not("latitude", "is", null);
    if (data && data.length > 0) {
      const sorted = data.map(h => ({
        name: h.name,
        distance: haversineDistance(lat, lng, Number(h.latitude), Number(h.longitude))
      })).sort((a, b) => a.distance - b.distance);
      setNearbyHospital(sorted[0]);
      setDistanceKm(Math.max(1, Math.round(sorted[0].distance * 10) / 10));
    } else {
      setDistanceKm(5);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!open || !mapRef.current) return;
    
    // Cleanup previous
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      const map = L.map(mapRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      markersRef.current = L.layerGroup().addTo(map);
      vehicleMarkersRef.current = L.layerGroup().addTo(map);
      mapInstance.current = map;

      // User location marker
      const userIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="position:relative"><div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div><div style="position:absolute;top:-5px;left:-5px;width:30px;height:30px;border-radius:50%;border:2px solid #3b82f6;opacity:0.4;animation:ping 1.5s infinite"></div></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(markersRef.current!);

      // Pulse circle
      pulseRef.current = L.circle([userCoords.lat, userCoords.lng], {
        radius: 500,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.3,
      }).addTo(map);

      // Add animated vehicle markers around user
      addVehicleMarkers(map, userCoords.lat, userCoords.lng);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [open, userCoords, step]);

  const addVehicleMarkers = (map: L.Map, lat: number, lng: number) => {
    if (!vehicleMarkersRef.current) return;
    vehicleMarkersRef.current.clearLayers();

    const vehicles = [
      { emoji: "🏍️", offset: [0.008, 0.012], label: "Medi-Bike" },
      { emoji: "🛺", offset: [-0.006, 0.009], label: "Medi-Auto" },
      { emoji: "🚐", offset: [0.01, -0.007], label: "Mayuri Van" },
      { emoji: "🚑", offset: [-0.012, -0.005], label: "BLS" },
      { emoji: "🚑", offset: [0.005, -0.013], label: "ALS" },
      { emoji: "🚁", offset: [-0.015, 0.015], label: "Air" },
    ];

    const markerRefs: { marker: L.Marker; basePos: [number, number]; angle: number }[] = [];

    vehicles.forEach((v, i) => {
      const vLat = lat + v.offset[0] + (Math.random() - 0.5) * 0.004;
      const vLng = lng + v.offset[1] + (Math.random() - 0.5) * 0.004;
      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));transition:transform 0.5s">${v.emoji}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([vLat, vLng], { icon }).addTo(vehicleMarkersRef.current!);
      marker.bindTooltip(v.label, { direction: "top", offset: [0, -10], className: "text-xs" });
      markerRefs.push({ marker, basePos: [vLat, vLng], angle: Math.random() * Math.PI * 2 });
    });

    // Animate vehicle movement with smooth trajectories toward user
    const animateInterval = setInterval(() => {
      markerRefs.forEach((ref) => {
        ref.angle += 0.04 + Math.random() * 0.03;
        // Drift toward user with orbital motion
        const driftLat = (lat - ref.basePos[0]) * 0.002;
        const driftLng = (lng - ref.basePos[1]) * 0.002;
        ref.basePos[0] += driftLat;
        ref.basePos[1] += driftLng;
        const radius = 0.003 + Math.sin(ref.angle * 0.5) * 0.001;
        const newLat = ref.basePos[0] + Math.sin(ref.angle) * radius;
        const newLng = ref.basePos[1] + Math.cos(ref.angle * 0.8) * radius;
        ref.marker.setLatLng([newLat, newLng]);
      });
    }, 600);

    // Store for cleanup
    (map as any)._vehicleAnimInterval = animateInterval;

    map.on("remove", () => clearInterval(animateInterval));
  };

  // Update map center when coords change
  useEffect(() => {
    if (mapInstance.current && userCoords) {
      mapInstance.current.setView([userCoords.lat, userCoords.lng], 14);
    }
  }, [userCoords]);

  // Fetch nearest driver distances for ETA calculation
  useEffect(() => {
    if (!open || detectingLocation) return;
    const fetchDriverDistances = async () => {
      const { data } = await supabase
        .from("drivers")
        .select("vehicle_type, latitude, longitude, is_available")
        .eq("is_available", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      if (!data) return;
      const distances: Record<string, number> = {};
      vehicleTypes.forEach((v) => {
        const typeDrivers = data.filter((d) => d.vehicle_type === v.id);
        if (typeDrivers.length > 0) {
          const nearest = typeDrivers.reduce((min, d) => {
            const dist = haversineDistance(userCoords.lat, userCoords.lng, Number(d.latitude), Number(d.longitude));
            return dist < min ? dist : min;
          }, Infinity);
          distances[v.id] = nearest;
        }
      });
      setNearestDriverDistances(distances);
    };
    fetchDriverDistances();
  }, [open, detectingLocation, userCoords]);

  const getDriverEta = (vehicleId: string): string => {
    const dist = nearestDriverDistances[vehicleId];
    if (dist === undefined) return "~10 min";
    // Assume avg speed: bike 40km/h, auto 30km/h, van 35km/h, ambulance 45km/h, air 120km/h
    const speeds: Record<string, number> = { "medi-bike": 40, "medi-auto": 30, "mayuri": 35, "bls": 45, "als": 45, "air": 120 };
    const speed = speeds[vehicleId] || 35;
    const etaMin = Math.max(1, Math.round((dist / speed) * 60));
    return `${etaMin} min`;
  };

  const calculateFare = (vehicle: VehicleType) => vehicle.baseFare + vehicle.perKm * distanceKm;

  const fetchDrivers = useCallback(async (vehicleType: string) => {
    setLoadingDrivers(true);
    const { data } = await supabase
      .from("drivers")
      .select("*")
      .eq("vehicle_type", vehicleType)
      .order("is_available", { ascending: false })
      .limit(10);
    setDbDrivers(data || []);
    setLoadingDrivers(false);
  }, []);

  // Real-time driver availability subscription
  useEffect(() => {
    if (!selectedVehicle || step !== "drivers") return;
    const channel = supabase
      .channel('driver-availability')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers', filter: `vehicle_type=eq.${selectedVehicle.id}` }, () => {
        fetchDrivers(selectedVehicle.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedVehicle, step, fetchDrivers]);

  const handleVehicleSelect = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    fetchDrivers(vehicle.id);
    setStep("drivers");
  };

  const handleDriverSelect = (driver: { name: string; plate: string; phone: string }) => {
    setSelectedDriver(driver);
    setStep("confirm");
  };

  const sendTelegramBookingNotification = (driverPhone: string) => {
    if (!selectedVehicle) return;
    const fare = calculateFare(selectedVehicle);
    const msg = `🚑 <b>New Ambulance Booking!</b>\n\n📍 Location: ${userAddress}\n📏 Distance: ${distanceKm} km\n🚗 Vehicle: ${selectedVehicle.name}\n💰 Total Fare: ₹${fare.toLocaleString()}\n👤 Driver: ${selectedDriver?.name || "N/A"}\n🔢 Plate: ${selectedDriver?.plate || "N/A"}\n📞 Driver Phone: ${driverPhone}\n💳 Payment: Pay after service`;
    sendTelegramNotification(msg);
  };

  const handleConfirmRide = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && selectedVehicle) {
      await supabase.from("ride_requests").insert({
        user_id: user.id,
        pickup_lat: userCoords.lat,
        pickup_lng: userCoords.lng,
        ride_type: selectedVehicle.id,
        fare_estimate: calculateFare(selectedVehicle),
        distance_km: distanceKm,
        payment_method: "pending",
        payment_status: "pending",
        status: "confirmed",
      });
    }
    sendTelegramBookingNotification(selectedDriver?.phone || "");
    setStep("booked");
    toast({ title: "🚑 Ride Confirmed!", description: `Your ${selectedVehicle?.name} is on the way!` });
  };

  const handleCompleteRide = () => setStep("complete");

  const handlePayment = async () => {
    if (paymentMethod === "upi" && !upiId) {
      toast({ title: "Enter UPI ID", variant: "destructive" });
      return;
    }
    setStep("done");
    toast({ title: "✅ Payment Successful!", description: `₹${selectedVehicle ? calculateFare(selectedVehicle).toLocaleString() : 0} paid via ${paymentMethod}` });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-hero p-5 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-primary-foreground flex items-center gap-2 text-lg">
                {step !== "vehicle" && step !== "booked" && (
                  <button onClick={() => setStep(step === "drivers" ? "vehicle" : step === "confirm" ? "drivers" : step === "payment" ? "confirm" : "vehicle")} className="p-1 rounded-full hover:bg-primary-foreground/20">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {step === "vehicle" && "Request Ambulance"}
                {step === "drivers" && (
                  <span className="flex items-center gap-2">
                    Available Nearby
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      LIVE
                    </span>
                  </span>
                )}
                {step === "confirm" && "Confirm Ride"}
                {step === "payment" && "Payment"}
                {step === "booked" && "Ride Confirmed!"}
              </DialogTitle>
            </DialogHeader>
            {step === "vehicle" && (
              <div className="mt-2 flex items-center gap-2 text-sm text-primary-foreground/80">
                {detectingLocation ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Detecting your location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3" />
                    <span className="truncate">{userAddress}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-5">
            {/* Step 1: Vehicle Selection with Live Map */}
            {step === "vehicle" && (
              <div className="space-y-4">
                {/* Live Map */}
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <div ref={mapRef} className="h-[200px] w-full z-0" />
                  <div className="absolute top-2 left-2 z-[1000] bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-foreground shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live vehicles nearby
                  </div>
                  {nearbyHospital && (
                    <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-foreground shadow-sm">
                      🏥 Nearest: <strong>{nearbyHospital.name}</strong> ({nearbyHospital.distance.toFixed(1)} km)
                    </div>
                  )}
                </div>

                {/* Distance info */}
                <div className="flex items-center justify-between text-sm px-1">
                  <span className="text-muted-foreground">Estimated distance</span>
                  <span className="font-semibold text-foreground">{distanceKm} km</span>
                </div>

                {/* Vehicle list */}
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
                          <span className="font-bold text-primary text-lg">₹{calculateFare(vehicle).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{vehicle.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-success flex items-center gap-1">
                            <Clock className="w-3 h-3" /> ETA: {getDriverEta(vehicle.id)}
                          </span>
                          {nearestDriverDistances[vehicle.id] !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              📍 {nearestDriverDistances[vehicle.id].toFixed(1)} km away
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Available Drivers */}
            {step === "drivers" && selectedVehicle && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 mb-1">
                  <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${selectedVehicle.color}`}>
                    {selectedVehicle.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedVehicle.name}</p>
                    <p className="text-xs text-muted-foreground">Est. fare: ₹{calculateFare(selectedVehicle).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Available nearby</p>
                  <span className="text-xs font-semibold text-success">
                    {dbDrivers.filter(d => d.is_available !== false).length} of {dbDrivers.length} available
                  </span>
                </div>

                {loadingDrivers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Finding drivers...</span>
                  </div>
                ) : dbDrivers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No drivers available for this vehicle type right now.</p>
                    <p className="text-xs mt-1">Please try another vehicle or wait a moment.</p>
                  </div>
                ) : (
                  [...dbDrivers].sort((a, b) => (b.is_available === true ? 1 : 0) - (a.is_available === true ? 1 : 0)).map((driver) => {
                    const initials = driver.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                    const driverDist = (driver.latitude && driver.longitude) ? haversineDistance(userCoords.lat, userCoords.lng, Number(driver.latitude), Number(driver.longitude)) : null;
                    const etaMin = driverDist ? Math.max(1, Math.round((driverDist / 35) * 60)) : Math.floor(Math.random() * 10) + 3;
                    const isAvailable = driver.is_available !== false;
                    return (
                      <button
                        key={driver.id}
                        onClick={() => isAvailable && handleDriverSelect({ name: driver.full_name, plate: driver.vehicle_number, phone: driver.whatsapp_number || driver.phone })}
                        disabled={!isAvailable}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${isAvailable ? "border-border hover:border-primary hover:bg-accent/30" : "border-border/50 opacity-50 cursor-not-allowed"}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 relative">
                          {initials}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${isAvailable ? "bg-green-500" : "bg-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground text-sm">{driver.full_name}</h4>
                            <span className={`text-xs font-medium ${isAvailable ? "text-success" : "text-muted-foreground"}`}>
                              {isAvailable ? `${etaMin} min away` : "Busy"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{driver.vehicle_number}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-foreground flex items-center gap-1">
                              <Star className="w-3 h-3 text-warning fill-warning" /> {driver.rating || 4.5}
                            </span>
                            <span className="text-xs text-muted-foreground">{(driver.total_trips || 0).toLocaleString()} trips</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isAvailable ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                              {isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
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
                      <p className="text-xs text-muted-foreground">Your Location</p>
                      <p className="text-sm font-medium text-foreground">{userAddress}</p>
                    </div>
                  </div>
                  {nearbyHospital && (
                    <>
                      <div className="ml-1.5 w-px h-4 bg-border" />
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-emergency mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Nearest Hospital</p>
                          <p className="text-sm font-medium text-foreground">{nearbyHospital.name}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-secondary rounded-xl p-4 space-y-2">
                  {selectedVehicle.baseFare > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base fare</span>
                      <span className="text-foreground">₹{selectedVehicle.baseFare.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="text-foreground">{distanceKm} km</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span className="text-foreground">Total Estimate</span>
                    <span className="text-primary text-lg">₹{calculateFare(selectedVehicle).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
                  <Clock className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Estimated arrival: {getDriverEta(selectedVehicle.id)}</p>
                    <p className="text-xs text-muted-foreground">Driver: {selectedDriver?.name}</p>
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
                  <h3 className="text-xl font-bold text-foreground">Booking Confirmed!</h3>
                  <p className="text-primary font-semibold text-lg mt-1">Our team will contact you soon</p>
                  <p className="text-muted-foreground text-sm mt-1">We are assigning the nearest {selectedVehicle.name} to you</p>
                </div>

                <div className="bg-secondary rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="font-medium text-foreground">{selectedVehicle.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-medium text-foreground">{distanceKm} km</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span className="text-foreground">Total Fare</span>
                    <span className="text-primary text-lg">₹{calculateFare(selectedVehicle).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium text-foreground capitalize">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-foreground text-right text-xs max-w-[200px] truncate">{userAddress}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Our team will contact you soon</p>
                    <p className="text-xs text-muted-foreground">You'll receive a call with driver details</p>
                  </div>
                </div>

                <Button onClick={() => onOpenChange(false)} className="w-full" size="lg">
                  Done
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
        pickup={userAddress}
        destination={nearbyHospital?.name || "Hospital"}
        fare={selectedVehicle ? calculateFare(selectedVehicle) : 0}
        paymentMethod={paymentMethod}
      />
    </>
  );
};

export { AmbulanceRequestSheet, haversineDistance };
export default AmbulanceRequestSheet;
