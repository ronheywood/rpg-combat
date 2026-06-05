import { Character } from '../character/character.js';

export function damageThreshold(level: number): number {
  return ((level * (level + 1)) / 2) * 1000;
}

export function factionThreshold(level: number): number {
  return 3 * level;
}

export function applyLevelUp(character: Character): Character {
  if (!character.alive) return character;
  let current = character;
  while (current.level < 10) {
    const n = current.level;
    const damageOk = current.damageSurvived >= damageThreshold(n);
    const factionOk = current.factionsEverJoined.length >= factionThreshold(n);
    if (!damageOk && !factionOk) break;
    current = new Character(
      current.health,
      n + 1,
      current.damageSurvived,
      current.id,
      current.factionsEverJoined,
    );
  }
  return current;
}
