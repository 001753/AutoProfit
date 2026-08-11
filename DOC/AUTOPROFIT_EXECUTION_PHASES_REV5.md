# AUTOPROFIT — BLUEPRINT PHASE EKSEKUSI REV 5

**Versi:** 1.3
**Tanggal:** 2026-08-11  
**Status:** Master execution plan untuk pembangunan bertahap  
**Bahasa:** Bahasa Indonesia; nama teknis mengikuti PRD  
**Sumber kebenaran:** `DOC/AutoProfit_PRD_Master_Rev5.md`  
**Aturan operasional:** `DOC/AUTOPROFIT_BUILD_ROADMAP.md`

> Dokumen ini memecah roadmap operasional menjadi unit kerja yang cukup kecil
> untuk satu eksekusi Replit AI. Dokumen ini tidak menggantikan PRD. Jika ada
> konflik, berlaku Rev 5 > Rev 4 > Rev 3, lalu keputusan eksplisit yang
> tercatat dalam ADR.

### 0.1 Otoritas breakdown dan aturan status

Dokumen ini adalah **satu-satunya rujukan eksekusi untuk daftar `PXX.Y`,
klasifikasi unit kerja, acceptance proof, dan Definition of Complete per
subphase**. `DOC/AUTOPROFIT_BUILD_ROADMAP.md` mengatur urutan phase, dependency
global, change control, checkpoint ide, commit, dan push GitHub; ia bukan daftar
subphase alternatif.

Jika ringkasan, prompt lama, atau catatan lain menyebut breakdown yang berbeda,
ikuti dokumen ini dan catat konflik tersebut sebagai ADR sebelum coding. Phase
atau subphase tetap `BLOCKED` bila credential, approval, sandbox, legal review,
atau provider eksternal belum tersedia. Contract fixture boleh dipakai untuk
menguji core provider-agnostic, tetapi tidak boleh dipakai untuk mengklaim
capability eksternal aktif.

---

## 1. Tujuan dan definisi selesai

Blueprint ini dibuat agar:

1. seluruh modul PRD memiliki lokasi implementasi yang jelas;
2. tidak ada phase raksasa yang memaksa Replit AI mengubah banyak bounded context
   sekaligus;
3. setiap subphase menghasilkan satu vertical slice nyata atau satu fondasi
   teknis yang dapat diuji;
4. dependency lintas domain dipenuhi sebelum consumer dibangun;
5. setiap phase dapat dinyatakan `Complete` hanya setelah bukti, checkpoint ide,
   commit, dan push GitHub tersedia;
6. kegagalan eksternal seperti token expired, rate limit, atau provider down
   menjadi state produk yang dapat dilihat dan dipulihkan, bukan data palsu.

### 1.1 Arti “real work, no error, full integration”

`Complete` bukan berarti halaman tampil. Subphase atau phase harus memiliki:

- implementasi database, domain/application service, API, dan UI yang nyata bila
  UI relevan;
- schema/migration dari database kosong dan database representatif;
- tenant isolation dari session/claims sampai query, cache, queue, export, dan
  audit;
- permission positif dan negatif untuk operasi sensitif;
- transaction boundary dan invariant domain yang diuji;
- idempotency dan recovery untuk mutation, webhook, dan job;
- loading, empty, success, partial/in-progress, dan error state pada UI;
- unit, integration, contract, E2E/smoke, performance, dan security test sesuai
  risiko;
- structured log, request ID, health/sync state, metric, dan runbook yang
  diperlukan;
- tidak ada known failing check, migration pending, mock production path,
  `catch { return [] }`, silent fallback, atau hardcoded angka bisnis.

### 1.2 Klasifikasi unit kerja

- **F (Foundation):** kontrak, adapter, migration, tooling, atau platform
  minimum. Tidak boleh menyelundupkan fitur bisnis.
- **V (Vertical slice):** jalur lengkap contract → schema → domain → API → UI →
  event/job → test.
- **I (Integration):** menghubungkan producer dan consumer melalui API/event
  resmi, bukan query tabel consumer secara langsung.
- **H (Hardening):** proof performance, security, recovery, UAT, dan release.

Satu subphase idealnya menyelesaikan satu kemampuan yang dapat dijelaskan dalam
satu kalimat dan diuji tanpa menunggu subphase yang tidak menjadi dependency-nya.

---

## 2. Aturan yang tidak boleh dilanggar

### 2.1 Urutan implementasi

```text
Scope note + contract
  → schema/migration
  → domain/application service
  → API
  → UI
  → event/job/integration
  → tests
  → observability
  → docs/runbook
```

Larangan:

- UI mengakses database atau tabel domain secara langsung.
- `org_id` dari body/query menjadi sumber tenant untuk write.
- Connector menulis langsung ke tabel domain tanpa integration/application layer.
- AI melakukan query database mentah atau memiliki privilege di atas user.
- Data marketplace, fee, profit, saldo, atau hasil AI dibuat-buat.
- Modul berikutnya memakai tabel internal modul yang belum memiliki contract.
- Redis, WebSocket, worker, S3, atau provider lain di-import langsung oleh domain.
- Phase digabung hanya agar cepat.

### 2.2 Deployment awal dan adapter

Target awal adalah shared hosting Node.js + PostgreSQL seperti PRD Rev 4/5:

| Capability | Default awal | Interface wajib |
|---|---|---|
| Queue | tabel PostgreSQL + poller in-process | `QueueAdapter` |
| Cache | in-memory TTL/LRU | `CacheAdapter` |
| Storage | logical key pada local/object storage | `StorageAdapter` |
| Realtime | SSE, fallback polling 5 detik | `RealtimeAdapter` |
| Lock | PostgreSQL advisory lock | `LockAdapter` |
| Notification | in-app | `NotificationChannel` |

Migration cloud adalah P25 yang dipicu threshold PRD, bukan alasan untuk
membangun Redis/worker/cloud lebih awal.

### 2.3 Track yang berjalan paralel

**Continuity track** dimulai sejak P00 dan tidak boleh menjadi phase raksasa:

- runbook diperbarui setiap ada infrastruktur atau operasi baru;
- ADR dibuat saat keputusan non-obvious dibuat, bukan setelah sistem kompleks;
- connector app registration/legal readiness dimulai pada P00/P01, karena
  approval marketplace dapat lebih lama dari coding;
- raw payload preservation dan data portability disiapkan sebelum connector
  pertama dan sebelum pengguna bergantung pada data;
- upgrade runtime/dependency terjadwal mulai 12 bulan setelah GA;
- evidence keputusan pengguna pada checkpoint disimpan di `docs/decisions/`.

---

## 3. Kontrak wajib setiap subphase

Sebelum coding, Replit AI wajib membuat atau memperbarui artefak berikut untuk
subphase yang sedang dikerjakan:

| Artefak | Isi minimum |
|---|---|
| Scope note | In-scope, out-of-scope, dependency, risiko, asumsi terlarang |
| Domain contract | Entity, invariant, state machine, event, transaction boundary |
| API contract | Route, auth, request, response, pagination, error code, idempotency |
| UI contract | Route, permission, semua state, responsive, keyboard, copy error |
| Migration plan | Forward/up, rollback/down bila aman, index, backfill, lock risk |
| Test plan | Unit, integration, negative, isolation, idempotency, E2E, perf/security |
| Integration map | Producer/consumer event, source of truth, adapter, retry boundary |
| Observability plan | Log fields, request ID, metric, health, audit, alert |
| Done evidence | Command, hasil, screenshot/smoke, migration status, limitation |

Subphase tidak boleh berstatus `Complete` bila contract belum ada walaupun
implementasinya terlihat selesai.

### 3.1 Checklist literal subphase

- [ ] Scope dan out-of-scope disetujui.
- [ ] Contract/schema/API/error code ditulis.
- [ ] Migration lulus dari database kosong dan representative database.
- [ ] Tenant dan permission diuji positif serta negatif.
- [ ] Invariant/transaction diuji.
- [ ] Idempotency/retry/recovery diuji bila ada mutation/job/integration.
- [ ] Tidak ada mock/hardcode pada production path.
- [ ] Semua UI state dan responsive/keyboard smoke tersedia.
- [ ] Log, audit, health/metric relevan tersedia.
- [ ] `.env.example` dan secret boundary sinkron.
- [ ] Build/typecheck/lint/unit/integration/contract/E2E yang relevan lulus.
- [ ] Query hot path memiliki index dan evidence `EXPLAIN ANALYZE`.
- [ ] ADR/runbook/dokumen mapping diperbarui.
- [ ] Checkpoint ide subphase ditawarkan dan jawabannya dicatat.

