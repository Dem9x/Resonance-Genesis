import type { WaitlistJoinInput, WaitlistJoinResponse, WaitlistStats } from "@/types/waitlist";

export async function joinWaitlist(input: WaitlistJoinInput) {
  const response = await fetch("/api/waitlist/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const data = await parseJson<WaitlistJoinResponse & { error?: string }>(response);
  if (!response.ok && response.status !== 409) throw new Error(data.error || "Unable to join waitlist.");
  return { ...data, alreadyJoined: response.status === 409 || data.alreadyJoined };
}

export async function getWaitlistStats() {
  const response = await fetch("/api/waitlist/stats", { cache: "no-store" });
  const data = await parseJson<WaitlistStats & { error?: string }>(response);
  if (!response.ok) throw new Error(data.error || "Unable to load waitlist stats.");
  return data;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(response.ok ? "Waitlist API returned an invalid response." : `Waitlist API unavailable (${response.status}).`);
  }
}
