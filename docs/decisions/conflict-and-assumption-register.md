# Conflict and assumption register

**Status:** active baseline for P00.1  
**Rule:** unresolved conflict is not silently resolved in code.

| ID | Topic | Current rule | Source | Status | Owner/next action |
|---|---|---|---|---|---|
| CA-001 | Authority overlap | PRD owns requirements; blueprint owns `PXX.Y`/DoC; roadmap owns delivery controls | Roadmap §2.1 | RESOLVED | Apply to every subphase |
| CA-002 | Phase numbering | “Phase 01” is Identity and depends on P00; the first executable foundation unit is P00.1 | Blueprint §5–6 | RESOLVED | Do not call P01 complete from P00 work |
| CA-003 | Beachhead vs architecture | Fashion/accessories is validation focus; domain remains generic/extensible | PRD §165.1–165.2 | RESOLVED | Keep templates configurable |
| CA-004 | External capability | Missing credential, approval, sandbox, provider, or legal review is `BLOCKED` | Roadmap §2 | RESOLVED | Never fabricate activation |
| CA-005 | C0 evidence | Interviews/observations/design partners must be real, consented, and traceable; templates are not evidence | Blueprint §3.2 | RESOLVED | Collect only with owner and consent |
| CA-006 | “Complete” meaning | A document or UI existing is not enough; gate evidence and checkpoint are mandatory | Blueprint §1.1/§3.1 | RESOLVED | Use DoC checklist |
| CA-007 | Runtime selection | No framework/runtime is selected by P00.1; choose and verify it in P00.2 | Blueprint P00.2 | OPEN | Engineering lead at P00.2 |
| CA-008 | Product owner | No owner/contact is present in the imported repository | Repository inspection | OPEN | User assigns owner before C0 sessions |

## Assumptions that are explicitly forbidden

- Do not treat PRD prose, a signup, a demo, or a fixture as user evidence.
- Do not infer tenant identity from request body/query parameters.
- Do not add a package/framework to make P00.1 look like an application.
- Do not use hardcoded marketplace, profit, inventory, or accounting numbers.
- Do not mark C0/P00/Phase 01/Phase 1 complete from this document set alone.
