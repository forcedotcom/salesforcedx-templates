# Coding Guidelines

Formatting (indentation, quotes) is enforced by Prettier. Naming and type conventions are enforced by ESLint. The following covers what cannot be automated.

---

## Names

- Use whole words in names when possible

## Conventions

- Create a folder for each major sub-area
- Import directly from source files; do not create barrel `index.ts` re-export files

## Comments

- Use comments sparingly — they become outdated quickly
- Use JSDoc style where comments are needed

## Strings

- All strings visible to the user need to be externalized in a `messages.ts` file
