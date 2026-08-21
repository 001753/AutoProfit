# Architecture Decision Records

ADR policy begins in Phase 0. This directory is the index and template
location; architecture choices are not to be kept only in chat.

## Index

| ADR | Decision | Status | Phase |
|---|---|---|---|
| ADR-0001 | Postgres queue instead of Redis/BullMQ | Accepted in PRD; implementation pending | P00.2/P00.4 |
| ADR-0002+ | Use the template below for the next architecture decision | Not created | P00.2 onward |

The canonical text of ADR-0001 currently lives in PRD Rev 5 §158. It must be
copied or linked into the implementation ADR when P00.2 starts, with consequence
and rollback evidence.

## Required ADR sections

- ID, title, status, date, owner.
- Context and problem.
- Decision.
- Alternatives rejected and why.
- Consequences (positive and negative).
- Security/privacy/data-integrity impact.
- Operational impact and observability.
- Migration and rollback/revisit plan.
- Evidence and links.
