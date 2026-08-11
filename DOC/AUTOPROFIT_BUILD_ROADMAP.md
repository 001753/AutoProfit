# AUTOPROFIT — BUILD ROADMAP OPERASIONAL

**Versi:** 1.1
**Tanggal penyusunan:** 2026-08-11  
**Status:** Execution roadmap — diturunkan dari `DOC/AutoProfit_PRD_Master_Rev5.md`  
**Bahasa kerja:** Bahasa Indonesia; nama teknis, endpoint, event, dan status mengikuti PRD  
**Tujuan:** Membuat seluruh sistem AutoProfit secara bertahap, terintegrasi, dapat diverifikasi, dan dapat dikerjakan oleh Replit AI tanpa phase raksasa.

> Dokumen ini adalah urutan eksekusi dan quality gate. Dokumen ini **tidak menggantikan** PRD Master. Jika ada konflik, gunakan ketentuan PRD yang paling baru: Rev 5 > Rev 4 > Rev 3.

---

## 1. HASIL YANG HARUS DICAPAI

Roadmap ini tidak menganggap modul selesai karena halaman UI sudah tampil. Setiap unit kerja harus menghasilkan:

1. **Real implementation** — kode, database, API/domain logic, dan UI yang benar-benar terhubung; bukan mock, hardcoded response, atau silent fallback.
2. **Full vertical slice** — jalur pengguna dari UI/API sampai database dan kembali lagi, termasuk error state.
3. **Automated proof** — unit, integration, contract, security, dan E2E test sesuai risiko modul.
4. **Data integrity** — tenant isolation, transaction boundary, idempotency, audit trail, dan recovery path.
5. **Operational readiness** — logging terstruktur, retry/dead-letter bila relevan, health status, migration, dan runbook.
6. **Responsive UX** — loading, empty, success, partial/in-progress, error, keyboard, mobile, tablet, desktop, dan accessibility.
7. **Integration proof** — modul yang sudah dibangun dipakai oleh modul berikutnya melalui API/domain event resmi, bukan akses database langsung.
8. **GitHub checkpoint** — commit dan push setelah gate phase lulus.

### Definisi “no error”

“No error” berarti tidak ada **known failing check** pada scope unit yang dinyatakan Complete: build, type/lint, migration, test, security check, smoke test, dan acceptance checklist semuanya lulus. Error eksternal yang memang dapat terjadi (token marketplace expired, rate limit, network failure) wajib ditangani sebagai state produk yang terlihat, dapat diulang, dan tidak merusak data.

---

## 2. SUMBER KEBENARAN DAN URUTAN BACA

Sebelum mengerjakan unit pertama, Replit AI wajib membaca bagian berikut:

1. PRD Master: Bagian 102 — Definition of Done.
2. Bagian 103, 104, 105, 106, 107, 108, 109 — phase awal, prioritas, boundary, source of truth, event, integrity, observability.
3. Bagian 115–126 — data model, API, connector, accounting, NFR, testing, AI safety, performance, security, billing, analytics.
4. Bagian 127–134 — adapter deployment shared hosting, queue Postgres, backup, monitoring, environment, aturan “Complete”.
5. Bagian 134–140 — DoC Orders, Inventory, Accounting, Marketplace, Auth/Tenant, Dashboard, gate antar phase.
6. Bagian 142–149 — realita API marketplace dan resilience lima tahun.
7. Bagian 150–164 — reachability, PWA, onboarding, raw payload replay, ADR, portability, continuity, dan revisi phase terbaru.

### Aturan prioritas keputusan

- **Rev 5** mengoreksi/menambahkan aturan Rev 4.
- **Rev 4** mengoreksi/menambahkan deployment dan Definition of Complete Rev 3.
- Tokopedia dan TikTok Shop adalah **satu connector engineering** via TikTok Shop Partner Center, tetapi tetap dua `channel` bisnis/pelaporan dan dihitung sebagai dua channel untuk billing.
- Shared hosting adalah target deployment awal. Semua queue, cache, storage, realtime, lock, dan notification wajib melalui adapter.
- WhatsApp P0 disiapkan secara arsitektural sejak Phase 0 dan boleh dikirim setelah dashboard summary tersedia; WhatsApp P1/P2 menunggu gate-nya.
- Cloud migration bukan phase fitur yang dipaksakan; ia dijalankan ketika threshold PRD Bagian 129.1 tercapai.

### Otoritas dokumen dan presedensi subphase

Tiga dokumen berikut memiliki peran berbeda dan tidak boleh diperlakukan
sebagai dua daftar task yang setara:

1. `DOC/AutoProfit_PRD_Master_Rev5.md` adalah **sumber kebenaran produk dan
   requirement**. Jika ada konflik requirement, Rev 5 > Rev 4 > Rev 3.
2. `DOC/AUTOPROFIT_EXECUTION_PHASES_REV5.md` adalah **rujukan tunggal untuk
   breakdown `PXX.Y`, klasifikasi unit kerja, acceptance proof, dan
   Definition of Complete per subphase**.
3. Dokumen ini adalah **rujukan operasional untuk urutan phase, dependency
   global, change control, checkpoint ide, commit, dan push GitHub**.

Jika nama atau jumlah subphase pada ringkasan roadmap berbeda dari blueprint,
ikuti blueprint dan jangan menyatakan phase `Complete` berdasarkan ringkasan
roadmap saja. Perubahan terhadap breakdown wajib diperbarui di kedua dokumen
sebelum dieksekusi; tidak boleh ada dua versi subphase yang berjalan paralel.

### Aturan readiness dependensi eksternal

Credential, approval, sandbox, legal review, atau payment provider yang belum
tersedia adalah status `BLOCKED`, bukan izin untuk membuat integrasi palsu.
Core yang provider-agnostic boleh selesai dan diuji dengan contract fixture,
tetapi capability eksternal hanya boleh disebut `enabled` setelah ada bukti
sandbox/production yang dapat diverifikasi. Untuk billing, entitlement dan
metering wajib selesai tanpa provider; paid billing baru `Complete` bila
provider dipilih, webhook tervalidasi, dan reconciliation terbukti.

### Scorecard kesiapan roadmap setelah revisi

Score ini menilai **kesiapan dokumen untuk dieksekusi**, bukan progress kode dan
bukan jaminan bahwa sistem sudah terbangun:

| Dimensi | Score | Bukti keputusan |
|---|---:|---|
| Traceability PRD → phase/subphase | 9.5/10 | Peta modul, DoC PRD, dan canonical execution blueprint |
| Dependency dan urutan delivery | 9.5/10 | Graph dikoreksi; P15/P16, P17/P18, P19/P20 eksplisit |
| Granularitas unit kerja | 9.5/10 | Blueprint menjadi satu-satunya otoritas `PXX.Y` |
| Definition of Complete dan evidence | 9.5/10 | Checklist contract, migration, test, security, UX, ops |
| Integrity, security, privacy | 9.0/10 | Tenant, reset, consent, PII, retention, audit, PDP evidence gate |
| External dependency honesty | 9.5/10 | `BLOCKED` bila credential/provider/legal review belum tersedia |
| Billing readiness | 9.0/10 | Entitlement/metering terpisah dari paid collection dan reconciliation |
| Operability, continuity, dan release | 9.0/10 | Adapter, backup/restore, runbook, UAT, rollback, GA gate |
| **Rata-rata** | **9.3/10** | Siap dijadikan baseline eksekusi dengan evidence per gate |