### 3.2 Kontrak eksekusi Commercial Validation & Moat Track

Track C0–C4 adalah **task track paralel**, bukan phase teknis dan bukan pengganti
subphase `PXX.Y`. Setiap task track boleh dikerjakan tanpa membuat kode produk,
tetapi hasilnya harus berupa evidence yang dapat diaudit dan harus disimpan di
`docs/market-gates/` saat implementasi dimulai. Signup, demo, jumlah halaman,
atau ketertarikan verbal saja tidak cukup untuk menyatakan market gate lulus.

| Task track | Waktu/dependency | Output minimum | Acceptance gate |
|---|---|---|---|
| **C0.1 — ICP dan interview protocol** | Bersama P00.1; sebelum scope P02/P03 dikunci | ICP beachhead fashion/aksesoris, interview guide berbasis perilaku/kerugian, baseline worksheet, hipotesis willingness to pay | Scope dan hipotesis memiliki owner, ukuran, dan keputusan yang akan dipengaruhi |
| **C0.2 — Problem observation dan baseline** | Setelah C0.1; paralel P00–P01 | ≥15 wawancara, ≥5 observasi workflow nyata, baseline laporan/settlement/COGS/discrepancy/keputusan tertunda | Evidence sesi tersimpan; minimal 3 seller bersedia memberi data atau mengikuti pilot |
| **C0.3 — C0 decision** | Setelah C0.2; sebelum P02/P03 mengklaim beachhead readiness | Keputusan lanjutkan/persempit/pivot, perubahan hipotesis, dampak scope, known limitation | C0 tercatat sebagai `PASS`, `NARROW`, atau `PIVOT`; tidak boleh diklaim product-market fit |
| **C1.1 — First-value instrumentation** | P02.4 dan P06.1–P06.3 | Timestamp signup/import, first traceable number, onboarding live, coverage, exception, self-serve, silent-loss evidence | Semua angka bersumber dari data nyata/sandbox yang ditandai, bukan dummy; data gagal map terlihat |
| **C1.2 — First-value observation** | Setelah P02/P06 path tersedia; sebelum C1 gate | Evidence journey dan daftar failure/recovery | Median import/sandbox ≤10 menit, live first data ≤30 menit di luar delay provider, self-serve ≥80% sebagai target hipotesis |
| **C1.3 — C1 decision** | Setelah C1.1–C1.2; sebelum pilot commerce diperluas | Gate report dan keputusan perbaikan onboarding/data path | Silent loss = 0 dan seluruh exception terlihat; target yang belum terbukti tetap `OPEN` |
| **C2.1 — Pilot readiness** | P07–P08; setelah connector dan import resmi tersedia | Pilot protocol, consent/data handling, source-reference checklist, support/runbook | Minimal 3 bisnis nyata, minimal 1 connector nyata, dan 1 jalur import resmi siap |
| **C2.2 — 30-day commerce/profit pilot** | P08–P14; selama ≥30 hari per bisnis | Order-to-profit trace, COGS estimated/actual, settlement exception, time-saved baseline, decision evidence | Data tidak termap menjadi exception yang dapat ditindaklanjuti; tidak ada silent loss |
| **C2.3 — C2 decision** | Setelah C2.2 | Coverage, trust, COGS, reconciliation, dan time-saved gate report | Coverage order ≥95%, COGS terverifikasi ≥90%, source reference profit 100%, time saved ≥50% atau ≥4 jam/minggu sebagai target awal |
| **C3.1 — Habit and action instrumentation** | P16 dan P22; event tidak boleh mengubah transaction truth | Weekly usage, active days, dashboard-to-action, alert-to-resolution, return-after-exception, assisted decision | Metric berasal dari tindakan bisnis yang dapat ditelusuri, bukan page-view/AI-count vanity metric |
| **C3.2 — Retention and willingness-to-pay** | P21 bersama pilot berjalan; paid collection tetap mengikuti provider gate | Retention 8 minggu, usage-to-value, pricing/commitment evidence, known limitation | ≥70% weekly active cohort, retention ≥50%, dan ≥2 dari 3 pilot bersedia membayar/berkomitmen sebagai target awal |
| **C3.3 — C3 decision** | Setelah C3.1–C3.2 | Monetization/habit decision dan scope consequence | Keputusan didukung evidence; perubahan pricing/provider capability menjadi change proposal |
| **C4.1 — GA market evidence pack** | P24.5; setelah C0–C3 evidence direview | ≥3 profil bisnis, time-to-value, coverage, repeated usage, problem resolution, trust, limitations, support readiness, paid evidence | Evidence dapat ditelusuri ke bisnis nyata dan limitation tidak disembunyikan |
| **C4.2 — GA segment decision** | Gate P24 | Keputusan lanjutkan/perluas, persempit, atau pivot serta dampak scope | P24 tidak boleh menyatakan GA jika market evidence belum tersedia, walaupun technical gate lulus |

Setiap task C harus mempunyai scope note, evidence index, definisi metric,
baseline/target, owner, tanggal pengukuran, limitation, dan keputusan. Bila
provider, consent, data pilot, atau legal review belum tersedia, status task
adalah `BLOCKED`; jangan menggantinya dengan evidence sintetis yang diklaim nyata.

---

## 4. Urutan dependency global

```text
P00 Foundation
 └─ P01 Identity/Tenant/RBAC
    ├─ P02 UX/PWA/Onboarding
    └─ P03 Catalog
       └─ P04 Customers/Orders
          └─ P05 Inventory/Warehouse
             └─ P06 Dashboard/Import/Portability
                └─ P07 Connector Platform
                   ├─ P08 Shopee
                   ├─ P09 Tokopedia + TikTok Shop
                   ├─ P10 Lazada
                   └─ P11 Blibli

P05 + P07..P11 ── P12 Accounting ── P13 Profit/Cash/Reports
                                       ├─ P14 Reconciliation
                                       └─ P15 Purchasing
P06 ── P16 Notification/Automation
P13 + P16 ── P17 AI Read-only
P17 + P15 + P16 + P12/P13 ── P18 AI Actions/Memory
P06 + P16 ── P19 WhatsApp P0 (parallel; tidak menunggu P17/P18)
P19 + P17 + P18 + P15/P12 ── P20 WhatsApp P1/P2
P01 + P06 ── P21 Billing/Metering/Flags
P06 + P13 + P16 + P17 ── P22 Analytics/Workspace
P13 + P21 + P22 ── P23 Advanced Finance/Public API
P00..P23 ── P24 Hardening/UAT/GA
P24 + trigger PRD 129.1 ── P25 Cloud Migration

C0.1–C0.3 ── scope gate P02/P03
P02 + P06 ── C1.1–C1.3
P07–P14 ── C2.1–C2.3
P16 + P21 + P22 ── C3.1–C3.3
C0–C3 + P24.5 ── C4.1–C4.2 (GA market gate)
```

**Aturan penting:** setelah satu connector lolos P08 gate, connector berikutnya
boleh dibangun paralel satu per satu. Tidak boleh membangun empat connector
sekaligus sebelum satu contract platform terbukti.

**Aturan binding market gate:** status teknis phase tetap mengikuti DoC teknis,
tetapi setiap phase yang tercantum pada tabel berikut wajib menghasilkan atau
memperbarui evidence market/moat sebelum task phase dinyatakan siap direview:

| Phase teknis | Kewajiban evidence yang harus masuk ke task phase |
|---|---|
| P00.1–P01 | C0.1–C0.3: ICP, interview/observasi, baseline, design partner, dan keputusan scope |
| P02 | C1.1: timestamp reachability, onboarding state, kategori/template beachhead, dan first-value instrumentation |
| P03–P05 | Menjaga generic/extensible domain; tidak hard-code fashion; catat kebutuhan beachhead yang mengubah contract |
| P06 | C1.1–C1.3: first traceable number, coverage, exception, export/portability, dan silent-loss proof |
| P07–P11 | C2.1 dan moat connector: mapping coverage, unknown field, correction, version, replay, recovery, dan limitation |
| P12–P13 | C2.2: source reference profit, estimated-vs-actual COGS, traceability, dan costing evidence |
| P14–P15 | C2.2: reconciliation exception/resolution, time saved, dan keputusan stok/pembelian/harga |
| P16 | C3.1: alert-to-resolution, repeated action, dan reliability evidence tanpa mengubah transaction truth |
| P17–P20 | Evidence penggunaan/keputusan hanya bila provider dan consent nyata tersedia; AI/WhatsApp count bukan market proof |
| P21–P22 | C3.1–C3.3: weekly usage, active days, assisted decisions, retention, pricing, dan willingness to pay |
| P23 | Portability, public API, dan multi-business tidak boleh dipakai sebagai bukti market fit tanpa evidence C0–C3 |
| P24 | C4.1–C4.2 wajib menjadi bagian Gate P24; technical/security/UAT lulus tidak cukup untuk GA |

