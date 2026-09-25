<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-['Poppins'] flex flex-col selection:bg-[#E31B23] selection:text-white">
    <!-- Sticky Top Navigation -->
    <header class="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img
              src="/images/icon_only.png"
              alt="Bekasku Icon"
              class="h-8 w-auto object-contain"
            />
            <span class="text-xl sm:text-2xl font-bold tracking-tight text-[#E31B23]">Bekasku</span>
          </NuxtLink>
          <span class="hidden sm:inline-block text-slate-300">/</span>
          <span class="hidden sm:inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {{ isEn ? 'Privacy Policy' : 'Kebijakan Privasi' }}
          </span>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Language Selector -->
          <div class="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              :class="[
                'px-2.5 py-1 rounded-md transition-colors',
                !isEn ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              ]"
              @click="setLanguage('id')"
            >
              ID
            </button>
            <button
              type="button"
              :class="[
                'px-2.5 py-1 rounded-md transition-colors',
                isEn ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              ]"
              @click="setLanguage('en')"
            >
              EN
            </button>
          </div>

          <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-[#991b1b] border border-red-200 hidden md:inline-block">
            v2.1.0
          </span>

          <NuxtLink
            to="/"
            class="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-[#E31B23] transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>{{ isEn ? 'Back' : 'Kembali' }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Header -->
    <div class="bg-gradient-to-b from-red-50/70 to-slate-50 border-b border-slate-200 py-10 sm:py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#E31B23] text-xs font-semibold uppercase tracking-wider">
          <Shield class="w-3.5 h-3.5" />
          {{ isEn ? 'Official Legal Document' : 'Dokumen Legal Resmi' }}
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
          {{ isEn ? 'Privacy Policy' : 'Kebijakan Privasi' }}
        </h1>
        <p class="text-slate-500 italic text-sm sm:text-base">
          {{ isEn ? 'Official Privacy Policy — Bekasku' : 'Privacy Policy — BEKASKU' }}
        </p>
        <p class="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          {{ isEn ? 'Preloved & New Goods Marketplace Platform • PT Jantaka Ladang Unggul' : 'Platform Jual Beli Barang Baru & Bekas • PT. Jantaka Ladang Unggul' }}
        </p>
        <div class="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span>{{ isEn ? 'Effective Date: ' : 'Berlaku Efektif: ' }}<strong>1 Januari 2025</strong></span>
          <span>&bull;</span>
          <span>{{ isEn ? 'Last Updated: ' : 'Pembaruan Terakhir: ' }}<strong>September 2026</strong></span>
        </div>
      </div>
    </div>

    <!-- Main Container with Sidebar Navigation -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Sidebar Navigation (Desktop) -->
        <aside class="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
          <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText class="w-4 h-4 text-[#E31B23]" />
              {{ isEn ? 'Table of Contents' : 'Daftar Isi Kebijakan' }}
            </h3>
            <nav class="space-y-1">
              <a
                v-for="(item, idx) in tableOfContents"
                :key="idx"
                :href="`#${item.id}`"
                class="block text-xs py-2 px-3 rounded-lg text-slate-600 hover:text-[#E31B23] hover:bg-red-50/60 font-medium transition-colors"
              >
                {{ item.title }}
              </a>
            </nav>
          </div>

          <div class="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
            <div class="flex items-center gap-1.5 font-bold text-[#E31B23]">
              <Info class="w-4 h-4" />
              <span>{{ isEn ? 'Data Protection Commitment' : 'Perlindungan Data (UU PDP)' }}</span>
            </div>
            <p class="leading-relaxed">
              {{ isEn
                ? 'All user data is managed in compliance with Law No. 27 of 2022 on Personal Data Protection (UU PDP) and Google Play Developer Policies.'
                : 'Seluruh data pengguna dilindungi sesuai Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) dan Standar Kebijakan Pengembang Google Play.'
              }}
            </p>
          </div>

          <!-- Account Deletion Quick Action Box -->
          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
            <div class="flex items-center gap-1.5 font-bold text-slate-800">
              <Trash2 class="w-4 h-4 text-red-600" />
              <span>{{ isEn ? 'Account & Data Deletion' : 'Penghapusan Akun & Data' }}</span>
            </div>
            <p class="leading-relaxed">
              {{ isEn
                ? 'Want to delete your account and associated personal data? You can request deletion directly via the app Profile Settings or by emailing info@bekasku.id.'
                : 'Ingin menghapus akun dan data pribadi Anda? Anda dapat melakukan penghapusan mandiri via Pengaturan Akun di aplikasi atau email ke info@bekasku.id.'
              }}
            </p>
          </div>
        </aside>

        <!-- Document Content Body -->
        <main class="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-10 leading-relaxed text-slate-700 text-sm">
          
          <!-- INDONESIAN CONTENT -->
          <template v-if="!isEn">
            <!-- Pendahuluan -->
            <section id="pendahuluan" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                PENDAHULUAN
              </h2>
              <p class="text-justify">
                PT Jantaka Ladang Unggul selaku pengelola platform digital <strong>BekasKu</strong> (selanjutnya disebut "Kami" atau "Platform") berkomitmen penuh untuk menghormati, melindungi, dan menjaga kerahasiaan data pribadi seluruh Pengguna (baik Penjual, Pembeli, Mitra, maupun Pengunjung). Kebijakan Privasi ini mengatur landasan dasar mengenai bagaimana Kami mengumpulkan, menggunakan, memproses, menyimpan, dan melindungi data pribadi Anda sesuai dengan Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) serta ketentuan hukum yang berlaku di Republik Indonesia dan Standar Kebijakan Pengembang Google Play Store.
              </p>
              <p class="text-justify">
                Dengan mengakses situs web, mengunduh aplikasi mobile, atau menggunakan layanan BekasKu, Anda menyatakan telah membaca, memahami, dan memberikan persetujuan eksplisit kepada Kami untuk memproses data pribadi Anda sesuai dengan Kebijakan Privasi ini.
              </p>
            </section>

            <!-- Bab 1 -->
            <section id="bab-1" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                BAB I: DATA PRIBADI YANG KAMI KUMPULKAN
              </h2>
              
              <h3 class="text-base font-bold text-[#E31B23]">Pasal 1 – Data yang Diserahkan Secara Sukarela</h3>
              <p>Kami mengumpulkan informasi yang Anda serahkan saat membuat akun, bertransaksi, atau berinteraksi di Platform, meliputi:</p>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Informasi Identitas &amp; Akun:</strong> Nama lengkap, alamat email aktif, nomor telepon/WhatsApp, kata sandi terenkripsi, foto profil, dan tanggal lahir.</li>
                <li><strong>Verifikasi Identitas Resmi:</strong> Nomor Induk Kependudukan (NIK), foto KTP/SIM/Paspor, serta foto selfie verifikasi (khusus Penjual VVIP, Verifikasi Toko Resmi, atau penarikan saldo dompet).</li>
                <li><strong>Alamat Pengiriman &amp; Penjemputan:</strong> Label alamat, nama penerima, nomor telepon kontak, alamat jalan lengkap, kecamatan, kota/kabupaten, provinsi, kode pos, dan titik koordinat GPS.</li>
                <li><strong>Informasi Keuangan:</strong> Nomor rekening bank, nama pemilik rekening, dan data e-wallet untuk keperluan pencairan dana penjualan (payout) atau pengembalian dana (refund). Seluruh data transaksi pembayaran dilindungi oleh gateway berlisensi Bank Indonesia.</li>
                <li><strong>Konten &amp; Komunikasi:</strong> Pesan obrolan (in-app chat), rekaman interaksi tawar-menawar, ulasan produk, foto produk yang diunggah, dan interaksi sesi BekasKu Live Streaming.</li>
              </ol>

              <h3 class="text-base font-bold text-[#E31B23] pt-4">Pasal 2 – Data yang Dikumpulkan Secara Otomatis &amp; Izin Perangkat</h3>
              <ol start="6" class="list-decimal pl-5 space-y-2">
                <li><strong>Data Perangkat &amp; Jaringan:</strong> Model perangkat keras, versi sistem operasi (Android / iOS / Web), pengenal unik perangkat (IMEI / Android ID / IDFV), alamat IP address, jenis peramban web (browser), serta log sistem error.</li>
                <li><strong>Data Lokasi Presisi (GPS):</strong> Koordinat lokasi presisi (GPS) perangkat Anda (apabila izin lokasi diaktifkan) guna menampilkan iklan terdekat, rekomendasi produk lokal, dan menghitung estimasi ongkos kirim kurir instan/reguler secara akurat.</li>
                <li><strong>Kamera &amp; Galeri:</strong> Akses kamera dan penyimpanan media digunakan semata-mata saat Anda mengunggah foto/video produk, foto profil, memindai barcode transaksi, atau mengirim bukti foto dalam obrolan bantuan.</li>
                <li><strong>Data Perilaku &amp; Aktivitas:</strong> Riwayat pencarian, produk yang dilihat, riwayat klik iklan, waktu dan durasi akses, serta produk yang ditambahkan ke keranjang belanja atau wishlist.</li>
              </ol>
            </section>

            <!-- Bab 2 -->
            <section id="bab-2" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                BAB II: TUJUAN PENGGUNAAN DATA PRIBADI
              </h2>
              <p>Kami menggunakan data pribadi yang dikumpulkan untuk tujuan-tujuan berikut:</p>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Penyediaan Layanan &amp; Transaksi:</strong> Memproses pendaftaran akun, memverifikasi identitas, memfasilitasi transaksi jual-beli, mengoperasikan Rekening Bersama (Rekber), dan meneruskan instruksi pembayaran ke bank/payment gateway resmi.</li>
                <li><strong>Pengiriman &amp; Logistik:</strong> Meneruskan data alamat dan nomor kontak penerima kepada pihak ekspedisi rekanan resmi (Biteship, JNE, SiCepat, J&amp;T, Ninja Xpress, dsb.) guna penjemputan dan pengantaran pesanan.</li>
                <li><strong>Keamanan &amp; Pencegahan Penipuan:</strong> Mendeteksi, memitigasi, dan mencegah aktivitas penipuan (fraud), penyalahgunaan akun, transaksi ilegal barang curian, serta pelanggaran Syarat dan Ketentuan BekasKu.</li>
                <li><strong>Personalisasi Pengalaman Pengguna:</strong> Menyajikan katalog rekomendasi produk terdekat, rekomendasi kategori yang relevan, serta fitur interaktif live video shopping.</li>
                <li><strong>Komunikasi &amp; Layanan Pelanggan:</strong> Mengirimkan notifikasi status transaksi, resi pengiriman, pembaruan keamanan akun, dan merespons pertanyaan serta keluhan melalui tim Customer Support.</li>
                <li><strong>Kepatuhan Hukum:</strong> Mematuhi kewajiban perpajakan, audit keuangan, dan permintaan resmi dari otoritas penegak hukum yang berwenang di Indonesia.</li>
              </ol>
            </section>

            <!-- Bab 3 -->
            <section id="bab-3" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                BAB III: PENGUNGKAPAN KEPADA PIHAK KETIGA
              </h2>
              <p>
                Kami menjamin <strong>TIDAK AKAN</strong> menjual, memperjualbelikan, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak manapun. Data hanya dapat diungkapkan kepada mitra resmi berikut atas dasar kebutuhan operasional yang sah:
              </p>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Mitra Payment Gateway &amp; Bank:</strong> Untuk memproses pembayaran aman, validasi VA (Virtual Account), QRIS, e-wallet, dan pencairan dana dompet.</li>
                <li><strong>Mitra Logistik &amp; Kurir:</strong> Untuk keperluan pengambilan paket dari Penjual dan pengiriman tepat ke tangan Pembeli beserta pelacakan resi real-time.</li>
                <li><strong>Penyedia Infrastruktur Cloud &amp; Server:</strong> Server cloud terenkripsi (Google Cloud Platform) yang mematuhi standar sertifikasi keamanan informasi internasional ISO/IEC 27001.</li>
                <li><strong>Penegak Hukum &amp; Otoritas Pemerintah:</strong> Apabila diwajibkan oleh putusan pengadilan, panggilan resmi kepolisian, atau instansi berwenang demi pencegahan tindak pidana.</li>
              </ol>
            </section>

            <!-- Bab 4 -->
            <section id="bab-4" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                BAB IV: KEAMANAN &amp; PENYIMPANAN DATA
              </h2>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Enkripsi Data:</strong> Seluruh komunikasi data antara perangkat Anda dan server BekasKu dienkripsi menggunakan protokol Transport Layer Security (TLS 1.3 / SSL). Data kata sandi disimpan menggunakan hashing cryptographic tingkat tinggi (Bcrypt/Argon2).</li>
                <li><strong>Masa Retensi:</strong> Data pribadi disimpan selama akun Anda aktif dan selama diperlukan untuk memenuhi tujuan hukum serta pembukuan transaksi e-commerce (sekurang-kurangnya 5 tahun sesuai regulasi perdagangan elektronik Republik Indonesia).</li>
                <li><strong>Pemberitahuan Insiden:</strong> Apabila terjadi kegagalan perlindungan data pribadi (insiden kebocoran data), Kami akan memberitahukan Pengguna yang terdampak secara tertulis dalam kurun waktu maksimal 3 x 24 jam beserta langkah mitigasi penanganan yang telah diambil.</li>
              </ol>
            </section>

            <!-- Bab 5 -->
            <section id="bab-5" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                BAB V: HAK PENGGUNA &amp; PENGHAPUSAN AKUN (ACCOUNT DELETION)
              </h2>
              <p>Sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP) dan Kebijakan Privasi Pengembang Google Play Store, Anda memiliki hak penuh atas data pribadi Anda:</p>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Hak Akses &amp; Perbaikan:</strong> Anda berhak mengakses profil dan mengubah informasi pribadi yang tidak akurat kapan saja melalui menu Pengaturan Profil di aplikasi BekasKu.</li>
                <li><strong>Hak Penghapusan Akun &amp; Data Pribadi (Account &amp; Data Deletion):</strong> Anda berhak menutup akun dan meminta penghapusan permanen seluruh data pribadi yang tersimpan. Tata cara penghapusan akun:
                  <ul class="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
                    <li><strong>Melalui Aplikasi Mobile:</strong> Masuk ke tab <em>Profil</em> &rarr; pilih <em>Pengaturan Akun</em> &rarr; klik <em>Hapus Akun Saya</em>, lalu konfirmasi dengan kata sandi/OTP Anda.</li>
                    <li><strong>Melalui Permohonan Tertulis:</strong> Kirimkan email resmi ke <a href="mailto:info@bekasku.id" class="text-[#E31B23] underline font-medium">info@bekasku.id</a> dengan subjek <em>"Permohonan Penghapusan Akun &amp; Data - [Nomor HP / Email Terdaftar]"</em>. Tim Data Protection Officer kami akan memverifikasi dan memproses penghapusan data secara permanen dalam kurun waktu maksimal 7 (tujuh) hari kerja.</li>
                    <li><strong>Dampak Penghapusan:</strong> Seluruh identitas pribadi, foto produk, riwayat obrolan, dan informasi login akan dihapus secara permanen dari server aktif kami, kecuali data transaksi keuangan masa lalu yang diwajibkan oleh hukum perpajakan Indonesia untuk disimpan dalam arsip terenkripsi.</li>
                  </ul>
                </li>
                <li><strong>Hak Pembatasan &amp; Pencabutan Izin:</strong> Anda berhak menolak atau mencabut izin akses perangkat tertentu kapan saja (seperti izin lokasi GPS presisi, kamera, mikrofon, atau notifikasi push) melalui menu Pengaturan Izin Aplikasi di perangkat smartphone Anda.</li>
              </ol>
            </section>

            <!-- Bab 6 -->
            <section id="bab-6" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                BAB VI: HUBUNGI KAMI &amp; DATA PROTECTION OFFICER
              </h2>
              <p class="text-justify">
                Apabila Anda memiliki pertanyaan, permohonan pelaksanaan hak data pribadi, permintaan penghapusan akun, saran, atau keluhan terkait penanganan privasi di platform BekasKu, silakan menghubungi Petugas Perlindungan Data (Data Protection Officer) Kami melalui kontak resmi berikut:
              </p>
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 text-xs text-slate-700">
                <p class="text-sm font-bold text-slate-900">PT Jantaka Ladang Unggul (BekasKu)</p>
                <p><strong>Alamat Kantor:</strong> Jl. Prof. H.M Yamin No. 6C, Kel. Kesawan, Kec. Medan Barat, Kota Medan, Sumatera Utara 20111</p>
                <p><strong>Email Dukungan &amp; Privasi:</strong> <a href="mailto:info@bekasku.id" class="text-[#E31B23] underline font-medium">info@bekasku.id</a></p>
                <p><strong>Telepon / WhatsApp Resmi:</strong> (+62) 822-9458-8970</p>
                <p><strong>Jam Operasional Layanan:</strong> Senin – Sabtu, 10:00 – 17:00 WIB</p>
              </div>
            </section>
          </template>

          <!-- ENGLISH CONTENT -->
          <template v-else>
            <!-- Introduction -->
            <section id="pendahuluan" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                INTRODUCTION
              </h2>
              <p class="text-justify">
                PT Jantaka Ladang Unggul as the operator of the <strong>BekasKu</strong> digital platform ("We", "Us", or "Platform") is fully dedicated to respecting, protecting, and safeguarding the personal data confidentiality of all Users (including Sellers, Buyers, Partners, and Visitors). This Privacy Policy sets out the principles of how We collect, use, process, store, and safeguard your personal data in accordance with Law No. 27 of 2022 on Personal Data Protection (PDP Law), applicable laws of the Republic of Indonesia, and Google Play Developer Policies.
              </p>
              <p class="text-justify">
                By accessing our website, downloading the mobile application, or using BekasKu services, you acknowledge that you have read, understood, and provided explicit consent for us to process your personal data in accordance with this Privacy Policy.
              </p>
            </section>

            <!-- Chapter 1 -->
            <section id="bab-1" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                CHAPTER I: PERSONAL DATA WE COLLECT
              </h2>
              
              <h3 class="text-base font-bold text-[#E31B23]">Section 1 – Information You Provide Voluntarily</h3>
              <p>We collect information you submit when creating an account, transacting, or interacting on the Platform, including:</p>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Identity &amp; Account Information:</strong> Full name, active email address, mobile/WhatsApp number, encrypted password, profile picture, and date of birth.</li>
                <li><strong>Official Identity Verification:</strong> National Identity Number (NIK), ID card / Passport photos, and verification selfies (specifically for VVIP Sellers, Verified Official Stores, or wallet balance withdrawals).</li>
                <li><strong>Shipping &amp; Pickup Address:</strong> Address label, recipient name, contact phone number, complete street address, district, city/regency, postal code, and GPS pin coordinates.</li>
                <li><strong>Financial Information:</strong> Bank account numbers, account holder names, and e-wallet identifiers for sales proceeds payout or refunds. All transaction processing is guarded by Bank Indonesia licensed payment gateways.</li>
                <li><strong>Content &amp; Communication:</strong> In-app chat messages, offer bargaining interactions, product reviews, uploaded product media, and BekasKu Live Streaming sessions.</li>
              </ol>

              <h3 class="text-base font-bold text-[#E31B23] pt-4">Section 2 – Automatically Collected Data &amp; Device Permissions</h3>
              <ol start="6" class="list-decimal pl-5 space-y-2">
                <li><strong>Device &amp; Network Information:</strong> Hardware model, OS version (Android / iOS / Web), unique device identifiers (IMEI / Android ID / IDFV), IP address, browser type, and diagnostic error logs.</li>
                <li><strong>Precise Location Data (GPS):</strong> Precise geolocation coordinates from your device (when permission is granted) to display nearby ads, local recommendations, and calculate real-time courier shipping fees accurately.</li>
                <li><strong>Camera &amp; Media Storage:</strong> Camera and gallery access are utilized strictly when uploading product photos/videos, setting avatar images, scanning QR codes, or providing images in support tickets.</li>
                <li><strong>Behavioral &amp; Activity Log:</strong> Search history, viewed products, banner click records, access timestamps, and items placed in the shopping cart or wishlist.</li>
              </ol>
            </section>

            <!-- Chapter 2 -->
            <section id="bab-2" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                CHAPTER II: HOW WE USE PERSONAL DATA
              </h2>
              <p>We process collected personal data for the following legitimate purposes:</p>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Service Provision &amp; Order Execution:</strong> Account registration, identity verification, marketplace transactions facilitation, Joint Escrow Account (Rekber) operations, and payment dispatch.</li>
                <li><strong>Delivery &amp; Logistics:</strong> Transmitting recipient address and phone number to official courier partners (Biteship, JNE, SiCepat, J&amp;T, Ninja Xpress, etc.) for package pickup and delivery.</li>
                <li><strong>Security &amp; Fraud Prevention:</strong> Detecting, preventing, and investigating suspicious activities, fraud, unauthorized account access, and Terms of Service violations.</li>
                <li><strong>User Experience Personalization:</strong> Recommending nearby listings, relevant categories, and powering interactive live shopping features.</li>
                <li><strong>Support &amp; Communications:</strong> Sending order confirmations, shipping tracking numbers, security alerts, and answering customer queries.</li>
                <li><strong>Regulatory Compliance:</strong> Adhering to statutory tax requirements, accounting audits, and lawful law enforcement requests within Indonesia.</li>
              </ol>
            </section>

            <!-- Chapter 3 -->
            <section id="bab-3" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                CHAPTER III: THIRD-PARTY DATA DISCLOSURE
              </h2>
              <p>
                We <strong>DO NOT</strong> sell, rent, or trade your personal data to any third parties for commercial marketing purposes. Data is disclosed only to legitimate operational partners under strict data processing agreements:
              </p>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Licensed Payment Gateways &amp; Banks:</strong> For processing secure checkouts, Virtual Accounts, QRIS, e-wallets, and seller payouts.</li>
                <li><strong>Logistics &amp; Courier Providers:</strong> For picking up parcels from sellers and delivering them safely to buyers with real-time tracking.</li>
                <li><strong>Cloud Infrastructure Providers:</strong> Encrypted cloud hosting facilities (Google Cloud Platform) maintaining ISO/IEC 27001 security certifications.</li>
                <li><strong>Law Enforcement &amp; Public Authorities:</strong> Only when legally mandated by court orders, statutory subpoena, or authorized regulatory agencies.</li>
              </ol>
            </section>

            <!-- Chapter 4 -->
            <section id="bab-4" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                CHAPTER IV: DATA SECURITY &amp; RETENTION
              </h2>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Data Encryption:</strong> All communications between your client device and BekasKu servers are protected via Transport Layer Security (TLS 1.3 / SSL). User passwords are stored using high-grade salted cryptographic hashing (Bcrypt/Argon2).</li>
                <li><strong>Data Retention:</strong> Personal data is kept as long as your account remains active and for the minimum statutory period required for commercial tax records (at least 5 years under Indonesian electronic commerce regulations).</li>
                <li><strong>Security Incident Response:</strong> In the unlikely event of a data protection breach, We will notify affected users in writing within a maximum of 72 hours alongside remediation steps.</li>
              </ol>
            </section>

            <!-- Chapter 5 -->
            <section id="bab-5" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                CHAPTER V: YOUR RIGHTS &amp; ACCOUNT DELETION
              </h2>
              <p>In accordance with data protection regulations and Google Play Developer Policies, you retain comprehensive rights over your personal data:</p>
              <ol class="list-decimal pl-5 space-y-2">
                <li><strong>Access &amp; Rectification:</strong> You may inspect and correct inaccurate account information directly inside the BekasKu mobile application profile menu.</li>
                <li><strong>Account &amp; Data Deletion:</strong> You have the right to request full and permanent deletion of your account and associated personal data at any time:
                  <ul class="list-disc pl-5 mt-2 space-y-1.5 text-slate-600">
                    <li><strong>In-App Deletion:</strong> Navigate to <em>Profile</em> &rarr; <em>Account Settings</em> &rarr; select <em>Delete My Account</em>, then verify your identity with password or OTP.</li>
                    <li><strong>Written Request via Email:</strong> Send an email to <a href="mailto:info@bekasku.id" class="text-[#E31B23] underline font-medium">info@bekasku.id</a> with subject <em>"Account &amp; Data Deletion Request - [Registered Mobile/Email]"</em>. Our Data Protection team will verify and permanently purge your personal data within 7 (seven) business days.</li>
                    <li><strong>Deletion Scope:</strong> Personal profile information, uploaded listings, chat records, and credentials will be permanently erased from our active databases, excluding financial transaction logs required by law to be preserved in immutable archives.</li>
                  </ul>
                </li>
                <li><strong>Permission Revocation:</strong> You can modify or withdraw device permissions (such as GPS Location, Camera, or Notifications) at any time through your smartphone operating system settings.</li>
              </ol>
            </section>

            <!-- Chapter 6 -->
            <section id="bab-6" class="space-y-4 scroll-mt-28">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                CHAPTER VI: CONTACT US &amp; DATA PROTECTION OFFICER
              </h2>
              <p class="text-justify">
                For questions, data access requests, account deletion inquiries, or grievances regarding privacy practices at BekasKu, please contact our designated Data Protection Officer:
              </p>
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 text-xs text-slate-700">
                <p class="text-sm font-bold text-slate-900">PT Jantaka Ladang Unggul (BekasKu)</p>
                <p><strong>Office Address:</strong> Jl. Prof. H.M Yamin No. 6C, Kel. Kesawan, Kec. Medan Barat, Medan City, North Sumatra 20111, Indonesia</p>
                <p><strong>Support &amp; Privacy Email:</strong> <a href="mailto:info@bekasku.id" class="text-[#E31B23] underline font-medium">info@bekasku.id</a></p>
                <p><strong>Official Phone / WhatsApp:</strong> (+62) 822-9458-8970</p>
                <p><strong>Operational Hours:</strong> Monday – Saturday, 10:00 – 17:00 WIB (UTC+7)</p>
              </div>
            </section>
          </template>

        </main>
      </div>
    </div>

    <!-- Footer -->
    <footer class="w-full bg-slate-900 text-slate-400 py-8 text-xs text-center border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 space-y-2">
        <p>&copy; {{ currentYear }} Bekasku (PT. Jantaka Ladang Unggul). {{ isEn ? 'All Rights Reserved.' : 'Seluruh Hak Cipta Dilindungi.' }}</p>
        <div class="flex items-center justify-center gap-4 text-slate-500">
          <NuxtLink to="/" class="hover:text-white transition-colors">{{ isEn ? 'Home' : 'Beranda' }}</NuxtLink>
          <span>&bull;</span>
          <NuxtLink to="/terms" class="hover:text-white transition-colors">{{ isEn ? 'Terms of Service' : 'Syarat & Ketentuan' }}</NuxtLink>
          <span>&bull;</span>
          <NuxtLink :to="isEn ? '/policy?lang=en' : '/policy?lang=id'" class="text-white font-medium hover:underline">
            {{ isEn ? 'Privacy Policy' : 'Kebijakan Privasi' }}
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, FileText, Shield, Info, Trash2 } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

