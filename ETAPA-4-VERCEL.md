# Etapa 4 — Publicar la app a internet (Vercel)

Hoy la app corre en tu computadora (`localhost:3000`). En esta etapa la
**ponemos en internet** con una dirección pública (algo como
`tournex.vercel.app`) para que tus links de inscripción y resultados
funcionen sin que tu compu esté prendida.

Toma ~20–30 minutos. Es la última parada antes de poder usar Tournex con
clientes reales.

> **Resumen mental:**
> - **GitHub** guarda el código en la nube (versión más reciente siempre disponible).
> - **Vercel** lee ese código de GitHub y lo publica como página web.
> - Cada vez que cambiamos algo, basta con subir el cambio a GitHub y Vercel
>   actualiza el sitio solo en ~2 minutos.

---

## Parte A — Crear cuenta en GitHub (si no tienes)

GitHub es donde se guarda el código en la nube. Es gratis.

1. Entra a **https://github.com** y haz clic en **"Sign up"**.
2. Usa tu correo (mismo de Tournex sirve).
3. Verifica tu correo cuando te llegue el código.
4. Cuando te pregunte qué plan: **Free** está perfecto.

> Si ya tienes cuenta, sáltate esto.

---

## Parte B — Subir el código a GitHub

Esto lo más fácil es que **yo lo haga por ti** en una sesión. Pero por si
quieres entender qué pasa o hacerlo solo:

**Opción 1 (recomendada) — Pídeme que lo suba**
Solo me dices "súbelo a GitHub" y yo:
- Creo un repositorio nuevo llamado `tournex`
- Subo todo el código (sin tus llaves de Supabase, esas se quedan en `.env.local`)
- Te paso el link del repo para que lo veas en GitHub.com

**Opción 2 — Hazlo tú mismo con GitHub Desktop**
1. Descarga **GitHub Desktop** desde https://desktop.github.com (es gratis).
2. Ábrelo y entra con tu cuenta de GitHub.
3. Menú **File → Add Local Repository** → elige la carpeta `~/tournex`.
4. Si te pide crear repositorio, dile **"create a repository"** con estos datos:
   - Name: `tournex`
   - Description: `Tournex — plataforma de torneos de pádel`
   - Local Path: `~/tournex`
   - **Marca "Initialize this repository with a README"**: déjalo apagado, ya hay archivos.
   - **Git Ignore**: déjalo en None (ya tenemos uno).
5. Botón azul **"Publish repository"** (arriba a la derecha).
   - **Marca "Keep this code private"** ← importante, no queremos que sea público todavía.
   - Click "Publish repository".
6. Listo, el código está en GitHub.

---

## Parte C — Crear cuenta en Vercel

1. Entra a **https://vercel.com** y haz clic en **"Sign Up"**.
2. Elige **"Continue with GitHub"** ← esto conecta las dos cuentas de un golpe.
3. Autoriza Vercel a leer tus repositorios de GitHub.
4. Cuando te pregunte qué plan: **Hobby** (el gratis) está perfecto.

---

## Parte D — Importar el proyecto a Vercel

1. Ya dentro de Vercel, te aparece **"Import Git Repository"** o un botón **"Add New… → Project"**.
2. Verás la lista de tus repos de GitHub. Selecciona **`tournex`** y dale **"Import"**.
3. Vercel detecta automáticamente que es Next.js. **No cambies nada** de Framework Preset / Build Command / Output Directory.
4. **Antes de darle "Deploy"**, busca la sección **"Environment Variables"** (o "Configure Project") y agrega estos dos valores:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://mhohuwpaikqevwqqpihc.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (la llave larga, la misma que pegaste en `.env.local`) |

5. Click en **"Deploy"**.
6. Espera ~2 minutos. Verás unas barras de progreso (compiling, optimizing, deploying).
7. ✅ Cuando termine, te aparece una pantalla con confeti y un link tipo
   `https://tournex-xxxx.vercel.app`. **Ese es tu sitio en internet.**

---

## Parte E — Decirle a Supabase la nueva dirección

Esto es **crítico** para que el magic-link funcione en producción. Si te
saltas este paso, los correos siguen mandando a `localhost:3000`.

1. Copia el link que te dio Vercel (algo como `https://tournex-xxxx.vercel.app`).
2. Entra a **https://supabase.com**, abre tu proyecto `tournex`.
3. Menú izquierdo: **Authentication → URL Configuration**.
4. En **Site URL** pon: `https://tournex-xxxx.vercel.app` (tu URL de Vercel).
5. En **Redirect URLs** agrega estas dos líneas (una por una):
   - `https://tournex-xxxx.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (esta deja que sigamos probando en local)
6. Click **"Save"** abajo.

---

## Parte F — (Opcional) Conectar tu dominio `tournex.app`

Si compras el dominio `tournex.app`:

1. En Vercel, dentro de tu proyecto: **Settings → Domains → Add**.
2. Escribe `tournex.app` → Add.
3. Vercel te muestra unos valores DNS (tipo A o CNAME).
4. Entra al panel de donde compraste el dominio (Namecheap, GoDaddy,
   Cloudflare…) y pega esos valores en la configuración DNS.
5. Espera ~10–60 minutos a que propague.
6. **Vuelve a Supabase (Parte E)** y reemplaza la URL de Vercel por
   `https://tournex.app` en Site URL + Redirect URLs.

> El dominio cuesta ~$15–20 USD/año. Vercel y Supabase siguen siendo gratis.

---

## Checklist

- [ ] Cuenta de GitHub creada
- [ ] Código subido a GitHub (o pedido a Claude que lo suba)
- [ ] Cuenta de Vercel creada y conectada con GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` pegadas en Vercel
- [ ] Deploy exitoso (tienes una URL `*.vercel.app` que abre)
- [ ] En Supabase: **Site URL** y **Redirect URLs** actualizados con la URL de Vercel
- [ ] Probaste entrar a la URL de Vercel y hacer login con magic-link → llegó al inbox y entró bien

Cuando termines el checklist, **escríbeme con el link de Vercel** y verificamos que:
- El magic-link redirige a la URL pública (no a localhost)
- Crear un torneo desde la URL pública funciona
- Compartir el link de inscripción se puede abrir desde otro celular

---

## Qué hago yo cuando me digas que ya está

- Reviso que los links públicos `/t/[slug]` y `/reg/[slug]` carguen rápido
- Verifico que Realtime funciona desde otro dispositivo
- Si algo no funciona, debuggeo con los logs de Vercel
- (Opcional) configuro un correo personalizado en Supabase (tipo `noreply@tournex.app`) en vez del genérico de Supabase
- (Opcional) configuro analytics y monitoring

Después de esto, **Tournex está oficialmente en producción** y puedes
mandar el link a clientes reales. 🚀
