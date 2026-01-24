// this is the overlay thing that happens when you double click an image
// or if you right-click -> Expand an image

import { Block, MudboardImage } from "@/types/block-types";
import React, { useEffect, useState } from "react";
import { useOverlayStore } from "@/store/overlay-store";
import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";
import { getImageUrl } from "@/utils/get-image-url";
import { updateGreyscaleSupabase } from "@/lib/db-actions/block-editing/update-greyscale";
import { updateFlippedSupabase } from "@/lib/db-actions/block-editing/update-flip";
import { canEditSection } from "@/lib/auth/can-edit-section";
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";
import ImageOverlayViewer from "@/components/ui/overlay/image-overlay-viewer";

export default function OverlayGallery({
  isMirror,
  selectedBlock,
}: {
  isMirror: boolean;
  selectedBlock: Block;
}) {
  const { closeOverlay: closeOverlayGallery } = useOverlayStore(
    isMirror ? "mirror" : "main"
  );

  // note we never need visual overrides for mirror
  const visualOverridesMap = useLayoutStore((s) => s.visualOverridesMap);
  const setVisualOverride = useLayoutStore((s) => s.setVisualOverride);

  const imageBlock = selectedBlock.data as MudboardImage;

  // Visual state
  const [isGreyscale, setIsGreyscale] = useState(
    visualOverridesMap.get(selectedBlock.block_id)?.is_greyscale ?? false
  );
  const [isFlipped, setIsFlipped] = useState(
    visualOverridesMap.get(selectedBlock.block_id)?.is_flipped ?? false
  );

  // Debug state
  const showDebug = false;
  const [blockOrder, setBlockOrder] = useState<number | undefined>(undefined);
  const [sectionOrder, setSectionOrder] = useState<number | undefined>(
    undefined
  );
  const getBlockPositionMain = useLayoutStore((s) => s.getBlockPosition);
  const getBlockPositionMirror = useSecondaryLayoutStore(
    (s) => s.getBlockPosition
  );
  const getBlockPosition = isMirror
    ? getBlockPositionMirror
    : getBlockPositionMain;

  const boardSections = useMetadataStore((s) => s.boardSections);
  const section = boardSections.find(
    (s) => s.section.section_id === selectedBlock.section_id
  )?.section;
  const canSectionEdit = section ? canEditSection(section) : false;

  // debug info
  useEffect(() => {
    const blockPos = getBlockPosition(selectedBlock.block_id);
    setBlockOrder(blockPos?.orderIndex);

    const section = boardSections.find(
      (s) => s.section.section_id === blockPos?.sectionId
    );
    setSectionOrder(section?.order_index);
  }, [selectedBlock, getBlockPosition, boardSections]);

  // Handlers for the dumb component
  const handleGreyscaleToggle = (newValue: boolean) => {
    setIsGreyscale(newValue);
    if (!isMirror) {
      updateGreyscaleSupabase(selectedBlock.block_id, newValue, canSectionEdit);
      setVisualOverride(selectedBlock.block_id, { is_greyscale: newValue });
    }
  };

  const handleFlippedToggle = (newValue: boolean) => {
    setIsFlipped(newValue);
    if (!isMirror) {
      updateFlippedSupabase(selectedBlock.block_id, newValue, canSectionEdit);
      setVisualOverride(selectedBlock.block_id, { is_flipped: newValue });
    }
  };

  return (
    <ImageOverlayViewer
      selectedBlock={selectedBlock}
      imageSrc={getImageUrl(imageBlock.image_id, imageBlock.file_ext, "full")}
      imageAlt={selectedBlock.caption ?? imageBlock.original_name}
      isGreyscale={isGreyscale}
      isFlipped={isFlipped}
      onClose={closeOverlayGallery}
      onGreyscaleToggle={handleGreyscaleToggle}
      onFlippedToggle={handleFlippedToggle}
      debugInfo={{
        showDebug,
        blockOrder,
        sectionOrder,
      }}
    />
  );
}
