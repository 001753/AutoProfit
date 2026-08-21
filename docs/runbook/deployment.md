# Deployment runbook (template)

**Status:** TEMPLATE — not executable until P00.2/P00.3 selects and verifies
the runtime.

## Preconditions

- [ ] Clean checkout and pinned runtime verified.
- [ ] Environment variables listed in `.env.example`.
- [ ] Migration status checked.
- [ ] Build, test, lint/typecheck, and security checks pass.
- [ ] Rollback target identified.

## Procedure

1. Record release identifier and operator.
2. Run the exact install/build/test commands from `replit.md`.
3. Apply only reviewed forward migrations.
4. Start the configured workflow.
5. Verify `/health` and critical smoke checks.
6. Record logs, timestamp, and result in release evidence.

## Rollback

Stop promotion, preserve logs/request IDs, restore the last known-good release,
and follow `restore.md` if data recovery is required. Never delete data to make
a report look healthy.
