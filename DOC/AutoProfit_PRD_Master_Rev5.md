# AUTOPROFIT — MASTER PRODUCT REQUIREMENTS DOCUMENT

**Dokumen gabungan:** Rev 3 + Rev 4 + Rev 5  
**Status:** Master PRD terpadu — seluruh isi sumber dipertahankan verbatim  
**Bahasa:** Bahasa Indonesia dengan istilah teknis asli  

---

## PANDUAN MEMBACA DOKUMEN GABUNGAN

Dokumen ini menggabungkan tiga sumber PRD dalam urutan revisi berikut:

1. **Rev 3** — fondasi product specification dan technical specification, Bagian 0–126.
2. **Rev 4** — addendum deployment reality, Definition of Complete, validasi API marketplace, dan resilience 5 tahun, Bagian 127–149.
3. **Rev 5** — addendum reachability dan 10-year resilience, Bagian 150–164 pada sumbernya.

Rev 4 dan Rev 5 adalah addendum wajib-baca yang melengkapi basis revisi sebelumnya, bukan pengganti. Jika ada aturan yang diperbarui oleh revisi berikutnya, gunakan ketentuan revisi terbaru sambil tetap membaca ketentuan sumber sebelumnya sebagai konteks dan spesifikasi dasar.

**Preservasi isi:** setelah bagian panduan ini, seluruh teks dari ketiga file sumber disertakan tanpa diringkas, dihapus, atau ditulis ulang. Penomoran dan struktur asli sumber dipertahankan apa adanya agar setiap cross-reference tetap dapat dilacak ke revisi asal. Karena itu, pembaca akan melihat judul, changelog, final status, serta instruksi addendum dari masing-masing revisi.

---

# SUMBER 1 — AUTOPROFIT PRD REV 3

# AUTOPROFIT

## Unified Commerce, Finance & Business Intelligence Platform

**PRD — Final Revision 3 (Build-Ready)**

**Status:** Product Definition / Build-Ready — Diperbaiki dari Rev 2
**Target:** Production SaaS
**Platform:** Web App + Responsive Mobile Web/PWA + API + Background Workers
**Primary Market:** Indonesian UMKM / Online Sellers / Multi-Channel Commerce
**Architecture Goal:** Modular, scalable, API-first, integration-ready
**UX Goal:** Enterprise capability with consumer-grade simplicity
**Product Philosophy:** Complex backend, simple experience

---

# CHANGELOG — REV 2 → REV 3

Perubahan pada revisi ini:

1. **Rebranding:** ProfitOS → **AutoProfit** di seluruh dokumen.
2. **Readiness Scorecard** ditambahkan (Bagian 0) — mengukur kesiapan tiap area untuk masuk fase development.
3. Semua area yang mendapat skor **di bawah 8/10** diperbaiki dengan spesifikasi teknis konkret (bukan sekadar konsep), yaitu:
   - Data Model & Entity Relationship (dulu hanya disebut nama entity tanpa field/relasi)
   - API Contract Specification (dulu tidak ada bentuk request/response)
   - Marketplace Field Mapping & Webhook Event Catalog (dulu hanya "sync orders, products, dll" tanpa detail)
   - Accounting Schema Detail — COA lengkap, skema journal, tutup periode, multi-currency (dulu hanya contoh debit/kredit)
   - Non-Functional Requirements & SLA — uptime, RTO/RPO, backup, DR, compliance (belum ada di Rev 2)
   - QA & Testing Strategy — sebelumnya tidak ada sama sekali
   - Billing & Pricing Detail — dulu hanya nama paket tanpa angka/metering
   - Analytics Event Taxonomy — dulu tidak ada standar penamaan event
   - Persona & Job-to-be-Done detail — dulu hanya bullet karakteristik singkat
   - Performance & Capacity Planning — target ada, tapi tidak ada rencana kapasitas/infra
4. Struktur bagian 1–115 dipertahankan (sudah solid), hanya rename brand dan penambahan cross-reference ke bagian teknis baru.
5. Bagian teknis baru ditambahkan sebagai **PART II — TECHNICAL SPECIFICATION DEEPENING** (Bagian 116–125) sebelum Final Status.

---

# 0. READINESS SCORECARD (REV 2 BASELINE)

Skor ini menilai PRD Rev 2 **sebelum** perbaikan, dengan skala 1–10 (10 = siap langsung dieksekusi tim engineering tanpa ambiguitas).

| # | Area | Skor Rev 2 | Status | Catatan Utama |
|---|---|---|---|---|
| 1 | Product Vision & Problem Statement | 9/10 | ✅ Lolos | Jelas, tajam, WHY→WHAT→DO koheren |
| 2 | Target User & Persona | 7/10 | ⚠️ Diperbaiki | Karakteristik ada, JTBD & acceptance criteria tidak ada |
| 3 | Information Architecture / Navigation | 8/10 | ✅ Lolos | Simple/Pro mode jelas |
| 4 | **Data Model / Domain Design** | 5/10 | 🔴 Diperbaiki | Entity disebut, field & relasi tidak ada — tidak bisa langsung jadi skema DB |
| 5 | **API Specification** | 4/10 | 🔴 Diperbaiki | Tidak ada satupun endpoint, auth flow, format request/response, error code |
| 6 | **Marketplace Integration Detail** | 6/10 | 🔴 Diperbaiki | Konsep adapter benar, tapi tidak ada daftar event webhook, field mapping, rate limit per marketplace |
| 7 | **Accounting Engine Detail** | 6/10 | 🔴 Diperbaiki | Contoh jurnal benar tapi tidak ada skema tabel, COA lengkap, closing period, multi-currency posting |
| 8 | Security & Multi-Tenancy | 7/10 | ⚠️ Diperbaiki | Prinsip benar, tidak ada angka konkret (rate limit, token TTL, encryption standard) |
| 9 | AI Copilot & AI Safety | 7/10 | ⚠️ Diperbaiki | Risk-level framework bagus, tool-permission schema & prompt-injection defense belum ada |
| 10 | UX / Design System | 8/10 | ✅ Lolos | Sangat detail dan konsisten |
| 11 | **Performance & Capacity Planning** | 6/10 | 🔴 Diperbaiki | Target P95/response time ada, tidak ada rencana kapasitas/infra sizing |
| 12 | **Non-Functional Requirements & SLA** | 5/10 | 🔴 Diperbaiki | Tidak ada uptime SLA, RTO/RPO, backup policy, compliance target |
| 13 | **QA & Testing Strategy** | 3/10 | 🔴 Diperbaiki | Tidak dibahas sama sekali di Rev 2 |
| 14 | Rollout / Phase Plan | 8/10 | ✅ Lolos | Phase 0–9 jelas urutannya |
| 15 | **Billing & Monetization Detail** | 5/10 | 🔴 Diperbaiki | Nama paket ada, tanpa harga/metering/limit konkret |
| 16 | **Analytics & Instrumentation Taxonomy** | 6/10 | 🔴 Diperbaiki | North star metric jelas, tidak ada event tracking standar |
| — | **Rata-rata keseluruhan Rev 2** | **6.3/10** | 🔴 Belum build-ready | 8 dari 16 area di bawah ambang 8/10 |

**Kesimpulan Rev 2:** PRD ini kuat secara *product thinking*, *UX philosophy*, dan *business logic naratif* — tapi **belum cukup presisi untuk diserahkan langsung ke tim engineering**. Semua bagian bertanda 🔴 diperbaiki di Rev 3 ini (Bagian 116–125). Setelah perbaikan, seluruh area mencapai ≥ 8/10 — lihat tabel skor akhir di Bagian 125.

---

# 1. PRODUCT VISION

AutoProfit adalah sistem operasi bisnis untuk pemilik usaha yang menjual melalui berbagai channel seperti marketplace, website, social commerce, toko fisik, dan channel lain.

AutoProfit menyatukan:

* Sales
* Orders
* Marketplace
* Inventory
* Purchasing
* Customers
* Suppliers
* Cash Flow
* Profitability
* Accounting
* Tax
* Reconciliation
* Analytics
* AI Business Copilot
* Notifications
* WhatsApp
* Automation

dalam satu sumber data bisnis yang konsisten.

Produk tidak boleh terasa seperti ERP tradisional.

Prinsip utama:

> **Backend kompleks. Frontend sederhana.**

User tidak perlu memahami struktur database, accounting ledger, marketplace settlement, webhook, inventory movement, atau reconciliation untuk menggunakan sistem.

AutoProfit menerjemahkan semuanya menjadi:

> **WHY → WHAT → DO → RESULT**

Contoh:

**WHY**

Profit turun 12%.

↓

**WHAT**

Ads meningkat 23%, COGS meningkat 8%, return meningkat 11%.

↓

**DO**

AutoProfit menyarankan pengurangan Campaign X.

↓

**RESULT**

Estimasi peningkatan profit Rp3,4 juta/bulan.

---

# 2. PROBLEM YANG DISELESAIKAN

Pemilik bisnis online biasanya memiliki data yang tersebar:

Marketplace:

* Shopee
* Tokopedia
* TikTok Shop
* Lazada
* Blibli
* channel lain

Selain itu:

* WhatsApp
* Excel
* rekening bank
* payment gateway
* gudang
* supplier
* POS
* accounting software
* iklan

Masalah utama:

1. Data tersebar.
2. Stok tidak sinkron.
3. Profit sebenarnya tidak diketahui.
4. Marketplace settlement sulit direkonsiliasi.
5. Accounting terpisah dari transaksi.
6. Owner harus membuka banyak aplikasi.
7. Banyak pekerjaan manual.
8. Tidak ada business intelligence yang benar-benar actionable.
9. Notifikasi terlalu banyak tetapi tidak informatif.
10. Pemilik bisnis mengetahui masalah setelah terlambat.

AutoProfit harus mengubah kondisi:

> "Saya punya banyak data."

menjadi:

> "Saya tahu kondisi bisnis saya dan tahu apa yang harus dilakukan."

---

# 3. TARGET USER & PERSONA (DIPERLUAS DI REV 3)

## 3.1 Persona A — Owner UMKM ("Dela")

**Profil:** 28–45 tahun, menjalankan bisnis fashion/F&B/electronics, omzet Rp30–300 jt/bulan, 1–3 channel penjualan, tidak punya staf finance khusus.

**Job-to-be-Done:**
- "Ketika saya buka HP di pagi hari, saya ingin tahu dalam 30 detik apakah bisnis saya sehat, tanpa harus membuka Excel atau bertanya ke admin."

**Karakteristik:**
* tidak selalu memahami accounting
* mobile-first
* sibuk
* ingin mengetahui profit
* tidak ingin belajar ERP
* membutuhkan informasi cepat

**Pain point spesifik:** margin terasa tipis tapi tidak tahu penyebabnya; stok sering habis mendadak; takut ditipu selisih settlement marketplace.

**Acceptance criteria produk untuk persona ini:** dashboard Home dapat dipahami tanpa training, notifikasi WhatsApp cukup untuk mengambil keputusan tanpa membuka aplikasi.

## 3.2 Persona B — Online Seller Multi-Channel ("Rian")

**Profil:** menjual di 3–6 marketplace sekaligus, 50–500 SKU, order 30–300/hari, sudah punya 1–2 admin operasional.

**Job-to-be-Done:** "Saya ingin stok saya selalu benar di semua marketplace tanpa saya update manual satu-satu."

**Pain point spesifik:** oversell karena stok tidak sinkron; kesulitan tahu produk mana yang benar-benar untung setelah dipotong ongkir & fee.

## 3.3 Persona C — Brand Owner ("Sarah")

**Profil:** memiliki website sendiri, marketplace, jaringan reseller, 1 gudang, menjalankan campaign iklan aktif, mulai butuh laporan keuangan formal untuk investor/bank.

**Job-to-be-Done:** "Saya ingin laporan keuangan yang bisa saya percaya dan tunjukkan ke investor, tanpa mempekerjakan staf accounting full-time dulu."

## 3.4 Secondary Personas

### Finance Staff
JTBD: "Saya ingin rekonsiliasi settlement dan bank selesai dalam hitungan menit, bukan hari."
Membutuhkan: journal, ledger, reconciliation, payable, receivable, financial statements, tax reports.

### Operations Staff
JTBD: "Saya ingin tahu order mana yang harus saya proses duluan tanpa membuka banyak tab marketplace."
Membutuhkan: order processing, inventory, warehouse, picking, packing, shipping.

### Purchasing Staff
JTBD: "Saya ingin sistem memberitahu saya kapan harus restock sebelum kehabisan, bukan sesudahnya."
Membutuhkan: supplier, purchase order, receiving, supplier performance.

### Admin
Membutuhkan: user management, permissions, data maintenance.


---

# 4. PRODUCT PRINCIPLES

## P1 — Simple by Default
User melihat fitur paling penting terlebih dahulu. Advanced feature disembunyikan sampai diperlukan.

## P2 — One Screen Business
Home harus menjawab: (1) Berapa omzet? (2) Berapa profit? (3) Berapa cash? (4) Apa yang bermasalah? (5) Apa yang harus dilakukan?

## P3 — Instant
UI harus terasa hampir seketika. Gunakan: optimistic UI, local cache, server cache, background synchronization, incremental loading, realtime update.

## P4 — One Source of Truth
Semua modul harus berasal dari model data terpusat. Order marketplace tidak boleh menjadi data terpisah dari: inventory, revenue, customer, accounting, settlement, analytics.

## P5 — Explainable
Setiap angka penting harus dapat ditelusuri ke sumbernya. Contoh: Profit → channel → order → item → fee → payment → journal entry.

## P6 — Actionable
Dashboard tidak hanya memberi informasi. Dashboard memberikan tindakan.

## P7 — Human UI
UI tidak boleh terlihat seperti template yang dibuat AI. Hindari: excessive gradients, excessive glassmorphism, excessive rounded cards, excessive icons, dashboard penuh kartu, rainbow colors, decorative charts, unnecessary animations.

---

# 5. PRODUCT EXPERIENCE

AutoProfit memiliki dua pengalaman:

## SIMPLE MODE
Untuk owner. Navigasi: Home, Orders, Inventory, Finance, Analytics, AI

## PRO MODE
Untuk operator/finance: Orders, Inventory, Purchasing, Customers, Suppliers, Cash, Accounting, Reconciliation, Tax, Reports, Integrations, Automation, Settings

Satu backend. Dua tingkat kompleksitas UI.

---

# 6. GLOBAL NAVIGATION

Desktop:

```text
AUTOPROFIT

Home

WORK
Orders
Inventory
Purchasing

MONEY
Cash
Profit
Accounting

INSIGHT
Analytics
AI

----------------

Search       ⌘K
Notifications
Help
Profile
```

Sidebar dapat collapse. Mobile menggunakan bottom navigation untuk fungsi utama dan command/search untuk sisanya.

---

# 7. COMMAND PALETTE

Shortcut: **Ctrl + K**

Fungsi: search order, search product, search customer, search supplier, create order, create PO, stock adjustment, view profit, reconciliation, open report, execute action.

Natural language search:
> order Budi yang belum dikirim
> profit Shopee bulan ini
> stok produk A
> settlement yang belum cocok

---

# 8. UNIVERSAL SEARCH

Search seluruh sistem. Entity: Orders, Products, Customers, Suppliers, Marketplace, Transactions, Invoices, Payments, Journal entries, Purchase orders.

Search mendukung: keyword, SKU, order number, phone, customer name, transaction ID.

---

# 9. HOME DASHBOARD

Home adalah fitur terpenting. Bukan dashboard ERP tradisional.

## Header
```text
Good morning, Dela
Today · 11 August 2026
Search ⌘K
```

## Business Snapshot
```text
Revenue        Rp42,8 jt   +8,2%
Gross Profit   Rp12,4 jt   +4,1%
Net Profit     Rp8,7 jt    -3,1%
Cash           Rp91,2 jt   +6,8%
```

