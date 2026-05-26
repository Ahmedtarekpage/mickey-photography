"use client";

import { useStore } from "@/lib/store";
import { SiteHeader } from "@/components/public/SiteHeader";
import { AboutSection } from "@/components/public/AboutSection";
import { BrandsMarquee } from "@/components/public/BrandsMarquee";
import { StatsSection } from "@/components/public/StatsSection";
import { CategoriesSection } from "@/components/public/CategoriesSection";
import { BookSection } from "@/components/public/BookSection";
import { Footer } from "@/components/public/Footer";

export default function LandingPage() {
  const { settings, brands, stats, countries } = useStore();

  return (
    <div className="scroll-smooth">
      <SiteHeader settings={settings} />
      <AboutSection settings={settings} />
      <BrandsMarquee
        brands={brands.filter((b) => b.showInMarquee !== false)}
        speed={settings.brandsSpeed}
      />
      <StatsSection stats={stats} countries={countries} />
      <CategoriesSection />
      <BookSection settings={settings} />
      <Footer settings={settings} />
    </div>
  );
}
