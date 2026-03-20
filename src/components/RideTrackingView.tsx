import { useState, useEffect, useRef, useCallback } from "react";
import { Phone, Navigation, Clock, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmergencyMap from "./EmergencyMap";

interface Coordinates {
  lat: number;
  lng: number;
}

interface RideTrackingViewProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleName: string;
  pickup: string;
  destination: string;
  fare: number;
  paymentMethod: string;
}

const RideTrackingView = ({
  isOpen,
  onClose,
  driverName,
  driverPhone,
  vehiclePlate,
  vehicleName,
  pickup,
  destination,
  fare,
  paymentMethod,
}: RideTrackingViewProps) => {
  const [userLocation, setUserLocation] = useState<Coordinates>({ lat: 23.2599, lng: 77.4126 });
  const [ambulanceLocation, setAmbulanceLocation] = useState<Coordinates | null>(null);
  const [eta, setEta] = useState(8);
  const [distance, setDistance] = useState(3.2);
  const [status, setStatus] = useState<"approaching" | "arriving" | "reached">("approaching");
  const [progress, setProgress] = useState(0);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Detect user location on mount
  useEffect(() => {
    if (!isOpen) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // keep default
      );
    }
  }, [isOpen]);

  // Set initial ambulance position offset from user
  useEffect(() => {
    if (!isOpen) return;
    setAmbulanceLocation({
      lat: userLocation.lat + 0.025 + Math.random() * 0.01,
      lng: userLocation.lng + 0.03 + Math.random() * 0.01,
    });
    setProgress(0);
    setEta(8);
    setDistance(3.2);
    setStatus("approaching");
  }, [isOpen, userLocation]);

  // Simulate movement
  useEffect(() => {
    if (!isOpen || !ambulanceLocation) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 1.2, 100);

        const newEta = Math.max(0, Math.round(8 * (1 - next / 100)));
        const newDist = Math.max(0, Number((3.2 * (1 - next / 100)).toFixed(1)));
        setEta(newEta);
        setDistance(newDist);

        if (next >= 85 && statusRef.current !== "reached") {
          setStatus("reached");
        } else if (next >= 55 && statusRef.current === "approaching") {
          setStatus("arriving");
        }

        return next;
      });

      setAmbulanceLocation((prev) => {
        if (!prev) return prev;
        const step = 0.0015;
        return {
          lat: prev.lat + (userLocation.lat > prev.lat ? step : -step),
          lng: prev.lng + (userLocation.lng > prev.lng ? step : -step),
        };
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isOpen, ambulanceLocation === null, userLocation]);

  const statusLabel = {
    approaching: "🚑 Driver is on the way",
    arriving: "📍 Almost at your location",
    reached: "✅ Driver has arrived!",
  };

  const statusColor = {
    approaching: "bg-primary",
    arriving: "bg-warning",
    reached: "bg-success",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-bold text-lg">Tracking {vehicleName}</h2>
          <p className="text-sm opacity-90">{statusLabel[status]}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/20">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        <EmergencyMap
          userLocation={userLocation}
          ambulanceLocation={ambulanceLocation}
          hospitals={[]}
          selectedHospitalId={null}
          onHospitalSelect={() => {}}
          showAmbulance={!!ambulanceLocation}
          showRouteToHospital={false}
          selectedHospital={null}
        />
      </div>

      {/* Bottom panel */}
      <div className="shrink-0 p-4 space-y-3 bg-background border-t border-border max-h-[40vh] overflow-y-auto">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{statusLabel[status]}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden relative">
            <div
              className={`h-full ${statusColor[status]} transition-all duration-700 rounded-full`}
              style={{ width: `${progress}%` }}
            />
            {status !== "reached" && (
              <div
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-700"
                style={{ left: `calc(${Math.min(progress, 96)}% - 10px)` }}
              >
                <span className="text-base">🚑</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <Clock className="w-4 h-4 mx-auto mb-0.5 text-primary" />
            <div className="text-base font-bold">{eta} min</div>
            <div className="text-[10px] text-muted-foreground">ETA</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <Navigation className="w-4 h-4 mx-auto mb-0.5 text-primary" />
            <div className="text-base font-bold">{distance} km</div>
            <div className="text-[10px] text-muted-foreground">Away</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <MapPin className="w-4 h-4 mx-auto mb-0.5 text-primary" />
            <div className="text-base font-bold capitalize">{paymentMethod}</div>
            <div className="text-[10px] text-muted-foreground">₹{fare.toLocaleString()}</div>
          </div>
        </div>

        {/* Driver card */}
        <div className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              👨‍⚕️
            </div>
            <div>
              <p className="font-semibold text-sm">{driverName}</p>
              <p className="text-xs text-muted-foreground">{vehiclePlate} • {vehicleName}</p>
            </div>
          </div>
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <a href={`tel:${driverPhone}`}>
              <Phone className="w-4 h-4 text-success" />
            </a>
          </Button>
        </div>

        {/* Route summary */}
        <div className="flex items-start gap-2 text-xs">
          <div className="flex flex-col items-center gap-0.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <div className="w-px h-4 bg-border" />
            <div className="w-2 h-2 rounded-full bg-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground truncate">{pickup}</p>
            <p className="text-muted-foreground truncate">{destination}</p>
          </div>
        </div>

        {status === "reached" && (
          <Button onClick={onClose} className="w-full" size="lg">
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default RideTrackingView;
