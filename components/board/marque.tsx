export function MarqueBox({
  marqueRect,
}: {
  marqueRect: { x: number; y: number; width: number; height: number };
}) {
  return (
    <div
      className="fixed border-2 border-dashed border-accent bg-accent/20 z-50 
rounded-lg pointer-events-none select-none"
      style={{
        left: marqueRect.x,
        top: marqueRect.y,
        width: marqueRect.width,
        height: marqueRect.height,
      }}
    />
  );
}
