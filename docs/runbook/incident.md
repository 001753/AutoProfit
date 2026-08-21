# Incident runbook (template)

**Status:** TEMPLATE — runtime logging/health is a P00.3/P00.4 deliverable.

## Record

- Incident ID:
- Start/end time:
- Reporter/operator:
- Affected tenant(s), without exposing PII:
- Request/job IDs:
- User-visible state:

## Response

1. Confirm scope and preserve structured logs.
2. Protect data integrity: stop unsafe mutation/retry if needed.
3. Communicate a truthful status; do not silently substitute data.
4. Mitigate through an approved rollback or adapter/provider recovery.
5. Verify health and affected invariants.
6. Write root cause, detection gap, recovery time, and prevention action.
