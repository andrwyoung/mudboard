"use client";

import { useEffect, useState } from "react";
import { Section } from "@/types/board-types";
import { supabase } from "@/utils/supabase";
import { Block } from "@/types/block-types";

interface Props {
  sectionId: string;
}

export default function MudkitView({ sectionId }: Props) {
  const [section, setSection] = useState<Section | null>(null);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectionData = async () => {
      setLoading(true);
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .select("*")
        .eq("section_id", sectionId)
        .single();

      const { data: blockData, error: blockError } = await supabase
        .from("blocks")
        .select("*")
        .eq("section_id", sectionId);

      if (!sectionError && sectionData && !blockError && blockData) {
        setSection(sectionData);
        setBlocks(blockData);
      }

      setLoading(false);
    };

    fetchSectionData();
  }, [sectionId]);

  if (loading) return null;

  if (!section || !blocks) return <div>Could not load mudkit.</div>;

  return (
    <div className="flex flex-col gap-6 px-6 py-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">
          {section.title || "Untitled Kit"}
        </h1>
        {section.description && (
          <p className="text-muted-foreground mt-1">{section.description}</p>
        )}
      </div>

      {/* Reusable viewer component */}
    </div>
  );
}
