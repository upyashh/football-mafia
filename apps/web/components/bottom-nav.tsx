"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListOrdered, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: ListOrdered },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 flex gap-1 border-t border-border-subtle bg-surface-card/95 px-2 py-2 backdrop-blur-sm">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-xs font-medium transition-colors",
              active
                ? "bg-club-accent/10 text-club-accent"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
