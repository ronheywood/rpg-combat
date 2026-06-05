import { describe, expect, it } from 'vitest';
import { Character, createCharacter } from '../character/index.js';
import { Faction, joinFaction, leaveFaction } from '../character/index.js';
import { MagicalWeapon, HealingObject } from '../objects/index.js';
import { dealDamage, heal, allyHeal, useWeapon, healFromObject } from './combat.js';

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

  it('throws when attacker and target are the same character (same id)', () => {
    const character = createCharacter();
    expect(() => dealDamage(character, character, 100)).toThrow();
  });

  it('does not treat different characters as self even with same stats', () => {
    const a = createCharacter();
    const b = createCharacter();
    expect(() => dealDamage(a, b, 100)).not.toThrow();
  });

  it('preserves target id across immutable copies', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    const damaged = dealDamage(attacker, target, 100);
    expect(damaged.id).toBe(target.id);
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

  it('throws on invalid amount before checking ally status', () => {
    const a = createCharacter();
    let [, faction] = joinFaction(a, new Faction('Knights'));
    const b = createCharacter();
    faction = joinFaction(b, faction)[1];
    expect(() => dealDamage(a, b, NaN, [faction])).toThrow(/amount/i);
  });
});

describe('dealDamage — ally guard', () => {
  it('throws when attacker and target share a faction', () => {
    const a = createCharacter();
    let [, faction] = joinFaction(a, new Faction('Knights'));
    const b = createCharacter();
    faction = joinFaction(b, faction)[1];
    expect(() => dealDamage(a, b, 100, [faction])).toThrow();
  });

  it('does not throw when no factions argument is passed (backward compat)', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(() => dealDamage(attacker, target, 100)).not.toThrow();
  });

  it('does not throw when an empty factions array is passed', () => {
    const attacker = createCharacter();
    const target = createCharacter();
    expect(() => dealDamage(attacker, target, 100, [])).not.toThrow();
  });

  it('does not throw when characters share no faction', () => {
    const a = createCharacter();
    const b = createCharacter();
    const [, faction] = joinFaction(a, new Faction('Knights'));
    expect(() => dealDamage(a, b, 100, [faction])).not.toThrow();
  });

  it('allows damage after one character leaves the shared faction', () => {
    const a = createCharacter();
    let [, faction] = joinFaction(a, new Faction('Knights'));
    const b = createCharacter();
    faction = joinFaction(b, faction)[1];
    faction = leaveFaction(b, faction);
    expect(() => dealDamage(a, b, 100, [faction])).not.toThrow();
  });
});