Sisa risiko yang sengaja tidak disamarkan: availability provider marketplace,
approval aplikasi eksternal, payment provider pilihan pengguna, legal review
UU PDP, dan validasi reachability oleh minimal tiga bisnis nyata. Risiko tersebut
menjadi dependency atau `BLOCKED`, bukan asumsi dan bukan mock.

---

## 3. KONTRAK WAJIB UNTUK SETIAP SUBPHASE

Tidak boleh mulai coding subphase tanpa mengisi artefak berikut di PR/commit:

| Artefak | Isi minimum |
|---|---|
| Scope note | In-scope, out-of-scope, dependency, risiko, keputusan yang belum boleh diasumsikan |
| Domain contract | Entity, invariant, state machine, event, transaction boundary |
| API contract | Route, auth, request, response, pagination, error code, idempotency |
| UI contract | Route, state lengkap, permission, responsive behavior, empty/error copy |
| Test plan | Unit, integration, negative, isolation, idempotency, E2E, performance/security bila relevan |
| Migration plan | Up/down atau safe forward migration, index, backfill strategy, rollback |
| Observability plan | Log fields, metric, health/sync state, alert, audit event |
| Integration map | Producer/consumer event, adapter yang dipakai, data source of truth |
| Done evidence | Link/hasil command, screenshot E2E bila web UI, dan daftar checklist tercentang |

### Urutan implementasi yang wajib dipakai

```text
Contract → Schema/Migration → Domain/Application Service
→ API → UI → Events/Jobs → Tests → Observability → Documentation
```

Dilarang:

- UI melakukan query atau mutation database secara langsung.
- AI membaca database mentah atau memiliki permission di atas user pemicu.
- Connector menulis langsung ke tabel domain tanpa Integration/Application Layer.
- Menganggap `org_id` dari body/query sebagai sumber tenant untuk operasi tulis.
- Menyembunyikan error dengan data dummy, `catch { return [] }`, atau fallback yang membuat angka terlihat valid.
- Menggabungkan dua subphase hanya agar cepat, tanpa persetujuan perubahan roadmap.

---

## 4. PROTOKOL IDE CHECKPOINT REPLIT AI

Ini adalah aturan proses yang harus dijalankan **setelah setiap subphase dan setiap phase**.

### 4.1 Urutan setelah implementasi

1. Jalankan seluruh validation command yang diwajibkan unit.
2. Perbaiki semua failure dalam scope; jangan memindahkan failure ke phase berikutnya.
3. Tampilkan ringkasan hasil: file/area berubah, test lulus, test yang tidak dapat dijalankan beserta blocker.
4. Tawarkan checkpoint ide khusus kepada pengguna dengan format di bawah.
5. **Berhenti dan tunggu jawaban** sebelum memasukkan ide baru ke scope.
6. Jika pengguna tidak memilih ide atau meminta lanjut, lanjutkan tepat sesuai roadmap.
7. Saat gate lulus, commit dan push ke GitHub.

### 4.2 Format tawaran ide wajib

```text
CHECKPOINT IDE — [Phase/Subphase dan nama]

Implementasi scope selesai dan validation gate:
- [jumlah] unit test lulus
- [jumlah] integration/contract test lulus
- [jumlah] E2E/smoke test lulus
- [status] migration, security, performance, dan accessibility

Ide khusus yang tetap berada di scope [nama modul]:
A. [ide kecil] — nilai, risiko, estimasi kecil, tidak mengubah kontrak
B. [ide integrasi] — nilai pada alur modul ini, dependency, dampak test
C. [ide UX/operasional] — nilai pengguna, tanpa menambah domain baru

Pilih: A/B/C, gabungkan, atau “lanjut tanpa perubahan”.
Jika tidak dipilih, ide tidak diimplementasikan.
```

### 4.3 Batas checkpoint

- Ide hanya boleh memperbaiki modul/subphase yang baru selesai.
- Ide tidak boleh membuat dependency mundur, mengubah source of truth, melewati gate, atau menambah marketplace/AI/payment di luar scope.
- Ide yang mengubah schema inti, kontrak API publik, permission, accounting, atau jadwal phase harus menjadi change proposal terpisah; jangan dikerjakan inline.
- Checkpoint bukan pengganti acceptance test dan bukan izin untuk mengklaim Complete sebelum test lulus.

---

## 5. PROTOKOL GIT DAN CHECKPOINT PHASE

### 5.1 Branch dan commit

- Gunakan branch kerja yang jelas, misalnya `build/phase-00-foundation`.
- Jangan force-push.
- Satu commit phase setelah gate phase lulus; subphase boleh memiliki commit terpisah.
- Format commit phase:

```text
feat(phase-XX): complete [nama phase]
```

- Body commit/PR harus memuat:
  - scope yang selesai,
  - acceptance evidence,
  - test commands dan hasil,
  - migration/rollback notes,
  - known limitation yang memang berada di luar scope,
  - keputusan yang diambil pada checkpoint ide.

### 5.2 Aturan push yang diminta pengguna

Setiap phase **langsung di-commit dan di-push ke GitHub setelah**:

1. semua subphase phase tersebut selesai;
2. phase gate lulus;
3. build/type/lint/test/smoke check lulus;
4. tidak ada migration pending;
5. dokumentasi dan `.env.example` sinkron;
6. checkpoint ide phase sudah ditawarkan dan keputusan pengguna sudah dicatat.

Jika push gagal karena credentials/remote, jangan mengarang keberhasilan. Laporkan error persis, pertahankan commit lokal, dan minta pengguna menghubungkan GitHub atau memperbaiki remote sebelum menyatakan push selesai.

### 5.3 Definition of Complete phase

Sebuah phase Complete hanya jika:

- seluruh subphase-nya Complete;
- gate dependency dari PRD dan gate tambahan roadmap lulus;
- regression test seluruh phase sebelumnya lulus;
- alur integrasi lintas modul yang relevan lulus E2E;
- security/tenant test tidak memiliki failure;
- observability dan runbook untuk fitur yang dirilis tersedia;
- checkpoint ide sudah ditawarkan;
- commit phase sudah dipush ke GitHub.

---

## 6. MATRiks PHASE DAN DEPENDENCY

