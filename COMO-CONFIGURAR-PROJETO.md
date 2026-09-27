=========================================================
GUIA RAPIDO DE CONFIGURACAO E USO — CHECKOUT LIQUIDIFICADOR
=========================================================

1) ONDE FICAM AS CREDENCIAIS (SECRETS, NUNCA NO CODIGO)
--------------------------------------------------------
Todas as credenciais sao variaveis de ambiente do PROJETO.
No Lovable: Configuracoes do projeto → Secrets (ou me peca para
abrir o formulario seguro). Em hospedagem externa: env vars da
plataforma (Cloudflare/Vercel/etc). Nao existe arquivo .env no
codigo — nada de credencial fica versionado.

Variaveis obrigatorias (valores FICTICIOS abaixo, use os seus):

  # Meta Pixel + Conversions API
  META_PIXEL_ID=123456789012345        # ID do Pixel (15 digitos)
  META_CAPI_TOKEN=EAABxxxxxxFakeToken  # Token do System User (CAPI)

  # Pix (Pingupag)
  PINGUPAG_API_KEY=pg_live_fake123456  # Chave de API da Pingupag
  PINGUPAG_PRODUCT_HASH=prod_abc123    # Hash do produto na Pingupag
  UPSELL_URL=https://meudominio.com/upsell  # Pagina pos-pagamento

Onde cada uma e lida (nao edite o valor aqui, so o nome da Secret):

  src/routes/api/public/meta-capi.ts
    linha  8-9  comentarios indicando as secrets
    linha 39,43  process.env['META_PIXEL_ID']
    linha 44     process.env['META_CAPI_TOKEN']

  src/routes/api/public/pix.ts
    linha  5    const API = "https://app.pingupag.com/api/v1"
                (URL base da API — so troque se mudar de provedor)
    linha 35,74  process.env["PINGUPAG_API_KEY"]
    linha 36     process.env["PINGUPAG_PRODUCT_HASH"]
    linha 84     process.env["UPSELL_URL"]

2) PRECOS (ALTERE DIRETO NO ARQUIVO, EM CENTAVOS)
--------------------------------------------------------
  src/lib/pix-config.ts
    linha 5  PRODUCT_PRICE_CENTS  = 2990  (R$ 29,90)
    linha 6  FRETE_GRATIS_CENTS   = 0     (R$ 0,00)
    linha 7  FRETE_EXPRESSO_CENTS = 904   (R$ 9,04)

  Exemplo: produto a R$ 49,90 → 4990.

3) EVENTOS DO FACEBOOK (PIXEL/CAPI) — ONDE DISPARAM
--------------------------------------------------------
Os scripts do Pixel estao no final de public/checkout.html.
O browser dispara fbq + CAPI com o mesmo event_id (dedupe):
  PageView          → ao abrir a pagina
  InitiateCheckout  → 1o clique em "Continuar"
  Purchase          → clique em "Comprar agora"

4) COMANDOS
--------------------------------------------------------
  npm i                # instalar dependencias
  npm run dev          # rodar local (http://localhost:8080)
  npm run build        # build de producao
  npm run lint         # procurar erros de codigo
  npm run format       # formatar codigo

5) ERROS COMUNS
--------------------------------------------------------
  {"pixelId":null} em /api/public/meta-capi
    → META_PIXEL_ID nao cadastrada ou comecando com "COLOQUE_".

  {"error":"Pix nao configurado"}
    → Faltam PINGUPAG_API_KEY ou PINGUPAG_PRODUCT_HASH nas Secrets.

  {"error":"Nao foi possivel gerar o Pix"}
    → Pingupag recusou (chave invalida / produto exige CPF).

  {"error":"Resposta inesperada do Pix"}
    → Pingupag respondeu em formato desconhecido; verifique o hash
      do produto e o log do servidor.

  "Pix nao configurado" em hospedagem simples
    → A hospedagem nao roda as funcoes server (pasta server/).
      Use Cloudflare Workers/Vercel ou similar.

  Erros de build
    → Rode npm run lint e leia /tmp/observability/build-errors.log
      (no Lovable) ou o output de npm run build.

6) CHECKLIST RAPIDO
--------------------------------------------------------
  [ ] Cadastrar as 5 secrets (item 1)
  [ ] Conferir precos em src/lib/pix-config.ts
  [ ] npm i && npm run dev
  [ ] Testar fluxo: e-mail → nome/WhatsApp → CEP 01310-100 → frete
      → "Comprar agora" → QR Code do Pix
  [ ] Validar eventos no Events Manager do Facebook
  [ ] npm run build antes de publicar
