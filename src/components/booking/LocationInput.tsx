import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
}

interface LocationInputProps {
  pickupAddress: string;
  destinationAddress: string;
  pickupCoords: { lat: number; lng: number } | null;
  destinationCoords: { lat: number; lng: number } | null;
  onPickupChange: (address: string, coords: { lat: number; lng: number } | null) => void;
  onDestinationChange: (address: string, coords: { lat: number; lng: number } | null) => void;
  onConfirm: () => void;
  isLocating: boolean;
  onDetectLocation: () => void;
}

const LocationInput = ({
  pickupAddress,
  destinationAddress,
  pickupCoords,
  destinationCoords,
  onPickupChange,
  onDestinationChange,
  onConfirm,
  isLocating,
  onDetectLocation,
}: LocationInputProps) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showHospitalSuggestions, setShowHospitalSuggestions] = useState(false);
  const [destSearch, setDestSearch] = useState(destinationAddress);

  useEffect(() => {
    const fetchHospitals = async () => {
      const { data } = await supabase
        .from("hospitals")
        .select("id, name, address, latitude, longitude")
        .eq("emergency_available", true)
        .limit(20);

      if (data) {
        setHospitals(
          data
            .filter((h) => h.latitude && h.longitude)
            .map((h) => ({
              id: h.id,
              name: h.name,
              address: h.address,
              lat: Number(h.latitude),
              lng: Number(h.longitude),
            }))
        );
      }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(destSearch.toLowerCase()) ||
      h.address.toLowerCase().includes(destSearch.toLowerCase())
  );

  const handleSelectHospital = (hospital: Hospital) => {
    setDestSearch(hospital.name);
    onDestinationChange(hospital.name, { lat: hospital.lat, lng: hospital.lng });
    setShowHospitalSuggestions(false);
  };

  const canConfirm = pickupCoords && destinationCoords;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Where do you need help?</h2>

      {/* Pickup */}
      <div className="relative">
        <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl border border-border">
          <div className="w-3 h-3 rounded-full bg-success shrink-0" />
          <Input
            value={pickupAddress}
            onChange={(e) => onPickupChange(e.target.value, pickupCoords)}
            placeholder="Pickup location"
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={onDetectLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Navigation className="w-4 h-4 text-primary" />
            )}
          </Button>
        </div>
      </div>

      {/* Connector line */}
      <div className="flex items-center pl-[22px]">
        <div className="w-0.5 h-6 bg-border" />
      </div>

      {/* Destination */}
      <div className="relative">
        <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-xl border border-border">
          <div className="w-3 h-3 rounded-sm bg-emergency shrink-0" />
          <Input
            value={destSearch}
            onChange={(e) => {
              setDestSearch(e.target.value);
              setShowHospitalSuggestions(true);
              if (!e.target.value) {
                onDestinationChange("", null);
              }
            }}
            onFocus={() => setShowHospitalSuggestions(true)}
            placeholder="Search hospital or destination"
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
          {destSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => {
                setDestSearch("");
                onDestinationChange("", null);
              }}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Hospital suggestions dropdown */}
        {showHospitalSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
            {filteredHospitals.length > 0 ? (
              filteredHospitals.map((hospital) => (
                <button
                  key={hospital.id}
                  onClick={() => handleSelectHospital(hospital)}
                  className="w-full flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-emergency mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{hospital.name}</p>
                    <p className="text-xs text-muted-foreground">{hospital.address}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-muted-foreground text-center">No hospitals found</div>
            )}
          </div>
        )}
      </div>

      {/* Confirm button */}
      <Button
        onClick={onConfirm}
        disabled={!canConfirm}
        className="w-full mt-2"
        variant="default"
        size="lg"
      >
        <MapPin className="w-4 h-4 mr-2" />
        Find Available Vehicles
      </Button>
    </div>
  );
};

export default LocationInput;
