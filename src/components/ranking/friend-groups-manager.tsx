// Friend-group management for the dashboard: create a private group, add
// players by search, share its ranking link.
"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/data/use-store";
import { toast } from "@/components/ui/toast";
import { Button, Modal, Input, EmptyState, Card } from "@/components/ui/primitives";
import type { FriendGroup, Player } from "@/lib/types";

export function FriendGroupsManager() {
  const [groups, setGroups] = useState<FriendGroup[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState<FriendGroup | null>(null);

  async function reload() {
    setGroups(await store.listFriendGroups());
  }
  useEffect(() => {
    let cancelled = false;
    store.listFriendGroups().then((g) => {
      if (!cancelled) setGroups(g);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function create() {
    if (!newName.trim()) return;
    const r = await store.createFriendGroup(newName.trim());
    if (!r.ok) {
      toast(r.error ?? "No se pudo crear", "error");
      return;
    }
    toast("Grupo creado 🎉");
    setNewName("");
    setCreating(false);
    reload();
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Grupos de amigos</h2>
          <p className="text-[13px] text-tx3">
            Rankings privados entre tu bola. Compite con quien tú quieras.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          + Crear grupo
        </Button>
      </div>

      {groups === null ? (
        <div className="h-24 animate-pulse rounded-card bg-bg2" />
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon="👥"
            title="Sin grupos todavía"
            body="Crea un grupo, agrega a tus amigos y compitan en su propio ranking privado."
            action={
              <Button onClick={() => setCreating(true)}>Crear mi primer grupo</Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.id} className="surface rounded-card p-5">
              <h3 className="font-bold">{g.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setAdding(g)}>
                  + Agregar jugador
                </Button>
                <a href={`/g/${g.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost">
                    Ver ranking ↗
                  </Button>
                </a>
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/g/${g.slug}`;
                  navigator.clipboard?.writeText(url);
                  toast("Link copiado ✓");
                }}
                className="mt-2 text-[11px] text-tx3 underline hover:text-tx"
              >
                Copiar link para compartir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {creating && (
        <Modal open onClose={() => setCreating(false)} title="Nuevo grupo de amigos" maxWidth="max-w-sm">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Los Cracks del Martes"
            autoFocus
          />
          <div className="mt-5 flex justify-end gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={create}>
              Crear
            </Button>
          </div>
        </Modal>
      )}

      {/* Add player modal */}
      {adding && (
        <AddPlayerModal
          group={adding}
          onClose={() => setAdding(null)}
        />
      )}
    </div>
  );
}

function AddPlayerModal({
  group,
  onClose,
}: {
  group: FriendGroup;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      const r = await store.searchPlayers(query);
      if (!cancelled) setResults(r);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query]);

  async function add(p: Player) {
    const r = await store.addPlayerToGroup(group.id, p.id);
    if (!r.ok) {
      toast(r.error?.includes("duplicate") ? "Ya está en el grupo" : (r.error ?? "Error"), "error");
      return;
    }
    setAdded((s) => new Set(s).add(p.id));
    toast(`${p.displayName} agregado`);
  }

  return (
    <Modal open onClose={onClose} title={`Agregar a ${group.name}`}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca por nombre…"
        autoFocus
      />
      <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto">
        {query.trim() && results.length === 0 && (
          <p className="py-4 text-center text-sm text-tx3">
            Sin jugadores con ese nombre. Aparecen aquí una vez que juegan un
            torneo.
          </p>
        )}
        {results.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-soft border border-hair bg-bg2 px-3 py-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime/10 text-xs font-bold text-lime">
              {p.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{p.displayName}</div>
              <div className="text-[11px] text-tx3">
                Nivel {p.rating}
                {p.state ? ` · ${p.state}` : ""}
              </div>
            </div>
            <Button
              size="sm"
              variant={added.has(p.id) ? "ghost" : "outline"}
              onClick={() => add(p)}
              disabled={added.has(p.id)}
            >
              {added.has(p.id) ? "✓ Agregado" : "Agregar"}
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
