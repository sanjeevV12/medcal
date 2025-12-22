import { useState, useEffect } from "react";
import { AlertCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BasicCareDialog from "./BasicCareDialog";

interface QuickActionBarProps {
  onEmergencyAlert: () => void;
}

const QuickActionBar = ({ onEmergencyAlert }: QuickActionBarProps) => {
  const [basicCareOpen, setBasicCareOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Listen for basic care open event from hero buttons
  useEffect(() => {
    const handleOpenBasicCare = () => {
      setBasicCareOpen(true);
    };
    window.addEventListener('open-basic-care', handleOpenBasicCare);
    return () => window.removeEventListener('open-basic-care', handleOpenBasicCare);
  }, []);

  const handleEmergencyAlert = () => {
    setIsLocating(true);
    toast({
      title: "📍 Detecting Location...",
      description: "Please wait while we find your exact location",
    });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          toast({
            title: "✅ Location Found!",
            description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          });
          onEmergencyAlert();
        },
        () => {
          setIsLocating(false);
          toast({
            title: "📍 Using Default Location",
            description: "Location access denied. Using approximate location.",
          });
          onEmergencyAlert();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      onEmergencyAlert();
    }
  };

  const handleBasicCare = () => {
    setBasicCareOpen(true);
  };

  return (
    <>
      <div className="fixed top-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
            <Button
              variant="emergency"
              size="default"
              className="flex-1 max-w-[180px] sm:max-w-xs gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
              onClick={handleEmergencyAlert}
              disabled={isLocating}
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">{isLocating ? "Locating..." : "Emergency Alert"}</span>
            </Button>
            
            <Button
              variant="default"
              size="default"
              className="flex-1 max-w-[180px] sm:max-w-xs gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
              onClick={handleBasicCare}
            >
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">Get Basic Care</span>
            </Button>
          </div>
        </div>
      </div>

      <BasicCareDialog open={basicCareOpen} onOpenChange={setBasicCareOpen} />
    </>
  );
};

export default QuickActionBar;