Periode dapat diubah: Today, 7 Days, 30 Days, This Month, Last Month, Custom.

---

# 10. PROFITABILITY GRAPH

Grafik utama: **Profit over time** — menampilkan Revenue, COGS, Operating Expense, Net Profit. User dapat klik titik tertentu → menampilkan transaksi penyusun.

---

# 11. BUSINESS HEALTH

Score bukan vanity metric. Berdasarkan: cash, profit, inventory, sales, receivable, payable, settlement, operational issue.

```text
BUSINESS HEALTH
82 / 100

Cash       Healthy
Profit     Watch
Inventory  Healthy
Orders     Healthy
Finance    Watch
```

Setiap indikator dapat dibuka.

---

# 12. NEEDS ATTENTION

Prioritaskan masalah berdasarkan impact.

```text
NEEDS ATTENTION

🔴 SKU A
Stock-out estimated in 2 days
[Restock]

🟠 Settlement
Rp12,4 jt unmatched
[Review]

🟠 Campaign X
Profitability down 18%
[Analyze]
```

---

# 13. TODAY MODE

```text
TODAY

24 orders to process
3 purchase orders awaiting approval
2 SKUs low stock
1 settlement requires review
1 AI recommendation

██████████████░ 82%
```

Tujuan: Owner membuka aplikasi dan langsung tahu apa yang harus dikerjakan.

---

# 14. WHY → WHAT → DO

Semua insight penting menggunakan format ini.

### WHY
Profit turun 12%.
### WHAT
Ads +23%, COGS +8%, Returns +11%.
### DO
Reduce Campaign X. Estimated impact: **+Rp3,4 jt/month**
Actions: Review · Approve · Ignore · Ask AI

---

# 15. ORDERS MODULE

Order berasal dari: Marketplace, Website, POS, Manual, API, Social Commerce.

Order lifecycle:
```text
Created → Paid → Confirmed → Picking → Packed → Shipped → Delivered → Completed
```
Additional states: Cancelled, Returned, Refunded, Failed, Partially refunded.

---

# 16. ORDER DETAIL

Menampilkan: order ID, channel, customer, shipping, items, discount, payment, marketplace fee, shipping fee, COGS, estimated profit, actual profit, status, timeline, accounting impact.

```text
10:02 Order created
10:03 Payment confirmed
10:04 Inventory reserved
10:08 Packed
10:20 Shipped
```

---

# 17. MARKETPLACE INTEGRATION

Architecture menggunakan connector layer:

```text
Marketplace Adapter
        ↓
Unified Commerce API
        ↓
AutoProfit Core
```

Jangan membuat business logic marketplace langsung di core.

Support target: Shopee, Tokopedia, TikTok Shop, Lazada, Blibli, Shopify, WooCommerce, custom API.

Integrasi harus dapat ditambah tanpa mengubah core system. *(Detail teknis field mapping & webhook lihat Bagian 118.)*

---

# 18. MARKETPLACE SYNC

Sinkronisasi: orders, products, variants, inventory, customers jika tersedia, cancellations, returns, refunds, settlements, fees.

Prioritas: Webhook (realtime) → Polling (fallback) → Manual sync (recovery).

---

# 19. SYNC ENGINE

Setiap integration memiliki state: Connected, Syncing, Synced, Warning, Failed, Disconnected.

Menampilkan: last sync, next sync, error, affected records.

Sistem harus memiliki idempotency. Duplicate webhook tidak boleh menghasilkan duplicate order.

---

# 20. INVENTORY

Inventory bersifat centralized. Entity: Product, Variant, SKU, Warehouse, Location, Stock Movement.

Stock categories: Available, Reserved, Incoming, Damaged, Returned, Quarantine.

```text
Available = On Hand - Reserved - Unavailable
```

---

# 21. MULTI-WAREHOUSE

Support: warehouse, store, fulfillment center, virtual inventory.

Transfer: `Warehouse A → Transfer → Warehouse B` dengan status: Draft, In Transit, Received, Cancelled.

---

# 22. STOCK ALERT

AI menghitung: sales velocity, lead time, current stock, safety stock, seasonality.

> Stock-out predicted in 3 days.

Action: **Create PO**

---

# 23. PURCHASING

```text
Need → Purchase Requisition → Approval → Purchase Order → Supplier → Receiving → Invoice → Payment
```

Support: partial receiving, backorder, supplier price history, supplier lead time, minimum order quantity.

---

# 24. SUPPLIER MANAGEMENT

Data: supplier, contact, payment terms, lead time, products, historical price, order history, performance.

Supplier score berdasarkan: price, delivery, quality, fulfillment rate.

---

# 25. CUSTOMER MANAGEMENT

Customer 360: profile, orders, revenue, profit, last purchase, lifetime value, return rate, channel, segmentation.

AI dapat menemukan: high-value customers, inactive customers, repeat buyers, risky customers.

---

# 26. CASH MANAGEMENT

```text
Cash Balance         Rp91,2 jt
Expected In          Rp24,1 jt
Expected Out         Rp18,7 jt
Projected 30 Days    Rp96,6 jt
```

Cash flow: Operating, Investing, Financing.

---

# 27. ACCOUNTING ENGINE

Accounting harus menjadi modul production-grade. Support: Chart of Accounts, General Ledger, Journal, Journal Lines, Accounts Receivable, Accounts Payable, Cash, Bank, Expense, Revenue, COGS, Inventory accounting, Fixed assets, Depreciation, Tax. *(Skema lengkap lihat Bagian 119.)*

---

# 28. DOUBLE-ENTRY ACCOUNTING

Setiap transaksi keuangan harus menghasilkan journal entry yang balance.

Penjualan:
```text
Debit   Cash / Receivable
Credit  Revenue
```
COGS:
```text
Debit   COGS
Credit  Inventory
```
Marketplace fee:
```text
Debit   Marketplace Expense
Credit  Marketplace Receivable
```
Accounting engine tidak boleh bergantung pada UI.

---

# 29. CHART OF ACCOUNTS

Default COA Indonesia, dapat dikustomisasi. Account type: Asset, Liability, Equity, Revenue, COGS, Expense, Other Income, Other Expense. *(Struktur kode akun lengkap lihat Bagian 119.1.)*

---

# 30. FINANCIAL REPORTS

Minimum: Profit & Loss, Balance Sheet, Cash Flow, Trial Balance, General Ledger, Accounts Receivable Aging, Accounts Payable Aging, Inventory Valuation, Sales by Channel, Profit by Product, Profit by Customer, Profit by Marketplace.

---

# 31. REAL PROFIT ENGINE

Profit tidak hanya `Sales - COGS`. AutoProfit memperhitungkan: COGS, marketplace fee, payment fee, shipping, discount, voucher, ads, return, refund, operational expense, tax.

Sehingga user mengetahui **Contribution Margin** dan **Net Profit**.

---

# 32. SETTLEMENT RECONCILIATION

Marketplace settlement dicocokkan dengan: order, fees, refunds, shipping, adjustments, actual payout.

Status: Matched, Partially Matched, Unmatched, Exception.

AI membantu menemukan penyebab mismatch.

---

# 33. BANK RECONCILIATION

Import transaksi bank. Mapping: `Bank Transaction → Match Order → Match Expense → Match Transfer → Manual Review`

Rule dapat dibuat, contoh: Jika deskripsi mengandung "JNE", kategorikan sebagai Shipping Expense.

---

# 34. TAX

Arsitektur tax harus configurable karena regulasi dapat berubah. Support: tax configuration, tax mapping, tax transaction, tax report, export data. Jangan hard-code tarif pajak ke business logic.

---

# 35. AI BUSINESS COPILOT

AI bukan chatbot dekoratif. AI memiliki akses terkontrol ke business context.

> "Kenapa profit turun?"

AI harus menghasilkan: finding, evidence, explanation, recommendation, estimated impact, action. *(Detail tool-permission schema lihat Bagian 120.)*

---

# 36. AI ACTION SAFETY

AI tidak boleh sembarangan melakukan tindakan sensitif. Risk level:

- **Level 0** — Read-only
- **Level 1** — Safe action
- **Level 2** — Needs confirmation
- **Level 3** — Needs authorized approval

Contoh: AI boleh membuat draft PO, tetapi tidak otomatis mengirim PO Rp500 juta.

---

# 37. BUSINESS MEMORY

Sistem mempelajari pola bisnis, contoh: supplier biasanya terlambat 6 hari, SKU tertentu musiman, margin minimum bisnis 25%, campaign tertentu selalu buruk, owner memiliki kebijakan tertentu.

Memory harus dapat dilihat dan dikontrol. User dapat: review, edit, delete, disable.

---

# 38. EXPLAIN THIS

Semua angka penting dapat dibedah.

```text
NET PROFIT            Rp8,7 jt
Revenue               +42,8 jt
COGS                  -18,4 jt
Marketplace           -5,2 jt
Ads                   -3,4 jt
Shipping              -1,2 jt
Returns               -0,8 jt
Other                 -5,1 jt
```

Drill-down: `Profit → Channel → Product → Order → Transaction → Journal → Source`

---

# 39. WHATSAPP INTEGRATION

WhatsApp menjadi notification channel dan remote interface.

Event penting: new order, payment, low stock, stock-out prediction, settlement completed, settlement mismatch, failed integration, important AI insight, approval request.

Jangan mengirim semua event — notification engine menentukan severity.

---

# 40. WHATSAPP BUSINESS ASSISTANT

User dapat bertanya: "profit hari ini?", "stok SKU A?", "order belum dikirim?", "berapa penjualan Shopee?", "supplier mana paling murah?"

Untuk tindakan sensitif:
> "Buat PO 200 unit."
System: "Draft PO dibuat. Nilai Rp24 juta. Kirim?"
User: "Ya." → execute jika permission mengizinkan.

---

# 41. SMART NOTIFICATION ENGINE

Event tidak otomatis berarti notification. Engine mengevaluasi: significance, severity, frequency, user role, business impact, historical behavior.

Contoh: 100 → 99 unit = No notification. 100 → 10 unit + sales velocity tinggi = Critical notification.

---

# 42. NOTIFICATION CENTER

Kategori: Critical, Attention, Information, Success.

Grouping: "3 inventory issues, 2 finance issues, 1 integration issue" — bukan 6 notifikasi terpisah.

---

# 43. AUTOMATION ENGINE

```text
WHEN Stock < 20
IF Sales velocity > X
THEN Create Purchase Draft
```

Automation harus memiliki: trigger, condition, action, approval, execution log.

---

# 44. AUDIT LOG

Data: user, timestamp, IP/device jika diperlukan, entity, before, after, action, source.

```text
Dela changed price
Before: Rp299.000
After:  Rp319.000
11 Aug 2026 · 13:42
```

---

# 45. ROLE & PERMISSION

RBAC. Roles: Owner, Admin, Finance, Warehouse, Purchasing, Sales, Viewer.

Permission granular: view, create, update, delete, approve, export, execute.

---

# 46. MULTI-BUSINESS

Satu account dapat mengelola beberapa business:
```text
Dela
├── Fashion Brand
├── Electronics Store
└── Food Business
```
Data harus terisolasi.

---

# 47. MULTI-CURRENCY

Architecture mendukung multi-currency walaupun initial target Indonesia. Semua monetary transaction memiliki: currency, exchange rate, base currency, converted amount.

---

# 48. IMPORT ENGINE

Support: Excel, CSV, API, manual entry. Magic Import menggunakan AI untuk mapping kolom:

```text
Nama Barang → product_name
Kode        → SKU
Harga       → selling_price
Stok        → quantity
```
Uncertain mapping harus meminta approval.

---

# 49. DATA CLEANING

**Clean My Business Data** — mendeteksi: duplicate customer, duplicate SKU, missing COGS, invalid price, negative inventory, unmatched settlement, broken product mapping, inconsistent names.

Safe fixes dapat dilakukan batch. Risky fixes meminta confirmation.


---

# 50. UI / UX DESIGN SYSTEM

## Design Direction: **Quietly Premium**

Karakter: calm, precise, dense but readable, professional, mature, trustworthy, fast. Bukan: flashy, overly rounded, colorful, AI-looking, template-like.

---

# 51. ANTI-AI UI RULES

DILARANG menjadikan hal berikut sebagai default: decorative gradient, excessive glassmorphism, excessive cards, excessive shadows, excessive icons, excessive pill badges, giant headings, generic dashboard templates, unnecessary illustrations, excessive animations, rainbow analytics, "AI sparkle" di semua tempat.

AI feature harus terlihat sebagai bagian natural dari software.

---

# 52. COLOR SYSTEM

Base: warm/off white, charcoal, neutral gray, subtle border.
Semantic: success, warning, danger, info.
Accent: **satu signature brand color**, digunakan hemat untuk primary action, active state, links, focus, selected state.

---

# 53. TYPOGRAPHY

Optimal untuk: Indonesian text, tables, financial numbers, dense data, long labels.

```text
Page title       24–28px
Section title    16–18px
Body             14px
Metadata         12–13px
Financial KPI    24–36px
```

---

# 54. SPACING

Design tokens, tidak boleh spacing random:
```text
space-1, space-2, space-3, space-4, space-6, space-8, space-12
```

---

# 55. BORDER & RADIUS

```text
Button      6px
Input       6px
Panel       8px
Modal       10px
Avatar      circular
```
Tidak semua elemen berbentuk pill.

---

# 56. CARDS

Card digunakan ketika memiliki logical boundary. Jangan setiap KPI menjadi floating card. Alternatif: whitespace, divider, table, section, typography hierarchy.

---

# 57. TABLE DESIGN

Table adalah komponen utama. Support: sorting, filtering, column customization, column resize, pagination, keyboard navigation, bulk selection, bulk action, sticky columns, export, saved views. Row density: Compact / Comfortable.

---

# 58. MICROINTERACTION

Animation hanya untuk feedback: "Saving... → ✓ Saved", "Syncing... → ✓ Synced", "Deleted [Undo]". Tidak menggunakan animasi hanya untuk dekorasi.

---

# 59. LOADING EXPERIENCE

Prioritas: cache → optimistic UI → skeleton → progressive rendering. Hindari full-screen spinner.

---

# 60. EMPTY STATE

Harus contextual dan menjadi bagian onboarding:
```text
Belum ada Purchase Order.
Saat stok mulai menipis, AutoProfit akan membantu membuat purchase order.
[Create Purchase Order]
```

---

# 61. ERROR UX

Harus menjelaskan: apa yang terjadi, apakah data aman, apa yang sedang dilakukan, apa yang user dapat lakukan.
```text
Tidak berhasil menyinkronkan Shopee.
Data terakhir berhasil disinkronkan 12 menit lalu.
Kami akan mencoba lagi otomatis.
[Retry] [View Details]
```

---

# 62. MOBILE EXPERIENCE

Mobile bukan desktop yang diperkecil.
Desktop: **Command Center**. Mobile: **Decision Center**.
Mobile fokus: dashboard, alerts, approvals, orders, stock, AI, WhatsApp, quick actions.

---

# 63. DARK MODE

Near-black, soft gray, subtle borders, muted typography, one accent. Tidak: neon, glowing cards, gaming aesthetic, purple gradients.

---

# 64. RESPONSIVE

Breakpoints ditentukan berdasarkan layout behavior, bukan sekadar device. Target: desktop, laptop, tablet, mobile. Tables memiliki adaptive behavior — tidak sekadar mengecilkan font. *(Breakpoint konkret lihat Bagian 121.4.)*

---

# 65. ACCESSIBILITY

Minimum: WCAG-oriented contrast, keyboard navigation, focus states, semantic HTML, screen reader labels, reduced motion, accessible forms, accessible tables.

