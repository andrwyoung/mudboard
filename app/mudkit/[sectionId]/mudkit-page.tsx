"use client";

import { useEffect, useState } from "react";
import { BoardSection, Section } from "@/types/board-types";
import { supabase } from "@/lib/supabase/supabase-client";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import SectionGallery from "@/app/b/[boardId]/gallery";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import OverlayGallery from "@/app/b/[boardId]/overlay-gallery";
import { useOverlayStore } from "@/store/overlay-store";
import { useResetState } from "@/hooks/use-reset-state";
import {
  MOBILE_BREAKPOINT,
  MOBILE_COLUMN_NUMBER,
  SCROLLBAR_STYLE,
} from "@/types/constants";
import { useMobileColumnResizeEffect } from "@/hooks/gallery/use-resize-listener";
import { useMetadataStore } from "@/store/metadata-store";
import { useGlobalListeners } from "@/hooks/gallery/use-global-listeners";
import { useMeasureStore, useUIStore } from "@/store/ui-store";
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";
import { toast } from "sonner";

interface Props {
  sectionId: string;
}

export default function MudkitPage({ sectionId }: Props) {
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const setBoardSections = useMetadataStore((s) => s.setBoardSections);

  const sectionColumns = useSecondaryLayoutStore((s) => s.columns);
  const setSectionColumns = useSecondaryLayoutStore((s) => s.setColumns);
  const { overlayBlock } = useOverlayStore("main");

  const resetState = useResetState();
  useEffect(() => {
    resetState();

    toast.success("hey");

    const fetchSectionData = async () => {
      setLoading(true);
      toast.success("hey");
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

      // fake a board section
      const boardSection: BoardSection = {
        section,
        board_section_id: "",
        board_id: "",
        order_index: 0,
        deleted: false,
      };
      setBoardSections([boardSection]);

      const blocksBySection = await fetchSupabaseBlocks([section.section_id]);

      const blocks = blocksBySection[section.section_id];

      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (isMobile) {
        useUIStore.getState().setMobileColumns(true);
      }

      setSection(sectionData);
      const generated = generateInitColumnsFromBlocks(
        blocks,
        isMobile ? MOBILE_COLUMN_NUMBER : section.saved_column_num
      );
      setSectionColumns(generated);
      useMeasureStore.getState().setWindowWidth(window.innerWidth); // needed for regenerating order
      useSecondaryLayoutStore.getState().regenerateOrder();

      console.log(
        "master block order: ",
        useSecondaryLayoutStore.getState().masterBlockOrder
      );

      setLoading(false);
    };

    fetchSectionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, setSectionColumns, setBoardSections]);

  useMobileColumnResizeEffect(section?.section_id ? [section.section_id] : []);
  useGlobalListeners();

  return (
    <div className="flex flex-col sm:px-2 md:px-12 py-4 w-screen h-screen mx-auto relative">
      {!loading && section && (
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
                canEdit={false} // purely view only on this page
                section={section}
                columns={sectionColumns}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
