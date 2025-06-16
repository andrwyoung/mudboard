// we need these helpers to calculate how wide each column is
// so that we have an accurate height for virtualization

import { useUIStore } from "@/store/ui-store";

let cachedScrollbarWidth: number | null = null;

export function getScrollbarWidth(): number {
  if (cachedScrollbarWidth !== null) return cachedScrollbarWidth;

  const div = document.createElement("div");
  div.style.visibility = "hidden";
  div.style.overflow = "scroll";
  div.style.width = "100px";
  div.style.position = "absolute";
  div.style.top = "-9999px";

  document.body.appendChild(div);
  cachedScrollbarWidth = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);

  return cachedScrollbarWidth;
}

export function getColumnWidth(
  sidebarWidth: number,
  windowWidth: number,
  spacingSize: number,
  numCols: number
) {
  // the math:
  // total_width - sidebar_width - (scrollbar + numcol * padding + gallery_padding * 2) * 2 if mirror
  // = amount of space left for columns / numcol = columnWidth

  const scrollbarWidth = getScrollbarWidth();
  //   const scrollbarWidth = 0;
  const gutterPadding = spacingSize * numCols;
  const galleryPadding = useUIStore.getState().gallerySpacingSize * 2;

  const mirrorMode = useUIStore.getState().mirrorMode;
  const mirrorMult = mirrorMode ? 2 : 1;

  // ok.
  const availableSpace =
    windowWidth -
    sidebarWidth -
    (scrollbarWidth + gutterPadding + galleryPadding) * mirrorMult;

  const columnWidth = availableSpace / numCols / mirrorMult;

  console.log(
    "column width: ",
    columnWidth,
    "scrollbar width: ",
    scrollbarWidth
  );

  return columnWidth;
}
