import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import TrackingSection from "@/components/TrackingSection";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import AdditionalServices from "@/components/AdditionalServices";
import PaymentSection from "@/components/PaymentSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
  );
};

export default Index;
