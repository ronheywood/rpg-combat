export class HealingObject {
  readonly kind = 'healing' as const;
  readonly health: number;

  constructor(
    public readonly maxHealth: number,
    health?: number,
  ) {
    if (maxHealth <= 0) throw new Error('maxHealth must be greater than 0');
    this.health = health ?? maxHealth;
    if (this.health < 0 || this.health > maxHealth)
      throw new Error('health must be in range [0, maxHealth]');
  }

  get destroyed(): boolean {
    return this.health <= 0;
  }
}

export class MagicalWeapon {
  readonly kind = 'weapon' as const;
  readonly health: number;

  constructor(
    public readonly damage: number,
    public readonly maxHealth: number,
    health?: number,
  ) {
    if (damage <= 0) throw new Error('damage must be greater than 0');
    if (maxHealth <= 0) throw new Error('maxHealth must be greater than 0');
    this.health = health ?? maxHealth;
    if (this.health < 0 || this.health > maxHealth)
      throw new Error('health must be in range [0, maxHealth]');
  }

  get destroyed(): boolean {
    return this.health <= 0;
  }
}
