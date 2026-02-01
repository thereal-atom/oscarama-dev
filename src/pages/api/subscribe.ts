import type { APIRoute } from "astro";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { subscriptions } from "@/db/schema";

export const prerender = false;

const subscribeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .transform((v) => v.trim()),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .transform((v) => v.trim().toLowerCase()),
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

    // Extract form fields
    const rawData = {
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      interests: formData.getAll("interests").map((v) => v.toString()),
      channels: formData.getAll("channels").map((v) => v.toString()),
      notes: formData.get("notes")?.toString() ?? null,
    };

    // Validate with Zod
    const parsed = subscribeSchema.safeParse(rawData);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
      return new Response(JSON.stringify({ success: false, error: firstError }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { name, email, interests, channels, notes } = parsed.data;

    // Get D1 binding (DB in production, oscarama_db locally via wrangler pages dev)
    const env = locals.runtime.env as Record<string, unknown>;
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

    return new Response(JSON.stringify({ success: true, message: "Subscribed successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "This email is already subscribed",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("Subscription error:", error);
    return new Response(JSON.stringify({ success: false, error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
