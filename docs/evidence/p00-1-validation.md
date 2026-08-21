# P00.1 validation evidence

**Command:** `python scripts/validate_p001.py`  
**Expected result:** `P00.1 validation passed`  
**Last run:** 2026-08-11T11:12:57+00:00

```text
P00.1 validation passed (artifacts=18, prd_rows=164, links=0, market_evidence=OPEN)
```

The validator checks:

- matrix contains every PRD number 1–164 exactly once;
- required P00.1 artifacts exist;
- required headings and status markers exist;
- relative links in the baseline artifacts resolve;
- no forbidden fabricated-evidence markers are introduced.

Update this file with the exact command output and date after each accepted
validation run. This document does not claim runtime/build/database evidence,
because those belong to P00.2–P00.4.
