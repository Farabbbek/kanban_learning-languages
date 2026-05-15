import { HeroSection } from "@/components/landing/hero-section";
import { OperatingSystemSection } from "@/components/landing/operating-system-section";

export default function Home() {
  return (
    <main id="main-content" className="cinematic-page relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* VIBRANT CINEMATIC GLOBAL BACKGROUND: A rich, colorful base that breathes life into the page */}
      <div className="absolute inset-0 z-[-1] pointer-events-none bg-[#fbf7f1] bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,160,122,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_80%_60%,rgba(147,112,219,0.05)_0%,transparent_50%),linear-gradient(to_bottom,transparent_0%,rgba(212,92,60,0.02)_100%)]" />
      
      <HeroSection />
      
      {/* SEAMLESS TRANSITION WEDGE */}
      <div className="relative w-full h-0 z-10">
        <div className="absolute top-[-150px] left-0 right-0 h-[400px] pointer-events-none bg-[linear-gradient(to_bottom,transparent,rgba(255,140,105,0.08)_40%,rgba(215,80,50,0.12)_60%,transparent)] blur-[40px]" />
        <div className="absolute top-[-50px] left-[10%] right-[10%] h-[300px] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(199,70,46,0.15)_0%,transparent_70%)] blur-[60px]" />
      </div>

      <OperatingSystemSection />
    </main>
  );
}
