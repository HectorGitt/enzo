import DodoPayments from "dodopayments";

// Initialize the Dodo Payments client
// Get API key from https://app.dodopayments.com/developer
export const dodo = new DodoPayments({
	bearerToken: process.env.DODO_PAYMENTS_API_KEY || "", // Fallback for build time
	environment:
		(process.env.DODO_PAYMENTS_MODE as "live_mode" | "test_mode") ||
		"test_mode",
	webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || "", // Required for webhook verification
});
