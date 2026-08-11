# AUTOPROFIT

## Unified Commerce, Finance & Business Intelligence Platform

**PRD — Revisi 4 (Deployment-Real & Completion-Enforced)**

**Status:** Build-Ready + Deployment-Ready
**Basis:** Rev 3 (dokumen sebelumnya) — dokumen ini adalah **addendum wajib-baca**, bukan pengganti. Semua bagian Rev 3 (1–126) tetap berlaku kecuali dinyatakan lain di sini.

---

# CHANGELOG — REV 3 → REV 4

Rev 3 sudah *build-ready* secara spesifikasi (data model, API, accounting, security, dsb sudah presisi). Tapi Rev 3 punya dua kelemahan nyata yang akan menyebabkan proyek gagal di lapangan kalau tidak diperbaiki sebelum coding dimulai:

1. **Rev 3 mengasumsikan infrastruktur ideal.** Semua target SLA (99.9% uptime, RPO ≤15 menit, background worker terpisah, Redis, WebSocket) ditulis seolah tim akan langsung punya cloud infrastructure. Kenyataannya, deploy awal ada di **shared hosting** — lingkungan dengan constraint keras: tidak ada root access, tidak ada Docker/systemd, koneksi database dibatasi, sering tidak ada Redis, proses long-running dikelola Passenger/cPanel (bukan PM2), tidak ada worker process terpisah. Kalau arsitektur Rev 3 dipaksakan apa adanya, sistem akan **crash atau gagal deploy dari hari pertama**.
2. **Rev 3 mendefinisikan modul sebagai daftar fitur, bukan sebagai unit kerja yang "selesai."** Tim engineering bisa saja mengklaim "Orders module done" padahal edge case return/cancel/refund belum ditangani, atau "Accounting done" padahal reversing entry belum diuji. Ini menyebabkan utang teknis tersembunyi di modul inti — yang paling mahal untuk diperbaiki belakangan karena modul lain bergantung padanya.

Rev 4 menambahkan:

- **PART III — DEPLOYMENT REALITY & INFRASTRUCTURE STRATEGY** (Bagian 127–134): arsitektur konkret untuk shared hosting Node.js + PostgreSQL, plus jalur migrasi bertahap ke cloud tanpa rewrite total.
- **PART IV — DEFINITION OF COMPLETE (DoC) UNTUK CORE MODULE** (Bagian 135–141): checklist wajib-lolos per modul inti sebelum modul boleh disebut "selesai" dan sebelum modul berikutnya boleh mulai dibangun di atasnya.
- **Revisi Bagian 103 (Phase Build)** dan **Bagian 119 (NFR/SLA)** agar realistis terhadap fase shared hosting vs fase cloud.
- **Revisi Bagian 126 (Readiness Scorecard)** dengan dimensi baru: *Deployability* dan *Completion Enforcement*.

Prinsip Rev 4:

> **Jangan desain untuk infrastruktur yang belum kamu punya. Desain untuk infrastruktur yang kamu punya sekarang, dengan pintu keluar yang sudah disiapkan sejak hari pertama.**

> **"Selesai" bukan status yang diklaim. "Selesai" adalah checklist yang lolos.**

---

# PART III — DEPLOYMENT REALITY & INFRASTRUCTURE STRATEGY

# 127. PRINSIP ARSITEKTUR DUA FASE

AutoProfit dibangun dengan **satu codebase, dua mode deployment**, dihubungkan lewat *adapter layer*. Kode aplikasi tidak boleh tahu apakah dia berjalan di shared hosting atau di cloud — yang berubah hanya implementasi adapter di belakang interface yang sama.

```text
Application Code (domain logic, API, UI)
        ↓ bergantung pada interface, bukan implementasi
┌───────────────────────────────────────────┐
│  ADAPTER LAYER (ditentukan oleh ENV var)   │
│  - QueueAdapter   (Postgres | Redis/BullMQ)│
│  - CacheAdapter   (In-Memory | Redis)      │
│  - StorageAdapter (Local Disk | S3/Spaces) │
│  - RealtimeAdapter(Polling/SSE | WebSocket)│
│  - LockAdapter    (PG Advisory Lock | Redis)│
└───────────────────────────────────────────┘
        ↓
FASE 1: Shared Hosting          FASE 2: Cloud (VPS/Container)
Node.js (Passenger) + PostgreSQL   Docker + PostgreSQL managed + Redis + Workers
```

**Aturan keras:** setiap fitur baru yang butuh Redis, worker terpisah, atau WebSocket **wajib** ditulis melalui adapter di atas. Tidak boleh ada `import redis from 'redis'` langsung di domain logic. Pelanggaran aturan ini adalah *blocker* code review, bukan saran.

---

# 128. FASE 1 — ARSITEKTUR SHARED HOSTING (Node.js + PostgreSQL)

## 128.1 Constraint Nyata Shared Hosting yang Harus Diasumsikan Sejak Awal

| Constraint | Implikasi Desain |
|---|---|
| Proses dikelola Passenger/cPanel "Setup Node.js App", bukan PM2/systemd | Tidak boleh ada proses worker terpisah yang di-`spawn` manual — semua background job jalan **di dalam proses app yang sama**, dijadwalkan via `node-cron`/interval internal |
| Koneksi DB dibatasi (umum: 10–30 koneksi total per akun hosting) | Pool PostgreSQL **wajib** dibatasi kecil (`max: 5–8`), reuse koneksi ketat, tidak boleh buka koneksi baru per-request |
| Umumnya tidak ada Redis tersedia | `CacheAdapter` default = in-memory LRU per-proses; `QueueAdapter` default = tabel Postgres (`job_queue`) yang di-poll |
| Tidak ada guarantee 1 proses saja yang jalan (hosting bisa restart/scale proses tanpa pemberitahuan) | Semua job scheduler **wajib** pakai `pg_advisory_lock` sebelum eksekusi agar tidak ada job dobel jika ada 2 proses hidup bersamaan |
| WebSocket sering tidak stabil di shared hosting (proxy/Passenger membatasi koneksi persisten) | Realtime UI default pakai **SSE dengan fallback polling 5 detik**, bukan WebSocket wajib |
| Tidak ada akses filesystem persisten yang aman untuk skala besar (kadang di-reset saat migrasi akun) | Upload/export **tidak boleh** disimpan permanen di local disk sebagai satu-satunya salinan — `StorageAdapter` fase 1 tetap pakai local disk untuk performa, tapi **setiap file penting (invoice, laporan keuangan, backup) wajib disalin ke object storage eksternal murah** (mis. Cloudflare R2/DO Spaces) sebagai satu-satunya sumber kebenaran jangka panjang, meskipun app-nya sendiri masih di shared hosting |
| Tidak ada root/sudo, tidak ada custom OS package | Semua dependency harus lewat `npm`, tidak boleh bergantung pada binary sistem yang tidak dijamin ada (mis. `imagemagick` CLI) — pakai library pure-JS/WASM setara |
| SSL/TLS biasanya dikelola panel hosting (AutoSSL) | Aplikasi tidak perlu mengurus TLS termination sendiri, cukup pastikan `X-Forwarded-Proto` dihormati untuk redirect HTTPS |

