import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Ambulance } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import BasicCareDialog from "./BasicCareDialog";

interface QuickActionBarProps {
  onEmergencyAlert: () => void;
}

const QuickActionBar = ({ onEmergencyAlert }: QuickActionBarProps) => {
  const [basicCareOpen, setBasicCareOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenBasicCare = () => {
      if (!user) {
        toast({ title: "Please sign in", description: "Login required to book healthcare services" });
        navigate("/auth");
        return;
      }
      setBasicCareOpen(true);
    };
    window.addEventListener('open-basic-care', handleOpenBasicCare);
    return () => window.removeEventListener('open-basic-care', handleOpenBasicCare);
  }, [user, navigate]);

  const requireAuth = (action: () => void) => {
    if (loading) return;
    if (!user) {
      toast({ title: "Please sign in", description: "Login required to book an ambulance" });
      navigate("/auth");
      return;
    }
    action();
  };

  const handleRequestAmbulance = () => {
    requireAuth(() => document.getElementById('request-ambulance-btn')?.click());
  };

  const handleBasicCare = () => {
    requireAuth(() => setBasicCareOpen(true));
  };

  return (
    <>
      <div className="fixed top-16 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border shadow-soft" role="region" aria-label="Quick booking actions">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
            <Button
              variant="emergency"
              size="default"
              className="flex-1 max-w-[180px] sm:max-w-xs gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
              onClick={handleRequestAmbulance}
              aria-label="Request emergency ambulance"
            >
              <Ambulance className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">Request Ambulance</span>
            </Button>
            
            <Button
              variant="default"
              size="default"
              className="flex-1 max-w-[180px] sm:max-w-xs gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
              onClick={handleBasicCare}
              aria-label="Get basic medical care for ₹199"
            >
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">Get Basic Care · ₹199</span>
            </Button>
          </div>
        </div>
      </div>

      <BasicCareDialog open={basicCareOpen} onOpenChange={setBasicCareOpen} />
    </>
  );
};

export default QuickActionBar;
