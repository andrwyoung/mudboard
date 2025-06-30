import Stripe from "stripe";

export const stripeClient = new Stripe(process.env.STRIPE_SANDBOX_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});