### 4.1 Pemetaan market evidence ke task canonical

Task `PXX.Y` yang berada pada tabel berikut wajib memperbarui evidence market
track terkait sebelum task dinyatakan siap direview. Evidence ini melengkapi,
bukan menggantikan, acceptance proof teknis pada setiap subphase.

| Task canonical | Market evidence minimum |
|---|---|
| P00.1 | C0.1: ICP, interview guide, baseline worksheet, evidence index, dan hipotesis yang memiliki owner |
| P00.2–P01.4 | C0.2–C0.3 bila data seller tersedia: interview/observasi, ≥3 calon design partner, dan keputusan scope |
| P02.4 | C1.1: timestamp reachability, kategori/template beachhead, onboarding state, dan batas synthetic/sandbox |
| P06.1–P06.4 | C1.1–C1.3: first traceable number, data coverage, exception, portability, recovery, dan silent-loss proof |
| P07.1–P11.3 | C2.1 serta moat connector: mapping coverage, unknown field, correction, version, replay, recovery, dan limitation |
| P12.1–P13.4 | C2.2: source reference profit, estimated-vs-actual COGS, traceability, dan time-saved baseline |
| P14.1–P15.4 | C2.2–C2.3: discrepancy reason/status, resolution time, dan keputusan stok/pembelian/harga |
| P16.1–P16.4 | C3.1: repeated action, alert-to-resolution, dan reliability evidence |
| P17.1–P20.3 | Hanya evidence penggunaan/keputusan dari provider dan consent nyata; jumlah AI/WhatsApp bukan market proof |
| P21.1–P22.4 | C3.1–C3.3: weekly usage, active days, assisted decisions, retention, pricing, dan willingness to pay |
| P24.5 | C4.1–C4.2: market evidence pack dan keputusan lanjutkan/persempit/pivot |

Jika market evidence belum dapat diambil karena seller, provider, consent, atau
legal review belum tersedia, task mencatat status evidence `OPEN` atau `BLOCKED`
dengan alasannya. Task teknis tidak boleh mengisi kekosongan tersebut dengan
data sintetis yang diklaim sebagai hasil pasar.

---

## 5. Phase 00 — Delivery control dan deployment skeleton

**Tujuan:** menyiapkan fondasi yang dapat di-build, dijalankan, diamati, diuji,
dan dipulihkan. Tidak ada fitur bisnis.

**Dependency:** tidak ada.  
**PRD:** 102–109, 127–132, 150–161.  
**DoC phase:** fresh checkout dapat install/build/test/start; `/health` jujur;
queue/lock/adapter boundary terbukti; ADR dan runbook awal ada.

### P00.1 — Product baseline dan source-of-truth map (F)

- **Input:** PRD Rev 5 dan roadmap operasional.
- **Output:** `replit.md`, module-to-phase matrix, scope policy, DoC template,
  ADR index, decision log template.
- **Out-of-scope:** framework pilihan baru, feature bisnis, cloud provisioning.
- **Proof:** seluruh modul PRD 1–164 terpetakan; conflict/assumption register
  ditulis; C0.1 menghasilkan ICP, interview guide, baseline worksheet, dan
  evidence index; markdown/link check lulus.
- **Integration:** menjadi input semua subphase berikutnya.

### P00.2 — Architecture decisions dan continuity baseline (F)

- **Output:** ADR shared hosting, UUID, Postgres queue, adapter boundary,
  SSE/polling, storage logical key, pool limit, secret boundary; runbook
  deployment/restore/rotation/incident template.
- **Proof:** setiap keputusan non-obvious memiliki why, rejected alternatives,
  consequence, rollback; reviewer dapat menjalankan prosedur dari nol.
- **Gate:** tidak ada keputusan infra penting yang hanya berada di chat.

### P00.3 — Runtime/toolchain dan CI quality gate (F)

- **Output:** project skeleton sesuai runtime aktual, package scripts, build,
  test, lint/typecheck, migration check, `.env.example`, CI.
- **Proof:** fresh checkout tanpa langkah tersembunyi; secret scan; dependency
  audit; Node LTS yang tersedia terverifikasi.
- **Out-of-scope:** domain schema dan login.

### P00.4 — HTTP, database, adapter, queue, health, observability (F/V)

- **Output:** server `$PORT`, pool PostgreSQL `DB_POOL_MAX` default 6,
  `QueueAdapter`, `CacheAdapter`, `StorageAdapter`, `RealtimeAdapter`,
  `LockAdapter`, `NotificationChannel`, structured logger, request ID,
  graceful shutdown, `/health`.
- **Proof:** migration smoke; health non-200 saat DB/poller unhealthy; queue
  `pending→processing→done/failed/dead`; retry/backoff; `FOR UPDATE SKIP LOCKED`;
  dua proses tidak menjalankan job/cron sama; log sample redaction.
- **Gate P00:** semua P00.1–P00.4 lulus, start smoke lulus, tidak ada migration
  pending.
- **Checkpoint/push:** tawarkan ide P00 khusus foundation; tunggu keputusan;
  commit `feat(phase-00): complete delivery control and deployment skeleton`,
  lalu push ke GitHub.

---

## 6. Phase 01 — Identity, multi-tenancy, session, RBAC

**Dependency:** P00.  
**PRD:** 45, 73–74, 115, 123, 138.  
**DoC phase:** DoC Auth & Multi-Tenancy 100%; semua jalur tenant isolation
  hijau; critical permission dan session E2E lulus.

### P01.1 — Organization, user, membership, tenant context (V)

- **Output:** schema organization/user/membership, UUID, soft-delete/audit
  fields, tenant context dari authenticated claims/session.
- **Proof:** repository menolak context kosong/wrong tenant; API, search, export,
  cache key, queue payload memiliki test lintas tenant.
- **Out-of-scope:** marketplace credential dan billing.

### P01.2 — Role catalog, permission registry, seed (F/V)

- **Output:** Owner, Finance, Purchasing, Operations, Admin; permission matrix;
  seed idempotent; timezone/currency dan COA template reference.
- **Proof:** seed dua kali tidak duplikat; role × critical permission matrix
  menjadi automated test; active org terlihat di session.

### P01.3 — Signup, password recovery, login, logout, refresh rotation (V)

- **Output:** bcrypt/argon2, password policy, password reset via
  single-use expiring email/token flow, generic response untuk mencegah account
  enumeration, JWT access 15m, refresh 30d rotation/reuse detection, logout.
- **Proof:** reset token expired/reused ditolak, reset menginvalidasi sesi
  aktif, email/account enumeration tidak bocor, refresh lama ditolak; reuse
  menginvalidasi seluruh sesi; auth rate limit 20/min untuk login dan reset
  benar-benar 429; secret tidak masuk log.

### P01.4 — Session management, RBAC, audit, dan consent (V/I)

- **Output:** daftar/revoke device, password-change invalidation, route/domain
  authorization, audit before/after actor/IP/source; versioned ToS dan Privacy
  Policy consent pada signup (timestamp, policy version, subject, source),
  re-consent saat policy berubah, dan withdrawal untuk pemrosesan opsional.
- **Proof:** revoke device lain menolak request berikutnya; setiap sensitive
  mutation ter-audit; API bypass tidak mungkin; consent dapat dibuktikan,
  re-consent wajib saat versi berubah, withdrawal menghentikan pemrosesan
  opsional, dan transaksi/journal yang wajib retensi tidak dihapus.
- **Gate P01:** P01 DoC 138, password recovery E2E, consent/re-consent
  negative tests, tenant/RBAC regression, session/revoke E2E, dan
  security/dependency audit lulus.
- **Checkpoint/push:** ide khusus identity/tenant; commit
  `feat(phase-01): complete identity tenancy and authorization`; push GitHub.

---

## 7. Phase 02 — UX shell, responsive design system, PWA, onboarding

**Dependency:** P00, P01.  
**PRD:** 50–65, 81, 150–154.  
**DoC phase:** signup → dashboard dengan data nyata/sandbox <10 menit; PWA
  install/update/read-cache terbukti; semua screen state dan accessibility smoke.

### P02.1 — Design tokens dan accessible component primitives (F)

- **Output:** typography, colors, spacing, radius, buttons, forms, tables,
  cards, modal, toast, status, focus/contrast tokens.