describe('allyHeal', () => {
  it('heals target when both characters share a faction', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(800);
    faction = joinFaction(target, faction)[1];
    expect(allyHeal(healer, target, 100, [faction]).health).toBe(900);
  });

  it('health cannot exceed target maxHealth (1000 for level 1-5)', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(950);
    faction = joinFaction(target, faction)[1];
    expect(allyHeal(healer, target, 200, [faction]).health).toBe(1000);
  });

  it('health cannot exceed target maxHealth (1500 for level 6+)', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(1400, 6);
    faction = joinFaction(target, faction)[1];
    expect(allyHeal(healer, target, 200, [faction]).health).toBe(1500);
  });

  it('preserves target id after ally heal', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(800);
    faction = joinFaction(target, faction)[1];
    expect(allyHeal(healer, target, 100, [faction]).id).toBe(target.id);
  });

  it('preserves target damageSurvived after ally heal', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(800, 1, 200);
    faction = joinFaction(target, faction)[1];
    expect(allyHeal(healer, target, 100, [faction]).damageSurvived).toBe(200);
  });

  it('throws when healer is dead', () => {
    const healer = new Character(0);
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(800);
    faction = joinFaction(target, faction)[1];
    expect(() => allyHeal(healer, target, 100, [faction])).toThrow(/dead/i);
  });

  it('throws when target is dead', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(0);
    faction = joinFaction(target, faction)[1];
    expect(() => allyHeal(healer, target, 100, [faction])).toThrow(/dead/i);
  });

  it('throws when characters share no faction', () => {
    const healer = createCharacter();
    const target = new Character(800);
    expect(() => allyHeal(healer, target, 100, [])).toThrow(/allies/i);
  });

  it('throws when healer tries to heal themselves via allyHeal', () => {
    const healer = new Character(800);
    const [, faction] = joinFaction(healer, new Faction('Knights'));
    expect(() => allyHeal(healer, healer, 100, [faction])).toThrow(/self/i);
  });

  it('throws on invalid amount before checking ally status', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(800);
    faction = joinFaction(target, faction)[1];
    expect(() => allyHeal(healer, target, NaN, [faction])).toThrow(/amount/i);
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
    expect(heal(damaged, damaged, 100).health).toBe(900);
  });

  it('returns a new Character instance, not the original', () => {
    const damaged = new Character(800, 1);
    expect(heal(damaged, damaged, 100)).not.toBe(damaged);
  });

  it('health cannot exceed 1000 for level 1-5 characters', () => {
    const damaged = new Character(950, 1);
    expect(heal(damaged, damaged, 200).health).toBe(1000);
  });

  it('health cannot exceed 1500 for level 6+ characters', () => {
    const damaged = new Character(1400, 6);
    expect(heal(damaged, damaged, 200).health).toBe(1500);
  });

  it('heal at full health stays at full health', () => {
    const full = createCharacter();
    expect(heal(full, full, 100).health).toBe(1000);
  });

  it('preserves character level after healing', () => {
    const damaged = new Character(800, 3);
    expect(heal(damaged, damaged, 100).level).toBe(3);
  });

  it('throws when healer and target are different characters', () => {
    const character = new Character(800, 1);
    const other = new Character(800, 1);
    expect(() => heal(character, other, 100)).toThrow(/self-healing/i);
  });

  it('dead characters cannot heal', () => {
    const attacker = createCharacter();
    let target = createCharacter();
    target = dealDamage(attacker, target, 1000);
    expect(() => heal(target, target, 100)).toThrow();
  });

  it('throws on negative heal amount', () => {
    const character = new Character(800, 1);
    expect(() => heal(character, character, -50)).toThrow();
  });

  it('throws on NaN heal amount', () => {
    const character = new Character(800, 1);
    expect(() => heal(character, character, NaN)).toThrow();
  });

  it('throws on Infinity heal amount', () => {
    const character = new Character(800, 1);
    expect(() => heal(character, character, Infinity)).toThrow();
  });
});

describe('useWeapon', () => {
  it('deals the weapon fixed damage to the target', () => {
    const attacker = createCharacter();
    const weapon = new MagicalWeapon(150, 10);
    const target = createCharacter();
    const result = useWeapon(attacker, weapon, target);
    expect(result.target.health).toBe(850);
  });

  it('degrades weapon health by 1 per use', () => {
    const attacker = createCharacter();
    const weapon = new MagicalWeapon(100, 5);
    const target = createCharacter();
    expect(useWeapon(attacker, weapon, target).weapon.health).toBe(4);
  });

  it('returns a new weapon instance, not the original', () => {
    const attacker = createCharacter();
    const weapon = new MagicalWeapon(100, 5);
    const target = createCharacter();
    expect(useWeapon(attacker, weapon, target).weapon).not.toBe(weapon);
  });

  it('preserves target id after weapon damage', () => {
    const attacker = createCharacter();
    const weapon = new MagicalWeapon(100, 5);
    const target = createCharacter();
    expect(useWeapon(attacker, weapon, target).target.id).toBe(target.id);
  });

  it('updates damageSurvived on target (via shared damage pipeline)', () => {
    const attacker = createCharacter();
    const weapon = new MagicalWeapon(100, 5);
    const target = createCharacter();
    expect(useWeapon(attacker, weapon, target).target.damageSurvived).toBe(100);
  });

  it('applies level modifier (via shared damage pipeline)', () => {
    const veteran = new Character(1000, 6);
    const weapon = new MagicalWeapon(100, 5);
    const recruit = new Character(1000, 1);
    // veteran (level 6) attacks recruit (level 1) — 5+ gap → 1.5× damage = 150
    expect(useWeapon(veteran, weapon, recruit).target.health).toBe(850);
  });

  it('throws when weapon is destroyed', () => {
    const attacker = createCharacter();
    const weapon = new MagicalWeapon(100, 1, 0);
    const target = createCharacter();
    expect(() => useWeapon(attacker, weapon, target)).toThrow(/destroyed/i);
  });

  it('throws when attacker and target are the same character', () => {
    const character = createCharacter();
    const weapon = new MagicalWeapon(100, 5);
    expect(() => useWeapon(character, weapon, character)).toThrow();
  });

  it('throws when attacker and target are allies', () => {
    const a = createCharacter();
    let [, faction] = joinFaction(a, new Faction('Knights'));
    const b = createCharacter();
    faction = joinFaction(b, faction)[1];
    const weapon = new MagicalWeapon(100, 5);
    expect(() => useWeapon(a, weapon, b, [faction])).toThrow();
  });

  it('allows weapon attack after target leaves the faction', () => {
    const a = createCharacter();
    let [, faction] = joinFaction(a, new Faction('Knights'));
    const b = createCharacter();
    faction = joinFaction(b, faction)[1];
    faction = leaveFaction(b, faction);
    const weapon = new MagicalWeapon(100, 5);
    expect(() => useWeapon(a, weapon, b, [faction])).not.toThrow();
  });

  it('weapon becomes destroyed after maxHealth uses', () => {
    const attacker = createCharacter();
    const weapon = new MagicalWeapon(10, 3);
    const target = createCharacter();
    const r1 = useWeapon(attacker, weapon, target);
    const r2 = useWeapon(attacker, r1.weapon, target);
    const r3 = useWeapon(attacker, r2.weapon, target);
    expect(r3.weapon.destroyed).toBe(true);
    expect(() => useWeapon(attacker, r3.weapon, target)).toThrow(/destroyed/i);
  });
});

