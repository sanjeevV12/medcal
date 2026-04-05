import { useState, useEffect } from "react";
import { Stethoscope, Ambulance } from "lucide-react";
import { Button } from "@/components/ui/button";
import BasicCareDialog from "./BasicCareDialog";

interface QuickActionBarProps {
  onEmergencyAlert: () => void;
}

const QuickActionBar = ({ onEmergencyAlert }: QuickActionBarProps) => {
  const [basicCareOpen, setBasicCareOpen] = useState(false);

  useEffect(() => {
    const handleOpenBasicCare = () => {
      setBasicCareOpen(true);
    };
    window.addEventListener('open-basic-care', handleOpenBasicCare);
    return () => window.removeEventListener('open-basic-care', handleOpenBasicCare);
  }, []);

  const handleRequestAmbulance = () => {
    document.getElementById('request-ambulance-btn')?.click();
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
              onClick={handleRequestAmbulance}
            >
              <Ambulance className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">Request Ambulance</span>
            </Button>
            
            <Button
              variant="default"
              size="default"
              className="flex-1 max-w-[180px] sm:max-w-xs gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
              onClick={() => setBasicCareOpen(true)}
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
