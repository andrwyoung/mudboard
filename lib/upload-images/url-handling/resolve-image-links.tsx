export function resolveProxiedImageUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    // DuckDuckGo
    if (
      url.hostname.includes("duckduckgo.com") &&
      url.pathname.includes("/iu/")
    ) {
      const u = url.searchParams.get("u");
      return u ? decodeURIComponent(u) : null;
    }

    // Google Images
    if (url.hostname.includes("google.") && url.pathname.includes("/imgres")) {
      const imgurl = url.searchParams.get("imgurl");
      return imgurl ? decodeURIComponent(imgurl) : null;
    }

    // Bing Images (potential)
    // e.g. https://www.bing.com/images/search?view=detailV2&imgurl=https://cdn.example.com/image.jpg
    if (url.hostname.includes("bing.com")) {
      const imgurl = url.searchParams.get("imgurl");
      return imgurl ? decodeURIComponent(imgurl) : null;
    }

    // fallback
    return rawUrl;
  } catch {
    return null;
  }
}