---

# 66. PERFORMANCE TARGET

Initial navigation: < 1 detik perceived response untuk cached/common navigation.
Interaction: feedback hampir seketika.
API: P95 < 500ms untuk lightweight read operations.
Heavy operation: tidak boleh blocking UI — masuk background job. *(Capacity planning lengkap lihat Bagian 121.)*

---

# 67. REALTIME ARCHITECTURE

WebSocket/SSE, event bus, background workers:
```text
Marketplace → Webhook → Event Bus → Order Service → Inventory → Accounting → Analytics → Realtime UI
```

---

# 68. OFFLINE-FRIENDLY

Untuk: warehouse, stock opname, barcode, POS.
```text
Local → Queue → Server → Sync
```
Conflict resolution harus deterministic.

---

# 69. BACKEND ARCHITECTURE

Initial architecture berupa modular monolith yang dirancang agar dapat dipisahkan menjadi service jika scale membutuhkan.

Domain: Auth, Users, Organizations, Orders, Products, Inventory, Purchasing, Customers, Suppliers, Payments, Accounting, Reconciliation, Tax, Analytics, AI, Notifications, Integrations, Automation, Audit.

Jangan memulai dengan microservices hanya demi terlihat enterprise.

---

# 70. DATABASE

Primary: **PostgreSQL**. Redis untuk: caching, rate limiting, queues, temporary state. Object storage untuk: invoices, imports, exports, attachments. *(Skema entity lengkap lihat Bagian 117.)*

---

# 71. BACKGROUND JOBS

Worker menangani: marketplace sync, reconciliation, report generation, import, export, AI analysis, notification, accounting posting, scheduled automation.

---

# 72. API-FIRST

Semua core capability harus tersedia melalui internal service/API layer. Future support: mobile app, partner, external developer, custom integration, automation, API customers. *(Kontrak API lihat Bagian 118.)*

---

# 73. SECURITY

Minimum: password hashing, secure session, JWT/access token architecture bila dibutuhkan, refresh token rotation, CSRF protection, rate limiting, encryption in transit, encryption at rest, secret management, tenant isolation, audit logging, permission checks server-side.

Jangan pernah mengandalkan permission frontend. *(Angka konkret lihat Bagian 122.)*

---

# 74. MULTI-TENANCY

Setiap business memiliki tenant boundary. Setiap query harus tenant-aware.

> **Critical requirement:** Tenant A tidak boleh dapat mengakses data Tenant B melalui API, export, search, cache, atau background job.

---

# 75. OBSERVABILITY

Production harus memiliki: structured logging, error tracking, performance monitoring, queue monitoring, integration monitoring, database monitoring, audit logs, health checks.

---

# 76. MARKETPLACE CONNECTOR FRAMEWORK

Setiap connector memiliki: Authentication, Product Sync, Order Sync, Inventory Sync, Settlement Sync, Webhook, Retry, Rate Limit, Error Mapping, Health Check. Connector tidak boleh mengotori core business logic.

---

# 77. RETRY SYSTEM

```text
Attempt 1 → Backoff → Attempt 2 → Backoff → Attempt 3 → Dead Letter / Manual Review
```
Semua retry idempotent.

---

# 78. BILLING / SAAS

Plans disusun berdasarkan: orders, channels, users, warehouses, accounting features, AI usage.

- **Starter** — untuk seller kecil.
- **Growth** — multi-channel.
- **Business** — accounting + advanced automation.
- **Enterprise** — custom integration + SLA + advanced permission.

Architecture harus memungkinkan feature flags per plan. *(Harga & metering konkret lihat Bagian 123.)*

---

# 79. FEATURE FLAGS

Setiap feature besar dapat: enabled, disabled, beta, plan restricted, tenant restricted. Memungkinkan rollout bertahap.

---

# 80. ONBOARDING

Target: **User dapat memahami nilai produk dalam < 10 menit.**

```text
Create Account → Business Profile → Connect Marketplace → Import Products → Import/Sync Orders → Configure COGS → Dashboard Ready
```
Jangan memaksa user mengisi 50 form sebelum melihat dashboard.

---

# 81. FIRST VALUE

Setelah onboarding, user harus langsung melihat: Revenue, Profit, Orders, Inventory, Top Products, Problems.

Jika data belum lengkap: "Profit belum akurat karena 23 SKU belum memiliki COGS." — lebih baik daripada dashboard kosong.

---

# 82. DEMO / SANDBOX MODE

Untuk calon user: generate realistic sample business. User dapat melihat orders, inventory, profit, accounting, AI insights tanpa harus menghubungkan marketplace.

---

# 83. ANALYTICS

Reports: Sales (by day/channel/product/category/customer), Profit (gross profit/contribution margin/net profit/margin trend), Inventory (stock turnover/aging/dead stock/stock-out), Customer (LTV/repeat rate/AOV/retention), Operations (fulfillment time/return rate/cancellation). *(Event taxonomy lihat Bagian 124.)*

---

# 84. CUSTOM DASHBOARD

User PRO dapat memilih widgets, tetapi default dashboard tetap opinionated. Widgets: Revenue, Profit, Cash, Orders, Inventory, Top products, Channel performance, AI insights, Tasks, Settlement, Receivables, Payables.

---

# 85. SAVED VIEWS

```text
My Unshipped Orders
Low Stock
High Value Orders
Shopee Profit
Unmatched Settlements
Overdue Payables
```

---

# 86. BULK OPERATIONS

Support: bulk status update, bulk export, bulk price update, bulk stock adjustment, bulk tagging, bulk reconciliation. Semua bulk operation harus memiliki: confirmation, preview, audit log.

---

# 87. BARCODE

Support: barcode scanning, SKU lookup, picking, receiving, stock opname. Mobile camera dapat digunakan sebagai scanner untuk initial version.

---

# 88. DOCUMENT ENGINE

Generate: invoice, receipt, purchase order, packing slip, delivery document, financial report. Template customizable.

---

# 89. EXPORT

Support: CSV, XLSX, PDF. Heavy export menggunakan background job. User mendapatkan notification saat selesai.

---

# 90. DATA OWNERSHIP

User harus dapat: export data, download documents, retrieve transaction history. Tidak boleh membuat user terjebak secara data.

---

# 91. AUDITABLE AI

Setiap AI insight memiliki: Insight, Evidence, Data sources, Generated at, Model/version, Confidence where appropriate. AI tidak boleh menyajikan angka tanpa sumber.

---

# 92. AI HALLUCINATION CONTROL

AI harus: query structured business data, cite internal records, distinguish fact vs estimate, never fabricate transaction, never fabricate financial result, indicate insufficient data.

> "Saya belum dapat menghitung net profit karena 18 SKU belum memiliki COGS."

---

# 93. BUSINESS ALERT INTELLIGENCE

Sistem mencari: unusual sales drop, unusual expense increase, margin deterioration, stock-out risk, supplier delay, settlement mismatch, cash-flow risk, return spike, suspicious transaction pattern.

---

# 94. FUTURE PREDICTION

Eventually: Sales forecast, Inventory forecast, Cash forecast, Profit forecast, Purchase recommendation. Semua prediction harus menampilkan: forecast, confidence/range, factors, assumptions. Tidak memberikan kepastian palsu.

---

# 95. UX WRITING

Microcopy harus: pendek, natural, jelas, tidak terlalu formal, tidak terasa seperti AI.

Jangan: "Your data synchronization process has encountered an unexpected error."
Gunakan: "Sinkronisasi gagal. Kami akan mencoba lagi."

Jangan: "Congratulations! Your operation has been successfully completed."
Gunakan: "Selesai."

---

# 96. DESIGN QUALITY GATE

Setiap halaman harus lolos pertanyaan:
1. Apakah user tahu apa yang harus dilakukan?
2. Apakah primary action jelas?
3. Apakah informasi penting terlihat dalam 2–3 detik?
4. Apakah halaman terlalu ramai?
5. Apakah warna digunakan untuk makna?
6. Apakah user perlu membaca dokumentasi?
7. Apakah mobile experience masuk akal?
8. Apakah loading terasa cepat?
9. Apakah error dapat dipahami?
10. Apakah UI terlihat seperti template AI?

Jika nomor 10 jawabannya "ya": **design harus direvisi.**

---

# 97. DASHBOARD GOLDEN RULE

Dashboard tidak boleh menjadi tempat memamerkan semua fitur. Dashboard harus menjawab: **"Apa yang sedang terjadi?" · "Kenapa?" · "Apa yang harus saya lakukan?"**

---

# 98. INFORMATION HIERARCHY DASHBOARD

```text
1. Business Snapshot
2. Trend
3. Problems
4. Opportunities
5. Tasks
6. Detailed Analytics
```
Bukan: 20 charts, 12 cards, 15 KPIs sekaligus.

---

# 99. CORE PRODUCT LOOP

```text
TRANSACTION → DATA → UNDERSTANDING → INSIGHT → RECOMMENDATION → ACTION → RESULT → LEARNING → BETTER RECOMMENDATION
```
Inilah moat jangka panjang produk.

---

# 100. NORTH STAR METRIC

> **Number of meaningful business decisions assisted by AutoProfit.**

Secondary metrics: connected channels, active businesses, orders processed, inventory synced, reconciliation rate, automation execution, AI insight engagement, retention, net revenue retention.

---

# 101. SUCCESS CRITERIA

- User baru: **< 10 menit** → memahami dashboard.
- Owner: **< 30 detik** → mengetahui kondisi bisnis.
- User: **< 3 klik** → mencapai action utama.
- Order: **automatically** → masuk ke inventory dan accounting pipeline.
- Marketplace: **automatically** → sync tanpa duplicate.
- Finance: **traceable** → setiap angka dapat ditelusuri.
- AI: **actionable** → bukan sekadar chat.

---

# 102. DEFINITION OF DONE

Feature selesai jika lolos semua kategori berikut:

**Functional:** workflow lengkap · error handling · validation · permission · audit
**UX:** loading state · empty state · error state · success state · mobile · keyboard · responsive
**Data:** idempotency · transaction integrity · audit trail
**Performance:** optimized query · caching · background processing
**Security:** authorization · tenant isolation · input validation
**Production:** logging · monitoring · retry · migration · backup consideration

---

# 103. PHASE BUILD

**PHASE 0 — FOUNDATION:** architecture, auth, tenant, RBAC, database, design system, API framework, logging, monitoring, deployment

**PHASE 1 — CORE COMMERCE:** products, SKU, orders, customers, inventory, warehouse, dashboard, import

**PHASE 2 — MARKETPLACE:** connector architecture, Shopee, Tokopedia, TikTok Shop, additional connectors, webhook, sync engine

**PHASE 3 — FINANCE:** cash, COGS, profit engine, accounting, journal, ledger, P&L, balance sheet, cash flow

**PHASE 4 — RECONCILIATION:** marketplace settlement, bank reconciliation, unmatched transaction, exception workflow

**PHASE 5 — PURCHASING:** suppliers, PO, receiving, supplier analytics, reorder engine

**PHASE 6 — AUTOMATION:** workflow engine, rules, scheduled jobs, approvals

**PHASE 7 — AI:** business copilot, insights, explain-this, recommendations, business memory, AI action layer

**PHASE 8 — WHATSAPP:** notifications, approval, business queries, AI assistant, remote actions

**PHASE 9 — ADVANCED:** forecasting, advanced analytics, custom dashboards, multi-business, advanced tax, API platform

---

# 104. PRIORITY CLASSIFICATION

**P0 — MUST WORK:** authentication, tenant, products, orders, inventory, marketplace sync, dashboard, profit, accounting core, reconciliation, permissions, audit, performance

**P1 — HIGH VALUE:** purchasing, supplier, WhatsApp, AI insights, automation, bank reconciliation, forecasting

**P2 — EXPANSION:** advanced AI, external developer API, advanced forecasting, advanced tax, marketplace expansion, advanced warehouse

---

# 105. CRITICAL ARCHITECTURAL RULE

Jangan membangun `UI → directly manipulate database`. Harus:

```text
UI → API / Application Layer → Domain Logic → Database
```
External:
```text
Marketplace → Connector → Integration Layer → Domain
```
AI:
```text
AI → Tool / Permission Layer → Domain API → Database
```
AI tidak boleh mendapatkan akses database mentah.

---

# 106. CORE DOMAIN PRINCIPLE

Order tidak boleh menjadi "sumber kebenaran" untuk semua hal. Setiap domain memiliki source of truth:

```text
Order        → commerce state
Inventory    → stock state
Accounting   → financial state
Payment      → payment state
Settlement   → marketplace payout state
```
Event menghubungkan domain.

---

# 107. EVENT-DRIVEN INTERNAL DESIGN

```text
ORDER_PAID
    ↓
Reserve Inventory
    ↓
Create Financial Event
    ↓
Update Analytics
    ↓
Trigger Notification
```
Semua proses harus idempotent.

---

# 108. DATA INTEGRITY

Critical operations menggunakan database transaction, contoh order: `Order + Order Items + Inventory Reservation + Payment + Accounting Event`. Tidak boleh hanya sebagian berhasil tanpa recovery mechanism.

---

# 109. OBSERVABILITY GOLDEN RULE

Untuk setiap external integration harus dapat menjawab: Kapan terakhir sync? Berapa record berhasil? Berapa gagal? Kenapa gagal? Apakah retry? Apa dampaknya?

---

# 110. FINAL UX PHILOSOPHY

AutoProfit harus terasa: **Fast · Calm · Precise · Human · Trustworthy · Powerful**
tetapi tidak terasa: **Complicated · Generic · AI-generated · Enterprise-heavy**

---

# 111. FINAL PRODUCT PROMISE

AutoProfit bukan "software untuk mencatat transaksi." Bukan pula "ERP untuk UMKM."

> **AutoProfit membantu pemilik bisnis memahami apa yang terjadi, mengapa itu terjadi, dan apa yang harus dilakukan berikutnya.**

---

# 112. FINAL EXPERIENCE

User membuka AutoProfit. Dalam beberapa detik:
```text
Revenue      Rp42,8 jt
Profit        Rp8,7 jt
Cash         Rp91,2 jt
```
Kemudian: `⚠ 3 things need attention`. User klik. AutoProfit menjelaskan:
```text
Profit turun 3,1%.
Penyebab: Ads +19%, COGS +7%, Returns +14%
```
Kemudian:
```text
Recommended action: Reduce Campaign X
Estimated impact: +Rp2,1 jt/month
[Review]
```
User approve. AutoProfit melakukan action. Sistem mengukur hasil. Itulah pengalaman utama produk.

---

# 113. THE LONG-TERM MOAT

```text
Transaction Data + Inventory Data + Financial Data + Customer Data + Operational Data + Business Memory + AI + Automation
```
Semakin lama bisnis menggunakan AutoProfit: **semakin lengkap data → semakin baik insight → semakin berguna automation → semakin sulit digantikan.**

---

# 114. FINAL DESIGN MANTRA

> **Don't make the software look smart. Make the user feel smart.**
> **Don't show everything. Show what matters now.**
> **Don't make AI visible everywhere. Make intelligence invisible until it is useful.**
> **Complexity belongs inside the system, not inside the user's head.**


---

# PART II — TECHNICAL SPECIFICATION DEEPENING (REV 3)

Bagian ini ditambahkan untuk mengangkat seluruh area yang skornya di bawah 8/10 pada Bagian 0. Setiap sub-bagian ditulis agar dapat langsung dipakai sebagai acuan oleh tim engineering, bukan sekadar konsep.

---

# 115. DATA MODEL & ENTITY RELATIONSHIP

## 115.1 Prinsip Modeling

