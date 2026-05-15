const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3335";
const DEFAULT_NETWORK = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || "hashkeytest";

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
