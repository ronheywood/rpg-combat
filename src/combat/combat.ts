import { Character } from '../character/index.js';
import type { Faction } from '../character/index.js';
import { areAllies } from '../character/index.js';

function assertValidAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Amount must be a finite non-negative number');
  }
}

function levelModifier(attacker: Character, target: Character): number {
  const gap = target.level - attacker.level;
  if (gap >= 5) return 0.5;
  if (gap <= -5) return 1.5;
  return 1.0;
}

function applyHeal(character: Character, amount: number): Character {
  const newHealth = Math.min(character.maxHealth, character.health + amount);
  return new Character(newHealth, character.level, character.damageSurvived, character.id);
}

export function dealDamage(
  attacker: Character,
  target: Character,
  amount: number,
  factions?: readonly Faction[],
): Character {
  if (attacker.id === target.id) throw new Error('A character cannot deal damage to itself');
  assertValidAmount(amount);
  if (areAllies(attacker, target, factions)) throw new Error('Allies cannot damage each other');

  const actualDamage = amount * levelModifier(attacker, target);
  const newHealth = Math.max(0, target.health - actualDamage);
  const survived = newHealth > 0;
  const newDamageSurvived = survived ? target.damageSurvived + actualDamage : target.damageSurvived;

  return new Character(newHealth, target.level, newDamageSurvived, target.id);
}

export function heal(character: Character, amount: number): Character {
  if (!character.alive) throw new Error('Dead characters cannot heal');
  assertValidAmount(amount);
  return applyHeal(character, amount);
}

export function allyHeal(
  healer: Character,
  target: Character,
  amount: number,
  factions: readonly Faction[],
): Character {
  if (healer.id === target.id) throw new Error('Use heal() for self-healing, not allyHeal()');
  assertValidAmount(amount);
  if (!healer.alive) throw new Error('Dead characters cannot heal others');
  if (!target.alive) throw new Error('Cannot heal a dead character');
  if (!areAllies(healer, target, factions))
    throw new Error('Characters must be allies to use allyHeal');
  return applyHeal(target, amount);
}