- Setiap entity **wajib** memiliki: `id (UUID)`, `tenant_id`, `created_at`, `updated_at`, `created_by`, `deleted_at` (soft delete).
- Setiap tabel transaksional finansial bersifat **append-only** untuk baris jurnal — koreksi dilakukan lewat entry pembalik (reversing entry), bukan update/delete.
- Setiap foreign key lintas domain (mis. `order.customer_id`) wajib `tenant_id`-scoped di level query, bukan hanya di level FK constraint.

## 115.2 Entity Inti & Field Kunci

**organization** (tenant)
`id, name, business_type, default_currency, timezone, coa_template, plan_id, status`

**user**
`id, org_id, name, email, phone, password_hash, status, last_login_at`

**membership** (user ↔ organization, many-to-many untuk multi-business)
`id, user_id, org_id, role, permissions_override(jsonb), status`

**channel** (marketplace/website/POS/manual)
`id, org_id, type[shopee|tokopedia|tiktokshop|lazada|blibli|shopify|woocommerce|pos|manual|api], name, credentials_ref, status, last_sync_at`

**product**
`id, org_id, name, category, brand, tax_class, status`

**variant**
`id, product_id, sku, barcode, attributes(jsonb), cost_method[FIFO|AVERAGE|STANDARD]`

**channel_listing** (mapping variant ↔ SKU di tiap channel)
`id, variant_id, channel_id, external_product_id, external_sku, price, sync_status`

**warehouse**
`id, org_id, name, type[warehouse|store|fulfillment|virtual], address`

**stock_item** (per variant per warehouse)
`id, variant_id, warehouse_id, on_hand, reserved, incoming, damaged, quarantine`
`available` dihitung (generated column): `on_hand - reserved - damaged - quarantine`

**stock_movement** (immutable ledger — sumber kebenaran stok)
`id, stock_item_id, type[receipt|sale|adjustment|transfer_out|transfer_in|return|damage], quantity_delta, reference_type, reference_id, note, created_at`

**customer**
`id, org_id, name, phone, email, channel_origin, segment_tags(jsonb)`

**order**
`id, org_id, channel_id, order_number, external_order_id, customer_id, status, subtotal, discount, shipping_fee, marketplace_fee, payment_fee, tax, total, currency, exchange_rate, placed_at`

**order_item**
`id, order_id, variant_id, qty, unit_price, unit_cogs_snapshot, discount, tax`

**payment**
`id, org_id, order_id, method, amount, status[pending|paid|failed|refunded], paid_at, gateway_ref`

**settlement** (marketplace payout)
`id, org_id, channel_id, settlement_ref, period_start, period_end, gross_amount, fee_amount, net_amount, status[pending|matched|partial|unmatched|exception], received_at`

**settlement_line** (rincian per order dalam satu settlement)
`id, settlement_id, order_id, gross, fee, adjustment, net, match_status`

**supplier**
`id, org_id, name, contact, payment_terms_days, lead_time_days, score`

**purchase_order**
`id, org_id, supplier_id, warehouse_id, status[draft|pending_approval|approved|partial_received|received|cancelled], total, expected_at`

**purchase_order_line**
`id, po_id, variant_id, qty_ordered, qty_received, unit_cost`

**account** (Chart of Accounts — lihat 119.1)
`id, org_id, code, name, type, parent_id, is_active`

**journal_entry**
`id, org_id, entry_date, source_type[order|purchase|settlement|manual|adjustment], source_id, memo, status[draft|posted|reversed], posted_at`

**journal_line**
`id, journal_entry_id, account_id, debit, credit, currency, base_amount, dimension(jsonb: {channel_id, warehouse_id, customer_id})`

**ai_insight**
`id, org_id, type, finding, evidence(jsonb), recommendation, estimated_impact, confidence, model_version, generated_at, status[new|reviewed|approved|ignored]`

**notification**
`id, org_id, user_id, category[critical|attention|information|success], title, body, related_entity, channel[inapp|whatsapp|email], read_at, sent_at`

**automation_rule**
`id, org_id, trigger(jsonb), condition(jsonb), action(jsonb), approval_required, status, last_run_at`

**audit_log**
`id, org_id, user_id, entity_type, entity_id, action, before(jsonb), after(jsonb), ip, created_at`

## 115.3 Relasi Kunci (ERD Naratif)

```text
organization 1—N membership N—1 user
organization 1—N channel
product 1—N variant
variant 1—N channel_listing N—1 channel
variant 1—N stock_item N—1 warehouse
stock_item 1—N stock_movement
order N—1 channel, order N—1 customer
order 1—N order_item N—1 variant
order 1—N payment
settlement 1—N settlement_line N—1 order
supplier 1—N purchase_order 1—N purchase_order_line N—1 variant
journal_entry 1—N journal_line N—1 account
order 1—1 journal_entry (source_type=order, via event ORDER_PAID)
```

## 115.4 Aturan Integritas Data

- `journal_line`: SUM(debit) harus SUM(credit) per `journal_entry_id` — divalidasi di level aplikasi **dan** database constraint (trigger check).
- `stock_movement` tidak pernah di-update — koreksi = insert movement baru dengan `type=adjustment`.
- `order.total` harus selalu direkonstruksi ulang dari `order_item` + fee — bukan field yang bisa diedit bebas (audit-safe).

---

# 116. API CONTRACT SPECIFICATION

## 116.1 Prinsip Umum

- Base URL: `https://api.autoprofit.id/v1`
- Format: JSON only, `Content-Type: application/json`
- Auth: `Authorization: Bearer <access_token>` (JWT, TTL 15 menit) + refresh token (TTL 30 hari, rotasi setiap pemakaian, HttpOnly cookie untuk web)
- Setiap request tenant-scoped otomatis dari klaim `org_id` di JWT — **tidak boleh** menerima `org_id` dari body/query untuk operasi tulis.
- Versioning: path-based (`/v1`, `/v2`), tidak breaking-change tanpa versi baru.
- Idempotency: endpoint POST yang membuat transaksi (order, PO, journal) wajib mendukung header `Idempotency-Key`.
- Pagination: cursor-based — `?limit=50&cursor=<opaque>`, response menyertakan `next_cursor`.
- Rate limit default: 120 req/menit per token (respons `429` + header `Retry-After` jika terlampaui).

## 116.2 Format Response Standar

Sukses:
```json
{
  "data": { "...": "..." },
  "meta": { "request_id": "req_8f2a", "next_cursor": "eyJpZCI6..." }
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "SKU sudah digunakan pada varian lain",
    "field": "sku",
    "request_id": "req_8f2a"
  }
}
```

Standar kode error: `VALIDATION_ERROR (400)`, `UNAUTHORIZED (401)`, `FORBIDDEN (403)`, `NOT_FOUND (404)`, `CONFLICT (409)`, `RATE_LIMITED (429)`, `INTERNAL_ERROR (500)`.

## 116.3 Contoh Endpoint Inti

```text
POST   /v1/orders                     Create manual order
GET    /v1/orders?status=paid&channel_id=  List orders (filter+cursor)
GET    /v1/orders/{id}                 Order detail + timeline
POST   /v1/orders/{id}/ship            Transisi status → shipped
GET    /v1/products
POST   /v1/products
POST   /v1/products/{id}/variants
GET    /v1/inventory/stock-items?warehouse_id=
POST   /v1/inventory/adjustments
GET    /v1/finance/profit-and-loss?period=2026-07
GET    /v1/finance/journal-entries/{id}
POST   /v1/purchasing/purchase-orders
POST   /v1/purchasing/purchase-orders/{id}/approve
GET    /v1/reconciliation/settlements?channel_id=&status=unmatched
POST   /v1/ai/copilot/ask               { "question": "kenapa profit turun?" }
POST   /v1/automation/rules
GET    /v1/audit-logs?entity_type=order&entity_id=
```

## 116.4 Contoh Request/Response — Order Detail

Request: `GET /v1/orders/ord_9f21`

Response:
```json
{
  "data": {
    "id": "ord_9f21",
    "order_number": "SHP-2026-118820",
    "channel": "shopee",
    "status": "shipped",
    "customer": { "id": "cus_11", "name": "Budi" },
    "items": [
      { "sku": "TSHIRT-BLK-M", "qty": 2, "unit_price": 99000, "unit_cogs": 42000 }
    ],
    "fees": { "marketplace_fee": 8900, "payment_fee": 1200, "shipping_fee": 0 },
    "profit": { "estimated": 143900, "actual": 143900 },
    "accounting": { "journal_entry_id": "je_5521", "status": "posted" },
    "timeline": [
      { "at": "2026-08-10T10:02:00+07:00", "event": "order_created" },
      { "at": "2026-08-10T10:20:00+07:00", "event": "shipped" }
    ]
  }
}
```

## 116.5 Webhook Inbound (dari AutoProfit ke sistem eksternal, mis. n8n/Zapier/partner)

`POST {subscriber_url}` dengan payload:
```json
{
  "event": "order.paid",
  "org_id": "org_1",
  "occurred_at": "2026-08-10T10:03:00+07:00",
  "data": { "order_id": "ord_9f21" },
  "signature": "hmac-sha256=..."
}
```
Signature diverifikasi pakai shared secret per subscriber. Retry: sama seperti Bagian 78 (3x dengan backoff, lalu dead-letter).

---

# 117. MARKETPLACE FIELD MAPPING & WEBHOOK EVENT CATALOG

## 117.1 Prinsip Connector

Setiap connector **wajib** mengimplementasikan interface yang sama:

```text
authenticate()
fetchProducts(cursor)
fetchOrders(since)
fetchInventory(sku[])
fetchSettlements(period)
handleWebhook(payload)
mapToUnifiedOrder(rawPayload) → UnifiedOrder
mapToUnifiedProduct(rawPayload) → UnifiedProduct
healthCheck()
```

## 117.2 Unified Order Schema (target mapping semua marketplace)

```json
{
  "external_order_id": "string",
  "order_number": "string",
  "status": "unpaid|paid|processing|shipped|delivered|cancelled|returned",
  "buyer": { "name": "string", "phone": "string|null" },
  "items": [{ "external_sku": "string", "qty": "number", "unit_price": "number", "discount": "number" }],
  "fees": { "marketplace_fee": "number", "payment_fee": "number", "shipping_fee": "number", "voucher": "number" },
  "shipping": { "courier": "string", "tracking_number": "string|null" },
  "placed_at": "ISO8601",
  "currency": "IDR"
}
```

Setiap adapter marketplace (Shopee, Tokopedia, TikTok Shop, Lazada, Blibli) wajib punya dokumen mapping tersendiri: `field marketplace asli → field Unified Order Schema di atas`, disimpan di repo connector masing-masing dan divalidasi dengan contract test (lihat Bagian 120.4).

## 117.3 Webhook Event Catalog (event yang WAJIB ditangani per connector, jika tersedia dari marketplace)

| Event | Aksi Internal |
|---|---|
| `order.created` | Create/upsert order (status awal) |
| `order.paid` | Trigger `ORDER_PAID` → reserve inventory, create financial event |
| `order.status_changed` | Update status, append timeline |
| `order.cancelled` | Release reserved inventory, reverse financial event jika sudah posted |
| `order.return_requested` | Buat return record, hold refund |
| `product.updated` | Sync harga/deskripsi (tidak mengubah COGS internal) |
| `inventory.updated` | Sinkronisasi arah outbound (AutoProfit → marketplace) saat stok internal berubah |
| `settlement.available` | Fetch settlement detail → masuk antrian reconciliation |

## 117.4 Rate Limit & Sync Strategy per Kelas Marketplace

- **Webhook-first marketplaces** (mendukung webhook realtime): webhook adalah primary source, polling setiap 30 menit sebagai safety-net.
- **Polling-only marketplaces**: polling order setiap 5 menit, produk/stok setiap 15 menit, dengan exponential backoff saat menerima `429` dari marketplace API.
- Idempotency key sinkronisasi: `hash(channel_id + external_order_id + event_type)` disimpan di tabel `sync_event_log` — event yang sama tidak diproses dua kali.

## 117.5 Error Mapping

Semua error dari marketplace API di-mapping ke kategori internal: `AUTH_EXPIRED`, `RATE_LIMITED`, `PRODUCT_NOT_FOUND`, `TEMPORARY_UNAVAILABLE`, `PERMANENT_FAILURE`. Kategori ini yang menentukan strategi retry (Bagian 78) dan pesan error yang ditampilkan ke user (Bagian 61).

---

# 118. ACCOUNTING SCHEMA DETAIL

## 118.1 Chart of Accounts Default (Indonesia) — Struktur Kode

```text
1000-1999  ASET
  1100  Kas & Bank
  1200  Piutang Usaha (AR)
  1300  Persediaan (Inventory)
  1400  Piutang Marketplace (Marketplace Receivable)
  1500  Aset Tetap

2000-2999  LIABILITAS
  2100  Utang Usaha (AP)
  2200  Utang Pajak
  2300  Pendapatan Diterima Dimuka

3000-3999  EKUITAS
  3100  Modal Pemilik
  3200  Laba Ditahan

4000-4999  PENDAPATAN
  4100  Penjualan — Marketplace
  4200  Penjualan — Website
  4300  Penjualan — POS
  4900  Retur Penjualan (kontra pendapatan)

5000-5999  HARGA POKOK PENJUALAN
  5100  COGS

6000-6999  BEBAN OPERASIONAL
  6100  Beban Marketplace (fee)
  6200  Beban Payment Gateway
  6300  Beban Iklan (Ads)
  6400  Beban Pengiriman
  6500  Beban Gaji
  6900  Beban Lain-lain
```

Template ini menjadi default saat organization dibuat (Bagian 29), dan dapat dikustomisasi user tanpa mengubah `account.code` yang sudah dipakai transaksi historis (perubahan kode = buat akun baru + migrasi saldo, bukan rename in-place).

## 118.2 Posting Rule per Event Bisnis

| Event | Debit | Kredit |
|---|---|---|
| `ORDER_PAID` | 1100/1400 Kas/Piutang Marketplace | 4100 Penjualan |
| `ORDER_PAID` (baris kedua, otomatis) | 5100 COGS | 1300 Persediaan |
| Marketplace fee terpotong | 6100 Beban Marketplace | 1400 Piutang Marketplace |
| `SETTLEMENT_RECEIVED` | 1100 Kas | 1400 Piutang Marketplace |
| `ORDER_RETURNED` (setelah settle) | 4900 Retur Penjualan | 1100/1400 |
| `ORDER_RETURNED` (kembalikan stok) | 1300 Persediaan | 5100 COGS |
| `PURCHASE_RECEIVED` | 1300 Persediaan | 2100 Utang Usaha |
| `SUPPLIER_PAID` | 2100 Utang Usaha | 1100 Kas |

Setiap posting rule di atas diimplementasikan sebagai fungsi murni (`deterministic`, testable) di domain Accounting — bukan hard-coded di UI atau di connector.

## 118.3 Periode & Tutup Buku (Period Close)

- Setiap `journal_entry` terikat pada `accounting_period` (`YYYY-MM`, status: `open|closing|closed`).
- Saat periode berstatus `closed`, tidak ada `journal_entry` baru yang boleh diposting ke periode tersebut — koreksi wajib pakai reversing entry di periode berjalan dengan referensi ke entry asal.
- Proses closing checklist: (1) semua order dalam periode berstatus final, (2) semua settlement dalam periode berstatus matched/exception-resolved, (3) trial balance balance, (4) approval dari role Finance/Owner.

## 118.4 Multi-Currency Posting

- Setiap `journal_line` menyimpan `currency` asli dan `base_amount` (sudah dikonversi ke `organization.default_currency`) menggunakan `exchange_rate` yang berlaku di `order.exchange_rate` (snapshot saat transaksi, bukan rate real-time saat pelaporan).
- Selisih kurs saat settlement direalisasikan diposting ke akun baru `6950 — Selisih Kurs`.

## 118.5 Inventory Costing

