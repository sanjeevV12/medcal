import { Phone, X, Navigation, Clock, Building2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RideTrackerProps {
  status: string;
  eta: number;
  distance: number;
  progress: number;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  driverRating: number;
  hospitalName: string;
  fareEstimate: number;
  onCancel: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  searching: { label: 'Finding ambulance...', color: 'bg-warning', icon: '🔍' },
  driver_assigned: { label: 'Driver assigned', color: 'bg-primary', icon: '✅' },
  arriving: { label: 'Arriving at pickup', color: 'bg-primary', icon: '🚑' },
  picked_up: { label: 'Heading to hospital', color: 'bg-success', icon: '🏥' },
  heading_hospital: { label: 'En route to hospital', color: 'bg-success', icon: '🏥' },
  arrived: { label: 'Arrived at hospital', color: 'bg-success', icon: '✅' },
};

const RideTracker = ({
  status, eta, distance, progress,
  driverName, driverPhone, vehicleNumber, driverRating,
  hospitalName, fareEstimate, onCancel
}: RideTrackerProps) => {
  const config = statusConfig[status] || statusConfig.searching;
  const canCancel = ['searching', 'driver_assigned'].includes(status);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.2)] z-20 animate-fade-in">
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
      </div>

      <div className="px-5 pb-5">
        {/* Status header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <div>
              <p className="font-semibold text-foreground text-sm">{config.label}</p>
              <p className="text-xs text-muted-foreground">
                {status === 'arrived' ? `At ${hospitalName}` : `To ${hospitalName}`}
              </p>
            </div>
          </div>
          {canCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4 relative">
          <div 
            className={`h-full ${config.color} transition-all duration-700 rounded-full`}
            style={{ width: `${progress}%` }}
          />
          {status !== 'arrived' && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-700"
              style={{ left: `calc(${Math.min(progress, 96)}% - 8px)` }}
            >
              <span className="text-sm">🚑</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-base font-bold text-foreground">{eta} min</p>
            <p className="text-[10px] text-muted-foreground">ETA</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <Navigation className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-base font-bold text-foreground">{distance.toFixed(1)} km</p>
            <p className="text-[10px] text-muted-foreground">Distance</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-2.5 text-center">
            <Building2 className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-base font-bold text-foreground">₹{fareEstimate}</p>
            <p className="text-[10px] text-muted-foreground">Est. Fare</p>
          </div>
        </div>

        {/* Driver card */}
        {status !== 'searching' && (
          <div className="bg-muted/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-xl">👨‍⚕️</div>
              <div>
                <p className="font-semibold text-sm text-foreground">{driverName}</p>
                <p className="text-xs text-muted-foreground">{vehicleNumber}</p>
                <p className="text-xs text-warning">⭐ {driverRating}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full w-9 h-9" asChild>
                <a href={`tel:${driverPhone}`}>
                  <Phone className="w-4 h-4 text-success" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideTracker;
