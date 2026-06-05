import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { Marquee } from "@/components/landing/marquee";
import { TransformationSlider } from "@/components/landing/transformation-slider";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { BackgroundEffects } from "@/components/layout/background-effects";
import { CustomCursor } from "@/components/layout/custom-cursor";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/35 font-sans selection:text-primary overflow-x-hidden">
      {/* Background Grids & Glow Layers */}
      <BackgroundEffects />
      
      {/* Custom Mouse Follower */}
      <CustomCursor />

      {/* Landing Navigation Header */}
      <Navigation />
      
      {/* Main Hero & Terminal Monitor */}
      <HeroSection />
      
      {/* Seamless Looping Marquee */}
      <Marquee />

      {/* Drag-to-reveal Incident Transformation Slider */}
      <TransformationSlider />

      {/* Workflow Steps and AI Agent Profiles */}
      <FeaturesSection />
      
      {/* Landing Footer */}
      <Footer />
    </div>
  );
}