## 128.2 Struktur Proses Aplikasi (Fase 1)

Satu proses Node.js menjalankan **tiga peran sekaligus** dalam satu event loop, dipisah secara logis lewat modul, bukan lewat proses OS:

```text
Node.js Process (dikelola Passenger)
├── HTTP Server (Express/Fastify)     → melayani API + serve frontend build
├── Internal Scheduler (node-cron)    → menjalankan job berkala (lihat 128.4)
└── In-Process Job Poller             → memproses antrian job_queue setiap N detik
```

Ini **disengaja** menyalahi prinsip "jangan blocking event loop" — mitigasinya:
- Semua job berat (reconciliation, report generation, AI analysis) di-*chunk* menjadi batch kecil (mis. proses 50 order per tick, bukan 50.000 sekaligus) agar tidak memblokir request HTTP yang masuk bersamaan.
- Job poller berjalan dengan `setImmediate`/`setInterval` yang selalu memberi kesempatan event loop melayani HTTP request di antara batch.
- Endpoint API yang benar-benar berat (P&L custom range, export besar) tetap **async** dari sisi user (Bagian 122.1) — user tidak menunggu response HTTP, hasil diberi tahu lewat notification saat job selesai.

## 128.3 Job Queue di Atas PostgreSQL (pengganti Redis/BullMQ di Fase 1)

Tabel baru (melengkapi Bagian 115.2):

**job_queue**
`id, org_id, type, payload(jsonb), status[pending|processing|done|failed|dead], attempts, max_attempts, run_after, locked_by, locked_at, error, created_at, updated_at`

Alur:

```text
enqueue()  → INSERT status=pending, run_after=now()
poller tick (setiap 3 detik):
  SELECT ... WHERE status='pending' AND run_after <= now()
  FOR UPDATE SKIP LOCKED   -- kunci baris agar tidak diambil proses lain
  LIMIT 10
  → set status='processing', locked_by=<process_id>
  → jalankan handler sesuai `type`
  → sukses: status='done'
  → gagal: attempts+=1; jika attempts < max_attempts → status='pending', run_after=now()+backoff
           jika attempts >= max_attempts → status='dead' (masuk Bagian 77 dead-letter)
```

`FOR UPDATE SKIP LOCKED` adalah fitur native PostgreSQL — inilah yang membuat pola ini aman dipakai walau ada lebih dari satu proses Node.js berjalan bersamaan (umum terjadi di shared hosting saat auto-restart), **tanpa butuh Redis sama sekali**. Interface `QueueAdapter` di Fase 2 tinggal diarahkan ke BullMQ/Redis — kode yang memanggil `queue.enqueue(type, payload)` tidak berubah.

## 128.4 Jadwal Job Internal (node-cron, jalan di dalam proses yang sama)

```text
*/3 detik   → job_queue poller (proses antrian)
*/30 menit  → marketplace polling sync (safety-net, lihat 117.4)
*/5 menit   → order polling untuk marketplace non-webhook
setiap jam  → refresh summary table dashboard (lihat 128.6)
setiap hari 02:00 WIB → pg_dump export → upload ke object storage eksternal
setiap hari 02:30 WIB → recompute inventory valuation, cek stock alert
```

Setiap entry cron **wajib** dibungkus `pg_advisory_lock(hash(job_name))` agar kalau ada 2 proses hidup bersamaan, hanya satu yang benar-benar mengeksekusi.

## 128.5 Caching Tanpa Redis

`CacheAdapter` Fase 1 = in-memory `Map` dengan TTL + LRU eviction (library ringan seperti `lru-cache`), di-scope per-proses. Konsekuensi yang harus diterima secara sadar: cache **tidak konsisten** lintas proses jika hosting menjalankan >1 instance. Mitigasi: cache hanya dipakai untuk data yang **toleran terhadap staleness beberapa menit** (mis. dashboard summary, hasil report), **tidak pernah** dipakai untuk data yang butuh konsistensi kuat (saldo stok real-time, status pembayaran) — data itu selalu query langsung ke Postgres.

## 128.6 Strategi "Fast & Responsive" Tanpa Infrastruktur Berat

Karena Fase 1 tidak punya Redis/CDN dinamis/multi-instance, kecepatan dicapai lewat **desain query dan precomputation**, bukan lewat scaling horizontal:

1. **Summary table, bukan agregasi on-the-fly.** Dashboard (Bagian 9–13) **tidak boleh** menghitung SUM/JOIN berat setiap kali di-load. Job berkala (tiap jam + trigger setelah event penting) menulis hasil ke tabel `dashboard_summary_daily(org_id, date, revenue, gross_profit, net_profit, cash, ...)`. Endpoint dashboard hanya `SELECT` baris yang sudah jadi → memenuhi target P95 < 500ms (Bagian 122.1) walau tanpa Redis.
2. **Index wajib** pada semua kolom yang dipakai `WHERE`/`ORDER BY` di jalur request-response: `(org_id, status)`, `(org_id, placed_at)`, `(org_id, channel_id)`, dst. Setiap PR yang menambah query baru wajib menyertakan `EXPLAIN ANALYZE`.
3. **Pagination wajib** di semua list endpoint (sudah diatur Bagian 116.1) — tidak ada endpoint yang mengembalikan seluruh tabel.
4. **Frontend:** static asset (JS/CSS bundle) di-serve lewat **Cloudflare (free tier) di depan domain shared hosting** sebagai CDN + cache layer gratis — ini adalah cara termurah mendapatkan efek "edge caching" tanpa infrastruktur cloud sendiri. Cloudflare juga memberi proteksi rate-limit/DDoS dasar yang tidak tersedia native di shared hosting.
5. **Server-side query batching:** hindari N+1 — setiap endpoint list-with-relation (mis. order + item + customer) wajib satu query dengan JOIN/aggregation, bukan loop query per baris.

## 128.7 Realtime UI Tanpa WebSocket Wajib

`RealtimeAdapter` Fase 1: **Server-Sent Events (SSE)** untuk notifikasi/update dashboard (SSE lebih stabil di belakang proxy shared hosting dibanding WebSocket karena satu arah dan berbasis HTTP biasa), dengan **fallback otomatis ke polling 5 detik** jika koneksi SSE terputus 2x berturut-turut. UI tidak pernah tahu (dan tidak perlu tahu) mode mana yang aktif — hanya menerima event lewat satu hook yang sama.

