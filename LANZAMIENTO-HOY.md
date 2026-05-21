# 🚀 Tournex — Guía paso a paso para lanzar

> Todo lo técnico ya está hecho. Esta guía es **click por click** — no necesitas saber programar.
> Tiempo total: ~45 minutos.
>
> **Si en algún paso ves algo distinto a lo que dice aquí, no le muevas y avísame.**

---

## ✅ Lo que ya está listo (no tienes que hacer nada con esto)

- Google OAuth conectado a Supabase
- Tabla `subscriptions` creada en la base de datos
- Trial de **30 días gratis** integrado en el checkout
- Código completo en GitHub
- Adaptador de Cloudflare Workers configurado y probado

---

## 📋 Orden de los pasos

```
PASO 1 → Crear cuenta de Stripe              (~10 min)
PASO 2 → Crear los productos en Stripe       (~10 min)
PASO 3 → Copiar las llaves de Stripe         (~5 min)
         ↓ Me mandas las llaves
PASO 4 → Crear cuenta de Cloudflare          (~3 min)
PASO 5 → Crear el Worker de Tournex          (~10 min)
         ↓ Te paso la URL
PASO 6 → Configurar Supabase + Google        (~5 min)
PASO 7 → Configurar el webhook de Stripe     (~3 min)
PASO 8 → Prueba final juntos                 (~5 min)
```

---

# PASO 1 — Crear cuenta de Stripe

### 1.1 Entra a Stripe

1. Abre tu navegador y ve a: **https://stripe.com/mx**
2. Vas a ver un fondo blanco con el logo púrpura de Stripe arriba a la izquierda
3. Arriba a la derecha, click el botón blanco con texto negro que dice **"Start now"**

### 1.2 Crea la cuenta

Aparece un formulario con estos campos:

| Campo | Qué pongo |
|---|---|
| **Email** | Tu email (el mismo de Tournex) |
| **Full name** | Tu nombre completo (ej. José Carlos Arce Aguayo) |
| **Country** | `Mexico` (importante, no "United States") |
| **Password** | Una contraseña fuerte. **GUÁRDALA**. |

Click el botón morado grande que dice **"Create account"**

### 1.3 Verifica tu correo

1. Abre tu Gmail
2. Vas a ver un correo de **Stripe** con asunto "Confirm your email"
3. Click el botón morado dentro del correo: **"Confirm email address"**
4. Te regresa a Stripe automáticamente

### 1.4 Llena la información básica

Stripe te va a hacer 3-4 preguntas tipo "Tell us about your business":

| Pregunta | Qué contestar |
|---|---|
| What's your business name? | `Tournex` |
| What does your business do? | Selecciona "Software" / "SaaS" |
| Where is your business located? | `Mexico` |
| When do you want to start accepting payments? | Selecciona "Just exploring" o "Within 1 month" |

> ⚠️ **NO te pide RFC ni datos bancarios todavía** — eso es solo si después activas pagos reales. Por ahora trabajamos en modo prueba.

5. Click **Continue** o **Skip** al final

### 1.5 Confirma que estás en "Test mode"

1. Ya en el dashboard, arriba a la derecha de la pantalla vas a ver un switch que dice **"Test mode"** o **"Sandboxes"**
2. **DEBE estar activado (en naranja)**. Si no lo está, click el switch para encenderlo
3. Cuando está activado verás un banner naranja arriba que dice "You are in test mode"

✅ **Stripe listo. Sigue al Paso 2.**

---

# PASO 2 — Crear los productos en Stripe

Vamos a crear 2 productos (Tournex Pro y Tournex Club), cada uno con 2 precios (mensual y anual).

### 2.1 Abre el catálogo

1. En el menú izquierdo busca un ícono que parece una caja o un tag de precio que dice **"Product catalog"** o **"Products"**
2. Click ahí
3. Verás una pantalla que dice "No products yet" o similar
4. Click el botón arriba a la derecha **"+ Add product"** (verde o morado)

### 2.2 Producto 1 — Tournex Pro

Aparece un formulario. Llénalo exactamente así:

**Sección "Product information":**
| Campo | Valor |
|---|---|
| Name | `Tournex Pro` |
| Description | `Plan Pro de Tournex — torneos ilimitados, parejas ilimitadas, IA assistant` |
| Image | (déjalo vacío o sube el logo si quieres) |

