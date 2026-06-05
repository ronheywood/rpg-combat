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

  it('each instance has a unique id', () => {
    expect(createCharacter().id).not.toBe(createCharacter().id);
  });

  it('starts with 0 damage survived', () => {
    expect(createCharacter().damageSurvived).toBe(0);
  });
});

describe('Character.alive', () => {
  it('is not alive when health is 0', () => {
    const character = new Character(0, 1);
    expect(character.alive).toBe(false);
  });

  it('is alive when health is greater than 0', () => {
    const character = new Character(1, 1);
    expect(character.alive).toBe(true);
  });
});

describe('Character.maxHealth', () => {
  it('is 1000 at level 1', () => {
    expect(new Character(1000, 1).maxHealth).toBe(1000);
  });

  it('is 1000 at level 5', () => {
    expect(new Character(1000, 5).maxHealth).toBe(1000);
  });

  it('is 1500 at level 6', () => {
    expect(new Character(1000, 6).maxHealth).toBe(1500);
  });

  it('is 1500 at level 10', () => {
    expect(new Character(1000, 10).maxHealth).toBe(1500);
  });
});