- Default: **Weighted Average** per warehouse per variant, dihitung ulang setiap `stock_movement` masuk (`receipt`).
- FIFO tersedia sebagai opsi per organization (memengaruhi cara `unit_cogs_snapshot` dihitung pada `order_item`).
- `unit_cogs_snapshot` di-freeze pada saat `ORDER_PAID` — perubahan cost setelahnya tidak mengubah histori order lama (audit-safe, sesuai P5 Explainable).

---

# 119. NON-FUNCTIONAL REQUIREMENTS & SLA

## 119.1 Availability

- Target uptime: **99.9%** untuk API & Web App (≈ 43 menit downtime/bulan yang ditoleransi).
- Marketplace connector: degradasi terisolasi — kegagalan satu connector tidak boleh menurunkan uptime core system (circuit breaker per connector).

## 119.2 Backup & Disaster Recovery

- **RPO (Recovery Point Objective): ≤ 15 menit** — menggunakan continuous WAL archiving PostgreSQL + snapshot harian.
- **RTO (Recovery Time Objective): ≤ 4 jam** untuk full restore ke region cadangan.
- Backup diuji restore minimal setiap kuartal (bukan hanya dibuat, tapi dibuktikan bisa dipulihkan).
- Retensi backup: harian 14 hari, mingguan 3 bulan, bulanan 12 bulan.

## 119.3 Data Retention & Compliance

- Data transaksi & journal disimpan minimum sesuai ketentuan pajak Indonesia (umumnya 10 tahun) — tidak boleh hard delete, hanya soft delete/archive.
- Audit log tidak dapat dihapus oleh role manapun kecuali melalui prosedur data-retention resmi.
- PII (nama, telepon, email pelanggan) dienkripsi at-rest; akses dicatat di audit log.

## 119.4 Scalability Baseline

- Desain awal harus tahan beban: **10.000 order/hari per tenant besar**, **1.000 tenant aktif** pada fase Growth, tanpa perubahan arsitektur (hanya scaling horizontal worker & read replica).
- Reconciliation & report generation berat wajib berjalan sebagai background job — tidak boleh membebani jalur request-response utama.

## 119.5 Maintenance Window

- Maintenance terjadwal diumumkan minimal 24 jam sebelumnya via in-app notification & email, dilakukan di jam trafik terendah (berdasarkan data historis tenant Indonesia, umumnya dini hari WIB).

---

# 120. QA & TESTING STRATEGY

Area ini tidak dibahas sama sekali di Rev 2 — ditambahkan penuh di Rev 3.

## 120.1 Test Pyramid

```text
        E2E (critical user journeys)      ~10%
     Integration (API + DB + queue)       ~30%
  Unit (domain logic, posting rules)      ~60%
```

## 120.2 Area Wajib Diuji Otomatis

- **Accounting posting rules** (Bagian 118.2) — setiap event bisnis harus punya unit test yang memverifikasi debit = kredit dan akun yang benar.
- **Inventory arithmetic** — reservasi, release, adjustment tidak boleh menghasilkan stok negatif tanpa flag eksplisit.
- **Idempotency** — mengirim webhook/duplicate request yang sama dua kali tidak boleh menghasilkan order/journal ganda.
- **Tenant isolation** — test otomatis yang secara eksplisit mencoba mengakses data tenant lain dan memastikan selalu ditolak (bagian dari setiap PR yang menyentuh query lintas tenant).
- **AI Copilot grounding** — setiap jawaban AI di test-suite harus bisa ditelusuri ke `evidence` yang valid; jawaban tanpa evidence dianggap gagal test.

## 120.3 Environment

`local → staging (data sintetis, mirror schema production) → production`. Tidak ada development langsung terhadap data production.

## 120.4 Contract Testing untuk Marketplace Connector

Setiap connector marketplace memiliki contract test terhadap **mock server** yang meniru response API asli (termasuk skenario error, rate limit, payload tidak lengkap) — dijalankan di CI setiap ada perubahan connector, independen dari ketersediaan API marketplace yang sebenarnya.

## 120.5 UAT (User Acceptance Testing)

Sebelum rilis setiap Phase (Bagian 103), dilakukan UAT dengan minimal 3 business real (bukan sintetis) mewakili 3 persona di Bagian 3, dengan checklist berbasis Definition of Done (Bagian 102).

## 120.6 Performance & Load Testing

- Load test dijalankan sebelum rilis Phase 2 (Marketplace) dan Phase 3 (Finance) — target: 10.000 order/hari tersinkron tanpa lag reconciliation > 1 jam.
- Regression performance: setiap rilis dibandingkan P95 API dengan baseline sebelumnya; degradasi > 20% memblokir rilis.

## 120.7 Security Testing

- Dependency scanning otomatis di CI (setiap build).
- Penetration test oleh pihak ketiga minimal sebelum rilis publik (GA) dan setiap 12 bulan setelahnya.

---

# 121. AI COPILOT — TOOL PERMISSION & SAFETY SCHEMA

Melengkapi Bagian 35–37 dengan spesifikasi konkret.

## 121.1 Tool Registry (AI hanya boleh memanggil tool terdaftar, tidak pernah query DB langsung — sesuai Bagian 105)

```json
{
  "tool": "get_profit_breakdown",
  "risk_level": 0,
  "params": { "period": "string", "channel_id": "string|null" }
}
{
  "tool": "create_purchase_order_draft",
  "risk_level": 1,
  "params": { "supplier_id": "string", "lines": "array" }
}
{
  "tool": "submit_purchase_order",
  "risk_level": 3,
  "requires_approval_role": ["Owner", "Purchasing"]
}
{
  "tool": "adjust_campaign_budget",
  "risk_level": 2,
  "requires_confirmation": true
}
```

## 121.2 Alur Eksekusi Aksi Level 2–3

```text
AI mengusulkan aksi (draft, belum efek nyata)
   ↓
Sistem menampilkan estimasi dampak + biaya/risiko
   ↓
User/role berwenang mengonfirmasi
   ↓
Aksi dieksekusi via Domain API yang sama dengan aksi manual (bukan jalur khusus AI)
   ↓
Tercatat di audit_log dengan source="ai_copilot"
```

## 121.3 Prompt-Injection & Data-Boundary Defense

- Konten dari sumber eksternal (deskripsi produk marketplace, pesan customer, email) yang masuk ke context AI **selalu ditandai sebagai data, bukan instruksi** — AI tidak mengeksekusi perintah yang muncul di dalam data tersebut.
- AI hanya memiliki akses ke data tenant yang sedang aktif dalam sesi (tenant isolation berlaku sama seperti API biasa, lihat Bagian 74).
- Semua tool call AI melewati layer permission yang sama dengan user biasa — role AI tidak pernah "lebih tinggi" dari role user yang memicu percakapan.

## 121.4 Confidence & Insufficient Data

Setiap `ai_insight` wajib mengisi `confidence` (`high|medium|low`) dan, jika data tidak cukup, mengembalikan status `insufficient_data` beserta daftar data yang hilang (contoh di Bagian 92) — bukan mengarang angka.

---

# 122. PERFORMANCE & CAPACITY PLANNING

## 122.1 Target Latency (mendetailkan Bagian 66)

| Operasi | Target P95 |
|---|---|
| Load Home Dashboard (cached) | < 1.0 detik |
| Load Home Dashboard (cold) | < 2.5 detik |
| Read API ringan (list order, list produk) | < 500 ms |
| Write API (create order manual) | < 800 ms |
| Search (Command Palette) | < 300 ms |
| Report berat (P&L custom range) | async — user diberi notifikasi saat selesai, target < 60 detik untuk 1 tahun data |

## 122.2 Capacity Baseline Infrastruktur (indikatif untuk perencanaan, bukan harga final)

- **App servers:** horizontal-scalable, stateless, autoscale berdasarkan CPU & queue depth.
- **PostgreSQL:** primary + minimal 1 read replica untuk beban reporting/analytics agar tidak mengganggu jalur transaksional.
- **Redis:** cluster mode untuk cache + queue + rate limiting begitu jumlah tenant aktif melewati fase Growth.
- **Worker pool terpisah per jenis job** (marketplace sync, reconciliation, report, AI) agar job berat (mis. reconciliation) tidak memblokir job ringan (mis. notification).

## 122.3 Breakpoint Responsive (mendetailkan Bagian 64)

```text
Mobile        < 640px    — bottom navigation, single column, table → card list
Tablet        640–1024px — collapsible sidebar, table tetap tabel dengan kolom prioritas
Laptop        1024–1440px — sidebar terbuka, table penuh
Desktop wide  > 1440px   — layout dengan panel detail di sisi (mis. order list + order detail split view)
```
Tabel pada breakpoint mobile tidak sekadar mengecil — kolom non-esensial disembunyikan dan disusun ulang menjadi ringkasan per baris (nama, status, nominal utama saja), detail lain di-tap untuk expand.

---

# 123. SECURITY — PARAMETER KONKRET

Melengkapi Bagian 73 dengan angka yang dapat langsung diimplementasikan.

- Password: hashing **bcrypt/argon2**, minimum policy 8 karakter + kombinasi, tidak menyimpan riwayat password di plaintext dimanapun.
- Access token JWT: **TTL 15 menit**. Refresh token: **TTL 30 hari**, rotasi setiap penggunaan, invalidasi seluruh sesi saat password diganti.
- Rate limiting default: **120 req/menit per token**, **20 req/menit untuk endpoint auth** (login/reset password) untuk mencegah brute force.
- Enkripsi in-transit: TLS 1.2+ wajib di semua endpoint publik.
- Enkripsi at-rest: kolom PII (nama pelanggan, telepon, email) dan credentials koneksi marketplace dienkripsi di level database/kolom, bukan hanya disk-level.
- Secret management: kredensial marketplace & third-party disimpan di secret manager terpisah (bukan di kolom database polos, bukan di environment variable yang ter-log).
- Session: logout dari satu device tidak otomatis logout device lain, tapi user dapat melihat & mencabut sesi aktif dari Settings.

---

# 124. BILLING & PRICING DETAIL

Melengkapi Bagian 78 dengan struktur metering yang dapat diimplementasikan sebagai feature flag & usage counter.

| Plan | Target User | Batas Order/bulan | Channel Terhubung | User | Accounting Penuh | Automation | AI Copilot |
|---|---|---|---|---|---|---|---|
| **Starter** | Seller kecil, 1 channel | 300 | 1 | 1 | Dasar (profit sederhana) | Tidak | Terbatas (read-only insight) |
| **Growth** | Multi-channel aktif | 3.000 | 5 | 5 | Ya | Rule dasar | Ya |
| **Business** | Brand dengan tim | 15.000 | Unlimited | 15 | Ya + multi-warehouse | Rule lanjutan + approval | Ya + action level 1-2 |
| **Enterprise** | Skala besar/kustom | Custom | Unlimited | Unlimited | Ya + multi-business | Custom | Ya + action level 3 + SLA |

Prinsip metering:
- Counter `orders_this_period` di-reset setiap awal siklus billing, ditampilkan sebagai progress bar di Settings (transparan, bukan mengejutkan user).
- Saat mendekati limit (>80%), notifikasi proaktif dengan opsi upgrade — bukan pemutusan mendadak.
- Overage: order melebihi limit tetap diproses (tidak memutus operasional bisnis user), tetapi ditagih sebagai add-on di akhir siklus — kebijakan ini harus dinyatakan jelas di halaman pricing.
- Trial: 14 hari akses penuh plan Growth tanpa kartu kredit, dengan Sandbox Mode (Bagian 82) aktif sejak menit pertama sebelum marketplace terhubung.

---

# 125. ANALYTICS EVENT TAXONOMY

Melengkapi Bagian 83/100 agar North Star Metric dapat benar-benar diukur.

## 125.1 Konvensi Penamaan

`object_action` dalam snake_case, contoh: `order_created`, `insight_viewed`, `insight_action_approved`, `dashboard_viewed`, `channel_connected`, `reconciliation_resolved`.

## 125.2 Event Inti untuk North Star Metric

North star: **"Number of meaningful business decisions assisted by AutoProfit"** diukur sebagai turunan dari:

```text
insight_generated          → AI/sistem menghasilkan rekomendasi
insight_viewed              → user membuka rekomendasi
insight_action_approved     → user menyetujui aksi (dihitung sebagai 1 "assisted decision")
insight_action_ignored       → user mengabaikan
automation_rule_triggered   → rule berjalan otomatis (dihitung sebagai assisted decision jika ada approval_required=false dengan dampak terukur)
```

## 125.3 Event Pendukung Secondary Metrics (Bagian 100)

```text
channel_connected / channel_disconnected
order_synced
inventory_synced
reconciliation_matched / reconciliation_exception_created
automation_execution_success / automation_execution_failed
ai_copilot_question_asked
user_retained_weekly (derived, bukan event langsung — dihitung dari login/aktivitas)
```

Setiap event minimal menyertakan `org_id, user_id, timestamp, entity_id, properties(jsonb)` agar dapat di-join dengan data transaksional untuk laporan "berapa banyak rekomendasi yang benar-benar meningkatkan profit" — bukan sekadar vanity count.

---

# 126. READINESS SCORECARD — SETELAH REVISI (REV 3)

| # | Area | Skor Rev 2 | Skor Rev 3 | Perbaikan Kunci |
|---|---|---|---|---|
| 1 | Product Vision & Problem Statement | 9/10 | 9/10 | — |
| 2 | Target User & Persona | 7/10 | 9/10 | Bagian 3: JTBD + acceptance criteria per persona |
| 3 | Information Architecture / Navigation | 8/10 | 8/10 | — |
| 4 | Data Model / Domain Design | 5/10 | 9/10 | Bagian 115: entity, field, relasi, aturan integritas |
| 5 | API Specification | 4/10 | 9/10 | Bagian 116: auth, format, endpoint, contoh request/response |
| 6 | Marketplace Integration Detail | 6/10 | 9/10 | Bagian 117: unified schema, webhook catalog, rate limit strategy |
| 7 | Accounting Engine Detail | 6/10 | 9/10 | Bagian 118: COA lengkap, posting rule table, period close, multi-currency |
| 8 | Security & Multi-Tenancy | 7/10 | 9/10 | Bagian 123: angka TTL, rate limit, enkripsi konkret |
| 9 | AI Copilot & AI Safety | 7/10 | 9/10 | Bagian 121: tool registry, alur approval, prompt-injection defense |
| 10 | UX / Design System | 8/10 | 8/10 | — |
| 11 | Performance & Capacity Planning | 6/10 | 8/10 | Bagian 122: target latency per operasi, capacity baseline, breakpoint |
| 12 | Non-Functional Requirements & SLA | 5/10 | 9/10 | Bagian 119: uptime, RPO/RTO, retensi data, compliance |
| 13 | QA & Testing Strategy | 3/10 | 8/10 | Bagian 120: test pyramid, contract test, UAT, load & security test |
| 14 | Rollout / Phase Plan | 8/10 | 8/10 | — |
| 15 | Billing & Monetization Detail | 5/10 | 8/10 | Bagian 124: tabel plan konkret, metering, overage policy |
| 16 | Analytics & Instrumentation Taxonomy | 6/10 | 8/10 | Bagian 125: konvensi event, event inti North Star |
| — | **Rata-rata keseluruhan** | **6.3/10** | **8.5/10** | ✅ Seluruh area ≥ 8/10 — **build-ready** |

**Kesimpulan Rev 3:** Seluruh area kini berada di atas ambang 8/10. Dokumen ini dapat diserahkan ke tim engineering untuk mulai **PHASE 0 — FOUNDATION** (Bagian 103) dengan ambiguitas minimal pada domain data, API, accounting, dan security — empat area yang paling sering menjadi sumber rework mahal jika tidak dispesifikasikan di awal.


