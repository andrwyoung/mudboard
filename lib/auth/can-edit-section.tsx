import { useMetadataStore } from "@/store/metadata-store";
import { Section } from "@/types/board-types";
import { usePathname } from "next/navigation";

export function useCanEditSection(section: Section): boolean {
  const user = useMetadataStore((s) => s.user);
  const pathname = usePathname();
  const isBoardRoute = pathname.startsWith("/b/");
  return section?.owned_by === user?.id && isBoardRoute;
}
