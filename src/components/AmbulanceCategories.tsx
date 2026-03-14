import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Star, Users, Zap, Shield, Heart, Truck } from "lucide-react";

interface AmbulanceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  baseFare: number;
  perKmRate: number;
  eta: string;
  features: string[];
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive";
}

const categories: AmbulanceCategory[] = [
  {
    id: "bls",
    name: "BLS",
    description: "Basic Life Support",
    icon: <Truck className="w-7 h-7" />,
    baseFare: 499,
    perKmRate: 15,
    eta: "8-12 min",
    features: ["First Aid Kit", "Oxygen Cylinder", "Stretcher", "Trained EMT"],
    badge: "Most Popular",
    badgeVariant: "default",
  },
  {
    id: "als",
    name: "ALS",
    description: "Advanced Life Support",
    icon: <Heart className="w-7 h-7" />,
    baseFare: 1499,
    perKmRate: 25,
    eta: "10-15 min",
    features: ["Cardiac Monitor", "Defibrillator", "IV Setup", "Paramedic"],
    badge: "Recommended",
    badgeVariant: "secondary",
  },
  {
    id: "icu",
    name: "ICU on Wheels",
    description: "Mobile ICU Ambulance",
    icon: <Shield className="w-7 h-7" />,
    baseFare: 2999,
    perKmRate: 40,
    eta: "12-18 min",
    features: ["Ventilator", "Multi-Para Monitor", "Doctor Onboard", "Critical Care"],
    badge: "Premium",
    badgeVariant: "destructive",
  },
  {
    id: "mortuary",
    name: "Mortuary",
    description: "Dead Body Transport",
    icon: <Truck className="w-7 h-7" />,
    baseFare: 1999,
    perKmRate: 20,
    eta: "15-20 min",
    features: ["Freezer Box", "Dignified Transport", "Documentation Help", "24/7"],
  },
];

interface AmbulanceCategoriesProps {
  selectedCategory?: string;
  onSelect?: (category: AmbulanceCategory) => void;
}

const AmbulanceCategories = ({ selectedCategory, onSelect }: AmbulanceCategoriesProps) => {
  const [selected, setSelected] = useState(selectedCategory || "bls");

  const handleSelect = (cat: AmbulanceCategory) => {
    setSelected(cat.id);
    onSelect?.(cat);
  };

  return (
    <section className="py-16 bg-background" id="ambulance-types">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 text-xs tracking-wider uppercase">
            Choose Your Ride
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Ambulance Categories
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select the right ambulance type based on your medical emergency
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {categories.map((cat) => {
            const isSelected = selected === cat.id;
            return (
              <Card
                key={cat.id}
                onClick={() => handleSelect(cat)}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 p-5 border-2 hover:shadow-lg",
                  isSelected
                    ? "border-primary bg-accent shadow-lg scale-[1.02]"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                {cat.badge && (
                  <Badge
                    variant={cat.badgeVariant || "default"}
                    className="absolute -top-2.5 right-3 text-[10px]"
                  >
                    {cat.badge}
                  </Badge>
                )}

                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}>
                  {cat.icon}
                </div>

                <h3 className="text-lg font-bold text-foreground">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{cat.description}</p>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold text-foreground">₹{cat.baseFare}</span>
                  <span className="text-xs text-muted-foreground">+ ₹{cat.perKmRate}/km</span>
                </div>

                <div className="flex items-center gap-1.5 mb-4">
                  <Zap className="w-3.5 h-3.5 text-warning" />
                  <span className="text-xs font-medium text-foreground">ETA: {cat.eta}</span>
                </div>

                <div className="space-y-1.5">
                  {cat.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-primary" : "bg-muted-foreground/40"
                      )} />
                      {f}
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div className="mt-4 pt-3 border-t border-primary/20">
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Star className="w-3.5 h-3.5 fill-primary" />
                      Selected
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Compact info strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span>Verified & trained crew</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <span>GPS tracked rides</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span>Real-time ETA updates</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AmbulanceCategories;
