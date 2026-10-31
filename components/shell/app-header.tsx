import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const nav = [
  { href: "/assessment", label: "Асессмент" },
  { href: "/results", label: "Результаты" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[var(--content-max)] items-center gap-6 px-6">
        <Link href="/" className="text-[length:var(--fs-subtitle)] font-medium tracking-tight">
          Визуальный асессмент
        </Link>
        <nav className="flex items-center gap-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[length:var(--fs-body)] text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