```text
P00 Delivery control & deployment skeleton
 └─ P01 Identity, tenant & authorization
     ├─ P02 UX shell, PWA & onboarding
     └─ P03 Catalog & product
         ├─ P04 Customer & orders
         │   └─ P05 Inventory & warehouse
         │       └─ P06 Dashboard, import & portability
         │           └─ P07 Connector platform & raw payload
         │               ├─ P08 Shopee connector
         │               ├─ P09 Tokopedia+TikTok Shop connector
         │               ├─ P10 Lazada connector
         │               └─ P11 Blibli connector
         └─ P12 Accounting core
             └─ P13 Profit, cash & financial reports
                 └─ P14 Settlement & bank reconciliation
 P05 + P13 ────────────────────────────────┘
 P06 ── P16 Notification & automation
 P13 ── P15 Purchasing & supplier
 P13 + P16 ── P17 AI read-only copilot
 P17 + P15 + P16 + P12/P13 ── P18 AI action layer & business memory
 P06 + P16 ── P19 WhatsApp P0
 P19 + P17 + P18 + P15/P12 ── P20 WhatsApp approval/assistant
 P01 + P06 ── P21 Billing, plans & feature flags
 P06 + P13 + P16 + P17 ── P22 Analytics & advanced workspace
 P13 + P21 + P22 ── P23 Advanced finance, multi-business & public API
 P00–P23 ── P24 Security, performance, UAT & GA
 P24 + threshold Bagian 129.1 ── P25 Cloud migration
```

P25 dapat mulai lebih awal sebagai persiapan, tetapi cutover production hanya boleh dilakukan saat trigger dan runbook migrasi lulus.

---

# 7. RINCIAN PHASE — RINGKASAN OPERASIONAL

Rincian di bawah ini adalah ringkasan tujuan dan gate untuk pengendalian
roadmap. Ia **bukan** daftar subphase canonical. Untuk task `PXX.Y`, gunakan
`DOC/AUTOPROFIT_EXECUTION_PHASES_REV5.md`; jumlah dan nama subphase pada
blueprint tersebut mengalahkan ringkasan ini.

## P00 — DELIVERY CONTROL DAN DEPLOYMENT SKELETON

**Tujuan:** Menyiapkan tempat yang benar untuk membangun, menjalankan, menguji, mengamati, dan memulihkan sistem. Tidak membangun fitur bisnis.

### P00.1 — Product baseline, backlog contract, dan ADR

**Output**

- `replit.md` berisi stack, command, environment, aturan adapter, source-of-truth, dan Definition of Complete.
- Peta modul PRD → phase/subphase di dokumen ini.
- Template PR/subphase, checklist DoC, dan `docs/adr/`.
- ADR awal minimal: shared hosting, Postgres queue, UUID, SSE/polling, storage adapter, boundary UI/API/domain.
- `docs/runbook/` dengan template incident, restore, credential rotation, dan deployment.

**Acceptance**

- Tidak ada modul PRD yang tidak terpetakan.
- Semua keputusan non-obvious yang dipakai Phase 0 memiliki ADR.
- Scope P00 disetujui; tidak ada fitur bisnis terselip.

**Tests/evidence:** markdown/link check, daftar coverage modul, review dependency graph.

### P00.2 — Toolchain, CI, environment, dan quality gates

**Output**

- Project skeleton sesuai stack yang dipilih setelah inspeksi runtime aktual.
- `package.json`/config, build, test, lint/typecheck, migration command.
- `.env.example` sinkron dengan env yang benar-benar dibaca kode.
- CI untuk install, build, test, lint/typecheck, migration check, dependency audit.
- local → staging synthetic → production contract terdokumentasi.

**Acceptance**

- Fresh checkout dapat install/build/test tanpa langkah tersembunyi.
- Secret tidak masuk repo/log.
- Node runtime dipin ke LTS yang tersedia/terverifikasi.

### P00.3 — Adapter layer, server, health, dan observability baseline

**Output**

- `QueueAdapter`, `CacheAdapter`, `StorageAdapter`, `RealtimeAdapter`, `LockAdapter`, `NotificationChannel`.
- Default shared-hosting: Postgres queue, in-memory cache, logical storage key, SSE + polling fallback, PG advisory lock, in-app notification.
- HTTP server di `$PORT`, `/health` memeriksa DB dan scheduler heartbeat.
- structured logging dengan request ID, error boundary, graceful shutdown.
- pool PostgreSQL aman (`DB_POOL_MAX` default 6), tidak membuka koneksi per request.

**Acceptance**

- Health mengembalikan non-200 jika DB/job poller unhealthy.
- Queue `pending → processing → done/failed/dead` dengan retry/backoff dan `FOR UPDATE SKIP LOCKED`.
- Dua proses simulasi tidak mengeksekusi job/cron yang sama.
- Tidak ada import Redis/worker/WebSocket langsung di domain.

**Gate P00:** clean build, migration smoke, health smoke, queue concurrency test, structured log sample, dan deploy skeleton start berhasil.  
**Push:** `feat(phase-00): complete delivery control and deployment skeleton`.

---

## P01 — IDENTITY, MULTI-TENANCY, SESSION, DAN RBAC

**Tujuan:** Memenuhi DoC Auth & Multi-Tenancy PRD Bagian 138.

### P01.1 — Organization, membership, seed, dan tenant context

- Schema `organization`, `user`, `membership`, role/permission catalog, soft delete/audit fields.
- Tenant context hanya dari authenticated claims/session.
- Default COA template reference dan timezone/currency organization.
- Query helper/repository yang selalu mewajibkan tenant scope.

**Acceptance:** query lintas tenant ditolak pada API, search, export, cache key, dan queue payload; tests eksplisit untuk kelima jalur.

### P01.2 — Auth, password recovery, refresh rotation, dan active sessions

- Signup/login/logout, bcrypt/argon2, access JWT 15 menit.
- Password reset via email/token sekali pakai dengan expiry, generic response
  untuk mencegah account enumeration, dan audit event. Token reset tidak boleh
  dipakai ulang; reset password menginvalidasi sesi aktif.
- Refresh token 30 hari, rotation, reuse detection, session invalidation.
- Session list/revoke per device; password change invalidates all sessions.
- Auth rate limit 20/min termasuk login dan reset password; brute-force
  backoff/lockout yang dapat dipulihkan; default API rate limit 120/min.

**Acceptance:** reset token expired atau reused ditolak, reset menginvalidasi
sesi aktif, dan response tidak membocorkan keberadaan akun; refresh token lama
tidak dapat dipakai kembali; reuse menginvalidasi sesi user; rate limit login
dan reset benar-benar 429.

### P01.3 — RBAC, permission middleware, audit, dan consent

- Role Owner, Finance, Purchasing, Operations, Admin minimal; permission matrix.
- Approve PO, post journal, export finance, manage channel, dan manage members.
- Audit log immutable secara aplikasi; before/after, actor, IP, source.
- Signup menyimpan persetujuan ToS dan Privacy Policy yang versioned, timestamp,
  policy version, subject, dan source. Perubahan policy memiliki re-consent
  flow; withdrawal consent menghentikan pemrosesan opsional tanpa menghapus
  transaksi/journal yang wajib disimpan.

**Acceptance:** setiap kombinasi role × critical permission menjadi
negative/positive test; semua mutation sensitif memiliki audit; reset token
sekali pakai dan consent/re-consent memiliki negative test.

**Gate P01:** DoC Bagian 138 100%, tenant isolation regression hijau,
password-reset/recovery E2E hijau, consent record/re-consent negative test
hijau, session/revoke E2E hijau, no critical dependency audit.
**Push:** `feat(phase-01): complete identity tenancy and authorization`.

---

## P02 — UX SHELL, RESPONSIVE DESIGN SYSTEM, PWA, DAN ONBOARDING

