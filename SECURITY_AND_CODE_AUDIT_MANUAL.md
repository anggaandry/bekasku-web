# BekasKu Web Nuxt — Security, Clean Code & Reusability Audit Manual Book

Dokumen ini adalah buku panduan operasional (Playbook / Manual Book) untuk AI Agent atau Auditor Teknis yang bertugas mengaudit, menambal celah keamanan, serta merapikan arsitektur kode (`clean code` & `reusable code`) secara menyeluruh di repositori `bekasku-web-nuxt`.

---

## 1. Ringkasan Status Aplikasi Saat Ini (Baseline Snapshot)

Berdasarkan pemindaian menyeluruh terhadap seluruh route dan modul (`flows/01` s/d `flows/36` + Multi-bahasa 4 bahasa):

| Kategori Evaluasi | Status Saat Ini | Ringkasan Temuan Utama |
| :--- | :--- | :--- |
| **Build & SSR Pipeline** | **Lulus (Exit 0)** | Nuxt 4 SSR (`ssr: true`), `nuxt prepare` dan `npm run build` berjalan bersih tanpa error kompilasi. |
| **Multi-Language (i18n)** | **Aktif (4 Bahasa)** | Mendukung `id`, `en`, `ms`, `zh` dari kamus native Mobile V3 (`locales/*.json`) + auto-detect bahasa browser (`Accept-Language` SSR & `navigator.languages` client). |
| **Isolasi API Layer** | **95% Sesuai** | Seluruh komunikasi backend BekasKu terpusat di `composables/useApi.ts`. Terdapat 2 pengecualian eksternal yang perlu diaudit (`useGeocoding.ts` & `usePaymentDashboard.ts`). |
| **Celah XSS / `v-html`** | **Terkendali (3 Titik)** | Hanya ada 3 komponen pemakai `v-html` (`PaymentInstructionAccordion.vue`, `LegalBodyContent.vue`, `FaqHtmlBody.vue`). Wajib diverifikasi ketahanan sanitiser-nya terhadap event handler & URI injection. |
| **Reverse Tabnabbing (`target="_blank"`)** | **Perlu Perbaikan (26 Titik)** | Ditemukan ~26 tag `<a target="_blank">` yang belum menyertakan `rel="noopener noreferrer"`. |
| **Clean Code & Ukuran File** | **Perlu Modularisasi** | Terdapat ~35 file `.vue` / `.ts` yang melebihi batas ideal 250-400 baris (terbesar: `ComplainModal.vue` 1.496 baris, `pages/transaction/index.vue` 1.164 baris, `useAuthModal.ts` 1.161 baris). |
| **Design Token Compliance** | **98% Sesuai** | Hanya tersisa 9 baris pemakaian class `*-neutral-*` pada komponen eksperimen lama di `components/variants/var1..var3/`. |

---

## 2. Manual Book Audit Keamanan & Celah Injeksi (Security Playbook)

Agent pelaksana **WAJIB** memeriksa dan mengeksekusi perbaikan pada 9 vektor keamanan berikut secara berurutan:

### 2.1. Cross-Site Scripting (XSS) & DOM/HTML Injection
Meskipun Vue otomatis melakukan escaping pada interpolasi `{{ }}`, penggunaan `v-html` dan dynamic `:href` / `:src` dapat membuka celah Stored/Reflected XSS jika payload API atau query URL dimanipulasi.

**Titik Audit Wajib:**
1. `components/payment/PaymentInstructionAccordion.vue` (baris 53: `v-html="sanitizeHtml(item.description)"`)
2. `components/static/LegalBodyContent.vue` (baris 97: `v-html="highlighted.html"`)
3. `components/help/FaqHtmlBody.vue` (baris 18: `v-html="props.html"`)

