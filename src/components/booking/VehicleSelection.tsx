import { useState, useMemo } from "react";
import { ArrowLeft, Clock, Star, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Vehicle {
  id: string;
  type: string;
  name: string;
  emoji: string;
  basePrice: number;
  perKmRate: number;
  eta: number; // minutes
  description: string;
  features: string[];
}

const VEHICLES: Vehicle[] = [
  {
    id: "bike",
    type: "bike",
    name: "Medi-Bike",
    emoji: "🏍️",
    basePrice: 49,
    perKmRate: 8,
    eta: 5,
    description: "First-aid responder on bike",
    features: ["First Aid Kit", "Fastest Response"],
  },
  {
    id: "auto",
    type: "auto",
    name: "Medi-Auto",
    emoji: "🛺",
    basePrice: 99,
    perKmRate: 12,
    eta: 7,
    description: "Basic care in auto-rickshaw",
    features: ["Basic Medical Kit", "Oxygen Cylinder"],
  },
  {
    id: "bls",
    type: "ambulance",
    name: "BLS Ambulance",
    emoji: "🚑",
    basePrice: 499,
    perKmRate: 25,
    eta: 10,
    description: "Basic Life Support ambulance",
    features: ["Stretcher", "Oxygen", "BP Monitor", "EMT Staff"],
  },
  {
    id: "als",
    type: "ambulance",
    name: "ALS Ambulance",
    emoji: "🏥",
    basePrice: 1499,
    perKmRate: 45,
    eta: 12,
    description: "Advanced Life Support with doctor",
    features: ["Ventilator", "Defibrillator", "Doctor Onboard", "IV Setup"],
  },
  {
    id: "helicopter",
    type: "helicopter",
    name: "Air Ambulance",
    emoji: "🚁",
    basePrice: 25000,
    perKmRate: 500,
    eta: 15,
    description: "Helicopter for critical emergencies",
    features: ["ICU Equipment", "Surgeon Team", "Critical Care"],
  },
];

interface VehicleSelectionProps {
  distanceKm: number;
  onSelect: (vehicle: Vehicle, fare: number) => void;
  onBack: () => void;
  pickupAddress: string;
  destinationAddress: string;
}

const VehicleSelection = ({
  distanceKm,
  onSelect,
  onBack,
  pickupAddress,
  destinationAddress,
}: VehicleSelectionProps) => {
  const [selectedId, setSelectedId] = useState<string>("bls");

  // Simulate demand multiplier (1.0 - 2.5x)
  const demandMultiplier = useMemo(() => {
    const hour = new Date().getHours();
    // Peak hours: 8-10 AM, 5-8 PM
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
      return 1.3 + Math.random() * 0.5; // 1.3x - 1.8x
    }
    // Late night: 11 PM - 5 AM
    if (hour >= 23 || hour <= 5) {
      return 1.5 + Math.random() * 0.7; // 1.5x - 2.2x
    }
    return 1.0 + Math.random() * 0.3; // 1.0x - 1.3x
  }, []);

  const isHighDemand = demandMultiplier > 1.3;

  const calculateFare = (vehicle: Vehicle) => {
    const baseFare = vehicle.basePrice + vehicle.perKmRate * distanceKm;
    return Math.round(baseFare * demandMultiplier);
  };

  const selectedVehicle = VEHICLES.find((v) => v.id === selectedId)!;
  const selectedFare = calculateFare(selectedVehicle);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Choose Vehicle</h2>
          <p className="text-xs text-muted-foreground">
            {distanceKm.toFixed(1)} km • {pickupAddress} → {destinationAddress}
          </p>
        </div>
      </div>

      {/* Demand indicator */}
      {isHighDemand && (
        <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/30 rounded-lg">
          <TrendingUp className="w-4 h-4 text-warning" />
          <span className="text-xs font-medium text-warning">
            High demand • Prices {demandMultiplier.toFixed(1)}x higher than usual
          </span>
        </div>
      )}

      {/* Vehicle list */}
      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
        {VEHICLES.map((vehicle) => {
          const fare = calculateFare(vehicle);
          const isSelected = vehicle.id === selectedId;

          return (
            <button
              key={vehicle.id}
              onClick={() => setSelectedId(vehicle.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isSelected
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              {/* Emoji */}
              <div className="text-3xl w-12 h-12 flex items-center justify-center shrink-0">
                {vehicle.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{vehicle.name}</span>
                  {vehicle.id === "bls" && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{vehicle.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {vehicle.eta} min
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {vehicle.features.slice(0, 2).map((f) => (
                      <span key={f} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <div className="font-bold text-foreground">₹{fare}</div>
                {isHighDemand && (
                  <div className="text-[10px] text-muted-foreground line-through">
                    ₹{Math.round(vehicle.basePrice + vehicle.perKmRate * distanceKm)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      <Button
        onClick={() => onSelect(selectedVehicle, selectedFare)}
        className="w-full"
        variant="default"
        size="lg"
      >
        <Zap className="w-4 h-4 mr-2" />
        Book {selectedVehicle.name} • ₹{selectedFare}
      </Button>
    </div>
  );
};

export default VehicleSelection;
export type { Vehicle };
