# Tournex — Lo que falta para lanzar (Cloudflare)

> Este doc tiene SOLO los pasos pendientes. Todo lo demás ya está hecho.
> Tiempo total estimado: ~40 min.

---

## ✅ Lo que ya quedó listo (yo)

- ✅ Supabase configurado (Google OAuth activo, tabla `subscriptions` creada)
- ✅ Código en GitHub: https://github.com/josecarlosarce25-maker/tournex
- ✅ **30 días gratis** en Pro y Club integrado en Stripe Checkout
- ✅ Adaptador de Cloudflare Workers configurado (`@opennextjs/cloudflare`)
- ✅ Build verificado: `npm run cf:build` pasa limpio

---

## PROYECTO: Tournex
- **Carpeta:** `~/tournex`
- **Repo:** https://github.com/josecarlosarce25-maker/tournex
- **Supabase:** proyecto `mhohuwpaikqevwqqpihc`

---

## PASO 1 — Stripe `~30 min · primero`

> Modo prueba hoy (tarjetas falsas). Cuando Stripe te apruebe en 1-3 días, cambias las 6 vars y queda en producción real.

### 1.1 Crear cuenta
1. Ve a **https://stripe.com/mx** → **Start now**
2. Email + contraseña → verifica correo
3. Llena el formulario básico (puedes saltarte RFC por ahora)
4. Arriba a la derecha del dashboard, asegúrate que diga **"Test mode"** (en naranja)

### 1.2 Crear los productos
Menú izquierdo → **Product catalog** → **+ Add product**

**Tournex Pro:**
- Name: `Tournex Pro`
- Activa **"Recurring"**
- Amount: `99` · MXN · **Monthly** → Save product
- En el mismo producto, click **+ Add another price** → `950` MXN · **Yearly** → Save

**Tournex Club:**
- Name: `Tournex Club`
- Recurring · `249` MXN · Monthly → Save
- **+ Add another price** → `2388` MXN · Yearly → Save

> No actives "Free trial" aquí — el trial de 30 días ya está en el código y se aplica automáticamente.

### 1.3 Copiar los 4 Price IDs
Para cada precio: click en el producto → click en el precio → arriba aparece `price_xxxxx`. Copia los 4.

### 1.4 Copiar las API keys
Menú izquierdo → **Developers → API keys**
- **Publishable key:** `pk_test_...`
- **Secret key:** click "Reveal test key" → copia `sk_test_...`

### 📨 Mándame:
```
STRIPE PUBLISHABLE KEY: pk_test_...
STRIPE SECRET KEY: sk_test_...
PRO MENSUAL: price_...
PRO ANUAL: price_...
CLUB MENSUAL: price_...
CLUB ANUAL: price_...
```

Yo armo el bloque de env vars listo para pegar en Cloudflare.

---

## PASO 2 — Cloudflare Pages `~10 min · después de Stripe`

> **No es Netlify.** Es Cloudflare Workers + Pages (totalmente gratis sin créditos limitados).

### 2.1 Crear cuenta
1. Ve a **https://dash.cloudflare.com/sign-up**
2. Email + contraseña → verifica correo
3. **No te pide tarjeta**. El plan Free incluye todo lo que necesitamos.

### 2.2 Crear el Worker
1. En el dashboard, menú izquierdo → **Workers & Pages**
2. Click **Create** (botón azul arriba)
3. Click la pestaña **"Workers"** → **"Import a repository"**
4. Click **"Connect GitHub"** → autoriza Cloudflare a ver tus repos
5. Selecciona el repo **`tournex`**

### 2.3 Configurar el build
Cloudflare te pregunta cómo construir el Worker. Llena exactamente esto:

| Campo | Valor |
|---|---|
| **Worker name** | `tournex` |
| **Production branch** | `main` |
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx wrangler deploy` |
| **Build output directory** | (déjalo vacío) |
| **Root directory** | `/` |

### 2.4 Variables de entorno
**ANTES de darle Deploy**, click **"Add variable"** en la sección de variables de build/runtime. Agrega estas 10 (yo te paso los valores en el chat después del Paso 1):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET          ← pon "pendiente" por ahora
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL
NEXT_PUBLIC_STRIPE_PRICE_CLUB_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUAL
```

> **Importante:** las que empiezan con `STRIPE_SECRET_KEY` y `SUPABASE_SERVICE_ROLE_KEY` márcalas como **"Encrypt"** (checkbox al lado del campo) — son secretas.

