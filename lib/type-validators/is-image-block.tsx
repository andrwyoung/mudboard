export function isBlockWithWidth(data: unknown): data is { width: number } {
  return (
    typeof data === "object" &&
    data !== null &&
    "width" in data &&
    typeof (data as { width: number }).width === "number"
  );
}
