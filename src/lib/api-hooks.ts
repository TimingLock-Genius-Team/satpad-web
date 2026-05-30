import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHealth,
  fetchNetworks,
  fetchConfig,
  fetchStats,
  fetchTokens,
  fetchTokenDetail,
  fetchTokenSummary,
  fetchTokenChart,
  fetchTokenTrades,
  fetchTokenHolders,
  fetchQuote,
  fetchPortfolio,
  fetchPortfolioHistory,
  fetchPortfolioTaxEvents,
  fetchPortfolioTaxLots,
  fetchPortfolioTaxSummary,
  fetchCreateValidate,
  fetchCreateBuild,
  fetchMetadataUpload,
  fetchMetadata,
} from "./api-service";
import type {
  ApiCreateValidateRequest,
  ApiCreateBuildRequest,
  ApiMetadataUploadBody,
  ApiTokenTab,
} from "./api-types";

// Health
export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: fetchHealth });
}

// Networks
export function useNetworks() {
  return useQuery({ queryKey: ["networks"], queryFn: fetchNetworks });
}

// Config
export function useConfig(network?: string) {
  return useQuery({ queryKey: ["config", network], queryFn: () => fetchConfig(network) });
}

// Stats
export function useStats(network?: string) {
  return useQuery({
    queryKey: ["stats", network],
    queryFn: () => fetchStats(network),
    refetchInterval: 30_000,
  });
}

// Tokens list
export function useTokens(params: {
  network?: string;
  tab?: ApiTokenTab;
  limit?: number;
  cursor?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: ["tokens", params],
    queryFn: () => fetchTokens(params),
  });
}

// Token detail
export function useTokenDetail(address: string, network?: string) {
  return useQuery({
    queryKey: ["token-detail", address, network],
    queryFn: () => fetchTokenDetail(address, network),
    enabled: !!address,
    refetchInterval: 15_000,
  });
}

// Token summary
export function useTokenSummary(address: string, network?: string) {
  return useQuery({
    queryKey: ["token-summary", address, network],
    queryFn: () => fetchTokenSummary(address, network),
    enabled: !!address,
    refetchInterval: 15_000,
  });
}

// Token chart
export function useTokenChart(
  address: string,
  params: { network?: string; range?: string; interval?: string }
) {
  return useQuery({
    queryKey: ["token-chart", address, params],
    queryFn: () => fetchTokenChart(address, params),
    enabled: !!address,
    refetchInterval: 60_000,
  });
}

// Token trades
export function useTokenTrades(
  address: string,
  params: { network?: string; limit?: number; cursor?: string }
) {
  return useQuery({
    queryKey: ["token-trades", address, params],
    queryFn: () => fetchTokenTrades(address, params),
    enabled: !!address,
    refetchInterval: 15_000,
  });
}

// Token holders
export function useTokenHolders(
  address: string,
  params: { network?: string; limit?: number; cursor?: string }
) {
  return useQuery({
    queryKey: ["token-holders", address, params],
    queryFn: () => fetchTokenHolders(address, params),
    enabled: !!address,
    refetchInterval: 15_000,
  });
}

// Quote
export function useQuote(
  address: string,
  params: {
    network?: string;
    side: "mint" | "burn";
    amount: string;
    slippageBps?: number;
    includeTx?: boolean;
    recipient?: string;
  },
  enabled?: boolean
) {
  return useQuery({
    queryKey: ["quote", address, params],
    queryFn: () => fetchQuote(address, params),
    enabled:
      enabled ??
      (Boolean(params.amount) &&
        params.amount !== "0" &&
        (!params.includeTx || Boolean(params.recipient))),
  });
}

// Portfolio
export function usePortfolio(wallet?: string, network?: string) {
  return useQuery({
    queryKey: ["portfolio", wallet, network],
    queryFn: () => fetchPortfolio(wallet!, network),
    enabled: !!wallet,
  });
}

// Portfolio history
export function usePortfolioHistory(
  wallet?: string,
  params?: { network?: string; limit?: number; cursor?: string }
) {
  return useQuery({
    queryKey: ["portfolio-history", wallet, params],
    queryFn: () => fetchPortfolioHistory(wallet!, params || {}),
    enabled: !!wallet,
  });
}

export function usePortfolioTaxLots(
  wallet?: string,
  params?: { network?: string; token?: string; limit?: number; cursor?: string }
) {
  return useQuery({
    queryKey: ["portfolio-tax-lots", wallet, params],
    queryFn: () => fetchPortfolioTaxLots(wallet!, params || {}),
    enabled: !!wallet,
  });
}

export function usePortfolioTaxEvents(
  wallet?: string,
  params?: { network?: string; token?: string; limit?: number; cursor?: string }
) {
  return useQuery({
    queryKey: ["portfolio-tax-events", wallet, params],
    queryFn: () => fetchPortfolioTaxEvents(wallet!, params || {}),
    enabled: !!wallet,
  });
}

export function usePortfolioTaxSummary(
  wallet?: string,
  params?: { network?: string; token?: string }
) {
  return useQuery({
    queryKey: ["portfolio-tax-summary", wallet, params],
    queryFn: () => fetchPortfolioTaxSummary(wallet!, params || {}),
    enabled: !!wallet,
  });
}

// OKB Price
export function useOkbPrice() {
  return useQuery({
    queryKey: ["okbPrice"],
    queryFn: async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=okb&vs_currencies=usd");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        return data.okb.usd as number;
      } catch (e) {
        console.error("Failed to fetch OKB price from CoinGecko, trying OKX API...", e);
        try {
          const res = await fetch("https://www.okx.com/api/v5/market/ticker?instId=OKB-USDT");
          if (!res.ok) throw new Error("Network response was not ok");
          const json = await res.json();
          const price = Number(json.data[0].last);
          return isNaN(price) ? 0 : price;
        } catch (err) {
          console.error("Failed to fetch OKB price", err);
          return 0;
        }
      }
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// Mutations
export function useCreateValidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiCreateValidateRequest) => fetchCreateValidate(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tokens"] }),
  });
}

export function useCreateBuild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiCreateBuildRequest) => fetchCreateBuild(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tokens"] }),
  });
}

export function useMetadataUpload() {
  return useMutation({
    mutationFn: (body: ApiMetadataUploadBody) => fetchMetadataUpload(body),
  });
}

export function useMetadata(id: string) {
  return useQuery({
    queryKey: ["metadata", id],
    queryFn: () => fetchMetadata(id),
    enabled: !!id,
  });
}