// Detect language from query parameter (?lang=id or ?lang=en)
const currentLang = computed(() => {
  const q = (route.query.lang as string)?.toLowerCase();
  return q === 'en' ? 'en' : 'id';
});

const isEn = computed(() => currentLang.value === 'en');
const currentYear = new Date().getFullYear();

function setLanguage(lang: 'id' | 'en') {
  router.push({
    query: {
      ...route.query,
      lang: lang,
    },
  });
}

// SEO Head setup
useHead({
  title: computed(() => (isEn.value ? 'Privacy Policy — Bekasku' : 'Kebijakan Privasi — Bekasku')),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        isEn.value
          ? 'Official Privacy Policy of Bekasku platform operated by PT Jantaka Ladang Unggul.'
          : 'Kebijakan Privasi resmi platform Bekasku oleh PT Jantaka Ladang Unggul sesuai UU PDP dan Google Play Policy.'
      ),
    },
    {
      property: 'og:title',
      content: computed(() => (isEn.value ? 'Privacy Policy — Bekasku' : 'Kebijakan Privasi — Bekasku')),
    },
    {
      property: 'og:description',
      content: computed(() =>
        isEn.value
          ? 'Official Privacy Policy of Bekasku platform operated by PT Jantaka Ladang Unggul.'
          : 'Kebijakan Privasi resmi penggunaan platform jual beli Bekasku.'
      ),
    },
    { property: 'og:type', content: 'website' },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://bekasku.id/policy',
    },
  ],
});

