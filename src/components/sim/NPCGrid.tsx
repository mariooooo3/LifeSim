import type { NPC } from "@/lib/simulation/types";
import { NpcCard } from "./NpcCard";

export interface NPCGridProps {
  npcs: readonly NPC[];
  selectedNpcId: string | null;
  onSelect: (id: string) => void;
}

export function NPCGrid({ npcs, selectedNpcId, onSelect }: NPCGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {npcs.map((npc) => (
        <NpcCard
          key={npc.id}
          npc={npc}
          active={selectedNpcId === npc.id}
          onClick={() => onSelect(npc.id)}
        />
      ))}
    </div>
  );
}
