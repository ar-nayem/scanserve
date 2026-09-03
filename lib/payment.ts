// Payment module — currently a SIMULATION. No real money moves through here.
//
// The checkout flow (app/api/payment/create, app/api/payment/verify, and the
// cart's "Place Order & Pay" button) only calls createPayment/verifyPayment
// below. That's deliberate: swapping in a real payment aggregator later means
// rewriting the body of these two functions only — the checkout UI and API
// routes never need to change.
//
// TODO(real payments): Bangladesh restaurants typically integrate one of:
//   - SSLCommerz (https://developer.sslcommerz.com/) — bundles bKash, Nagad,
//     Rocket, and cards behind one API. Typical flow: POST order details to
//     their /gwprocess/v4/api.php to get a GatewayPageURL, redirect the
//     customer there, then verify via their validation API on the
//     success/IPN callback using SSLCOMMERZ_STORE_ID / SSLCOMMERZ_STORE_PASSWORD.
//   - ShurjoPay (https://shurjopay.com.bd/) — similar aggregator, token-based
//     auth with SHURJOPAY_USERNAME / SHURJOPAY_PASSWORD / SHURJOPAY_MERCHANT_ID,
//     then a checkout-url + verification-by-order-id flow.
// Either way: createPayment() should return a redirect URL (or client secret)
// instead of resolving instantly, and verifyPayment() should call the
// provider's real verification endpoint instead of trusting the local order.

import { Order } from "./types";

export interface PaymentResult {
  success: boolean;
  transactionId: string;
}

export interface VerifyResult {
  verified: boolean;
  transactionId: string;
}

/**
 * Simulates charging the customer for an order.
 * TODO: replace with SSLCommerz/ShurjoPay session creation + redirect.
 */
export async function createPayment(order: Order): Promise<PaymentResult> {
  // Simulate network latency of a real payment gateway.
  await new Promise((resolve) => setTimeout(resolve, 800));

  const transactionId = `SIM-${order.id.slice(0, 8)}-${Date.now()}`;

  return {
    success: true,
    transactionId,
  };
}

/**
 * Simulates verifying a transaction with the payment provider.
 * TODO: replace with a real call to SSLCommerz's validation API or
 * ShurjoPay's verification endpoint, keyed by transactionId.
 */
export async function verifyPayment(transactionId: string): Promise<VerifyResult> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const verified = transactionId.startsWith("SIM-");

  return {
    verified,
    transactionId,
  };
}