**Sección "Pricing":**
| Campo | Valor |
|---|---|
| Pricing model | Selecciona **"Recurring"** (NO "One-off") |
| Amount | `99.00` |
| Currency | `MXN — Mexican Peso` (búscalo en el dropdown) |
| Billing period | `Monthly` |

> ⚠️ **NO actives "Free trial period"** aquí — el trial de 30 días ya está en el código de Tournex y se aplica solo.

Click el botón morado abajo que dice **"Save product"**.

### 2.3 Agrega el precio anual a Tournex Pro

Te regresa a la lista de productos. Verás **"Tournex Pro"** ahí.

1. Click en el nombre **"Tournex Pro"** para abrirlo
2. Te lleva a la página del producto. Bajas un poco hasta ver la sección **"Pricing"**
3. Verás el precio mensual de $99 que acabas de crear
4. Click el botón **"+ Add another price"** que está abajo del precio existente
5. Llena el nuevo precio:

| Campo | Valor |
|---|---|
| Pricing model | `Recurring` |
| Amount | `950.00` |
| Currency | `MXN` |
| Billing period | `Yearly` |

6. Click **Save**

Ahora Tournex Pro tiene 2 precios: $99 MXN/mes y $950 MXN/año.

### 2.4 Producto 2 — Tournex Club

1. Click el ícono de regresar (`←`) arriba a la izquierda, o ve al menú **Product catalog** otra vez
2. Click **"+ Add product"**
3. Llena:

| Campo | Valor |
|---|---|
| Name | `Tournex Club` |
| Description | `Plan Club de Tournex — todo lo de Pro + cobro integrado + tu logo` |
| Pricing model | `Recurring` |
| Amount | `249.00` |
| Currency | `MXN` |
| Billing period | `Monthly` |

4. **Save product**
5. Abre el producto, click **"+ Add another price"**, agrega:

| Campo | Valor |
|---|---|
| Pricing model | `Recurring` |
| Amount | `2388.00` |
| Currency | `MXN` |
| Billing period | `Yearly` |

6. **Save**

✅ Ahora tienes 2 productos con 4 precios totales.

---

# PASO 3 — Copiar las llaves de Stripe

### 3.1 Copia los 4 Price IDs

Para cada uno de los 4 precios:

1. Ve a **Product catalog** → click un producto (ej. Tournex Pro)
2. Abajo verás los precios. Click en uno de ellos
3. Te abre una pantalla. Arriba o a la derecha verás un texto que empieza con **`price_`** seguido de letras y números, algo así: `price_1Qx7abXYZ123abc`
4. Click el ícono de copiar (📋) junto al ID, o selecciónalo y Cmd+C
5. **Pégalo en un Notes o un papel temporalmente** — vas a tener 4 IDs

Apunta así, sin equivocarte de cuál es cuál:

```
Pro mensual ($99):    price_______________
Pro anual ($950):     price_______________
Club mensual ($249):  price_______________
Club anual ($2388):   price_______________
```

### 3.2 Copia las API keys

1. En el menú izquierdo busca **"Developers"** (ícono de "</>")
2. Click en **"Developers"** → submenu **"API keys"**
3. Verás una página con 2 llaves:

**Publishable key** (la pública):
- Empieza con `pk_test_...`
- Está visible directamente, solo click el ícono de copiar 📋
- Pégala temporalmente

**Secret key** (la privada):
- Dice "Secret key" pero está oculta con `••••••••`
- Click el botón **"Reveal test key"** (al lado derecho)
- Aparece el valor completo `sk_test_...`
- Click copiar 📋

### 3.3 📨 Mándame todo en el chat

Pégame todo así (reemplaza con tus valores reales):

```
STRIPE PUBLISHABLE KEY: pk_test_...
STRIPE SECRET KEY: sk_test_...
PRO MENSUAL: price_...
PRO ANUAL: price_...
CLUB MENSUAL: price_...
CLUB ANUAL: price_...
```

> ⚠️ **Yo te respondo con un bloque listo para pegar en Cloudflare.** No avances al Paso 4 hasta que te conteste.

---

# PASO 4 — Crear cuenta de Cloudflare

### 4.1 Entra a Cloudflare

1. Ve a: **https://dash.cloudflare.com/sign-up**
2. Vas a ver un formulario con fondo gris/azul

### 4.2 Llena el formulario

| Campo | Qué pongo |
|---|---|
| **Email** | Tu email (puede ser el mismo de los otros servicios) |
| **Password** | Una contraseña fuerte. **GUÁRDALA**. |

