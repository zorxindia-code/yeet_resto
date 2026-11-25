"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/site";

export type NavLabel = (typeof NAV_LINKS)[number]["label"];
export type ActiveNav = { label: NavLabel | null; kind: "page" | "section" };

// Homepage links that point at a section ("/#about" …), in page order.
const SECTIONS = NAV_LINKS.filter((l) => l.href.startsWith("/#")).map((l) => ({ label: l.label, id: l.href.slice(2) }));
// A section counts as current once its top passes this share of the viewport. Below the fixed
// header and above the middle, so short sections still register and nothing flickers at edges.
const LINE = 0.4;

/**
 * Which nav item is current. Routes win (/menu → "Menu"); on the homepage a scroll spy picks the
 * section links, falling back to "Home". Re-evaluates on route changes, back/forward and resize.
 */
export function useActiveNav(): ActiveNav {
  const pathname = usePathname();
  const [section, setSection] = useState<NavLabel>("Home");

  useEffect(() => {
    if (pathname !== "/") return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * LINE;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current: NavLabel = "Home";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && (el.getBoundingClientRect().top <= line || atBottom)) current = s.label;
      }
      setSection(current); // React skips the render when the value is unchanged
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule(); // first measurement on the next frame (no synchronous setState in the effect)
    // Scroll restoration (back/forward) and late pin spacing can land after the first paint.
    const late = window.setTimeout(measure, 400);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.clearTimeout(late);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  if (pathname === "/") return { label: section, kind: section === "Home" ? "page" : "section" };
  const route = NAV_LINKS.find((l) => !l.href.includes("#") && l.href !== "/" && (pathname === l.href || pathname.startsWith(`${l.href}/`)));
  return { label: route?.label ?? null, kind: "page" };
}
