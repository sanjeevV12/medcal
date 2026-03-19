import { useState } from "react";
import Navbar from "@/components/Navbar";
import QuickActionBar from "@/components/QuickActionBar";
import ChatSupportWidget from "@/components/ChatSupportWidget";
import EmergencyTrackingOverlay from "@/components/EmergencyTrackingOverlay";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import TrackingSection from "@/components/TrackingSection";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import AdditionalServices from "@/components/AdditionalServices";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import AmbulanceRequestSheet from "@/components/AmbulanceRequestSheet";
import AIDoctorSection from "@/components/AIDoctorSection";
import DriverRegistration from "@/components/DriverRegistration";

const Index = () => {
  const [emergencyOverlayOpen, setEmergencyOverlayOpen] = useState(false);
  const [ambulanceSheetOpen, setAmbulanceSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <QuickActionBar onEmergencyAlert={() => setEmergencyOverlayOpen(true)} />
      
      {/* Add padding for the sticky action bar */}
      <div className="pt-14">
        <HeroSection />

        {/* Request Ambulance CTA */}
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <button
              onClick={() => setAmbulanceSheetOpen(true)}
              className="w-full max-w-md mx-auto flex items-center justify-center gap-3 py-5 px-8 rounded-2xl bg-gradient-emergency text-emergency-foreground font-bold text-lg shadow-emergency hover:opacity-90 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              🚑 Request Ambulance
            </button>
            <p className="text-muted-foreground text-sm mt-3">Bike • Auto • Mayuri • BLS • ALS • Air Ambulance</p>
          </div>
        </section>

        <HowItWorks />
        <TrackingSection />
        <LiveTrackingMap />
        <ServicesSection />
        <AIDoctorSection />
        <PricingSection />
        <AdditionalServices />
        <TestimonialsSection />
        <StatsSection />
        <Footer />
      </div>

      <AmbulanceRequestSheet open={ambulanceSheetOpen} onOpenChange={setAmbulanceSheetOpen} />

      <EmergencyTrackingOverlay 
        isOpen={emergencyOverlayOpen} 
        onClose={() => setEmergencyOverlayOpen(false)} 
      />

      {/* Hidden buttons for hero section triggers */}
      <button id="emergency-alert-btn" className="hidden" onClick={() => setEmergencyOverlayOpen(true)} />
      <button id="basic-care-btn" className="hidden" onClick={() => {
        const event = new CustomEvent('open-basic-care');
        window.dispatchEvent(event);
      }} />
      <button id="request-ambulance-btn" className="hidden" onClick={() => setAmbulanceSheetOpen(true)} />

      <ChatSupportWidget />
    </div>
  );
};

export default Index;
