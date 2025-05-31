// when a user drags in an image from another website
// first try using frontend to grab it (usually fails)
// if not then we go through our proxy

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

  const proxyUrl = `https://image-proxy-holy-cloud-3487.fly.dev/proxy?url=${encodeURIComponent(
    url
  )}`;

  try {
    const res = await fetch(proxyUrl);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "No error body");
      console.error(
        `[Image Proxy Error] ${res.status} ${res.statusText}:`,
        errorText
      );

      throw new Error(`Proxy failed with ${res.status}: ${res.statusText}`);
    }

    return await res.blob();
  } catch (err) {
    console.error("[Image Fetch] Request failed:", err);
    return null;
  }
}

// DEPRECATED
export async function localProxy(url: string) {
  const proxyUrl = `${
    window.location.origin
  }/api/image-proxy?url=${encodeURIComponent(url)}`;
  const origin = new URL(url).origin;

  const userAgents = [
    // Desktop Browsers
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",

    // Mobile Browsers
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  ];

  // Fallback to backend proxy
  try {
    const res = await fetch(proxyUrl, {
      headers: {
        "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
        Referer: origin,
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
