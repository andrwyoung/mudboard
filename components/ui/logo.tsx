"use client";
import Link from "next/link";
import Image from "next/image";
import { useMetadataStore } from "@/store/metadata-store";
import { DASHBOARD_LINK } from "@/types/constants";

export default function Logo({
  color = "white",
}: {
  color?: "white" | "brown";
}) {
  const user = useMetadataStore((s) => s.user);

  return (
    <Link
      className="cursor-pointer hover:scale-105 transition-transform duration-300"
      href={user ? DASHBOARD_LINK : "/"}
      title="Home Page"
    >
      <Image
        src={color === "white" ? "/full-logo-white.png" : "/full-logo.png"}
        alt="mudboard logo"
        height={387}
        width={1267}
        className="w-[150px]"
      />
    </Link>
  );
}
