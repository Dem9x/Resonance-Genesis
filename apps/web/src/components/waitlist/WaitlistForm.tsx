"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAccount } from "wagmi";
import { joinWaitlist } from "@/lib/waitlist";
import type { WaitlistEntry, WaitlistInterest } from "@/types/waitlist";
import { WaitlistSuccessCard } from "@/components/waitlist/WaitlistSuccessCard";

const interests: WaitlistInterest[] = ["Mint", "Staking", "Miner Utility", "Chladni Art", "Developer Updates"];

export function WaitlistForm() {
  const { address } = useAccount();
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [selectedInterest, setSelectedInterest] = useState<WaitlistInterest>("Miner Utility");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "already" | "error">("idle");
  const [error, setError] = useState("");
  const [entry, setEntry] = useState<WaitlistEntry | undefined>();

  useEffect(() => {
    if (address) setWalletAddress(address);
  }, [address]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReferredBy(params.get("ref") || "");
  }, []);

  const canSubmit = useMemo(() => Boolean(walletAddress.trim() || email.trim() || xHandle.trim()), [email, walletAddress, xHandle]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setStatus("error");
      setError("Provide wallet, email, or X handle to join the resonance queue.");
      return;
    }

    setStatus("submitting");
    setError("");
    try {
      const result = await joinWaitlist({
        walletAddress,
        email,
        xHandle,
        referredBy,
        selectedInterest,
        selectedTheme: document.documentElement.dataset.theme,
        source: "waitlist-page"
      });
      setEntry(result.entry);
      setStatus(result.alreadyJoined ? "already" : "success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to join waitlist.");
      setStatus("error");
    }
  }

  if (entry && (status === "success" || status === "already")) {
    return (
      <div className="space-y-4">
        {status === "already" ? <div className="rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-sm font-semibold text-[var(--warning)]">Already joined. Showing your existing queue position.</div> : null}
        <WaitlistSuccessCard entry={entry} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-panel rounded-[2rem] p-6">
      <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Join Waiting List</p>
      <h2 className="mt-3 text-3xl font-black uppercase text-[var(--text)]">Reserve an early resonance slot</h2>
      <div className="mt-6 grid gap-4">
        <Field label="Wallet Address" value={walletAddress} onChange={setWalletAddress} placeholder="0x..." />
        <Field label="Email Optional" value={email} onChange={setEmail} placeholder="you@domain.xyz" type="email" />
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Field label="X / Twitter Optional" value={xHandle} onChange={setXHandle} placeholder="@handle" />
          <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">X Activation Steps</p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <p>
                <a href="https://x.com/Resogen_Chladni" target="_blank" rel="noreferrer" className="font-bold text-[var(--text)] underline decoration-[var(--accent)]/50 underline-offset-4">
                  Follow @Resogen_Chladni on X
                </a>
                <br />
                Click profile and follow us.
              </p>
              <p>
                <a href="https://x.com/Resogen_Chladni" target="_blank" rel="noreferrer" className="font-bold text-[var(--text)] underline decoration-[var(--accent)]/50 underline-offset-4">
                  Like and Repost our Pinned Post
                </a>
                <br />
                Go to our profile and like + repost the pinned tweet.
              </p>
            </div>
          </div>
        </div>
        <Field label="Referral Code Optional" value={referredBy} onChange={setReferredBy} placeholder="RE-XXXXXX" />
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Selected Interest</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {interests.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => setSelectedInterest(interest)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${selectedInterest === interest ? "theme-button" : "border-[var(--panel-border)] bg-white/5 text-[var(--muted)] hover:text-[var(--text)]"}`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>
      {status === "error" ? <p className="mt-4 rounded-2xl border border-[var(--danger)]/35 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <button type="submit" disabled={status === "submitting"} className="mt-6 w-full rounded-full px-6 py-4 font-black theme-button disabled:opacity-55">
        {status === "submitting" ? "Submitting..." : "Join Waiting List"}
      </button>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/70 px-4 py-3 text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
      />
    </label>
  );
}
