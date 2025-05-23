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

  const proxyUrl = `${
    window.location.origin
  }/api/image-proxy?url=${encodeURIComponent(url)}`;

  // Fallback to backend proxy
  try {
    const res = await fetch(proxyUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
        Referer: "https://www.google.com",
      },
      redirect: "follow",
    });

    const contentType = res.headers.get("Content-Type");

    if (!res.ok) {
      console.error("[proxy] Non-OK response:", res.status, res.statusText);
      throw new Error("Proxy returned non-OK status");
    }

    if (!contentType?.startsWith("image/")) {
      console.error("[proxy] Invalid content type:", contentType);
      throw new Error("Content-Type is not an image");
    }

    return await res.blob();
  } catch (err) {
    console.error("Both direct and proxy fetch failed:", err);
    return null;
  }
}
