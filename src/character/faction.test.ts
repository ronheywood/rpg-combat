import { describe, expect, it } from 'vitest';
import { createCharacter } from './character.js';
import { joinFaction, leaveFaction } from './faction.js';

describe('faction membership', () => {
  it('starts with no factions', () => {
    expect(createCharacter().factions).toEqual([]);
  });

  it('starts with empty faction history', () => {
    expect(createCharacter().factionHistory).toEqual([]);
  });

  it('join adds to factions', () => {
    const character = joinFaction(createCharacter(), 'Knights');
    expect(character.factions).toContain('Knights');
  });

  it('join adds to faction history', () => {
    const character = joinFaction(createCharacter(), 'Knights');
    expect(character.factionHistory).toContain('Knights');
  });

  it('leave removes from factions', () => {
    let character = joinFaction(createCharacter(), 'Knights');
    character = leaveFaction(character, 'Knights');
    expect(character.factions).not.toContain('Knights');
  });

  it('leave does not remove from faction history', () => {
    let character = joinFaction(createCharacter(), 'Knights');
    character = leaveFaction(character, 'Knights');
    expect(character.factionHistory).toContain('Knights');
  });

  it('joining a previously-left faction does not duplicate history', () => {
    let character = joinFaction(createCharacter(), 'Knights');
    character = leaveFaction(character, 'Knights');
    character = joinFaction(character, 'Knights');
    expect(character.factionHistory.filter((f) => f === 'Knights')).toHaveLength(1);
  });

  it('joining same faction twice is idempotent', () => {
    let character = joinFaction(createCharacter(), 'Knights');
    character = joinFaction(character, 'Knights');
    expect(character.factions.filter((f) => f === 'Knights')).toHaveLength(1);
    expect(character.factionHistory.filter((f) => f === 'Knights')).toHaveLength(1);
  });

  it('leave on a faction not currently joined is a no-op', () => {
    const character = createCharacter();
    expect(() => leaveFaction(character, 'Knights')).not.toThrow();
    expect(leaveFaction(character, 'Knights').factions).toEqual([]);
  });

  it('rejects empty faction name', () => {
    expect(() => joinFaction(createCharacter(), '')).toThrow();
  });

  it('rejects whitespace-only faction name', () => {
    expect(() => joinFaction(createCharacter(), '   ')).toThrow();
  });
});
