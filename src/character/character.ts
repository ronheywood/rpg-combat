export class Character {
  constructor(
    public readonly health: number = 1000,
    public readonly level: number = 1,
  ) {}

  get alive(): boolean {
    return this.health > 0;
  }
}

export function createCharacter(): Character {
  return new Character();
}
