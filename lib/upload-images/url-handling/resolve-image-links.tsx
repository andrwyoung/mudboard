// when an image is from a search engine, there is a url for the image
// but it's hidden in the url. so this helps dig that "real url" out for us

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
    if (url.hostname.includes("bing.com") && url.searchParams.has("mediaurl")) {
      const mediaUrl = url.searchParams.get("mediaurl");
      return mediaUrl ? decodeURIComponent(mediaUrl) : null;
    }

    // fallback
    return rawUrl;
  } catch {
    return null;
  }
}
