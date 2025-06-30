import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClientSudo } from "@/lib/supabase/supabase-server";
import { Enums } from "@/types/supabase";

const stripe = new Stripe(process.env.STRIPE_SANDBOX_KEY!, {
  apiVersion: "2025-05-28.basil",
});

function getTierLevel(tier: string): Enums<"tier_level"> {
  if (tier === "license") {
    return "beta";
  }

  return "free";
}

// This is your Stripe CLI/Webhook secret (starts with "whsec_...")
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text(); // raw body
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) throw new Error("Missing signature or secret");

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const tier = session.metadata?.type;

    if (!userId || !tier) {
      console.error("No user_id or tier in session metadata");
      return NextResponse.json({ received: true });
    }

    // Update Supabase user record
    const supabase = await createClientSudo();

    const { error } = await supabase
      .from("users")
      .update({ tier: getTierLevel(tier) })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user license", error);
    } else {
      console.log(`User ${userId} upgraded`);
    }
  }

  return NextResponse.json({ received: true });
}
