const corsBlockedDomains = [
  "pinimg.com",
  "pinterest.com",
  "instagram.com",
  "fbcdn.net",
  "tumblr.com",
];
function isCorsBlockedDomain(url: string) {
  return corsBlockedDomains.some((domain) => url.includes(domain));
}

async function tryFetchImageDirectly(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("Non-OK response");
    return await res.blob();
  } catch (err) {
    console.warn("Direct fetch failed, trying proxy:", err);
    return null;
  }
}

export async function getImageBlobSmart(url: string): Promise<Blob | null> {
  if (!isCorsBlockedDomain(url)) {
    const direct = await tryFetchImageDirectly(url);
    if (direct) return direct;
  }

  // Fallback to backend proxy
  try {
    const proxyUrl = `${
      window.location.origin
    }/api/image-proxy?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("Proxy failed");
    return await res.blob();
  } catch (err) {
    console.error("Both direct and proxy failed:", err);
    return null;
  }
}
