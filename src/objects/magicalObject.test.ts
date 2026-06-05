import { describe, expect, it } from 'vitest';
import { HealingObject, MagicalWeapon } from './magicalObject.js';

describe('HealingObject', () => {
  it('starts with full health equal to maxHealth', () => {
    expect(new HealingObject(100).health).toBe(100);
  });

  it('can be constructed with a specific health value', () => {
    expect(new HealingObject(100, 60).health).toBe(60);
  });

  it('is not destroyed when health is greater than 0', () => {
    expect(new HealingObject(100).destroyed).toBe(false);
  });

  it('is destroyed when health is 0', () => {
    expect(new HealingObject(100, 0).destroyed).toBe(true);
  });

  it('rejects maxHealth of 0 or less', () => {
    expect(() => new HealingObject(0)).toThrow();
    expect(() => new HealingObject(-1)).toThrow();
  });

  it('rejects health greater than maxHealth', () => {
    expect(() => new HealingObject(100, 150)).toThrow();
  });

  it('rejects negative health', () => {
    expect(() => new HealingObject(100, -1)).toThrow();
  });
});

describe('MagicalWeapon', () => {
  it('starts with full health equal to maxHealth', () => {
    expect(new MagicalWeapon(50, 5).health).toBe(5);
  });

  it('can be constructed with a specific health value', () => {
    expect(new MagicalWeapon(50, 5, 3).health).toBe(3);
  });

  it('exposes its fixed damage value', () => {
    expect(new MagicalWeapon(50, 5).damage).toBe(50);
  });

  it('is not destroyed when health is greater than 0', () => {
    expect(new MagicalWeapon(50, 5).destroyed).toBe(false);
  });

  it('is destroyed when health is 0', () => {
    expect(new MagicalWeapon(50, 5, 0).destroyed).toBe(true);
  });

  it('rejects damage of 0 or less', () => {
    expect(() => new MagicalWeapon(0, 5)).toThrow();
    expect(() => new MagicalWeapon(-1, 5)).toThrow();
  });

  it('rejects maxHealth of 0 or less', () => {
    expect(() => new MagicalWeapon(50, 0)).toThrow();
  });

  it('rejects health greater than maxHealth', () => {
    expect(() => new MagicalWeapon(50, 5, 10)).toThrow();
  });
});
