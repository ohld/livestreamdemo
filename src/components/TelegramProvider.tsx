"use client";

import { useEffect, useState, ReactNode } from "react";
import { init, miniAppReady, isTMA, setDebug } from "@telegram-apps/sdk-react";

export default function TelegramProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isTg, setIsTg] = useState(false);

  useEffect(() => {
    const isTelegramEnv = isTMA();

    if (isTelegramEnv) {
      try {
        setDebug(process.env.NODE_ENV === "development");
        init();
        miniAppReady();
        setIsTg(true);
      } catch (e) {
        console.warn("Telegram SDK init failed:", e);
      }
    }

    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin text-4xl">💣</div>
      </div>
    );
  }

  return (
    <div data-telegram={isTg ? "true" : "false"}>
      {children}
    </div>
  );
}