**Tujuan:** Memberi UI nyata yang konsisten serta jalur signup → nilai pertama tanpa mengganggu domain.

### P02.1 — Design system dan application shell

- Quietly Premium: typography, color, spacing, border/radius, cards, tables, buttons, form, toast, modal, status.
- Simple/Pro mode, global navigation, command palette shell, universal search shell.
- Responsive breakpoints PRD: `<640`, `640–1024`, `1024–1440`, `>1440`.
- Keyboard navigation, focus state, contrast, semantic landmarks.

### P02.2 — PWA dan realtime client abstraction

- Installable manifest, service worker asset cache, update prompt, offline-safe read cache.
- Satu client hook untuk SSE → fallback polling 5 detik.
- In-app notification channel memakai interface generik.
- Tidak mengklaim transaksi offline berhasil; mutation offline masuk state jelas atau ditolak.

### P02.3 — Self-serve onboarding dan industry COA wizard

- Wizard kategori: Fashion, F&B, Elektronik, Kecantikan, Lainnya.
- Mapping subset COA + category/SKU costing defaults.
- Setup business profile, timezone, currency, first warehouse, first channel/manual data.
- Reachability event dan timestamp dari signup sampai angka nyata pertama.

**Acceptance:** pengguna baru dapat mencapai dashboard dalam <10 menit menggunakan data nyata/sandbox; istilah accounting lanjutan progressive disclosure; semua wizard failure resumable.

**Gate P02:** visual states complete pada mobile/desktop, accessibility smoke, PWA install smoke, onboarding E2E, `NotificationChannel` integration.  
**Push:** `feat(phase-02): complete UX shell PWA and onboarding`.

---

## P03 — PRODUCT, VARIANT, SKU, LISTING, DAN BASIC CATALOG

### P03.1 — Product/variant domain

- `product`, `variant`, SKU uniqueness per tenant, barcode, attributes, category, brand, tax class, cost method.
- Create/edit/archive; no destructive deletion bila sudah dipakai transaksi.
- Application services dan API cursor pagination.

### P03.2 — Channel listing mapping

- `channel_listing` mapping variant ↔ external SKU/product.
- Mapping status, conflict handling, duplicate SKU prevention.
- UI product list/detail, variant editor, mapping status.

### P03.3 — Catalog search, bulk, barcode foundation

- Search via API, filters, saved query contract.
- Bulk import validation preview, partial failure report.
- Barcode field and scanner input abstraction; hardware integration tidak dipalsukan.

**Acceptance:** duplicate SKU rejected; archived SKU tidak hilang dari historical order; tenant isolation; list P95 <500ms pada synthetic dataset; UI all states.

**Gate P03:** catalog CRUD E2E, migration rollback rehearsal, API contract tests, import negative cases.  
**Push:** `feat(phase-03): complete product and catalog foundation`.

---

## P04 — CUSTOMER DAN ORDER CORE

**Dependency:** P01, P03.

### P04.1 — Customer domain

- Customer CRUD, merge duplicate dengan audit, PII access audit, channel origin dan tags.
- Search/pagination; masked display sesuai permission.

### P04.2 — Manual order dan lifecycle

- Order/order item/payment, totals reconstructed from items + fees.
- State machine: unpaid, paid, processing, shipped, delivered, cancelled, returned; ilegal transition ditolak.
- Idempotency-Key untuk create; timeline event.

### P04.3 — Order effects dan edge cases

- `ORDER_PAID` event contract, payment status, partial/full cancellation, return, refund.
- Reservation call ke Inventory hanya melalui application event contract yang disiapkan untuk P05.
- Reversing financial event contract tidak membuat journal palsu sebelum P12.

**Acceptance mengikuti DoC Bagian 134:** tiga source (manual, webhook fixture, polling fixture) menghasilkan Unified Order identik; duplicate paid tidak menggandakan efek; partial/full return memiliki state dan audit; 50.000 synthetic orders P95 list <500ms; partial-sync ditampilkan jujur.

**Gate P04:** order lifecycle, idempotency, totals, permissions, PII, E2E UI/API lulus.  
**Push:** `feat(phase-04): complete customer and order core`.

---

## P05 — INVENTORY, WAREHOUSE, RESERVATION, TRANSFER

**Dependency:** P04.

### P05.1 — Stock ledger dan warehouse

- `warehouse`, `stock_item`, immutable `stock_movement`.
- Receipt, sale, adjustment, return, damage; available formula.
- No UPDATE/DELETE stock movement; correction by adjustment.

### P05.2 — Reservation dan concurrency

- Reserve/release/commit stock transactionally with order effects.
- Expiry/cancel job, explicit insufficient-stock error, no silent negative stock.
- Concurrent test: 20 orders for 15 units → exactly 15 reserves succeed.

### P05.3 — Multi-warehouse transfer dan costing

- Transfer out/in, In Transit, no double availability.
- Weighted average per warehouse/variant; FIFO option contract.
- Cost snapshot boundary for future accounting.

**Acceptance mengikuti DoC Bagian 135:** immutable ledger, race correctness, transfer, auto-release, no negative/oversell, valuation reconciliation to account 1300 contract.

**Gate P05:** stock/order E2E, concurrency test, job scheduler test, inventory API/UI states, performance query plan evidence.  
**Push:** `feat(phase-05): complete inventory and warehouse operations`.

---

## P06 — DASHBOARD HOME, IMPORT ENGINE, EXPORT, DAN DATA PORTABILITY

**Dependency:** P01, P04, P05; accounting data adapter boleh read empty/partial sampai P13.

### P06.1 — Import dan data cleaning

- CSV/JSON import products, customers, orders, opening stock, opening balance contract.
- Upload validation, preview, column mapping, duplicate strategy, row-level errors, resumable async job.
- Raw import file logical key via StorageAdapter.

### P06.2 — Dashboard summary dan Home

- `dashboard_summary_daily`; hourly refresh + event-triggered refresh.
- Business Snapshot: revenue, profit, cash, attention, Today Mode.
- Drill-down route contract ke order/stock/journal source; incomplete data warning.
- Dashboard read path tidak melakukan heavy aggregation on request.

### P06.3 — Universal search, command palette, export, portability

- Search hanya lewat API, tenant scoped, permission-aware.
- Async export CSV per entity + JSON gabungan orders/items/journals/accounts/stock.
- Self-serve export tidak dibatasi tier, notification saat job selesai.

**Acceptance mengikuti DoC Bagian 139:** cached dashboard <1s, background sync tidak memblokir, angka belum lengkap jujur, drill-down tidak putus; portability job dapat diulang dan diaudit.

**Gate P06:** first-value E2E <10 menit dengan sandbox/real synthetic data, 50k row export streaming, dashboard performance baseline.  
**Push:** `feat(phase-06): complete dashboard import and data portability`.

---

## P07 — CONNECTOR PLATFORM, SYNC ENGINE, RAW PAYLOAD, DAN RETRY

**Dependency:** P03, P04, P05, P06.

### P07.1 — Connector contract

