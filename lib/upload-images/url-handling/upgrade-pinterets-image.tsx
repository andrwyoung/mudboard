// pinterest has different levels of image compression
// so we want to take the highest quality image from them

// TODO: fallback to 236x or 474x if 736x doesn't work

export function upgradePinterestImage(urlString: string): string {
  try {
    const url = new URL(urlString);

    if (url.hostname === "i.pinimg.com" && url.pathname.startsWith("/236x/")) {
      url.pathname = url.pathname.replace("/236x/", "/736x/");
      return url.toString();
    }
  } catch {
    // if URL parsing fails, just return original
  }

  return urlString;
}
