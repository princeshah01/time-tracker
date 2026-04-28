# AGENTS.md

## Project Context

This repository is a PERN monorepo starter focused on a production-grade auth
service.
## cmds to run scripts in apps 

- pnpm --filter @workspace/app-name script-name i.e dev etc

## Current Baseline

- Turbo + pnpm workspace setup.
- pnpm catalog is the source of dependency versions.
- Biome lint/format config.
- Docker Compose for Postgres and Redis.
- Shared packages:
  - `@workspace/env`
  - `@workspace/logger`
  - `@workspace/ui`
  - `@workspace/typescript-config`

## Implementation Guidance

- Keep `format:check` non-mutating.

## Validation Commands

Run from repo root:

```sh
pnpm lint
pnpm check-types
pnpm format:check
```

Run these before marking substantial tasks complete.

## Notes For Future Sessions

- `apps/auth-service` is currently a Next.js placeholder and needs full auth
  service implementation.
- `packages/auth-kit` should be added for SDK-style client/server integration.
- `Plan.md` contains the proposed schema, RBAC model, API surface, and rollout
  phases.
- Keep README, `Plan.md`, and this file updated when architecture decisions
  change.
