import {
  LICENSE_PRICE_ID,
  LICENSE_SANDBOX_PRICE_ID,
  STRIPE_IS_LIVE,
} from "@/types/constants";
import { createClientSudo } from "@/lib/supabase/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe-setup";

export async function POST(req: NextRequest) {
  const supabase = await createClientSudo();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error("Failed to get user");
  }

  if (!user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_IS_LIVE ? LICENSE_PRICE_ID : LICENSE_SANDBOX_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: `${req.nextUrl.origin}/dashboard?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        type: "license",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return new NextResponse("Failed to create Stripe session", { status: 500 });
  }
}
