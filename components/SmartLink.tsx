"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { HEADER_OFFSET, useLenis } from "@/components/SmoothScrollProvider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * next/link that keeps same-page navigation inside Lenis:
 *  - "/#about" or "#about" on the current page → smooth scroll (Lenis' anchor handler uses the
 *    same offset); Next's instant hash jump is prevented so the two don't fight.
 *  - "/" while already on "/" → smooth scroll to the top.
 * Cross-page links behave exactly like next/link.
 */
export function SmartLink({ href, onClick, ...rest }: Props) {
  const pathname = usePathname();
  const lenis = useLenis();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const hashIndex = href.indexOf("#");
    const path = hashIndex === 0 ? pathname : hashIndex > 0 ? href.slice(0, hashIndex) : href;
    const instance = lenis?.current;
    if (path !== pathname || !instance) return;

    e.preventDefault();
    if (hashIndex >= 0) {
      const target = document.getElementById(href.slice(hashIndex + 1));
      if (target) instance.scrollTo(target, { offset: HEADER_OFFSET, force: true });
    } else {
      instance.scrollTo(0, { force: true });
    }
  };

  return <Link href={href} {...rest} onClick={handleClick} />;
}
