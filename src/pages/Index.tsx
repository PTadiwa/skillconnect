import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";

const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const MarketSection = lazy(() => import("@/components/MarketSection"));
const TeamSection = lazy(() => import("@/components/TeamSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <Suspense fallback={null}>
        <HowItWorks />
        <MarketSection />
        <TeamSection />
        <AboutSection />
        <ContactSection />
        <CTASection />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