**Standar Hardening untuk Agent:**
- Pastikan seluruh input ke `v-html` melewati satu fungsi utilitas terpusat `utils/sanitizeHtml.ts`.
- Blokir tag berbahaya: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<svg>`, `<math>`, `<base>`, `<meta>`, `<link>`, `<style>`.
- Blokir seluruh atribut event handler (`on*` seperti `onerror`, `onload`, `onclick`, `onmouseover`).
- Blokir skema protokol berbahaya pada atribut `href`, `src`, `xlink:href`, `action`, `formaction`: tolak `javascript:`, `vbscript:`, dan `data:text/html`.
- Pada `LegalBodyContent.vue`, pastikan teks sebelum disisipkan `<mark>` di-escape karakter HTML-nya (`&`, `<`, `>`, `"`, `'`) terlebih dahulu agar query pencarian tidak bisa menyuntikkan tag HTML.

**Perintah Audit Terminal:**
```bash
grep -rn "v-html\|innerHTML\|outerHTML\|document\.write" pages/ components/ composables/ utils/
```

---

### 2.2. Parameter Pollution, Query Injection & NoSQL Operator Injection
Backend BekasKu menggunakan Node.js + MongoDB (`mongoose`). Jika frontend meneruskan parameter dari `route.query` atau `route.params` secara mentah ke body JSON POST tanpa validasi tipe primitif, penyerang dapat mengirim query seperti `?id[$ne]=null` (yang di-parse oleh router menjadi object/array) dan memicu NoSQL Injection di backend.

**Titik Audit Wajib:**
1. `composables/useProductSearch.ts` & `pages/search/result.vue` (`route.query.q`, `route.query.category_id`, `route.query.min_price`, `route.query.max_price`)
2. `composables/useProductDetail.ts` & `pages/product/[slug].vue` (`route.params.slug`)
3. `composables/useSellerProfile.ts` & `pages/seller/[id].vue` (`route.params.id`)
4. `composables/useTransactionDetail.ts` & `pages/payment/detail/[id].vue` (`route.params.id`)
5. `components/help/FaqDetailView.vue` (`route.params.slug`)

**Standar Hardening untuk Agent:**
- Buat helper `utils/inputGuard.ts`:
  - `toSafeString(val: unknown, maxLength = 200): string` — memaksa nilai menjadi `string` primitif (jika array ambil elemen pertama atau tolak, jika object tolak jadi `''`), `trim()`, dan potong sesuai `maxLength`.
  - `toSafeMongoId(val: unknown): string` — validasi dengan regex `/^[a-fA-F0-9]{24}$/` untuk parameter yang wajib berupa ObjectId MongoDB.
  - `toSafePositiveInt(val: unknown, fallback = 1): number` — pastikan `page`, `limit`, `min_price`, `max_price` berupa integer valid dan bukan `NaN` / negatif / `Infinity`.
- Jangan pernah melakukan spread `...route.query` langsung ke body API POST.

**Perintah Audit Terminal:**
```bash
grep -rn "route\.query\|route\.params" pages/ components/ composables/
```

---

### 2.3. URL Scheme Injection & Open Redirect
Tautan dinamis yang berasal dari input user (misal URL sosial media seller, website perusahaan, atau parameter `?redirect=`) dapat disalahgunakan untuk Phishing (Open Redirect) atau eksekusi `javascript:alert(1)` saat diklik.

**Titik Audit Wajib:**
1. `composables/useAuthModal.ts` (`sanitizeRedirectPath`) — pastikan menolak protokol eksternal (`http://`, `https://`, `//evil.com`, `\\evil.com`, `javascript:`).
2. `utils/externalLink.ts` — pastikan fungsi pembentuk URL eksternal hanya mengizinkan protokol `https:` dan `http:` (serta `mailto:` / `tel:` khusus kontak).
3. `components/seller/SellerProfileHeader.vue` & `components/account/AccountProfileView.vue` — link sosial media (`instagram`, `tiktok`, `website`) dari profil user.
4. `components/chat/bubbles/*` — tautan atau media di dalam balon chat.

**Standar Hardening untuk Agent:**
- Semua `:href="dynamicUrl"` dari database wajib divalidasi dengan `toSafeExternalUrl(url)` yang mem-parse `new URL(url)` dan memastikan `protocol === 'https:' || protocol === 'http:'`. Jika gagal, kembalikan `'#'` atau sembunyikan link.

