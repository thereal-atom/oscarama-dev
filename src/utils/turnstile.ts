const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const result = (await response.json()) as TurnstileResponse;

  if (!result.success) {
    console.error("Turnstile verification failed:", {
      errorCodes: result["error-codes"],
      hostname: result.hostname,
      hasToken: !!token,
      tokenLength: token?.length,
    });
  }

  return result.success;
}
