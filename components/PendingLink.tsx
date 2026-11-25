import type { ReactNode } from "react";

/**
 * A plain link when the URL is configured; otherwise a visibly disabled control marked
 * "link pending", so nothing on the site points at a placeholder.
 */
export function PendingLink({ href, className = "", children }: { href: string | null; className?: string; children: ReactNode }) {
  if (!href) {
    return (
      <span aria-disabled="true" title="Link pending" className={`cursor-not-allowed opacity-50 ${className}`}>
        {children}
        <span className="sr-only"> (link pending)</span>
      </span>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a href={href} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}
