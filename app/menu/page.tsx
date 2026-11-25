import { Suspense } from "react";
import type { Metadata } from "next";
import { MenuBrowser } from "@/components/MenuBrowser";
import { isCategoryId } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse YEET RESTO CAFÉ's sample menu: burgers, chicken, pizza, sides, popcorn and drinks.",
};

async function MenuContent({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  return <MenuBrowser initialCategory={isCategoryId(cat) ? cat : "all"} />;
}

export default function MenuPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-[60svh]" aria-busy="true" />}>
      <MenuContent searchParams={searchParams} />
    </Suspense>
  );
}
