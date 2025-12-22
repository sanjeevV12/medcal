import { useState, useEffect, useCallback } from "react";
import { X, Phone, MapPin, Navigation, Building2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/hooks/useNotifications";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
}

interface TrackingState {
  status: 'idle' | 'locating' | 'finding_ambulance' | 'driver_assigned' | 'en_route' | 'arriving' | 'at_hospital' | 'arrived';
  progress: number;
  eta: number;
  distance: number;
}

interface EmergencyTrackingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simulated hospitals near user
const nearbyHospitals: Hospital[] = [
  { id: '1', name: 'AIIMS Hospital', address: 'Bhopal, MP', distance: 2.1, lat: 23.2599, lng: 77.4126 },
  { id: '2', name: 'Hamidia Hospital', address: 'Bhopal, MP', distance: 3.5, lat: 23.2650, lng: 77.4200 },
  { id: '3', name: 'Bansal Hospital', address: 'Bhopal, MP', distance: 4.2, lat: 23.2500, lng: 77.4300 },
];

const EmergencyTrackingOverlay = ({ isOpen, onClose }: EmergencyTrackingOverlayProps) => {
  const [tracking, setTracking] = useState<TrackingState>({
    status: 'idle',
    progress: 0,
    eta: 12,
    distance: 5.2
  });
  const [userLocation, setUserLocation] = useState<Coordinates>({ lat: 23.2599, lng: 77.4126 });
  const [ambulanceLocation, setAmbulanceLocation] = useState<Coordinates>({ lat: 23.2800, lng: 77.4500 });
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(nearbyHospitals[0]);
  const [driverInfo] = useState({
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    vehicle: 'MH-12-AB-1234',
    rating: 4.8
  });

  // Start emergency flow when opened
  useEffect(() => {
    if (isOpen && tracking.status === 'idle') {
      startEmergencyFlow();
    }
  }, [isOpen]);

  // Progress tracking
  useEffect(() => {
    if (tracking.status === 'en_route' || tracking.status === 'arriving' || tracking.status === 'at_hospital') {
      const interval = setInterval(() => {
        setTracking(prev => {
          const newProgress = Math.min(prev.progress + 1.5, 100);
          const newEta = Math.max(0, Math.round(12 * (1 - newProgress / 100)));
          const newDistance = Math.max(0, Number((5.2 * (1 - newProgress / 100)).toFixed(1)));
          
          let newStatus = prev.status;
          if (newProgress >= 50 && prev.status === 'en_route') {
            newStatus = 'arriving';
            toast({
              title: "🚑 Ambulance Nearby!",
              description: "The ambulance is approaching your location",
            });
          }
          if (newProgress >= 75 && prev.status === 'arriving') {
            newStatus = 'at_hospital';
            toast({
              title: "🏥 Heading to Hospital",
              description: `Taking you to ${selectedHospital.name}`,
            });
          }
          if (newProgress >= 100) {
            newStatus = 'arrived';
            toast({
              title: "✅ Arrived at Hospital!",
              description: `You've arrived at ${selectedHospital.name}`,
            });
          }
          
          return {
            ...prev,
            progress: newProgress,
            eta: newEta,
            distance: Number(newDistance),
            status: newStatus
          };
        });

        // Update ambulance position simulation
        setAmbulanceLocation(prev => ({
          lat: prev.lat - 0.001,
          lng: prev.lng - 0.002
        }));
      }, 800);

      return () => clearInterval(interval);
    }
  }, [tracking.status, selectedHospital.name]);

  const startEmergencyFlow = async () => {
    setTracking({ status: 'locating', progress: 0, eta: 12, distance: 5.2 });
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Use default location
        }
      );
    }

    toast({
      title: "📍 Location Detected",
      description: "Finding nearest available ambulance...",
    });

    setTimeout(() => {
      setTracking(prev => ({ ...prev, status: 'finding_ambulance' }));
      toast({
        title: "🔍 Searching...",
        description: "Locating available ambulances in your area",
      });
    }, 1500);

    setTimeout(async () => {
      setTracking(prev => ({ ...prev, status: 'driver_assigned' }));
      toast({
        title: "🚑 Driver Assigned!",
        description: `${driverInfo.name} is on the way (${driverInfo.vehicle})`,
      });

      // Save booking to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('booking_records').insert({
          user_id: user.id,
          service_type: 'Emergency Ambulance',
          booking_date: new Date().toISOString().split('T')[0],
          booking_time: new Date().toTimeString().split(' ')[0],
          status: 'dispatched',
          payment_method: 'pending',
          amount: '₹2,499',
          address: `Lat: ${userLocation.lat}, Lng: ${userLocation.lng}`
        });
      }

      // Send notification
      await sendNotification({
        type: 'responder_assigned',
        phone: '+91XXXXXXXXXX',
        name: 'User',
        serviceType: 'Emergency Ambulance',
        responderName: driverInfo.name
      });
    }, 3500);

    setTimeout(() => {
      setTracking(prev => ({ ...prev, status: 'en_route' }));
    }, 5000);
  };

  const handleClose = () => {
    setTracking({ status: 'idle', progress: 0, eta: 12, distance: 5.2 });
    onClose();
  };

  const statusColors: Record<string, string> = {
    idle: 'bg-muted',
    locating: 'bg-warning',
    finding_ambulance: 'bg-warning',
    driver_assigned: 'bg-primary',
    en_route: 'bg-primary',
    arriving: 'bg-success',
    at_hospital: 'bg-success',
    arrived: 'bg-success'
  };

  const statusText: Record<string, string> = {
    idle: 'Ready',
    locating: 'Detecting Location...',
    finding_ambulance: 'Finding Ambulance...',
    driver_assigned: 'Driver Assigned',
    en_route: 'En Route to You',
    arriving: 'Almost There!',
    at_hospital: 'Heading to Hospital',
    arrived: 'Arrived!'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="bg-gradient-emergency text-emergency-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 animate-pulse" />
          <div>
            <h2 className="font-bold text-lg">Emergency Alert Active</h2>
            <p className="text-sm opacity-90">{statusText[tracking.status]}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-emergency-foreground hover:bg-emergency-foreground/20">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Map Area */}
      <div className="relative h-[45vh] bg-muted overflow-hidden">
        {/* Simulated Map Grid */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-border" style={{ top: `${i * 5}%` }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute w-px h-full bg-border" style={{ left: `${i * 5}%` }} />
          ))}
        </div>

        {/* Road Network */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <path d="M10 50 L90 50" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />
          <path d="M50 10 L50 90" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" opacity="0.3" />
          <path d="M20 30 L80 70" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" opacity="0.3" />
        </svg>

        {/* Nearby Hospitals */}
        {nearbyHospitals.map((hospital, index) => (
          <div
            key={hospital.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
              selectedHospital.id === hospital.id ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{ 
              left: `${30 + index * 20}%`, 
              top: `${25 + index * 15}%` 
            }}
            onClick={() => setSelectedHospital(hospital)}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selectedHospital.id === hospital.id ? 'bg-primary shadow-lg' : 'bg-card border border-border'
            }`}>
              <Building2 className={`w-5 h-5 ${selectedHospital.id === hospital.id ? 'text-primary-foreground' : 'text-primary'}`} />
            </div>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card px-2 py-1 rounded text-xs shadow-sm border border-border">
              {hospital.name}
              <br />
              <span className="text-muted-foreground">{hospital.distance} km</span>
            </div>
          </div>
        ))}

        {/* User Location */}
        <div className="absolute left-1/2 top-2/3 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="relative">
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 animate-ping" />
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium">
              You
            </div>
          </div>
        </div>

        {/* Ambulance */}
        {(tracking.status === 'en_route' || tracking.status === 'arriving' || tracking.status === 'driver_assigned') && (
          <div 
            className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
            style={{ 
              left: `${30 + (tracking.progress / 100) * 20}%`, 
              top: `${30 + (tracking.progress / 100) * 35}%` 
            }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-emergency flex items-center justify-center shadow-emergency animate-pulse">
              <span className="text-2xl">🚑</span>
            </div>
          </div>
        )}

        {/* Route Line */}
        {tracking.status !== 'idle' && tracking.status !== 'locating' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <path 
              d="M30 30 Q40 50 50 66" 
              stroke="hsl(var(--emergency))" 
              strokeWidth="0.8" 
              fill="none"
              strokeDasharray="2 1"
              opacity="0.6"
            />
            <path 
              d="M50 66 Q60 50 70 25" 
              stroke="hsl(var(--primary))" 
              strokeWidth="0.8" 
              fill="none"
              strokeDasharray="2 1"
              opacity="0.6"
            />
          </svg>
        )}
      </div>

      {/* Status & Info */}
      <div className="p-4 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{Math.round(tracking.progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${statusColors[tracking.status]} transition-all duration-500`}
              style={{ width: `${tracking.progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{tracking.eta} min</div>
            <div className="text-xs text-muted-foreground">ETA</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Navigation className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{tracking.distance} km</div>
            <div className="text-xs text-muted-foreground">Distance</div>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Building2 className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold truncate">{selectedHospital.name.split(' ')[0]}</div>
            <div className="text-xs text-muted-foreground">Hospital</div>
          </div>
        </div>

        {/* Driver Info */}
        {(tracking.status === 'driver_assigned' || tracking.status === 'en_route' || tracking.status === 'arriving') && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">👨‍⚕️</span>
                </div>
                <div>
                  <p className="font-semibold">{driverInfo.name}</p>
                  <p className="text-sm text-muted-foreground">{driverInfo.vehicle}</p>
                  <div className="flex items-center gap-1 text-xs text-warning">
                    <span>⭐</span>
                    <span>{driverInfo.rating}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="icon" className="rounded-full" asChild>
                <a href={`tel:${driverInfo.phone}`}>
                  <Phone className="w-5 h-5 text-success" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Arrived State */}
        {tracking.status === 'arrived' && (
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-bold text-success">Arrived at Hospital</h3>
            <p className="text-sm text-muted-foreground mt-1">{selectedHospital.name}</p>
            <Button variant="default" className="mt-4 w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyTrackingOverlay;