## 128.8 Backup & SLA — Versi Realistis untuk Fase 1

Target Bagian 119 (RPO ≤15 menit, RTO ≤4 jam, uptime 99.9%) **tidak dapat dijamin penuh** di shared hosting karena app tidak punya kontrol atas infrastruktur fisik hosting. Rev 4 menetapkan **SLA bertingkat**, bukan mengabaikan targetnya:

| Metrik | Target Fase 1 (Shared Hosting) | Target Fase 2 (Cloud, sesuai Bagian 119 asli) |
|---|---|---|
| Uptime | Best-effort mengikuti SLA provider hosting (umumnya 99.5%) + monitoring eksternal (UptimeRobot/sejenis) untuk alert cepat | 99.9% (managed infra + autoscaling) |
| RPO | ≤ 24 jam (pg_dump harian ke object storage eksternal, lihat 128.4) — **dikomunikasikan jelas ke user sebagai batas Fase 1** | ≤ 15 menit (continuous WAL archiving) |
| RTO | ≤ 24 jam (restore manual dari dump ke akun hosting baru/sementara) | ≤ 4 jam (automated failover) |
| Trigger migrasi wajib | Lihat Bagian 129.1 | — |

Ini bukan kompromi kualitas produk — ini kejujuran teknis yang **wajib dinyatakan** ke user Fase 1 (dalam ToS/Trust page), karena mengklaim RPO 15 menit di atas shared hosting tanpa WAL archiving adalah janji palsu yang akan pecah saat insiden nyata terjadi.

---

# 129. FASE 2 — MIGRASI KE CLOUD SERVER

## 129.1 Trigger Migrasi (kapan wajib pindah, bukan "kapan sempat")

Migrasi ke cloud **wajib** dimulai begitu **salah satu** kondisi berikut tercapai (bukan menunggu semua):

- Order aktif > **3.000/bulan** total lintas tenant, ATAU
- Tenant aktif > **50**, ATAU
- Koneksi database mendekati limit paket hosting (>70% terpakai secara sustained), ATAU
- Butuh fitur yang secara struktural tidak bisa dipenuhi shared hosting: worker terpisah untuk AI heavy processing, WebSocket stabil untuk fitur kolaboratif, atau SLA uptime kontraktual ke pelanggan Enterprise (Bagian 124).

Menunggu lebih lama dari titik ini akan membuat migrasi jadi *firefighting* darurat, bukan proyek terencana.

## 129.2 Tahapan Migrasi (tanpa rewrite, karena adapter layer sudah disiapkan sejak Bagian 127)

```text
1. Provision infrastruktur cloud
   - Container (Docker) untuk app — image dibangun dari codebase yang SAMA
   - Managed PostgreSQL (mis. RDS/Cloud SQL/DO Managed DB)
   - Redis (managed atau container)
   - Object storage (S3/Spaces) — sudah dipakai sejak Fase 1 untuk backup, tinggal jadi primary storage

2. Migrasi database (near-zero downtime)
   - Setup logical replication: shared-hosting Postgres → cloud Postgres
   - Biarkan replikasi mengejar (catch up)
   - Jadwalkan cutover window singkat (mis. 5–10 menit dini hari WIB, sesuai Bagian 119.5)
   - Stop write di app lama → tunggu replikasi final sync → promote cloud DB → arahkan app ke cloud DB

3. Swap adapter via ENV, bukan lewat code change
   QUEUE_ADAPTER=postgres      → QUEUE_ADAPTER=redis
   CACHE_ADAPTER=memory        → CACHE_ADAPTER=redis
   STORAGE_ADAPTER=local       → STORAGE_ADAPTER=s3
   REALTIME_ADAPTER=sse        → REALTIME_ADAPTER=websocket
   Deploy ulang container dengan ENV baru — logic aplikasi tidak disentuh.

4. Pisahkan worker process
   - Job type berat (reconciliation, AI analysis, report generation) dipindah
     dari "in-process poller" (128.3) ke worker container terpisah yang
     mengonsumsi queue Redis (BullMQ) — kode handler job TIDAK berubah,
     hanya cara job di-dispatch yang berubah (interface QueueAdapter sudah
     mengabstraksi ini sejak awal).

5. Load balancer + horizontal scaling
   - App container di-scale >1 instance di belakang load balancer
   - Karena job locking sudah pakai advisory lock (Postgres) / Redis lock,
     multi-instance aman tanpa job dobel.

6. DNS cutover
   - Turunkan TTL DNS 24–48 jam sebelum migrasi
   - Arahkan domain ke load balancer cloud
   - Shared hosting dibiarkan hidup sebagai fallback baca-saja selama
     periode observasi (mis. 72 jam), baru dimatikan.

7. Rollback plan
   - Selama window cutover, shared-hosting instance TIDAK dimatikan,
     hanya di-set read-only (mencegah write ganda / split-brain data).
   - Jika ditemukan masalah kritis pasca-cutover, DNS diarahkan balik ke
     shared hosting dalam <30 menit; data yang sempat masuk ke cloud
     selama window singkat direkonsiliasi manual (volume kecil karena
     window pendek).
```

## 129.3 Yang Harus Sudah Disiapkan Sejak Fase 1 Agar Migrasi Ini Mulus

- Semua akses storage/cache/queue/realtime **wajib** lewat adapter (Bagian 127) — tanpa ini, migrasi menjadi rewrite, bukan swap konfigurasi.
- Schema database sejak awal **sudah** menggunakan UUID (bukan auto-increment integer) untuk primary key (sudah sesuai Bagian 115.1) — memudahkan merge/replikasi data lintas environment tanpa konflik ID.
- File yang tersimpan di local disk (Fase 1) selalu punya path/reference yang disimpan sebagai *logical key* di database (mis. `invoice_key: "invoices/2026/08/inv_123.pdf"`), bukan absolute path OS — sehingga saat `StorageAdapter` berpindah ke S3, hanya base URL yang berubah, bukan struktur data.
- Environment variable sebagai satu-satunya sumber konfigurasi (12-factor app) — tidak ada nilai hardcoded yang mengasumsikan lingkungan shared hosting.

---

# 130. DEPENDENSI & RUNTIME — BATASAN KONKRET SHARED HOSTING

- Node.js version: pin ke versi LTS yang tersedia di panel hosting (cek `nvm`/Node selector cPanel) — **jangan** pakai fitur bahasa terbaru yang belum tentu didukung versi Node yang disediakan hosting (verifikasi versi node aktual sebelum memilih syntax/lib).
- Build step (TypeScript compile, frontend bundle) dilakukan **di CI**, bukan di server produksi — shared hosting sering punya memory/CPU limit rendah yang tidak cukup untuk build besar. Yang di-upload ke hosting adalah hasil build (`dist/`), bukan source + build di tempat.
- `package.json` scripts produksi hanya `start` (menjalankan app yang sudah di-build) — tidak menjalankan `npm install` dengan devDependencies di server produksi.
- Memory limit proses: asumsikan **512MB–1GB** sebagai batas aman (umum di paket shared hosting Node.js) — hindari load seluruh dataset besar ke memory (mis. export CSV besar wajib streaming, bukan build array penuh di memory, lihat Bagian 89).

