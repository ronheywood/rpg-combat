import { Character } from '../character/index.js';

function assertValidAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Amount must be a finite non-negative number');
  }
}

export function dealDamage(attacker: Character, target: Character, amount: number): Character {
  if (attacker === target) throw new Error('A character cannot deal damage to itself');
  assertValidAmount(amount);

  const newHealth = Math.max(0, target.health - amount);
  return new Character(newHealth, target.level);
}

export function heal(character: Character, amount: number): Character {
  if (!character.alive) throw new Error('Dead characters cannot heal');
  assertValidAmount(amount);

  const maxHealth = 1000;
  const newHealth = Math.min(maxHealth, character.health + amount);
  return new Character(newHealth, character.level);
}
