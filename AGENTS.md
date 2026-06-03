**ALWAYS** start replies with ⚔️.

## What this project is

An implementation of the RPG Combat rules engine. There are six user stories described in [user-stories.md](user-stories.md)

## Build and Test Scripts

- `npm test`: runs unit tests using vitest
- `npm run lint:fix`: runs eslint with autofix
- `npm run format:fix`: runs prettier with autofix
- `npm run typecheck`: runs tsc without emit
- `npm run checks`: runs the pre-commit gate (format:fix, lint:fix, typecheck, test)
