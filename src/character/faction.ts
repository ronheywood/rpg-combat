import { Character } from './character.js';

function assertValidFactionName(faction: string): void {
  if (faction.trim().length === 0) {
    throw new Error('Faction name must not be empty or whitespace');
  }
}

export function joinFaction(character: Character, faction: string): Character {
  assertValidFactionName(faction);
  return new Character(
    character.health,
    character.level,
    character.damageSurvived,
    [...character.factions, faction],
    character.factionHistory,
  );
}

export function leaveFaction(character: Character, faction: string): Character {
  return new Character(
    character.health,
    character.level,
    character.damageSurvived,
    character.factions.filter((f) => f !== faction),
    character.factionHistory,
  );
}
