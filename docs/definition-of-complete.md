# Definition of Complete — subphase contract

Gunakan checklist ini sebagai template untuk setiap `PXX.Y`. Checklist tidak
boleh dicentang hanya karena halaman terlihat selesai.

## Required contract

- [ ] Scope note: in-scope, out-of-scope, dependency, risk, forbidden assumptions.
- [ ] Domain contract: entities, invariants, state machine, events,
  transaction boundary.
- [ ] API contract: route, auth, request/response, pagination, errors,
  idempotency.
- [ ] UI contract: route, permissions, loading/empty/success/partial/error,
  responsive and keyboard behavior.
- [ ] Migration plan: forward/backward strategy, indexes, backfill, lock risk.
- [ ] Test plan: unit, integration, negative, isolation, idempotency, E2E,
  performance/security where relevant.
- [ ] Integration map: producer/consumer, source of truth, adapter, retry
  boundary.
- [ ] Observability plan: structured log fields, request ID, metrics, health,
  audit, alerts.
- [ ] Done evidence: exact commands, outputs, screenshot/smoke where relevant,
  migration status, limitations.

## Technical gate

- [ ] Fresh checkout installs without hidden steps.
- [ ] Build/typecheck/lint pass.
- [ ] Unit/integration/contract/E2E checks relevant to the subphase pass.
- [ ] Security/dependency checks relevant to the subphase pass.
- [ ] No known failing check, pending migration, mock production path,
  fabricated business number, silent fallback, or silent data loss.
- [ ] Tenant isolation and positive/negative permission tests pass when
  applicable.
- [ ] Recovery/idempotency/retry tests pass when mutation/job/integration is
  applicable.
- [ ] Runbook and rollback path exist.
- [ ] Checkpoint ide offered; decision recorded.

## Status vocabulary

| Status | Meaning |
|---|---|
| `OPEN` | Required work/evidence is not complete yet. |
| `IN_PROGRESS` | Work is actively being implemented and has partial evidence. |
| `PASS` | Acceptance evidence is complete for the stated scope. |
| `BLOCKED` | Cannot proceed because an external dependency/approval/credential/legal review is absent. |
| `NARROW` | Market evidence requires a narrower scope; not a technical pass. |
| `PIVOT` | Market evidence requires a different problem/segment hypothesis. |

`Complete` is a delivery claim reserved for a subphase whose required checklist
and evidence are fully satisfied. A `PASS` market hypothesis is not product
market fit, and a provider contract fixture is not an enabled provider.
