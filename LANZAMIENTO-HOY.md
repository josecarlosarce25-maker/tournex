# Tournex — Lo que falta para lanzar

> Todo lo anterior ya está hecho. Este doc tiene SOLO los pasos pendientes.
> Tiempo total: ~45 min (puedes hacerlo mañana tranquilo).

---

## PROYECTO: Tournex
- **Código en GitHub:** https://github.com/josecarlosarce25-maker/tournex
- **Base de datos:** Supabase proyecto `mhohuwpaikqevwqqpihc`
- **Google login:** ✅ ya activo

---

## PASO 1 — Stripe `~30 min`

> Trabajamos en **modo prueba** hoy (sin RFC ni verificación). Cuando Stripe
> te apruebe en 1-3 días, cambias 6 variables y listo.

### 1.1 Crear cuenta
1. Ve a **https://stripe.com/mx** → click **Start now**
2. Escribe tu email y crea contraseña → **Create account**
3. Verifica tu correo (te llega un link)
4. Llena el formulario de bienvenida (puedes poner datos básicos, no necesitas RFC todavía)
5. Cuando entres al dashboard, asegúrate que el switch de arriba a la derecha diga **"Test mode"** — si no, actívalo

### 1.2 Crear los 4 productos
Ve a menú izquierdo → **Product catalog** → botón **+ Add product**

**Producto 1:**
- Name: `Tournex Pro`
- Activa **"Recurring"** (no one-time)
- Amount: `99` · Currency: **MXN** · Period: **Monthly**
- Click **Save product**
- Ahora agrega el precio anual al mismo producto: click **+ Add another price** → `950` MXN · Yearly → Save

**Producto 2:**
- Name: `Tournex Club`
- Recurring, `249` MXN, Monthly → Save
- **+ Add another price** → `2388` MXN, Yearly → Save

### 1.3 Copiar los 4 Price IDs
Para cada precio, haz click en el producto → click en el precio → arriba verás algo como `price_1ABCxxx`.

Anótalos:
```
Pro mensual:  price_________
Pro anual:    price_________
Club mensual: price_________
Club anual:   price_________
```

### 1.4 Copiar las API keys
Menú izquierdo → **Developers** → **API keys**
- **Publishable key:** `pk_test_...` — click para copiar
- **Secret key:** click **"Reveal test key"** → copia el `sk_test_...`

### 📨 Mándame en el chat:
```
STRIPE PUBLISHABLE KEY: pk_test_...
STRIPE SECRET KEY: sk_test_...
PRO MENSUAL: price_...
PRO ANUAL: price_...
CLUB MENSUAL: price_...
CLUB ANUAL: price_...
```

**Yo te respondo con el bloque exacto de env vars listo para pegar en Netlify.**

---

## PASO 2 — Netlify `~10 min` (después de que yo te confirme las vars)

> No importa que hayas borrado el proyecto anterior. El código está en GitHub
> y se reimporta en 2 clics.

### 2.1 Crear cuenta nueva (o entrar a la existente)
1. Ve a **https://app.netlify.com/signup**
2. Click **"Sign up with GitHub"** → autoriza con la misma cuenta `josecarlosarce25-maker`
3. Si ya tenías cuenta, solo entra en **https://app.netlify.com**

### 2.2 Crear el sitio
1. Click **"Add new site"** → **"Import an existing project"**
2. Click **GitHub** → autoriza si te lo pide → busca y selecciona el repo **`tournex`**
3. Netlify detecta la config automáticamente. Solo verifica que diga:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **NO le des Deploy todavía** — primero hay que agregar las variables de entorno

### 2.3 Agregar variables de entorno
Click en **"Add environment variables"** (está en la misma pantalla antes del deploy)

Agrega estas 3 que ya tenemos (yo te doy los valores completos cuando me escribas):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Y las 7 de Stripe que yo te mando en el Paso 1:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET          ← pon cualquier texto por ahora, ej: "pendiente"
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL
NEXT_PUBLIC_STRIPE_PRICE_CLUB_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUAL
```

### 2.4 Deploy
5. Click **"Deploy tournex"**
6. Espera ~3 minutos (la primera vez tarda más)
7. Cuando diga **"Published"**, tienes una URL tipo `https://algo-abc123.netlify.app`
8. Puedes cambiar el nombre: **Site configuration → Change site name** → escribe `tournex-app` → Save
   - La URL queda como `https://tournex-app.netlify.app`

### 📨 Mándame:
```
NETLIFY URL: https://______.netlify.app
```

---

## PASO 3 — Configurar las URLs `~5 min` (después de que tengas la URL de Netlify)

> Reemplaza `tournex-app.netlify.app` con tu URL real en todo lo que sigue.

### 3A — Supabase (2 min)
1. Ve a **https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc/auth/url-configuration**
2. **Site URL** → escribe: `https://tournex-app.netlify.app`
3. **Redirect URLs** → click **+ Add URL** → escribe: `https://tournex-app.netlify.app/auth/callback`
4. Click **Save**

### 3B — Google Cloud (1 min)
1. Ve a **https://console.cloud.google.com** → menú → **APIs & Services → Credentials**
2. Click en tu OAuth 2.0 Client ID (el que se llama "Tournex web")
3. En **Authorized JavaScript origins** → click **+ ADD URI** → escribe: `https://tournex-app.netlify.app`
4. Click **Save**

### 3C — Stripe webhook (2 min)
1. Ve a **https://dashboard.stripe.com/test/webhooks** → click **+ Add endpoint**
2. **Endpoint URL:** `https://tournex-app.netlify.app/api/webhooks/stripe`
3. Click **"Select events"** → marca estos 6:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. En la pantalla del webhook recién creado, click **"Reveal"** junto a **Signing secret** → copia el `whsec_...`

### 3D — Actualizar webhook secret en Netlify (1 min)
1. Netlify → tu sitio → **Site configuration → Environment variables**
2. Busca `STRIPE_WEBHOOK_SECRET` → click **Edit** → pega el `whsec_...` → **Save**
3. Ve a **Deploys** → click **"Trigger deploy"** → **"Deploy site"**
4. Espera ~2 min a que termine

### 📨 Mándame:
```
TODO CONFIGURADO ✓
```

---

## PASO 4 — Prueba final (juntos, ~10 min)

Cuando me digas "todo configurado" te guío en vivo:

1. **Login con Google** — entra a tu URL pública, click "Continuar con Google"
2. **Crear torneo** — wizard completo, 4 parejas, brackets, marcador
3. **Suscripción de prueba:**
   - Landing → "Probar Pro"
   - En Stripe Checkout usa: tarjeta **`4242 4242 4242 4242`** · cualquier fecha futura · CVC `123`
   - Debe volver con plan Pro activo

**Cuando funcione: Tournex está vivo. 🎉**

---

## Referencia rápida de links

| Qué | Link |
|---|---|
| GitHub | https://github.com/josecarlosarce25-maker/tournex |
| Supabase | https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc |
| Google Cloud | https://console.cloud.google.com |
| Stripe | https://dashboard.stripe.com |
| Netlify | https://app.netlify.com |

---

## Después del lanzamiento

- **Stripe aprobación real (1-3 días):** te llega email → activa Live mode → cambia las 6 vars de Stripe en Netlify a `pk_live_...` / `sk_live_...` → redeploy
- **Dominio propio** (`tournex.app`): ~$15/año, lo conecto en 10 min cuando quieras
- **IA assistant:** construirlo con Claude API, ~2-3 días, incluido en Pro/Club
