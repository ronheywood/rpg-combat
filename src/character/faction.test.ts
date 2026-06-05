import { describe, expect, it } from 'vitest';
import { Character, createCharacter } from './character.js';
import { Faction, areAllies, joinFaction, leaveFaction } from './faction.js';

describe('Faction', () => {
  it('starts with no members', () => {
    expect(new Faction('Knights').memberIds).toEqual([]);
  });

  it('rejects empty faction name', () => {
    expect(() => new Faction('')).toThrow();
  });

  it('rejects whitespace-only faction name', () => {
    expect(() => new Faction('   ')).toThrow();
  });
});

describe('joinFaction', () => {
  it('adds character to faction memberIds', () => {
    const character = createCharacter();
    const faction = new Faction('Knights');
    const [, joined] = joinFaction(character, faction);
    expect(joined.memberIds).toContain(character.id);
  });

  it('adds faction name to character factionsEverJoined', () => {
    const character = createCharacter();
    const [updated] = joinFaction(character, new Faction('Knights'));
    expect(updated.factionsEverJoined).toContain('Knights');
  });

  it('joining same character twice is idempotent', () => {
    const character = createCharacter();
    const [, faction1] = joinFaction(character, new Faction('Knights'));
    const [, faction2] = joinFaction(character, faction1);
    expect(faction2.memberIds.filter((id) => id === character.id)).toHaveLength(1);
  });

  it('joining same faction twice does not duplicate factionsEverJoined', () => {
    const [char1, faction1] = joinFaction(createCharacter(), new Faction('Knights'));
    const [char2] = joinFaction(char1, faction1);
    expect(char2.factionsEverJoined.filter((n) => n === 'Knights')).toHaveLength(1);
  });

  it('returns the same faction instance when character is already a member', () => {
    const character = createCharacter();
    const [, faction1] = joinFaction(character, new Faction('Knights'));
    expect(joinFaction(character, faction1)[1]).toBe(faction1);
  });

  it('returns the same character instance when character is already a member', () => {
    const [char1, faction1] = joinFaction(createCharacter(), new Faction('Knights'));
    expect(joinFaction(char1, faction1)[0]).toBe(char1);
  });

  it('does not modify the original faction', () => {
    const faction = new Faction('Knights');
    joinFaction(createCharacter(), faction);
    expect(faction.memberIds).toHaveLength(0);
  });
});

describe('leaveFaction', () => {
  it('removes character from faction memberIds', () => {
    const character = createCharacter();
    const [, joinedFaction] = joinFaction(character, new Faction('Knights'));
    expect(leaveFaction(character, joinedFaction).memberIds).not.toContain(character.id);
  });

  it('leave on a character not in the faction is a no-op', () => {
    const character = createCharacter();
    const faction = new Faction('Knights');
    expect(() => leaveFaction(character, faction)).not.toThrow();
    expect(leaveFaction(character, faction).memberIds).toEqual([]);
  });

  it('returns the same faction instance when character was not a member', () => {
    const character = createCharacter();
    const faction = new Faction('Knights');
    expect(leaveFaction(character, faction)).toBe(faction);
  });

  it('a character that leaves all factions becomes a lone wolf', () => {
    const character = createCharacter();
    const [, faction1] = joinFaction(character, new Faction('Knights'));
    const updated = leaveFaction(character, faction1);
    expect(updated.memberIds).toHaveLength(0);
  });

  it('leaving a faction does not remove it from factionsEverJoined', () => {
    const [joined] = joinFaction(createCharacter(), new Faction('Knights'));
    const _ = leaveFaction(joined, new Faction('Knights'));
    expect(joined.factionsEverJoined).toContain('Knights');
  });
});

describe('areAllies', () => {
  it('returns true when both characters are in the same faction', () => {
    const a = createCharacter();
    const b = createCharacter();
    const [, faction1] = joinFaction(a, new Faction('Knights'));
    const [, faction] = joinFaction(b, faction1);
    expect(areAllies(a, b, [faction])).toBe(true);
  });

  it('returns false when characters share no faction', () => {
    const a = createCharacter();
    const b = createCharacter();
    const [, faction] = joinFaction(a, new Faction('Knights'));
    expect(areAllies(a, b, [faction])).toBe(false);
  });

  it('returns false when no factions are provided', () => {
    const a = createCharacter();
    const b = createCharacter();
    expect(areAllies(a, b, [])).toBe(false);
  });

  it('returns false when a character is compared to themselves', () => {
    const a = createCharacter();
    const [, faction] = joinFaction(a, new Faction('Knights'));
    expect(areAllies(a, a, [faction])).toBe(false);
  });

  it('uses the factions provided — callers must thread current state', () => {
    const a = createCharacter();
    const b = createCharacter();
    const [, kfact1] = joinFaction(a, new Faction('Knights'));
    const [, v1] = joinFaction(b, kfact1);
    const v2 = leaveFaction(b, v1);
    // stale snapshot reports allies incorrectly; only current state is correct
    expect(areAllies(a, b, [v1])).toBe(true);
    expect(areAllies(a, b, [v2])).toBe(false);
  });

  it('returns true if either of multiple factions contains both', () => {
    const a = createCharacter();
    const b = createCharacter();
    const mages = new Faction('Mages');
    const [, kfact] = joinFaction(a, new Faction('Knights'));
    const [, sharedFaction] = joinFaction(b, kfact);
    expect(areAllies(a, b, [mages, sharedFaction])).toBe(true);
  });
});

describe('Character.factionsEverJoined', () => {
  it('starts with empty factionsEverJoined', () => {
    expect(createCharacter().factionsEverJoined).toEqual([]);
  });

  it('accumulates distinct faction names across joins', () => {
    const char = createCharacter();
    const [c1] = joinFaction(char, new Faction('Knights'));
    const [c2] = joinFaction(c1, new Faction('Mages'));
    expect(c2.factionsEverJoined).toContain('Knights');
    expect(c2.factionsEverJoined).toContain('Mages');
    expect(c2.factionsEverJoined).toHaveLength(2);
  });

  it('preserved when creating copies in combat', () => {
    const [char] = joinFaction(createCharacter(), new Faction('Knights'));
    const copy = new Character(
      char.health,
      char.level,
      char.damageSurvived,
      char.id,
      char.factionsEverJoined,
    );
    expect(copy.factionsEverJoined).toEqual(char.factionsEverJoined);
  });
});
