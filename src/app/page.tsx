import { Hero } from "@/components/home/hero";
import { RecentSearches } from "@/components/home/recent-searches";
import { PopularDestinations } from "@/components/home/popular-destinations";
import { AirlinesSection } from "@/components/home/airlines-section";
import { PromoBanners } from "@/components/home/promo-banners";

export default function Home() {
  return (
    <div>
      <Hero />
      <RecentSearches />
      <PopularDestinations />
      <PromoBanners />
      <AirlinesSection />
    </div>
  );
}
