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

describe('heal', () => {
  it('increases character health by the heal amount', () => {
    const damaged = new Character(800, 1);
    expect(heal(damaged, 100).health).toBe(900);
  });

  it('returns a new Character instance, not the original', () => {
    const damaged = new Character(800, 1);
    expect(heal(damaged, 100)).not.toBe(damaged);
  });

  it('health cannot exceed 1000', () => {
    const damaged = new Character(950, 1);
    expect(heal(damaged, 200).health).toBe(1000);
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
