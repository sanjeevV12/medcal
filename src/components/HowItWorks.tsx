import { MapPin, Ambulance, Hospital, Clock } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Accident Detected",
    description: "Our system automatically detects accident locations through GPS and emergency calls.",
    color: "bg-emergency/10 text-emergency",
  },
  {
    icon: Ambulance,
    title: "Rapid Response",
    description: "Based on severity, we dispatch nearby medical shop assistance or ambulance service.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Hospital,
    title: "Hospital Arrival",
    description: "Patient reaches the nearest hospital and treatment begins within 12 minutes.",
    color: "bg-success/10 text-success",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">12-Minute Promise</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How mASSI Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our streamlined emergency response system ensures you get medical help faster than ever before.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-emergency via-primary to-success transform -translate-y-1/2 rounded-full" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-card rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>

                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 mt-2`}>
                  <step.icon className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