---

# 131. MONITORING TANPA APM MAHAL (FASE 1)

- **Uptime eksternal:** layanan gratis/murah (UptimeRobot atau sejenis) hit endpoint `/health` setiap 1–5 menit dari luar, karena app tidak bisa memonitor dirinya sendiri saat proses mati total.
- **Endpoint `/health`:** mengecek koneksi DB (`SELECT 1`), status job poller terakhir jalan (`last_tick_at` tidak boleh lebih tua dari 2x interval), dan mengembalikan `200` hanya jika semua sehat.
- **Structured logging** ke file lokal dengan rotasi (bukan layanan log terpusat mahal) + endpoint admin sederhana untuk `tail` log terbaru; upload log harian ke object storage sebagai arsip (sekali jalan bersama job backup 128.4).
- **Error tracking:** gunakan tingkat gratis layanan seperti Sentry (punya free tier yang cukup untuk tahap awal) — ini satu-satunya dependency eksternal berbayar-opsional yang direkomendasikan di Fase 1 karena nilainya (visibility error production) jauh lebih besar dari biayanya.

---

# 132. RINGKASAN ENVIRONMENT VARIABLE (KONTRAK KONFIGURASI)

```text
NODE_ENV=production
DATABASE_URL=postgres://...            (shared hosting: DB lokal cPanel; cloud: managed PG)
DB_POOL_MAX=6                          (shared hosting) | 20 (cloud)
QUEUE_ADAPTER=postgres | redis
CACHE_ADAPTER=memory | redis
STORAGE_ADAPTER=local | s3
STORAGE_BACKUP_BUCKET=...              (selalu diisi, dipakai sejak Fase 1 untuk backup eksternal)
REALTIME_ADAPTER=sse | websocket
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
RATE_LIMIT_DEFAULT=120/min
RATE_LIMIT_AUTH=20/min
SENTRY_DSN=...
```

Satu file `.env.example` wajib ada di repo dan **selalu sinkron** dengan variabel yang benar-benar dipakai kode — PR yang menambah ENV var baru wajib update file ini di PR yang sama.

---

# PART IV — DEFINITION OF COMPLETE (DoC) UNTUK CORE MODULE

# 133. PRINSIP PENEGAKAN "SELESAI"

Modul di daftar P0 (Bagian 104) **tidak boleh** ditandai selesai di project tracker hanya karena UI sudah bisa dipakai untuk happy path. Modul dianggap **Complete** hanya jika **semua** item checklist di bagian ini lolos, diverifikasi lewat automated test (Bagian 120) — bukan lewat demo manual saja. Checklist ini melengkapi Definition of Done generik di Bagian 102 dengan hal spesifik per modul inti, karena Bagian 102 terlalu generik untuk mencegah utang teknis di domain yang paling kritikal (uang dan stok).

Modul berikutnya (mis. Reconciliation) **tidak boleh mulai dibangun** di atas modul yang belum Complete (mis. Accounting) — dependency ini eksplisit di Bagian 103 versi revisi (Bagian 138).

---

# 134. DEFINITION OF COMPLETE — MODUL ORDERS

- [ ] Semua status lifecycle (Bagian 15) dapat dicapai dan **transisi ilegal ditolak** (mis. `Delivered → Confirmed` harus gagal dengan error jelas, bukan silent).
- [ ] Order dari 3 sumber berbeda (manual, marketplace webhook, marketplace polling fallback) menghasilkan struktur data akhir yang identik (diverifikasi via test terhadap Unified Order Schema, Bagian 117.2).
- [ ] Cancel/return/refund parsial **dan** penuh diuji, termasuk efeknya ke inventory (release reservation) dan accounting (reversing entry, Bagian 118.3) — bukan hanya perubahan status.
- [ ] Idempotency terbukti lewat test: mengirim webhook `order.paid` yang sama 2x tidak menghasilkan 2 journal entry atau 2 pengurangan stok.
- [ ] Order total **selalu** direkonstruksi dari item+fee (Bagian 115.4), tidak pernah bisa diedit manual tanpa jejak audit.
- [ ] Endpoint list order teruji dengan ≥ 50.000 baris data sintetis tetap memenuhi P95 < 500ms (index terpasang, Bagian 128.6).
- [ ] Semua state UI ada: loading, empty, error, partial-sync-in-progress (order yang baru masuk tapi belum lengkap fee-nya harus terlihat jelas sebagai "belum final", bukan angka salah yang terlihat final).

---

# 135. DEFINITION OF COMPLETE — MODUL INVENTORY

- [ ] `stock_movement` benar-benar immutable — dibuktikan lewat test yang mencoba UPDATE/DELETE langsung dan memverifikasi ditolak di level aplikasi (dan idealnya constraint DB).
- [ ] `available = on_hand - reserved - damaged - quarantine` konsisten di setiap kondisi race — diuji dengan concurrent order test (mis. 20 order simultan memperebutkan stok 15 unit → tepat 15 order sukses reserve, sisanya gagal dengan error jelas, tidak ada oversell).
- [ ] Transfer antar warehouse (Bagian 21) diuji end-to-end termasuk status `In Transit` yang berarti stok tidak tersedia di kedua warehouse sekaligus (tidak dobel, tidak hilang).
- [ ] Reservation otomatis ter-release jika order dibatalkan/expired dalam window waktu yang ditentukan (diuji dengan job scheduler).
- [ ] Sinkronisasi stok outbound ke marketplace (Bagian 117.3, event `inventory.updated`) diuji tidak menyebabkan infinite loop (stok berubah di marketplace → webhook masuk → mengubah stok internal → trigger sync balik).
- [ ] Multi-warehouse costing (weighted average per Bagian 118.5) diuji menghasilkan angka yang sama antara laporan inventory valuation dan saldo akun 1300 Persediaan di jurnal.

---

# 136. DEFINITION OF COMPLETE — MODUL ACCOUNTING

