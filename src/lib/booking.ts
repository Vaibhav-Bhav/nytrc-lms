import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Booking enquiries are appended to a Google Sheet via an Apps Script Web App
 * acting as a webhook. Set the deployment URL in SHEETS_WEBHOOK_URL on the
 * server (PM2 env) — it is a write-only endpoint, but treat it as a secret:
 * anyone holding it can append rows.
 */
const WEBHOOK_ENV = "SHEETS_WEBHOOK_URL";

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^[0-9+\s()-]+$/, "Enter a valid phone number");

export const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(200),
  mobile: phone,
  whatsapp: phone,
  whatsappSameAsMobile: z.boolean(),
  state: z.string().trim().min(1, "State is required").max(100),
  district: z.string().trim().min(1, "District is required").max(100),
  language: z.string().trim().min(1, "Language is required").max(100),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/**
 * Appends one enquiry to the sheet. Kept as a plain function (rather than
 * inlined into the server fn) so it can be exercised without the Start server
 * runtime — server fns require an AsyncLocalStorage context to invoke.
 */
export async function recordBooking(data: BookingInput) {
  const webhookUrl = process.env[WEBHOOK_ENV];

  if (!webhookUrl) {
    // Fail loudly rather than silently dropping an enquiry.
    console.error(`[booking] ${WEBHOOK_ENV} is not set — enquiry was not recorded:`, data.email);
    throw new Error(
      "Booking is not configured yet. Please email navyugconsultants2@gmail.com or call +91 97795 35329.",
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      submittedAt: new Date().toISOString(),
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      whatsapp: data.whatsapp,
      whatsappSameAsMobile: data.whatsappSameAsMobile ? "Yes" : "No",
      state: data.state,
      district: data.district,
      language: data.language,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(`[booking] webhook responded ${response.status}: ${body.slice(0, 500)}`);
    throw new Error(
      "We couldn't record your request just now. Please try again, or email navyugconsultants2@gmail.com.",
    );
  }

  return { ok: true } as const;
}

export const submitBooking = createServerFn({ method: "POST" })
  .validator((data: unknown) => bookingSchema.parse(data))
  .handler(({ data }) => recordBooking(data));
