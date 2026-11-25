import type { ReactNode } from "react";
import { SmartLink } from "@/components/SmartLink";

type Props = {
  href: string;
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

  return (
    <SmartLink
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      data-cursor={cursor}
      className={`sticker-cta sticker-label inline-flex items-center justify-center gap-2 px-7 py-4 text-lg md:text-xl ${tone} ${className}`}
    >
      {children}
    </SmartLink>
  );
}