describe('healFromObject', () => {
  it('heals character from a healing object', () => {
    const character = new Character(800);
    const object = new HealingObject(200);
    expect(healFromObject(character, object, 100).character.health).toBe(900);
  });

  it('healing is capped at character maxHealth', () => {
    const character = new Character(950);
    const object = new HealingObject(500);
    expect(healFromObject(character, object, 200).character.health).toBe(1000);
  });

  it('healing is capped at object remaining health', () => {
    const character = new Character(500);
    const object = new HealingObject(200, 50); // only 50 left
    expect(healFromObject(character, object, 200).character.health).toBe(550);
  });

  it('consumes object health by the amount healed', () => {
    const character = new Character(800);
    const object = new HealingObject(200);
    expect(healFromObject(character, object, 100).object.health).toBe(100);
  });

  it('object becomes destroyed when health reaches 0', () => {
    const character = new Character(500);
    const object = new HealingObject(200);
    const result = healFromObject(character, object, 200);
    expect(result.object.destroyed).toBe(true);
  });

  it('preserves character id after healing', () => {
    const character = new Character(800);
    const object = new HealingObject(200);
    expect(healFromObject(character, object, 100).character.id).toBe(character.id);
  });

  it('preserves character damageSurvived after healing', () => {
    const character = new Character(800, 1, 300);
    const object = new HealingObject(200);
    expect(healFromObject(character, object, 100).character.damageSurvived).toBe(300);
  });

  it('throws when healing object is destroyed', () => {
    const character = new Character(800);
    const object = new HealingObject(200, 0);
    expect(() => healFromObject(character, object, 100)).toThrow(/destroyed/i);
  });

  it('throws when character is dead', () => {
    const character = new Character(0);
    const object = new HealingObject(200);
    expect(() => healFromObject(character, object, 100)).toThrow(/dead/i);
  });

  it('throws on invalid amount', () => {
    const character = new Character(800);
    const object = new HealingObject(200);
    expect(() => healFromObject(character, object, NaN)).toThrow(/amount/i);
    expect(() => healFromObject(character, object, -1)).toThrow(/amount/i);
  });

  it('any character can use a healing object regardless of faction', () => {
    const b = createCharacter();
    const object = new HealingObject(200);
    const damaged = new Character(800, 1, 0, b.id);
    expect(() => healFromObject(damaged, object, 100)).not.toThrow();
  });
});
