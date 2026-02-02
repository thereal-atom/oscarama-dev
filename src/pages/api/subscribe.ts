import type { APIRoute } from "astro";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";
import { z } from "zod";
import { subscriptions } from "@/db/schema";
import { verifyTurnstile } from "@/utils/turnstile";

export const prerender = false;

const RESEND_WELCOME_TEMPLATE_ID = "d92f9ffd-14dc-43cf-b858-dd75fda0c26e";

const subscribeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .transform((v) => v.trim()),
  email: z.email("Invalid email format").transform((v) => v.trim().toLowerCase()),
  interests: z.array(z.string()).min(1, "Select at least one event interest"),
  channels: z.array(z.string()).default([]),
  notes: z
    .string()
    .transform((v) => v.trim() || null)
    .nullable()
    .default(null),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const env = locals.runtime.env as Record<string, unknown>;

    // const turnstileToken = formData.get("cf-turnstile-response")?.toString();
    // const turnstileSecret = env.TURNSTILE_SECRET_KEY as string;
    // if (!turnstileSecret) {
    //   throw new Error("Turnstile not configured");
    // }
    // if (!turnstileToken || !(await verifyTurnstile(turnstileToken, turnstileSecret))) {
    //   return new Response(
    //     JSON.stringify({ success: false, error: "Bot verification failed. Please try again." }),
    //     { status: 400, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    const rawData = {
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      interests: formData.getAll("interests").map((v) => v.toString()),
      channels: formData.getAll("channels").map((v) => v.toString()),
      notes: formData.get("notes")?.toString() ?? null,
    };

    const parsed = subscribeSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return new Response(JSON.stringify({ success: false, error: firstError }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { name, email, interests, channels, notes } = parsed.data;

    // Get D1 binding (DB in production, oscarama_db locally via wrangler pages dev)
    const d1 = (env.DB || env.oscarama_db) as D1Database;
    if (!d1) {
      throw new Error("D1 database binding not found");
    }

    const db = drizzle(d1);

    await db.insert(subscriptions).values({
      name,
      email,
      interests: interests.length > 0 ? JSON.stringify(interests) : null,
      channels: channels.length > 0 ? JSON.stringify(channels) : null,
      notes,
      raw: JSON.stringify(parsed.data),
    });

    const resendApiKey = env.RESEND_API_KEY as string;
    if (!resendApiKey) {
      throw new Error("Email service not configured");
    }

    const resend = new Resend(resendApiKey);
    const emailResult = await resend.emails.send({
      from: "oscarama <hey@updates.oscarama.dev>",
      to: email,
      subject: "you're in!",
      template: { id: RESEND_WELCOME_TEMPLATE_ID, variables: { name } },
    });

    if (emailResult.error) {
      throw new Error(`Failed to send welcome email: ${emailResult.error.message}`);
    }

    return new Response(JSON.stringify({ success: true, message: "Subscribed successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return new Response(JSON.stringify({ success: false, error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
