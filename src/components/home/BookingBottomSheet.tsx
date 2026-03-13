import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Clock, Navigation, ChevronUp, ChevronDown, Star, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
}

interface BookingBottomSheetProps {
  userLocation: { lat: number; lng: number };
  onBookEmergency: (hospitalId: string) => void;
  onBookScheduled: (hospitalId: string) => void;
  isBooking: boolean;
}

const BookingBottomSheet = ({ userLocation, onBookEmergency, onBookScheduled, isBooking }: BookingBottomSheetProps) => {
  const [expanded, setExpanded] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'emergency' | 'scheduled'>('emergency');

  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      const { data } = await supabase
        .from('hospitals')
        .select('*')
        .eq('emergency_available', true)
        .limit(10);
      
      if (data) {
        const sorted = data
          .filter(h => h.latitude && h.longitude)
          .map(h => ({
            id: h.id,
            name: h.name,
            address: h.address,
            latitude: Number(h.latitude),
            longitude: Number(h.longitude),
            distance: calculateDistance(userLocation.lat, userLocation.lng, Number(h.latitude), Number(h.longitude))
          }))
          .sort((a, b) => a.distance - b.distance);
        
        setHospitals(sorted);
        if (sorted.length > 0) setSelectedHospital(sorted[0].id);
      }
    };
    fetchHospitals();
  }, [userLocation, calculateDistance]);

  const estimatedFare = selectedHospital 
    ? Math.round(49 + (hospitals.find(h => h.id === selectedHospital)?.distance || 0) * 15)
    : 0;

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.15)] transition-all duration-300 z-20 ${expanded ? 'max-h-[75vh]' : 'max-h-[280px]'}`}>
      {/* Handle */}
      <button 
        className="w-full flex justify-center pt-3 pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
      </button>

      <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: expanded ? 'calc(75vh - 40px)' : '240px' }}>
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'emergency' 
                ? 'bg-emergency text-emergency-foreground shadow-emergency' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-1.5" />
            Emergency
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'scheduled' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1.5" />
            Schedule Ride
          </button>
        </div>

        {/* Current location */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-3">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Pickup</p>
            <p className="text-sm font-medium text-foreground">Current Location</p>
          </div>
          <MapPin className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Hospital selector */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Select Hospital
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {hospitals.slice(0, 5).map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHospital(h.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl border text-left transition-all ${
                  selectedHospital === h.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="text-xs font-semibold truncate max-w-[110px]">{h.name}</div>
                <div className={`text-[10px] mt-0.5 ${selectedHospital === h.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {h.distance.toFixed(1)} km · ~{Math.round(h.distance * 3)} min
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Fare estimate */}
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-xl mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Estimated Fare</p>
            <p className="text-lg font-bold text-foreground">₹{estimatedFare}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pay after ride</p>
            <p className="text-xs text-success font-medium">UPI / Cash / Card</p>
          </div>
        </div>

        {/* Book button */}
        <Button
          variant={activeTab === 'emergency' ? 'emergency' : 'default'}
          className="w-full h-12 text-base font-bold rounded-xl"
          disabled={!selectedHospital || isBooking}
          onClick={() => {
            if (!selectedHospital) return;
            if (activeTab === 'emergency') {
              onBookEmergency(selectedHospital);
            } else {
              onBookScheduled(selectedHospital);
            }
          }}
        >
          {isBooking ? (
            <span className="animate-pulse">Finding Ambulance...</span>
          ) : activeTab === 'emergency' ? (
            <>🚑 Book Emergency Ambulance</>
          ) : (
            <>📅 Schedule Ambulance</>
          )}
        </Button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Nearby Hospitals</h4>
            {hospitals.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHospital(h.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all ${
                  selectedHospital === h.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">🏥</div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-primary">{h.distance.toFixed(1)} km</p>
                  <p className="text-[10px] text-muted-foreground">~{Math.round(h.distance * 3)} min</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground"
        >
          {expanded ? <><ChevronDown className="w-3 h-3" /> Show less</> : <><ChevronUp className="w-3 h-3" /> More options</>}
        </button>
      </div>
    </div>
  );
};

export default BookingBottomSheet;