- [ ] **Setiap** posting rule di Bagian 118.2 punya unit test yang memverifikasi SUM(debit) = SUM(credit) dan akun tujuan benar — tanpa terkecuali, ini modul dengan toleransi kesalahan nol.
- [ ] Reversing entry untuk retur/pembatalan setelah periode `closed` diuji tidak pernah menyentuh journal_entry lama, hanya menambah entry baru dengan referensi (Bagian 118.3).
- [ ] Trial balance selalu balance untuk **setiap** periode yang di-generate dari data sintetis skala besar (bukan hanya dataset kecil demo).
- [ ] Multi-currency posting (Bagian 118.4) diuji dengan minimal 2 mata uang berbeda dan selisih kurs masuk akun 6950 dengan benar.
- [ ] Period close (Bagian 118.3) menolak journal entry baru ke periode `closed` — diuji secara eksplisit sebagai negative test case, bukan hanya diasumsikan.
- [ ] Laporan keuangan minimum (Bagian 30) di-generate dari data yang sama dengan yang dipakai dashboard (Bagian 9) — diuji tidak ada dua sumber angka berbeda untuk metrik yang sama (P4 One Source of Truth, dibuktikan bukan hanya diklaim).

---

# 137. DEFINITION OF COMPLETE — MODUL MARKETPLACE SYNC

- [ ] Minimal **satu** connector (mis. Shopee) lolos seluruh contract test (Bagian 120.4) terhadap mock server, termasuk skenario: response terlambat, payload tidak lengkap, rate limit, token expired di tengah proses.
- [ ] Webhook duplicate (dikirim 2x oleh marketplace, ini perilaku umum banyak marketplace) terbukti idempotent lewat `sync_event_log` (Bagian 117.4).
- [ ] Health check connector (Bagian 76) benar-benar mendeteksi kegagalan auth/rate-limit dan menampilkannya di UI sync state (Bagian 19) — bukan hanya field yang ada di database tapi tidak pernah ditampilkan.
- [ ] Circuit breaker per connector (Bagian 119.1) diuji: kegagalan total 1 connector tidak menyebabkan endpoint lain (order manual, dashboard) ikut lambat/gagal.
- [ ] Rekonsiliasi field mapping (Bagian 117.2) diuji dengan sample data asli/mendekati asli dari marketplace terkait, bukan hanya data buatan tim sendiri yang mungkin bias terhadap asumsi yang salah.

---

# 138. DEFINITION OF COMPLETE — MODUL AUTH & MULTI-TENANCY

- [ ] Test otomatis eksplisit (Bagian 120.2) yang mencoba mengakses data tenant lain lewat: API langsung, search, export, cache key, dan job queue payload — kelimanya, bukan hanya API.
- [ ] Token refresh rotation diuji: refresh token lama yang sudah dipakai tidak bisa dipakai lagi (deteksi token reuse = tanda pencurian, harus invalidasi seluruh sesi user tersebut).
- [ ] Rate limit auth endpoint (20 req/menit, Bagian 123) diuji benar-benar aktif, bukan hanya terkonfigurasi tapi tidak terpasang di middleware yang benar.
- [ ] RBAC granular (Bagian 45) diuji untuk **setiap** kombinasi role × permission kritikal (approve PO, post journal, export data keuangan) — matriks permission harus jadi test case eksplisit, bukan diverifikasi manual sesekali.
- [ ] Session listing & revoke (Bagian 123) berfungsi nyata: mencabut sesi dari device lain benar-benar menolak token itu di request berikutnya, bukan hanya menghapus baris UI.

---

# 139. DEFINITION OF COMPLETE — DASHBOARD / HOME (P2, P5, P6)

- [ ] Setiap angka di Business Snapshot (Bagian 9) bisa di-drill-down sampai ke journal entry sumber (Bagian 38) tanpa terputus di tengah jalan — diuji end-to-end, bukan hanya di level desain.
- [ ] Dashboard tetap merender dalam < 1 detik (cached, summary table Bagian 128.6) meskipun data sinkronisasi marketplace sedang berjalan di background.
- [ ] Kondisi data belum lengkap ditampilkan jujur (Bagian 81: "Profit belum akurat karena N SKU belum punya COGS") — bukan angka yang terlihat final padahal salah.

---

# 140. REVISI BAGIAN 103 — PHASE BUILD (DENGAN DEPENDENSI DoC EKSPLISIT)

```text
PHASE 0 — FOUNDATION + DEPLOYMENT SKELETON
  architecture, auth, tenant, RBAC, database, design system, API framework,
  logging, monitoring, DAN: adapter layer (Bagian 127), job queue di atas
  Postgres (128.3), health endpoint (131), CI build pipeline (130).
  ⛔ Gate: Bagian 138 (DoC Auth & Multi-Tenancy) harus lolos sebelum Phase 1 mulai.

PHASE 1 — CORE COMMERCE
  products, SKU, orders, customers, inventory, warehouse, dashboard, import.
  ⛔ Gate: Bagian 134 (DoC Orders) + Bagian 135 (DoC Inventory) + Bagian 139
  (DoC Dashboard) harus lolos sebelum Phase 2 mulai.

PHASE 2 — MARKETPLACE
  connector architecture, Shopee, Tokopedia, TikTok Shop, dst, webhook, sync engine.
  ⛔ Gate: Bagian 137 (DoC Marketplace Sync) harus lolos untuk minimal 1
  connector sebelum menambah connector berikutnya secara paralel.

PHASE 3 — FINANCE
  cash, COGS, profit engine, accounting, journal, ledger, P&L, balance sheet, cash flow.
  ⛔ Gate: Bagian 136 (DoC Accounting) — gate paling ketat di seluruh proyek,
  tidak ada toleransi bug di modul ini karena semua modul finansial berikutnya
  (Reconciliation, Tax, Reporting) bergantung penuh padanya.

PHASE 4 — RECONCILIATION  (baru boleh mulai setelah Phase 2 & 3 Complete)
PHASE 5 — PURCHASING
PHASE 6 — AUTOMATION
PHASE 7 — AI                (mengikuti Bagian 121 tool-permission schema)
PHASE 8 — WHATSAPP
PHASE 9 — ADVANCED

MIGRASI CLOUD (Bagian 129) dijalankan sebagai proyek paralel, dipicu oleh
threshold di Bagian 129.1 — bukan bagian dari urutan Phase 0–9 di atas,
karena bisa terjadi kapan saja setelah Phase 1 selesai tergantung traksi user.
```

---

# 141. REVISI BAGIAN 126 — READINESS SCORECARD (REV 4)

| # | Area | Skor Rev 3 | Skor Rev 4 | Perbaikan Kunci |
|---|---|---|---|---|
| 1–16 | (seluruh area Bagian 0/126 asli) | rata-rata 8.5/10 | tetap ≥ 8/10 | tidak berubah, tetap berlaku |
| 17 | **Deployability (realisme infrastruktur)** | tidak dinilai di Rev 3 | 9/10 | Bagian 127–132: arsitektur konkret untuk shared hosting + jalur migrasi cloud tanpa rewrite |
| 18 | **Completion Enforcement (anti "fitur doang")** | tidak dinilai di Rev 3 | 9/10 | Bagian 133–140: DoC per modul inti + gate eksplisit antar Phase |
| — | **Rata-rata keseluruhan Rev 4 (18 dimensi)** | — | **≈ 8.6/10** | ✅ Build-ready **dan** Deploy-ready **dan** Completion-enforced |

