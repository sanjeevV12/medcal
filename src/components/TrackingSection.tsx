import { MapPin, Navigation, AlertTriangle, Radio } from "lucide-react";

const TrackingSection = () => {
  return (
    <section id="tracking" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real-Time Emergency Tracking
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered system detects accidents, locates you instantly, and dispatches help within seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Map Visualization */}
          <div className="relative">
            <div className="bg-card rounded-3xl p-6 shadow-card overflow-hidden">
              {/* Simulated Map */}
              <div className="relative h-80 bg-gradient-to-br from-primary/5 to-secondary rounded-2xl overflow-hidden">
                {/* Grid pattern for map effect */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-8 grid-rows-8 h-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="border border-primary/10" />
                    ))}
                  </div>
                </div>

                {/* Roads simulation */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-muted-foreground/20 transform -translate-y-1/2" />
                  <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-muted-foreground/20" />
                  <div className="absolute top-0 bottom-0 right-1/4 w-2 bg-muted-foreground/20" />
                </div>

                {/* Patient Location */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-16 h-16 bg-emergency/20 rounded-full absolute -inset-4 animate-ping" />
                    <div className="w-8 h-8 bg-emergency rounded-full flex items-center justify-center relative z-10">
                      <MapPin className="w-5 h-5 text-emergency-foreground" />
                    </div>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap bg-card px-2 py-1 rounded">
                    Your Location
                  </span>
                </div>

                {/* Hospital */}
                <div className="absolute top-1/4 right-1/4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">H</span>
                  </div>
                  <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                    Hospital
                  </span>
                </div>

                {/* Animated Ambulance */}
                <div className="absolute top-1/4 right-1/3 animate-pulse">
                  <div className="w-10 h-10 bg-emergency rounded-lg flex items-center justify-center animate-bounce">
                    <span className="text-emergency-foreground text-lg">🚑</span>
                  </div>
                  <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-foreground font-medium whitespace-nowrap">
                    Ambulance
                  </span>
                </div>

                {/* Medical Shop */}
                <div className="absolute bottom-1/4 left-1/4">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-accent-foreground text-sm">💊</span>
                  </div>
                  <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                    Medical Shop
                  </span>
                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-6 flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="font-medium text-foreground">Ready to assist</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Press Emergency Alert to begin
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emergency" />
                Emergency Response System
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Radio className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Auto Detection</p>
                    <p className="text-sm text-muted-foreground">AI detects accidents through connected devices & sensors</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">GPS Precision</p>
                    <p className="text-sm text-muted-foreground">Pinpoint accuracy to locate you within meters</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Smart Routing</p>
                    <p className="text-sm text-muted-foreground">Fastest route to reach you & nearest hospital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingSection;
