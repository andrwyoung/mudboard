"use client";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import Image from "next/image";
import { useMetadataStore } from "@/store/metadata-store";
import { DASHBOARD_LINK } from "@/types/constants";
import {
  GlobalAnnouncement,
  SHOW_GLOBAL_ANNOUNCEMENT,
} from "@/types/constants/error-message";
import { SupportEmailAddress } from "@/utils/support-email";

export default function NotFoundComponent({
  pageTitle = "Page",
}: {
  pageTitle?: "Board" | "Page" | "Section";
}) {
  const user = useMetadataStore((s) => s.user);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Image
        src="/2.png"
        alt={`${pageTitle} not found`}
        width={375}
        height={150}
      />
      <h1 className="text-3xl font-bold mb-2 text-primary">
        {pageTitle} not found
      </h1>
      <div className="text-muted-foreground mb-8 text-sm max-w-md">
        <p className="mb-1">
          The {pageTitle.charAt(0).toLowerCase() + pageTitle.slice(1)}{" "}
          you&apos;re looking for doesn&apos;t exist or has been unpublished.
        </p>
        {pageTitle !== "Page" && (
          <p>
            Mistake? Please reach out: <SupportEmailAddress />
          </p>
        )}
        {SHOW_GLOBAL_ANNOUNCEMENT && (
          <div className="text-sm text-muted-foreground my-4">
            {GlobalAnnouncement}
          </div>
        )}
      </div>

      <Link
        href={user ? DASHBOARD_LINK : "/"}
        className="bg-primary text-bg-primary-foreground px-4 py-2 rounded-md hover:bg-primary-lighter 
        hover:scale-105 transition-all duration-200
        flex flex-row gap-1 items-center"
      >
        <FaChevronLeft /> {user ? "Back to Dashboard" : "Back to Landing Page"}
      </Link>
    </div>
  );
}