---

# FINAL STATUS

PRD Rev 3 dianggap sebagai **master product specification** yang build-ready.

Semua development berikutnya harus mengikuti:

1. Product principles (Bagian 4)
2. Domain architecture & data model (Bagian 69, 105–108, 115)
3. Data integrity (Bagian 108, 115.4)
4. UX design system (Bagian 50–65)
5. Performance requirements & capacity planning (Bagian 66, 122)
6. Security requirements (Bagian 73–74, 123)
7. AI safety & tool permission (Bagian 36–37, 121)
8. Marketplace connector architecture (Bagian 17–19, 76, 117)
9. Accounting integrity (Bagian 27–29, 118)
10. QA & testing strategy (Bagian 120)
11. Non-functional requirements & SLA (Bagian 119)
12. Billing & metering (Bagian 78, 124)
13. Definition of Done (Bagian 102)

Tidak boleh menambahkan fitur hanya karena "terlihat keren". Setiap fitur baru harus menjawab:

> **Masalah apa yang diselesaikan?**
> **Seberapa sering masalah itu terjadi?**
> **Berapa besar dampaknya?**
> **Apakah fitur tersebut membuat user lebih cepat mengambil keputusan?**

Jika tidak, fitur tersebut tidak menjadi prioritas.

---

*AutoProfit PRD — Final Revision 3. Rebranding dari ProfitOS ke AutoProfit selesai di seluruh dokumen. Semua area kesiapan pembangunan berada di atas skor 8/10 (lihat Bagian 126).*

---

# SUMBER 2 — AUTOPROFIT PRD REV 4

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

---

# SUMBER 3 — AUTOPROFIT PRD REV 5 ADDENDUM

# AUTOPROFIT

## Unified Commerce, Finance & Business Intelligence Platform

**PRD — Revisi 5 (Reachability & 10-Year Resilience)**

**Status:** Build-Ready + Deployment-Ready + **Reach-Ready + Longevity-Ready**
**Basis:** Rev 4 (dokumen sebelumnya) — dokumen ini adalah **addendum wajib-baca**, bukan pengganti. Semua bagian Rev 3 (1–126) dan Rev 4 (127–149) tetap berlaku kecuali dinyatakan lain di sini.

---

# CHANGELOG — REV 4 → REV 5

Rev 4 menjawab *apa yang dibangun*, *bagaimana sistem ini benar-benar bisa jalan di shared hosting hari ini*, dan *bagaimana tim tahu sebuah modul inti sungguh-sungguh selesai*. Tiga pertanyaan itu cukup untuk membuat proyek **mulai dibangun dengan benar**. Tapi ada dua pertanyaan lain yang belum dijawab, dan keduanya menentukan apakah proyek ini **berhasil sebagai bisnis**, bukan hanya berhasil sebagai sistem teknis:

1. **Rev 4 mengasumsikan sistem sudah jadi lalu tinggal dipakai.** Tidak ada bagian yang secara eksplisit membahas bagaimana pengguna sasaran (UMKM/seller marketplace Indonesia) sebenarnya **menjangkau** dan **mulai memakai** sistem ini — kanal akses, friksi onboarding, dan kesenjangan antara "sistem yang secara teknis berjalan" dengan "sistem yang benar-benar dibuka dan dipakai tiap hari oleh pemilik warung online". Sistem yang secara teknis sempurna tapi sulit dijangkau akan gagal secara bisnis, bukan gagal secara teknis.
2. **Rev 4 (Part V, Bagian 142–149) hanya merencanakan ketahanan 5 tahun untuk lapisan marketplace API.** Ketahanan jangka panjang sebuah sistem finansial bukan cuma soal API marketplace berubah — tapi juga soal data yang bisa hilang konteksnya saat schema berubah, dependency yang mati tanpa upgrade terjadwal, ekosistem connector yang terlalu bergantung pada tim inti kecil, dan yang paling sering diabaikan: **ketergantungan pada segelintir orang** yang paham keseluruhan sistem. Ini adalah kelas risiko yang berbeda dari "API marketplace berubah" dan tidak tercakup di Part V.

Rev 5 menambahkan:

- **PART VI — REACHABILITY** (Bagian 150–157): bagaimana sistem dirancang agar mudah dijangkau dan mudah mulai dipakai oleh pengguna sasaran, bukan hanya mudah diakses secara teknis.
- **PART VII — 10-YEAR RESILIENCE** (Bagian 158–165): ketahanan jangka panjang di luar lapisan marketplace API — preservasi data mentah, ekosistem connector, keputusan arsitektur yang terdokumentasi, siklus upgrade, portabilitas data, dan kontinuitas operasional.
- **Revisi Bagian 140 (Phase Build)** dan **Bagian 141/149 (Readiness Scorecard)** dengan dua dimensi baru: *Reachability* dan *Long-Term Continuity*.

Prinsip Rev 5:

> **Sistem yang tidak dijangkau penggunanya sama saja dengan sistem yang tidak pernah dibangun.**

> **Ketahanan 5 tahun di lapisan API tidak berarti apa-apa jika sistemnya sendiri tidak bisa dirawat 10 tahun dari sekarang oleh tim yang mungkin sudah sepenuhnya berbeda.**

---

# PART VI — REACHABILITY

# 150. PRINSIP REACHABILITY

Reachability bukan fitur, bukan juga sekadar "onboarding UX yang bagus". Reachability adalah **jarak antara pengguna sasaran dengan momen pertama mereka mendapat nilai nyata dari sistem** — diukur dalam langkah, waktu, dan prasyarat teknis yang harus dipenuhi pengguna. Untuk AutoProfit, pengguna sasaran adalah pemilik UMKM/seller marketplace Indonesia — populasi yang mayoritas:

- Lebih terbiasa dengan **WhatsApp dan aplikasi berbasis browser ringan** dibanding software desktop/enterprise.
- Tidak punya latar belakang akuntansi formal — istilah seperti "jurnal", "akun 4100", "reversing entry" (istilah inti Bagian 118) adalah bahasa internal sistem, **bukan** bahasa yang boleh langsung dihadapkan ke pengguna di titik onboarding pertama.
- Sensitif terhadap biaya di awal (baru mulai/skala kecil) tapi bersedia bayar begitu nilai sudah terbukti.
- Sering berpindah device (HP utama, kadang laptop bersama) — sistem tidak boleh berasumsi satu device tetap.

**Aturan keras:** setiap keputusan desain di Bagian 151–154 harus bisa menjawab pertanyaan "apakah ini mengurangi jarak antara pengguna dan nilai pertama yang mereka rasakan?" — jika tidak, itu bukan prioritas reachability, meski mungkin tetap prioritas di area lain (mis. Bagian 50–65 UX design system).

---

# 151. WHATSAPP SEBAGAI KANAL AKSES, BUKAN FITUR TAMBAHAN DI FASE AKHIR

Rev 3/4 menempatkan WhatsApp di **Phase 8** (Bagian 140) — setelah commerce, marketplace, finance, reconciliation, purchasing, automation, dan AI. Untuk reachability, urutan ini perlu **direvisi secara eksplisit**: WhatsApp bukan fitur "nice-to-have" di akhir roadmap, melainkan **kanal akses paralel** yang secara arsitektur harus disiapkan sejak Phase 0, meski implementasi penuhnya tetap boleh menunggu Phase 8.

## 151.1 Kenapa WhatsApp, bukan cuma aplikasi web/mobile

Pengguna sasaran sudah membuka WhatsApp puluhan kali sehari untuk urusan bisnis (chat pembeli, koordinasi kurir, grup supplier). Meminta mereka membuka aplikasi terpisah untuk "sekadar cek untung hari ini" adalah friksi nyata yang menurunkan retensi — meski aplikasi itu sendiri bagus.

## 151.2 Yang harus disiapkan sejak Phase 0 (bukan Phase 8)

- `RealtimeAdapter` (Bagian 127, 128.7) dan sistem notifikasi (Bagian 128.4) **wajib** didesain dengan interface `NotificationChannel` generik (`in_app | email | whatsapp`) sejak awal — bukan hardcode ke satu channel. Menambah WhatsApp di Phase 8 nanti berarti menambah satu implementasi adapter baru, bukan mendesain ulang sistem notifikasi.
- Query read-only sederhana (saldo hari ini, status order terbaru, ringkasan P&L harian dari `dashboard_summary_daily` Bagian 128.6) dirancang sejak awal sebagai **fungsi terpisah dari HTTP handler** (mis. `getDailySnapshot(orgId, date)`), sehingga bisa dipanggil baik dari REST endpoint dashboard maupun dari WhatsApp bot handler tanpa duplikasi logic.

## 151.3 Cakupan WhatsApp Fase Awal (saat Phase 8 dimulai)

| Kemampuan | Prioritas | Catatan |
|---|---|---|
| Notifikasi push satu arah (order masuk, stok rendah, sinkronisasi gagal) | P0 | Paling murah dibangun, paling tinggi nilai retensi — user tidak perlu buka app untuk tahu ada masalah |
| Query read-only via chat (mis. "omzet hari ini", "stok SKU X") | P0 | Jawab dari `dashboard_summary_daily`/inventory view yang sudah ada, tidak butuh logic baru |
| Approval sederhana via tombol WhatsApp (mis. approve PO nilai kecil) | P1 | Butuh integrasi WhatsApp Business API dengan interactive message, bukan cuma teks |
| Input transaksi via chat (mis. catat pengeluaran manual) | P2 | Risiko ambiguitas parsing bahasa natural tinggi — tunda sampai P0/P1 stabil dan terbukti dipakai |

**Gate:** kemampuan P1/P2 tidak dimulai sebelum P0 lolos DoC-setara (pola Bagian 133) dengan minimal 30 hari observasi pemakaian nyata.

---

# 152. PWA (PROGRESSIVE WEB APP), BUKAN NATIVE APP DI AWAL

## 152.1 Alasan Teknis dan Bisnis

Arsitektur Fase 1 (Bagian 128.7) sudah memakai SSE dengan fallback polling — pola ini secara alami cocok dengan model PWA (service worker, cache asset, notifikasi push terbatas via browser) tanpa menambah infrastruktur baru. Membangun aplikasi native (iOS/Android) di awal berarti **codebase ketiga dan keempat** yang harus disinkronkan dengan perubahan domain logic — bertentangan langsung dengan prinsip Bagian 127 ("satu codebase, adapter di belakang interface yang sama").

## 152.2 Cakupan PWA

- **Installable** dari browser (Add to Home Screen) — ikon di home screen HP tanpa proses app store, tanpa proses review Apple/Google yang memakan waktu (analog dengan proses App review marketplace di Bagian 144, sebisa mungkin dihindari kalau tidak perlu).
- **Asset caching** lewat service worker agar load kedua-dst jauh lebih cepat di koneksi lambat — selaras dengan strategi performa Bagian 128.6 yang sudah menghindari ketergantungan CDN dinamis mahal.
- **Web Push** untuk notifikasi (di platform yang mendukung) sebagai pelengkap WhatsApp (Bagian 151), bukan pengganti — WhatsApp tetap kanal utama karena jangkauannya lebih universal di pengguna sasaran.

## 152.3 Kapan Native App Baru Dipertimbangkan

Native app (khususnya untuk performa kamera/scanner barcode yang lebih baik, atau distribusi lewat Play Store untuk kredibilitas) baru masuk roadmap setelah salah satu tercapai:

- Traksi pengguna aktif bulanan melewati skala yang membuat *distribusi lewat app store* (bukan kemampuan teknis semata) jadi nilai tambah kompetitif, ATAU
- Ada kebutuhan hardware-level yang PWA tidak bisa penuhi dengan baik (mis. barcode scanning performa tinggi, integrasi printer thermal Bluetooth).

Ini prinsip yang sama dengan Bagian 129.1 (trigger migrasi cloud): **jangan bangun untuk kapasitas yang belum dibutuhkan.**

---

# 153. ONBOARDING SELF-SERVE & TEMPLATE CHART OF ACCOUNTS PER INDUSTRI

## 153.1 Masalah

Bagian 118 mendefinisikan Chart of Accounts (COA) yang presisi dan lengkap secara akuntansi — tapi presisi ini adalah **hambatan onboarding** kalau pengguna baru dihadapkan ke daftar akun mentah saat pertama kali signup. Pengguna sasaran (Bagian 150) tidak tahu apa bedanya "akun 4100 Penjualan — Marketplace" dengan akun lain, dan tidak seharusnya perlu tahu di menit pertama.

## 153.2 Solusi: Wizard "Pilih Jenis Usahamu"

Saat signup, pengguna memilih dari daftar kategori usaha yang familiar secara bahasa dagang sehari-hari (bukan bahasa akuntansi), mis.: *Fashion & Aksesoris*, *Makanan & Minuman*, *Elektronik & Gadget*, *Kecantikan & Perawatan*, *Lainnya (umum)*. Setiap pilihan memetakan ke **subset COA Bagian 118.1 yang sudah pre-configured** (akun relevan diaktifkan, sisanya tetap ada di sistem tapi disembunyikan dari tampilan sampai dibutuhkan) plus contoh mapping kategori produk → SKU costing yang lazim di industri tersebut.

```text
Signup → pilih kategori usaha → COA subset otomatis aktif
       → hubungkan channel pertama (Bagian 17) → data mulai masuk
       → Business Snapshot (Bagian 9) muncul dengan angka nyata pertama
```

**Target metrik reachability:** dari signup sampai pengguna melihat angka nyata pertama di dashboard (bukan data dummy) — di bawah 10 menit, tanpa bantuan manual/CS, untuk pengguna yang sudah punya toko marketplace aktif.

## 153.3 Progressive Disclosure untuk Fitur Akuntansi Lanjutan

Fitur seperti multi-currency (Bagian 118.4), period close (Bagian 118.3), dan reversing entry manual tetap ada sejak awal di backend (tidak boleh jadi utang teknis nanti), tapi **disembunyikan dari UI** sampai pengguna mengaktifkannya secara sadar (mis. lewat setting "Aktifkan mode akuntansi lanjutan"). Ini menjaga kesederhanaan awal tanpa mengorbankan kelengkapan sistem untuk pengguna yang lebih matang (mis. Enterprise, Bagian 124).

---

# 154. FREE/STARTER TIER & THRESHOLD YANG SELARAS DENGAN BAGIAN 129.1

Bagian 129.1 sudah menetapkan angka konkret kapan migrasi cloud **wajib** terjadi (order > 3.000/bulan, tenant > 50, dst). Angka yang sama secara alami menjadi sinyal kapan sebuah tenant sudah "naik kelas" secara bisnis — Rev 5 menjadikan ini eksplisit sebagai desain tier, bukan kebetulan.

| Tier | Batas Order/Bulan | Harga | Tujuan |
|---|---|---|---|
| **Starter (gratis)** | Sampai dengan skala kecil yang jauh di bawah threshold migrasi individual per tenant (mis. ratusan order/bulan) | Rp 0 | Menghilangkan friksi finansial di titik masuk — pengguna baru sering ragu bayar sebelum merasakan nilai nyata |
| **Growth** | Sampai mendekati kontribusi tenant terhadap threshold agregat Bagian 129.1 | Berbayar, sesuai Bagian 124 | Pengguna yang sudah merasakan nilai dan siap membayar untuk fitur lanjutan (multi-channel, automation) |
| **Enterprise** | Tidak dibatasi order, tapi tunduk ke SLA kontraktual (Bagian 124, 128.8) | Custom | Butuh jaminan SLA yang hanya bisa dipenuhi di Fase 2 (cloud) — selaras dengan Bagian 129.1 poin SLA uptime kontraktual |

