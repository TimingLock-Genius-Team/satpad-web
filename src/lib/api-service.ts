import { request, getDefaultNetwork } from "./api";
import type {
  ApiNetwork,
  ApiConfig,
  ApiStats,
  ApiTokenListItem,
  ApiTokenDetail,
  ApiTokenSummary,
  ApiChartPoint,
  ApiTrade,
  ApiHolder,
  ApiQuoteResponse,
  ApiPortfolioResponse,
  ApiPortfolioHistoryItem,
  ApiCreateValidateRequest,
  ApiCreateValidateResponse,
  ApiCreateBuildRequest,
  ApiCreateBuildResponse,
  ApiMetadataUploadRequest,
  ApiMetadataUploadResponse,
  ApiMetadataResponse,
  ApiHealthResponse,
  ApiPaginatedResponse,
} from "./api-types";

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// Health
export function fetchHealth() {
  return request<ApiHealthResponse>("/health");
}

// Networks
export function fetchNetworks() {
  return request<ApiNetwork[]>("/api/networks");
}

// Config
export function fetchConfig(network?: string) {
  return request<ApiConfig>(
    `/api/config${qs({ network: network || getDefaultNetwork() })}`
  );
}

// Stats
export function fetchStats(network?: string) {
  return request<ApiStats>(
    `/api/stats${qs({ network: network || getDefaultNetwork() })}`
  );
}

// Tokens list
export function fetchTokens(params: {
  network?: string;
  tab?: "trending" | "new" | "all";
  limit?: number;
  cursor?: string;
  q?: string;
}) {
  return request<ApiPaginatedResponse<ApiTokenListItem>>(
    `/api/tokens${qs({ network: params.network || getDefaultNetwork(), tab: params.tab, limit: params.limit, cursor: params.cursor, q: params.q })}`
  );
}

// Token detail
export function fetchTokenDetail(address: string, network?: string) {
  return request<ApiTokenDetail>(
    `/api/tokens/${address}${qs({ network: network || getDefaultNetwork() })}`
  );
}

// Token summary
export function fetchTokenSummary(address: string, network?: string) {
  return request<ApiTokenSummary>(
    `/api/tokens/${address}/summary${qs({ network: network || getDefaultNetwork() })}`
  );
}

// Token chart
export function fetchTokenChart(
  address: string,
  params: { network?: string; range?: string; interval?: string }
) {
  return request<ApiChartPoint>(
    `/api/tokens/${address}/chart${qs({ network: params.network || getDefaultNetwork(), range: params.range, interval: params.interval })}`
  );
}

// Token trades
export function fetchTokenTrades(
  address: string,
  params: { network?: string; limit?: number; cursor?: string }
) {
  return request<ApiPaginatedResponse<ApiTrade>>(
    `/api/tokens/${address}/trades${qs({ network: params.network || getDefaultNetwork(), limit: params.limit, cursor: params.cursor })}`
  );
}

// Token holders
export function fetchTokenHolders(
  address: string,
  params: { network?: string; limit?: number; cursor?: string }
) {
  return request<ApiPaginatedResponse<ApiHolder>>(
    `/api/tokens/${address}/holders${qs({ network: params.network || getDefaultNetwork(), limit: params.limit, cursor: params.cursor })}`
  );
}

// Quote (mint/burn)
export function fetchQuote(
  address: string,
  params: {
    network?: string;
    side: "mint" | "burn";
    amount: string;
    slippageBps?: number;
    includeTx?: boolean;
  }
) {
  return request<ApiQuoteResponse>(
    `/api/tokens/${address}/quote${qs({
      network: params.network || getDefaultNetwork(),
      side: params.side,
      amount: params.amount,
      slippageBps: params.slippageBps ?? 100,
      includeTx: params.includeTx ? 1 : 0,
    })}`
  );
}

// Portfolio
export function fetchPortfolio(wallet: string, network?: string) {
  return request<ApiPortfolioResponse>(
    `/api/portfolio/${wallet}${qs({ network: network || getDefaultNetwork() })}`
  );
}

// Portfolio history
export function fetchPortfolioHistory(
  wallet: string,
  params: { network?: string; limit?: number; cursor?: string }
) {
  return request<ApiPaginatedResponse<ApiPortfolioHistoryItem>>(
    `/api/portfolio/${wallet}/history${qs({ network: params.network || getDefaultNetwork(), limit: params.limit, cursor: params.cursor })}`
  );
}

// Create validate
export function fetchCreateValidate(body: ApiCreateValidateRequest) {
  return request<ApiCreateValidateResponse>("/api/create/validate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Create build
export function fetchCreateBuild(body: ApiCreateBuildRequest) {
  return request<ApiCreateBuildResponse>("/api/create/build", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Metadata upload
export function fetchMetadataUpload(body: ApiMetadataUploadRequest) {
  return request<ApiMetadataUploadResponse>("/api/metadata", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Metadata get
export function fetchMetadata(id: string) {
  return request<ApiMetadataResponse>(`/api/metadata/${id}`);
}