- **Proof:** keyboard/focus/semantic landmark/contrast smoke; breakpoint
  `<640`, `640–1024`, `1024–1440`, `>1440`.
- **Out-of-scope:** dashboard business data.

### P02.2 — Application shell, navigation, Simple/Pro mode (V)

- **Output:** authenticated layout, nav permission filtering, responsive
  sidebar/bottom nav, command-palette and universal-search shell.
- **Proof:** unauthorized route denied; deep-link/reload works; mobile table
  becomes card/list; loading/error shell does not blank screen.

### P02.3 — PWA dan realtime client abstraction (V)

- **Output:** manifest, service worker asset cache, update prompt, offline-safe
  read cache, SSE hook with 5-second polling fallback, in-app notifications.
- **Proof:** install smoke; disconnect/reconnect; mutation offline clearly
  rejected/queued state, never claims transaction success; channel adapter test.

### P02.4 — Self-serve onboarding dan COA wizard (V/I)

- **Output:** category wizard Fashion/F&B/Elektronik/Kecantikan/Lainnya,
  business profile, timezone/currency, first warehouse, first channel/manual
  data, COA subset/cost defaults, reachability timestamps.
- **Proof:** resume after each failure; no advanced accounting overload; first
  real number path; onboarding E2E under 10 minutes on synthetic/sandbox.
- **Gate P02:** visual state matrix, a11y, PWA, onboarding, NotificationChannel.
- **Checkpoint/push:** ide khusus onboarding/shell; commit
  `feat(phase-02): complete UX shell PWA and onboarding`; push GitHub.

---

## 8. Phase 03 — Product, variant, SKU, listing, basic catalog

**Dependency:** P01, P02.  
**PRD:** 20–26, 115, 116.  
**DoC phase:** catalog CRUD dan mapping nyata, no duplicate SKU, archived history,
  list P95 <500ms pada dataset synthetic.

### P03.1 — Product/category/brand/tax class (V)

- **Output:** product entity, category, brand, tax class, archive semantics,
  tenant-scoped repository and API.
- **Proof:** create/edit/archive; destructive delete ditolak bila sudah
  ditransaksikan; pagination and permission tests.

### P03.2 — Variant, SKU, barcode, costing attributes (V)

- **Output:** variant/SKU, unique SKU per tenant, barcode, attributes, cost
  method, scanner-input abstraction.
- **Proof:** duplicate SKU/barcode policy; historical references survive archive;
  hardware integration tidak dipalsukan; validation errors row/field specific.

### P03.3 — Channel listing mapping dan conflict state (I)

- **Output:** variant ↔ external product/SKU mapping, status, conflict,
  duplicate prevention, mapping API/UI.
- **Proof:** same external identity cannot map ke dua variant; conflict visible,
  tenant/permission isolation, no vendor import into domain.

### P03.4 — Catalog search, filters, bulk preview (V)

- **Output:** API cursor search/filter/saved-query contract; import preview,
  row-level errors, partial result.
- **Proof:** search API only; 50k synthetic list P95 <500ms; EXPLAIN evidence;
  bulk retry/idempotency; all UI states.
- **Gate/Push:** catalog CRUD E2E, rollback rehearsal, contract/negative tests;
  checkpoint ide; commit `feat(phase-03): complete product and catalog foundation`;
  push GitHub.

---

## 9. Phase 04 — Customer dan order core

**Dependency:** P01, P03.  
**PRD:** 14–18, 39–49, 115, 134.  
**DoC phase:** manual/webhook/polling menghasilkan Unified Order sama; lifecycle,
  return/refund, idempotency, totals, PII, performance lulus.

### P04.1 — Customer profile, search, masking, merge (V)

- **Output:** customer CRUD, channel origin/tags, masked PII, duplicate merge
  with audit, PII access audit.
- **Proof:** permission-based mask; merge preserves order references; export/search
  tenant-safe; encrypted PII boundary sesuai PRD.

### P04.2 — Order schema, item, payment, totals (V)

- **Output:** order/order item/payment, totals reconstructed from item+fee,
  idempotency-key create, cursor list/detail/timeline.
- **Proof:** client cannot overwrite calculated total; duplicate create one order;
  transaction rollback leaves no partial order; 50k list baseline.

### P04.3 — Lifecycle, illegal transitions, timeline (V)

- **Output:** unpaid→paid→processing→shipped→delivered and cancelled/returned
  state machine, transition API, timeline events.
- **Proof:** every illegal transition negative-tested; partial-sync state honest;
  role/action audit.

### P04.4 — Cancel, return, refund, unified input contract (I)

- **Output:** partial/full cancel/return/refund, `ORDER_PAID` contract,
  reservation/reversal event contract for future P05/P12, fixtures for manual,
  webhook, polling.
- **Proof:** duplicate paid has one effect intent; reservation call uses event
  boundary; no fake journal before P12; DoC Orders 134.
- **Gate/Push:** order/customer E2E, PII/RBAC, idempotency, performance; checkpoint
  ide; commit `feat(phase-04): complete customer and order core`; push GitHub.

---

## 10. Phase 05 — Inventory, warehouse, reservation, transfer

**Dependency:** P04.  
**PRD:** 20–26, 115, 135.  
**DoC phase:** immutable ledger, no oversell, correct reservation race, transfer
  and valuation contract.

### P05.1 — Warehouse dan stock ledger (V)

- **Output:** warehouse, stock item, immutable stock movement, receipt/sale/
  adjustment/return/damage, availability formula.
- **Proof:** UPDATE/DELETE movement denied; correction only adjustment; tenant and
  audit tests; stock read never uses stale cache for strong consistency.

### P05.2 — Reservation/release/commit transaction (I)

- **Output:** reservation state, expiry, cancellation release, insufficient
  stock error, event consumer for P04 order effects.
- **Proof:** 20 concurrent orders for 15 units gives exactly 15 reserves; no
  negative/oversell; duplicate event one reservation effect.

### P05.3 — Multi-warehouse transfer (V)

- **Output:** transfer out/in, `In Transit`, no double availability, cancel/
  recovery path.
- **Proof:** stock unavailable at both sides during transit; retry safe; partial
  transfer visible as in-progress/error.

### P05.4 — Costing and valuation boundary (I)

- **Output:** weighted average per warehouse/variant, FIFO option contract,
  cost snapshot event for accounting, valuation read model.
- **Proof:** valuation reconciliation contract to account 1300; no accounting
  posting invented; EXPLAIN and job chunking baseline.
- **Gate/Push:** DoC Inventory 135, concurrency/job/E2E/UI/perf; checkpoint ide;
  commit `feat(phase-05): complete inventory and warehouse operations`; push GitHub.

---

## 11. Phase 06 — Dashboard, import, export, portability

**Dependency:** P01, P04, P05; finance adapter may be partial/empty until P13.  
**PRD:** 9–13, 80–82, 89, 128.6, 139, 150, 160.

### P06.1 — Import engine and data cleaning (V)

- **Output:** CSV/JSON products/customers/orders/opening stock/balance contract,
  storage logical key, column mapping, validation preview, async resumable job.
- **Proof:** row errors and duplicate strategy explicit; retry/restart safe;
  raw file not exposed cross-tenant; 50k row streaming test.

### P06.2 — Dashboard summary read model (V)

- **Output:** `dashboard_summary_daily`, hourly + event refresh, cache adapter
  usage, source links and incomplete-data markers.
- **Proof:** endpoint reads precomputed summary, not heavy aggregation; cached
  <1s target; stale/background sync visible; same source is reused later.

### P06.3 — Business Snapshot, Today Mode, drill-down (V/I)

- **Output:** revenue/profit/cash/attention snapshot, Today Mode, drill-down
  route contract to order/stock/journal source, loading/partial/error states.
- **Proof:** every visible number has source reference or explicit incomplete
  label; sync does not block dashboard; mobile/desktop E2E.

### P06.4 — Universal search, command palette, export, portability (V)

- **Output:** permission-aware API search; async CSV/entity export; JSON bundle
  orders/items/journals/accounts/stock; notification on completion.
- **Proof:** export tenant isolation; self-serve export not tier-blocked; resumable
  job, audit, stream memory safe; portability can be repeated and verified.
- **Gate/Push:** first-value <10m, dashboard/perf, import/export, DoC Dashboard
  139; checkpoint ide; commit `feat(phase-06): complete dashboard import and data
  portability`; push GitHub.

---

## 12. Phase 07 — Connector platform, sync, raw payload, retry

**Dependency:** P03–P06.  
**PRD:** 17–19, 76–77, 115–117, 137, 146, 156–157.

