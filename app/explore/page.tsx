// app/explore/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Section } from "@/types/board-types";

export default function ExplorePage() {
  const [mudkits, setMudkits] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMudkits = async () => {
      const { data } = await supabase
        .from("sections")
        .select("*")
        .eq("is_public", true)
        .eq("is_on_marketplace", true)
        .order("first_published_at", { ascending: false });

      console.log("data: ", data);
      if (data) setMudkits(data as Section[]);
      setLoading(false);
    };

    fetchMudkits();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Explore Mudkits</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mudkits.map((kit) => (
          <Link
            href={`/mudkit/${kit.section_id}`}
            key={kit.section_id}
            className="border rounded-xl overflow-hidden hover:shadow-md transition"
          >
            <div className="bg-muted aspect-[4/3]" />
            <div className="p-3">
              <h2 className="text-lg font-semibold line-clamp-1">
                {kit.title || "Untitled Kit"}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {kit.description || "No description"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
