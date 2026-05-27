export function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return url;
    }
  } catch (e) {
    // If it's a relative URL, it might not parse with new URL()
    // But we expect full URLs for social links
  }
  return undefined;
}
