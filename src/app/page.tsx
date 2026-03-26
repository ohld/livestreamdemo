"use client";

import dynamic from "next/dynamic";

const TelegramProvider = dynamic(() => import("@/components/TelegramProvider"), {
  ssr: false,
});

const TonProvider = dynamic(() => import("@/components/TonProvider"), {
  ssr: false,
});

const PaymentGate = dynamic(() => import("@/components/PaymentGate"), {
  ssr: false,
});

export default function Home() {
  return (
    <TelegramProvider>
      <TonProvider>
        <main className="flex flex-col items-center justify-center min-h-screen py-6">
          <PaymentGate />
        </main>
      </TonProvider>
    </TelegramProvider>
  );
}
