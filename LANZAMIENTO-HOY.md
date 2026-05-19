# Lanzamiento HOY — Estado al 2026-05-18

---

## ✅ LO QUE YA ESTÁ HECHO (mientras estabas fuera)

| Etapa | Qué | Estado |
|---|---|---|
| **1 — Google OAuth** | Client ID + Secret en Supabase, Google login activo | ✅ Hecho |
| **1.4 — Confirm email** | Apagado en Supabase | ✅ Hecho |
| **1.5 — SQL migration** | Tabla `subscriptions` creada, columnas `subscription_plan` / `subscription_status` en `organizers` | ✅ Hecho |
| **1.5 — service_role** | Key guardada en `.env.local` | ✅ Hecho |
| **Build** | `npm run build` pasa limpio, 13 rutas | ✅ Hecho |
| **3 — GitHub** | Repo creado: [github.com/josecarlosarce25-maker/tournex](https://github.com/josecarlosarce25-maker/tournex), todo el código pusheado | ✅ Hecho |

---

## 🔴 LO QUE TE FALTA A TI (en orden)

### Tiempo estimado cuando llegas a casa: ~45 min

```
ETAPA 2 → Stripe        (30 min)
ETAPA 4 → Netlify       (10 min)  ← el código ya está listo con netlify.toml
ETAPA 5 → URLs finales  ( 5 min)
ETAPA 6 → Prueba final  (juntxs)
```

---

## ETAPA 2 — Stripe `~30 min · Hazla tú primero`

> Stripe Mexico requiere verificar cuenta (RFC, INE) para cobros **reales** — eso tarda 1-3 días.
> Hoy configuramos en **modo prueba** (tarjetas falsas). Cuando Stripe te apruebe, cambias 6 valores en Netlify y listo.

### Paso a paso:

1. Ve a **https://stripe.com/mx** → **Start now**.
2. Crea cuenta con tu email → verifica correo.
3. En el dashboard, arriba a la derecha asegúrate que el switch diga **"Test mode"** (en naranja).
4. Menú izquierdo → **Product catalog** → **+ Add product**.

**Producto 1 — Tournex Pro:**
- Name: `Tournex Pro`
- Description: `Plan Pro — torneos ilimitados`
- Recurring, `99.00 MXN`, Monthly → **Save product**
- Ya creado: **+ Add another price** → `950.00 MXN`, Yearly → Save

**Producto 2 — Tournex Club:**
- Name: `Tournex Club`
- Recurring, `249.00 MXN`, Monthly → Save
- **+ Add another price** → `2388.00 MXN`, Yearly → Save

5. Para cada precio, entra y copia el **Price ID** (`price_xxxxx`) — son 4 en total.
6. Menú → **Developers → API keys**
   - Copia **Publishable key** (`pk_test_...`)
   - Click "Reveal test key" y copia **Secret key** (`sk_test_...`)

### 📨 Mándame esto en el chat:

```
STRIPE PUBLISHABLE KEY: pk_test_...
STRIPE SECRET KEY: sk_test_...
PRO MENSUAL: price_...
PRO ANUAL: price_...
CLUB MENSUAL: price_...
CLUB ANUAL: price_...
```

Yo pego todo en Netlify y te aviso que ya está.

---

## ETAPA 4 — Netlify `~10 min · Después de que yo confirme Stripe`

> El código ya tiene `netlify.toml` con la config correcta — Netlify lo detecta automáticamente.

### Paso a paso:

1. Ve a **https://app.netlify.com/signup** → **Sign up with GitHub**.
2. Ya dentro: **Add new site → Import an existing project → GitHub**.
3. Autoriza Netlify → selecciona el repo **`tournex`**.
4. Netlify detecta la config sola. Solo verifica:
   - **Branch:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Antes de deploy, click **"Add environment variables"** y agrega estas
   (yo te paso los valores exactos en el chat en ese momento):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET          ← deja esto en blanco por ahora
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL
NEXT_PUBLIC_STRIPE_PRICE_CLUB_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUAL
```

6. Click **Deploy tournex**. Espera ~3 minutos.
7. Cuando termine tendrás una URL tipo `https://algo-bonito-1234.netlify.app`.
   - Puedes cambiarla: **Site configuration → Change site name** → ej. `tournex-app`
8. Copia la URL final.

### 📨 Mándame:

```
NETLIFY URL: https://tournex-app.netlify.app
```

---

## ETAPA 5 — Configurar URLs post-deploy `~5 min`

(Reemplaza `tournex-app.netlify.app` con tu URL real en todos estos pasos.)

### 5A — Supabase

1. Supabase → proyecto Tournex → **Authentication → URL Configuration**
2. **Site URL:** `https://tournex-app.netlify.app`
3. **Additional Redirect URLs:** agrega:
   - `https://tournex-app.netlify.app/auth/callback`
4. **Save**

### 5B — Google Cloud

1. [console.cloud.google.com](https://console.cloud.google.com) → Tournex → **Credentials** → tu OAuth client
2. **Authorized JavaScript origins** → agrega `https://tournex-app.netlify.app`
3. **Save**

### 5C — Stripe webhook

1. Stripe → **Developers → Webhooks → + Add endpoint**
2. **Endpoint URL:** `https://tournex-app.netlify.app/api/webhooks/stripe`
3. **Events:** selecciona estos 6:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint** → copia el **Signing secret** (`whsec_...`)
5. Netlify → **Site configuration → Environment variables** → edita `STRIPE_WEBHOOK_SECRET` → pega el valor → Save
6. Netlify → **Deploys → Trigger deploy → Deploy site** (~2 min para que aplique)

### 📨 Mándame:

```
TODO CONFIGURADO ✓
```

---

## ETAPA 6 — Prueba final (juntos) `~10 min`

Cuando me digas "todo configurado" hacemos la prueba:

1. **Google login:** entra con Google a tu URL pública → confirma que aterrizas en el dashboard.
2. **Crear torneo:** wizard completo → inscribir 4 parejas → generar brackets → capturar marcador.
3. **Suscripción de prueba:**
   - Landing → click "Probar Pro"
   - Stripe Checkout → tarjeta `4242 4242 4242 4242` · fecha futura · CVC `123`
   - Confirma → debes volver con badge Pro activo.

Si todo funciona: 🎉 **Tournex está vivo.**

---

## Variables de entorno que yo ya tengo listas (te las paso cuando las pidas)

```
NEXT_PUBLIC_SUPABASE_URL=https://mhohuwpaikqevwqqpihc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...   (completo en el chat)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1Ni...        (completo en el chat)
```

Las 7 variables de Stripe las sabremos después de que completes la Etapa 2.

---

## Referencia rápida

```
GitHub repo:   https://github.com/josecarlosarce25-maker/tournex
Supabase:      https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc
Google Cloud:  https://console.cloud.google.com (proyecto "My First Project")
Stripe:        https://dashboard.stripe.com
Netlify:       https://app.netlify.com  (cuenta nueva con GitHub)
```

### Orden final de hoy:
```
2 → (mandas llaves Stripe) → yo las preparo → 4 → 5 → 6 🎉
```

---

## Después del lanzamiento (próximos días)

- **Stripe aprobación real:** cuando llegue el email, activa modo Live y cambia las 6 env vars a `pk_live_...`.
- **Dominio propio** (`tournex.app`): ~$15/año en Namecheap, lo conecto en 10 min.
- **IA assistant:** construirlo con Claude API — ~2-3 días, incluido en Pro/Club.
- **MercadoPago** (cobro integrado para plan Club): después de tener usuarios reales.
