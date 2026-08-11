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
