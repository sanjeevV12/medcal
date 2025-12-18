import { Stethoscope, Pill, Users, Clock, ArrowRight, Video, Home, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingDialog from "./BookingDialog";

const services = [
  {
    icon: Stethoscope,
    title: "Free Doctor Consultancy",
    description: "24/7 access to certified doctors for medical advice and consultation. No charges, unlimited consultations.",
    features: ["Video & Voice calls", "Chat support", "Prescription guidance", "Follow-up care"],
    cta: "Consult Now",
    highlight: true,
    badge: "FREE",
    serviceType: "consultation"
  },
  {
    icon: Pill,
    title: "Medicine at Doorstep",
    description: "Get prescribed medicines delivered to your home within hours. Genuine medicines at best prices.",
    features: ["Same-day delivery", "Genuine medicines", "Discounted prices", "Prescription upload"],
    cta: "Order Medicines",
    highlight: false,
    badge: "FAST DELIVERY",
    serviceType: "medicine"
  },
  {
    icon: Users,
    title: "Medical Assistance",
    description: "Professional nurses, helpers, and caregivers for home care. Ideal for post-surgery recovery.",
    features: ["Trained nurses", "Elder care helpers", "Physiotherapists", "24/7 availability"],
    cta: "Book Assistance",
    highlight: false,
    badge: "HOME CARE",
    serviceType: "assistance"
  },
  {
    icon: HeartPulse,
    title: "Health Monitoring",
    description: "Regular health checkups and vital monitoring for chronic conditions and elderly patients.",
    features: ["BP monitoring", "Sugar level checks", "ECG at home", "Health reports"],
    cta: "Start Monitoring",
    highlight: false,
    badge: "PREVENTIVE",
    serviceType: "monitoring"
  }
];

const AdditionalServices = () => {
  return (
    <section id="additional-services" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Complete Healthcare Solutions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Beyond emergency care, we provide comprehensive healthcare services to keep you and your family healthy.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${
                service.highlight ? "ring-2 ring-primary" : ""
              }`}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 px-2 py-1 bg-primary/10 rounded-full text-primary text-xs font-semibold">
                {service.badge}
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${service.highlight ? 'bg-primary' : 'bg-primary/10'} flex items-center justify-center flex-shrink-0`}>
                  <service.icon className={`w-7 h-7 ${service.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <BookingDialog serviceType={service.serviceType} title={`Book ${service.title}`}>
                    <Button 
                      variant={service.highlight ? "default" : "outline"} 
                      size="sm"
                      className="group"
                    >
                      {service.cta}
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </BookingDialog>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-2xl p-8 max-w-4xl mx-auto shadow-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Video, value: "24/7", label: "Doctor Available" },
              { icon: Clock, value: "< 2hrs", label: "Medicine Delivery" },
              { icon: Home, value: "500+", label: "Home Care Nurses" },
              { icon: HeartPulse, value: "100%", label: "Genuine Care" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-emergency p-6 rounded-2xl">
            <div className="text-emergency-foreground">
              <p className="font-bold text-lg">Need immediate medical help?</p>
              <p className="text-sm opacity-90">Our team is available 24/7 for emergencies</p>
            </div>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-emergency hover:bg-white/90"
              asChild
            >
              <a href="tel:+917479898265">Call: +91-7479898265</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdditionalServices;
