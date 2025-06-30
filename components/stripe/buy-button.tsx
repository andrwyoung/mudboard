"use client";
import { STRIPE_DISABLED, StripeProduct } from "@/types/stripe-settings";
import { Button } from "../ui/button";
import { useMetadataStore } from "@/store/metadata-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          product: "license" as StripeProduct,
        }),
      });

      if (!res.ok) throw new Error("Stripe checkout failed");

      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      toast.error("Failed to load checkout");
    } finally {
      setLoading(false);
    }
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
