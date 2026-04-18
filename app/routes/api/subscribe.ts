import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { Resend } from "resend";
import { subscriptions } from "@/db/schema";
import { z } from "zod";

const RESEND_WELCOME_TEMPLATE_ID = "d92f9ffd-14dc-43cf-b858-dd75fda0c26e";

const subscribeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .transform((value) => value.trim()),
  email: z.email("Invalid email format").transform((value) => value.trim().toLowerCase()),
  interests: z.array(z.string()).min(1, "Select at least one event interest"),
  channels: z.array(z.string()).default([]),
  notes: z
    .string()
    .transform((value) => value.trim() || null)
    .nullable()
    .default(null),
});

type Env = {
  DB?: D1Database;
  oscarama_db?: D1Database;
  RESEND_API_KEY?: string;
};

function getEnv(): Env {
  const runtimeEnv = globalThis as typeof globalThis & {
    __CLOUDFLARE_ENV__?: Env;
  };

  return runtimeEnv.__CLOUDFLARE_ENV__ ?? {};
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const env = getEnv();

    const rawData = {
      name: formData.get("name")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      interests: formData.getAll("interests").map((value) => value.toString()),
      channels: formData.getAll("channels").map((value) => value.toString()),
      notes: formData.get("notes")?.toString() ?? null,
    };

    const parsed = subscribeSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return Response.json({ success: false, error: firstError }, { status: 400 });
    }

    const { name, email, interests, channels, notes } = parsed.data;

    const d1 = env.DB || env.oscarama_db;
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

    const resendApiKey = env.RESEND_API_KEY;
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

    return Response.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Subscription error:", error);
    return Response.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
