import { describe, expect, it } from 'vitest';
import { Character, createCharacter } from '../character/index.js';
import { dealDamage, heal } from './combat.js';

describe('dealDamage', () => {
  it('reduces target health by the damage amount', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(dealDamage(attacker, target, 100).health).toBe(900);
  });

  it('returns a new Character instance, not the original target', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(dealDamage(attacker, target, 100)).not.toBe(target);
  });

  it('health cannot go below 0', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(dealDamage(attacker, target, 2000).health).toBe(0);
  });

  it('character dies when health reaches 0', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(dealDamage(attacker, target, 1000).alive).toBe(false);
  });

  it('preserves target level after damage', () => {
    const attacker = createCharacter();
    const target = new Character(1000, 3);
    expect(dealDamage(attacker, target, 100).level).toBe(3);
  });

  it('throws when attacker and target are the same instance', () => {
    const character = createCharacter();
    expect(() => dealDamage(character, character, 100)).toThrow();
  });

  it('does not treat same-stats different instances as self', () => {
    const a = createCharacter();
    const b = createCharacter();
    expect(() => dealDamage(a, b, 100)).not.toThrow();
  });

  it('throws on negative damage amount', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(() => dealDamage(attacker, target, -50)).toThrow();
  });

  it('throws on NaN damage amount', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(() => dealDamage(attacker, target, NaN)).toThrow();
  });

  it('throws on Infinity damage amount', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(() => dealDamage(attacker, target, Infinity)).toThrow();
  });
});

describe('dealDamage — level modifier', () => {
  it('damage is unchanged when level gap is less than 5', () => {
    const attacker = new Character(1000, 1);
    const target = new Character(1000, 4);
    expect(dealDamage(attacker, target, 100).health).toBe(900);
  });

  it('damage is halved when target is exactly 5 levels above attacker', () => {
    const attacker = new Character(1000, 1);
    const target = new Character(1000, 6);
    expect(dealDamage(attacker, target, 100).health).toBe(950);
  });

  it('damage is halved when target is more than 5 levels above attacker', () => {
    const attacker = new Character(1000, 1);
    const target = new Character(1000, 10);
    expect(dealDamage(attacker, target, 100).health).toBe(950);
  });

  it('damage is increased by 50% when attacker is exactly 5 levels above target', () => {
    const attacker = new Character(1000, 6);
    const target = new Character(1000, 1);
    expect(dealDamage(attacker, target, 100).health).toBe(850);
  });

  it('damage is unchanged when level gap is 4 (attacker above target)', () => {
    const attacker = new Character(1000, 5);
    const target = new Character(1000, 1);
    expect(dealDamage(attacker, target, 100).health).toBe(900);
  });
});

describe('dealDamage — damageSurvived', () => {
  it('tracks damageSurvived when character survives', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(dealDamage(attacker, target, 300).damageSurvived).toBe(300);
  });

  it('does not increment damageSurvived when character is killed', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(dealDamage(attacker, target, 1500).damageSurvived).toBe(0);
  });

  it('accumulates damageSurvived across multiple hits', () => {
    const attacker = createCharacter();
    let target = createCharacter();
    target = dealDamage(attacker, target, 300);
    target = dealDamage(attacker, target, 200);
    expect(target.damageSurvived).toBe(500);
  });

  it('damageSurvived uses actual damage after level modifier', () => {
    const attacker = new Character(1000, 1);
    const target = new Character(1000, 6);
    expect(dealDamage(attacker, target, 100).damageSurvived).toBe(50);
  });
});

describe('heal', () => {
  it('increases character health by the heal amount', () => {
    const damaged = new Character(800, 1);
    expect(heal(damaged, 100).health).toBe(900);
  });

  it('returns a new Character instance, not the original', () => {
    const damaged = new Character(800, 1);
    expect(heal(damaged, 100)).not.toBe(damaged);
  });

  it('health cannot exceed 1000 for level 1-5 characters', () => {
    const damaged = new Character(950, 1);
    expect(heal(damaged, 200).health).toBe(1000);
  });

  it('health cannot exceed 1500 for level 6+ characters', () => {
    const damaged = new Character(1400, 6);
    expect(heal(damaged, 200).health).toBe(1500);
  });

  it('heal at full health stays at full health', () => {
    const full = createCharacter();
    expect(heal(full, 100).health).toBe(1000);
  });

  it('preserves character level after healing', () => {
    const damaged = new Character(800, 3);
    expect(heal(damaged, 100).level).toBe(3);
  });

  it('dead characters cannot heal', () => {
    const attacker = createCharacter();
    let target = createCharacter();
    target = dealDamage(attacker, target, 1000);
    expect(() => heal(target, 100)).toThrow();
  });

  it('throws on negative heal amount', () => {
    const character = new Character(800, 1);
    expect(() => heal(character, -50)).toThrow();
  });

  it('throws on NaN heal amount', () => {
    const character = new Character(800, 1);
    expect(() => heal(character, NaN)).toThrow();
  });

  it('throws on Infinity heal amount', () => {
    const character = new Character(800, 1);
    expect(() => heal(character, Infinity)).toThrow();
  });
});
