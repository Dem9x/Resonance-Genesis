"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement | null) => void;
      };
    };
  }
}

export function XPostEmbed({ url }: { url: string }) {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://platform.twitter.com/widgets.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
      script.onload = () => window.twttr?.widgets?.load();
      return;
    }

    window.twttr?.widgets?.load();
  }, []);

  return (
    <div className="glass-panel overflow-hidden rounded-[1.5rem] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Live X Article</p>
          <p className="mt-2 text-sm text-[var(--muted)]">@Resogen_Chladni official post</p>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--panel-border)] bg-white/5 px-4 py-2 text-xs font-bold text-[var(--accent)] transition hover:border-[var(--accent)]">
          Open on X
        </a>
      </div>
      <div className="min-h-[220px] rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/60 p-4">
        <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true">
          <a href={url}>View Resonance Genesis post on X</a>
        </blockquote>
        <noscript>
          <a href={url}>View Resonance Genesis post on X</a>
        </noscript>
      </div>
    </div>
  );
}
