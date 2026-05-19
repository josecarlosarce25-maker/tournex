# Guía de Tournex — para José Carlos

Este documento te explica, **en español y sin tecnicismos**, qué estamos
construyendo, cómo funciona y qué pasos siguen para publicar la app en internet.
No necesitas saber programar para leerlo. Está pensado para que **entiendas**,
no para que codifiques.

---

## Parte 1 — Conceptos básicos (qué es todo esto)

Antes de los pasos, unas definiciones rápidas. Cada vez que veas una palabra
rara, búscala aquí.

| Palabra | Qué significa, en simple |
|---|---|
| **Código** | Las instrucciones escritas que le dicen a la computadora qué hacer. Tournex es, en el fondo, miles de líneas de instrucciones. |
| **UI** (interfaz) | "User Interface". Es **todo lo que el usuario ve y toca**: los botones, los colores, las pantallas, los formularios. La UI es la cara de la app. |
| **Frontend** | La parte de la app que corre **en el teléfono o navegador** del usuario. Es la UI + lo que pasa cuando le picas a un botón. |
| **Backend** | La parte que corre **en un servidor** (una computadora en internet). Guarda los datos, hace cuentas, y responde cuando el frontend pide algo. |
| **Base de datos** | Donde se **guardan los datos** de forma permanente: torneos, parejas, resultados. Como un Excel gigante y muy ordenado. |
| **Servidor** | Una computadora encendida 24/7 en internet que atiende a los usuarios. |
| **Framework** | Un "kit de construcción" de código ya hecho que acelera el desarrollo. Nosotros usamos uno llamado **Next.js**. |
| **Deploy / publicar** | Subir la app a internet para que cualquiera la pueda usar desde una dirección web. |
| **Repositorio (repo)** | La carpeta con todo el código del proyecto, con historial de cambios. La nuestra está en `~/tournex`. |

> **La idea grande:** Tournex tiene un **frontend** (lo que ves) y un
> **backend con base de datos** (donde viven los datos). El prototipo viejo
> (el archivo HTML) **solo tenía frontend** — por eso los datos se borraban y
> los links no servían. Lo que estamos construyendo ahora sí tiene las dos
> partes.

---

## Parte 2 — Qué hemos construido hasta ahora

El proyecto vive en la carpeta `~/tournex` de tu computadora. Esto ya está hecho:

- ✅ **El esqueleto de la app** (Next.js + TypeScript). Es la base sobre la que
  se monta todo.
- ✅ **El sistema de diseño** — los colores de Tournex (negro + verde lima), las
  tipografías, los estilos. Todo lo visual parte de aquí.
- ✅ **El "motor" del torneo** — toda la lógica que arma brackets, calcula
  horarios, lleva las tablas de posiciones, maneja la liga semanal y valida los
  marcadores. Es la parte más complicada y ya quedó.
- ✅ **El esquema de la base de datos** — el plano de cómo se guardan los datos
  en Supabase (archivo `supabase/migrations/0001_initial.sql`).
- ✅ **La conexión con Supabase** — el código que conecta la app con la base de
  datos.
- ✅ **La página de inicio** (landing) — la página de bienvenida con la
  descripción y los precios.

### Qué falta (próximas sesiones)

- ⏳ Pantalla de inicio de sesión (login).
- ⏳ El "dashboard" — el panel donde ves tus torneos.
- ⏳ El asistente para crear torneos (los 3 pasos).
- ⏳ La pantalla de cada torneo (parejas, brackets, mesa de control, horarios).
- ⏳ Las páginas públicas: el link de inscripción y el link de resultados.

---

## Parte 3 — Pasos para publicar la app

Aquí viene lo importante. Son **5 etapas**. Algunas las hago yo, otras las haces
tú (porque requieren crear cuentas con tu correo). Te marco cada una.

### Etapa 1 — Terminar de construir la app `[ lo hago yo ]`

Seguimos en las próximas sesiones hasta que todas las pantallas estén listas.
No necesitas hacer nada aquí más que ir revisando lo que te muestro.

---

### Etapa 2 — Crear la base de datos en Supabase `[ lo haces tú, te guío ]`

**¿Qué es Supabase?**
Supabase es un servicio que nos da **tres cosas que la app necesita**, todo en
uno y **gratis** hasta que tengas muchos usuarios:

1. **La base de datos** — donde se guardan los torneos, parejas y resultados.
2. **El sistema de cuentas** (login) — para que los organizadores entren con su
   correo.
3. **Las actualizaciones en vivo** — lo que hace que un jugador vea el resultado
   en su teléfono apenas tú lo capturas.

**¿Por qué Supabase y no otra cosa?**
Porque hacer estas tres cosas desde cero tomaría meses. Supabase ya las tiene
resueltas, es gratis para empezar, y es de las opciones más usadas y confiables.
La alternativa sería contratar y administrar servidores nosotros — caro y
complicado.