- Interface `authenticate`, `fetchProducts`, `fetchOrders`, `fetchInventory`, `fetchSettlements`, `handleWebhook`, `mapToUnifiedOrder`, `mapToUnifiedProduct`, `healthCheck`.
- Connector registry, channel config, credential reference via secret manager, per-connector circuit breaker.
- Unified schema diperluas dengan `ads_fee` tanpa merusak mapping lama.

### P07.2 — Sync orchestration

- Webhook-first + polling safety net; polling schedule sesuai kelas marketplace.
- `sync_event_log`, idempotency hash, cursor, sync run summary, successful/failed count, reason, retry.
- Error categories: AUTH_EXPIRED, RATE_LIMITED, PRODUCT_NOT_FOUND, TEMPORARY_UNAVAILABLE, PERMANENT_FAILURE.

### P07.3 — Raw payload preservation dan replay

- Simpan payload utuh ke StorageAdapter sebelum parsing.
- `raw_payload_key` wajib pada event log.
- `reprocess_raw_payload` queue job dengan mapping version dan regression safety.

**Gate P07:** mock connector contract, duplicate event, retry/dead-letter, circuit breaker isolation, raw payload/replay test, health UI contract. Tidak ada connector vendor production yang boleh dipalsukan pada phase ini.

**Push:** `feat(phase-07): complete connector platform and sync foundation`.

---

## P08 — SHOPEE CONNECTOR

### P08.1 — Credential/onboarding dan auth

- Shopee Open Platform v2, Partner ID/Key, OAuth shop token, HMAC-SHA256 signing.
- Region Indonesia eksplisit; sandbox dan production config terpisah.
- Secret tidak masuk DB plaintext/log.

### P08.2 — Product/order/inventory/settlement mapping

- Field mapping document asli → Unified schemas.
- Fetch cursor, order status, fees, shipping, buyer PII handling.
- Settlement payload masuk queue reconciliation tanpa memproses accounting penuh sebelum P13.

### P08.3 — Webhook, production-like error, dan pilot

- order/product/inventory/settlement events yang tersedia.
- Contract mock untuk incomplete payload, timeout, 429, expired token.
- Custom App pilot/UAT fixture; production credentials hanya setelah user menyediakan credential melalui secret flow.

**Gate P08:** DoC Bagian 137 + 148 untuk Shopee; sample mapping mendekati payload nyata/sandbox; raw payload selalu ada; one-connector pilot E2E.  
**Push:** `feat(phase-08): complete Shopee connector`.

---

## P09 — TOKOPEDIA + TIKTOK SHOP CONNECTOR

**Catatan:** Satu adapter engineering, dua channel bisnis/pelaporan.

### P09.1 — Partner Center auth dan channel separation

- App Key/Secret, signature scheme, OAuth, region Indonesia immutable.
- Satu connector credential dapat menghasilkan channel asal `tokopedia` atau `tiktokshop`.
- Billing/pelaporan menghitung channel bisnis secara terpisah.

### P09.2 — Mapping, GMV Max/ads fee, sync

- Mapping payload Tokopedia & Shop ke Unified Order/Product/Settlement.
- `ads_fee` dan akun 6300 contract; tidak mengarang nilai jika API tidak menyediakannya.
- Status, fees, shipping, inventory, settlement, webhook/polling sesuai capability aktual.

### P09.3 — Sandbox, rate limit, dan changelog readiness

- Sandbox vs production rate limit test terpisah.
- API changelog entry dan internal connector CHANGELOG.
- Pilot custom app dan sample real/sandbox.

**Gate:** connector contract + DoC 137/148, dua channel teruji terpisah, tidak ada duplicate cross-channel, raw replay, circuit breaker.  
**Push:** `feat(phase-09): complete Tokopedia and TikTok Shop connector`.

---

## P10 — LAZADA CONNECTOR

### P10.1 — Lazada Open Platform auth/signing

- App Key/Secret, seller OAuth, TOP HMAC signing.
- Dilarang memakai Seller Center API lama.

### P10.2 — Capability mapping dan sync

- Product, order, inventory, settlement, webhook bila tersedia.
- Unsupported capability harus ditampilkan sebagai unsupported, bukan sukses kosong.

### P10.3 — Contract/UAT/resilience

- Mock error/rate limit/token expiry/incomplete payload.
- Raw payload, replay, sync observability, mapping evidence.

**Gate:** DoC connector dan regression seluruh core commerce/accounting contract.  
**Push:** `feat(phase-10): complete Lazada connector`.

---

## P11 — BLIBLI CONNECTOR

### P11.1 — UAT OAuth

- OAuth2 client credentials + refresh/bearer sesuai environment UAT.
- Environment UAT/production explicit; feature capability matrix.

### P11.2 — Product/order/promo/webhook scope

- Implementasi hanya fitur yang tersedia/terverifikasi.
- Unsupported fulfillment/promo behavior tidak boleh disamarkan.

### P11.3 — Contract, raw payload, and operational docs

- Contract mock, retry, health, replay, monthly change review entry.
- Dokumen batasan “fully-supported” harus berbasis evidence.

**Gate:** DoC connector; minimal one end-to-end channel path per capability; API limitations documented in UI and docs.  
**Push:** `feat(phase-11): complete Blibli connector`.

---

## P12 — ACCOUNTING CORE DAN DOUBLE-ENTRY INTEGRITY

**Ini gate paling ketat. P14, tax, dan financial reporting lanjutan tidak boleh menganggap P12 selesai sebelum semua item lulus.**

### P12.1 — COA, period, journal, ledger

- `account`, default COA 1000–6990, industry subset compatibility.
- `accounting_period`, journal entry/line, posted/draft/reversed.
- Append-only journal; no edit/delete posted entry.

### P12.2 — Deterministic posting rules

- `ORDER_PAID`, marketplace fee, settlement received, order returned, purchase received, supplier paid.
- Pure deterministic functions; debit = credit per entry; account/dimension correct.
- Order COGS snapshot and inventory value source contract.

### P12.3 — Close, reverse, currency, and trial balance

- Open/closing/closed; checklist approval.
- Reversing entry after closed period references original, never mutates it.
- Multi-currency base amount, exchange rate snapshot, 6950 FX difference.
- Trial balance and ledger drill-down.

**Acceptance mengikuti DoC Bagian 136:** every posting rule tested, closed-period negative test, 2+ currencies, large synthetic trial balance, one source of truth with reports/dashboard.

**Gate P12:** 100% posting-rule tests, property/invariant tests for balance, transaction rollback tests, permission tests, no known finance defect.  
**Push:** `feat(phase-12): complete accounting core`.

---

## P13 — CASH, COGS, REAL PROFIT, DAN FINANCIAL REPORTS

**Dependency:** P05, P06, P12, connector settlement contracts.

### P13.1 — Cash management dan bank account

- Cash/bank accounts, cash in/out, transfer, opening balance, source link, audit.
- No direct balance edits; adjustment via append-only event.

### P13.2 — Real Profit Engine

- Revenue, marketplace/payment/shipping fee, COGS, ads fee, return, operational expenses.
- Estimated vs actual profit; incomplete COGS warning; per channel/warehouse/customer dimensions.

### P13.3 — Reports

- P&L, balance sheet, cash flow, trial balance, account ledger.
- Async heavy reports, progress/notification, export.
- Dashboard metrics consume same financial read model/source.

