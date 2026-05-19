"use client";

import { useState } from "react";
import {
  Card,
  Input,
  Badge,
  Avatar,
  EmptyState,
} from "@/components/ui/primitives";
import { useContacts } from "@/lib/data/use-store";
import { initials } from "@/lib/utils";

export default function ContactsPage() {
  const contacts = useContacts();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.category ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").includes(q),
      )
    : contacts;

  if (contacts.length === 0) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold">Contactos</h1>
        <Card className="mt-5">
          <EmptyState
            icon="👥"
            title="Sin contactos todavía"
            body="Cada jugador que registres en un torneo se guarda aquí automáticamente."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Contactos</h1>
      <p className="mb-5 text-sm text-tx3">
        {contacts.length} jugadores en tu base
      </p>

      <div className="mb-5 max-w-sm">
        <Input
          placeholder="🔍 Buscar por nombre, categoría o teléfono…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-br text-left">
              <th className="px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-tx3">
                Nombre
              </th>
              <th className="px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-tx3">
                Teléfono
              </th>
              <th className="px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-tx3">
                Categoría
              </th>
              <th className="px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-tx3">
                Torneos
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-br last:border-0">
                <td className="px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar initials={initials(c.name)} />
                    <span className="font-semibold">{c.name}</span>
                  </div>
                </td>
                <td className="px-3.5 py-3 text-sm text-tx3">
                  {c.phone || "—"}
                </td>
                <td className="px-3.5 py-3">
                  {c.category ? <Badge>{c.category}</Badge> : "—"}
                </td>
                <td className="px-3.5 py-3 text-[13px] text-tx3">
                  {c.tournamentsPlayed.join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-tx3">
            Sin resultados para “{query}”
          </p>
        )}
      </Card>
    </div>
  );
}
