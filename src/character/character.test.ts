import { describe, expect, it } from 'vitest';
import { Character, createCharacter } from './character.js';

describe('createCharacter', () => {
  it('starts with 1000 health', () => {
    expect(createCharacter().health).toBe(1000);
  });

  it('starts alive', () => {
    expect(createCharacter().alive).toBe(true);
  });

  it('starts at level 1', () => {
    expect(createCharacter().level).toBe(1);
  });

  it('creates independent instances', () => {
    const a = createCharacter();
    const b = createCharacter();
    expect(a).not.toBe(b);
  });

  it('is not alive when health is 0', () => {
    const character = new Character(0, 1);
    expect(character.alive).toBe(false);
  });
});
