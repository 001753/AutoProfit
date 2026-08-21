#!/usr/bin/env python3
"""Deterministic P00.1 governance, coverage, and link validation."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "replit.md",
    "docs/source-of-truth/module-phase-matrix.md",
    "docs/scope/p00-1-product-baseline.md",
    "docs/definition-of-complete.md",
    "docs/decisions/conflict-and-assumption-register.md",
    "docs/decisions/decision-log.md",
    "docs/adr/README.md",
    "docs/adr/ADR-template.md",
    "docs/runbook/README.md",
    "docs/runbook/deployment.md",
    "docs/runbook/restore.md",
    "docs/runbook/credential-rotation.md",
    "docs/runbook/incident.md",
    "docs/market-gates/C0.1-icp.md",
    "docs/market-gates/C0.1-interview-guide.md",
    "docs/market-gates/C0.1-baseline-worksheet.md",
    "docs/market-gates/C0.1-design-partner-register.md",
    "docs/market-gates/C0.1-evidence-index.md",
]


def fail(message: str) -> None:
    print(f"P00.1 validation failed: {message}", file=sys.stderr)
    raise SystemExit(1)


for relative in REQUIRED:
    if not (ROOT / relative).is_file():
        fail(f"missing required artifact: {relative}")

matrix = (ROOT / "docs/source-of-truth/module-phase-matrix.md").read_text()
rows = re.findall(r"^\|\s*(\d+)\s*\|", matrix, re.MULTILINE)
numbers = [int(value) for value in rows]
expected = list(range(1, 165))
if sorted(numbers) != expected or len(numbers) != len(set(numbers)):
    fail("matrix must contain PRD rows 1..164 exactly once")

scope = (ROOT / "docs/scope/p00-1-product-baseline.md").read_text()
for heading in ("## Scope note", "## Contract", "## Acceptance checklist", "## Done evidence"):
    if heading not in scope:
        fail(f"scope contract is missing heading: {heading}")

evidence = (ROOT / "docs/market-gates/C0.1-evidence-index.md").read_text()
if "Fabricated evidence" not in evidence or "| OPEN |" not in evidence:
    fail("C0.1 evidence index must explicitly preserve honest OPEN state")

scan_files = [
    ROOT / "docs/market-gates/C0.1-icp.md",
    ROOT / "docs/market-gates/C0.1-evidence-index.md",
    ROOT / "docs/market-gates/C0.1-design-partner-register.md",
]
for path in scan_files:
    text = path.read_text().lower()
    if "fabricated evidence" in text and "not" not in text:
        fail(f"possible fabricated-evidence claim in {path}")

link_pattern = re.compile(r"\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)")
checked = 0
for relative in REQUIRED:
    path = ROOT / relative
    text = path.read_text()
    for target in link_pattern.findall(text):
        if target.startswith(("http://", "https://", "mailto:")):
            continue
        checked += 1
        if not (path.parent / target).resolve().is_file():
            fail(f"broken relative link in {path.relative_to(ROOT)}: {target}")

print(
    "P00.1 validation passed "
    f"(artifacts={len(REQUIRED)}, prd_rows={len(numbers)}, links={checked}, "
    "market_evidence=OPEN)"
)