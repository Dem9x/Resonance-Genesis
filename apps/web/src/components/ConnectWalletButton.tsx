"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { useChainId, useSwitchChain } from "wagmi";
import { requiredChainId } from "@/lib/chains";

export function ConnectWalletButton() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        const wrongNetwork = connected && chainId !== requiredChainId;

        return (
          <div aria-hidden={!ready} className={!ready ? "opacity-0" : ""}>
            {connected ? (
              <button
                type="button"
                onClick={() => {
                  if (wrongNetwork) {
                    switchChain?.({ chainId: requiredChainId });
                    return;
                  }
                  if (chain.unsupported) openChainModal();
                  else openAccountModal();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--accent)] shadow-[0_0_22px_var(--glow)] transition hover:scale-[1.02]"
              >
                <Wallet className="h-4 w-4" />
                {wrongNetwork || chain.unsupported ? "Switch to Sepolia" : account.displayName}
              </button>
            ) : (
              <button
                type="button"
                onClick={openConnectModal}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:scale-[1.02] theme-button"
              >
                <Wallet className="h-4 w-4" />
                Connect
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
