// DEPRECATED: this was the page we used to redirect people to
// once they logged in successfully. now we just direct them to /dashboard

"use client";

import Logo from "@/components/ui/logo";
import { useMetadataStore } from "@/store/metadata-store";
import Image from "next/image";

export default function LoggedInPage() {
  const user = useMetadataStore((s) => s.user);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-primary">
      <div className="flex flex-col items-center">
        <Image
          src={"/yay2.png"}
          alt={"Happy Person"}
          width={125}
          height={125}
          className="-translate-x-5"
        />
        <h1 className="text-4xl font-bold mb-2">
          {user ? "You're logged in!" : "Logging you in..."}
        </h1>
        <p className="text-sm mb-4">
          {user
            ? "You can now return to the app. This page is safe to close."
            : "Please wait a moment."}
        </p>

        <div className="absolute top-4 left-6">
          <Logo color="brown" />
        </div>
      </div>
    </div>
  );
}
