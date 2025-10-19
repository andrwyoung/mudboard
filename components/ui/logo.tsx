"use client";
import Link from "next/link";
import Image from "next/image";
import { useMetadataStore } from "@/store/metadata-store";
import { DASHBOARD_LINK } from "@/types/constants";

export default function Logo({
  color = "white",
  enforceHome = false,
}: {
  color?: "white" | "brown";
  enforceHome?: boolean;
}) {
  const user = useMetadataStore((s) => s.user);

  return (
    <Link
      className="cursor-pointer hover:scale-105 transition-transform duration-300"
      href={user && !enforceHome ? DASHBOARD_LINK : "/"}
      title="Home Page"
    >
      <Image
        src={color === "white" ? "/full-logo-white.png" : "/full-logo.png"}
        alt="mudboard logo"
        height={387}
        width={1267}
        className="w-[150px] hidden sm:block"
        draggable={false}
      />
      <Image
        src={color === "white" ? "/logo.png" : "/logo-brown.png"}
        alt="mudboard logo"
        height={350}
        width={350}
        className="w-[40px] sm:hidden"
        draggable={false}
      />
    </Link>
  );
}
