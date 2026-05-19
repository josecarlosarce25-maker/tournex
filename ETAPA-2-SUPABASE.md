# Etapa 2 — Conectar Supabase (paso a paso)

Sigue esto tal cual. Toma ~10 minutos. No necesitas saber programar.
Al final me pasas **2 datos** y yo conecto la app a la base de datos real.

> **¿Qué logras con esto?** Que los torneos, parejas y resultados dejen de vivir
> solo en tu navegador y vivan en internet. Es lo que hace que los links de
> inscripción y resultados funcionen desde **cualquier teléfono**.

---

## Parte A — Crear el proyecto en Supabase

1. Entra a **https://supabase.com** y haz clic en **"Start your project"**.
2. Crea tu cuenta — lo más fácil es **"Continue with Google"** con tu correo.
3. Ya dentro, haz clic en **"New project"**.
4. Llena el formulario:
   - **Name:** `tournex`
   - **Database Password:** crea una contraseña y **guárdala en un lugar
     seguro** (notas del teléfono, gestor de contraseñas). La vas a necesitar
     si algún día hay que tocar la base de datos a mano.
   - **Region:** elige **`West US (North California)`** — es la más cercana a
     Guadalajara, así la app va rápida.
5. Haz clic en **"Create new project"** y **espera ~2 minutos** mientras
   Supabase lo prepara. Verás una barra de carga.

---

## Parte B — Crear las tablas (correr el SQL)

Esto crea las "hojas" donde se guardan torneos, parejas, partidos, etc.

1. En el menú de la izquierda, busca el ícono **"SQL Editor"** (parece `</>`).
2. Haz clic en **"New query"** (arriba a la derecha).
3. Abre en tu computadora este archivo:
   `~/tournex/supabase/migrations/0001_initial.sql`
4. **Selecciona TODO** el contenido del archivo (Cmd+A) y **cópialo** (Cmd+C).
5. **Pégalo** en el recuadro grande del SQL Editor (Cmd+V).
6. Haz clic en el botón verde **"Run"** (abajo a la derecha, o Cmd+Enter).
7. Debe aparecer abajo un mensaje verde tipo **"Success. No rows returned"**.
   ✅ Eso significa que las tablas se crearon bien.

> Si sale un error en rojo, **no borres nada** — sácale captura de pantalla y
> pásamela, lo reviso.

---

## Parte C — Copiar las 2 llaves

Estos son los datos que conectan la app con tu base de datos.

1. En el menú de la izquierda, abajo, haz clic en **"Project Settings"**
   (el ícono de engrane ⚙️).
2. Dentro, haz clic en **"API"**.
3. Vas a ver dos cosas que necesito. Cópialas:
   - **Project URL** — una dirección que termina en `.supabase.co`
   - **Project API keys → `anon` `public`** — una llave larga de letras y
     números. (Copia la que dice **anon public**, NO la `service_role`.)

---

## Parte D — Pasármelas

Mándame los 2 datos en el chat, así:

```
URL: https://xxxxxxxxxxxx.supabase.co
ANON KEY: eyJhbGciOi... (la llave larga completa)
```

> **¿Es seguro pasarme esto?** Sí. La `anon key` está hecha para vivir en el
> navegador — está protegida por reglas de seguridad que ya quedaron escritas
> en el SQL (cada organizador solo ve lo suyo; las páginas públicas solo
> pueden leer e inscribir). La `service_role` (esa NO me la pases) sí es
> sensible — déjala en Supabase.

---

## Qué hago yo cuando me pases las llaves

1. Creo el archivo `.env.local` con tus 2 datos (queda privado, no se sube a
   internet — ya está protegido).
2. Reescribo la "capa de datos" para que la app lea y escriba en Supabase en
   vez del navegador. **La app se ve igual** — solo cambia dónde viven los datos.
3. Activo el **login real** con link mágico al correo (sin contraseñas).
4. Activo los **resultados en vivo** (Realtime).
5. Pruebo todo y te muestro.
6. Después seguimos con la **Etapa 4 — publicar en Vercel** (ahí la app queda
   en internet con una dirección pública).

---

## Checklist — marca conforme avanzas

- [ ] Cuenta de Supabase creada
- [ ] Proyecto `tournex` creado (esperé los 2 minutos)
- [ ] Contraseña de la base de datos guardada en lugar seguro
- [ ] SQL pegado y corrido → salió "Success"
- [ ] Copié la **Project URL**
- [ ] Copié la **anon public key**
- [ ] Se las pasé a Claude en el chat

Cuando termines el checklist, escríbeme aquí y seguimos. 🚀
