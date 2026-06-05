import { describe, expect, it } from 'vitest';
import {
  Character,
  Faction,
  HealingObject,
  MagicalWeapon,
  allyHeal,
  applyLevelUp,
  areAllies,
  createCharacter,
  damageThreshold,
  dealDamage,
  factionThreshold,
  heal,
  healFromObject,
  joinFaction,
  leaveFaction,
  useWeapon,
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
    const [, faction] = joinFaction(character, new Faction('Knights'));
    expect(faction.memberIds).toContain(character.id);
  });

  it('exports leaveFaction', () => {
    const character = createCharacter();
    const [, faction] = joinFaction(character, new Faction('Knights'));
    expect(leaveFaction(character, faction).memberIds).not.toContain(character.id);
  });

  it('exports areAllies', () => {
    const a = createCharacter();
    const b = createCharacter();
    const [, faction] = joinFaction(b, joinFaction(a, new Faction('Knights'))[1]);
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
    let [, faction] = joinFaction(healer, new Faction('Knights'));
    const target = new Character(800);
    faction = joinFaction(target, faction)[1];
    expect(allyHeal(healer, target, 100, [faction]).health).toBe(900);
  });

  it('exports HealingObject', () => {
    const obj = new HealingObject(200);
    expect(obj.health).toBe(200);
    expect(obj.destroyed).toBe(false);
  });

  it('exports MagicalWeapon', () => {
    const weapon = new MagicalWeapon(50, 10);
    expect(weapon.damage).toBe(50);
    expect(weapon.health).toBe(10);
  });

  it('exports useWeapon', () => {
    const attacker = createCharacter();
    const weapon = new MagicalWeapon(100, 5);
    const target = createCharacter();
    const result = useWeapon(attacker, weapon, target);
    expect(result.target.health).toBe(900);
    expect(result.weapon.health).toBe(4);
  });

  it('exports healFromObject', () => {
    const character = new Character(800);
    const object = new HealingObject(200);
    const result = healFromObject(character, object, 100);
    expect(result.character.health).toBe(900);
    expect(result.object.health).toBe(100);
  });

  it('exports applyLevelUp', () => {
    const char = new Character(1000, 1, 1000);
    expect(applyLevelUp(char).level).toBe(2);
  });

  it('exports damageThreshold', () => {
    expect(damageThreshold(1)).toBe(1000);
    expect(damageThreshold(2)).toBe(3000);
  });

  it('exports factionThreshold', () => {
    expect(factionThreshold(1)).toBe(3);
    expect(factionThreshold(2)).toBe(6);
  });
});
