import type { PublicClient, TransactionReceipt, WalletClient } from "viem";
import type { ApiQuoteTx } from "./api-types";

export async function sendPreparedTransaction(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tx: ApiQuoteTx,
): Promise<TransactionReceipt> {
  const account = walletClient.account;
  if (!account) throw new Error("Wallet account is not available");

  const hash = await walletClient.sendTransaction({
    account,
    chain: walletClient.chain ?? undefined,
    to: tx.to as `0x${string}`,
    value: BigInt(tx.value || "0"),
    data: (tx.data ?? "0x") as `0x${string}`,
  });
  return publicClient.waitForTransactionReceipt({ hash });
}

export async function sendPreparedTransactions(
  walletClient: WalletClient,
  publicClient: PublicClient,
  txs: ApiQuoteTx[],
): Promise<void> {
  for (const tx of txs) {
    await sendPreparedTransaction(walletClient, publicClient, tx);
  }
}
