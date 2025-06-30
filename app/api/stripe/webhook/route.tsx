import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClientSudo } from "@/lib/supabase/supabase-server";
import { Enums } from "@/types/supabase";
import { stripeClient } from "@/lib/stripe-setup";

function getTierLevel(tier: string): Enums<"tier_level"> {
  if (tier === "license") {
    return "beta";
  }

  return "free";
}

const endpointSecret = process.env.STRIPE_SANDBOX_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) throw new Error("Missing signature or secret");

    event = stripeClient.webhooks.constructEvent(body, sig, endpointSecret);
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
