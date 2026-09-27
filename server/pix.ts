import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FRETE_EXPRESSO_CENTS, FRETE_GRATIS_CENTS, PRODUCT_PRICE_CENTS } from "@/lib/pix-config";

const API = "https://app.pingupag.com/api/v1";

const CreateBody = z.object({
  frete: z.enum(["gratis", "expresso"]),
  qty: z.number().int().min(1).max(5).default(1),
  customer: z.object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(200),
    phone: z.string().max(30),
  }),
});

// Procura um campo em qualquer nível da resposta
function pick(obj: unknown, keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (keys.includes(k) && typeof v === "string" && v) return v;
  }
  for (const v of Object.values(obj as Record<string, unknown>)) {
    const f = pick(v, keys);
    if (f) return f;
  }
  return undefined;
}

export const Route = createFileRoute("/api/public/pix")({
  server: {
    handlers: {
      // create_pix
      POST: async ({ request }) => {
        const key = process.env["PINGUPAG_API_KEY"];
        const productHash = process.env["PINGUPAG_PRODUCT_HASH"];
        if (!key || !productHash) return Response.json({ error: "Pix não configurado" }, { status: 503 });

        const parsed = CreateBody.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Dados inválidos" }, { status: 400 });
        const { frete, qty, customer } = parsed.data;

        // Valor calculado só no servidor
        const amount =
          PRODUCT_PRICE_CENTS * qty + (frete === "expresso" ? FRETE_EXPRESSO_CENTS : FRETE_GRATIS_CENTS);
        const digits = customer.phone.replace(/\D/g, "");

        const r = await fetch(`${API}/transaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": key },
          body: JSON.stringify({
            amount,
            productHash,
            customer: { name: customer.name, email: customer.email, phone: digits },
          }),
        });
        const data: unknown = await r.json().catch(() => null);
        if (!r.ok) {
          console.error("Pingupag create error", r.status, data);
          return Response.json({ error: "Não foi possível gerar o Pix" }, { status: 502 });
        }
        const hash = pick(data, ["hash", "external_id", "externalId", "transaction_hash", "id"]);
        const code = pick(data, ["pix_code", "pixCode", "qr_code", "qrcode", "qrCode", "copy_paste", "emv", "brcode", "payload"]);
        const image = pick(data, ["qr_code_base64", "qrCodeBase64", "qrcode_base64", "qr_code_image", "image"]);
        if (!hash || !code) {
          console.error("Pingupag unexpected response", data);
          return Response.json({ error: "Resposta inesperada do Pix" }, { status: 502 });
        }
        return Response.json({ hash, code, image: image ?? null, amount });
      },

      // check_status
      GET: async ({ request }) => {
        const key = process.env["PINGUPAG_API_KEY"];
        const hash = new URL(request.url).searchParams.get("hash") ?? "";
        if (!key || !/^[\w-]{1,100}$/.test(hash)) return Response.json({ status: "pending" });

        const r = await fetch(`${API}/check_status.php?hash=${encodeURIComponent(hash)}`, {
          headers: { "X-API-Key": key },
        });
        const data: unknown = await r.json().catch(() => null);
        const status = (pick(data, ["status", "payment_status"]) ?? "").toLowerCase();
        if (["paid", "approved", "pago", "completed"].includes(status)) {
          return Response.json({ status: "paid", redirect_url: process.env["UPSELL_URL"] ?? null });
        }
        return Response.json({ status: "pending" });
      },
    },
  },
});
