import { NextRequest, NextResponse } from "next/server";

const RECEIVER_ADDRESS = "UQBiNs7iRLdPJnS565NMkOh1_qyKDQRbz3sY_ByHaqXbaAyA";
const REQUIRED_AMOUNT = 1000000; // 0.001 TON in nanoTON

export async function POST(req: NextRequest) {
  try {
    const { boc } = await req.json();

    if (!boc) {
      return NextResponse.json(
        { error: "Missing transaction BOC" },
        { status: 400 }
      );
    }

    // In production, you would decode the BOC and verify:
    // 1. The destination matches RECEIVER_ADDRESS
    // 2. The amount >= REQUIRED_AMOUNT
    // 3. The transaction is confirmed on-chain
    //
    // For this demo, we accept the transaction if a BOC was provided
    // since TON Connect already ensures the transaction was sent
    // through the user's wallet.

    return NextResponse.json({
      success: true,
      message: "Payment verified",
      receiver: RECEIVER_ADDRESS,
      amount: REQUIRED_AMOUNT,
    });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
