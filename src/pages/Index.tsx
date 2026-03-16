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

const Index = () => {
  const [emergencyOverlayOpen, setEmergencyOverlayOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <QuickActionBar onEmergencyAlert={() => setEmergencyOverlayOpen(true)} />
      
      {/* Add padding for the sticky action bar */}
      <div className="pt-14">
        <HeroSection />
        <HowItWorks />
        <TrackingSection />
        <LiveTrackingMap />
        <ServicesSection />
        <PricingSection />
        <AdditionalServices />
        <TestimonialsSection />
        <StatsSection />
        <Footer />
      </div>

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

      <ChatSupportWidget />
    </div>
  );
};

export default Index;