### P07.1 — Connector public contract and capability registry (F)

- **Output:** interfaces `authenticate`, `fetchProducts`, `fetchOrders`,
  `fetchInventory`, `fetchSettlements`, `handleWebhook`, mapping functions,
  `healthCheck`; capability matrix and registry.
- **Proof:** mock connector contract compile/test; unsupported capability is
  explicit; credential reference never stores plaintext.

### P07.2 — Unified schema and mapping versioning (F)

- **Output:** unified product/order/inventory/settlement schema, source/channel
  dimensions, `ads_fee`, mapping version, validation/error model.
- **Proof:** schema evolution backward-compatible; Tokopedia/TikTok remains two
  business channels under one engineering adapter.

### P07.3 — Sync orchestration and idempotency (V)

- **Output:** webhook-first + polling safety net, cursor, sync run/event log,
  idempotency hash, counts/reason, error categories, per-connector circuit
  breaker.
- **Proof:** duplicate webhook one effect; retry/dead-letter; connector failure
  does not slow manual orders/dashboard; health state visible in UI.

### P07.4 — Raw payload storage and replay (I)

- **Output:** store full payload before parse through StorageAdapter, mandatory
  `raw_payload_key`, `reprocess_raw_payload` job with mapping version.
- **Proof:** payload retained on parse failure; replay regression-safe and
  tenant-scoped; no destructive reparse; operational docs.
- **Gate/Push:** mock contract, duplicate/retry/dead-letter/circuit/replay tests;
  checkpoint ide; commit `feat(phase-07): complete connector platform and sync
  foundation`; push GitHub.

---

## 13. Phase 08 — Shopee connector

**Dependency:** P07 plus approved sandbox/custom-app credentials via secret flow.  
**PRD:** 137, 142–149.

### P08.1 — Shopee app readiness dan OAuth (I)

- **Output:** Indonesia region explicit, sandbox/production config, Partner
  ID/Key reference, shop OAuth, HMAC-SHA256 signing, token lifecycle.
- **Proof:** secrets never DB plaintext/log; signature vectors; token expiry and
  auth health state; no production credential invented.

### P08.2 — Product/order/inventory/settlement mapping (I)

- **Output:** living field map to unified schemas, cursor fetch, status, fees,
  shipping, buyer PII, settlement queue.
- **Proof:** sample real/sandbox payload evidence; incomplete/unknown fields
  explicit; raw payload always exists; no accounting full-posting before P13.

### P08.3 — Webhook, resilience, pilot E2E (I/H)

- **Output:** supported event handlers, timeout/429/expired-token/incomplete
  fixtures, custom-app pilot runbook, sync UI.
- **Proof:** DoC Marketplace minimum one connector; duplicate safe; circuit
  isolated; pilot path manual→Shopee→order/inventory evidence.
- **Gate/Push:** checkpoint ide khusus Shopee; commit
  `feat(phase-08): complete Shopee connector`; push GitHub.

---

## 14. Phase 09 — Tokopedia + TikTok Shop connector

**Dependency:** P07; Partner Center app/custom-app approval.  
**Aturan:** satu engineering adapter, dua business/reporting/billing channel.

### P09.1 — Partner Center auth dan region lock (I)

- **Output:** App Key/Secret reference, OAuth/signature, Indonesia immutable,
  environment separation, channel-origin discriminator.
- **Proof:** one credential can map each origin; origin cannot be overwritten
  by request body; auth/rate state visible.

### P09.2 — Unified mapping, GMV Max/ads fee (I)

- **Output:** product/order/inventory/settlement mapping, fees, shipping,
  `ads_fee`, account 6300 contract, channel dimensions.
- **Proof:** missing API value remains unknown/partial, never zero-for-valid;
  Tokopedia and TikTok reports/billing remain separate; raw replay.

### P09.3 — Sandbox/production rate limit and changelog (H)

- **Output:** capability matrix, separate rate tests, internal connector
  changelog, pilot/UAT fixture.
- **Proof:** duplicate cross-channel prevention; circuit breaker; monthly
  changelog review entry; contract gate.
- **Gate/Push:** checkpoint ide; commit `feat(phase-09): complete Tokopedia and
  TikTok Shop connector`; push GitHub.

---

## 15. Phase 10 — Lazada connector

**Dependency:** P07 and Open Platform credentials/UAT.

### P10.1 — Open Platform OAuth/signing (I)

- App Key/Secret reference, seller OAuth, TOP HMAC; explicitly no deprecated
  Seller Center API.
- **Proof:** signature vectors, expiry, secret redaction, health state.

### P10.2 — Capability mapping and sync (I)

- Product/order/inventory/settlement/webhook only where verified.
- **Proof:** unsupported capability returns `unsupported` state, never empty
  success; raw payload and sync counts present.

### P10.3 — Resilience/UAT/replay (H)

- Timeout, 429, incomplete payload, retry, circuit, mapping evidence, runbook.
- **Gate/Push:** core commerce/accounting contract regression; checkpoint ide;
  commit `feat(phase-10): complete Lazada connector`; push GitHub.

---

## 16. Phase 11 — Blibli connector

**Dependency:** P07 and Blibli UAT access.

### P11.1 — UAT OAuth and capability matrix (I)

- OAuth2 client credentials/refresh/bearer, UAT/production separation,
  evidence-based capability list.

### P11.2 — Product/order/promo/webhook scope (I)

- Implement only verified capabilities; unsupported fulfillment/promo visible
  in API/UI/docs.

### P11.3 — Contract, replay, operational readiness (H)

- Mock contract, retry/health/replay, monthly change review, limitations docs.
- **Gate/Push:** one E2E path per supported capability; checkpoint ide; commit
  `feat(phase-11): complete Blibli connector`; push GitHub.

---

## 17. Phase 12 — Accounting core dan double-entry integrity

**Dependency:** P05, P07–P11 contracts, P06 read model.  
**PRD:** 27–30, 118, 136.  
**Catatan:** ini gate dengan toleransi kesalahan nol. P14, tax, dan finance
lanjutan dilarang menganggap P12 selesai sebelum seluruh gate lulus.

### P12.1 — COA, dimensions, accounting period (V)

- **Output:** account 1000–6990/default COA, industry subset compatibility,
  dimensions/channel/warehouse, period open/closing/closed.
- **Proof:** tenant-safe seed, duplicate-safe, period permission, COA wizard
  mapping; no destructive account delete when referenced.

### P12.2 — Journal/ledger append-only storage (V)

- **Output:** journal entry/line draft/posted/reversed, debit/credit constraints,
  ledger/trial balance read model.
- **Proof:** debit=credit DB/application invariant; posted no edit/delete;
  transaction rollback; large synthetic trial balance.

### P12.3 — Deterministic posting engine (V)

- **Output:** pure posting rules for `ORDER_PAID`, fees, settlement, return,
  purchase received, supplier paid; order COGS snapshot boundary.
- **Proof:** every PRD 118.2 rule has unit/property test, correct account and
  dimensions, one source event one journal effect.

### P12.4 — Close/reverse/multi-currency (V)

- **Output:** close checklist/approval, reversing entry references original,
  exchange snapshot and FX account 6950.
- **Proof:** closed-period post rejected; reversal never mutates original;
  2+ currency invariant; duplicate reversal safe.

### P12.5 — Finance source-of-truth integration (I/H)

- **Output:** API/UI journal/ledger/trial balance, dashboard/report read contract,
  permissions and audit.
- **Proof:** all posting rules balance; reports and dashboard use same read model;
  DoC Accounting 136; no known finance defect.
- **Gate/Push:** 100% rule tests, property/invariant, period/permission and
  rollback suite; checkpoint ide; commit `feat(phase-12): complete accounting
  core`; push GitHub.

---

## 18. Phase 13 — Cash, COGS, real profit, financial reports

**Dependency:** P05, P06, P12, settlement contracts.

### P13.1 — Cash/bank accounts and movements (V)

- Cash/bank account, cash in/out, transfer, opening balance, source link, audit.
- **Proof:** no direct balance edit; append-only adjustment; duplicate import safe.

### P13.2 — COGS and cost snapshot integration (I)

- Inventory valuation/cost snapshots consume P05 contract and post through P12.
- **Proof:** stock valuation equals account 1300 contract; missing COGS is
  incomplete, not zero; return reversal correct.

### P13.3 — Real Profit Engine (V/I)

- Revenue, marketplace/payment/shipping fee, COGS, ads, return, operational
  expense; estimated vs actual; dimensions.
- **Proof:** trace every metric to journal/order/stock; channel/warehouse/customer
  filters consistent; no duplicate event effect.

