import { describe, expect, it } from 'vitest';
import { Character, createCharacter } from './index.js';

describe('package barrel exports', () => {
  it('exports createCharacter', () => {
    expect(createCharacter().health).toBe(1000);
  });

  it('exports Character class', () => {
    expect(createCharacter()).toBeInstanceOf(Character);
  });
});