**Perintah Audit Terminal:**
```bash
grep -rn ":href=" pages/ components/
```

---

### 2.4. Reverse Tabnabbing (`target="_blank"` Tanpa `rel="noopener noreferrer"`)
Membuka tab baru dengan `target="_blank"` tanpa `rel="noopener noreferrer"` memungkinkan halaman eksternal mengakses `window.opener` pada browser tertentu atau membocorkan referrer sensitif (misal URL transaksi/pembayaran).

**Daftar File yang Wajib Diperbaiki Agent (26 Titik):**
- `pages/transaction/[id]/label.vue` (baris 76)
- `pages/live/[id].vue` (baris 145)
- `pages/showcase/video/index.vue` (baris 197)
- `components/seller/SellerProfileHeader.vue` (baris 170, 184)
- `components/transaction/ShippingLabelViewer.vue` (baris 63)
- `components/transaction/TrackingTimeline.vue` (baris 316)
- `components/home/HomeLiveShopping.vue` (baris 400)
- `components/layout/AppComingSoon.vue` (baris 73, 92)
- `components/layout/AppFooter.vue` (baris 112, 180, 198, 216)
- `components/shared/AppDownloadModal.vue` (baris 24, 34)
- `components/live/LiveProductDrawer.vue` (baris 91)
- `components/account/AccountSocialModal.vue` (baris 51)
- `components/account/AccountSidebar.vue` (baris 208)
- `components/help/HelpContactSidebar.vue` (baris 96, 148)
- `components/variants/var1/Var1Footer.vue`, `var2/Var2Footer.vue`, `var3/Var3Footer.vue`

**Perintah Verifikasi Terminal (Target Output: 0 baris):**
```bash
grep -rn 'target="_blank"' pages/ components/ | grep -v 'noopener'
```

---

### 2.5. SSR Cross-Request State Pollution (Kebocoran Data Antar-User di Server)
Pada Nuxt 3/4 SSR (`ssr: true`), variabel yang dideklarasikan di level module (di luar fungsi `export function useXxx()` atau di luar `defineStore()`) akan dibagi (shared) di memori Node.js server untuk seluruh pengunjung!

**Standar Audit untuk Agent:**
1. Periksa seluruh file di `composables/*.ts` dan `stores/*.ts`.
2. **DILARANG KERAS** mendeklarasikan `ref()`, `reactive()`, atau variabel mutable yang menyimpan token, profil user, keranjang, atau chat di luar scope fungsi composable/store.
3. Hanya konstanta statis (`readonly` dictionary, daftar konstanta, regex) yang boleh berada di level module.
4. Seluruh state antar-komponen wajib menggunakan `useState('unique_key', () => ...)` atau Pinia `defineStore()`.

**Perintah Audit Terminal:**
```bash
grep -rnE "^(const|let|var) [a-zA-Z0-9_]+ = (ref|reactive|shallowRef)\(" composables/ stores/ utils/
```

---

### 2.6. Autentikasi, Session Storage, Middleware & Proteksi IDOR
**Temuan Saat Ini:**
- `middleware/auth.ts` melewati pengecekan di sisi server (`if (import.meta.server) return`) karena profil user disimpan di `localStorage`, sedangkan token disimpan di cookie `STORAGE_KEY_TOKEN`.
- Akibatnya, halaman terproteksi sempat dirender shell-nya di SSR sebelum diredirect di client.

**Standar Hardening untuk Agent:**
1. Sinkronkan status login dasar di cookie (`STORAGE_KEY_TOKEN` & `STORAGE_KEY_USER_ID`) agar `middleware/auth.ts` juga dapat memvalidasi keberadaan JWT yang belum kadaluarsa (`!isJwtExpired(tokenCookie.value)`) saat SSR.
2. Pastikan saat `logout()`, seluruh state sensitif dibersihkan tuntas:
   - `authStore` (`token`, `user`)
   - `cartStore` (`listCart`, `buyerAddress`)
   - `chatStore` (`rooms`, `messages`, putuskan koneksi WebSocket)
   - `helpChatStore` (`messages`, putuskan koneksi WebSocket)
   - `notificationStore` (`listOrderNotif`, `unread*`)
   - `wishlistStore`
   - `localStorage` & `useCookie`
