import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Phone, MessageSquare, Clock, Route, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Coordinates {
  x: number;
  y: number;
}

interface TrackingState {
  status: 'idle' | 'requesting' | 'driver_assigned' | 'en_route' | 'arriving' | 'arrived';
  progress: number;
  eta: number;
  distance: number;
}

const routePoints: Coordinates[] = [
  { x: 85, y: 20 },  // Start (hospital area)
  { x: 75, y: 25 },
  { x: 65, y: 35 },
  { x: 55, y: 40 },
  { x: 45, y: 45 },
  { x: 35, y: 50 },
  { x: 25, y: 55 },
  { x: 20, y: 60 },  // End (patient location)
];

const patientLocation = { x: 20, y: 60 };
const hospitalLocation = { x: 90, y: 15 };

// Bhopal, MP coordinates
const BHOPAL_COORDS = { lat: 23.2599, lng: 77.4126 };

const LiveTrackingMap = () => {
  const [tracking, setTracking] = useState<TrackingState>({
    status: 'idle',
    progress: 0,
    eta: 12,
    distance: 5.2
  });
  const [ambulancePos, setAmbulancePos] = useState<Coordinates>(routePoints[0]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  const interpolatePosition = useCallback((start: Coordinates, end: Coordinates, t: number): Coordinates => {
    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t
    };
  }, []);

  useEffect(() => {
    if (tracking.status === 'en_route' || tracking.status === 'arriving') {
      const interval = setInterval(() => {
        setTracking(prev => {
          const newProgress = Math.min(prev.progress + 2, 100);
          const newEta = Math.max(0, Math.round(12 * (1 - newProgress / 100)));
          const newDistance = Math.max(0, Number((5.2 * (1 - newProgress / 100)).toFixed(1)));
          
          let newStatus = prev.status;
          if (newProgress >= 90 && prev.status === 'en_route') {
            newStatus = 'arriving';
            toast({
              title: "🚑 Ambulance Arriving!",
              description: "The ambulance is almost at your location",
            });
          }
          if (newProgress >= 100) {
            newStatus = 'arrived';
            toast({
              title: "✅ Ambulance Arrived!",
              description: "Medical team is at your location",
            });
          }
          
          return {
            ...prev,
            progress: newProgress,
            eta: newEta,
            distance: Number(newDistance),
            status: newStatus
          };
        });

        // Update ambulance position along route
        setCurrentPointIndex(prev => {
          const newIndex = Math.min(
            Math.floor((tracking.progress / 100) * (routePoints.length - 1)),
            routePoints.length - 2
          );
          return newIndex;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [tracking.status, tracking.progress]);

  // Smooth ambulance movement
  useEffect(() => {
    if (tracking.status === 'en_route' || tracking.status === 'arriving') {
      const segmentProgress = (tracking.progress / 100) * (routePoints.length - 1);
      const segmentIndex = Math.floor(segmentProgress);
      const t = segmentProgress - segmentIndex;
      
      if (segmentIndex < routePoints.length - 1) {
        const pos = interpolatePosition(
          routePoints[segmentIndex],
          routePoints[segmentIndex + 1],
          t
        );
        setAmbulancePos(pos);
      } else {
        setAmbulancePos(routePoints[routePoints.length - 1]);
      }
    }
  }, [tracking.progress, tracking.status, interpolatePosition]);

  const handleEmergencyRequest = () => {
    setTracking({ status: 'requesting', progress: 0, eta: 12, distance: 5.2 });
    setShowPulse(true);
    setAmbulancePos(routePoints[0]);
    
    toast({
      title: "📍 Location Detected",
      description: "Finding nearest available ambulance...",
    });

    setTimeout(() => {
      setTracking(prev => ({ ...prev, status: 'driver_assigned' }));
      toast({
        title: "🚑 Driver Assigned!",
        description: "Rajesh Kumar is on the way",
      });
    }, 2000);

    setTimeout(() => {
      setTracking(prev => ({ ...prev, status: 'en_route' }));
    }, 4000);
  };

  const resetTracking = () => {
    setTracking({ status: 'idle', progress: 0, eta: 12, distance: 5.2 });
    setAmbulancePos(routePoints[0]);
    setCurrentPointIndex(0);
    setShowPulse(false);
  };

  const statusColors = {
    idle: 'bg-muted-foreground',
    requesting: 'bg-amber-500',
    driver_assigned: 'bg-blue-500',
    en_route: 'bg-primary',
    arriving: 'bg-accent',
    arrived: 'bg-accent'
  };

  const statusText = {
    idle: 'Ready to assist',
    requesting: 'Finding ambulance...',
    driver_assigned: 'Driver assigned',
    en_route: 'En route to you',
    arriving: 'Almost there!',
    arrived: 'Arrived at location'
  };

  return (
    <section id="live-tracking" className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
            <Zap className="w-4 h-4" />
            Live GPS Tracking
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real-Time Ambulance Tracking
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch your ambulance move in real-time. Know exactly when help will arrive.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Map Section */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-3xl p-4 shadow-card overflow-hidden">
              {/* Map Container */}
              <div className="relative h-[400px] bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/30 dark:to-teal-900/30 rounded-2xl overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-30">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Road network */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Main roads */}
                  <path d="M 0 30 L 100 30" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.3" />
                  <path d="M 0 60 L 100 60" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.3" />
                  <path d="M 30 0 L 30 100" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.3" />
                  <path d="M 70 0 L 70 100" stroke="hsl(var(--muted-foreground))" strokeWidth="3" opacity="0.3" />
                  
                  {/* Route path */}
                  {tracking.status !== 'idle' && (
                    <path 
                      d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Traveled path */}
                  {tracking.progress > 0 && (
                    <path 
                      d={`M ${routePoints.slice(0, currentPointIndex + 2).map(p => `${p.x} ${p.y}`).join(' L ')}`}
                      stroke="hsl(var(--accent))"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Hospital marker */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${hospitalLocation.x}%`, top: `${hospitalLocation.y}%` }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-primary-foreground font-bold text-sm">H+</span>
                    </div>
                    <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap bg-card/90 px-2 py-0.5 rounded">
                      Hamidia Hospital
                    </span>
                  </div>
                </div>

                {/* Patient location marker */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${patientLocation.x}%`, top: `${patientLocation.y}%` }}
                >
                  <div className="relative">
                    {showPulse && (
                      <>
                        <div className="absolute -inset-4 bg-emergency/30 rounded-full animate-ping" />
                        <div className="absolute -inset-2 bg-emergency/20 rounded-full animate-pulse" />
                      </>
                    )}
                    <div className="w-10 h-10 bg-emergency rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <MapPin className="w-5 h-5 text-emergency-foreground" />
                    </div>
                    <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap bg-card/90 px-2 py-0.5 rounded">
                      Your Location
                    </span>
                  </div>
                </div>

                {/* Ambulance marker */}
                {tracking.status !== 'idle' && tracking.status !== 'requesting' && (
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
                    style={{ left: `${ambulancePos.x}%`, top: `${ambulancePos.y}%` }}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 bg-card rounded-xl flex items-center justify-center shadow-xl border-2 ${tracking.status === 'arrived' ? 'border-accent' : 'border-primary'}`}>
                        <span className="text-2xl">🚑</span>
                      </div>
                      {tracking.status !== 'arrived' && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card px-2 py-1 rounded-lg shadow-md text-xs font-medium whitespace-nowrap">
                          <span className="text-primary">{tracking.eta} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical shops */}
                <div className="absolute" style={{ left: '40%', top: '75%' }}>
                  <div className="w-6 h-6 bg-accent/80 rounded-lg flex items-center justify-center">
                    <span className="text-xs">💊</span>
                  </div>
                </div>
                <div className="absolute" style={{ left: '60%', top: '45%' }}>
                  <div className="w-6 h-6 bg-accent/80 rounded-lg flex items-center justify-center">
                    <span className="text-xs">💊</span>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[tracking.status]} ${tracking.status === 'en_route' || tracking.status === 'arriving' ? 'animate-pulse' : ''}`} />
                    <span className="font-medium text-foreground">{statusText[tracking.status]}</span>
                  </div>
                  {tracking.status !== 'idle' && tracking.status !== 'arrived' && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{tracking.eta} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Route className="w-4 h-4" />
                        <span>{tracking.distance} km</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                {tracking.status !== 'idle' && (
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                      style={{ width: `${tracking.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Emergency Button */}
            {tracking.status === 'idle' && (
              <Button 
                variant="emergency" 
                size="lg" 
                className="w-full h-16 text-lg"
                onClick={handleEmergencyRequest}
              >
                <Navigation className="w-5 h-5 mr-2" />
                Request Emergency Ambulance
              </Button>
            )}

            {tracking.status === 'arrived' && (
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={resetTracking}
              >
                Reset Demo
              </Button>
            )}

            {/* Driver Info Card */}
            {(tracking.status === 'driver_assigned' || tracking.status === 'en_route' || tracking.status === 'arriving' || tracking.status === 'arrived') && (
              <div className="bg-card rounded-2xl p-5 shadow-card animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    👨‍⚕️
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">Rajesh Kumar</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-amber-500">★ 4.9</span>
                      <span className="text-muted-foreground">• 500+ rescues</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="font-medium text-foreground">MP-04-AB-1234</span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground">Advanced Life Support</span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Equipment</span>
                    <span className="font-medium text-accent">Fully Equipped</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href="tel:+917479898265">
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              </div>
            )}

            {/* Live Coordinates */}
            {tracking.status !== 'idle' && (
              <div className="bg-card rounded-2xl p-5 shadow-card">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  Live Coordinates
                </h4>
                <div className="font-mono text-sm space-y-2">
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-foreground text-xs">Bhopal, MP</span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Ambulance</span>
                    <span className="text-foreground">
                      {(BHOPAL_COORDS.lat + (ambulancePos.y / 100) * 0.1).toFixed(4)}°N, 
                      {(BHOPAL_COORDS.lng + (ambulancePos.x / 100) * 0.1).toFixed(4)}°E
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-secondary/50 rounded-lg">
                    <span className="text-muted-foreground">Patient</span>
                    <span className="text-foreground">{BHOPAL_COORDS.lat.toFixed(4)}°N, {BHOPAL_COORDS.lng.toFixed(4)}°E</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {tracking.status === 'idle' && (
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
                <h4 className="font-bold text-foreground mb-3">How it works</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    Press the emergency button above
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    Watch as we locate the nearest ambulance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    Track the ambulance in real-time on the map
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    Get live ETA and distance updates
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveTrackingMap;
