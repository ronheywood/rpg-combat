import { Character } from '../character/index.js';

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

export function dealDamage(attacker: Character, target: Character, amount: number): Character {
  if (attacker.id === target.id) throw new Error('A character cannot deal damage to itself');
  assertValidAmount(amount);

  const actualDamage = amount * levelModifier(attacker, target);
  const newHealth = Math.max(0, target.health - actualDamage);
  const survived = newHealth > 0;
  const newDamageSurvived = survived ? target.damageSurvived + actualDamage : target.damageSurvived;

  return new Character(newHealth, target.level, newDamageSurvived, target.id);
}

export function heal(character: Character, amount: number): Character {
  if (!character.alive) throw new Error('Dead characters cannot heal');
  assertValidAmount(amount);

  const newHealth = Math.min(character.maxHealth, character.health + amount);
  return new Character(newHealth, character.level, character.damageSurvived, character.id);
}