const tableOfContents = computed(() => {
  if (isEn.value) {
    return [
      { id: 'pendahuluan', title: 'Introduction' },
      { id: 'bab-1', title: 'Chapter I: Data Collected & Permissions' },
      { id: 'bab-2', title: 'Chapter II: How We Use Data' },
      { id: 'bab-3', title: 'Chapter III: Third-Party Disclosures' },
      { id: 'bab-4', title: 'Chapter IV: Security & Retention' },
      { id: 'bab-5', title: 'Chapter V: User Rights & Account Deletion' },
      { id: 'bab-6', title: 'Chapter VI: Contact Us & DPO' },
    ];
  }
  return [
    { id: 'pendahuluan', title: 'Pendahuluan' },
    { id: 'bab-1', title: 'Bab I: Data Pribadi & Izin Perangkat' },
    { id: 'bab-2', title: 'Bab II: Tujuan Penggunaan Data' },
    { id: 'bab-3', title: 'Bab III: Pengungkapan ke Pihak Ketiga' },
    { id: 'bab-4', title: 'Bab IV: Keamanan & Penyimpanan Data' },
    { id: 'bab-5', title: 'Bab V: Hak Pengguna & Hapus Akun' },
    { id: 'bab-6', title: 'Bab VI: Hubungi Kami & DPO' },
  ];
});
</script>
