// React hooks for the Supabase-backed store.
//
// Each hook:
//   1. Loads its data on mount.
//   2. Subscribes to Supabase Realtime so the UI auto-updates when something
//      changes anywhere (a public registration, a score being captured…).
//   3. Re-fetches on auth state changes.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as store from "./store";
import type { Tournament, Contact, Organizer } from "@/lib/types";

const EMPTY_TOURNAMENTS: Tournament[] = [];
const EMPTY_CONTACTS: Contact[] = [];

/** Shared helper: fetch + subscribe to realtime + re-fetch on changes. */
function useLiveData<T>(
  fetcher: () => Promise<T>,
  channelName: string,
  tables: { table: string; filter?: string }[],
  fallback: T,
): { data: T; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);

  // Keep ref pointing at the latest fetcher without mutating during render.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const reload = useCallback(() => {
    fetcherRef.current().then((d) => {
      if (mounted.current) setData(d);
    });
  }, []);

  useEffect(() => {
    mounted.current = true;
    // Loading is already true from the initial useState(true). We only need
    // to flip it to false once the first fetch resolves.
    fetcherRef.current().then((d) => {
      if (!mounted.current) return;
      setData(d);
      setLoading(false);
    });

    // Subscribe to Realtime on the configured tables. Use a unique channel
    // name per effect run so React StrictMode's double-mount doesn't collide
    // with itself ("cannot add postgres_changes callbacks after subscribe()").
    const uniqueChannelName =
      channelName + "-" + Math.random().toString(36).slice(2, 8);
    const channel = store.supabase.channel(uniqueChannelName);
    for (const t of tables) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: t.table,
          filter: t.filter,
        },
        () => reload(),
      );
    }
    channel.subscribe();

    return () => {
      mounted.current = false;
      store.supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  return { data, loading, reload };
}

/** Signed-in organizer. `null` while loading or signed out. */
export function useUser() {
  const [user, setUser] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const u = await store.getUser();
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    }
    load();
    const { data: sub } = store.supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export function useTournaments() {
  const { data } = useLiveData(
    () => store.listTournaments(),
    "tournaments-list",
    [{ table: "tournaments" }, { table: "teams" }],
    EMPTY_TOURNAMENTS,
  );
  return data;
}

export function useTournament(id: string | undefined) {
  const { data } = useLiveData(
    () => (id ? store.getTournament(id) : Promise.resolve(null)),
    `tournament-${id ?? "none"}`,
    id
      ? [
          { table: "tournaments", filter: `id=eq.${id}` },
          { table: "teams", filter: `tournament_id=eq.${id}` },
        ]
      : [],
    null as Tournament | null,
  );
  return data;
}

export function useContacts() {
  const { data } = useLiveData(
    () => store.listContacts(),
    "contacts-list",
    [{ table: "contacts" }],
    EMPTY_CONTACTS,
  );
  return data;
}

export { store };
