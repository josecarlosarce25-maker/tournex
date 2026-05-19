# Lanzamiento HOY — Checklist completo

Este es el plan ÚNICO que vas a seguir hoy. Al terminar, Tournex está
**en internet con dominio público, login con Google funcionando, y
cobros de suscripción listos**.

> **Reglas del juego:**
> 1. Sigue las etapas **en orden** (no saltes ninguna).
> 2. En cada etapa marcada 📨 **me mandas valores** y **esperas mi respuesta**
>    antes de avanzar.
> 3. Si algo no te queda claro, pregúntame antes de moverle.
>
> **Tiempo total estimado:** ~4 horas de trabajo combinado (tuyo + mío).

---

## 📋 Resumen de cuentas que vas a crear

| Cuenta | Para qué | Costo | Tiempo |
|---|---|---|---|
| **Google Cloud** | Login con Google | $0 | 20 min |
| **Stripe** | Cobrar suscripciones Pro/Club | $0 (3.6% + $3 por cobro) | 30 min |
| **GitHub** | Guardar el código en la nube | $0 | 5 min |
| **Netlify** | Publicar la app | $0 (free tier amplio) | 15 min |

> Supabase ya está hecha. RFC para Stripe es opcional para empezar
> (se puede operar en modo prueba hoy y activarlo más tarde).

---

## ETAPA 1 — Google Cloud (login con Google) `~20 min · OPCIONAL HOY`

> **Léeme primero.** Google Cloud ahora exige verificación en 2 pasos (2SV)
> en tu cuenta personal de Gmail antes de dejarte usar la consola. Si te
> apareció el bloqueo "Google Cloud access blocked":
>
> 1. Entra a **https://myaccount.google.com/security**
> 2. Activa **2-Step Verification** (te pide un teléfono o app autenticadora).
> 3. Espera 60 segundos, refresca Google Cloud, ya entrarás.
>
> **Si prefieres saltarte Google login hoy y lanzar la app YA**: pásate
> directo a la **Etapa 1.4**. Los usuarios entran con email + contraseña
> (más rápido que el link mágico) o con un link mágico al correo. Google
> login lo agregamos después en 10 minutos.



### Lo que haces tú:

1. Entra a **https://console.cloud.google.com**
2. Acepta términos si te los pide.
3. Arriba a la izquierda, donde dice "Select a project", click → **"NEW PROJECT"**.
4. Llena:
   - **Project name:** `Tournex`
   - Click **CREATE**. Espera ~30 segundos.
5. Selecciona el proyecto Tournex (vuelve a "Select a project" arriba).
6. En la barra de búsqueda escribe **"OAuth consent screen"** y entra.
7. Selecciona **External** → CREATE.
8. Llena:
   - **App name:** `Tournex`
   - **User support email:** tu email
   - **Developer contact email:** tu email
   - Click **SAVE AND CONTINUE** tres veces (no toques scopes ni test users)
   - Al final click **BACK TO DASHBOARD**.
9. En la barra de búsqueda escribe **"Credentials"** y entra.
10. Click **+ CREATE CREDENTIALS** → **OAuth client ID**.
11. Llena:
    - **Application type:** Web application
    - **Name:** `Tournex web`
    - **Authorized JavaScript origins:** agrega estas dos:
      - `http://localhost:3000`
      - `https://mhohuwpaikqevwqqpihc.supabase.co`
    - **Authorized redirect URIs:** agrega:
      - `https://mhohuwpaikqevwqqpihc.supabase.co/auth/v1/callback`
    - Click **CREATE**.
12. Te aparece un cuadro con dos valores. **CÓPIALOS**.

### Lo que también haces tú (en Supabase):

1. Entra a **https://supabase.com**, abre tu proyecto Tournex.
2. Menú izquierdo: **Authentication → Providers**.
3. Busca **Google** → click → activa el switch **Enable**.
4. Pega ahí mismo el **Client ID** y **Client Secret** que copiaste arriba.
5. Click **Save**.

### 📨 Lo que me mandas:

```
GOOGLE LOGIN: listo
```

Cuando me digas eso, ya está activo. No necesito los valores (van directo a Supabase).

---

## ETAPA 1.4 — Supabase: signups instantáneos `~2 min`

