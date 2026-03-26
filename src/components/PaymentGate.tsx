"use client";

import { useState, useCallback } from "react";
import {
  useTonConnectUI,
  useTonWallet,
  TonConnectButton,
} from "@tonconnect/ui-react";
import MinesweeperGame from "./MinesweeperGame";

const RECEIVER_ADDRESS = "UQBiNs7iRLdPJnS565NMkOh1_qyKDQRbz3sY_ByHaqXbaAyA";
const PAYMENT_AMOUNT = "1000000"; // 0.001 TON in nanoTON

export default function PaymentGate() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [hasPaid, setHasPaid] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handlePayment = useCallback(async () => {
    setIsPaying(true);
    setError(null);

    try {
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: RECEIVER_ADDRESS,
            amount: PAYMENT_AMOUNT,
          },
        ],
      });

      setTxHash(result.boc);
      setHasPaid(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      if (!message.includes("Interrupted") && !message.includes("rejected")) {
        setError(message);
      }
    } finally {
      setIsPaying(false);
    }
  }, [tonConnectUI]);

  const handleNewGame = useCallback(() => {
    setHasPaid(false);
    setTxHash(null);
  }, []);

  if (hasPaid) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center justify-between w-full max-w-sm px-2">
          <div className="text-xs text-green-400 truncate max-w-[200px]">
            ✅ Paid
          </div>
          <TonConnectButton />
        </div>
        <MinesweeperGame onNewGame={handleNewGame} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 max-w-sm mx-auto">
      <div className="text-center">
        <div className="text-6xl mb-4">💣</div>
        <h1 className="text-2xl font-bold text-white mb-2">Minesweeper</h1>
        <p className="text-gray-400 text-sm">
          Pay 0.001 TON to start a game
        </p>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 w-full text-center">
        <div className="mb-4">
          <TonConnectButton />
        </div>

        {wallet && (
          <>
            <div className="text-xs text-gray-500 mb-4 truncate">
              Connected: {wallet.account.address.slice(0, 8)}...
              {wallet.account.address.slice(-6)}
            </div>

            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors text-lg"
            >
              {isPaying ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Confirming...
                </span>
              ) : (
                "🎮 Pay 0.001 TON & Play"
              )}
            </button>
          </>
        )}

        {!wallet && (
          <p className="text-gray-500 text-sm">
            Connect your wallet to play
          </p>
        )}

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}
      </div>

      <div className="text-center text-gray-500 text-xs">
        <p>10×8 grid • 12 mines • Classic rules</p>
      </div>
    </div>
  );
}
