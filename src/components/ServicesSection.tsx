import { useState } from "react";
import { Check, Ambulance, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BasicCareDialog from "./BasicCareDialog";

const services = [
  {
    title: "Basic Care",
    subtitle: "Minor Injuries",
    price: "₹199",
    description: "For non-critical accidents and minor injuries",
    features: [
      "Nearby medical shop response",
      "First aid treatment",
      "Basic medication",
      "Wound dressing",
      "Response within 10 minutes",
    ],
    icon: Store,
    popular: false,
    buttonVariant: "outline" as const,
  },
  {
    title: "Emergency Care",
    subtitle: "Critical Conditions",
    price: "₹3,897",
    description: "For serious accidents requiring hospitalization",
    features: [
      "Ambulance dispatch",
      "Paramedic team",
      "Emergency equipment",
      "Hospital coordination",
      "Treatment starts in ambulance",
      "Nearest hospital admission",
    ],
    icon: Ambulance,
    popular: true,
    buttonVariant: "emergency" as const,
  },
];

const ServicesSection = () => {
  const [basicCareOpen, setBasicCareOpen] = useState(false);

  const handleServiceClick = (isPopular: boolean) => {
    if (!isPopular) {
      setBasicCareOpen(true);
    } else {
      // Scroll to live tracking section for emergency ambulance
      document.getElementById('live-tracking')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Care Level
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered system assesses the severity and automatically dispatches the appropriate response team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-3xl p-8 shadow-card transition-all duration-300 hover:-translate-y-1 ${
                service.popular ? "ring-2 ring-emergency" : ""
              }`}
            >
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-emergency rounded-full text-emergency-foreground text-sm font-semibold">
                  Most Common
                </div>
              )}

              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${service.popular ? 'bg-emergency/10' : 'bg-primary/10'} flex items-center justify-center mb-4`}>
                    <service.icon className={`w-7 h-7 ${service.popular ? 'text-emergency' : 'text-primary'}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground">{service.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${service.popular ? 'text-emergency' : 'text-primary'}`}>
                    {service.price}
                  </div>
                <p className="text-sm text-muted-foreground">starting price</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{service.description}</p>

              <ul className="space-y-3 mb-8">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${service.popular ? 'bg-emergency/10' : 'bg-primary/10'} flex items-center justify-center`}>
                      <Check className={`w-3 h-3 ${service.popular ? 'text-emergency' : 'text-primary'}`} />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>
      </div>

      <BasicCareDialog open={basicCareOpen} onOpenChange={setBasicCareOpen} />
    </section>
  );
};

export default ServicesSection;
