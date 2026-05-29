import type { Metadata } from "next";
import "./globals.css";
import { BackgroundResonance } from "@/components/BackgroundResonance";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Resonance Genesis",
  description: "Generative cymatics NFT collection and Chladni Node miner dashboard."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="terminal-matrix-sand">
      <body>
        <ThemeProvider>
          <Providers>
            <BackgroundResonance />
            <Header />
            <main>{children}</main>
            <Footer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