Para que cuando alguien cree una cuenta con email + contraseña **no tenga
que abrir su correo a confirmar**, hay que apagar esa opción en Supabase.
(En producción real podemos volver a prenderla; por ahora menos fricción.)

### Lo que haces tú:

1. Entra a Supabase → tu proyecto Tournex.
2. Menú izquierdo: **Authentication → Sign In / Up → Email**.
3. Busca el switch **"Confirm email"** y **APÁGALO**.
4. Click Save.

Listo. Ahora los signups son instantáneos: el usuario escribe email + contraseña → entra al dashboard al instante.

---

## ETAPA 1.5 — Supabase: SQL nueva + service_role `~5 min`

Para que los webhooks de Stripe puedan escribir en la base de datos
necesitamos dos cosas:

### Lo que haces tú:

1. Entra a **Supabase → tu proyecto Tournex**.
2. Menú izquierdo: **SQL Editor → + New query**.
3. Abre el archivo `supabase/migrations/0002_subscriptions.sql` que está en
   tu carpeta de Tournex. Copia TODO el contenido.
4. Pégalo en el editor de Supabase y click **Run**.
5. Debe decir "Success. No rows returned" — listo.
6. Ahora ve a **Project Settings → API**.
7. Hasta abajo verás **Service role secret**. Click "Reveal" y cópialo.
   ⚠️ Esta llave es SECRETA — no la mandes por canales abiertos.

### 📨 Lo que me mandas:

```
SUPABASE SERVICE ROLE: eyJ...
```

(Pásamela por el chat — solo viaja entre tú y yo y yo la pego directo en Vercel.)

---

## ETAPA 2 — Stripe (suscripciones de Tournex) `~30 min`

> **Nota importante:** Stripe Mexico requiere verificar tu cuenta (RFC, INE,
> cuenta bancaria) para procesar cobros REALES. **Eso tarda 1-3 días.** Por
> eso hoy vamos a configurarlo en **modo prueba** (test mode) — funciona
> idéntico, pero con tarjetas falsas. Cuando Stripe te apruebe, cambiamos
> 2 valores en Vercel y los cobros pasan a ser reales.

### Lo que haces tú:

1. Entra a **https://stripe.com/mx** → **Start now**.
2. Crea cuenta con tu email y contraseña.
3. Verifica tu correo.
4. Te lleva al dashboard. **NO actives el "Activate your account" todavía** —
   trabajamos en modo prueba primero. Arriba a la derecha vas a ver un
   switch que dice **"Test mode"** — asegúrate que esté **ACTIVADO**
   (debe verse naranja).
5. Menú izquierdo: **Product catalog** → **+ Add product**.
6. Crea el primer producto:
   - **Name:** `Tournex Pro`
   - **Description:** `Plan Pro — torneos ilimitados`
   - En **Pricing model**: One-off / Recurring → elige **Recurring**
   - **Amount:** `99.00`
   - **Currency:** `MXN — Mexican Peso`
   - **Billing period:** `Monthly`
   - Click **Save product**.
   - Una vez creado, **agrega otro precio anual** al mismo producto:
     - Click el producto Pro → **+ Add another price**
     - Amount: `950.00` MXN, Billing period: `Yearly`. Save.
7. Repite para el segundo producto:
   - **Name:** `Tournex Club`
   - Precio recurring: `249.00` MXN mensual
   - Segundo precio: `2388.00` MXN anual
8. Ahora copia los **Price IDs**. Para cada precio:
   - Entra al producto, click el precio.
   - Arriba a la derecha verás `price_xxxxxxxxxxxxx`. Cópialo.
   - Vas a tener 4 Price IDs: Pro mensual, Pro anual, Club mensual, Club anual.
9. Menú izquierdo: **Developers → API keys**.
   - Verás 2 llaves: **Publishable key** (`pk_test_...`) y **Secret key** (`sk_test_...`).
   - Click "Reveal test key" para ver la secreta.
   - Cópialas ambas.

### 📨 Lo que me mandas:

```
STRIPE PUBLISHABLE KEY: pk_test_...
STRIPE SECRET KEY: sk_test_...
PRO MENSUAL PRICE ID: price_...
PRO ANUAL PRICE ID: price_...
CLUB MENSUAL PRICE ID: price_...
CLUB ANUAL PRICE ID: price_...
```