**Kesimpulan Rev 4:** Dokumen ini sekarang menjawab tiga pertanyaan yang harus dijawab sebelum baris kode pertama ditulis — *apa yang dibangun* (Rev 3), *di mana dan bagaimana ini benar-benar bisa jalan di shared hosting hari ini* (Bagian 127–132), dan *bagaimana tim tahu sebuah modul inti sungguh-sungguh selesai, bukan sekadar terlihat selesai* (Bagian 133–140).

---

# PART V — MARKETPLACE API VALIDATION & 5-YEAR RESILIENCE PLAN

Bagian 117 (Rev 3) menulis "Marketplace Field Mapping & Webhook Event Catalog" sebagai spesifikasi generik yang berlaku untuk semua marketplace secara seragam. Setelah divalidasi terhadap kondisi API real per Agustus 2026, ditemukan **satu perubahan struktural besar** dan beberapa perbedaan teknis material antar marketplace yang tidak bisa lagi diasumsikan seragam. Bagian ini menggantikan asumsi generik Bagian 117 dengan kondisi nyata per platform, plus rencana ketahanan 5 tahun ke depan.

---

# 142. TEMUAN KRITIS: TOKOPEDIA DAN TIKTOK SHOP SUDAH MENJADI SATU API

Rev 3 (Bagian 3, 17, 76, 103, 117, 124) menulis "Tokopedia" dan "TikTok Shop" sebagai **dua connector terpisah** dengan effort integrasi terpisah. Ini **sudah tidak akurat**.

**Fakta per Agustus 2026:**
- Tokopedia Open API (API lama Tokopedia) **resmi dihentikan (terminated)** — seluruh partner/ISV diwajibkan migrasi ke **TikTok Shop Partner Center** paling lambat 30 September 2025.
- Untuk pasar Indonesia, "Tokopedia" secara teknis sekarang berjalan di atas infrastruktur **TikTok Shop Partner Center** yang sama — didokumentasikan sebagai **"Tokopedia & Shop"** dalam satu portal developer (`partner.tokopedia.com` / `partner.tiktokshop.com`), dengan satu App Key, satu OAuth flow, satu set endpoint untuk kedua channel penjualan.
- Konsekuensi langsung: **connector "Tokopedia" dan connector "TikTok Shop" di AutoProfit adalah satu connector yang sama**, bukan dua. Effort development yang dialokasikan Rev 3 untuk dua integrasi terpisah bisa dikonsolidasikan — tapi field mapping harus membedakan **channel asal transaksi** (`tokopedia` vs `tiktokshop`) di dalam satu payload API yang sama, karena secara bisnis kedua channel tetap perlu dilaporkan terpisah di dashboard (Bagian 9, 30, 83).

**Revisi terhadap Rev 3:**
- Bagian 17 & 76: daftar target connector menjadi **"Shopee, Tokopedia+TikTok Shop (satu connector, via TikTok Shop Partner Center), Lazada, Blibli, Shopify, WooCommerce, custom API"** — bukan lagi 5 connector marketplace terpisah, melainkan 4.
- Bagian 124 (Billing): definisi "channel terhubung" per plan (Starter=1, Growth=5, dst) perlu klarifikasi eksplisit apakah Tokopedia dan TikTok Shop dihitung sebagai 1 channel atau 2 — secara teknis integrasinya satu, tapi secara bisnis/pelaporan user tetap melihatnya sebagai dua toko berbeda. **Keputusan produk:** dihitung sebagai **2 channel** dari sisi billing/pelaporan (karena user tetap mengelola 2 toko dengan 2 performa terpisah), meski di level connector engineering hanya **1 adapter** yang perlu dibangun dan dipelihara.
- Bagian 118.2 (COA): akun `4100 Penjualan — Marketplace` tetap perlu sub-dimensi per channel (`tokopedia`, `tiktokshop`) di `journal_line.dimension` (Bagian 115.2) agar P&L per channel (Bagian 30) tetap akurat walau backend satu API.

---

# 143. STATUS API PER MARKETPLACE (VALIDASI AGUSTUS 2026)

| Marketplace | Portal Developer | Auth Model | Signing | Sandbox | Catatan Khusus |
|---|---|---|---|---|---|
| **Shopee** | open.shopee.com (Shopee Open Platform v2) | Partner ID + Partner Key, OAuth per-shop → shop-level access token | HMAC-SHA256 atas partner_id + path + timestamp | Ya, host sandbox terpisah dari produksi | Endpoint regional per negara — App ID Indonesia **tidak otomatis berlaku** di negara lain, harus daftar App terpisah per region jika ekspansi cross-border |
| **Tokopedia + TikTok Shop** | partner.tiktokshop.com (TikTok Shop Partner Center, mencakup "Tokopedia & Shop") | App Key/App Secret, App type: Public (untuk didistribusikan ke banyak seller) atau Custom (untuk toko sendiri) | Signature scheme TikTok Shop (App Secret based) | Ya, dengan rate limit sandbox yang **berbeda** dari produksi — perlu dites eksplisit, jangan asumsi sandbox = kapasitas produksi | **Region tidak bisa diganti setelah registrasi** — pilih region "Indonesia" di awal harus benar, tidak bisa diubah belakangan. Dokumentasi API di-update rutin bulanan ("2026 July TikTok Shop API Updates Summary") — perlu proses monitoring changelog berkala (lihat Bagian 146) |
| **Lazada** | open.lazada.com (Lazada Open Platform) | App Key + App Secret, OAuth per-seller | HMAC-SHA256, skema signature "TOP" (Alibaba TaoBao Open Platform) | Ya | API lama "Seller Center API" **sudah didekomisioning** (preseden persis seperti kasus Tokopedia) — konfirmasi bahwa AutoProfit harus selalu mengintegrasi ke **Lazada Open Platform**, bukan dokumentasi API lama yang mungkin masih beredar di tutorial pihak ketiga |
| **Blibli** | seller-api.blibli.com | OAuth2 (client credentials + token/refresh token) | Bearer token standar | Terbatas (UAT environment `api-uata.gdn-app.com`) | API paling "kecil" dibanding 3 lainnya — cakupan: product, order, promo, webhook. Tidak semua fitur canggih (mis. fulfillment kompleks) tersedia — perlu validasi fitur-per-fitur sebelum janji ke user bahwa "Blibli fully-supported" |

