"use client";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import Image from "next/image";
import { useMetadataStore } from "@/store/metadata-store";
import { DASHBOARD_LINK } from "@/types/constants";

export default function NotFound() {
  const user = useMetadataStore((s) => s.user);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Image src="/2.png" alt="Board not found" width={375} height={150} />
      <h1 className="text-3xl font-bold mb-2 text-primary">Board not found</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        The board you&apos;re looking for doesn&apos;t exist or has been
        deleted.
      </p>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        <strong>June 12, 11:36AM PST:</strong> We&apos;re currently experiencing
        issues loading this board due to an ongoing outage with our database
        provider (
        <a
          href="https://status.supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Supabase Status
        </a>
        ). We&apos;re monitoring the situation closely. No boards have been
        deleted.
      </p>
      <Link
        href={user ? DASHBOARD_LINK : "/"}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-lighter 
        hover:scale-105 transition-all duration-200
        flex flex-row gap-1 items-center"
      >
        <FaChevronLeft /> {user ? "Back to Dashboard" : "Back to Landing Page"}
      </Link>
    </div>
  );
}
