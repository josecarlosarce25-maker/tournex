import { FriendGroupsManager } from "@/components/ranking/friend-groups-manager";

export default function GruposPage() {
  return (
    <div>
      <div className="mb-7">
        <p className="font-mono text-xs uppercase tracking-widest text-tx3">
          Comunidad
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Rankings con amigos
        </h1>
      </div>
      <FriendGroupsManager />
    </div>
  );
}
