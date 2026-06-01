import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--panel-border)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm font-black uppercase tracking-[0.24em] text-[var(--text)]">Resonance Genesis</p>
          <p className="mt-2">Contract: 0x0000...pending deployment</p>
          <p className="mt-2 max-w-xl">RE is native resonance power for utility mechanics. It is not APY, yield, or a guaranteed financial return.</p>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link href="/waitlist" className="hover:text-[var(--accent)]">Waitlist</Link>
          <Link href="/docs" className="hover:text-[var(--accent)]">Docs</Link>
          <span>Discord</span>
          <span>X</span>
          <span>Mirror</span>
        </div>
      </div>
    </footer>
  );
}
