"use client";

import { useEffect, useState } from "react";
import { Section } from "@/types/board-types";
import { supabase } from "@/utils/supabase";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import SectionGallery from "@/app/b/[boardId]/gallery";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import OverlayGallery from "@/app/b/[boardId]/overlay-gallery";
import { useSelectionStore } from "@/store/selection-store";
import { useOverlayStore } from "@/store/overlay-store";
import { useResetState } from "@/hooks/user-reset-state";
import { useLayoutStore } from "@/store/layout-store";
import { SCROLLBAR_STYLE } from "@/types/constants";

interface Props {
  sectionId: string;
}

export default function MudkitView({ sectionId }: Props) {
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const sectionColumns = useLayoutStore((s) => s.sectionColumns);
  const setSectionColumns = useLayoutStore((s) => s.setSectionColumns);
  const { overlayBlock } = useOverlayStore("main");

  const resetState = useResetState();

  useEffect(() => {
    resetState(); // nuke the stores

    const fetchSectionData = async () => {
      setLoading(true);
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .select("*")
        .eq("section_id", sectionId)
        .single();

      if (sectionError || !sectionData) {
        throw new Error("Error fetching sections " + sectionError?.message);
      }

      const section = sectionData as Section;
      section.visualColumnNum = section.saved_column_num;

      const blocksBySection = await fetchSupabaseBlocks([section.section_id]);

      const blocks = blocksBySection[section.section_id];

      setSection(sectionData);
      const generated = generateInitColumnsFromBlocks(
        blocks,
        section.saved_column_num
      );
      setSectionColumns({
        [section.section_id]: generated,
      });
      useLayoutStore.getState().setWindowWidth(window.innerWidth); // needed for regenerating order
      useLayoutStore
        .getState()
        .regenerateOrder([{ sectionId: section.section_id, order_index: 0 }]);

      console.log(
        "master block order: ",
        useLayoutStore.getState().masterBlockOrder
      );

      setLoading(false);
    };

    fetchSectionData();
  }, [sectionId, setSectionColumns, resetState]);

  if (loading) return null;

  return (
    <div className="flex flex-col sm:px-2 md:px-12  py-4 w-screen h-screen mx-auto relative">
      {section && (
        <>
          <div className="pt-2 pb-4 px-2 text-primary ">
            <h1 className="text-3xl font-bold">
              {section.title || "Untitled Kit"}
            </h1>
            {section.description && (
              <p className="text-muted-foreground mt-1">
                {section.description}
              </p>
            )}
          </div>

          {overlayBlock && (
            <div className="absolute inset-0 z-60">
              <OverlayGallery selectedBlock={overlayBlock} isMirror={false} />
            </div>
          )}

          {/* Reusable viewer component */}
          {sectionColumns && (
            <div className={`overflow-y-scroll h-full ${SCROLLBAR_STYLE}`}>
              <SectionGallery
                section={section}
                columns={sectionColumns[section.section_id]}
                draggedBlocks={null}
                scrollY={0}
                selectedBlocks={selectedBlocks}
                overId={null}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