**Gate:** report figures trace to journal/order/stock, dashboard/report consistency test, custom range async <60s target on baseline, P95 baseline recorded.  
**Push:** `feat(phase-13): complete cash profit and financial reporting`.

---

## P14 — SETTLEMENT RECONCILIATION DAN BANK RECONCILIATION

**Dependency:** P08–P11 as available connectors + P12/P13.

### P14.1 — Marketplace settlement

- Settlement/settlement line ingestion, match by order/ref/amount/period.
- matched, partial, unmatched, exception; fee/adjustment/ads fee handling.

### P14.2 — Exception workflow

- Unmatched transaction queue, explain reason, manual match with permission, split/merge rules, audit.
- Retry/re-import safe; no duplicate settlement or journal.

### P14.3 — Bank reconciliation

- Bank statement import, normalization, suggested match, manual resolve, discrepancy posting.
- Report reconciliation status and period close dependency.

**Gate:** reconciliation <1 hour lag at target load, duplicate/idempotency, exception cannot disappear, all resolutions auditable, closed-period behavior correct.  
**Push:** `feat(phase-14): complete settlement and bank reconciliation`.

---

## P15 — PURCHASING, SUPPLIER, REORDER, DAN APPROVAL

### P15.1 — Supplier and supplier analytics

- Supplier, terms, lead time, score, history, spend/performance metrics.

### P15.2 — Purchase order lifecycle

- Draft → pending approval → approved → partial received → received/cancelled.
- Approval role, limits, audit, idempotent transitions.

### P15.3 — Receiving, stock, accounting, reorder

- PO receiving updates stock movement and posts `PURCHASE_RECEIVED`.
- Partial receive/backorder, landed cost contract if applicable.
- Reorder suggestion from stock/lead time/sales; draft only unless approved.

**Gate:** PO → receiving → inventory → AP/journal → supplier analytics E2E; approval negative tests; duplicate receive safe.  
**Push:** `feat(phase-15): complete purchasing and supplier operations`.

---

## P16 — NOTIFICATION CENTER DAN AUTOMATION ENGINE

### P16.1 — Notification center and channels

- Notification entity, critical/attention/information/success, read state.
- in-app fully implemented; email/WhatsApp adapter contract.
- order, low stock, sync failed, reconciliation exception, report complete.

### P16.2 — Rule/trigger/condition/action

- `automation_rule`, event/schedule triggers, conditions, actions through domain APIs.
- dry-run/preview, approval_required, execution log.

### P16.3 — Reliability and safety

- Idempotent execution, retry/dead-letter, concurrency lock, rate control.
- Prevent infinite loops (inventory outbound/inbound, notification recursion).
- Pause/disable rule, audit, alert on repeated failure.

**Gate:** at least order, low stock, sync failure, and report complete flows end-to-end; no direct DB action; approval safety; duplicate event produces one action.  
**Push:** `feat(phase-16): complete notifications and automation`.

---

## P17 — AI READ-ONLY BUSINESS COPILOT DAN EXPLAIN-THIS

**Dependency:** P06, P13, P16.

### P17.1 — AI boundary, provider adapter, and evidence model

- Provider/model access only through service adapter and secret flow.
- AI cannot query DB; read-only tools call domain/API services.
- `ai_insight`, evidence references, confidence, model version, insufficient_data.

### P17.2 — Read-only tool registry

- `get_profit_breakdown`, dashboard snapshot, inventory status, order/search/report summary.
- Tool schema, tenant/role filtering, timeout, budget, structured response.

### P17.3 — Copilot and Explain This UI

- `POST /v1/ai/copilot/ask`, grounded answer, evidence links, confidence.
- Why → What → Do layout; no invented number; external content marked data, not instruction.
- Feedback/review/ignore event.

**Gate:** Bagian 120.2 AI grounding test; every answer evidence-valid; prompt-injection fixture rejected; tenant isolation; insufficient data explicit; graceful provider failure.  
**Push:** `feat(phase-17): complete grounded read-only AI copilot`.

---

## P18 — AI ACTION LAYER DAN BUSINESS MEMORY

### P18.1 — Tool risk registry

- Risk 0 read, risk 1 draft, risk 2 confirmation, risk 3 approval role.
- `create_purchase_order_draft`, `submit_purchase_order`, campaign budget contract.

### P18.2 — Approval and execution

- AI proposal → impact/cost/risk → human confirmation/role approval → same Domain API as manual → audit `source=ai_copilot`.
- Expiry, duplicate confirmation, permission downgrade, and rollback/reversal behavior.

### P18.3 — Business memory

- Store only tenant-authorized facts/preferences/decisions with source/evidence and retention.
- User can view/correct/delete permitted memory; no hidden training claim.

**Gate:** action never bypasses permission, duplicate execute safe, audit complete, evidence and confidence required, provider failure does not partially execute.  
**Push:** `feat(phase-18): complete AI action safety and business memory`.

---

## P19 — WHATSAPP P0: PUSH NOTIFICATION DAN READ-ONLY QUERY

**Boleh dimulai setelah P06 dan P16, tanpa menunggu P20. External credential/API approval adalah dependency nyata, bukan alasan membuat fake integration.**

### P19.1 — WhatsApp adapter dan webhook security

- `NotificationChannel=whatsapp`, provider adapter, outbound queue, HMAC/signature verification, retry/dead-letter.
- Consent/opt-in, phone normalization, rate limit, delivery status.

### P19.2 — Business notifications

- Order masuk, low stock, sync failed, reconciliation exception, report ready.
- Notification preference, quiet hours, fallback in-app.

### P19.3 — Read-only chat queries

- Reuse `getDailySnapshot(orgId,date)` dan inventory/order read services.
- Query commands terbatas dan deterministic; ambiguous query meminta klarifikasi.
- Never mutate data.

**Gate:** P0 DoC-equivalent + 30 hari observasi pemakaian nyata sebelum P20; webhook duplicate safe; tenant/phone binding; no sensitive data leakage.  
**Push:** `feat(phase-19): complete WhatsApp P0 access channel`.

---

## P20 — WHATSAPP P1/P2: APPROVAL DAN ASSISTANT ACTION

### P20.1 — Interactive approval

- Approve/reject PO nilai kecil sesuai role/limit.
- Signed one-time action token, expiry, replay prevention, confirmation receipt.

### P20.2 — Transaction input (hanya bila P0/P1 terbukti)

- Natural language input tidak langsung posting; parsing → draft → review → approval.
- Ambiguous amount/account/entity selalu meminta klarifikasi.

### P20.3 — AI assistant policy

- Reuse P17/P18 tool registry, evidence, risk, audit; channel tidak memiliki privilege ekstra.

**Gate:** P19 30-day evidence, approval E2E, replay/security tests, financial posting parity with web UI.  
**Push:** `feat(phase-20): complete WhatsApp approvals and assistant actions`.

---

## P21 — BILLING, PLANS, METERING, DAN FEATURE FLAGS

### P21.1 — Plan/entitlement

- Starter gratis, Growth, Business, Enterprise; limits dari PRD.
- Channel Tokopedia/TikTok tetap dua channel billing.
- Entitlement service dipakai API/UI/domain, bukan hardcoded UI.

