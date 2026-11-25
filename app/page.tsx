import { StickerPreloader } from "@/components/StickerPreloader";
import { HeroSection } from "@/components/HeroSection";
import { AnimatedMarquee } from "@/components/AnimatedMarquee";
import { FoodCategorySection } from "@/components/FoodCategorySection";
import { BurgerAssembly } from "@/components/BurgerAssembly";
import { BrandExperience } from "@/components/BrandExperience";
import { TakeawayBagExperience } from "@/components/TakeawayBagExperience";
import { OffersSection } from "@/components/OffersSection";
import { SocialGallery } from "@/components/SocialGallery";
import { LocationSection } from "@/components/LocationSection";
import { ScrollWaveTransition } from "@/components/ScrollWaveTransition";
import { ComboPromo } from "@/components/ComboPromo";

export default function HomePage() {
  return (
    <>
      <StickerPreloader />
      <HeroSection />
      {/* Red hero → white marquee. Rises into the hero's bottom. */}
      <ScrollWaveTransition from="red" to="white" overlap="top" height={{ mobile: 64, desktop: 150 }} shape={0} direction="right" />
      <AnimatedMarquee />
      <FoodCategorySection />
      {/* Phones only: combo poster */}
      <ComboPromo />
      {/* White → red burger assembly. The assembly pins on desktop, so the wave stays in the section above. */}
      <ScrollWaveTransition from="white" to="red" overlap="top" height={{ mobile: 64, desktop: 120 }} shape={1} direction="left" />
      <BurgerAssembly />
      {/* Red assembly → white brand story (hangs into the story's top padding, clear of the pin). */}
      <ScrollWaveTransition from="red" to="white" overlap="bottom" height={{ mobile: 64, desktop: 120 }} shape={0} direction="right" />
      <BrandExperience />
      {/* White brand story → red takeaway bag. The bag pins on desktop, so the wave stays inside the story section. */}
      <ScrollWaveTransition from="white" to="red" overlap="top" height={{ mobile: 64, desktop: 150 }} shape={2} direction="right" />
      <TakeawayBagExperience />
      {/* Red bag → white offers (hangs into the offers' top padding, clear of the pin). */}
      <ScrollWaveTransition from="red" to="white" overlap="bottom" height={{ mobile: 64, desktop: 120 }} shape={1} direction="left" />
      <OffersSection />
      {/* White offers → red gallery */}
      <ScrollWaveTransition from="white" to="red" overlap="both" shape={2} direction="right" amplitude={0.8} />
      <SocialGallery />
      {/* Red gallery → white location */}
      <ScrollWaveTransition from="red" to="white" overlap="both" shape={0} direction="left" amplitude={0.8} />
      <LocationSection />
    </>
  );
}
