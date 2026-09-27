import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";
import { z } from "zod";

// ================================================================
// META PIXEL + CONVERSIONS API (CAPI)
// Altere os valores nas Secrets do projeto (nunca no código):
//   META_PIXEL_ID   = COLOQUE_PIXEL_ID_AQUI
//   META_CAPI_TOKEN = COLOQUE_TOKEN_AQUI
// O token só é lido aqui no servidor e nunca vai para o navegador.
// ================================================================

const sha = (v?: string) =>
  v ? createHash("sha256").update(v.trim().toLowerCase()).digest("hex") : undefined;

const Body = z.object({
  event_name: z.enum(["PageView", "InitiateCheckout", "AddPaymentInfo", "Lead", "Purchase"]),
  event_id: z.string().min(1).max(100),
  event_source_url: z.string().max(2000).optional(),
  custom_data: z.record(z.string(), z.unknown()).optional(),
  user: z
    .object({
      email: z.string().max(200).optional(),
      phone: z.string().max(30).optional(),
      name: z.string().max(200).optional(),
      fbp: z.string().max(200).optional(),
      fbc: z.string().max(300).optional(),
    })
    .optional(),
});

const valid = (v?: string) => !!v && !v.startsWith("COLOQUE_");

export const Route = createFileRoute("/api/public/meta-capi")({
  server: {
    handlers: {
      // Retorna apenas o Pixel ID (público) para o navegador.
      GET: async () => {
        const pixelId = process.env['META_PIXEL_ID'];
        return Response.json({ pixelId: valid(pixelId) ? pixelId : null });
      },
      POST: async ({ request }) => {
        const pixelId = process.env['META_PIXEL_ID'];
        const token = process.env['META_CAPI_TOKEN'];
        if (!valid(pixelId) || !valid(token)) return Response.json({ skipped: true });

        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Invalid", { status: 400 });
        const d = parsed.data;
        const u = d.user ?? {};
        const phone = u.phone?.replace(/\D/g, "");
        const [fn, ...rest] = (u.name ?? "").trim().split(/\s+/);

        const payload = {
          data: [
            {
              event_name: d.event_name,
              event_time: Math.floor(Date.now() / 1000),
              event_id: d.event_id,
              action_source: "website",
              event_source_url: d.event_source_url,
              user_data: {
                em: sha(u.email) ? [sha(u.email)] : undefined,
                ph: phone ? [sha(phone.startsWith("55") ? phone : "55" + phone)] : undefined,
                fn: fn ? [sha(fn)] : undefined,
                ln: rest.length ? [sha(rest.join(" "))] : undefined,
                fbp: u.fbp,
                fbc: u.fbc,
                client_ip_address:
                  request.headers.get("cf-connecting-ip") ??
                  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
                client_user_agent: request.headers.get("user-agent") ?? undefined,
              },
              custom_data: d.custom_data,
            },
          ],
        };

        const r = await fetch(
          `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
          { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) },
        );
        return Response.json({ ok: r.ok }, { status: r.ok ? 200 : 502 });
      },
    },
  },
});
