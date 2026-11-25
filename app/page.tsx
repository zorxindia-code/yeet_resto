import { StickerPreloader } from "@/components/StickerPreloader";
import { HeroSection } from "@/components/HeroSection";
import { AnimatedMarquee } from "@/components/AnimatedMarquee";
import { FoodCategorySection } from "@/components/FoodCategorySection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { StickerRealityReveal } from "@/components/StickerRealityReveal";
import { BurgerAssembly } from "@/components/BurgerAssembly";
import { BrandExperience } from "@/components/BrandExperience";
import { TakeawayBagExperience } from "@/components/TakeawayBagExperience";
import { OffersSection } from "@/components/OffersSection";
import { SocialGallery } from "@/components/SocialGallery";
import { LocationSection } from "@/components/LocationSection";

export default function HomePage() {
  return (
    <>
      <StickerPreloader />
      <HeroSection />
      <AnimatedMarquee />
      <FoodCategorySection />
      <FeaturedProducts />
      <StickerRealityReveal />
      <BurgerAssembly />
      <BrandExperience />
      <TakeawayBagExperience />
      <OffersSection />
      <SocialGallery />
      <LocationSection />
    </>
  );
}
