const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

interface PinataFileResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface PinataJsonResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

function ipfsUriFromHash(hash: string): string {
  return `ipfs://${hash}`;
}

function gatewayUrl(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

export function resolveIpfsUrl(ipfsUri: string | null | undefined): string | null {
  if (!ipfsUri) return null;
  const match = ipfsUri.match(/^ipfs:\/\/(.+)$/);
  if (match) {
    return gatewayUrl(match[1]);
  }
  return ipfsUri;
}

export async function uploadImageToIPFS(file: File): Promise<{ ipfsUri: string; gatewayUrl: string }> {
  if (!PINATA_JWT) {
    throw new Error("NEXT_PUBLIC_PINATA_JWT is not configured");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(PINATA_FILE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinata upload failed: ${res.status} ${text}`);
  }

  const data: PinataFileResponse = await res.json();
  return {
    ipfsUri: ipfsUriFromHash(data.IpfsHash),
    gatewayUrl: gatewayUrl(data.IpfsHash),
  };
}

export async function uploadMetadataToIPFS(
  metadata: Record<string, unknown>
): Promise<{ ipfsUri: string; gatewayUrl: string }> {
  if (!PINATA_JWT) {
    throw new Error("NEXT_PUBLIC_PINATA_JWT is not configured");
  }

  const res = await fetch(PINATA_JSON_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinata upload failed: ${res.status} ${text}`);
  }

  const data: PinataJsonResponse = await res.json();
  return {
    ipfsUri: ipfsUriFromHash(data.IpfsHash),
    gatewayUrl: gatewayUrl(data.IpfsHash),
  };
}

export function isPinataConfigured(): boolean {
  return !!PINATA_JWT;
}
