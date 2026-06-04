import { describe, expect, it } from 'vitest';
import { createCharacter } from '../character/index.js';
import { dealDamage, heal } from '../combat/index.js';

describe('damage state persistence', () => {
  it('accumulates damageSurvived across damage and heal cycles', () => {
    // Given a hero at level 1 with 1000 health
    const attacker = createCharacter();
    let hero = createCharacter();

    // When the attacker deals 500 damage
    hero = dealDamage(attacker, hero, 500);
    expect(hero.health).toBe(500);
    expect(hero.damageSurvived).toBe(500);

    // And the hero heals for 500
    hero = heal(hero, 500);
    expect(hero.health).toBe(1000);
    expect(hero.damageSurvived).toBe(500); // healing does not reset damage survived

    // And the attacker deals 500 damage a second time
    hero = dealDamage(attacker, hero, 500);

    // Then the hero has 500 health and has sustained 1000 damage in total
    expect(hero.health).toBe(500);
    expect(hero.damageSurvived).toBe(1000);
  });
});