**Pasos (cuando lleguemos aquí):**

1. Entra a **supabase.com** y crea una cuenta (con tu correo de Google sirve).
2. Dale a **"New Project"**. Ponle de nombre `tournex`. Elige una contraseña
   para la base de datos y **guárdala** en un lugar seguro.
3. Espera ~2 minutos a que se cree el proyecto.
4. En el menú izquierdo, entra a **"SQL Editor"** → **"New query"**.
5. Yo te paso el contenido del archivo `supabase/migrations/0001_initial.sql`.
   Lo copias, lo pegas ahí, y le das **"Run"**. Esto crea todas las tablas de
   golpe. (Una "tabla" es como una hoja del Excel: una para torneos, otra para
   parejas, etc.)
6. Entra a **Project Settings → API**. Ahí verás dos datos:
   - **Project URL** (una dirección que termina en `.supabase.co`)
   - **anon public key** (una llave larga de letras y números)
7. Me pasas esos dos datos. Con eso conecto la app a tu base de datos.

> Esos dos datos van en un archivo llamado `.env.local` que **nunca** se sube a
> internet — son las llaves de tu casa. La app las lee pero quedan privadas.

---

### Etapa 3 — Probar la app en tu computadora `[ lo hacemos juntos ]`

Antes de publicar, la probamos "en local" (solo en tu compu). Yo levanto la app
con un comando y tú la abres en tu navegador en una dirección como
`localhost:3000`. Aquí revisamos que todo funcione: crear un torneo, inscribir
parejas, generar brackets, capturar resultados.

`localhost` = tu propia computadora. Nadie más la puede ver todavía.

---

### Etapa 4 — Publicar la app con Vercel `[ lo haces tú, te guío ]`

**¿Qué es Vercel?**
Vercel es el servicio que **pone tu app en internet**. Toma el código y lo deja
funcionando en una dirección web pública, a la que cualquiera puede entrar. Es
de los mismos creadores de Next.js (el framework que usamos), así que funcionan
perfecto juntos. También es **gratis** para empezar.

**¿Por qué Vercel?**
Porque publicar una app moderna a mano es complicado. Vercel lo hace en un par
de clics, y cada vez que mejoremos algo en el código, se actualiza solo.

**Pasos (cuando lleguemos aquí):**

1. Subimos el código a **GitHub** (un lugar donde se guarda el código en la
   nube — yo te ayudo con esto).
2. Entra a **vercel.com**, crea cuenta, y conéctala con tu GitHub.
3. Le das **"Import"** al proyecto `tournex`.
4. Vercel te pide las **variables de entorno** — ahí pegas los mismos dos datos
   de Supabase (la URL y la llave) de la Etapa 2.
5. Le das **"Deploy"**. En ~2 minutos tu app está viva en una dirección como
   `tournex.vercel.app`.

---

### Etapa 5 — Conectar tu dominio `tournex.app` `[ opcional, lo haces tú ]`

Si quieres que la app esté en `tournex.app` en vez de `tournex.vercel.app`:

1. Compra el dominio `tournex.app` (en Namecheap, GoDaddy, Cloudflare, etc. —
   cuesta ~$15-20 USD al año).
2. En Vercel, entra al proyecto → **Settings → Domains** → agrega `tournex.app`.
3. Vercel te dice qué configurar en tu proveedor del dominio. Es copiar y pegar
   un par de valores.

---

## Resumen visual

```
ETAPA 1   Construir la app          → lo hago yo (varias sesiones)
ETAPA 2   Base de datos (Supabase)  → tú creas la cuenta, yo conecto
ETAPA 3   Probar en local           → juntos
ETAPA 4   Publicar (Vercel)         → tú creas la cuenta, yo configuro
ETAPA 5   Dominio tournex.app       → opcional, tú lo compras
```

Tu trabajo se reduce a: **crear 2-3 cuentas gratis y pasarme unas llaves.**
Todo lo demás es código, y de eso me encargo yo.

---

## Glosario express (para cuando algo suene raro)

- **Next.js** — el framework (kit de construcción) de la app.
- **TypeScript** — el lenguaje en que está escrito el código.
- **Tailwind** — la herramienta con la que se le da estilo (colores, tamaños).
- **Supabase** — la base de datos + login + tiempo real.
- **Vercel** — donde se publica la app para que esté en internet.
- **GitHub** — donde se guarda el código en la nube, con historial.
- **`.env.local`** — archivo privado con las llaves de Supabase.
- **localhost** — tu computadora, cuando pruebas la app antes de publicarla.
- **slug** — la parte final de un link, ej. `tournex.app/t/`**`copa-verano-2026`**.

¿Una palabra no está aquí? Pídemela y la agrego.