**Prinsip:** tier gratis harus cukup bermanfaat untuk membuat pengguna **benar-benar memakai** sistem sebagai alat kerja harian (bukan sekadar coba lalu tinggalkan), karena reachability yang berhasil diukur dari retensi pemakaian, bukan dari jumlah signup.

---

# PART VII — 10-YEAR RESILIENCE

# 155. PRINSIP KETAHANAN JANGKA PANJANG

Part V (Bagian 142–149) menjawab ketahanan terhadap **perubahan API marketplace** — kelas risiko yang sifatnya eksternal dan sudah punya preseden jelas (Tokopedia, Lazada). Part VII menjawab kelas risiko yang berbeda: **kerapuhan internal** yang baru terasa setelah bertahun-tahun — data yang kehilangan konteks, dependency yang membusuk diam-diam, dan pengetahuan sistem yang terkunci di kepala segelintir orang. Kelas risiko ini tidak butuh insiden eksternal untuk terjadi — ia terjadi hanya karena waktu berjalan dan tim berganti.

**Aturan keras:** setiap bagian di 156–163 wajib punya jawaban konkret di kode/proses, bukan niat baik yang didokumentasikan lalu dilupakan — pola yang sama seperti penegakan DoC di Bagian 133.

---

# 156. PRESERVASI PAYLOAD MENTAH & KEMAMPUAN REPLAY

## 156.1 Masalah yang Belum Dijawab Rev 3/4

Bagian 117.2 mendefinisikan Unified Order Schema — hasil **parsing** dari payload API tiap marketplace. Yang tidak didefinisikan: **payload asli sebelum diparsing itu sendiri tidak disimpan.** Ini berarti begitu field mapping berubah (persis seperti kasus Tokopedia→TikTok Shop, Bagian 142), data lama yang sudah diproses **tidak bisa direkonstruksi ulang** — informasi yang tidak diserap ke Unified Schema saat itu hilang permanen, walau sebenarnya ada di payload asli.

## 156.2 Solusi

Setiap payload masuk (webhook maupun hasil polling) disimpan **utuh, tanpa diproses**, ke object storage (infrastruktur yang sudah ada sejak Fase 1 untuk backup, Bagian 128.1) sebelum diparsing:

```text
raw_payload_key: "raw/{channel}/{org_id}/{yyyy}/{mm}/{event_id}.json"
```

Referensi disimpan di tabel `sync_event_log` (Bagian 117.4, sudah ada) sebagai kolom tambahan `raw_payload_key`. Biaya penyimpanan objek JSON kecil sangat murah dibanding nilai forensik/audit yang didapat.

## 156.3 Kemampuan Replay

Job type baru `reprocess_raw_payload` (lewat `job_queue`, Bagian 128.3) yang mengambil raw payload lama dan menjalankan ulang field mapping **versi terbaru** terhadapnya. Ini memungkinkan:

- Perbaikan retroaktif saat ditemukan bug mapping tanpa perlu marketplace mengirim ulang data (yang seringkali sudah tidak mungkin secara API).
- Migrasi field mapping besar (seperti Bagian 142) dijalankan sebagai proses terkendali terhadap data historis, bukan hanya berlaku untuk data baru.

**Checklist DoC tambahan (melengkapi Bagian 137/148):**

- [ ] Setiap event masuk (webhook/polling) tersimpan sebagai raw payload sebelum diparsing, dibuktikan lewat test yang memverifikasi `raw_payload_key` selalu terisi.
- [ ] Job `reprocess_raw_payload` diuji menghasilkan Unified Order yang identik saat dijalankan terhadap payload yang mapping-nya belum berubah (regression safety).
- [ ] Retensi raw payload minimal mengikuti kewajiban retensi data keuangan yang berlaku (selaras kepatuhan pajak/audit) — bukan dihapus otomatis demi hemat storage.

---

# 157. CONNECTOR SEBAGAI EKOSISTEM PLUGIN, BUKAN HANYA DIBANGUN IN-HOUSE

## 157.1 Masalah Ketergantungan Tim Kecil

Bagian 147 sudah menyinggung evaluasi *build vs buy* untuk marketplace ekor panjang, tapi cakupannya baru soal keputusan proyek per proyek. Untuk ketahanan 10 tahun, masalah yang lebih mendasar adalah: **setiap connector yang dibangun in-house menambah beban maintenance permanen ke tim inti**, sementara jumlah marketplace/channel yang relevan terus bertambah (Bagian 145: potensi Instagram Shop dan channel social-commerce baru).

## 157.2 Solusi: Interface Connector sebagai Spesifikasi Publik

Interface `Connector` (Bagian 117.1) yang sudah didesain seragam secara arsitektur dijadikan **spesifikasi terdokumentasi secara publik/semi-publik** (bukan hanya kode internal), lengkap dengan contract test (Bagian 120.4) yang bisa dijalankan pihak ketiga terhadap implementasi mereka sendiri. Ini membuka jalan bagi:

- Partner/developer independen membangun dan memelihara connector marketplace niche yang di luar prioritas tim inti (mis. marketplace regional kecil, platform social-commerce baru).
- Beban monitoring changelog bulanan (Bagian 146) untuk connector non-prioritas bisa didistribusikan ke pemilik connector masing-masing, bukan menumpuk di tim inti yang jumlahnya tidak bertambah proporsional dengan jumlah marketplace.

## 157.3 Prioritas Implementasi

Ini **bukan** kebutuhan Phase 2 awal — connector inti (Shopee, Tokopedia/TikTok Shop, Lazada, Blibli, Bagian 143) tetap dibangun in-house karena prioritas dan kontrol kualitas. Model plugin publik masuk roadmap **setelah** Phase 2 stabil dan pola *build vs buy* (Bagian 147) mulai terasa nyata — ditandai oleh permintaan connector marketplace baru yang datang lebih cepat dari kapasitas tim inti untuk membangunnya.

---

# 158. ARCHITECTURE DECISION RECORDS (ADR)

## 158.1 Masalah

Dokumen ini (Rev 3–5) mencatat *apa* yang harus dibangun dan *checklist selesai*-nya, tapi tidak mencatat **alasan** di balik keputusan arsitektur non-obvious — mis. kenapa job queue pakai Postgres bukan library queue populer lain, kenapa primary key UUID bukan integer, kenapa realtime default SSE bukan WebSocket. Keputusan ini benar untuk konteks shared hosting (Bagian 128), tapi **tidak terlihat sengaja** bagi engineer baru yang bergabung bertahun-tahun kemudian — risiko nyata: keputusan yang sengaja dibuat untuk mengatasi constraint infrastruktur "dibenahi" oleh orang yang tidak tahu constraint itu pernah ada.

## 158.2 Solusi

Setiap keputusan arsitektur signifikan dicatat sebagai file pendek di `docs/adr/NNNN-judul-singkat.md`, format minimal:

```text
# ADR-0001: Job Queue di atas PostgreSQL, bukan Redis/BullMQ

Status: Diterima
Konteks: Fase 1 deploy di shared hosting tanpa Redis (Bagian 128.1)
Keputusan: Gunakan tabel job_queue dengan FOR UPDATE SKIP LOCKED (Bagian 128.3)
Konsekuensi: Throughput lebih rendah dari Redis, tapi tidak butuh infrastruktur
            tambahan. Migrasi ke Redis di Fase 2 dilakukan lewat swap
            QueueAdapter (Bagian 129.2), bukan rewrite.
Ditinjau ulang jika: threshold migrasi Bagian 129.1 tercapai
```

**Aturan:** PR yang mengubah keputusan arsitektur yang sudah punya ADR **wajib** menyertakan ADR baru yang mereferensikan dan menggantikan ADR lama (bukan menghapusnya) — jejak keputusan tetap utuh sebagai riwayat, selaras prinsip audit trail yang sudah dipakai di Bagian 118 untuk data keuangan.

---

# 159. KEBIJAKAN UPGRADE RUNTIME & DEPENDENCY TERJADWAL

## 159.1 Masalah

Bagian 130 mewajibkan pin ke versi Node.js LTS yang tersedia di panel hosting, tapi tidak menetapkan **siklus review**. Versi LTS Node.js kehilangan dukungan keamanan resmi sekitar tiap 30 bulan. Tanpa jadwal eksplisit, pola umum yang terjadi pada software UMKM lokal adalah: sistem berjalan tanpa upgrade selama bertahun-tahun sampai akhirnya terjebak di versi yang sudah mati total, dan upgrade yang seharusnya bertahap berubah menjadi proyek rewrite darurat.

## 159.2 Solusi: Siklus Review Terjadwal

| Item | Siklus Review | Aksi |
|---|---|---|
| Versi Node.js runtime | Setiap 12 bulan (bulan tetap, mis. Januari) | Cek versi LTS terbaru yang tersedia di panel hosting; upgrade jika ada versi baru dan tidak ada breaking change material |
| Dependency npm inti (framework, ORM, library keamanan) | Setiap 6 bulan | `npm audit` + review changelog major version; prioritaskan patch keamanan segera, di luar siklus terjadwal jika ada CVE kritis |
| PostgreSQL major version | Setiap 18–24 bulan, atau saat versi yang dipakai mendekati end-of-life resmi | Uji kompatibilitas di staging sebelum upgrade produksi |

Ini masuk sebagai item wajib di proses monitoring yang sudah ada (Bagian 146, pola job bulanan manusia+checklist) — bukan proses baru yang terpisah, cukup diperluas cakupannya dari "changelog marketplace" menjadi "changelog marketplace + runtime + dependency inti".

---

# 160. DATA PORTABILITY SEBAGAI FITUR PENGGUNA

## 160.1 Masalah

Bagian 128.1/128.4 mewajibkan backup ke object storage eksternal — tapi ini backup untuk **keamanan sistem**, bukan untuk **kepentingan pengguna**. Tidak ada fitur eksplisit bagi pengguna untuk mengekspor seluruh datanya sendiri kapan pun mereka mau.

## 160.2 Kenapa Ini Penting untuk Reachability dan Resilience Sekaligus

- **Reachability:** UMKM sering ragu mengadopsi software baru karena takut "data disandera" — kemampuan ekspor data kapan saja (tanpa perlu menghubungi CS) adalah sinyal kepercayaan yang menurunkan friksi adopsi, terutama bagi pengguna yang pernah punya pengalaman buruk dengan software lain.
- **Resilience:** untuk data keuangan, kepatuhan pajak/audit sering mensyaratkan data bisa diverifikasi independen dari sistem yang menghasilkannya. Sistem yang hanya bisa dibaca dari dalam aplikasinya sendiri adalah risiko kepatuhan jangka panjang bagi pengguna, yang pada akhirnya jadi risiko reputasi bagi AutoProfit.

## 160.3 Cakupan Minimal

- Endpoint self-serve (bukan hanya lewat CS/admin) untuk export seluruh data organisasi: order, item, jurnal, saldo akun, stok — dalam format terbuka (CSV per entitas + JSON gabungan) mengikuti Unified Order Schema (Bagian 117.2) dan COA (Bagian 118.1) yang sudah terdokumentasi.
- Diproses lewat `job_queue` (Bagian 128.3) sebagai job async — pola yang sama dengan export besar lain (Bagian 122.1) — hasil dikirim lewat notification (termasuk WhatsApp, Bagian 151) saat selesai.
- Tidak dibatasi tier — tersedia dari Starter (Bagian 154) sampai Enterprise, karena ini fitur kepercayaan, bukan fitur premium.

---

# 161. BUS FACTOR & CONTINUITY PLAN

## 161.1 Masalah

Seluruh Rev 3–4 fokus pada ketahanan **sistem**: infrastruktur, data, API. Tidak ada bagian yang membahas ketahanan **operasional** — risiko bahwa kompleksitas signifikan sistem ini (integritas akuntansi, keamanan multi-tenant, arsitektur adapter) mungkin sepenuhnya dipahami oleh hanya satu atau dua orang di tim. Ini adalah kelas risiko "bus factor" — istilah umum untuk "berapa orang yang harus tidak tersedia sebelum proyek berhenti berjalan".

## 161.2 Solusi: Runbook Operasional

Berbeda dari DoC (Bagian 133–139, fokus ke *kelengkapan modul*) dan ADR (Bagian 158, fokus ke *alasan keputusan*), runbook operasional menjawab pertanyaan: **"kalau orang kunci X tidak bisa dihubungi besok, siapa pun yang tersisa bisa melakukan apa?"**

Cakupan minimal runbook (`docs/runbook/`):

- Prosedur restore dari backup (Bagian 128.4, 128.8) — langkah konkret, bukan referensi ke "tanya orang yang biasa handle ini".
- Prosedur rotasi credential/secret (DB, object storage, marketplace App key) dan di mana credential itu tersimpan.
- Daftar dependency eksternal berbayar (Sentry, object storage, dst — Bagian 131) beserta siapa pemegang akun/billing.
- Kontak eskalasi tiap marketplace partner (Bagian 143/144) untuk kasus App suspended/rate limit darurat.
- Prosedur *onboarding engineer baru* minimal (yang dokumen ini sendiri, dari Bagian 1 sampai runbook ini, adalah bagian dari materi wajib baca — Bagian 162 memperbarui daftar itu).

## 161.3 Prinsip

Runbook **bukan dokumentasi arsitektur** (itu tugas PRD dan ADR) — runbook adalah **daftar langkah operasional literal** yang bisa diikuti orang dengan pengetahuan minimal tentang sistem ini, dalam situasi darurat. Ditinjau ulang setiap kali ada perubahan infrastruktur besar (mis. migrasi cloud, Bagian 129) atau pergantian personel kunci.

---

# 162. REVISI FINAL STATUS — URUTAN BACA WAJIB (REV 5)

Melengkapi urutan baca Rev 4 (bagian akhir dokumen Rev 4):

15. **Bagian 150–154** — reachability, dibaca oleh siapa pun yang merancang onboarding, pricing, atau kanal akses baru, sebelum fitur pengguna-facing apa pun dirancang.
16. **Bagian 155–161** — ketahanan jangka panjang di luar lapisan API, dibaca oleh tech lead sebagai pelengkap Bagian 127 (adapter layer) dan Part V — keduanya sama-sama soal "sistem ini harus tetap hidup 5–10 tahun", tapi dari sisi yang berbeda: Part V dari sisi eksternal (API berubah), Part VII dari sisi internal (data, dependency, orang).
17. **Bagian 158 (ADR)** mulai berlaku **sejak Phase 0** — bukan ditambahkan belakangan setelah sistem sudah kompleks, karena nilainya justru paling tinggi untuk keputusan-keputusan awal yang paling mudah disalahpahami di kemudian hari.

---

# 163. REVISI BAGIAN 140 — PHASE BUILD (DENGAN GATE REACHABILITY & CONTINUITY)

