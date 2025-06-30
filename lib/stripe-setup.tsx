import { STRIPE_IS_LIVE } from "@/types/constants";
import Stripe from "stripe";

const key = STRIPE_IS_LIVE
  ? process.env.STRIPE_SECRET_KEY!
  : process.env.STRIPE_SANDBOX_SECRET_KEY!;

export const stripeClient = new Stripe(key, {
  apiVersion: "2025-05-28.basil",
});
