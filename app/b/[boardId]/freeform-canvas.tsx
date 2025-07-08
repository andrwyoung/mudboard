"use client";

import { useCameraStore } from "@/store/freeform-store";
import { useRef, useState } from "react";
import { Block } from "@/types/block-types";

export function BlockRenderer({ block }: { block: Block }) {
  const { camera } = useCameraStore();

  const screenX = block.canvas_x ?? 0 * camera.scale + camera.x;
  const screenY = block.canvas_y ?? 0 * camera.scale + camera.y;
  const screenScale = block.canvas_scale ?? 1 * camera.scale;

  return (
    <div
      style={{
        position: "absolute",
        left: screenX,
        top: screenY,
        transform: `scale(${screenScale})`,
        transformOrigin: "top left",
        width: block.width, // or block.width if you have one
        height: block.height, // or block.height
      }}
      className="absolute bg-primary border-4 border-secondary rounded-lg"
    >
      Block #{block.block_id}
    </div>
  );
}

export default function FreeformCanvas({ blocks }: { blocks: Block[] }) {
  const { setCamera } = useCameraStore();
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  function onMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };

    const currentCamera = useCameraStore.getState().camera;
    setCamera({
      ...currentCamera,
      x: currentCamera.x + dx,
      y: currentCamera.y + dy,
    });
  }

  function onMouseUp() {
    setIsDragging(false);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const zoomFactor = 1.1;
    const delta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;

    const currentCamera = useCameraStore.getState().camera;
    setCamera({
      ...currentCamera,
      scale: Math.max(0.1, Math.min(4, currentCamera.scale * delta)),
    });
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      className={`bg-background w-full h-full relative ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <BlockRenderer key={blocks[0].block_id} block={blocks[0]} />
    </div>
  );
}