### P13.4 — P&L, balance sheet, cash flow, ledger reports (V)

- Async heavy report jobs, progress/notification/export, custom range.
- **Proof:** target <60s baseline for one-year synthetic data; dashboard/report
  consistency; drill-down intact.
- **Gate/Push:** checkpoint ide; commit
  `feat(phase-13): complete cash profit and financial reporting`; push GitHub.

---

## 19. Phase 14 — Settlement and bank reconciliation

**Dependency:** P08–P11 available connectors, P12, P13.

### P14.1 — Settlement ingestion and matching (V)

- Settlement/line schema, match order/reference/amount/period, fee/adjustment/
  ads fee; matched/partial/unmatched/exception.
- **Proof:** duplicate/re-import idempotency; no journal duplication.

### P14.2 — Exception workflow (V)

- Exception queue, reason, permissioned manual match, split/merge, audit,
  retry/replay.
- **Proof:** exception cannot disappear; closed period behavior explicit;
  resolution replay safe.

### P14.3 — Bank statement normalization and matching (V)

- CSV/JSON import, normalized transaction, suggested/manual match, discrepancy
  posting via P12.
- **Proof:** source file retained; row errors; tenant/PII/security; duplicate safe.

### P14.4 — Reconciliation operations (H/I)

- Status/lag/report, period-close dependency, notification, runbook.
- **Gate/Push:** target lag <1h, all resolutions auditable, end-to-end settlement
  and bank path; checkpoint ide; commit
  `feat(phase-14): complete settlement and bank reconciliation`; push GitHub.

---

## 20. Phase 15 — Purchasing, supplier, reorder, approval

**Dependency:** P05, P12, P13.

### P15.1 — Supplier and analytics (V)

- Supplier, terms, lead time, score, history, spend/performance read model.
- **Proof:** tenant/PII permissions, metrics trace to purchase facts.

### P15.2 — Purchase order lifecycle (V)

- Draft→pending approval→approved→partial received→received/cancelled,
  limits, role approval, audit.
- **Proof:** illegal transition/duplicate approval negative tests.

### P15.3 — Receiving and stock/accounting integration (I)

- Partial receive/backorder/landed-cost contract; `PURCHASE_RECEIVED` updates
  stock and posts AP/journal.
- **Proof:** duplicate receive safe; stock and journal transactionally consistent.

### P15.4 — Reorder suggestion (V)

- Stock/lead-time/sales suggestion; draft only unless approval.
- **Gate/Push:** PO→receiving→inventory→AP/supplier E2E; checkpoint ide; commit
  `feat(phase-15): complete purchasing and supplier operations`; push GitHub.

---

## 21. Phase 16 — Notification center dan automation engine

**Dependency:** P06; P05/P07/P13/P14/P15 as event producers become available.

### P16.1 — Notification entity and in-app center (V)

- Critical/attention/information/success, unread/read, preference, quiet hours.
- Events: order, low stock, sync failure, reconciliation exception, report ready.
- **Proof:** notification tenant-safe, dedupe key, UI states.

### P16.2 — Channel abstraction and delivery (I)

- In-app complete; email/WhatsApp interface only until provider approved;
  delivery status/retry/dead-letter.
- **Proof:** no fake external delivery; fallback in-app visible.

### P16.3 — Rule, trigger, condition, action (V)

- Event/schedule trigger, conditions, actions through domain APIs, dry-run,
  preview, approval_required, execution log.
- **Proof:** no direct DB action; action permission same as manual.

### P16.4 — Reliability and safety (H)

- Idempotent execution, lock, retry/dead-letter, rate control, loop prevention,
  pause/disable, repeated-failure alert.
- **Gate/Push:** four required flows E2E, duplicate event one action; checkpoint
  ide; commit `feat(phase-16): complete notifications and automation`; push GitHub.

---

## 22. Phase 17 — AI read-only business copilot

**Dependency:** P06, P13, P16; provider secret through approved secret flow.

### P17.1 — AI provider adapter and evidence model (F)

- Provider adapter, model/version, `ai_insight`, evidence reference, confidence,
  `insufficient_data`, timeout/budget.
- **Proof:** provider failure explicit; secret never logged; no DB access.

### P17.2 — Read-only tool registry (I)

- Profit breakdown, snapshot, inventory, order/search/report summary; schemas,
  tenant/role filtering, timeout and structured output.
- **Proof:** tool permission cannot exceed caller; tenant isolation fixture;
  arbitrary tool rejected.

### P17.3 — Grounded copilot service (V)

- `POST /v1/ai/copilot/ask`, Why→What→Do response, evidence links, confidence,
  external content marked data not instruction.
- **Proof:** every numeric claim evidence-valid; prompt injection rejected;
  insufficient data explicit.

### P17.4 — Explain This UI and feedback (V)

- Explain source metric, evidence, review/ignore/feedback events.
- **Gate/Push:** grounding/security/provider-failure/tenant E2E; checkpoint ide;
  commit `feat(phase-17): complete grounded read-only AI copilot`; push GitHub.

---

## 23. Phase 18 — AI action layer dan business memory

**Dependency:** P17, P15, P16, P12/P13.

### P18.1 — Tool risk registry (F)

- Risk 0 read, risk 1 draft, risk 2 confirmation, risk 3 approval role;
  allowed tools and required permission.
- **Proof:** default deny; registry audit/version.

### P18.2 — Proposal, approval, execution (V/I)

- Proposal impact/cost/risk → confirmation/role approval → same Domain API as
  manual → audit `source=ai_copilot`.
- **Proof:** expiry, duplicate confirmation, permission downgrade, rollback/
  reversal, provider failure without partial execution.

### P18.3 — Business memory (V)

- Authorized facts/preferences/decisions with source/evidence/retention; view,
  correct, delete.
- **Proof:** user cannot see other tenant memory; deletion/retention audited;
  no hidden training claim.

### P18.4 — Action operations and safety H

- Monitoring, failed action queue, replay policy, incident/runbook.
- **Gate/Push:** AI never bypasses permission; parity with manual posting;
  checkpoint ide; commit `feat(phase-18): complete AI action safety and business
  memory`; push GitHub.

---

## 24. Phase 19 — WhatsApp P0: notification dan read-only query

**Dependency:** P06 and P16; WhatsApp provider approval/credentials.

### P19.1 — WhatsApp channel and webhook security (I)

- Provider adapter, outbound queue, HMAC/signature, consent/opt-in, phone
  normalization, rate limit, delivery status.
- **Proof:** webhook duplicate safe; phone-to-tenant binding; no sensitive leak;
  credentials through secret flow only.

### P19.2 — Business notifications (I)

- Order, low stock, sync failed, reconciliation exception, report ready;
  preference/quiet hours/fallback in-app.
- **Proof:** notification dedupe/retry/dead-letter and opt-out.

### P19.3 — Deterministic read-only query (V)

- Daily snapshot and inventory/order read services; bounded commands; ambiguity
  asks clarification; never mutates.
- **Gate/Push:** P0 equivalent, 30-day real-use evidence before P20; checkpoint
  ide; commit `feat(phase-19): complete WhatsApp P0 access channel`; push GitHub.

---

## 25. Phase 20 — WhatsApp P1/P2 approval dan assistant action

**Dependency:** P19 30-day evidence, P17, P18, P15/P12.

### P20.1 — Interactive approval token (V)

- Approve/reject small PO per role/limit, signed one-time token, expiry,
  replay prevention, receipt.
- **Proof:** token cannot cross tenant/user/action; duplicate click one effect.

### P20.2 — Transaction input as draft (V)

- Natural language → parse → draft → review → approval; ambiguous amount/account/
  entity asks clarification.
- **Proof:** no direct posting; draft can be discarded; evidence and audit.

### P20.3 — Channel policy parity (I/H)

- Reuse P17/P18 registry/evidence/risk; WhatsApp has no extra privilege.
- **Gate/Push:** financial posting parity, replay/security, approval E2E;
  checkpoint ide; commit `feat(phase-20): complete WhatsApp approvals and
  assistant actions`; push GitHub.

---

## 26. Phase 21 — Billing, plans, metering, feature flags

**Dependency:** P01, P06; payment provider only when explicitly selected and
connected. Core entitlement must work without inventing a provider.

### P21.1 — Plan and entitlement service (V)

- Starter/Growth/Business/Enterprise limits from PRD; Tokopedia/TikTok count as
  two business channels; API/UI/domain all call one entitlement service.
- **Proof:** API cannot bypass UI; default deny for protected features; audit.

