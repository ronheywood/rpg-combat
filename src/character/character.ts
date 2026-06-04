export class Character {
  public readonly factions: readonly string[];
  public readonly factionHistory: readonly string[];

  // eslint-disable-next-line max-params
  constructor(
    public readonly health: number = 1000,
    public readonly level: number = 1,
    public readonly damageSurvived: number = 0,
    factions: readonly string[] = [],
    factionHistory: readonly string[] = [],
  ) {
    // Deduplicate and ensure factions ⊆ factionHistory
    const uniqueFactions = [...new Set(factions)];
    const uniqueHistory = [...new Set([...factionHistory, ...uniqueFactions])];
    this.factions = uniqueFactions;
    this.factionHistory = uniqueHistory;
  }

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
