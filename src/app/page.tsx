import { HeroSection } from "@/components/landing/hero-section";
import { OperatingSystemSection } from "@/components/landing/operating-system-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
  return (
    <main id="main-content" className="cinematic-page relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="absolute inset-0 z-[-1] pointer-events-none bg-[#fbf7f1] bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,160,122,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_80%_60%,rgba(147,112,219,0.05)_0%,transparent_50%),linear-gradient(to_bottom,transparent_0%,rgba(212,92,60,0.02)_100%)]" />
      <HeroSection />
      <OperatingSystemSection />
      <FooterSection />
    </main>
  );
}