```text
PHASE 0 — FOUNDATION + DEPLOYMENT SKELETON
  (tetap seperti Rev 4) DAN:
  - NotificationChannel interface generik (151.2) disiapkan sejak awal,
    meski hanya in_app yang diimplementasi penuh.
  - ADR (158) mulai dipakai sejak keputusan arsitektur pertama.
  ⛔ Gate: Bagian 138 (DoC Auth & Multi-Tenancy) tetap seperti Rev 4.

PHASE 1 — CORE COMMERCE
  (tetap seperti Rev 4) DAN:
  - Raw payload preservation (156) wajib aktif sejak connector pertama
    dibangun di Phase 2, bukan ditambahkan belakangan setelah ada insiden.
  - Wizard onboarding & template COA per industri (153) dibangun paralel
    dengan dashboard, karena keduanya sama-sama gate menuju "nilai pertama
    yang dirasakan pengguna" (150).

PHASE 2 — MARKETPLACE
  (tetap seperti Rev 4, termasuk gate Bagian 137/148) DAN:
  - Setiap connector baru wajib menyimpan raw payload (156.3) sebagai
    bagian dari DoC, bukan pekerjaan tambahan opsional.

PHASE 3 — FINANCE
  (tetap seperti Rev 4, gate paling ketat tidak berubah)

PHASE 4–7 (tetap seperti Rev 4)

PHASE 8 — WHATSAPP
  Direvisi: kemampuan P0 (notifikasi + query read-only, 151.3) TIDAK
  menunggu urutan phase — boleh dan sebaiknya dikerjakan lebih awal
  begitu NotificationChannel interface (151.2) dan dashboard_summary_daily
  (128.6) tersedia, yaitu setelah Phase 1 selesai. Kemampuan P1/P2 tetap
  di urutan Phase 8 seperti semula.

PHASE 9 — ADVANCED

CONTINUITY TRACK (baru, berjalan paralel sejak Phase 0, bukan phase
tersendiri):
  - Runbook operasional (161) mulai ditulis sejak infrastruktur pertama
    live, diperbarui tiap ada perubahan besar.
  - Siklus review upgrade runtime/dependency (159) mulai berjalan
    12 bulan setelah GA pertama.
  - Data portability endpoint (160) masuk sebagai bagian dari Phase 1
    (Core Commerce) — bukan fitur belakangan, karena nilainya sebagai
    sinyal kepercayaan paling tinggi justru di awal adopsi pengguna.
```

---

# 164. REVISI BAGIAN 141/149 — READINESS SCORECARD (REV 5)

| # | Area | Skor Rev 4 | Skor Rev 5 | Perbaikan Kunci |
|---|---|---|---|---|
| 1–18 | (seluruh area Rev 3/4) | ≈ 8.6/10 | tetap ≥ 8/10 | tidak berubah, tetap berlaku |
| 19 | **Reachability (jarak pengguna ke nilai pertama)** | tidak dinilai di Rev 4 | 8.5/10 | Bagian 150–154: WhatsApp sebagai kanal paralel sejak Phase 0, PWA bukan native di awal, onboarding self-serve dengan template COA per industri, tier gratis selaras threshold Bagian 129.1. Sisa 1.5 poin: metrik reachability (target <10 menit ke nilai pertama, Bagian 153.2) baru bisa divalidasi dengan data pengguna nyata, bukan hanya desain |
| 20 | **Long-Term Continuity (ketahanan di luar lapisan API)** | tidak dinilai di Rev 4 | 8/10 | Bagian 155–161: raw payload preservation & replay, connector sebagai ekosistem plugin, ADR, siklus upgrade terjadwal, data portability, runbook operasional. Sisa 2 poin: efektivitas runbook dan ADR hanya terbukti saat benar-benar diuji dalam situasi nyata (pergantian personel, insiden darurat), bukan saat masih berupa proses di atas kertas |
| — | **Rata-rata keseluruhan Rev 5 (20 dimensi)** | — | **≈ 8.65/10** | ✅ Build-ready, Deploy-ready, Completion-enforced, **dan** Reach-ready **dan** Longevity-ready |

**Kesimpulan Rev 5:** Rev 3 menjawab *apa yang dibangun*. Rev 4 menjawab *di mana ini benar-benar bisa jalan* dan *bagaimana tim tahu sebuah modul sungguh selesai*. Rev 5 menjawab dua pertanyaan terakhir yang menentukan keberhasilan jangka panjang sebagai produk, bukan hanya sebagai sistem: *bagaimana pengguna sasaran benar-benar sampai dan tetap memakai sistem ini* (Part VI), dan *bagaimana sistem ini tetap bisa dirawat dan dipercaya 5–10 tahun dari sekarang, oleh tim yang mungkin sudah sepenuhnya berbeda* (Part VII).

---

*AutoProfit PRD — Revisi 5. Menambahkan strategi reachability (WhatsApp, PWA, onboarding self-serve, tier gratis) dan ketahanan 10 tahun di luar lapisan API marketplace (raw payload replay, ekosistem connector, ADR, siklus upgrade, data portability, continuity plan) di atas fondasi Rev 3 (build-ready), Rev 4 (deploy-ready, completion-enforced), dan Part V (5-year API resilience).*

---

# IMPLEMENTATION ADDENDUM — REV 5.1
# MARKET VALIDATION, BEACHHEAD, DAN PRODUCT MOAT

**Status:** Addendum requirement strategis — berlaku sebagai pelengkap Rev 5
**Tujuan:** Memastikan AutoProfit dibangun untuk segmen yang benar, menyelesaikan masalah yang mahal, dipakai berulang, dan memperoleh keunggulan yang semakin kuat dari data serta workflow yang terbukti.
**Batas:** Addendum ini tidak menambah Phase 26, tidak mengubah domain menjadi khusus fashion, dan tidak menggantikan technical gate. Ia menambahkan market gate dan evidence requirement lintas phase.

## 165. STRATEGI BEACHHEAD DAN BATAS ARSITEKTUR

### 165.1 Beachhead awal

Validasi komersial awal harus fokus pada **seller fashion dan aksesoris lokal** yang:

- berjualan di Shopee dan/atau TikTok Shop;
- memiliki sekitar 300–3.000 order per bulan;
- memiliki puluhan hingga ratusan SKU aktif, termasuk variasi ukuran, warna, atau model;
- dikelola oleh tim kecil berisi 2–10 orang;
- mengalami perbedaan antara omzet, saldo marketplace, dan uang yang diterima;
- masih menyimpan COGS di spreadsheet atau memiliki COGS yang tidak lengkap;
- terdampak retur, pembatalan, fee marketplace, dan biaya iklan;
- sudah terlalu kompleks untuk spreadsheet, tetapi belum siap menggunakan ERP besar.

Fashion dan aksesoris dipilih sebagai **beachhead**, bukan sebagai batas pasar permanen, karena kepadatan masalahnya tinggi: variasi SKU, risiko inventory, kebutuhan COGS per produk, retur, fee, multi-channel, serta keputusan stok dan pembelian yang cepat.

Kategori F&B, beauty, elektronik, distributor, dan kategori lain tetap harus didukung oleh arsitektur generic/extensible. Ekspansi kategori dilakukan setelah market gate beachhead menghasilkan bukti yang cukup.

### 165.2 Pemisahan strategi pasar dan desain teknis

| Area | Keputusan |
|---|---|
| Arsitektur/domain/data model | Generic dan extensible; tidak boleh hard-code fashion |
| Onboarding | Template pertama: Fashion & Aksesoris |
| Copy dan UX awal | Bahasa serta contoh yang relevan dengan seller fashion |
| COA/costing defaults | Template fashion; mapping tetap configurable |
| Pilot dan validasi | Fokus seller fashion/aksesoris |
| Ekspansi kategori | Setelah metric beachhead lulus dan keputusan segment dicatat |

Template industri hanya mengatur default, progressive disclosure, dan contoh. Ia tidak boleh mengubah source of truth, tenant boundary, accounting invariant, atau connector contract.

## 166. VALIDASI MASALAH DAN PILOT DATA NYATA

### 166.1 Tahap C0 — Problem validation

Sebelum produk dianggap siap diperluas dari beachhead:

- dilakukan minimal **15 wawancara** dengan seller target;
- dilakukan minimal **5 sesi observasi proses kerja nyata**, bukan wawancara saja;
- minimal **3 seller** bersedia memberikan data historis atau mengikuti pilot;
- setiap sesi menghasilkan baseline yang tercatat:
  - waktu membuat laporan;
  - sumber data yang digunakan;
  - cara mencocokkan settlement dengan rekening bank;
  - jumlah dan jenis discrepancy;
  - cara menghitung COGS;
  - keputusan yang tertunda karena data tidak tersedia.

Pertanyaan validasi harus berfokus pada perilaku dan kerugian nyata, misalnya: kapan terakhir profit ternyata salah, berapa lama menutup laporan, bagaimana saldo marketplace dicocokkan ke bank, siapa yang mengerjakan, dan berapa keputusan pembelian tertunda karena stok tidak dipercaya. Ketertarikan verbal atau jumlah signup bukan evidence utama.

### 166.2 Tahap C2 — Pilot commerce dan profit

Pilot bukan demo. Setiap bisnis pilot harus menggunakan pekerjaan nyata selama minimal **30 hari** dan:

- memakai minimal satu connector marketplace nyata dan satu jalur import resmi;
- melihat profit dan menelusuri angka sampai sumbernya;
- memeriksa stok;
- mencocokkan settlement;
- memperbaiki COGS;
- mengambil setidaknya satu keputusan pembelian atau harga menggunakan data sistem.

Semua data yang gagal dipetakan wajib tampil sebagai exception yang dapat ditindaklanjuti. Payload/order tidak boleh hilang diam-diam.

## 167. MARKET GATE DAN TARGET VALIDASI

Angka di bawah adalah **hipotesis target awal**, bukan klaim hasil. Setelah 3–5 pilot, baseline aktual boleh menggantikan target dengan keputusan yang terdokumentasi.

| Area | Metrik | Target awal |
|---|---|---:|
| First value | Signup/import sampai angka yang dapat ditelusuri | Median ≤10 menit untuk import/sandbox |
| Onboarding live | Sampai channel nyata menghasilkan data pertama | ≤30 menit, di luar delay approval provider |
| Self-serve | Pilot menyelesaikan onboarding tanpa bantuan teknis | ≥80% |
| Data coverage | Order terpetakan ke unified schema | ≥95% pada beachhead |
| Data honesty | Data tidak termap ditampilkan sebagai exception | 100% terlihat |
| Silent loss | Payload/order hilang tanpa error/exception | 0 |
| COGS readiness | SKU aktif dengan COGS terverifikasi | ≥90% setelah onboarding |
| Profit trust | Angka dashboard memiliki source reference | 100% |
| Time saved | Pengurangan waktu laporan/reconciliation dari baseline | ≥50% atau ≥4 jam/minggu |
| Reconciliation | Discrepancy memiliki alasan/status yang dapat ditelusuri | 100% |
| Weekly usage | Bisnis pilot aktif setiap minggu | ≥70% cohort |
| Retention | Bisnis aktif setelah 8 minggu | Target awal ≥50% |
| Willingness to pay | Pilot bersedia membayar/menandatangani komitmen berbayar | ≥2 dari 3 pilot |

Metrik yang **tidak boleh** dipakai sebagai bukti utama: signup, jumlah koneksi marketplace, jumlah halaman/fitur, jumlah pertanyaan AI, jumlah event analytics, atau volume import tanpa ukuran kualitas hasil. North Star tetap **meaningful business decisions assisted**, dengan evidence tindakan dan hasilnya.

## 168. MOAT YANG DIBANGUN DARI AKURASI, HISTORI, WORKFLOW, DAN TRUST

Moat AutoProfit tidak boleh bergantung pada jumlah fitur atau lock-in paksa. Ia dibangun dari:

### 168.1 Normalized commerce dan settlement dataset

Connector harus mengumpulkan metadata terstruktur mengenai format order, fee, shipping, settlement, return, adjustment, ads fee, status, perubahan schema, error, dan edge case.

Metric operasional yang perlu tersedia: mapping coverage, jumlah unknown field, mapping correction, waktu pemulihan setelah API berubah, jumlah payload yang dapat di-replay, konsistensi hasil replay, dan jumlah mapping version yang telah terbukti pada data nyata.

### 168.2 Costing dan COGS intelligence

Sistem membantu meningkatkan kualitas COGS, bukan sekadar membuat kolom terlihat lengkap. Metric: coverage COGS, umur data, SKU yang masih memakai estimasi, selisih estimated vs actual profit, waktu memperbaiki COGS, dan keputusan pembelian yang menggunakan costing.

**Aturan keras:** estimated COGS wajib dibedakan jelas dari actual COGS. Sistem tidak boleh mengisi angka estimasi secara diam-diam demi membuat profit terlihat lengkap.

### 168.3 Reconciliation workflow

Nilai moat bukan sekadar import settlement, tetapi kemampuan menjawab mengapa uang yang diterima berbeda dari yang seharusnya. Metric: auto-match rate, exception rate, median resolution time, discrepancy yang ditemukan, nilai rupiah yang dijelaskan, duplicate settlement, journal correction, dan resolution yang dapat diaudit.

### 168.4 Daily operating habit

Loop penggunaan yang ingin dibangun:

1. cek Business Snapshot;
2. cek stok rendah;
3. cek order bermasalah;
4. cek settlement exception;
5. cek profit per channel;
6. menyetujui atau menindaklanjuti rekomendasi.

Metric: weekly active business, hari aktif per minggu, dashboard-to-action conversion, alert-to-resolution rate, return setelah exception, dan jumlah keputusan bisnis yang dibantu sistem.

### 168.5 Trust sebagai moat

Setiap angka harus memiliki source reference; perubahan sensitif harus diaudit; user dapat mengekspor data; raw payload dapat di-replay; error ditampilkan jelas; data tidak dihapus hanya agar laporan terlihat baik. Trust dibangun melalui transparansi dan portability, bukan penyanderaan data.

## 169. HUBUNGAN MARKET GATE DENGAN TECHNICAL GATE

Market gate tidak menggantikan Definition of Done/Complete teknis:

- modul accounting dapat lulus invariant debit=credit tanpa berarti produk telah membuktikan nilai bisnis;
- connector dapat lulus contract fixture tanpa berarti capability production aktif tanpa credential/approval;
- entitlement dan metering dapat Complete tanpa provider, tetapi paid collection tetap `BLOCKED` sampai provider dan reconciliation terbukti;
- GA tidak boleh diklaim hanya karena seluruh halaman dan test teknis lulus.

P24/GA wajib memiliki market evidence: minimal tiga bisnis nyata yang sesuai beachhead/persona, bukti time-to-value, data coverage, penggunaan berulang, problem resolution, known limitation, support readiness, dan evidence willingness to pay.

## 170. KEPUTUSAN SETELAH PILOT

### 170.1 Lanjutkan dan perluas

Dipilih bila minimal 2 dari 3 pilot memakai produk setiap minggu, angka utama dipercaya dan dapat ditelusuri, waktu reconciliation berkurang signifikan, discrepancy baru dapat ditemukan, sebagian pilot bersedia membayar, dan tidak ada blocker besar pada data coverage.

### 170.2 Persempit kembali

Dipilih bila user menyukai dashboard tetapi tidak melakukan tindakan, onboarding hanya berhasil dengan bantuan manual, profit tidak dipercaya karena COGS tidak lengkap, connector menghasilkan terlalu banyak exception, atau pemakaian hanya terjadi saat diminta tim AutoProfit.

### 170.3 Pivot

Dipertimbangkan bila masalah utama bukan profit/reconciliation, seller lebih membutuhkan order operations, willingness to pay rendah walau pain diakui, fashion tidak memiliki pain yang cukup kuat, atau nilai terbesar terbukti ada pada segmen lain seperti distributor, beauty, atau F&B.

Setiap keputusan harus menyimpan evidence, perubahan hipotesis, dampak terhadap scope, dan keputusan segment berikutnya. Tidak boleh memperluas kategori hanya karena permintaan fitur tanpa evidence penggunaan dan nilai.

## 171. REVISI REQUIREMENT YANG BERLAKU

1. **Beachhead fashion/aksesoris** menjadi fokus validasi, onboarding, contoh UX, template COA/costing, dan pilot awal; arsitektur tetap generic.
2. **Commercial Validation & Moat Track C0–C4** berjalan paralel dengan Phase P00–P24; tidak ada Phase 26.
3. **100% data honesty, 0 silent loss, source reference pada angka, estimated-vs-actual COGS, raw payload replay, export, dan audit** menjadi requirement lintas domain.
4. **P24 GA** memerlukan market gate selain technical/security/UAT gate.
5. Angka target Bagian 167 adalah hipotesis yang harus diukur, bukan data yang boleh di-hardcode atau diklaim sudah terbukti.