**Implikasi desain:** Bagian 117.1 (interface connector seragam) tetap valid sebagai *pattern* arsitektur, tapi **setiap connector punya karakteristik auth, rate limit, dan cakupan fitur yang materially berbeda** — dokumen field-mapping per connector (disebutkan di Bagian 117.2) **wajib** dibuat sebagai dokumen hidup terpisah per marketplace, divalidasi langsung terhadap sandbox masing-masing sebelum Phase 2 dimulai, bukan diasumsikan dari dokumen ini.

---

# 144. PROSES ONBOARDING DEVELOPER — REALITAS WAKTU

Rev 3 tidak membahas ini sama sekali, padahal ini sering jadi **bottleneck nyata** yang tidak muncul di estimasi engineering biasa:

| Tahap | Estimasi Waktu Realistis | Risiko |
|---|---|---|
| Registrasi App & verifikasi identitas bisnis (semua marketplace) | 1–5 hari kerja | Ditolak jika dokumen legal entity tidak lengkap — siapkan NIB/legalitas bisnis sebelum Phase 2 dimulai, bukan saat Phase 2 sudah berjalan |
| App review untuk **Public App** (Shopee, TikTok Shop) — dibutuhkan jika AutoProfit didistribusikan ke banyak seller sebagai App Store listing | 2–6 minggu, tergantung kelengkapan use-case dan kepatuhan terhadap kebijakan data platform | Ini **bukan** proses yang bisa dipercepat dengan sumber daya tambahan — harus dijadwalkan sebagai *critical path* di Bagian 140 (Phase 2), bukan diasumsikan paralel dengan development |
| Custom App (untuk pilot dengan seller sendiri, tanpa listing publik) | Jauh lebih cepat (hari, bukan minggu) — approval "in-house developer" dipercepat jika email developer terverifikasi dengan email admin toko | **Strategi direkomendasikan:** mulai Phase 2 dengan **Custom App** di 1–2 marketplace untuk pilot/UAT (Bagian 120.5), baru ajukan Public App setelah produk stabil dan siap distribusi massal |
| Sandbox → Production credential swap | Instan secara teknis, tapi **rate limit produksi berbeda dari sandbox** — wajib load-test ulang di production credential sebelum GA, jangan asumsi hasil sandbox berlaku sama |

**Revisi Bagian 140 (Phase Build):** Phase 2 (Marketplace) **wajib** memulai proses registrasi App & legalitas bisnis di minggu pertama Phase 0/1 (paralel dengan foundation development), bukan menunggu Phase 2 dimulai — karena approval Public App bisa memakan waktu lebih lama dari waktu development connector itu sendiri.

---

# 145. PERUBAHAN ATURAN BISNIS YANG BERDAMPAK LANGSUNG KE DATA MODEL

Beberapa perubahan kebijakan platform per 2026 berdampak langsung ke domain data AutoProfit, bukan sekadar detail teknis API:

- **TikTok Shop GMV Max (mulai Juli 2026):** seller diwajibkan mengalokasikan **1,5–5% dari revenue** untuk kampanye iklan GMV Max. Ini berarti akun `6300 Beban Iklan` (Bagian 118.1) untuk channel TikTok Shop/Tokopedia **bukan lagi biaya opsional yang dicatat manual** — ke depan ini berpotensi jadi *fee otomatis* yang perlu ditarik lewat API dan diposting otomatis, mirip pola marketplace fee (Bagian 118.2). **Rekomendasi:** siapkan field `ads_fee` di Unified Order/Settlement Schema (Bagian 117.2, direvisi) sejak awal, meski belum diimplementasi penuh di Phase 2 — supaya tidak perlu migrasi schema besar saat kebijakan ini makin mengikat.
- **Regulasi social commerce Indonesia (Permendag):** transaksi jual-beli langsung di platform sosial (termasuk TikTok) diatur harus melalui entitas e-commerce berizin — inilah alasan struktural TikTok Shop Indonesia berjalan di atas Tokopedia. Implikasi untuk AutoProfit: **jangan asumsikan pola ini unik untuk Tokopedia/TikTok** — regulasi serupa berpotensi memaksa konsolidasi/perubahan struktur API di platform social-commerce lain (mis. Instagram Shop, jika suatu saat masuk pasar Indonesia secara resmi) dalam 5 tahun ke depan. Arsitektur connector (Bagian 127, adapter pattern) sudah tepat untuk mengantisipasi ini — prinsip yang sama berlaku.

---

# 146. PROSES MONITORING PERUBAHAN API (WAJIB, BUKAN OPSIONAL)

API marketplace **berubah rutin** — TikTok Shop Partner Center menerbitkan changelog bulanan (contoh nyata dari riset: "2026 July TikTok Shop API Updates Summary", penambahan field baru di "Post Shoppable Video and Photos APIs v202607", perubahan parameter di API pengiriman). Tanpa proses monitoring, connector akan diam-diam rusak saat marketplace mengubah field/parameter tanpa breaking version baru.

**Proses wajib (masuk ke Bagian 120 QA Strategy sebagai item tambahan):**

```text
1. Subscribe ke changelog resmi tiap marketplace (semua 4 target punya halaman
   "Announcement"/"API Updates" di portal developer masing-masing).
2. Job bulanan (bukan otomatis dari sistem — proses manusia + checklist):
   engineer terkait me-review changelog, menandai perubahan yang berdampak
   ke field mapping (Bagian 117.2) yang sedang dipakai AutoProfit.
3. Contract test (Bagian 120.4) dijalankan ulang terhadap sandbox setiap ada
   perubahan yang relevan — bukan menunggu keluhan user "data salah".
4. Setiap breaking change marketplace dicatat di CHANGELOG internal connector,
   dengan tanggal efektif dan strategi mitigasi (versi API lama masih didukung
   berapa lama, dsb).
```

Tanpa proses ini, "connector selesai" (Bagian 137, DoC Marketplace Sync) hanya benar di hari deploy — dan akan diam-diam menyimpang dari kenyataan dalam hitungan bulan.

---

# 147. RENCANA KETAHANAN 5 TAHUN (2026–2031)

Preseden Tokopedia→TikTok Shop (deprecation total API lama dalam <2 tahun) dan Lazada Seller Center→Open Platform (pola yang sama beberapa tahun sebelumnya) menunjukkan **pola berulang**: marketplace besar melakukan konsolidasi/migrasi API besar kira-kira setiap 3–5 tahun. AutoProfit harus didesain mengasumsikan ini akan terjadi lagi, bukan berharap API yang diintegrasikan hari ini akan stabil selamanya.

