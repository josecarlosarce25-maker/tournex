# 🚀 Tournex — Deploy en 5 minutos

> Esta es la versión **express**: tú creas 2 cuentas (15 min), me das 3 llaves, yo corro 1 comando.
>
> Tiempo total: **~20 min** (era 45+ antes).

---

## ✅ Lo que YA está hecho

- Código completo, builds limpios, sin errores de TypeScript ni de lint
- Auto-deploy script en `scripts/deploy.sh` que hace todo:
  - Crea los 4 productos en Stripe
  - Sube el Worker a Cloudflare
  - Configura las 10 variables de entorno
  - Crea el webhook de Stripe
  - Configura las URLs de Supabase
- 30 días de prueba gratis integrados en checkout
- PWA manifest, OG image, error pages, sitemap
- Todo pusheado a GitHub

---

## 🎯 Lo único que tú tienes que hacer

### Paso A — Crear cuenta de Stripe (~7 min)

1. **https://stripe.com/mx** → **Start now**
2. Email + contraseña → verifica correo
3. Llena lo básico (México, business name: Tournex, software/SaaS)
4. Arriba a la derecha confirma que dice **"Test mode"** (naranja)
5. Menú izquierdo → **Developers → API keys**
6. Copia **Publishable key** (`pk_test_...`) y **Secret key** (`sk_test_...`)

### Paso B — Crear cuenta de Cloudflare (~5 min)

1. **https://dash.cloudflare.com/sign-up**
2. Email + contraseña → verifica correo
3. Skip cualquier "Add a website" o elige plan **Free**
4. Click tu email arriba a la derecha → **Profile**
5. Tab **API Tokens** → **Create Token**
6. Busca template **"Edit Cloudflare Workers"** → **Use template**
7. Deja todo default → **Continue to summary** → **Create Token**
8. **Copia el token completo**. ⚠️ Solo se ve una vez.

### Paso C — Mandarme los 3 valores

Pégamelos así:

```
STRIPE PUBLISHABLE: pk_test_...
STRIPE SECRET: sk_test_...
CLOUDFLARE TOKEN: ...
```

---

## 🤖 Lo que YO hago cuando me mandes las llaves

1. Lleno `.env.deploy` con tus llaves + las de Supabase que ya tengo
2. Corro `./scripts/deploy.sh`
3. El script en automático:
   - Crea Tournex Pro + Tournex Club con 4 precios (99/950/249/2388 MXN)
   - Compila la app para Cloudflare Workers
   - La sube
   - Crea el webhook de Stripe
   - Configura Site URL en Supabase
   - Te imprime la URL pública

Después solo te falta **un paso manual** (la API de Google Cloud OAuth no permite automatizar este específicamente):

### Paso D — Agregar URL a Google Cloud (~30 segundos)

1. **https://console.cloud.google.com/apis/credentials**
2. Click el OAuth client "Tournex web"
3. **Authorized JavaScript origins** → **+ ADD URI** → pega la URL que te di
4. **Save**

### Paso E — Probar (~5 min juntos)

1. Abrir la URL pública
2. Login con Google
3. Crear un torneo de prueba
4. Click "Empezar prueba gratis" → tarjeta `4242 4242 4242 4242` · futura · `123`
5. Confirmar que cae el plan Pro con estado "trialing"

🎉 **Tournex vivo en internet.**

---

## 📁 Archivos clave del proyecto

| Archivo | Para qué |
|---|---|
| `scripts/deploy.sh` | El comando único que despliega todo |
| `scripts/setup-stripe.mjs` | Crea los 4 productos en Stripe vía API |
| `scripts/setup-stripe-webhook.mjs` | Crea el webhook después del deploy |
| `scripts/configure-supabase.mjs` | Configura Site URL en Supabase |
| `.env.deploy.example` | Template de las 4 llaves necesarias |
| `wrangler.jsonc` | Config de Cloudflare Workers |
| `open-next.config.ts` | Adaptador de Next.js → Cloudflare |

---

## 🔄 Si algo falla en el deploy

El script se detiene en el primer error. Para volver a empezar desde donde falló:

```bash
# Re-corre todo (es idempotente — no duplica productos)
./scripts/deploy.sh
```

Outputs intermedios se guardan en `.deploy/`:
- `.deploy/stripe-prices.json` — los 4 Price IDs
- `.deploy/stripe-webhook.json` — webhook id + signing secret
- `.deploy/build.log` — log del primer build
- `.deploy/redeploy.log` — log del redeploy con webhook secret

---

## 📚 Links útiles

| Servicio | Dashboard |
|---|---|
| GitHub | https://github.com/josecarlosarce25-maker/tournex |
| Supabase | https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc |
| Stripe | https://dashboard.stripe.com |
| Cloudflare | https://dash.cloudflare.com |
| Google Cloud | https://console.cloud.google.com |

---

## 🛠 Después del lanzamiento

- **Stripe modo Live (1-3 días):** activa Live, edita `.env.deploy` con `pk_live_...` y `sk_live_...`, vuelve a correr `./scripts/deploy.sh` (es idempotente y actualiza todo).
- **Dominio propio:** en Cloudflare Workers → tu Worker → Settings → Triggers → Custom Domains → agrega `tournex.app`. SSL automático.
- **IA assistant:** Claude API + tool use, ~2-3 días de implementación.
