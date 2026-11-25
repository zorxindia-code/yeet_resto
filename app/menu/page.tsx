import type { Metadata } from "next";
import { MenuBrowser } from "@/components/MenuBrowser";

export const metadata: Metadata = {
  title: "Menu",
  description: "The YEET RESTO CAFÉ menu with prices in AED: smash burgers, chicken zinger burgers, boneless wings, loaded fries, zinger wraps, strips meals, fries and sides, teas and shakes, and kids meals.",
};

// Fully static: every product is prerendered. ?cat= is applied on the client (see MenuBrowser).
export default function MenuPage() {
  return <MenuBrowser />;
}