### P21.2 — Usage metering

- orders_this_period, channels, users, automation, AI usage.
- Reset billing period, >80% warning, overage tetap process dan ditagih add-on.
- Trial 14 hari Growth tanpa kartu; payment provider hanya jika dipilih/terhubung.

### P21.3 — Admin/pricing UX dan feature flags

- Transparent usage progress, upgrade/overage explanation, entitlement denial clear.
- Flag rollout, tenant-level override audit, safe default.

**Billing status:** entitlement/metering/trial dapat `Complete` tanpa provider.
Paid collection tetap `BLOCKED` sampai provider dipilih dan terhubung, webhook
signature/idempotency tervalidasi, invoice/charge state dapat direkonsiliasi,
dan failure/refund flow diuji. Jangan mengarang provider, invoice, atau charge.

**Gate:** entitlement matrix tests, period reset idempotent, overage does not
stop order, no plan bypass via API, billing event audit.
**Push:** `feat(phase-21): complete billing metering and feature flags`.

---

## P22 — ANALYTICS, SAVED VIEWS, CUSTOM DASHBOARD, BULK, DOCUMENT

### P22.1 — Analytics taxonomy dan North Star

- Events snake_case: dashboard_viewed, channel_connected, order_synced, inventory_synced, reconciliation_resolved, insight_action_approved, etc.
- `org_id`, `user_id`, timestamp, entity_id, properties; PII minimization.
- Assisted decision derived metric, not vanity count.

### P22.2 — Custom dashboard dan saved views

- Widget definitions from approved read models, filter/date/channel/warehouse scopes.
- Save/share permission, loading/empty/error/stale states.
- No arbitrary SQL from user/config.

### P22.3 — Bulk, barcode, document, export extensions

- Bulk operations with preview, per-row result, idempotency, permission.
- Barcode workflow connected to inventory/order APIs.
- Invoice/financial document generation through StorageAdapter, object backup.

**Gate:** analytics events do not alter transaction truth; dashboard widget performance; bulk partial failure recoverable; generated documents retrievable and auditable.  
**Push:** `feat(phase-22): complete analytics and advanced workspace`.

---

## P23 — ADVANCED FINANCE, MULTI-BUSINESS, MULTI-CURRENCY, TAX, PUBLIC API

### P23.1 — Multi-business membership

- User switches organization safely; active tenant context visible; no cross-tenant cache/session leakage.
- Consolidated view only with explicit permission and isolated queries.

### P23.2 — Advanced tax dan multi-currency UX

- Tax classes, tax reports, configurable Indonesian tax mapping, period lock integration.
- Multi-currency UI progressive disclosure; report conversion based on snapshot/rules.
- Tax behavior requires legal/product review; do not invent regulatory claims.

### P23.3 — Public API dan outbound webhooks

- Versioned `/v1`, scoped API keys/OAuth contract, rate limit, idempotency, pagination.
- Outbound webhook HMAC, retry 3x backoff, dead letter, replay, subscriber management.
- Public connector interface documentation and third-party contract test kit.

**Gate:** multi-business isolation suite, financial/tax invariant tests, public API security/abuse tests, backward compatibility contract, docs/runbook.  
**Push:** `feat(phase-23): complete advanced finance and public platform`.

---

## P24 — SECURITY, PERFORMANCE, UAT, RELEASE CANDIDATE, DAN GA

Ini bukan tempat menambal modul yang belum selesai. P24 hanya melakukan hardening dan membuktikan semua gate.

### P24.1 — Full regression and data integrity

- Unit/integration/E2E full suite.
- Accounting debit=credit, stock race, idempotency, tenant isolation, AI grounding.
- Migration from empty DB and representative synthetic dataset.

### P24.2 — Performance and capacity

- Dashboard cached <1s/cold <2.5s; light read <500ms; manual order <800ms; search <300ms.
- Load baseline 10.000 order/day per large tenant model, sync and reconciliation lag <1h.
- P95 regression >20% blocks release.
- EXPLAIN ANALYZE evidence for new hot queries; no N+1.

### P24.3 — Security and operational readiness

- Dependency scan each build, SAST, auth/session/rate limit/PII/secret review.
- Backup restore rehearsal; shared-hosting RPO/RTO truth displayed in Trust/ToS.
- `/health`, external uptime monitor plan, Sentry/error tracking plan, alert routing.
- Runbooks: restore, rotation, connector suspension, incident, deployment, rollback.
- Privacy/data-governance evidence: PII inventory and purpose, retention/legal
  hold policy, consent/withdrawal, access/correction/deletion request lifecycle
  untuk data yang boleh dihapus, immutable audit retention, dan legal/product
  review sebelum klaim kepatuhan publik. Data transaksi/journal tidak boleh
  dihapus untuk memenuhi request bila kewajiban retensi mengharuskannya.

### P24.4 — UAT and GA

- Minimum 3 real businesses representing Dela/Rian/Sarah; synthetic data is not enough.
- UAT checklist per DoC; accessibility/mobile/browser smoke.
- Release notes, known limits, onboarding/support materials, rollback decision.
- GA only after all P0 gates and business sign-off.

**Gate P24:** all PRD P0 DoC 134–139, marketplace 137/148, testing 120,
NFR 119/128, reachability target evidence, continuity artifacts, privacy/
data-governance evidence, dan tidak ada unresolved critical/high finding.
**Push:** `feat(phase-24): complete hardening and GA readiness`.

---

## P25 — CLOUD MIGRATION (TRIGGERED, ADAPTER SWAP, NO REWRITE)

**Trigger wajib:** salah satu dari >3.000 order/bulan total, >50 tenant aktif, DB connection sustained >70%, atau kebutuhan worker/WebSocket/Enterprise SLA yang tidak dapat dipenuhi shared hosting.

### P25.1 — Provision dan migration rehearsal

- Cloud app/container, managed PostgreSQL, Redis, object storage.
- Logical replication/backup restore rehearsal, checksum/count comparison, cutover/rollback runbook.

### P25.2 — Adapter switch

```text
QUEUE_ADAPTER=postgres → redis
CACHE_ADAPTER=memory → redis
STORAGE_ADAPTER=local → s3
REALTIME_ADAPTER=sse → websocket
```

- Domain/application logic tidak diubah untuk swap.
- Worker terpisah hanya untuk job berat; handler tetap sama.

### P25.3 — Cutover dan observation

- Read-only old instance, DNS TTL reduction, 5–10 minute write freeze, final replication check.
- 72-hour observation, rollback <30 minutes, no split-brain.
- Re-run performance, security, backup, and UAT smoke after cutover.

**Gate:** migration rehearsal succeeds twice, data checksum reconciled, rollback tested, target cloud RPO ≤15m/RTO ≤4h operationally demonstrated (bukan hanya config), observability ready.  
**Push:** `feat(phase-25): complete triggered cloud migration`.

---

## 8. CROSS-PHASE INTEGRATION GATES

Gate ini dijalankan berulang, bukan hanya pada P24:

