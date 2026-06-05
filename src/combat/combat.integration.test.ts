import { describe, expect, it } from 'vitest';
import { Character, createCharacter } from '../character/index.js';
import { Faction, joinFaction, leaveFaction } from '../character/index.js';
import { dealDamage, heal, allyHeal } from '../combat/index.js';

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

describe('simulation: 1v1 combat to the death', () => {
  it('attacker defeats target over multiple rounds', () => {
    const attacker = createCharacter();
    let target = createCharacter(); // 1000 health

    target = dealDamage(attacker, target, 400);
    expect(target.health).toBe(600);
    expect(target.alive).toBe(true);

    target = dealDamage(attacker, target, 400);
    expect(target.health).toBe(200);
    expect(target.alive).toBe(true);

    target = dealDamage(attacker, target, 400);
    expect(target.health).toBe(0);
    expect(target.alive).toBe(false);
  });

  it('killing blow does not reduce health below 0', () => {
    const attacker = createCharacter();
    let target = new Character(100);

    target = dealDamage(attacker, target, 500);
    expect(target.health).toBe(0);
  });

  it('killing blow does not count toward damageSurvived', () => {
    const attacker = createCharacter();
    let target = createCharacter();

    target = dealDamage(attacker, target, 400); // survives
    const survivedBefore = target.damageSurvived;

    target = dealDamage(attacker, target, 1000); // killing blow
    expect(target.alive).toBe(false);
    expect(target.damageSurvived).toBe(survivedBefore); // not incremented
  });
});

describe('simulation: faction combat', () => {
  it('ally cannot damage an ally', () => {
    const a = createCharacter();
    let [, faction] = joinFaction(a, new Faction('Knights'));
    const b = createCharacter();
    faction = joinFaction(b, faction)[1];

    expect(() => dealDamage(a, b, 100, [faction])).toThrow();
    expect(b.health).toBe(1000); // unchanged — throw before damage applied
  });

  it('enemy from a different faction can deal damage', () => {
    const knight = createCharacter();
    const [, knightsFaction] = joinFaction(knight, new Faction('Knights'));

    const mage = createCharacter();
    const [, magesFaction] = joinFaction(mage, new Faction('Mages'));

    const allFactions = [knightsFaction, magesFaction];

    const damagedMage = dealDamage(knight, mage, 200, allFactions);
    expect(damagedMage.health).toBe(800);
  });

  it('ally can heal a wounded ally', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const wounded = new Character(600);
    faction = joinFaction(wounded, faction)[1];

    const healed = allyHeal(healer, wounded, 200, [faction]);
    expect(healed.health).toBe(800);
    expect(healed.id).toBe(wounded.id);
    expect(healed.damageSurvived).toBe(wounded.damageSurvived);
  });
});

describe('simulation: ally leaves faction mid-combat', () => {
  it('cannot attack ally; can attack after leaving faction', () => {
    const a = createCharacter();
    let [, faction] = joinFaction(a, new Faction('Knights'));
    const b = createCharacter();
    faction = joinFaction(b, faction)[1];

    // While allied — attack blocked
    expect(() => dealDamage(a, b, 100, [faction])).toThrow();

    // b leaves the faction
    faction = leaveFaction(b, faction);

    // No longer allied — attack succeeds
    const damaged = dealDamage(a, b, 100, [faction]);
    expect(damaged.health).toBe(900);
  });
});

describe('simulation: ally healing in multi-round fight', () => {
  it('healer repeatedly restores wounded ally without exceeding maxHealth', () => {
    const healer = createCharacter();
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    let ally = createCharacter(); // 1000 health
    faction = joinFaction(ally, faction)[1];

    const enemy = createCharacter();

    // Enemy deals 3 rounds of 200 damage (no factions — lone wolf enemy)
    ally = dealDamage(enemy, ally, 200);
    ally = dealDamage(enemy, ally, 200);
    ally = dealDamage(enemy, ally, 200);
    expect(ally.health).toBe(400);
    expect(ally.damageSurvived).toBe(600);

    // Healer restores 400 — brings ally back to 800
    ally = allyHeal(healer, ally, 400, [faction]);
    expect(ally.health).toBe(800);
    expect(ally.damageSurvived).toBe(600); // damageSurvived preserved

    // Healer tries to overheal — capped at 1000
    ally = allyHeal(healer, ally, 500, [faction]);
    expect(ally.health).toBe(1000);
  });
});

