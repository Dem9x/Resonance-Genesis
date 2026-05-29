import type { ReactNode } from "react";

type SectionShellProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  children: ReactNode;
  className?: string;
};

export function SectionShell({ eyebrow, title, copy, children, className = "" }: SectionShellProps) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 ${className}`}>
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.32em] text-[var(--accent)]">{eyebrow}</p>
        <h2 className="font-display text-3xl font-black uppercase tracking-wide text-[var(--text)] md:text-5xl">{title}</h2>
        {copy ? <p className="mt-4 text-base leading-7 text-[var(--muted)] md:text-lg">{copy}</p> : null}
      </div>
      {children}
    </section>
  );
}
