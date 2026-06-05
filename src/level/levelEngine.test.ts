import { describe, expect, it } from 'vitest';
import { Character, createCharacter } from '../character/index.js';
import { Faction, joinFaction } from '../character/index.js';
import { applyLevelUp, damageThreshold, factionThreshold } from './levelEngine.js';

describe('damageThreshold', () => {
  it.each([
    [1, 1_000],
    [2, 3_000],
    [3, 6_000],
    [4, 10_000],
    [5, 15_000],
    [9, 45_000],
  ])('threshold for level %i is %i', (level, expected) => {
    expect(damageThreshold(level)).toBe(expected);
  });
});

describe('factionThreshold', () => {
  it.each([
    [1, 3],
    [2, 6],
    [3, 9],
    [4, 12],
    [9, 27],
  ])('threshold for level %i is %i', (level, expected) => {
    expect(factionThreshold(level)).toBe(expected);
  });
});

describe('applyLevelUp — damage path', () => {
  it('no level-up when damageSurvived is below threshold', () => {
    const char = new Character(1000, 1, 999);
    expect(applyLevelUp(char).level).toBe(1);
  });

  it('levels up when damageSurvived reaches threshold for level 1', () => {
    const char = new Character(1000, 1, 1000);
    expect(applyLevelUp(char).level).toBe(2);
  });

  it('levels up when damageSurvived exceeds threshold', () => {
    const char = new Character(1000, 1, 1500);
    expect(applyLevelUp(char).level).toBe(2);
  });

  it('levels up to 3 when damageSurvived reaches level 2 threshold', () => {
    const char = new Character(1000, 2, 3000);
    expect(applyLevelUp(char).level).toBe(3);
  });

  it('cascades through multiple levels if thresholds all crossed', () => {
    // damageSurvived = 3000 at level 1 crosses both level 1 (1000) and level 2 (3000)
    const char = new Character(1000, 1, 3000);
    expect(applyLevelUp(char).level).toBe(3);
  });

  it('does not level up a dead character', () => {
    const char = new Character(0, 1, 1000);
    expect(applyLevelUp(char).level).toBe(1);
  });

  it('does not exceed level 10', () => {
    const char = new Character(1000, 9, 50_000);
    expect(applyLevelUp(char).level).toBe(10);
  });

  it('silently returns level 10 character unchanged', () => {
    const char = new Character(1000, 10, 100_000);
    expect(applyLevelUp(char)).toBe(char);
  });

  it('preserves health on level-up', () => {
    const char = new Character(800, 1, 1000);
    expect(applyLevelUp(char).health).toBe(800);
  });

  it('preserves id on level-up', () => {
    const char = new Character(1000, 1, 1000);
    expect(applyLevelUp(char).id).toBe(char.id);
  });

  it('preserves damageSurvived on level-up', () => {
    const char = new Character(1000, 1, 1000);
    expect(applyLevelUp(char).damageSurvived).toBe(1000);
  });

  it('returns the same character when no level-up occurs', () => {
    const char = new Character(1000, 1, 500);
    expect(applyLevelUp(char)).toBe(char);
  });
});

describe('applyLevelUp — faction path', () => {
  it('no level-up when factionsEverJoined is below threshold', () => {
    const [c1] = joinFaction(createCharacter(), new Faction('A'));
    const [c2] = joinFaction(c1, new Faction('B'));
    expect(applyLevelUp(c2).level).toBe(1); // need 3, have 2
  });

  it('levels up when factionsEverJoined reaches threshold for level 1', () => {
    const [c1] = joinFaction(createCharacter(), new Faction('A'));
    const [c2] = joinFaction(c1, new Faction('B'));
    const [c3] = joinFaction(c2, new Faction('C'));
    expect(applyLevelUp(c3).level).toBe(2);
  });

  it('preserves factionsEverJoined after faction level-up', () => {
    const [c1] = joinFaction(createCharacter(), new Faction('A'));
    const [c2] = joinFaction(c1, new Faction('B'));
    const [c3] = joinFaction(c2, new Faction('C'));
    expect(applyLevelUp(c3).factionsEverJoined).toEqual(c3.factionsEverJoined);
  });

  it('cascades when factionsEverJoined crosses multiple thresholds', () => {
    // 9 factions crosses thresholds for level 1 (3) and level 2 (6)
    let char = createCharacter();
    for (const name of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']) {
      [char] = joinFaction(char, new Faction(name));
    }
    // 9 factions: level 1 threshold (3) ✓, level 2 threshold (6) ✓, level 3 threshold (9) ✓
    expect(applyLevelUp(char).level).toBe(4);
  });
});

describe('applyLevelUp — combined paths', () => {
  it('either path independently triggers level-up', () => {
    // Damage path only
    const byDamage = new Character(1000, 1, 1000);
    expect(applyLevelUp(byDamage).level).toBe(2);

    // Faction path only
    const [c1] = joinFaction(createCharacter(), new Faction('A'));
    const [c2] = joinFaction(c1, new Faction('B'));
    const [c3] = joinFaction(c2, new Faction('C'));
    const byFaction = new Character(c3.health, 1, 0, c3.id, c3.factionsEverJoined);
    expect(applyLevelUp(byFaction).level).toBe(2);
  });

  it('both paths crossed: level-up fires once (to next level)', () => {
    // Both paths cross level 1 threshold simultaneously
    const [c1] = joinFaction(createCharacter(), new Faction('A'));
    const [c2] = joinFaction(c1, new Faction('B'));
    const [c3] = joinFaction(c2, new Faction('C'));
    const char = new Character(1000, 1, 1000, c3.id, c3.factionsEverJoined);
    // Level 1 threshold met by both → levels to 2; level 2 not yet met
    expect(applyLevelUp(char).level).toBe(2);
  });
});
