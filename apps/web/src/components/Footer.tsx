import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm font-black uppercase tracking-[0.24em] text-white">Resonance Genesis</p>
          <p className="mt-2">Contract: 0x0000...pending deployment</p>
        </div>
        <div className="flex gap-5">
          <Link href="/docs" className="hover:text-archive-cyan">Docs</Link>
          <span>Discord</span>
          <span>X</span>
          <span>Mirror</span>
        </div>
      </div>
    </footer>
  );
}
