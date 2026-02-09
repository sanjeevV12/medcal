import { useState, useEffect, useCallback } from "react";
import { X, Phone, Navigation, Building2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/hooks/useNotifications";
import EmergencyMap from "./EmergencyMap";

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

const EmergencyTrackingOverlay = ({ isOpen, onClose }: EmergencyTrackingOverlayProps) => {
  const [tracking, setTracking] = useState<TrackingState>({
    status: 'idle',
    progress: 0,
    eta: 12,
    distance: 5.2
  });
  const [userLocation, setUserLocation] = useState<Coordinates>({ lat: 23.2599, lng: 77.4126 });
  const [ambulanceLocation, setAmbulanceLocation] = useState<Coordinates | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [driverInfo] = useState({
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    vehicle: 'MH-12-AB-1234',
    rating: 4.8
  });

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Fetch hospitals from database
  const fetchHospitals = useCallback(async (userLat: number, userLng: number) => {
    setIsLoadingHospitals(true);
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('emergency_available', true)
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const hospitalsWithDistance = data
          .filter(h => h.latitude && h.longitude)
          .map(h => ({
            id: h.id,
            name: h.name,
            address: h.address,
            lat: Number(h.latitude),
            lng: Number(h.longitude),
            distance: calculateDistance(userLat, userLng, Number(h.latitude), Number(h.longitude))
          }))
          .sort((a, b) => a.distance - b.distance);

        setHospitals(hospitalsWithDistance);
        if (hospitalsWithDistance.length > 0 && !selectedHospital) {
          setSelectedHospital(hospitalsWithDistance[0]);
        }
      } else {
        // Fallback to default hospitals if none in database
        const defaultHospitals: Hospital[] = [
          { id: '1', name: 'AIIMS Bhopal', address: 'Saket Nagar, Bhopal', distance: 2.1, lat: 23.2123, lng: 77.4350 },
          { id: '2', name: 'Hamidia Hospital', address: 'Royal Market, Bhopal', distance: 3.5, lat: 23.2650, lng: 77.4200 },
          { id: '3', name: 'Bansal Hospital', address: 'Shahpura, Bhopal', distance: 4.2, lat: 23.2010, lng: 77.4420 },
        ];
        setHospitals(defaultHospitals);
        setSelectedHospital(defaultHospitals[0]);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      // Use fallback hospitals
      const defaultHospitals: Hospital[] = [
        { id: '1', name: 'AIIMS Bhopal', address: 'Saket Nagar, Bhopal', distance: 2.1, lat: 23.2123, lng: 77.4350 },
        { id: '2', name: 'Hamidia Hospital', address: 'Royal Market, Bhopal', distance: 3.5, lat: 23.2650, lng: 77.4200 },
        { id: '3', name: 'Bansal Hospital', address: 'Shahpura, Bhopal', distance: 4.2, lat: 23.2010, lng: 77.4420 },
      ];
      setHospitals(defaultHospitals);
      setSelectedHospital(defaultHospitals[0]);
    } finally {
      setIsLoadingHospitals(false);
    }
  }, [calculateDistance, selectedHospital]);

  // Start emergency flow when opened
  useEffect(() => {
    if (isOpen && tracking.status === 'idle') {
      startEmergencyFlow();
    }
  }, [isOpen]);

  // Progress tracking with ambulance movement simulation
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
              description: `Taking you to ${selectedHospital?.name || 'the hospital'}`,
            });
          }
          if (newProgress >= 100) {
            newStatus = 'arrived';
            toast({
              title: "✅ Arrived at Hospital!",
              description: `You've arrived at ${selectedHospital?.name || 'the hospital'}`,
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

        // Simulate ambulance movement
        setAmbulanceLocation(prev => {
          if (!prev) return prev;
          const step = 0.002;

          setTracking(currentTracking => {
            // During at_hospital phase, move toward the selected hospital
            if (currentTracking.status === 'at_hospital' && selectedHospital) {
              const targetLat = selectedHospital.lat;
              const targetLng = selectedHospital.lng;
              setAmbulanceLocation(ambPrev => {
                if (!ambPrev) return ambPrev;
                const dLat = targetLat - ambPrev.lat;
                const dLng = targetLng - ambPrev.lng;
                if (Math.abs(dLat) < 0.001 && Math.abs(dLng) < 0.001) return ambPrev;
                return {
                  lat: ambPrev.lat + (dLat > 0 ? step : -step),
                  lng: ambPrev.lng + (dLng > 0 ? step : -step)
                };
              });
            }
            return currentTracking;
          });

          // Default: move toward user location (en_route / arriving phases)
          if (tracking.status !== 'at_hospital') {
            const targetLat = userLocation.lat;
            const targetLng = userLocation.lng;
            return {
              lat: prev.lat + (targetLat > prev.lat ? step : -step),
              lng: prev.lng + (targetLng > prev.lng ? step : -step)
            };
          }
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [tracking.status, selectedHospital?.name, userLocation]);

  const startEmergencyFlow = async () => {
    setTracking({ status: 'locating', progress: 0, eta: 12, distance: 5.2 });
    setAmbulanceLocation(null);
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });
          fetchHospitals(userLat, userLng);
          
          toast({
            title: "📍 Location Detected",
            description: "Finding nearest available ambulance...",
          });
        },
        () => {
          // Use default Bhopal location
          fetchHospitals(23.2599, 77.4126);
          toast({
            title: "📍 Using Default Location",
            description: "Location access denied. Using Bhopal center.",
          });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fetchHospitals(23.2599, 77.4126);
    }

    setTimeout(() => {
      setTracking(prev => ({ ...prev, status: 'finding_ambulance' }));
      toast({
        title: "🔍 Searching...",
        description: "Locating available ambulances in your area",
      });
    }, 1500);

    setTimeout(async () => {
      // Set initial ambulance location (offset from user)
      setAmbulanceLocation({
        lat: userLocation.lat + 0.03,
        lng: userLocation.lng + 0.04
      });
      
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
    setAmbulanceLocation(null);
    onClose();
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    toast({
      title: "🏥 Hospital Selected",
      description: `Destination changed to ${hospital.name}`,
    });
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

  const showAmbulance = ['driver_assigned', 'en_route', 'arriving', 'at_hospital'].includes(tracking.status);

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
        {isLoadingHospitals ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        ) : (
          <EmergencyMap
            userLocation={userLocation}
            ambulanceLocation={ambulanceLocation}
            hospitals={hospitals}
            selectedHospitalId={selectedHospital?.id || null}
            onHospitalSelect={handleHospitalSelect}
            showAmbulance={showAmbulance}
            showRouteToHospital={tracking.status === 'at_hospital'}
            selectedHospital={selectedHospital}
          />
        )}
      </div>

      {/* Status & Info */}
      <div className="p-4 space-y-4 max-h-[45vh] overflow-y-auto">
        {/* Progress Bar with Animation */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{Math.round(tracking.progress)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden relative">
            <div 
              className={`h-full ${statusColors[tracking.status]} transition-all duration-500 relative`}
              style={{ width: `${tracking.progress}%` }}
            >
              {/* Animated shimmer effect */}
              {tracking.status !== 'arrived' && tracking.status !== 'idle' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
              )}
            </div>
            {/* Ambulance icon on progress bar */}
            {tracking.status !== 'idle' && tracking.status !== 'arrived' && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
                style={{ left: `calc(${Math.min(tracking.progress, 97)}% - 12px)` }}
              >
                <span className="text-lg animate-bounce">🚑</span>
              </div>
            )}
          </div>
          {/* Status label */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
              tracking.status === 'at_hospital' 
                ? 'bg-success/20 text-success' 
                : tracking.status === 'arriving' 
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {tracking.status === 'at_hospital' && '🏥 Heading to Hospital'}
              {tracking.status === 'arriving' && '📍 Almost at your location'}
              {tracking.status === 'en_route' && '🚗 Driver en route'}
              {tracking.status === 'driver_assigned' && '✅ Driver assigned'}
              {tracking.status === 'finding_ambulance' && '🔍 Finding ambulance'}
              {tracking.status === 'locating' && '📡 Detecting location'}
            </span>
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
            <div className="text-lg font-bold truncate">{selectedHospital?.name?.split(' ')[0] || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Hospital</div>
          </div>
        </div>

        {/* Nearby Hospitals List */}
        {hospitals.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Nearby Hospitals</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {hospitals.slice(0, 5).map((hospital) => (
                <button
                  key={hospital.id}
                  onClick={() => handleHospitalSelect(hospital)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg border text-left transition-all ${
                    selectedHospital?.id === hospital.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-xs font-medium truncate max-w-[120px]">{hospital.name}</div>
                  <div className={`text-xs ${selectedHospital?.id === hospital.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {hospital.distance.toFixed(1)} km
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

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
            <p className="text-sm text-muted-foreground mt-1">{selectedHospital?.name}</p>
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
