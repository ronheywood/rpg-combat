export type Character = {
  health: number;
  alive: boolean;
  level: number;
};

export function createCharacter(): Character {
  return {
    health: 1000,
    alive: true,
    level: 1,
  };
}