**Yo respondo:** "Stripe conectado, sigue con GitHub."

---

## ETAPA 3 — GitHub `~5 min`

### Lo que haces tú:

1. Entra a **https://github.com** → Sign up.
2. Crea cuenta con el mismo correo de Tournex.
3. Verifica el correo cuando te llegue.
4. Cuando estés dentro, **eso es todo de tu parte**.

### 📨 Lo que me mandas:

```
GITHUB: listo, mi usuario es @tu-usuario
```

**Yo subo el código** con un comando y te paso el link del repositorio.

---

## ETAPA 4 — Netlify (publicar la app) `~15 min`

> Espera mi confirmación de que ya subí a GitHub antes de empezar esto.
>
> **¿Por qué Netlify y no Vercel?** Vercel pide verificación por SMS y a
> veces falla con números mexicanos ("user not found"). Netlify hace lo
> mismo, es gratis igual, y solo pide tu correo. La app funciona idéntico.

### Lo que haces tú:

1. Entra a **https://app.netlify.com/signup**.
2. Click **"Sign up with GitHub"** → autoriza.
   (Si te pregunta por tarjeta, ignora — el plan **Starter** es 100% gratis).
3. Ya dentro, arriba a la derecha: **Add new site → Import an existing project**.
4. Click **GitHub** → autoriza Netlify a ver tus repos.
5. Selecciona el repo **`tournex`**.
6. Configuración del build (Netlify lo detecta solo, no cambies nada):
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
7. **Antes de darle Deploy**, click **Add environment variables** y agrega
   estas. Yo te paso los valores exactos en el chat antes de esta etapa:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET    ← lo agregas en la etapa 5
   NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
   NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL
   NEXT_PUBLIC_STRIPE_PRICE_CLUB_MONTHLY
   NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUAL
   ```

   Por ahora deja `STRIPE_WEBHOOK_SECRET` en blanco — lo agregamos en la siguiente etapa.

8. Click **Deploy tournex**. Espera ~3 minutos (la primera vez tarda más
   porque instala el plugin de Next.js automáticamente).
9. ✅ Cuando termine, vas a tener una URL tipo `https://random-name-xxxx.netlify.app`.
   Puedes renombrarla a algo bonito en **Site configuration → Change site name**
   (ej. `tournex.netlify.app`).
10. **Cópiala**.

### 📨 Lo que me mandas:

```
NETLIFY URL: https://tournex.netlify.app
```

> **Si llegas a tener problemas con Netlify también**, hay 2 alternativas
> más al final del documento: Cloudflare Pages (gratis, mejor performance)
> o Render ($0–7 USD/mes). Ambas funcionan; Netlify es solo la más simple.

---

## ETAPA 5 — Configuración post-deploy `~10 min`

Aquí conectamos todo a tu URL pública.

### Lo que haces tú:

> En todos estos pasos, **reemplaza `tournex.netlify.app` por tu URL real**
> (la que te dio Netlify al terminar la etapa 4).

#### 5A. Supabase

1. Entra a Supabase → tu proyecto → **Authentication → URL Configuration**.
2. **Site URL:** `https://tournex.netlify.app`
3. **Redirect URLs**, agrega estas dos:
   - `https://tournex.netlify.app/auth/callback`
   - `http://localhost:3000/auth/callback`
4. Click **Save**.

#### 5B. Google Cloud

1. Vuelve a console.cloud.google.com → tu proyecto Tournex → **Credentials**.
2. Click tu OAuth client ID.
3. En **Authorized JavaScript origins** agrega:
   - `https://tournex.netlify.app`
4. Click **Save**.

#### 5C. Stripe webhook

1. Entra a Stripe → menú **Developers → Webhooks**.
2. Click **+ Add endpoint**.
3. **Endpoint URL:** `https://tournex.netlify.app/api/webhooks/stripe`
4. **Events to send:** click "Select events" → marca:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**.
6. Una vez creado, en la pantalla del webhook verás **Signing secret** (`whsec_...`). Cópialo.
7. Vuelve a Netlify → tu proyecto → **Site configuration → Environment variables**.
8. Edita `STRIPE_WEBHOOK_SECRET` y pega el valor.
9. Click **Save**. Trigger un nuevo deploy: **Deploys → Trigger deploy → Deploy site** (~2 min).

