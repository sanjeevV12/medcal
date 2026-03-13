import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

interface Ambulance {
  id: string;
  driver_name: string;
  vehicle_number: string;
  vehicle_type: string;
  latitude: number;
  longitude: number;
  status: string;
  rating: number;
}

interface HomeMapViewProps {
  userLocation: { lat: number; lng: number };
  onAmbulanceSelect?: (ambulance: Ambulance) => void;
  rideAmbulanceLocation?: { lat: number; lng: number } | null;
  rideStatus?: string;
  destinationHospital?: { lat: number; lng: number; name: string } | null;
}

const HomeMapView = ({ userLocation, onAmbulanceSelect, rideAmbulanceLocation, rideStatus, destinationHospital }: HomeMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{
    user: L.Marker | null;
    ambulances: Map<string, L.Marker>;
    rideAmbulance: L.Marker | null;
    route: L.Polyline | null;
  }>({ user: null, ambulances: new Map(), rideAmbulance: null, route: null });
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);

  // Fetch nearby ambulances
  const fetchAmbulances = useCallback(async () => {
    const { data, error } = await supabase
      .from('ambulances')
      .select('*')
      .eq('status', 'available');
    
    if (!error && data) {
      setAmbulances(data as Ambulance[]);
    }
  }, []);

  // Subscribe to realtime ambulance updates
  useEffect(() => {
    fetchAmbulances();
    
    const channel = supabase
      .channel('ambulances-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, () => {
        fetchAmbulances();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAmbulances]);

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRef.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // User marker
  useEffect(() => {
    if (!mapRef.current) return;

    const icon = L.divIcon({
      html: `<div class="relative flex items-center justify-center">
        <div class="absolute w-16 h-16 rounded-full bg-[hsl(174,72%,40%)]/20 animate-ping"></div>
        <div class="w-4 h-4 rounded-full bg-[hsl(174,72%,40%)] border-[3px] border-white shadow-lg"></div>
      </div>`,
      className: "",
      iconSize: [64, 64],
      iconAnchor: [32, 32]
    });

    if (markersRef.current.user) {
      markersRef.current.user.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      markersRef.current.user = L.marker([userLocation.lat, userLocation.lng], { icon })
        .addTo(mapRef.current);
    }
  }, [userLocation]);

  // Ambulance markers (only when not in a ride)
  useEffect(() => {
    if (!mapRef.current || rideStatus) return;

    // Clear old
    markersRef.current.ambulances.forEach(m => m.remove());
    markersRef.current.ambulances.clear();

    ambulances.forEach(amb => {
      const icon = L.divIcon({
        html: `<div class="flex items-center justify-center w-10 h-10 transition-transform hover:scale-110">
          <div class="w-9 h-9 rounded-lg bg-white shadow-lg border border-gray-100 flex items-center justify-center">
            <span style="font-size:20px">🚑</span>
          </div>
        </div>`,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([Number(amb.latitude), Number(amb.longitude)], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width:140px">
            <b>${amb.driver_name}</b><br/>
            <span style="color:#666">${amb.vehicle_number}</span><br/>
            <span>⭐ ${amb.rating} · ${amb.vehicle_type}</span>
          </div>
        `);

      marker.on('click', () => onAmbulanceSelect?.(amb));
      markersRef.current.ambulances.set(amb.id, marker);
    });
  }, [ambulances, rideStatus, onAmbulanceSelect]);

  // Ride ambulance tracking
  useEffect(() => {
    if (!mapRef.current) return;

    if (rideAmbulanceLocation && rideStatus) {
      const icon = L.divIcon({
        html: `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
          <span style="font-size:24px">🚑</span>
        </div>`,
        className: "",
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      if (markersRef.current.rideAmbulance) {
        markersRef.current.rideAmbulance.setLatLng([rideAmbulanceLocation.lat, rideAmbulanceLocation.lng]);
      } else {
        markersRef.current.rideAmbulance = L.marker(
          [rideAmbulanceLocation.lat, rideAmbulanceLocation.lng], { icon }
        ).addTo(mapRef.current);
      }

      // Route line
      const target = (rideStatus === 'heading_hospital' && destinationHospital) 
        ? destinationHospital 
        : userLocation;
      
      const points: L.LatLngExpression[] = [
        [rideAmbulanceLocation.lat, rideAmbulanceLocation.lng],
        [target.lat, target.lng]
      ];

      const color = rideStatus === 'heading_hospital' ? '#22c55e' : '#ef4444';
      
      if (markersRef.current.route) {
        markersRef.current.route.setLatLngs(points);
        markersRef.current.route.setStyle({ color });
      } else {
        markersRef.current.route = L.polyline(points, {
          color, weight: 4, opacity: 0.8, dashArray: '10, 8'
        }).addTo(mapRef.current);
      }
    } else {
      markersRef.current.rideAmbulance?.remove();
      markersRef.current.rideAmbulance = null;
      markersRef.current.route?.remove();
      markersRef.current.route = null;
    }
  }, [rideAmbulanceLocation, rideStatus, userLocation, destinationHospital]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default HomeMapView;
