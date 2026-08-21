# Restore runbook (template)

**Status:** TEMPLATE — backup/restore evidence is not available in P00.1.

## Preconditions

- [ ] Incident approved by owner.
- [ ] Backup identifier and integrity/checksum available.
- [ ] RPO/RTO target recorded.
- [ ] Restore target isolated from production.

## Procedure

1. Declare incident and record request/incident ID.
2. Freeze or pause writes only through an approved operational procedure.
3. Restore into an isolated target.
4. Verify schema/migration version and integrity checks.
5. Compare representative counts/checksums and inspect audit trail.
6. Obtain owner approval before cutover.
7. Record observed RPO/RTO and follow-up actions.
