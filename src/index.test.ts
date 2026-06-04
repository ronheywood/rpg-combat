import { describe, expect, it } from 'vitest';
import { Character, createCharacter, joinFaction, leaveFaction } from './index.js';

describe('package barrel exports', () => {
  it('exports createCharacter', () => {
    expect(createCharacter().health).toBe(1000);
  });

  it('exports Character class', () => {
    expect(createCharacter()).toBeInstanceOf(Character);
  });

  it('exports joinFaction', () => {
    expect(joinFaction(createCharacter(), 'Knights').factions).toContain('Knights');
  });

  it('exports leaveFaction', () => {
    const character = joinFaction(createCharacter(), 'Knights');
    expect(leaveFaction(character, 'Knights').factions).not.toContain('Knights');
  });
});
