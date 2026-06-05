import type { Character } from './character.js';

export class Faction {
  public readonly memberIds: readonly string[];

  constructor(
    public readonly name: string,
    memberIds: readonly string[] = [],
  ) {
    if (name.trim().length === 0) {
      throw new Error('Faction name must not be empty or whitespace');
    }
    this.memberIds = [...new Set(memberIds)];
  }
}

export function joinFaction(character: Character, faction: Faction): Faction {
  if (faction.memberIds.includes(character.id)) return faction;
  return new Faction(faction.name, [...faction.memberIds, character.id]);
}

export function leaveFaction(character: Character, faction: Faction): Faction {
  if (!faction.memberIds.includes(character.id)) return faction;
  return new Faction(
    faction.name,
    faction.memberIds.filter((id) => id !== character.id),
  );
}

export function areAllies(a: Character, b: Character, factions: readonly Faction[] = []): boolean {
  if (a.id === b.id) return false;
  return factions.some((f) => f.memberIds.includes(a.id) && f.memberIds.includes(b.id));
}
