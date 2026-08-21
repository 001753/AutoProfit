<<<<<<< HEAD
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
=======
# AutoProfit\n\nAutoProfit is a multi-tenant operations platform for managing products, variants, channels, listings, and catalog workflows from one API.\n\n## Run & Operate\n\n- pnpm --filter @workspace/api-server run dev — run the API locally; pending database migrations run before startup\n- pnpm --filter @workspace/api-server run migrate — apply pending migrations explicitly\n- pnpm --filter @workspace/api-server run migrate:check — validate runtime configuration\n- pnpm run typecheck — full typecheck across all packages\n- pnpm run build — typecheck + build all packages\n- pnpm --filter @workspace/db run push — push DB schema changes (dev only)\n- Required env: DATABASE_URL and SESSION_SECRET (minimum 32 characters)\n\n## Stack\n\n- pnpm workspaces, Node.js 24, TypeScript 5.9\n- API: Fastify 5\n- DB: PostgreSQL + pg connection pool\n- Validation: Zod 4\n- Build: esbuild (ESM bundle)\n\n## Where things live\n\n- artifacts/api-server/src/server.ts — HTTP routes, auth hooks, rate limiting, and error handling\n- artifacts/api-server/src/auth.ts — signup, login, sessions, password reset, consent, and permission checks\n- artifacts/api-server/src/catalog.ts — products, variants, and catalog references\n- artifacts/api-server/src/catalog-extensions.ts — channels, listings, search, saved queries, and bulk preview\n- artifacts/api-server/src/migrations — ordered SQL migrations applied by the startup migration step\n- artifacts/mockup-sandbox — visual component preview artifact\n- lib/api-spec/openapi.yaml — public API contract\n- lib/api-client-react and lib/api-zod — generated client and validation types\n\n## Architecture decisions\n\n- Every catalog query is scoped to the authenticated organization through tenant context.\n- Mutations use transactions and audit events to preserve an operational history.\n- Database migrations are tracked in schema_migrations and are safe to run repeatedly.\n- Protected endpoints require an access token and the relevant catalog or organization permission.\n- Destructive catalog actions are archive operations, not hard deletes.\n\n## Product\n\nThe current backend foundation supports organization-aware identity, role-based access, product and variant catalogs, sales channels, listings, catalog search, saved queries, and bulk-operation previews.\n\n## Gotchas\n\n- The API refuses to boot without DATABASE_URL and a sufficiently long SESSION_SECRET.\n- Apply schema changes through numbered migrations; do not edit an already-applied migration.\n- Regenerate the API packages after changing the OpenAPI contract.\n
>>>>>>> origin/main
