import { describe, expect, it } from 'vitest';
import { createCharacter } from './character.js';
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
    expect(joinFaction(character, faction).memberIds).toContain(character.id);
  });

  it('joining same character twice is idempotent', () => {
    const character = createCharacter();
    const faction = joinFaction(character, new Faction('Knights'));
    const again = joinFaction(character, faction);
    expect(again.memberIds.filter((id) => id === character.id)).toHaveLength(1);
  });

  it('returns the same faction instance when character is already a member', () => {
    const character = createCharacter();
    const faction = joinFaction(character, new Faction('Knights'));
    expect(joinFaction(character, faction)).toBe(faction);
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
    const faction = joinFaction(character, new Faction('Knights'));
    expect(leaveFaction(character, faction).memberIds).not.toContain(character.id);
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
    const faction = joinFaction(character, new Faction('Knights'));
    const updated = leaveFaction(character, faction);
    expect(updated.memberIds).toHaveLength(0);
  });
});

describe('areAllies', () => {
  it('returns true when both characters are in the same faction', () => {
    const a = createCharacter();
    const b = createCharacter();
    const faction = joinFaction(b, joinFaction(a, new Faction('Knights')));
    expect(areAllies(a, b, [faction])).toBe(true);
  });

  it('returns false when characters share no faction', () => {
    const a = createCharacter();
    const b = createCharacter();
    const faction = joinFaction(a, new Faction('Knights'));
    expect(areAllies(a, b, [faction])).toBe(false);
  });

  it('returns false when no factions are provided', () => {
    const a = createCharacter();
    const b = createCharacter();
    expect(areAllies(a, b, [])).toBe(false);
  });

  it('returns false when a character is compared to themselves', () => {
    const a = createCharacter();
    const faction = joinFaction(a, new Faction('Knights'));
    expect(areAllies(a, a, [faction])).toBe(false);
  });

  it('uses the factions provided — callers must thread current state', () => {
    const a = createCharacter();
    const b = createCharacter();
    const v1 = joinFaction(b, joinFaction(a, new Faction('Knights')));
    const v2 = leaveFaction(b, v1);
    // stale snapshot reports allies incorrectly; only current state is correct
    expect(areAllies(a, b, [v1])).toBe(true);
    expect(areAllies(a, b, [v2])).toBe(false);
  });

  it('returns true if either of multiple factions contains both', () => {
    const a = createCharacter();
    const b = createCharacter();
    const mages = new Faction('Mages');
    const sharedFaction = joinFaction(b, joinFaction(a, new Faction('Knights')));
    expect(areAllies(a, b, [mages, sharedFaction])).toBe(true);
  });
});