| Gate | Kapan | Wajib terbukti |
|---|---|---|
| Tenant isolation | Setiap phase yang membaca/menulis data | API, search, export, cache, queue, jobs |
| Money invariant | P12–P24 | Debit = credit, append-only, closed period, reversal |
| Stock invariant | P05, P08–P16 | no oversell, immutable movement, no loop, valuation |
| Idempotency | Setiap webhook/job/create mutation | duplicate payload/request menghasilkan satu efek |
| Source of truth | P04–P24 | dashboard/report/AI memakai domain read model yang sama |
| Adapter boundary | P00, P07–P25 | no vendor/infrastructure import di domain |
| Async safety | P00, P06, P14, P16, P22 | heavy work tidak memblokir HTTP; retry/dead-letter visible |
| Auditability | Setiap mutation sensitif | actor, source, before/after, reference, timestamp |
| UX completeness | Setiap UI subphase | loading, empty, error, success, partial, mobile, keyboard |
| Operational readiness | Setiap external integration | last sync, counts, failure reason, retry, impact |

---

## 9. CHANGE CONTROL AGAR TIDAK KELUAR JALUR

### Perubahan yang boleh langsung di checkpoint

- Copy/error message yang lebih jelas.
- Test tambahan.
- Index/query improvement yang tidak mengubah contract.
- Accessibility/responsive improvement.
- Logging/metric/runbook improvement.
- Small UX improvement pada screen yang sama.

### Perubahan yang wajib menjadi proposal terpisah

- Entity/source of truth baru.
- Perubahan accounting posting rule/COA/period semantics.
- Perubahan permission atau tenant boundary.
- Perubahan API public contract/version.
- Marketplace baru atau perubahan capability connector.
- Provider payment/AI/WhatsApp baru.
- Perubahan phase order, dependency, atau Definition of Complete.
- Native mobile app, cloud migration sebelum threshold, atau restructuring stack.

Proposal perubahan minimal memuat: alasan, user impact, data impact, security impact, migration/rollback, test impact, phase yang terdampak, dan keputusan pengguna.

---

## 10. DEFINITION OF COMPLETE PER SUBPHASE — CHECKLIST LITERAL

Sebelum subphase diberi status Complete, Replit AI wajib mencentang:

- [ ] Scope note dan out-of-scope jelas.
- [ ] Semua contract/API/schema yang diperlukan terdokumentasi.
- [ ] Migration berjalan dari database kosong dan representative database.
- [ ] Domain invariant dan transaction boundary diuji.
- [ ] Tenant scope dan permission diuji positif serta negatif.
- [ ] Idempotency/retry/recovery diuji bila ada mutation/job/integration.
- [ ] UI tidak memakai mock/hardcode untuk jalur produksi.
- [ ] Loading/empty/error/success/partial states tersedia.
- [ ] Mobile/tablet/desktop dan keyboard smoke lulus.
- [ ] Log, request ID, audit, metric/health relevan tersedia.
- [ ] `.env.example` dan secret boundary sinkron.
- [ ] Unit/integration/contract/E2E yang relevan lulus.
- [ ] Performance query baseline dibuat untuk list/report hot path.
- [ ] Dokumen/ADR/runbook diperbarui.
- [ ] Checkpoint ide khusus subphase ditawarkan; ide tidak dipaksakan.

## 11. DEFINITION OF COMPLETE PER PHASE — CHECKLIST LITERAL

- [ ] Semua subphase phase lulus checklist di atas.
- [ ] Semua dependency gate sebelumnya lulus.
- [ ] Full regression suite lulus.
- [ ] Cross-module E2E untuk alur phase lulus.
- [ ] No known failing check atau hidden blocker.
- [ ] UAT/smoke evidence tersedia sesuai risiko.
- [ ] User-facing limitation ditulis jujur.
- [ ] Checkpoint ide phase ditawarkan dan keputusan dicatat.
- [ ] Commit phase dibuat.
- [ ] Commit phase berhasil dipush ke GitHub.

---

## 12. URUTAN PRAKTIS UNTUK REPLIT AI

Untuk setiap task baru, gunakan prompt operasional ini:

```text
Kerjakan hanya [PXX.Y — nama subphase] pada
DOC/AUTOPROFIT_EXECUTION_PHASES_REV5.md. Gunakan BUILD_ROADMAP untuk urutan,
dependency, change-control, checkpoint, dan protokol GitHub.

Baca PRD Master bagian [nomor bagian] dan cek kode terbaru sebelum mengubah apa pun.
Jangan mengerjakan subphase lain. Pertahankan stack dan struktur yang ada.

Wajib:
1. tulis scope/contract/migration/test plan sebelum coding;
2. implementasikan full vertical slice nyata, bukan mock;
3. ikuti UI → API/Application → Domain → Database;
4. pakai tenant isolation, permission, idempotency, audit, adapter, dan transaction
   sesuai scope;
5. implementasikan semua loading/empty/error/success/partial state;
6. jalankan build, lint/typecheck, unit, integration, E2E, dan test khusus gate;
7. perbaiki failure dalam scope, jangan menyembunyikannya;
8. update docs/ADR/runbook/.env.example bila relevan;
9. setelah semua lulus, tampilkan evidence dan tawarkan CHECKPOINT IDE khusus
   subphase ini. Tunggu keputusan pengguna;
10. setelah phase terkait lengkap dan phase gate lulus, commit dan push ke GitHub.

Jika menemukan dependency yang belum Complete, berhenti dan laporkan blocker.
Jangan membuat data, credential, API marketplace, payment provider, atau AI result
palsu. Gunakan sandbox/mock contract hanya untuk testing dan tandai jelas.
```

---

## 13. DAFTAR MODUL PRD → LOKASI ROADMAP

| Modul/area PRD | Roadmap |
|---|---|
| Architecture, auth, tenant, RBAC, DB, API, logging, monitoring, deployment | P00–P01 |
| Design system, responsive, PWA, onboarding | P02 |
| Products, SKU, listing, barcode | P03, P22 |
| Orders, order detail, lifecycle, customers | P04 |
| Inventory, warehouse, stock alert, movement, transfer | P05, P16 |
| Dashboard, profitability graph, business health, Today Mode, search | P06, P13, P22 |
| Import, data cleaning, bulk operations | P06, P22 |
| Marketplace framework, sync, retry, raw replay | P07 |
| Shopee | P08 |
| Tokopedia + TikTok Shop | P09 |
| Lazada | P10 |
| Blibli | P11 |
| Cash, accounting, double entry, COA, reports, profit | P12–P13 |
| Settlement/bank reconciliation | P14 |
| Purchasing, supplier, PO, reorder | P15 |
| Notifications, automation, audit, approvals | P16 |
| AI copilot, explain this, memory, safe actions | P17–P18 |
| WhatsApp | P19–P20 |
| Billing, pricing, metering, feature flags | P21 |
| Analytics, custom dashboard, saved views | P22 |
| Multi-business, multi-currency, tax, public API | P23 |
| QA, load, security, UAT, GA | P24 |
| Cloud migration and long-term operational transition | P25 |

Dengan mapping ini, seluruh modul yang disebut pada Phase Build PRD 103/140/163 memiliki lokasi implementasi, dependency, dan gate yang eksplisit.
