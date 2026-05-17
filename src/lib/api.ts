/**
 * Base URL for the Bun/Ponder product API.
 * - Leave empty (default): browser calls same origin (e.g. :5000) and Next.js rewrites proxy to the backend → no CORS in dev.
 * - Set to full URL when the API is on another host (e.g. production).
 *
 */
const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_URL =
  rawBase === undefined || rawBase === "" ? "" : rawBase.replace(/\/$/, "");
const DEFAULT_NETWORK = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || "sepolia";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getDefaultNetwork() {
  return DEFAULT_NETWORK;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new ApiError(
      `API error ${res.status}: ${res.statusText}`,
      res.status,
      errorData
    );
  }

  if (res.headers.get("content-type")?.includes("text/html")) {
    return res.text() as unknown as T;
  }

  return res.json();
}

export { request, ApiError };
