import Link from "next/link";
import { AudioLines } from "lucide-react";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const navItems = [
  { href: "/mint", label: "Mint" },
  { href: "/gallery", label: "Gallery" },
  { href: "/stake", label: "Stake" },
  { href: "/docs", label: "Docs" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--panel-border)] bg-[var(--bg)]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--panel-border)] bg-[var(--panel)] shadow-[0_0_24px_var(--glow)]">
            <AudioLines className="h-5 w-5 text-[var(--accent)]" />
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-[0.24em] text-white sm:text-base">Resonance Genesis</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--accent)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
