"use client";

import Link from "next/link";
import { AudioLines } from "lucide-react";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { NetworkModeSwitcher } from "@/components/NetworkModeSwitcher";
import { SolanaConnectButton } from "@/components/solana/SolanaConnectButton";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useNetworkMode } from "@/network/NetworkModeProvider";

const evmNavItems = [
  { href: "/", label: "EVM Home" },
  { href: "/mint", label: "Mint" },
  { href: "/gallery", label: "Gallery" },
  { href: "/stake", label: "Stake" },
  { href: "/waitlist", label: "Waitlist" },
  { href: "/news", label: "News" },
  { href: "/docs", label: "Docs" },
];

const solanaNavItems = [
  { href: "/solana", label: "Solana Home" },
  { href: "/solana/mint", label: "Mint" },
  { href: "/solana/gallery", label: "Gallery" },
  { href: "/solana/stake", label: "Stake" },
  { href: "/docs/solana", label: "Docs" },
];

export function Header() {
  const { mode } = useNetworkMode();
  const navItems = mode === "solana" ? solanaNavItems : evmNavItems;
  const homeHref = mode === "solana" ? "/solana" : "/";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--panel-border)] bg-[var(--bg)]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={homeHref} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--panel-border)] bg-[var(--panel)] shadow-[0_0_24px_var(--glow)]">
            <AudioLines className="h-5 w-5 text-[var(--accent)]" />
          </span>
          <span className="hidden font-display text-sm font-bold uppercase tracking-[0.24em] text-white sm:inline sm:text-base">Resonance Genesis</span>
          <span className="rounded-full border border-[var(--panel-border)] px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--accent)]">
            {mode === "solana" ? "Solana" : "EVM"}
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--accent)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <NetworkModeSwitcher />
          <ThemeSwitcher />
          <div className="hidden sm:block">{mode === "solana" ? <SolanaConnectButton /> : <ConnectWalletButton />}</div>
        </div>
      </div>
      <div className="border-t border-[var(--panel-border)]/60 px-4 py-2 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <nav className="flex flex-1 gap-4 overflow-x-auto text-xs font-semibold text-[var(--muted)]">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 transition hover:text-[var(--accent)]">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="sm:hidden">{mode === "solana" ? <SolanaConnectButton /> : <ConnectWalletButton />}</div>
        </div>
      </div>
    </header>
  );
}
