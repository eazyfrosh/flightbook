import { Hero } from "@/components/home/hero";
import { RecentSearches } from "@/components/home/recent-searches";
import { HowItWorks } from "@/components/home/how-it-works";
import { PopularDestinations } from "@/components/home/popular-destinations";
import { WorldRoutesMap } from "@/components/home/world-routes-map";
import { AirlinesSection } from "@/components/home/airlines-section";
import { PromoBanners } from "@/components/home/promo-banners";

export default function Home() {
  return (
    <div>
      <Hero />
      <RecentSearches />
      <HowItWorks />
      <PopularDestinations />
      <WorldRoutesMap />
      <PromoBanners />
      <AirlinesSection />
    </div>
  );
}