### 📨 Lo que me mandas:

```
TODO CONFIGURADO ✓
```

---

## ETAPA 6 — Prueba final `~10 min` (juntos)

Yo te guío en vivo para probar:

1. **Login con Google:** entra a tu URL pública, click "Continuar con Google", confirma que entras.
2. **Magic link:** sale, otro email, confirma que llega y funciona.
3. **Crear torneo:** completa el wizard, inscribe un par de parejas, genera brackets.
4. **Suscripción de prueba:**
   - Cierra sesión.
   - Entra a la landing, click "Probar Pro".
   - Te lleva a Stripe Checkout.
   - Usa la tarjeta de prueba: **`4242 4242 4242 4242`**, fecha cualquiera futura, CVC `123`.
   - Confirma la compra.
   - Vuelves a Tournex con suscripción activa.

Si todo funciona: **🎉 Tournex está vivo y listo para invitar usuarios reales.**

---

## Cuando Stripe te apruebe (en 1-3 días)

1. Stripe te manda email diciendo que ya puedes recibir pagos reales.
2. En Stripe Dashboard, apaga el switch "Test mode" arriba a la derecha.
3. Repite **Etapa 2** pero en modo Live (vas a tener llaves `pk_live_...` y `sk_live_...`).
4. Crea los mismos 4 precios en modo Live → copia los 4 nuevos Price IDs.
5. En Netlify → Site configuration → Environment variables → cambia las 6 variables de Stripe a las de Live.
6. Netlify redeploy. Listo: cobros reales.

---

## Dominio propio (opcional, después)

Cuando quieras `tournex.app` en vez de `tournex.netlify.app`:

1. Compra el dominio en Cloudflare/Namecheap (~$15-20 USD/año).
2. En Netlify → tu proyecto → **Domain management → Add custom domain** → `tournex.app`.
3. Netlify te dice qué pegar en el DNS de tu proveedor (un CNAME o registros A).
4. Espera 10-60 min a que propague. Netlify configura SSL automáticamente.
5. Vuelve a Supabase + Google Cloud + Stripe webhook y reemplaza la URL por `https://tournex.app`.

---

## Si Netlify también falla — alternativas

Si por algún motivo Netlify no jala (raro pero por si acaso), tienes estas:

### Cloudflare Pages — gratis con ancho de banda ilimitado
- https://pages.cloudflare.com
- Sign up con Google o GitHub, no pide teléfono.
- Para Next.js 16 necesita el adaptador `@cloudflare/next-on-pages` —
  yo lo configuro si vamos por este camino, dime.
- Performance excelente (CDN global de Cloudflare).

### Render — alternativa simple
- https://render.com
- Sign up con email o Google.
- Plan gratis tiene "cold start" (la primera visita después de 15 min de
  inactividad tarda ~30 segundos). Plan paid es **$7 USD/mes** sin cold starts.
- Cuando importas el repo, elige "Web Service" → Next.js auto-detecta.

### Si quieres opciones de pago directo
- **Railway** — $5 USD/mes mínimo, muy simple.
- **Fly.io** — ~$5 USD/mes, requiere Docker pero te puedo armar el archivo.

---

## Resumen del orden (referencia rápida)

```
1.   Google Cloud (20 min · OPCIONAL HOY)  →  "GOOGLE LOGIN: listo"
1.4  Supabase: confirm email OFF (2 min)   →  signups instantáneos
1.5  Supabase SQL + service role (5 min)   →  SUPABASE SERVICE ROLE
2.   Stripe (30 min)                       →  llaves + 4 Price IDs
3.   GitHub (5 min)                        →  usuario
     ↓ (yo subo el código y te paso el .env)
4.   Netlify (15 min)                      →  URL pública
5.   Configurar URLs (10 min)              →  "TODO CONFIGURADO ✓"
6.   Prueba final juntos (10 min)          →  🎉
```

> Etapas mínimas para lanzar HOY: 1.4 → 1.5 → 2 → 3 → 4 → 5 → 6.
> Google login (Etapa 1) se puede agregar después en una sesión rápida.

**Empieza con la Etapa 1.** Cuando termines, escríbeme "Google login listo" y sigo.

¿Lista? 🚀
