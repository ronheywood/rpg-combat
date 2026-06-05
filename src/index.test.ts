import { describe, expect, it } from 'vitest';
import {
  Character,
  Faction,
  allyHeal,
  areAllies,
  createCharacter,
  dealDamage,
  heal,
  joinFaction,
  leaveFaction,
} from './index.js';

describe('package barrel exports', () => {
  it('exports createCharacter', () => {
    expect(createCharacter().health).toBe(1000);
  });

  it('exports Character class', () => {
    expect(createCharacter()).toBeInstanceOf(Character);
  });

  it('exports Faction class', () => {
    expect(new Faction('Knights')).toBeInstanceOf(Faction);
  });

  it('exports joinFaction', () => {
    const character = createCharacter();
    const faction = joinFaction(character, new Faction('Knights'));
    expect(faction.memberIds).toContain(character.id);
  });

  it('exports leaveFaction', () => {
    const character = createCharacter();
    const faction = joinFaction(character, new Faction('Knights'));
    expect(leaveFaction(character, faction).memberIds).not.toContain(character.id);
  });

  it('exports areAllies', () => {
    const a = createCharacter();
    const b = createCharacter();
    const faction = joinFaction(b, joinFaction(a, new Faction('Knights')));
    expect(areAllies(a, b, [faction])).toBe(true);
  });

  it('exports dealDamage', () => {
    expect(dealDamage(createCharacter(), createCharacter(), 100).health).toBe(900);
  });

  it('exports heal', () => {
    expect(heal(new Character(800), 100).health).toBe(900);
  });

  it('exports allyHeal', () => {
    const healer = createCharacter();
    let faction = joinFaction(healer, new Faction('Knights'));
    const target = new Character(800);
    faction = joinFaction(target, faction);
    expect(allyHeal(healer, target, 100, [faction]).health).toBe(900);
  });
});