### 2.5 Deploy
Click **"Save and deploy"**.

Espera ~4 minutos (la primera vez instala dependencias y compila). Vas a ver logs en vivo.

Cuando termine te da una URL tipo `https://tournex.tu-cuenta.workers.dev`.

### 📨 Mándame:
```
CLOUDFLARE URL: https://tournex.________.workers.dev
```

---

## PASO 3 — Configurar URLs `~5 min`

> Reemplaza `tournex.tu-cuenta.workers.dev` por tu URL real en todos los pasos.

### 3A — Supabase
1. Ve a **https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc/auth/url-configuration**
2. **Site URL:** `https://tournex.tu-cuenta.workers.dev`
3. **Redirect URLs** → **+ Add URL:** `https://tournex.tu-cuenta.workers.dev/auth/callback`
4. **Save**

### 3B — Google Cloud
1. **https://console.cloud.google.com** → **APIs & Services → Credentials**
2. Click tu OAuth 2.0 Client ID ("Tournex web")
3. **Authorized JavaScript origins** → **+ ADD URI:** `https://tournex.tu-cuenta.workers.dev`
4. **Save**

### 3C — Stripe webhook
1. **https://dashboard.stripe.com/test/webhooks** → **+ Add endpoint**
2. **Endpoint URL:** `https://tournex.tu-cuenta.workers.dev/api/webhooks/stripe`
3. **Select events** — marca estos 6:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Add endpoint** → copia el **Signing secret** (`whsec_...`)

### 3D — Actualizar webhook secret en Cloudflare
1. Cloudflare dashboard → Workers & Pages → click en **tournex**
2. Tab **Settings** → **Variables and Secrets**
3. Busca `STRIPE_WEBHOOK_SECRET` → click **Edit** → pega el `whsec_...` → **Encrypt** ✓ → Save
4. Tab **Deployments** → click los 3 puntos del último deploy → **Retry deployment**
5. Espera ~2 min

### 📨 Mándame:
```
TODO CONFIGURADO ✓
```

---

## PASO 4 — Prueba final (juntos, ~10 min)

Cuando confirmes "todo configurado":

1. **Login con Google** — entra a tu URL pública, click "Continuar con Google"
2. **Crear torneo** — wizard, 4 parejas, brackets, capturar marcador
3. **Prueba el trial de 30 días:**
   - Landing → **"Empezar prueba gratis"** (botón verde del plan Pro)
   - En Stripe Checkout debe decir **"30 days free"** arriba del precio
   - Tarjeta de prueba: `4242 4242 4242 4242` · fecha futura · CVC `123`
   - Confirma → vuelves a Tournex con plan Pro activo y estado **"trialing"**
   - Stripe NO cobra hasta el día 31

**Si todo funciona: 🎉 Tournex está vivo y con trial de 30 días.**

---

## Referencia rápida

| Servicio | Link |
|---|---|
| GitHub | https://github.com/josecarlosarce25-maker/tournex |
| Supabase | https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc |
| Google Cloud | https://console.cloud.google.com |
| Stripe | https://dashboard.stripe.com |
| **Cloudflare** | **https://dash.cloudflare.com** |

---

## Notas técnicas (por si algo falla)

### Si el build de Cloudflare falla
- Revisa que en "Build command" diga exactamente: `npx opennextjs-cloudflare build`
- Revisa que en "Deploy command" diga: `npx wrangler deploy`
- El proyecto debe tener `wrangler.jsonc` en la raíz (ya lo subí)

### Si el login con Google da error después de deployar
Probablemente falta agregar la URL de Cloudflare en Google Cloud (Paso 3B). Revisa que esté `https://tournex.________.workers.dev` en "Authorized JavaScript origins".

### Si los pagos no aparecen en la base de datos
1. El webhook está configurado pero no llega → verifica en Stripe Dashboard → Webhooks → ver intentos
2. El secret no coincide → re-copia el `whsec_...` y pégalo en Cloudflare con Encrypt ✓

---

## Después del lanzamiento

- **Stripe modo Live (1-3 días):** llega email → activas Live mode → repites los 4 productos en Live → cambias las 6 vars de Stripe en Cloudflare a `pk_live_...` / `sk_live_...`
- **Dominio propio** (`tournex.app` o lo que escojas): ~$15 USD/año en Cloudflare Registrar. Ya con Cloudflare Workers, conectarlo es 1 click (Custom Domain) y el SSL es automático
- **IA assistant:** Claude API + tool use, 2-3 días de desarrollo
