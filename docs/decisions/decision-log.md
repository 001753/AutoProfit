# Decision log

Copy this entry for each non-obvious decision. Decisions affecting schema,
public API, permissions, accounting rules, provider capability, or phase timing
must also have an ADR or change proposal as required by the roadmap.

## Entry template

| Field | Value |
|---|---|
| Decision ID | `DEC-YYYY-MM-DD-NNN` |
| Date/time | `YYYY-MM-DD` |
| Owner | Name/role |
| Status | `PROPOSED` / `ACCEPTED` / `REJECTED` / `SUPERSEDED` |
| Context/problem | What required a decision? |
| Decision | One precise sentence |
| Alternatives rejected | What else was considered and why? |
| Consequences | Positive, negative, operational |
| Scope impact | Which phase/subphase changes? |
| Evidence | Links, tests, user/market evidence |
| Rollback/revisit trigger | What would invalidate this decision? |

## Recorded baseline decisions

### DEC-2026-08-11-001 — P00.1 remains documentation-only

- **Status:** ACCEPTED
- **Owner:** Project owner (to confirm)
- **Context:** Imported repository contains PRD/roadmap/blueprint but no app code.
- **Decision:** Complete P00.1 with traceability and governance artifacts only;
  defer runtime/toolchain to P00.2.
- **Reason:** Blueprint explicitly marks framework choice and feature work
  out-of-scope for P00.1.
- **Consequence:** There is no app start command or runtime smoke yet.
- **Revisit trigger:** Start of P00.2.

### DEC-2026-08-21-002 — Continue without P00.1 scope additions

- **Status:** ACCEPTED
- **Owner:** Project owner
- **Context:** The P00.1 checkpoint requires an explicit decision before the
  next subphase.
- **Decision:** Continue without adding checkpoint ideas; start P00.2 and
  proceed through P00.4 before attempting P01.
- **Consequence:** Runtime, database, and adapter work must remain inside the
  canonical P00.2–P00.4 scope.
