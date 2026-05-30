import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { VideoDemoSection } from "@/components/landing/VideoDemoSection";
import { PlatformShowcase } from "@/components/landing/PlatformShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <VideoDemoSection />
      <PlatformShowcase />
      <HowItWorks />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