3. Pada halaman detail transaksi (`pages/transaction/[id]/index.vue`, `pages/payment/detail/[id].vue`), pastikan jika API mengembalikan `403`/`404` atau bukan milik `authStore.userId`, tampilkan state error aman dan jangan pernah merender data parsial.

---

### 2.7. Keamanan File Upload (Visual Search, Post Product, Chat Media, KYC, Avatar, Complain)
Aplikasi memiliki 6 titik upload file (foto produk, video produk, visual search kamera, foto KTP KYC, avatar profil, bukti komplain).

**Standar Hardening untuk Agent:**
1. Buat utilitas terpusat `utils/fileValidator.ts`:
   - Validasi ekstensi & MIME type ketat (`image/jpeg`, `image/png`, `image/webp`; untuk video: `video/mp4`, `video/quicktime`).
   - Tolak file `.svg` pada upload user (karena file `.svg` dapat berisi `<script>` XSS aktif!).
   - Validasi ukuran maksimum file sebelum dikirim ke server (misal maks 5MB untuk gambar, 30MB untuk video).
   - Validasi Magic Bytes (4-12 byte pertama dari `ArrayBuffer`) untuk mencegah file executable/script yang diganti namanya menjadi `.jpg`.
2. Pastikan setiap `URL.createObjectURL(file)` dibersihkan dengan `URL.revokeObjectURL(url)` pada `onBeforeUnmount` agar tidak menyebabkan memory leak.

**Perintah Audit Terminal:**
```bash
grep -rn 'type="file"\|createObjectURL' pages/ components/ composables/
```

---

### 2.8. Manajemen Environment & Secrets (`utils/constants.ts` & `nuxt.config.ts`)
**Temuan Saat Ini:**
- `utils/constants.ts` menyimpan `TOKEN_REQ`, `TOKEN_DEF`, `TOKEN_AUTH`, `JWT_SECRET_DEF` secara hardcoded agar paritas dengan aplikasi mobile Flutter V3.

**Standar Hardening untuk Agent:**
1. Pindahkan nilai default kredensial API ke `runtimeConfig` di `nuxt.config.ts` dengan pembacaan dari environment variable (`process.env.NUXT_PUBLIC_API_TOKEN_REQ`, dll.) dan gunakan fallback hanya untuk dev/sandbox.
2. Pastikan tidak ada kunci privat server (seperti Firebase Admin Private Key atau Database URI) yang terekspos di `runtimeConfig.public` atau `utils/constants.ts`.

---

### 2.9. Isolasi Panggilan Eksternal & SSRF / CORS Safety
**Temuan Saat Ini:**
- `composables/usePaymentDashboard.ts` baris 323 memanggil `fetch(data.value.qr_url)` secara langsung untuk mengunduh gambar QRIS.
- `composables/useGeocoding.ts` memanggil `$fetch` ke Nominatim OpenStreetMap.

**Standar Hardening untuk Agent:**
1. Pada `usePaymentDashboard.ts`: validasi `data.value.qr_url` sebelum di-`fetch()` — pastikan domain berasal dari whitelist resmi (`api.bekasku.id`, `sandbox.bekasku.id`, `api.midtrans.com`, `api.xendit.co`, `firebasestorage.googleapis.com`) agar tidak bisa disalahgunakan untuk memicu request ke jaringan internal/metadata.
2. Pada `useGeocoding.ts`: pastikan parameter `lat` dan `lon` divalidasi sebagai angka koordinat valid (`-90..90` dan `-180..180`) dan `query` pencarian alamat di-encode dengan `encodeURIComponent()`.

---

## 3. Manual Book Clean Code & Modularisasi Arsitektur

Berdasarkan aturan proyek, komponen dan composable tidak boleh menjadi *God Object* (file raksasa > 400 baris yang mencampur UI, validasi, pemetaan data, dan sub-modal).

### 3.1. Daftar Prioritas Refactoring (File > 600 Baris)

