import type { PublicClient, WalletClient } from "viem";
import type { ApiQuoteTx } from "./api-types";

export async function sendPreparedTransactions(
  walletClient: WalletClient,
  publicClient: PublicClient,
  txs: ApiQuoteTx[]
): Promise<void> {
  const account = walletClient.account;
  if (!account) throw new Error("Wallet account is not available");

  for (const tx of txs) {
    const hash = await walletClient.sendTransaction({
      account,
      chain: walletClient.chain ?? undefined,
      to: tx.to as `0x${string}`,
      value: BigInt(tx.value || "0"),
      data: (tx.data ?? "0x") as `0x${string}`,
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }
}