describe('simulation: level modifier in multi-hit battles', () => {
  it('high-level attacker kills low-level target faster (1.5× damage)', () => {
    const veteran = new Character(1000, 6); // level 6
    let recruit = new Character(1000, 1); // level 1 — 5 levels below

    // 100 base damage × 1.5 = 150 effective
    recruit = dealDamage(veteran, recruit, 100);
    expect(recruit.health).toBe(850);
    expect(recruit.damageSurvived).toBe(150);

    recruit = dealDamage(veteran, recruit, 100);
    expect(recruit.health).toBe(700);

    // 7 hits to kill (7 × 150 = 1050 > 1000)
    for (let i = 0; i < 5; i++) {
      recruit = dealDamage(veteran, recruit, 100);
    }
    expect(recruit.alive).toBe(false);
  });

  it('high-level target tanks low-level attacker (0.5× damage)', () => {
    const veteran = new Character(1500, 6); // level 6, maxHealth 1500
    const recruit = new Character(1000, 1); // level 1 — 5 levels below veteran

    // 100 base damage × 0.5 = 50 effective
    const firstHit = dealDamage(recruit, veteran, 100);
    expect(firstHit.health).toBe(1450);

    // It takes 30 hits of 100 to kill the veteran (30 × 50 = 1500)
    let target = veteran;
    let attacks = 0;
    while (target.alive && attacks < 35) {
      target = dealDamage(recruit, target, 100);
      attacks++;
    }
    expect(target.alive).toBe(false);
    expect(attacks).toBe(30); // exactly 30 hits needed
  });
});

describe('simulation: level-up from damage survival', () => {
  it('level 1 character levels up after surviving 1000 cumulative damage', () => {
    const attacker = createCharacter();
    let hero = createCharacter();

    hero = dealDamage(attacker, hero, 500);
    expect(hero.level).toBe(1); // 500 < 1000 threshold

    // Heal between battles (damageSurvived preserved)
    hero = heal(hero, 500);

    hero = dealDamage(attacker, hero, 500);
    expect(hero.level).toBe(2); // 1000 >= threshold
    expect(hero.damageSurvived).toBe(1000);
  });

  it('level-up does not fire for a dead character', () => {
    const attacker = createCharacter();
    let target = createCharacter();
    target = dealDamage(attacker, target, 1500); // killed
    expect(target.alive).toBe(false);
    expect(target.level).toBe(1); // no level-up for dead
  });

  it('level 2 threshold requires 3000 cumulative damage (2×1000 + 1×1000 base)', () => {
    const attacker = createCharacter();
    let hero = new Character(1000, 2, 2998); // 2 below threshold
    hero = dealDamage(attacker, hero, 1); // damageSurvived = 2999
    expect(hero.level).toBe(2); // 2999 < 3000

    hero = dealDamage(attacker, hero, 1); // damageSurvived = 3000
    expect(hero.level).toBe(3); // 3000 >= 3000
  });

  it('cascades through levels when large single hit crosses multiple thresholds', () => {
    const attacker = createCharacter();
    // 1 damage away from crossing both level 1 (1000) and level 2 (3000) thresholds
    const target = new Character(500, 1, 2999);
    const result = dealDamage(attacker, target, 1); // damageSurvived becomes 3000
    expect(result.level).toBe(3); // cascaded: 3000 >= threshold(1)=1000 and threshold(2)=3000
  });
});

describe('simulation: level-up from faction history', () => {
  it('level 1 character levels up after joining 3 distinct factions', () => {
    let char = createCharacter();
    [char] = joinFaction(char, new Faction('Alpha'));
    [char] = joinFaction(char, new Faction('Beta'));
    expect(char.level).toBe(1); // only 2 factions — need 3

    [char] = joinFaction(char, new Faction('Gamma'));
    expect(char.level).toBe(2); // 3 factions — threshold met
  });

  it('level 2 threshold requires 6 cumulative distinct factions', () => {
    let char = new Character(1000, 2); // already level 2
    for (const name of ['A', 'B', 'C', 'D', 'E']) {
      [char] = joinFaction(char, new Faction(name));
    }
    expect(char.level).toBe(2); // 5 factions — need 6

    [char] = joinFaction(char, new Faction('F'));
    expect(char.level).toBe(3); // 6 factions — threshold met
  });

  it('leaving a faction does not reduce factionsEverJoined count', () => {
    let char = createCharacter();
    const [c1, f1] = joinFaction(char, new Faction('Alpha'));
    const [c2] = joinFaction(c1, new Faction('Beta'));
    const [c3] = joinFaction(c2, new Faction('Gamma'));
    // Leave one faction — but history is append-only
    leaveFaction(c3, f1); // leaveFaction returns Faction, not Character
    char = c3;
    expect(char.level).toBe(2); // Still counts 3 factions ever joined
  });
});
