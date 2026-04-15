import { MapPin, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
              <Clock className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Response within 12 minutes</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Medical Assistance
              <br />
              <span className="text-primary-foreground/80">When Every Second Counts</span>
            </h1>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
              mASSI detects accident locations instantly and delivers emergency medical care within 12 minutes. 
              From first aid at ₹499 to full ambulance service – we've got you covered.
            </p>

            <div className="flex justify-center lg:justify-start">
              <Button 
                variant="emergency" 
                size="xl" 
                className="group text-lg"
                onClick={() => document.getElementById('request-ambulance-btn')?.click()}
              >
                🚑 Request Ambulance
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">12</div>
                <div className="text-sm text-primary-foreground/70">Min Response</div>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">₹199</div>
                <div className="text-sm text-primary-foreground/70">First Aid</div>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-foreground">24/7</div>
                <div className="text-sm text-primary-foreground/70">Available</div>
              </div>
            </div>
          </div>

          <div className="relative animate-float hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Map Preview Card */}
              <div className="absolute inset-4 bg-card rounded-3xl shadow-card overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-emergency flex items-center justify-center animate-pulse-emergency">
                      <MapPin className="w-10 h-10 text-emergency-foreground" />
                    </div>
                    <p className="text-foreground font-medium">Live Location Tracking</p>
                    <p className="text-sm text-muted-foreground mt-1">Detecting nearby responders...</p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">ETA: 8 min</p>
                    <p className="text-xs text-muted-foreground">Ambulance en route</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-card animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">3 Hospitals</p>
                    <p className="text-xs text-muted-foreground">Within 5 km radius</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
