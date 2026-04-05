import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  emergency_available: boolean | null;
  rating: number | null;
  specializations: string[] | null;
}

interface BookingMapProps {
  pickupCoords: { lat: number; lng: number } | null;
  onSelectDestination: (name: string, coords: { lat: number; lng: number }) => void;
  selectedDestination: { lat: number; lng: number } | null;
}

const BHOPAL_CENTER = { lat: 23.2599, lng: 77.4126 };

// Haversine formula for distance calculation
const haversineDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const BookingMap = ({ pickupCoords, onSelectDestination, selectedDestination }: BookingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      const { data } = await supabase
        .from("hospitals")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      if (data) setHospitals(data as Hospital[]);
    };
    fetchHospitals();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [pickupCoords?.lat || BHOPAL_CENTER.lat, pickupCoords?.lng || BHOPAL_CENTER.lng],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Add markers
  useEffect(() => {
    if (!mapInstance.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    // Pickup marker
    if (pickupCoords) {
      const pickupIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background:#22c55e;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon })
        .bindPopup("<b>📍 Your Location</b>")
        .addTo(markersRef.current);
    }

    // Hospital markers
    hospitals.forEach((h) => {
      if (!h.latitude || !h.longitude) return;
      const isSelected = selectedDestination &&
        Math.abs(h.latitude - selectedDestination.lat) < 0.001 &&
        Math.abs(h.longitude - selectedDestination.lng) < 0.001;

      const dist = pickupCoords
        ? haversineDistance(pickupCoords.lat, pickupCoords.lng, h.latitude, h.longitude)
        : null;

      const hospitalIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background:${isSelected ? '#ef4444' : '#3b82f6'};width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);color:white;font-weight:bold;font-size:12px">H+</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([h.latitude, h.longitude], { icon: hospitalIcon })
        .addTo(markersRef.current!);

      const popupContent = `
        <div style="min-width:180px">
          <b style="font-size:13px">🏥 ${h.name}</b><br/>
          <span style="font-size:11px;color:#666">${h.address?.split(",").slice(0, 2).join(",")}</span><br/>
          ${h.rating ? `<span style="font-size:11px">⭐ ${h.rating}</span> ` : ""}
          ${dist !== null ? `<span style="font-size:11px;color:#3b82f6">📏 ${dist.toFixed(1)} km</span>` : ""}
          ${h.emergency_available ? '<br/><span style="font-size:10px;color:#22c55e;font-weight:bold">🟢 Emergency Available</span>' : ""}
          ${h.phone ? `<br/><a href="tel:${h.phone}" style="font-size:11px;color:#3b82f6">📞 ${h.phone}</a>` : ""}
          <br/><button onclick="window.dispatchEvent(new CustomEvent('select-hospital',{detail:{name:'${h.name.replace(/'/g, "\\'")}',lat:${h.latitude},lng:${h.longitude}}}))" 
            style="margin-top:6px;padding:4px 12px;background:#ef4444;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;width:100%">
            Select as Destination
          </button>
        </div>
      `;
      marker.bindPopup(popupContent);
    });
  }, [hospitals, pickupCoords, selectedDestination]);

  // Draw route line
  useEffect(() => {
    if (!mapInstance.current) return;
    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    if (pickupCoords && selectedDestination) {
      routeRef.current = L.polyline(
        [[pickupCoords.lat, pickupCoords.lng], [selectedDestination.lat, selectedDestination.lng]],
        { color: "#ef4444", weight: 3, dashArray: "8 4", opacity: 0.8 }
      ).addTo(mapInstance.current);

      mapInstance.current.fitBounds(routeRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [pickupCoords, selectedDestination]);

  // Listen for hospital selection from popup
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { name, lat, lng } = e.detail;
      onSelectDestination(name, { lat, lng });
    };
    window.addEventListener("select-hospital", handler as EventListener);
    return () => window.removeEventListener("select-hospital", handler as EventListener);
  }, [onSelectDestination]);

  // Center on pickup when detected
  useEffect(() => {
    if (pickupCoords && mapInstance.current) {
      mapInstance.current.setView([pickupCoords.lat, pickupCoords.lng], 13);
    }
  }, [pickupCoords]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      <div ref={mapRef} className="h-[250px] w-full z-0" />
      <div className="absolute top-2 left-2 z-[1000] bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-foreground shadow-sm">
        🏥 Tap a hospital to select destination
      </div>
      {pickupCoords && selectedDestination && (
        <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-foreground shadow-sm flex items-center justify-between">
          <span>📏 Distance: <strong>{haversineDistance(pickupCoords.lat, pickupCoords.lng, selectedDestination.lat, selectedDestination.lng).toFixed(1)} km</strong></span>
        </div>
      )}
    </div>
  );
};

export { haversineDistance };
export default BookingMap;