3. Click el botón naranja **"Sign Up"**

> ⚠️ **No te pide tarjeta de crédito** ni teléfono. Si en algún punto te pide pagar algo, dime — el plan que vamos a usar es 100% gratis.

### 4.3 Verifica el correo

1. Abre Gmail → correo de **Cloudflare** con asunto "Confirm your email"
2. Click el botón azul **"Verify email"**

### 4.4 Salta el wizard inicial

Cloudflare te puede mostrar una pantalla "Add a website" — **NO agregues ninguno**.

- Click **"Skip"** o "I'll do this later" abajo
- Si te lleva a "Choose a plan", selecciona **"Free"** (el primero, $0/mes)
- Click **Continue**

Vas a quedar en el dashboard principal con un menú lateral izquierdo.

---

# PASO 5 — Crear el Worker de Tournex

### 5.1 Abre Workers & Pages

1. En el menú lateral izquierdo busca **"Workers & Pages"**
2. Click ahí

### 5.2 Crea el Worker

1. Vas a ver una pantalla que dice "Get started with Workers"
2. Click el botón azul/morado **"Create"** o **"Create application"**
3. Te muestra opciones. Click la pestaña **"Workers"** (no "Pages")
4. Más abajo verás varias opciones para empezar:
   - "Hello World" template
   - "Import a repository" ← **esta es la que quieres**
5. Click en **"Import a repository"** (o "Connect to Git")

### 5.3 Conecta GitHub

1. Click **"Connect GitHub"**
2. Te abre una ventana de GitHub pidiendo autorización
3. Click **"Authorize Cloudflare"**
4. Si te pregunta "Install on all repositories" o "Only select repositories":
   - Selecciona **"Only select repositories"**
   - Selecciona **`tournex`** en la lista
   - Click **Install**
5. Te regresa a Cloudflare automáticamente

### 5.4 Selecciona el repo

1. Verás una lista de tus repos. Click **`tournex`**
2. Click el botón **"Begin setup"** o **"Continue"**

### 5.5 Configura el build — IMPORTANTE

Aparece una pantalla con varios campos. Llénalos **EXACTAMENTE** así (copia y pega):

| Campo | Valor exacto |
|---|---|
| **Project name** | `tournex` |
| **Production branch** | `main` |
| **Framework preset** | Selecciona **"Next.js"** del dropdown |

Más abajo verás "Build settings". **Sobreescribe lo que detectó automáticamente** con esto:

| Campo | Valor exacto |
|---|---|
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx wrangler deploy` |
| **Build output directory** | (déjalo vacío) |
| **Root directory** | (déjalo vacío o `/`) |

> Si no ves "Deploy command" como campo separado, no te preocupes — Cloudflare lo detecta del `wrangler.jsonc` que ya está en el repo.

### 5.6 Agrega las variables de entorno

En la misma pantalla, busca la sección **"Variables and Secrets"** o **"Environment Variables"**.

> Yo te paso los valores exactos en el chat después del Paso 3. Pégalos uno por uno aquí:

Click **"+ Add variable"** y agrega cada una:

| Nombre de la variable | Tipo | Cómo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Plaintext | yo te paso el valor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plaintext | yo te paso el valor |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** ✓ | yo te paso el valor |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Plaintext | el `pk_test_...` del Paso 3 |
| `STRIPE_SECRET_KEY` | **Secret** ✓ | el `sk_test_...` del Paso 3 |
| `STRIPE_WEBHOOK_SECRET` | **Secret** ✓ | escribe `pendiente` (lo cambiamos en el Paso 7) |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` | Plaintext | tu `price_...` mensual de Pro |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL` | Plaintext | tu `price_...` anual de Pro |
| `NEXT_PUBLIC_STRIPE_PRICE_CLUB_MONTHLY` | Plaintext | tu `price_...` mensual de Club |
| `NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUAL` | Plaintext | tu `price_...` anual de Club |

> **Importante sobre "Secret":** Cuando agregues una variable, vas a ver un checkbox o toggle que dice **"Encrypt"** o **"Secret"**. **Actívalo SOLO para las 3 marcadas arriba con ✓**. Las demás son públicas (de hecho, las que empiezan con `NEXT_PUBLIC_` tienen que ser visibles).

### 5.7 Deploy

1. Cuando hayas agregado las 10 variables, baja hasta el final
2. Click el botón grande **"Save and deploy"** (azul o morado)
3. Cloudflare empieza el build. Vas a ver una pantalla de logs en negro con texto verde/blanco

### 5.8 Espera ~4 minutos

El primer build tarda porque instala todas las dependencias. Vas a ver:
- "Cloning repository..." → "Installing dependencies..." → "Running build command..."

Cuando termine vas a ver:
- ✅ "**Deployment successful**" o "Published"
- Una URL como `https://tournex.tu-usuario.workers.dev` (o algo parecido)