**Billing readiness rule:** P21 memiliki dua status terpisah. `Entitlement /
metering ready` wajib dapat selesai tanpa payment provider. `Paid collection
enabled` tetap `BLOCKED` sampai provider dipilih dan terhubung melalui secret
flow, webhook signature/idempotency tervalidasi, invoice/charge state dapat
  direkonsiliasi, dan failure/refund policy diuji. Jangan membuat provider,
invoice, atau charge palsu.

### P21.2 — Usage counters and billing period (V)

- orders/month, channels, users, automation, AI usage; period reset; >80%
  warning; overage continues processing and records add-on.
- **Proof:** reset idempotent, concurrent increment safe, no order stopped by
  metering bug.

### P21.3 — Trial, pricing, transparent settings (V)

- 14-day Growth trial without card, Sandbox Mode, usage progress, upgrade/
  overage explanation, clear denial.
- **Proof:** timezone/boundary tests, expired trial state, no misleading price.

### P21.4 — Feature flag rollout (H)

- Tenant override, safe default, audit, gradual rollout/kill switch.
- **Gate/Push:** entitlement matrix, period/reset/overage, bypass tests; checkpoint
  ide; commit `feat(phase-21): complete billing metering and feature flags`;
  push GitHub.

---

## 27. Phase 22 — Analytics, saved views, custom dashboard, bulk, documents

**Dependency:** P06, P13, P16, P17.

### P22.1 — Analytics taxonomy and event pipeline (F/V)

- snake_case events, `org_id`, `user_id`, timestamp, entity, minimized PII;
  North Star assisted decision derived metric.
- **Proof:** analytics cannot alter transaction truth; duplicate/event retention
  and tenant tests.

### P22.2 — Approved read-model widgets (V)

- Widget definitions only from approved read models; filter/date/channel/
  warehouse scope; stale/empty/error/loading states.
- **Proof:** no arbitrary SQL; widget latency baseline and permission checks.

### P22.3 — Saved views and sharing (V)

- Save/share permission, version/invalid filter handling, URL/deep-link.
- **Proof:** revoked access and tenant switch cannot expose data.

### P22.4 — Bulk/barcode/document/export extensions (I)

- Bulk preview/row result/idempotency; barcode linked to inventory/order APIs;
  invoices/financial documents via StorageAdapter and backup.
- **Gate/Push:** partial failure recoverable, documents retrievable/auditable;
  checkpoint ide; commit `feat(phase-22): complete analytics and advanced
  workspace`; push GitHub.

---

## 28. Phase 23 — Advanced finance, multi-business, tax, public API

**Dependency:** P13, P21, P22. Legal/product review required for tax claims.

### P23.1 — Multi-business membership and switch (V)

- Active org visible, safe switch, explicit consolidated permission, isolated
  queries/cache/session.
- **Proof:** cross-tenant isolation suite including exports/jobs and cache.

### P23.2 — Tax classes and reports (V)

- Configurable Indonesian tax mapping, tax classes/reports, period lock.
- **Proof:** invariant and versioned rules; legal limitation shown; no invented
  regulatory advice.

### P23.3 — Multi-currency UX and conversion (I)

- Progressive disclosure, snapshot/rule-based conversion, reports and FX
  integration with P12.
- **Proof:** two-plus currency reconciliation and closed-period behavior.

### P23.4 — Versioned public API and outbound webhooks (V/I)

- `/v1`, scoped API key/OAuth contract, rate limit, idempotency, pagination;
  HMAC outbound webhook, retry 3x/backoff, dead-letter/replay/subscribers;
  connector contract test kit/docs.
- **Gate/Push:** abuse/security/backward compatibility/docs/runbook; checkpoint
  ide; commit `feat(phase-23): complete advanced finance and public platform`;
  push GitHub.

---

## 29. Phase 24 — Security, performance, UAT, release candidate, GA

**Dependency:** P00–P23. P24 tidak boleh dipakai untuk menyelesaikan fitur yang
belum complete.

### P24.1 — Empty-to-representative migration proof (H)

- Fresh DB migration, seed, representative fixture, upgrade from prior version,
  rollback/recovery rehearsal.
- **Proof:** no pending migration, checksum/count comparison, restore evidence.

### P24.2 — Full regression and invariant suite (H)

- Unit/integration/E2E seluruh domain; debit=credit, stock race, idempotency,
  tenant, AI grounding, connector replay, portability.
- **Proof:** no flaky known failure; test report artifact.

### P24.3 — Performance and capacity baseline (H)

- Dashboard cached <1s/cold <2.5s; read <500ms; order write <800ms; search
  <300ms; report async <60s; 10k orders/day model.
- **Proof:** P95, EXPLAIN, no N+1, regression >20% blocks release.

### P24.4 — Security and operational readiness (H)

- Dependency audit, SAST, auth/session/rate/PII/secret review, backup restore,
  `/health`, uptime/error tracking plan, alert routing, runbooks.
- **Proof:** no critical/high unresolved in release scope; shared-hosting RPO/RTO
  truth displayed; privacy/data-governance evidence tersedia: PII inventory dan
  purpose, retention/legal-hold policy, consent/withdrawal, access/correction/
  deletion request lifecycle untuk data yang boleh dihapus, immutable audit
  retention, dan legal/product review sebelum klaim kepatuhan publik.

### P24.5 — UAT, release candidate, GA decision (H)

- At least three real-business profiles, mobile/browser/a11y smoke, release
  notes, known limits, support/onboarding material, rollback decision.
- **Gate P24:** all PRD DoC 134–139, 137/148, NFR/testing/reachability/
  continuity dan privacy/data-governance evidence; user sign-off; C4.1–C4.2
  market evidence pack dan keputusan segment lulus. Paid billing hanya boleh
  disebut enabled bila provider dipilih, webhook tervalidasi,
  entitlement-to-invoice mapping dan reconciliation terbukti; tanpa provider,
  hanya entitlement/metering/trial yang boleh dinyatakan Complete.
- **Checkpoint/push:** ide khusus GA; commit
  `feat(phase-24): complete hardening and GA readiness`; push GitHub.

---

## 30. Phase 25 — Triggered cloud migration, adapter swap

**Trigger wajib:** >3.000 order/bulan, >50 tenant aktif, DB connection sustained
>70%, atau kebutuhan worker/WebSocket/Enterprise SLA yang tidak dapat dipenuhi
shared hosting. P25 tidak dimulai hanya karena cloud terlihat lebih modern.

### P25.1 — Provision dan environment parity (F)

- Container dari codebase sama, managed PostgreSQL, Redis, object storage,
  secrets/config, observability.
- **Proof:** build artifact parity, no domain rewrite, security baseline.

### P25.2 — Database migration rehearsal (H)

- Backup restore/logical replication, checksum/count comparison, cutover and
  rollback runbook; rehearsal minimal dua kali.
- **Proof:** measured RPO/RTO, no data loss or split-brain.

### P25.3 — Adapter switch and worker separation (I)

```text
QUEUE_ADAPTER=postgres → redis
CACHE_ADAPTER=memory → redis
STORAGE_ADAPTER=local → s3
REALTIME_ADAPTER=sse → websocket
```

- **Proof:** application/domain handler tidak berubah; heavy worker memakai
  handler yang sama; contract suite lulus di kedua mode.

### P25.4 — Cutover, observation, rollback (H)

- Read-only old instance, DNS TTL, 5–10 minute write freeze, final replication,
  DNS cutover, 72-hour observation, rollback <30 minutes.
- **Gate/Push:** migration dua kali, checksum, RPO ≤15m/RTO ≤4h operationally
  demonstrated, smoke/perf/security/UAT; checkpoint ide; commit
  `feat(phase-25): complete triggered cloud migration`; push GitHub.

---

## 31. Gate lintas phase yang selalu aktif

| Gate | Berlaku | Bukti wajib |
|---|---|---|
| Tenant isolation | setiap data read/write | API, search, export, cache, queue/job |
| Money invariant | P12–P25 | debit=credit, append-only, close, reversal |
| Stock invariant | P05, connector, automation, purchasing | no oversell, immutable movement, valuation |
| Idempotency | mutation, webhook, job, import | duplicate = satu efek |
| Source of truth | P04–P25 | dashboard/report/AI membaca read model resmi |
| Adapter boundary | P00, P07–P25 | domain bebas vendor/infrastructure import |
| Async safety | job/export/report/reconcile/AI | tidak blocking, retry/dead-letter terlihat |
| Auditability | sensitive mutation | actor, source, before/after, reference, time |
| UX completeness | setiap UI | loading/empty/error/success/partial, responsive, keyboard |
| Operational readiness | external integration | health, last sync, count, failure, retry, impact |