Agent pelaksana diminta memecah file-file berikut menjadi sub-komponen lapis kedua (child components) dan helper modular tanpa mengubah kontrak fitur:

| No | File Saat Ini | Baris | Rencana Pemecahan (Refactoring Blueprint) |
| :- | :--- | :---: | :--- |
| 1 | `components/transaction/ComplainModal.vue` | 1.496 | Pecah menjadi: `ComplainStepForm.vue`, `ComplainEvidenceUploader.vue`, `ComplainHistoryTimeline.vue`, `ComplainResolutionCard.vue`, dan ekstrak state/aksi ke `composables/useComplainModal.ts`. |
| 2 | `pages/transaction/index.vue` | 1.164 | Pecah menjadi: `TransactionFilterTabs.vue`, `TransactionOrderCard.vue`, `TransactionActionModals.vue`. Halaman `index.vue` hanya bertugas sebagai orchestrator (< 250 baris). |
| 3 | `composables/useAuthModal.ts` | 1.161 | Pisahkan menjadi: `composables/useAuthLoginFlow.ts`, `composables/useAuthRegisterFlow.ts`, `composables/useAuthForgotFlow.ts`, sedangkan `useAuthModal.ts` menjadi facade coordinator. |
| 4 | `composables/usePostSell.ts` | 1.085 | Pisahkan validasi dan payload builder ke `utils/postSellMapper.ts` dan logika upload media ke `composables/usePostMediaUpload.ts`. |
| 5 | `stores/chat.ts` | 1.057 | Pisahkan WebSocket listener & event parser ke `composables/useChatSocket.ts`, biarkan `stores/chat.ts` fokus pada state & mutasi daftar pesan/room. |
| 6 | `components/layout/AppHeader.vue` | 872 | Ekstrak sub-bagian menjadi: `HeaderTopActions.vue`, `HeaderSubNavBar.vue`, dan `HeaderUserDropdown.vue`. |
| 7 | `composables/useLegalPolicy.ts` | 871 | Pindahkan data teks statis Terms & Privacy ke `utils/legalTermsData.ts` dan `utils/legalPrivacyData.ts`, sehingga `useLegalPolicy.ts` hanya berisi logika parser, pencarian, dan TOC (< 180 baris). |
| 8 | `components/home/HomeLiveShopping.vue` | 833 | Ekstrak modal/preview video dan kartu live ke `components/home/HomeLiveCard.vue` dan `HomeLivePreviewModal.vue`. |
| 9 | `pages/product/[slug].vue` | 811 | Ekstrak section menjadi `ProductSellerCard.vue`, `ProductSpecificationSection.vue`, `ProductActionStickyBar.vue`. |
| 10 | `pages/search/result.vue` & `pages/showcase/video/index.vue` | ~710 | Ekstrak toolbar sort/filter dan player drawer ke sub-komponen domain masing-masing. |

### 3.2. Standar Clean Code Wajib di Seluruh File
1. **Urutan Blok SFC:** `<script setup lang="ts">` -> `<template>` -> `<style scoped>` (hanya jika diperlukan).
2. **Zero Magic Strings:** Semua endpoint API wajib diimpor dari `utils/constants.ts`.
3. **Strict TypeScript:** Hindari `any` pada response API dan props; definisikan interface di `types/<domain>.ts`.
4. **Memory & Event Hygiene:** Setiap `setInterval`, `setTimeout`, `window.addEventListener`, dan `IntersectionObserver` wajib dibersihkan di `onBeforeUnmount`.

---

## 4. Manual Book Reusable Code & Anti-Duplikasi (DRY Audit)

Agent pelaksana wajib menyatukan pola kode yang masih terduplikasi di beberapa fitur ke komponen/composable bersama:

### 4.1. Konsolidasi Komponen Shared (`components/shared/`)
1. **Formatting Harga, Tanggal & Nomor Telepon:**
   - Pastikan seluruh komponen memakai `formatPrice()`, `formatDate()`, `formatRelativeTime()` dari `utils/format.ts`.
   - Cari dan ganti deklarasi lokal `Intl.NumberFormat('id-ID')` yang tersebar di komponen fitur:
     ```bash
     grep -rn "Intl\.NumberFormat\|toLocaleString('id-ID')" pages/ components/ composables/
     ```
