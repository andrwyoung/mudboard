"use client";
import { STRIPE_DISABLED } from "@/types/stripe-settings";
import { Button } from "../ui/button";
import { useMetadataStore } from "@/store/metadata-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startCheckout } from "@/lib/stripe/start-checkout";

export default function BuyButton() {
  const user = useMetadataStore((s) => s.user);
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user?.id) {
      router.push("/login");
      return;
    }

    setLoading(true);
    await startCheckout(user.id, "license");
    setLoading(false);
  }

  return (
    <Button
      variant="secondary"
      className={`w-full font-header bg-secondary`}
      title="Buy Mudboard License"
      onClick={handleCheckout}
      disabled={STRIPE_DISABLED ? true : false}
    >
      {loading ? "Redirecting..." : "Get License"}
    </Button>
  );
}
