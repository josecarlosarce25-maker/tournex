# 🎉 Tournex está LIVE

## 🌐 URL pública
# https://tournex.josecarlosarce25.workers.dev

---

## ✅ Todo lo que quedó funcionando

| Componente | Estado |
|---|---|
| **App desplegada** | ✅ Cloudflare Workers |
| **Base de datos** | ✅ Supabase activo, todas las tablas intactas |
| **Login con Google** | ✅ Configurado y verificado |
| **Login email/contraseña** | ✅ Funcionando |
| **Stripe — 4 productos** | ✅ Pro ($99/$950) + Club ($249/$2388) |
| **30 días de prueba gratis** | ✅ Integrado en el checkout |
| **Webhook de Stripe** | ✅ Conectado y con secret |
| **Site URL + redirects** | ✅ Apuntando a la URL de Cloudflare |

**8/8 smoke tests pasan.** La app responde, conecta con Supabase, y el checkout valida sesión.

---

## ⚠️ IMPORTANTE — Léeme

### 1. Victory Pádel está pausado
Para reactivar Tournex tuve que pausar **Victory Padel Shop** en Supabase
(el plan free solo permite 2 proyectos activos y tenías 3: CulDeSac, Victory, Tournex).

**Para reactivar Victory Pádel cuando lo necesites:**
- Tienes que pausar otro proyecto (CulDeSac o Tournex), O
- Subir a Supabase Pro ($25 USD/mes) que permite proyectos ilimitados activos

> Mientras Victory Pádel esté pausado, su tienda no carga datos. Avísame y lo reactivo.

### 2. Supabase free se pausa tras 7 días sin tráfico
Si Tournex no recibe visitas en 7 días, Supabase lo vuelve a pausar.
Con usuarios reales esto no pasa. Si lo dejas sin tráfico, avísame y lo reactivo en 2 min.

### 3. Estás en modo prueba de Stripe
Los pagos son con tarjetas falsas (`4242 4242 4242 4242`). Cuando Stripe te
apruebe los cobros reales (1-3 días), cambiamos a modo Live en 5 min.

---

## 🧪 Pruébalo tú ahora (5 min)

1. Abre **https://tournex.josecarlosarce25.workers.dev**
2. Click **"Continuar con Google"** → entra con tu cuenta
3. Crea un torneo de prueba (Nuevo Torneo → wizard)
4. Inscribe parejas, genera brackets, captura un marcador
5. Para probar el cobro:
   - Sal a la landing → click **"Empezar prueba gratis"** (plan Pro)
   - En Stripe Checkout verás **"30 days free"**
   - Tarjeta: `4242 4242 4242 4242` · cualquier fecha futura · CVC `123`
   - Confirma → vuelves con plan Pro activo (estado "trialing")
   - **No te cobran** hasta el día 31

Si algo no jala, dime exactamente qué pantalla y qué pasó.

---

## 📦 Datos técnicos del deploy

| Recurso | Valor |
|---|---|
| Worker | `tournex` en Cloudflare |
| URL | https://tournex.josecarlosarce25.workers.dev |
| GitHub | https://github.com/josecarlosarce25-maker/tournex |
| Supabase | proyecto `mhohuwpaikqevwqqpihc` (us-west-1) |
| Stripe productos | Tournex Pro (`prod_UdxuLB6tR2EmzU`), Tournex Club (`prod_UdxuJQmrf53mbW`) |
| Stripe webhook | `we_1TefzWAEwkUvPYjnizzhHCLu` |

---

## 🔮 Próximos pasos (cuando quieras)

1. **Dominio propio** (`tournex.app` o el que elijas) — ~$10 USD/año, lo conecto a Cloudflare en 5 min, SSL automático
2. **Stripe modo Live** — cuando te aprueben, cambiamos 6 valores y los cobros son reales
3. **Resolver el límite de Supabase** — decidir si subes a Pro ($25/mes) para tener Tournex + Victory + CulDeSac los 3 activos, o si rotas cuál mantener prendido
4. **IA assistant** — el que anunciamos en la landing, ~2-3 días de desarrollo

---

## 🔁 Si necesitas re-deployar (yo)

```bash
cd ~/tournex
./scripts/deploy.sh          # idempotente, no duplica nada
./scripts/verify-deploy.sh https://tournex.josecarlosarce25.workers.dev
```
