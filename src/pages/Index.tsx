import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import QuickActionBar from "@/components/QuickActionBar";
import ChatSupportWidget from "@/components/ChatSupportWidget";
import EmergencyTrackingOverlay from "@/components/EmergencyTrackingOverlay";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import AmbulanceRequestSheet from "@/components/AmbulanceRequestSheet";
import DriverRegistration from "@/components/DriverRegistration";

const Index = () => {
  const [emergencyOverlayOpen, setEmergencyOverlayOpen] = useState(false);
  const [ambulanceSheetOpen, setAmbulanceSheetOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (action: () => void) => {
    if (!user) {
      toast({ title: "Please sign in", description: "Login required to book healthcare services" });
      navigate("/auth");
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <QuickActionBar onEmergencyAlert={() => {}} />
      
      {/* Add padding for the sticky action bar */}
      <div className="pt-14">
        <HeroSection />


        <HowItWorks />
        <ServicesSection />
        <DriverRegistration />
        <TestimonialsSection />
        <StatsSection />
        <Footer />
      </div>

      <AmbulanceRequestSheet open={ambulanceSheetOpen} onOpenChange={setAmbulanceSheetOpen} />

      <EmergencyTrackingOverlay 
        isOpen={emergencyOverlayOpen} 
        onClose={() => setEmergencyOverlayOpen(false)} 
      />

      {/* Hidden buttons for hero section triggers — gated by auth */}
      <button id="emergency-alert-btn" className="hidden" onClick={() => requireAuth(() => setEmergencyOverlayOpen(true))} />
      <button id="basic-care-btn" className="hidden" onClick={() => requireAuth(() => {
        const event = new CustomEvent('open-basic-care');
        window.dispatchEvent(event);
      })} />
      <button id="request-ambulance-btn" className="hidden" onClick={() => requireAuth(() => setAmbulanceSheetOpen(true))} />

      <ChatSupportWidget />
    </div>
  );
};

export default Index;