Jika satu gate gagal, status tetap `BLOCKED` atau `IN_PROGRESS`; jangan
memindahkan failure ke phase berikutnya.

---

## 32. Protokol checkpoint ide Replit AI

Checkpoint wajib dilakukan **setelah setiap subphase** dan **setelah seluruh
phase**, setelah validation lulus. Replit AI harus berhenti dan menunggu
keputusan pengguna sebelum memasukkan ide apa pun.

Format wajib:

```text
CHECKPOINT IDE — [PXX.Y / PXX — nama]

Scope selesai:
- [ringkas vertical slice/fondasi]
- [migration/API/UI/event yang berubah]

Validation:
- build/typecheck/lint: [status]
- unit: [n]
- integration/contract: [n]
- E2E/smoke: [n]
- migration/security/performance/accessibility: [status]
- known limitation/blocker: [none atau jelas]

Ide yang tetap berada dalam scope modul ini:
A. [ide kecil] — nilai, risiko, dan test tambahan
B. [ide integrasi] — producer/consumer dan dampak kontrak
C. [ide UX/operasional] — nilai pengguna tanpa domain baru

Pilih A/B/C/gabungan, atau “lanjut tanpa perubahan”.
Jika tidak dipilih, ide tidak diimplementasikan.
```

Batas ide:

- hanya modul yang baru selesai;
- tidak mengubah source of truth, schema inti, permission, accounting rule,
  public API, phase order, atau dependency;
- tidak menambah marketplace/provider/payment/AI capability di luar scope;
- perubahan besar menjadi change proposal/phase baru;
- ide yang dipilih harus memiliki scope note dan test impact sebelum coding.

---

## 33. Protokol commit dan push GitHub

### 33.1 Subphase

Subphase boleh memiliki commit kecil setelah local validation, tetapi jangan
mengklaim phase selesai sebelum semua subphase dan phase gate lulus.

### 33.2 Phase

Setelah:

1. semua subphase phase `Complete`;
2. full regression dan cross-module E2E lulus;
3. build/type/lint/test/smoke/security/performance relevan lulus;
4. migration clean;
5. `.env.example`, docs, ADR, runbook sinkron;
6. checkpoint ide phase ditawarkan dan jawabannya dicatat;

lakukan:

```text
git status
git diff --check
git add <scope>
git commit -m "feat(phase-XX): complete <phase name>"
git push origin <working-branch>
```

Body commit atau PR wajib memuat scope, evidence, command/hasil, migration/
rollback, known limitation, dan checkpoint decision.

Jika push gagal karena remote/credential:

- jangan mengarang sukses;
- laporkan error persis;
- pertahankan commit lokal;
- minta user memperbaiki koneksi GitHub;
- phase belum `Complete` sampai push berhasil.

---

## 34. Prompt operasional untuk satu task Replit AI

Gunakan satu prompt per subphase:

```text
Kerjakan hanya [PXX.Y — nama subphase] dari
DOC/AUTOPROFIT_EXECUTION_PHASES_REV5.md.

Baca PRD Master Rev 5 bagian [nomor] dan cek kode terbaru sebelum mengubah apa pun.
Jangan mengerjakan subphase lain, jangan mengubah urutan phase, dan pertahankan
stack serta adapter boundary yang ada.

Sebelum coding:
1. tulis scope note, out-of-scope, domain/API/UI contract, migration plan,
   integration map, test plan, dan observability plan;
2. identifikasi market-task C0–C4 yang terikat pada [PXX.Y] di bagian 4.1;
3. jika dependency atau evidence market wajib belum tersedia, berhenti dan
   laporkan BLOCKED/OPEN dengan alasannya.

Saat coding:
4. ikuti Contract → Schema → Domain/Application → API → UI → Events/Jobs;
5. gunakan tenant context dari session/claims, permission, transaction,
   idempotency, audit, adapter, retry/recovery sesuai scope;
6. tidak boleh ada mock/hardcode/silent fallback pada production path;
7. implementasikan loading, empty, success, partial, error, mobile, desktop,
   keyboard, dan accessibility state yang relevan.

Sebelum menyatakan selesai:
8. jalankan build, typecheck, lint, migration dari DB kosong dan representative,
   unit, integration, contract, E2E/smoke, serta gate khusus;
9. perbaiki failure dalam scope dan jangan memindahkannya ke phase berikutnya;
10. perbarui .env.example, ADR, runbook, dan evidence market-task terkait;
11. tampilkan CHECKPOINT IDE khusus subphase, lalu berhenti menunggu keputusan.

Jangan membuat credential marketplace, payment provider, WhatsApp delivery,
AI result, atau data bisnis palsu. Sandbox/mock hanya untuk test dan harus
ditandai jelas.
```

Setelah semua subphase phase selesai, gunakan prompt phase:

```text
Validasi seluruh [PXX] terhadap Definition of Complete dokumen eksekusi dan PRD.
Jalankan full regression lintas dependency, cross-module E2E, migration smoke,
security/performance gate, dan review docs/runbook. Tampilkan evidence. Tawarkan
CHECKPOINT IDE phase, tunggu keputusan, lalu commit dan push ke GitHub. Jika
ada satu failure, status tetap BLOCKED/IN_PROGRESS dan jangan push sebagai
phase-complete.
```

---

## 35. Traceability modul PRD → phase eksekusi

| Modul PRD | Lokasi |
|---|---|
| Architecture, DB, API, logging, monitoring, deployment | P00.1–P00.4 |
| Auth, tenant, membership, RBAC, session, audit | P01.1–P01.4 |
| Design system, shell, responsive, PWA, onboarding | P02.1–P02.4 |
| Product, variant, SKU, listing, barcode foundation | P03.1–P03.4 |
| Customer, order, lifecycle, return/refund | P04.1–P04.4 |
| Inventory, warehouse, reservation, transfer, costing | P05.1–P05.4 |
| Import, dashboard, Today Mode, search, export, portability | P06.1–P06.4 |
| Connector contract, sync, retry, raw payload, replay | P07.1–P07.4 |
| Shopee | P08.1–P08.3 |
| Tokopedia + TikTok Shop | P09.1–P09.3 |
| Lazada | P10.1–P10.3 |
| Blibli | P11.1–P11.3 |
| COA, journal, ledger, posting, close, FX | P12.1–P12.5 |
| Cash, COGS, profit, financial reports | P13.1–P13.4 |
| Marketplace/bank reconciliation | P14.1–P14.4 |
| Supplier, PO, receiving, reorder | P15.1–P15.4 |
| Notifications, channels, automation, safety | P16.1–P16.4 |
| AI read-only copilot, tools, evidence | P17.1–P17.4 |
| AI action risk, approval, memory | P18.1–P18.4 |
| WhatsApp P0 | P19.1–P19.3 |
| WhatsApp P1/P2 and assistant action | P20.1–P20.3 |
| Plans, entitlements, metering, flags | P21.1–P21.4 |
| Analytics, widgets, saved views, bulk, docs | P22.1–P22.4 |
| Multi-business, tax, multi-currency, public API | P23.1–P23.4 |
| Regression, load, security, UAT, GA | P24.1–P24.5 |
| Triggered cloud migration | P25.1–P25.4 |

---

## 36. Urutan mulai yang disarankan

1. Kerjakan P00.1–P00.4 berurutan.
2. Tawarkan checkpoint P00, tunggu keputusan, lalu commit dan push P00.
3. Kerjakan P01.1–P01.4; P01 adalah gate wajib sebelum fitur data.
4. Kerjakan P02 dan P03; onboarding dan catalog dapat berjalan hanya setelah
   tenant context serta API boundary tersedia.
5. Lanjutkan satu vertical slice per subphase sampai P06; validasi DoC Orders,
   Inventory, Dashboard sebelum marketplace.
6. Bangun P07 dan **hanya satu connector** sebagai P08 pilot. Setelah P08 gate
   lulus, connector lain dapat dikerjakan satu per satu.
7. Kerjakan P12 accounting dengan gate paling ketat sebelum P14/P23.
8. Ikuti dependency di bagian 4; jangan memakai P24 sebagai tempat menambal
   modul yang belum selesai.
9. Jalankan continuity track pada setiap phase.
10. Setelah setiap phase berhasil, langsung push GitHub sesuai bagian 33.

Dengan urutan ini, seluruh modul PRD memiliki unit kerja, dependency, contract,
acceptance proof, checkpoint ide, dan checkpoint GitHub yang eksplisit tanpa
memindahkan tanggung jawab correctness ke phase berikutnya.