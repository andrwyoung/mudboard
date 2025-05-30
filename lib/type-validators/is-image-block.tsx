export function isBlockWithWidth(data: unknown): data is { og_width: number } {
  return (
    typeof data === "object" &&
    data !== null &&
    "og_width" in data &&
    typeof (data as { og_width: number }).og_width === "number"
  );
}
