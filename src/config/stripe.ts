import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config({
    path:'./.env'
})
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});