### 5.9 📨 Mándame la URL

Copia la URL que te dio Cloudflare y mándamela:

```
CLOUDFLARE URL: https://tournex.________.workers.dev
```

---

# PASO 6 — Configurar Supabase + Google Cloud

> Reemplaza `tournex.tu-usuario.workers.dev` con tu URL real de Cloudflare en todos los pasos.

### 6.1 Supabase — Site URL

1. Ve a: **https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc/auth/url-configuration**
2. Vas a ver un campo **"Site URL"**. Borra lo que tenga y escribe:
   ```
   https://tournex.tu-usuario.workers.dev
   ```
3. Más abajo verás **"Redirect URLs"**. Click el botón **"+ Add URL"**
4. Escribe:
   ```
   https://tournex.tu-usuario.workers.dev/auth/callback
   ```
5. Click **Save** abajo

### 6.2 Google Cloud — Authorized origins

1. Ve a: **https://console.cloud.google.com**
2. Asegúrate que arriba esté seleccionado el proyecto **"My First Project"** (o el que creaste para Tournex)
3. Menú lateral (las 3 rayitas arriba a la izquierda) → **"APIs & Services"** → **"Credentials"**
4. Verás una sección "OAuth 2.0 Client IDs". Click el que se llama **"Tournex web"**
5. En la pantalla que aparece, busca la sección **"Authorized JavaScript origins"**
6. Click **"+ ADD URI"**
7. Escribe:
   ```
   https://tournex.tu-usuario.workers.dev
   ```
8. Click **Save** abajo

✅ Supabase y Google ya saben sobre tu URL pública.

---

# PASO 7 — Configurar el webhook de Stripe

### 7.1 Crea el endpoint

1. Ve a: **https://dashboard.stripe.com/test/webhooks**
2. Click el botón **"+ Add endpoint"** arriba a la derecha
3. En **"Endpoint URL"** escribe:
   ```
   https://tournex.tu-usuario.workers.dev/api/webhooks/stripe
   ```

### 7.2 Selecciona los eventos

Baja un poco hasta **"Select events"**. Click el botón **"Select events"**.

Te abre un panel con muchos eventos. Busca y marca SOLO estos 6:

- [ ] `checkout.session.completed`
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `invoice.payment_succeeded`
- [ ] `invoice.payment_failed`

> Tip: usa el buscador arriba del panel para encontrarlos más rápido.

Cuando los 6 estén marcados (✓), click **"Add events"** abajo.

### 7.3 Crea el endpoint

Click el botón morado **"Add endpoint"** abajo de todo.

### 7.4 Copia el Signing secret

1. Te lleva a la página del webhook recién creado
2. Verás una sección que dice **"Signing secret"** con `••••••••`
3. Click **"Reveal"** o el ícono de ojo 👁
4. Aparece un valor que empieza con `whsec_...`
5. Click el ícono de copiar 📋

### 7.5 Pega el secret en Cloudflare

1. Vuelve a Cloudflare → **Workers & Pages** → click **tournex**
2. Tab **"Settings"** (o "Configuración") arriba
3. Sub-menú **"Variables and Secrets"** (o "Variables")
4. Busca `STRIPE_WEBHOOK_SECRET` en la lista
5. Click el ícono de lápiz ✏️ o **"Edit"** al lado
6. Borra el valor "pendiente" y pega el `whsec_...` que copiaste
7. Asegúrate que **"Encrypt"** o **"Secret"** esté activado ✓
8. Click **Save**

### 7.6 Redeploya

1. Tab **"Deployments"** arriba
2. Verás el deploy actual. Click los **3 puntos (⋯)** del último deploy
3. Click **"Retry deployment"** o **"Redeploy"**
4. Espera ~2 min a que termine

### 7.7 📨 Mándame:

```
TODO CONFIGURADO ✓
```

---

# PASO 8 — Prueba final (juntos, ~10 min)

