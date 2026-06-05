export class Character {
  constructor(
    public readonly health: number = 1000,
    public readonly level: number = 1,
    public readonly damageSurvived: number = 0,
    public readonly id: string = crypto.randomUUID(),
    public readonly factionsEverJoined: readonly string[] = [],
  ) {}

  get alive(): boolean {
    return this.health > 0;
  }

  get maxHealth(): number {
    return this.level >= 6 ? 1500 : 1000;
  }
}

export function createCharacter(): Character {
  return new Character();
}
