# P00.1 — Product baseline dan source-of-truth map

**Classification:** Foundation (`F`)  
**Status:** `PASS` for the documentation scope; P00.2–P00.4 remain open  
**Owner:** Engineering lead / product owner (to be assigned)  
**Date:** 2026-08-11

## Scope note

### In scope

1. Menetapkan otoritas PRD, blueprint, dan roadmap.
2. Memetakan PRD 1–164 ke owner phase/subphase.
3. Menulis aturan scope, kontrak DoC, conflict/assumption register, ADR index,
   dan decision-log template.
4. Menyiapkan runbook continuity template.
5. Menyiapkan C0.1 pack yang dapat diisi dengan evidence nyata.
6. Menyediakan validator markdown/link/coverage.

### Out of scope

Framework, runtime, package installation, database, migration, HTTP server,
authentication, tenant/RBAC, UI, queue, adapter implementation, connector,
billing, cloud provisioning, dan fitur bisnis apa pun.

### Dependency

Tidak ada technical dependency. Input normatif adalah PRD Rev 5, execution
blueprint Rev 5, dan operational roadmap Rev 1.3.

### Risiko dan asumsi terlarang

- Dokumen requirement bukan bukti aplikasi telah berjalan.
- Target C0 adalah hipotesis sampai seller nyata memberi evidence.
- Provider/credential/approval yang belum ada berstatus `BLOCKED`.
- Nomor phase ringkas di PRD tidak menggantikan breakdown `PXX.Y` blueprint.
- Beachhead fashion/aksesoris hanya fokus validasi awal; domain tetap generic.

## Contract

### Domain contract

P00.1 tidak memiliki entity bisnis atau schema database. Artefak yang
dimiliki adalah:

| Artefak | Invariant |
|---|---|
| Source-of-truth map | Semua PRD 1–164 punya tepat satu mapping row |
| Scope policy | Out-of-scope tidak boleh masuk melalui “quick fix” |
| Decision log | Keputusan non-obvious memiliki owner, status, reason, impact |
| Market evidence index | Evidence nyata dibedakan dari template/hipotesis |

Tidak ada state machine, event, transaction boundary, atau API mutation pada
subphase ini.

### API contract

Tidak ada route/API pada P00.1. Validator adalah command lokal, bukan API
production.

### UI contract

Tidak ada UI pada P00.1. Requirement responsive/keyboard berlaku saat P02
dimulai dan tidak boleh dipalsukan sebagai evidence sekarang.

### Migration plan

Tidak ada migration. P00.1 tidak membuat atau mengubah database.

### Test plan

- Coverage: validasi row PRD 1–164 tepat satu kali.
- Link: validasi relative links yang dipakai artefak baseline.
- Integrity: validasi status/required headings pada scope dan market pack.
- Negative policy: scan baseline untuk marker fabricated evidence yang dilarang.

### Integration map

P00.1 menjadi input semua subphase:

```text
PRD Rev 5 ─┐
           ├─> source-of-truth matrix ─> all PXX.Y contracts
Blueprint ─┤
Roadmap ───┘
```

Tidak ada direct database access, queue, cache, storage, realtime, atau
notification integration pada P00.1.

### Observability plan

Tidak ada runtime observability pada P00.1. Evidence command dicatat di
`docs/evidence/p00-1-validation.md`; log validator hanya berisi hasil agregat
dan path file, bukan secret atau PII.

## Acceptance checklist

- [x] Scope dan out-of-scope ditulis.
- [x] Source-of-truth authority ditulis.
- [x] PRD 1–164 dimapping satu per satu.
- [x] Conflict dan assumption register tersedia.
- [x] DoC template dan checklist tersedia.
- [x] ADR index dan decision log template tersedia.
- [x] C0.1 pack tersedia tanpa fabricated evidence.
- [x] Runbook continuity templates tersedia.
- [x] Markdown/link/coverage validator tersedia.
- [x] Checkpoint ide P00.1 ditawarkan; keputusan pengguna: **lanjut tanpa
  perubahan**, kemudian lanjut ke P00.2–P00.4 sesuai blueprint.

## Done evidence

Run:

```bash
python scripts/validate_p001.py
```

The command must print `P00.1 validation passed`. A result of `OPEN` for C0.1
market evidence is expected until the user supplies real seller access and
consent. This is not a failing technical check; it is an explicit market
blocker.
