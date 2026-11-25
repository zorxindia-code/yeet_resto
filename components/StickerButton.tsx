import type { ReactNode } from "react";
import { SmartLink } from "@/components/SmartLink";

type Props = {
  /** null = destination not configured yet: renders a disabled "link pending" button. */
  href: string | null;
  children: ReactNode;
  /** primary = filled sticker; secondary = outlined sticker */
  variant?: "primary" | "secondary";
  /** Which surface the button sits on, so colours stay readable. */
  surface?: "red" | "white";
  className?: string;
  cursor?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export function StickerButton({
  href,
  children,
  variant = "primary",
  surface = "red",
  className = "",
  cursor = "EXPLORE",
  onClick,
  ariaLabel,
}: Props) {
  const tone =
    variant === "primary"
      ? surface === "red"
        ? "bg-white text-brand"
        : "bg-brand text-white"
      : surface === "red"
        ? "border-2 border-white text-white"
        : "border-2 border-brand text-brand";

  const base = `sticker-cta sticker-label inline-flex items-center justify-center gap-2 px-7 py-4 text-lg md:text-xl ${tone} ${className}`;
  if (!href) {
    return (
      <span aria-disabled="true" title="Link pending" className={`${base} cursor-not-allowed opacity-50`}>
        {children}
        <span className="sr-only"> (link pending)</span>
      </span>
    );
  }
  const external = /^https?:/.test(href);

  return (
    <SmartLink
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={onClick}
      aria-label={ariaLabel}
      data-cursor={cursor}
      className={base}
    >
      {children}
    </SmartLink>
  );
}