Cuando confirmes "todo configurado" hacemos la prueba en vivo:

### 8.1 Login con Google
1. Abre tu URL pública de Cloudflare en una ventana de incógnito
2. Click **"Continuar con Google"** en la pantalla de login
3. Selecciona tu cuenta de Google
4. Debes aterrizar en `/dashboard` automáticamente

### 8.2 Crear un torneo de prueba
1. Click **"Nuevo torneo"** o **"+"**
2. Wizard de 3 pasos: nombre, fechas, formato (selecciona "Round Robin")
3. Inscribe 4 parejas (cualquier nombre)
4. Genera brackets
5. Captura un marcador (ej. 6-3, 6-4)
6. Verifica que la pareja avance

### 8.3 Probar el trial de 30 días 🎯
1. Cierra sesión
2. Ve a la landing pública
3. En la sección de pricing, click **"Empezar prueba gratis"** del plan Pro
4. Te lleva a `/login` si no estás logueado — entra de nuevo
5. Te redirige automáticamente a Stripe Checkout
6. **Verifica que arriba diga "30 days free" o "Free trial"**
7. Usa la tarjeta de prueba: `4242 4242 4242 4242` · fecha futura cualquiera · CVC `123`
8. Click **Subscribe** o **Start trial**
9. Debes volver a Tournex con plan **Pro activo** y estado **"trialing"**
10. ⚠️ Stripe **NO te cobra** ahora — empieza a cobrar el día 31

### 8.4 Verificar en Stripe que el trial está activo
1. Ve a https://dashboard.stripe.com/test/subscriptions
2. Verás tu suscripción de prueba con estado **"Trialing"** y la fecha "Renews on..."

---

# 🎉 ¡Tournex está vivo!

Si todo funciona en el paso 8, ya tienes:
- ✅ App en internet con URL pública
- ✅ Login con Google funcionando
- ✅ Cobros listos (modo prueba) con trial de 30 días
- ✅ Base de datos con RLS protegiendo a cada usuario
- ✅ Webhooks de Stripe actualizando estados automáticamente

---

# 📚 Referencia rápida

| Servicio | Link |
|---|---|
| **GitHub repo** | https://github.com/josecarlosarce25-maker/tournex |
| **Supabase** | https://supabase.com/dashboard/project/mhohuwpaikqevwqqpihc |
| **Google Cloud** | https://console.cloud.google.com |
| **Stripe** | https://dashboard.stripe.com |
| **Cloudflare** | https://dash.cloudflare.com |

---

# 🆘 Si algo falla

### El build de Cloudflare se queda en error
1. Revisa los logs del build (los muestra en la misma pantalla)
2. Si dice "command not found: opennextjs-cloudflare":
   - Build command debe ser EXACTAMENTE: `npx opennextjs-cloudflare build`
3. Si dice "Missing environment variable":
   - Verifica que las 10 variables del Paso 5.6 estén todas agregadas
4. Si dice otra cosa: cópiame el error completo y yo lo resuelvo

### El login con Google da error después de deployar
- Falta agregar la URL de Cloudflare en Google Cloud (Paso 6.2)
- Espera 5 min después de agregar la URL antes de probar (Google tarda en propagar)

### Hago la suscripción de prueba pero el plan no se activa en Tournex
- El webhook no está funcionando. Ve a https://dashboard.stripe.com/test/webhooks → tu endpoint → ver "Webhook attempts"
- Si dicen "Failed": el `STRIPE_WEBHOOK_SECRET` en Cloudflare está mal. Recopia el secret del Paso 7.4 y reemplázalo.
- Si dicen "Pending": espera 30 segundos y refresca.

### "User not found" o "404" cuando abres la URL
- El deploy aún no terminó. Ve a Cloudflare → Workers & Pages → Deployments y espera el ✓ verde.

---

# 📅 Después del lanzamiento

- **Stripe modo Live (1-3 días):** Cuando Stripe te apruebe los cobros reales, te llega email. Repites el Paso 2 pero en modo Live (sin "Test mode") y cambias las 6 variables de Stripe en Cloudflare a las `pk_live_...` / `sk_live_...`
- **Dominio propio** (`tournex.app` o lo que prefieras): ~$15 USD/año, lo conectas a Cloudflare en 1 click y el SSL es automático
- **IA assistant:** Claude API con tool use, ~2-3 días de desarrollo
- **MercadoPago para Plan Club:** Cuando tengas usuarios reales y feedback
