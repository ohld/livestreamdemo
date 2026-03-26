"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { ReactNode } from "react";

const manifestUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/tonconnect-manifest.json`
    : "https://livestreamdemo.vercel.app/tonconnect-manifest.json";

export default function TonProvider({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