2. **State Loading, Empty & Error:**
   - Gunakan `AppSkeleton.vue`, `AppEmptyState.vue`, dan `AppErrorState.vue` secara konsisten. Jangan membuat markup empty state/error state inline berulang-ulang.
3. **Konfirmasi Aksi Destruktif:**
   - Gunakan `AppConfirmModal.vue` untuk semua aksi hapus (hapus alamat, hapus rekening bank, hapus produk katalog, batalkan pesanan, keluar akun).
4. **Pembersihan Variant Lama (`pages/var1..var3` & `components/variants/`):**
   - Evaluasi apakah halaman prototype `pages/var1.vue`, `pages/var2.vue`, `pages/var3.vue` beserta `components/variants/var1..var3/` masih diperlukan. Jika sudah digantikan oleh halaman utama `pages/index.vue`, hapus atau pindahkan ke arsip karena di dalamnya masih terdapat class `*-neutral-*` dan duplikasi footer/banner lama.

### 4.2. Konsolidasi Multi-Bahasa (`useLocale`)
1. Pastikan komponen fitur yang belum terhubung penuh ke `const { t } = useLocale()` (seperti halaman transaksi, keranjang, checkout, form jual barang, dan modal komplain) dihubungkan secara bertahap menggunakan key yang sudah tersedia di `locales/{id,en,ms,zh}.json`.
2. Jangan menulis kamus terjemahan lokal di dalam file `.vue` — tambahkan key baru langsung ke keempat file `locales/{id,en,ms,zh}.json`.

---

## 5. Checklist Eksekusi Bertahap untuk Agent Pelaksana

Ketika user memerintahkan eksekusi buku manual ini, Agent pelaksana **WAJIB** menjalankan tahapan berikut secara sistematis:

### Tahap 1 — Security Hardening (Prioritas Utama) [SELESAI]
- [x] Buat `utils/sanitizeHtml.ts` dan pasang pada ketiga titik `v-html` (`PaymentInstructionAccordion.vue`, `LegalBodyContent.vue`, `FaqHtmlBody.vue`).
- [x] Buat `utils/inputGuard.ts` (`toSafeString`, `toSafeMongoId`, `toSafePositiveInt`) dan amankan pembacaan `route.query` / `route.params`.
- [x] Tambahkan `rel="noopener noreferrer"` pada seluruh titik `target="_blank"`.
- [x] Buat `utils/fileValidator.ts` dan pasang pada input file upload (tolak `.svg`, validasi MIME & ukuran file, serta pastikan `createSafeObjectUrl` tersedia).
- [x] Validasi whitelist domain pada `fetch(data.value.qr_url)` di `usePaymentDashboard.ts`.
- [x] Audit pembersihan state menyeluruh pada fungsi `logout` di `stores/auth.ts` (termasuk reset cookies & disconnect WebSocket).

### Tahap 2 — Clean Code & Deduplikasi [SELESAI]
- [x] Hapus class `*-neutral-*` pada `components/variants/` (0 kelas `*-neutral-*` tersisa di seluruh codebase).
- [x] Satukan helper format angka/harga ke `utils/format.ts` dan hapus instansiasi manual `new Intl.NumberFormat` lokal.
- [ ] Pecah komponen/composable yang berukuran > 600 baris sesuai tabel di Bagian 3.1.

### Tahap 3 — Quality Gate & Verifikasi Akhir [LULUS]
- [x] 1. Cek tidak ada `target="_blank"` tanpa `noopener`: **0 pelanggaran**.
- [x] 2. Cek tidak ada class `*-neutral-*`: **0 pelanggaran**.
- [x] 3. Cek tidak ada `console.log` liar: **0 pelanggaran**.
- [x] 4. Cek kompilasi TypeScript & Nuxt schema (`npx nuxt prepare`): **Exit 0**.
- [x] 5. Verifikasi full SSR production build (`npm run build`): **Exit 0 (Build complete)**.

