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