| Skenario 5 Tahun | Probabilitas Kualitatif | Mitigasi Arsitektur (sudah/harus disiapkan) |
|---|---|---|
| Marketplace lain melakukan deprecation API besar seperti Tokopedia (migrasi paksa ke API/portal baru) | **Tinggi** — sudah preseden 2x (Lazada, Tokopedia) | Interface connector seragam (Bagian 117.1) + contract test (146) membuat migrasi jadi "ganti implementasi adapter", bukan rewrite core — sudah sesuai prinsip Bagian 127 |
| Konsolidasi lebih lanjut antar marketplace (merger/akuisisi mengikuti pola GoTo-TikTok) | Sedang | Data model AutoProfit **tidak boleh** hard-code asumsi "1 marketplace = 1 entitas bisnis independen" — `channel` sudah didesain sebagai entity terpisah dari legal/business entity (Bagian 115.2), ini sudah tepat, pertahankan prinsip ini di setiap penambahan connector baru |
| Iklan/ads-spend menjadi mandatory dan terintegrasi API (pola GMV Max meluas ke platform lain) | Tinggi | Field `ads_fee` di order/settlement schema (145) + akun 6300 sudah diantisipasi; kedepan mungkin perlu modul `campaign`/`ads_account` sebagai domain baru — belum di-P0-kan, cukup dipastikan tidak ada blocker struktural untuk menambahkannya nanti |
| Munculnya channel baru berbasis AI-agent/affiliate commerce (marketplace mendorong dokumentasi API yang dioptimalkan untuk AI agent — sudah terlihat dari "TTS Open Toolkit" dan "Partner Assistant AI Copilot" TikTok Shop) | Sedang-Tinggi | Tidak berdampak ke arsitektur AutoProfit secara langsung (AutoProfit tetap konsumen API tradisional), tapi berarti **tim harus siap** bahwa vendor tooling pihak ketiga (Bagian 143 — API2Cart dan sejenisnya) akan makin banyak menawarkan "unified API" sebagai shortcut. Rekomendasi: evaluasi ulang *build vs buy* untuk connector di setiap Phase 2 baru — bangun sendiri untuk marketplace prioritas tinggi (Shopee, Tokopedia/TikTok Shop), pertimbangkan unified-API vendor untuk marketplace ekor panjang (long-tail) jika ROI membangun sendiri rendah |
| Rate limit & kebijakan sandbox mengetat seiring platform makin dewasa | Tinggi (sudah terlihat di changelog: "Seller Access & Sandbox Rate Limit Updates") | Idempotency + backoff + circuit breaker (Bagian 77, 119.1) sudah didesain untuk ini — pastikan angka rate limit di kode **tidak di-hardcode**, selalu baca dari config yang bisa diupdate tanpa deploy ulang |

---

# 148. REVISI DEFINITION OF COMPLETE — MARKETPLACE SYNC (MELENGKAPI BAGIAN 137)

Tambahan checklist khusus hasil validasi API real (melengkapi, bukan menggantikan, Bagian 137):

- [ ] Connector Tokopedia dan TikTok Shop dibangun sebagai **satu adapter** dengan parameter `channel_type` untuk membedakan pelaporan, bukan dua adapter terpisah (Bagian 142).
- [ ] Region/negara App terverifikasi benar **sebelum** submit registrasi (tidak bisa diubah setelahnya, Bagian 143) — checklist manual sebelum submit, bukan asumsi default.
- [ ] Rate limit sandbox vs produksi diuji **terpisah** — DoC tidak lolos hanya karena lolos di sandbox (Bagian 143, 147).
- [ ] Proses monitoring changelog bulanan (Bagian 146) sudah berjalan minimal 1 siklus penuh sebelum connector dianggap Complete untuk GA (general availability) — bukan hanya lolos contract test sekali di awal.
- [ ] Field `ads_fee`/dimensi channel di schema sudah tersedia (boleh kosong/tidak dipakai dulu) agar tidak perlu migrasi breaking saat kebijakan ads-mandatory (Bagian 145) mulai berlaku penuh untuk connector terkait.

---

# 149. REVISI SKOR KESIAPAN — DIMENSI MARKETPLACE (MELENGKAPI BAGIAN 141)

| # | Area | Skor Sebelum Validasi | Skor Setelah Validasi (Rev 4 + Part V) | Alasan |
|---|---|---|---|---|
| 5 (revisi) | Marketplace Integration Detail | 7/10 (skor evaluasi independen sebelumnya, bukan skor internal dokumen) | **8.5/10** | Struktur adapter sudah tepat sejak awal; gap terbesar (asumsi Tokopedia≠TikTok Shop sebagai 2 connector terpisah, tidak ada proses monitoring changelog, tidak ada estimasi waktu onboarding developer) sudah ditutup di Bagian 142–148. Sisa 1.5 poin: field mapping detail per marketplace tetap harus divalidasi langsung terhadap sandbox nyata saat Phase 2 dimulai — dokumen ini memberi peta yang akurat, bukan pengganti validasi langsung di kode |

---

---

# FINAL STATUS — REV 4

Urutan wajib dibaca tim engineering sebelum mulai Phase 0:

1. Bagian 4 (Product Principles) — tetap fondasi produk.
2. **Bagian 127–128** — arsitektur shared hosting, wajib dipahami sebelum baris kode infrastruktur pertama ditulis.
3. Bagian 69, 105–108, 115 — domain architecture & data model.
4. **Bagian 133** — prinsip penegakan "selesai", wajib dipahami oleh tech lead/PM sebelum sprint planning Phase 1.
5. Bagian 50–65 — UX design system.
6. **Bagian 122 + 128.6** — performance target dan cara mencapainya tanpa Redis/CDN dinamis.
7. Bagian 73–74, 123 — security requirements.
8. Bagian 36–37, 121 — AI safety & tool permission.
9. Bagian 17–19, 76, 117, **dan Part V (Bagian 142–149)** — marketplace connector architecture, dibaca bersamaan karena Part V mengoreksi asumsi Bagian 117 terhadap kondisi API real per Agustus 2026 (khususnya Bagian 142: Tokopedia dan TikTok Shop adalah satu connector, bukan dua).
10. Bagian 27–29, 118 — accounting integrity — **gate paling ketat, lihat Bagian 140**.
11. Bagian 120 — QA & testing strategy.
12. **Bagian 129** — rencana migrasi cloud, dibaca ulang setiap kali salah satu trigger Bagian 129.1 mendekati tercapai.
13. Bagian 78, 124 — billing & metering.
14. **Bagian 134–139** — Definition of Complete per modul, dipakai sebagai checklist literal di setiap PR/sprint review modul terkait.

Tidak ada modul inti (P0, Bagian 104) yang boleh ditandai selesai di project tracker tanpa checklist DoC yang relevan (Bagian 134–139) tercentang penuh dan diverifikasi lewat automated test — bukan lewat demo manual.

---

*AutoProfit PRD — Revisi 4. Menambahkan realita deployment (shared hosting Node.js + PostgreSQL → migrasi cloud) dan penegakan "selesai" untuk modul inti di atas fondasi Rev 3 yang sudah build-ready.*
