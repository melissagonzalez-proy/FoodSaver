import { Navbar } from "../components/NavBar";
import { HeroSection } from "../components/HeroSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { ImpactSection } from "../components/ImpactSection";
import { CommunitySection } from "../components/CommunitySection";
import { Footer } from "../components/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-background pt-24 pb-12 font-sans selection:bg-brand-accent selection:text-white overflow-hidden">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col">
        <HeroSection />
        <HowItWorksSection />
        <ImpactSection />
        <CommunitySection />
        <Footer />
      </main>
    </div>
  );
}
