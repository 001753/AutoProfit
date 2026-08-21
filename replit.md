# AutoProfit — Project Baseline

## Status

Repository baseline untuk `P00.1 — Product baseline dan source-of-truth map`.
Belum ada runtime aplikasi, database schema, endpoint, atau fitur bisnis.
P00.1 adalah fondasi governance dan traceability; ia tidak boleh dinyatakan
sebagai P00 lengkap atau Phase 01/Phase 1 selesai.

**Last reviewed:** 2026-08-11  
**Canonical subphase:** `DOC/AUTOPROFIT_EXECUTION_PHASES_REV5.md`  
**Operational controls:** `DOC/AUTOPROFIT_BUILD_ROADMAP.md`  
**Product requirements:** `DOC/AutoProfit_PRD_Master_Rev5.md`

## Source of truth

1. PRD Master Rev 5 (termasuk Implementation Addendum Rev 5.1) memiliki
   otoritas atas requirement produk.
2. Execution Blueprint Rev 5 memiliki otoritas atas breakdown `PXX.Y`,
   acceptance proof, dan Definition of Complete per subphase.
3. Build Roadmap memiliki otoritas atas urutan, dependency global, change
   control, checkpoint, dan delivery protocol.
4. Bila ada konflik, jangan menebak: catat di
   `docs/decisions/conflict-and-assumption-register.md` dan buat ADR sebelum
   mengubah implementasi.

Traceability lengkap PRD bagian 1–164 berada di
`docs/source-of-truth/module-phase-matrix.md`.

## Current scope: P00.1

### In scope

- Baseline produk dan batas arsitektur yang sudah diputuskan oleh PRD.
- Mapping PRD bagian 1–164 ke phase/subphase canonical.
- Scope policy, subphase contract, DoC checklist, ADR index, dan decision log.
- Template runbook continuity awal.
- C0.1 market-validation pack: ICP, interview guide, baseline worksheet,
  design-partner register, dan evidence index.
- Markdown/link/coverage validation yang repeatable.

### Out of scope

- Framework atau runtime choice baru.
- Schema/migration database, auth, tenant, RBAC, API, UI, queue, connector,
  payment, cloud provisioning, dan fitur bisnis.
- Mengarang interview, observasi, design partner, willingness-to-pay, atau
  capability provider.
- Menyatakan C0, P00, Phase 01, atau Phase 1 `Complete`.

## Rules for future implementation

- Ikuti urutan: contract → schema/migration → domain/application service →
  API → UI → event/job → tests → observability → documentation.
- UI tidak boleh mengakses database langsung.
- `org_id` dari body/query bukan sumber tenant untuk write.
- Semua infrastruktur runtime (queue, cache, storage, realtime, lock,
  notification) harus melalui adapter.
- Tidak ada `catch { return [] }`, dummy business number, silent fallback, atau
  mock production path.
- Credential, approval, sandbox, legal review, dan provider yang belum tersedia
  berstatus `BLOCKED`; jangan menggantinya dengan fixture yang diklaim aktif.
- Semua angka bisnis harus dapat ditelusuri ke source reference; estimated COGS
  harus dibedakan dari actual COGS.

## Commands

P00.1 hanya membutuhkan Python standar yang tersedia di environment:

```bash
python scripts/validate_p001.py
```

Expected result: `P00.1 validation passed`.

Runtime application commands belum tersedia karena P00.2/P00.3 belum
dikerjakan. Jangan membuat run command baru sebelum toolchain dipilih pada
subphase yang tepat.

## Environment and secrets

Belum ada environment variable yang dibaca oleh kode P00.1. Jangan menaruh
secret di repository, markdown, test fixture, atau log. Secret/provider
disiapkan melalui secret flow hanya saat subphase yang membutuhkannya dimulai.

## Definition of Complete

Gunakan `docs/definition-of-complete.md` untuk setiap subphase. Status
`Complete` mensyaratkan evidence yang dapat diverifikasi, bukan sekadar file
yang ada. Untuk P00.1, gate minimum adalah:

- seluruh PRD bagian 1–164 terpetakan;
- konflik dan asumsi terlarang tercatat;
- scope dan contract tersedia;
- template ADR, decision log, dan runbook tersedia;
- C0.1 pack tersedia tanpa fabricated evidence;
- validator markdown/link/coverage lulus;
- checkpoint ide ditawarkan dan keputusan dicatat.

P00.2–P00.4 tetap terbuka sampai benar-benar diimplementasikan dan diuji.
