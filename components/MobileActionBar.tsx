import Link from "next/link";
import { SITE } from "@/lib/site";

/** Compact sticky action bar for small screens. Sits above content so it never hides it permanently. */
export function MobileActionBar() {
  const actions = [
    { label: "View menu", href: "/menu" },
    { label: "Order now", href: SITE.orderUrl },
    { label: "Directions", href: SITE.directionsUrl },
  ];
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-3 bottom-3 z-[65] grid grid-cols-3 gap-2 rounded-[26px] bg-white p-2 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/5 md:hidden"
    >
      {actions.map((a, i) => (
        <Link
          key={a.label}
          href={a.href}
          className={`sticker-label flex min-h-[48px] items-center justify-center rounded-[18px_8px_16px_10px] px-2 text-center text-sm ${
            i === 1 ? "bg-brand text-white" : "bg-paper text-brand"
          }`}
        >
          {a.label}
        </Link>
      ))}
    </nav>
  );
}
