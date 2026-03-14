import { useState } from "react";
import Navbar from "@/components/Navbar";
import QuickActionBar from "@/components/QuickActionBar";
import ChatSupportWidget from "@/components/ChatSupportWidget";
import BookingOverlay from "@/components/BookingOverlay";
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

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <QuickActionBar onEmergencyAlert={() => setBookingOpen(true)} />
      
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

      <BookingOverlay 
        isOpen={bookingOpen} 
        onClose={() => setBookingOpen(false)} 
      />

      {/* Hidden buttons for hero section triggers */}
      <button id="emergency-alert-btn" className="hidden" onClick={() => setBookingOpen(true)} />
      <button id="basic-care-btn" className="hidden" onClick={() => {
        const event = new CustomEvent('open-basic-care');
        window.dispatchEvent(event);
      }} />

      <ChatSupportWidget />
    </div>
  );
};

export default Index;
