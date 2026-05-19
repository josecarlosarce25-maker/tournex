# Plan de lanzamiento — Tournex

Esta es la ruta completa para dejar Tournex publicado en internet, con todas
las features finales y listo para usuarios reales.

> **Lo que ya está hecho (no te preocupes por esto):** auth con magic-link,
> base de datos en Supabase, motor de torneos, brackets, marcadores con
> colores, links de inscripción/resultados funcionales, filtros por categoría,
> rediseño premium, etc.

---

## Fase 1 — Features finales (yo construyo)

Estos son los pendientes antes de subir. Tú decides cuáles incluir:

### 1.1 Login con Google `~1 hora` `costo: $0`
- Botón "Continuar con Google" en /login
- Yo agrego el código
- Tú creas el OAuth Client en Google Cloud (te paso guía) y me pasas 2 valores
- Se prende un switch en Supabase y listo

### 1.2 Early bird / preventa `~30 min` `costo: $0`
- Wizard pregunta precio preventa + fecha en que termina
- Página de inscripción muestra automáticamente el precio según hoy
- Mensaje de WhatsApp incluye "Preventa $X hasta DD/MM"

### 1.3 Asistente IA (opcional) `~2-3 días` `costo: ~$15-45 USD/mes`
- Chat lateral en cada torneo
- El organizador habla en español natural, la IA hace los cambios
- Puede: agregar/quitar parejas, mover categorías, regenerar brackets, capturar
  resultados, dar análisis
- Necesitas: cuenta en console.anthropic.com con tarjeta
- Lo metes al precio del plan Pro/Club para que se pague solo

### 1.4 MercadoPago — pagos integrados `~1-2 días` `costo: 3.49% por transacción`
- Solo para el plan Club ($249/mes)
- Plan Free y Pro siguen con el modelo actual (link directo del organizador)
- En Club: el jugador paga adentro de Tournex, el dinero cae directo a la
  cuenta del organizador en MercadoPago, Tournex agrega un fee chico ($5-10
  MXN por inscripción) como tu margen
- Necesitas: cuenta empresarial de MercadoPago (gratis, requiere RFC)

### 1.5 PWA — "instalable" en celular `~medio día` `costo: $0`
- Los jugadores entran a tournex.app desde su celular y les sale
  "Agregar a pantalla de inicio"
- Queda como ícono igual que una app, sin barra de Chrome, pantalla completa
- Notificaciones push opcionales
- 95% del feeling de una app nativa sin App Store

---

## Fase 2 — Subir el código a GitHub

`~10 minutos` `costo: $0`

- Cuenta gratis en github.com (con tu Gmail)
- **Yo subo el código por ti** con un comando — solo necesito que tengas la cuenta
- El repo queda **privado** (no público todavía)

---

## Fase 3 — Publicar en Vercel

`~15 minutos` `costo: $0` (hasta cierto tráfico, después $20 USD/mes)

- Cuenta gratis en vercel.com con tu GitHub
- Importas el proyecto Tournex
- Pegas las 2 llaves de Supabase como variables de entorno
- Click "Deploy" → en ~2 minutos la app está en `https://tournex-xxx.vercel.app`

📄 Guía detallada: **`ETAPA-4-VERCEL.md`**

---

## Fase 4 — Configuración post-deploy

`~5 minutos`

- En Supabase: actualizar **Site URL** y **Redirect URLs** con la URL pública de Vercel
- En Google Cloud (si activaste Google login): agregar la URL de Vercel a los Authorized Redirect URIs
- En MercadoPago (si activaste pagos): registrar webhook hacia `tournex.vercel.app/api/mp-webhook`

---

## Fase 5 — Dominio propio `opcional`

`~30 min` `costo: ~$15-20 USD/año`

- Compras `tournex.app` (o el dominio que prefieras) en Cloudflare/Namecheap/GoDaddy
- En Vercel → Settings → Domains → agregas tu dominio
- Vercel te dice qué pegar en el DNS de tu proveedor
- En ~1 hora `tournex.app` apunta a tu Vercel

---

## Resumen visual del plan

```
Fase  Qué                                      Tiempo total
────────────────────────────────────────────────────────────
1.1   Google login                             1 hora
1.2   Early bird                               30 min
1.3   IA assistant (opcional)                  2-3 días
1.4   MercadoPago (opcional)                   1-2 días
1.5   PWA                                      medio día
────────────────────────────────────────────────────────────
2     Subir a GitHub                           10 min
3     Deploy a Vercel                          15 min
4     Configurar URLs post-deploy              5 min
5     Dominio propio (opcional)                30 min + 1h DNS
```

**Tiempo mínimo para tener Tournex en vivo, sin IA ni MP:** ~3 horas de trabajo
combinado (mío + tuyo).
**Con todo el paquete completo:** ~1 semana repartida.

---

## ¿Y después del lanzamiento?

**Sí. Puedes seguir editando todo cuanto quieras.** Así funciona:

1. Yo hago cambios en el código (igual que ahora — en estas sesiones).
2. Subo los cambios a GitHub con un comando.
3. Vercel detecta el cambio automáticamente y **republica la app en ~2 minutos**.
4. Tus usuarios solo refrescan la página y ya ven la versión nueva.

**No hay "cerrar el sitio para mantenimiento"**. Los cambios se aplican sin
interrumpir a nadie. Si algo sale mal en un cambio nuevo, hay un botón en
Vercel que dice **"Rollback"** y vuelves a la versión anterior en 10 segundos.

Lo que se puede seguir haciendo después de lanzar:
- Arreglar bugs cuando aparezcan
- Agregar features nuevas (otro deporte, nuevos formatos…)
- Cambiar el diseño
- Cambiar precios o el copy de la landing
- Conectar nuevas integraciones (Stripe, Notion, etc.)
- Ver estadísticas de uso

Vas a poder volver a pedir ayuda en cualquier momento — el proyecto sigue
siendo tuyo, en tu computadora, igual que ahora.

---

## Mi recomendación de orden

**Mínimo viable para lanzar pronto:**
1. Google login (1 hora)
2. PWA (medio día)
3. Subir a GitHub + Vercel
4. **¡Live!** En menos de 2 días puedes mandar el link a tus primeros 5-10 organizadores.

**Después, con feedback real de usuarios:**
5. Early bird
6. MercadoPago (cuando ya tengas tracción y quieras monetizar)
7. IA assistant (el wow factor — agrégalo cuando ya tengas base de usuarios)
8. Dominio propio

**Por qué este orden:** lanzar rápido te da feedback real. Construir IA + MP
antes de tener usuarios te hace gastar tiempo en lo que tú crees que necesitan
en vez de lo que realmente piden.

---

## Decisión que necesito de ti

Dime qué quieres incluir en la primera ola antes del lanzamiento:

- [ ] Google login (recomendado)
- [ ] Early bird
- [ ] IA assistant
- [ ] MercadoPago
- [ ] PWA (recomendado)

Y yo te aviso por dónde empiezo.
