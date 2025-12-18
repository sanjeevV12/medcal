import { Check, Star, Shield, Ambulance, Stethoscope, Pill, Users, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingDialog from "./BookingDialog";

const pricingPlans = [
  {
    icon: Ambulance,
    name: "Emergency Response",
    price: "₹3,897",
    period: "starting price",
    description: "Complete emergency care with ambulance & hospital treatment",
    features: [
      "12-minute response guarantee",
      "GPS-enabled ambulance tracking",
      "Trained paramedics",
      "Hospital admission assistance",
      "Insurance claim support",
      "24/7 availability"
    ],
    serviceType: "emergency",
    popular: false,
    buttonText: "Book Emergency"
  },
  {
    icon: Shield,
    name: "Health Shield",
    price: "₹1,989",
    period: "per month",
    description: "Comprehensive health insurance for complete peace of mind",
    features: [
      "Unlimited emergency ambulance",
      "Cashless treatment at 500+ hospitals",
      "Free doctor consultations",
      "Medicine delivery included",
      "Medical assistance (nurse, helper)",
      "No waiting period for accidents"
    ],
    serviceType: "insurance",
    popular: true,
    buttonText: "Get Insured"
  },
  {
    icon: Stethoscope,
    name: "Doctor Consultation",
    price: "FREE",
    period: "unlimited",
    description: "24/7 access to certified doctors for medical advice",
    features: [
      "Video & voice consultations",
      "Chat support available",
      "E-prescription service",
      "Follow-up consultations",
      "Specialist referrals",
      "Health tips & guidance"
    ],
    serviceType: "consultation",
    popular: false,
    buttonText: "Consult Now"
  }
];

const additionalServices = [
  {
    icon: Pill,
    name: "Medicine Delivery",
    price: "₹99",
    description: "Same-day delivery",
    serviceType: "medicine"
  },
  {
    icon: Users,
    name: "Medical Assistance",
    price: "₹499/day",
    description: "Nurses & helpers",
    serviceType: "assistance"
  },
  {
    icon: HeartPulse,
    name: "Health Monitoring",
    price: "₹299/visit",
    description: "BP, Sugar, ECG",
    serviceType: "monitoring"
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            <Star className="w-4 h-4" />
            Transparent Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple & Affordable Healthcare
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No hidden charges. Choose the plan that fits your needs. Money should never be a barrier to health.
          </p>
        </div>

        {/* Main Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-3xl p-6 shadow-card transition-all hover:shadow-lg ${
                plan.popular ? "ring-2 ring-primary scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${plan.popular ? 'bg-primary' : 'bg-primary/10'} flex items-center justify-center`}>
                  <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-1">/{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <BookingDialog serviceType={plan.serviceType} title={`Book ${plan.name}`}>
                <Button 
                  variant={plan.popular ? "default" : "outline"} 
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </BookingDialog>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-foreground text-center mb-6">Add-on Services</h3>
          <div className="grid grid-cols-3 gap-4">
            {additionalServices.map((service, index) => (
              <BookingDialog key={index} serviceType={service.serviceType} title={`Book ${service.name}`}>
                <button className="bg-card rounded-2xl p-4 shadow-card hover:shadow-lg transition-all text-center group cursor-pointer w-full">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <service.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{service.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{service.description}</p>
                  <span className="text-primary font-bold">{service.price}</span>
                </button>
              </BookingDialog>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
