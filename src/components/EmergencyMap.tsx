import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
}

interface EmergencyMapProps {
  userLocation: Coordinates;
  ambulanceLocation: Coordinates | null;
  hospitals: Hospital[];
  selectedHospitalId: string | null;
  onHospitalSelect: (hospital: Hospital) => void;
  showAmbulance: boolean;
  showRouteToHospital?: boolean;
  selectedHospital?: Hospital | null;
}

const EmergencyMap = ({
  userLocation,
  ambulanceLocation,
  hospitals,
  selectedHospitalId,
  onHospitalSelect,
  showAmbulance,
  showRouteToHospital = false,
  selectedHospital = null
}: EmergencyMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{
    user: L.Marker | null;
    ambulance: L.Marker | null;
    hospitals: Map<string, L.Marker>;
    route: L.Polyline | null;
    hospitalRoute: L.Polyline | null;
  }>({
    user: null,
    ambulance: null,
    hospitals: new Map(),
    route: null,
    hospitalRoute: null
  });

  // Create custom icons
  const createIcon = (emoji: string, size: number = 32, className: string = "") => {
    return L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 rounded-full ${className}" style="font-size: ${size}px;">${emoji}</div>`,
      className: "custom-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRef.current);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update user marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (markersRef.current.user) {
      markersRef.current.user.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userIcon = L.divIcon({
        html: `
          <div class="relative">
            <div class="absolute inset-0 w-12 h-12 rounded-full bg-primary/30 animate-ping"></div>
            <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white">
              <span style="font-size: 20px;">📍</span>
            </div>
          </div>
        `,
        className: "user-marker",
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      markersRef.current.user = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup("<b>Your Location</b>");
    }

    mapRef.current.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 0.5 });
  }, [userLocation]);

  // Update ambulance marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (showAmbulance && ambulanceLocation) {
      const ambulanceIcon = L.divIcon({
        html: `
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
            <span style="font-size: 24px;">🚑</span>
          </div>
        `,
        className: "ambulance-marker",
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      if (markersRef.current.ambulance) {
        markersRef.current.ambulance.setLatLng([ambulanceLocation.lat, ambulanceLocation.lng]);
      } else {
        markersRef.current.ambulance = L.marker([ambulanceLocation.lat, ambulanceLocation.lng], { icon: ambulanceIcon })
          .addTo(mapRef.current)
          .bindPopup("<b>Ambulance</b><br/>On the way!");
      }

      // Draw route line from ambulance to user
      const routePoints: L.LatLngExpression[] = [
        [ambulanceLocation.lat, ambulanceLocation.lng],
        [userLocation.lat, userLocation.lng]
      ];

      if (markersRef.current.route) {
        markersRef.current.route.setLatLngs(routePoints);
      } else {
        markersRef.current.route = L.polyline(routePoints, {
          color: "#ef4444",
          weight: 4,
          opacity: 0.7,
          dashArray: "10, 10"
        }).addTo(mapRef.current);
      }
    } else {
      if (markersRef.current.ambulance) {
        markersRef.current.ambulance.remove();
        markersRef.current.ambulance = null;
      }
      if (markersRef.current.route) {
        markersRef.current.route.remove();
        markersRef.current.route = null;
      }
    }
  }, [ambulanceLocation, showAmbulance, userLocation]);

  // Update hospital markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.hospitals.forEach((marker) => marker.remove());
    markersRef.current.hospitals.clear();

    // Add new markers
    hospitals.forEach((hospital) => {
      const isSelected = hospital.id === selectedHospitalId;
      
      const hospitalIcon = L.divIcon({
        html: `
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
            isSelected 
              ? "bg-primary border-2 border-white scale-110" 
              : "bg-white border border-gray-200"
          }">
            <span style="font-size: 18px;">${isSelected ? "🏥" : "🏨"}</span>
          </div>
        `,
        className: "hospital-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <b>${hospital.name}</b><br/>
          ${hospital.address}<br/>
          ${hospital.distance ? `<span class="text-primary">${hospital.distance.toFixed(1)} km away</span>` : ""}
        `);

      marker.on("click", () => {
        onHospitalSelect(hospital);
      });

      markersRef.current.hospitals.set(hospital.id, marker);
    });
  }, [hospitals, selectedHospitalId, onHospitalSelect]);

  // Draw route from ambulance to hospital during at_hospital phase
  useEffect(() => {
    if (!mapRef.current) return;

    if (showRouteToHospital && ambulanceLocation && selectedHospital) {
      const routePoints: L.LatLngExpression[] = [
        [ambulanceLocation.lat, ambulanceLocation.lng],
        [selectedHospital.lat, selectedHospital.lng]
      ];

      if (markersRef.current.hospitalRoute) {
        markersRef.current.hospitalRoute.setLatLngs(routePoints);
      } else {
        markersRef.current.hospitalRoute = L.polyline(routePoints, {
          color: "#22c55e",
          weight: 5,
          opacity: 0.8,
          dashArray: "12, 8"
        }).addTo(mapRef.current);

        // Only fit bounds once when route first appears
        const bounds = L.latLngBounds(routePoints);
        mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    } else {
      if (markersRef.current.hospitalRoute) {
        markersRef.current.hospitalRoute.remove();
        markersRef.current.hospitalRoute = null;
      }
    }
  }, [showRouteToHospital, ambulanceLocation, selectedHospital]);

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
  );
};

export default EmergencyMap;
