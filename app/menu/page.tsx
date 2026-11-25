import type { Metadata } from "next";
import { MenuBrowser } from "@/components/MenuBrowser";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the YEET RESTO CAFÉ demo menu: burgers, chicken and wings, pizza, fries, popcorn, milkshakes and fresh juices.",
};

// Fully static: every product is prerendered. ?cat= is applied on the client (see MenuBrowser).
export default function MenuPage() {
  return <MenuBrowser />;
}
