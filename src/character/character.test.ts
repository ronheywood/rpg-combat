import { describe, expect, it } from 'vitest';
import { createCharacter } from './character.js';

describe('createCharacter', () => {
  it('starts with 1000 health', () => {
    const character = createCharacter();
    expect(character.health).toBe(1000);
  });

  it('starts alive', () => {
    const character = createCharacter();
    expect(character.alive).toBe(true);
  });

  it('starts at level 1', () => {
    const character = createCharacter();
    expect(character.level).toBe(1);
  });
});
