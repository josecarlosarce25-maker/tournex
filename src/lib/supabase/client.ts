// Supabase client for use in the browser (Client Components).
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let _client: BrowserClient | null = null;

function realClient(): BrowserClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }
  _client = createBrowserClient<Database>(url, key);
  return _client;
}

// Cliente perezoso (lazy): NO se crea —ni se exige env— hasta el primer uso real.
// Así el prerender del build no truena si las env vars aún no están configuradas
// (p. ej. el primer deploy en Vercel). En el navegador las NEXT_PUBLIC_* ya están
// inlineadas, así que el cliente real se crea sin problema en runtime.
export function createClient(): BrowserClient {
  return new Proxy({} as BrowserClient, {
    get(_target, prop, receiver) {
      const client = realClient();
      const value = Reflect.get(client as object, prop, receiver);
      return typeof value === "function" ? value.bind(client) : value;
    },
  });
}
