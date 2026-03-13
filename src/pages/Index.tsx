import { useState, useEffect, useRef, useCallback } from "react";
import { Ambulance, User, Menu, X, LogOut, Building2, History, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import HomeMapView from "@/components/home/HomeMapView";
import BookingBottomSheet from "@/components/home/BookingBottomSheet";
import RideTracker from "@/components/home/RideTracker";
import RidePayment from "@/components/home/RidePayment";
import ChatSupportWidget from "@/components/ChatSupportWidget";

interface RideState {
  active: boolean;
  status: string; // searching | driver_assigned | arriving | picked_up | heading_hospital | arrived
  progress: number;
  eta: number;
  distance: number;
  fareEstimate: number;
  hospitalId: string;
  hospitalName: string;
  hospitalLat: number;
  hospitalLng: number;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  driverRating: number;
  ambulanceLat: number;
  ambulanceLng: number;
  showPayment: boolean;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 23.2599, lng: 77.4126 });
  const [isBooking, setIsBooking] = useState(false);
  const rideStatusRef = useRef<string>('');

  const [ride, setRide] = useState<RideState>({
    active: false, status: '', progress: 0, eta: 0, distance: 0,
    fareEstimate: 0, hospitalId: '', hospitalName: '', hospitalLat: 0, hospitalLng: 0,
    driverName: '', driverPhone: '', vehicleNumber: '', driverRating: 0,
    ambulanceLat: 0, ambulanceLng: 0, showPayment: false
  });

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Keep ref in sync
  useEffect(() => {
    rideStatusRef.current = ride.status;
  }, [ride.status]);

  // Ride simulation
  useEffect(() => {
    if (!ride.active || !['arriving', 'picked_up', 'heading_hospital'].includes(ride.status)) return;

    const interval = setInterval(() => {
      setRide(prev => {
        const newProgress = Math.min(prev.progress + 1.2, 100);
        const newEta = Math.max(0, Math.round(prev.eta * (1 - 1.2/100)));
        const newDistance = Math.max(0, Number((prev.distance * (1 - newProgress/100)).toFixed(1)));

        let newStatus = prev.status;
        let newAmbLat = prev.ambulanceLat;
        let newAmbLng = prev.ambulanceLng;
        const step = 0.0015;

        if (prev.status === 'arriving') {
          // Move toward user
          const dLat = userLocation.lat - prev.ambulanceLat;
          const dLng = userLocation.lng - prev.ambulanceLng;
          newAmbLat += (dLat > 0 ? Math.min(step, dLat) : Math.max(-step, dLat));
          newAmbLng += (dLng > 0 ? Math.min(step, dLng) : Math.max(-step, dLng));

          if (newProgress >= 40) {
            newStatus = 'picked_up';
            setTimeout(() => toast({ title: "🚑 Picked Up!", description: "Heading to hospital now" }), 0);
          }
        } else if (prev.status === 'picked_up' || prev.status === 'heading_hospital') {
          newStatus = 'heading_hospital';
          // Move toward hospital
          const dLat = prev.hospitalLat - prev.ambulanceLat;
          const dLng = prev.hospitalLng - prev.ambulanceLng;
          newAmbLat += (dLat > 0 ? Math.min(step, dLat) : Math.max(-step, dLat));
          newAmbLng += (dLng > 0 ? Math.min(step, dLng) : Math.max(-step, dLng));

          if (newProgress >= 100) {
            newStatus = 'arrived';
            setTimeout(() => toast({ title: "✅ Arrived!", description: `At ${prev.hospitalName}` }), 0);
            clearInterval(interval);
          }
        }

        return {
          ...prev,
          progress: newProgress,
          eta: newEta,
          distance: newDistance,
          status: newStatus,
          ambulanceLat: newAmbLat,
          ambulanceLng: newAmbLng,
        };
      });
    }, 800);

    return () => clearInterval(interval);
  }, [ride.active, ride.status, userLocation]);

  // Show payment 2s after arrival
  useEffect(() => {
    if (ride.status === 'arrived' && !ride.showPayment) {
      const t = setTimeout(() => setRide(prev => ({ ...prev, showPayment: true })), 2000);
      return () => clearTimeout(t);
    }
  }, [ride.status, ride.showPayment]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const handleBookEmergency = async (hospitalId: string) => {
    if (!user) {
      toast({ title: "Please login", description: "Sign in to book an ambulance" });
      navigate('/auth');
      return;
    }

    setIsBooking(true);

    // Fetch hospital details
    const { data: hospital } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', hospitalId)
      .single();

    if (!hospital) {
      setIsBooking(false);
      toast({ title: "Error", description: "Hospital not found", variant: "destructive" });
      return;
    }

    // Find nearest available ambulance
    const { data: ambulances } = await supabase
      .from('ambulances')
      .select('*')
      .eq('status', 'available')
      .limit(5);

    if (!ambulances?.length) {
      setIsBooking(false);
      toast({ title: "No Ambulances", description: "No ambulances available right now", variant: "destructive" });
      return;
    }

    // Pick nearest
    const nearest = ambulances
      .map(a => ({ ...a, dist: calculateDistance(userLocation.lat, userLocation.lng, Number(a.latitude), Number(a.longitude)) }))
      .sort((a, b) => a.dist - b.dist)[0];

    const distToHospital = calculateDistance(userLocation.lat, userLocation.lng, Number(hospital.latitude), Number(hospital.longitude));
    const fare = Math.round(49 + distToHospital * 15);

    // Create ride request
    await supabase.from('ride_requests').insert({
      user_id: user.id,
      ambulance_id: nearest.id,
      pickup_lat: userLocation.lat,
      pickup_lng: userLocation.lng,
      destination_hospital_id: hospitalId,
      status: 'searching',
      ride_type: 'emergency',
      fare_estimate: fare,
      distance_km: distToHospital,
    });

    toast({ title: "🔍 Finding Ambulance", description: "Searching for nearest available ambulance..." });

    // Simulate driver assignment after delay
    setTimeout(() => {
      setRide({
        active: true,
        status: 'driver_assigned',
        progress: 0,
        eta: Math.round(distToHospital * 3 + 5),
        distance: distToHospital,
        fareEstimate: fare,
        hospitalId,
        hospitalName: hospital.name,
        hospitalLat: Number(hospital.latitude),
        hospitalLng: Number(hospital.longitude),
        driverName: nearest.driver_name,
        driverPhone: nearest.driver_phone,
        vehicleNumber: nearest.vehicle_number,
        driverRating: Number(nearest.rating),
        ambulanceLat: Number(nearest.latitude),
        ambulanceLng: Number(nearest.longitude),
        showPayment: false,
      });
      setIsBooking(false);

      setTimeout(() => toast({ 
        title: "🚑 Driver Assigned!", 
        description: `${nearest.driver_name} (${nearest.vehicle_number}) is on the way` 
      }), 0);

      // Start approaching after 2s
      setTimeout(() => {
        setRide(prev => ({ ...prev, status: 'arriving' }));
      }, 2000);
    }, 3000);
  };

  const handleCancelRide = () => {
    setRide(prev => ({ ...prev, active: false, status: '', progress: 0 }));
    toast({ title: "Ride Cancelled", description: "Your ride has been cancelled" });
  };

  const handlePaymentComplete = () => {
    setRide({
      active: false, status: '', progress: 0, eta: 0, distance: 0,
      fareEstimate: 0, hospitalId: '', hospitalName: '', hospitalLat: 0, hospitalLng: 0,
      driverName: '', driverPhone: '', vehicleNumber: '', driverRating: 0,
      ambulanceLat: 0, ambulanceLng: 0, showPayment: false
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-background">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-11 h-11 rounded-xl bg-card shadow-card flex items-center justify-center"
        >
          {menuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
        </button>

        <Link to="/" className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-soft">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Ambulance className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">mASSI</span>
        </Link>

        <Button variant="emergency" size="sm" className="rounded-xl shadow-emergency" asChild>
          <a href="tel:+917479898265">
            <Phone className="w-4 h-4 mr-1" /> SOS
          </a>
        </Button>
      </div>

      {/* Menu dropdown */}
      {menuOpen && (
        <div className="absolute top-16 left-4 z-30 bg-card rounded-xl shadow-card p-3 w-56 animate-fade-in border border-border">
          <div className="space-y-1">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground text-sm" onClick={() => setMenuOpen(false)}>
                  <User className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/hospitals" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground text-sm" onClick={() => setMenuOpen(false)}>
                  <Building2 className="w-4 h-4" /> Hospitals
                </Link>
                <Link to="/dashboard" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground text-sm" onClick={() => setMenuOpen(false)}>
                  <History className="w-4 h-4" /> My Rides
                </Link>
                <button 
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground text-sm w-full"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground text-sm" onClick={() => setMenuOpen(false)}>
                  <User className="w-4 h-4" /> Login / Sign Up
                </Link>
                <Link to="/hospitals" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-foreground text-sm" onClick={() => setMenuOpen(false)}>
                  <Building2 className="w-4 h-4" /> Hospitals
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Full screen map */}
      <div className="absolute inset-0">
        <HomeMapView 
          userLocation={userLocation}
          rideAmbulanceLocation={ride.active ? { lat: ride.ambulanceLat, lng: ride.ambulanceLng } : null}
          rideStatus={ride.active ? ride.status : undefined}
          destinationHospital={ride.active ? { lat: ride.hospitalLat, lng: ride.hospitalLng, name: ride.hospitalName } : null}
        />
      </div>

      {/* Bottom sheet - Booking or Tracking */}
      {!ride.active ? (
        <BookingBottomSheet
          userLocation={userLocation}
          onBookEmergency={handleBookEmergency}
          onBookScheduled={handleBookEmergency}
          isBooking={isBooking}
        />
      ) : !ride.showPayment ? (
        <RideTracker
          status={ride.status}
          eta={ride.eta}
          distance={ride.distance}
          progress={ride.progress}
          driverName={ride.driverName}
          driverPhone={ride.driverPhone}
          vehicleNumber={ride.vehicleNumber}
          driverRating={ride.driverRating}
          hospitalName={ride.hospitalName}
          fareEstimate={ride.fareEstimate}
          onCancel={handleCancelRide}
        />
      ) : null}

      {/* Payment overlay */}
      {ride.showPayment && (
        <RidePayment
          fare={ride.fareEstimate}
          distance={ride.distance}
          hospitalName={ride.hospitalName}
          driverName={ride.driverName}
          onComplete={handlePaymentComplete}
        />
      )}

      <ChatSupportWidget />
    </div>
  );
};

export default Index;
