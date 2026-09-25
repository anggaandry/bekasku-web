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
          <span class="hidden sm:inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider">Syarat &amp; Ketentuan</span>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            Versi 2.1.0
          </span>
          <NuxtLink
            to="/"
            class="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-[#E31B23] transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Kembali</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Header -->
    <div class="bg-gradient-to-b from-red-50/70 to-slate-50 border-b border-slate-200 py-10 sm:py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#E31B23] text-xs font-semibold uppercase tracking-wider">
          <Shield class="w-3.5 h-3.5" />
          Dokumen Legal Resmi
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
          Syarat dan Ketentuan
        </h1>
        <p class="text-slate-500 italic text-sm sm:text-base">Terms and Conditions — BEKASKU</p>
        <p class="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Platform Jual Beli Barang Baru &amp; Bekas &bull; PT. Jantaka Ladang Unggul
        </p>
        <div class="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span>Berlaku Efektif: <strong>1 Januari 2025</strong></span>
          <span>&bull;</span>
          <span>Pembaruan Terakhir: <strong>September 2026</strong></span>
        </div>
      </div>
    </div>

    <!-- Main Container with Sidebar Navigation -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Sidebar Navigation (Desktop) -->
        <aside class="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileText class="w-4 h-4 text-[#E31B23]" />
              Daftar Isi Bab
            </h3>
            <nav class="space-y-1 text-xs max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
              <a
                v-for="(item, idx) in tableOfContents"
                :key="idx"
                :href="`#${item.id}`"
                class="block py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-[#E31B23] hover:bg-red-50/70 transition-colors font-medium truncate"
              >
                {{ item.title }}
              </a>
            </nav>
          </div>

          <div class="bg-red-50/60 rounded-2xl border border-red-100 p-4 text-xs text-slate-600 space-y-2">
            <p class="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info class="w-4 h-4 text-[#E31B23]" />
              Butuh Bantuan?
            </p>
            <p class="text-[11px] leading-relaxed">
              Hubungi tim layanan pelanggan kami di <a href="mailto:support@bekasku.id" class="text-[#E31B23] font-semibold hover:underline">support@bekasku.id</a> atau melalui live chat di aplikasi.
            </p>
          </div>
        </aside>

        <!-- Document Content Body -->
        <main class="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8 text-slate-800 text-sm leading-relaxed">
          
          <!-- PENDAHULUAN -->
          <section id="pendahuluan" class="space-y-3 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              PENDAHULUAN
            </h2>
            <p class="text-justify">
              Selamat datang di platform BekasKu (selanjutnya disebut "Platform"). Platform ini merupakan layanan berbasis teknologi yang menghubungkan Penjual dan Pembeli untuk melakukan transaksi jual beli barang baru maupun barang bekas secara aman, mudah, dan terpercaya.
            </p>
            <p class="text-justify">
              Dengan mengakses, mendaftar, atau menggunakan layanan Platform ini, Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan yang tercantum dalam dokumen ini. Apabila Anda tidak menyetujui salah satu ketentuan, mohon untuk tidak menggunakan layanan Platform ini.
            </p>
            <p class="text-justify">
              Syarat dan Ketentuan ini berlaku bagi seluruh pengguna Platform, termasuk namun tidak terbatas pada pengunjung, pembeli, penjual, dan mitra bisnis.
            </p>
          </section>

          <!-- BAB I: DEFINISI DAN INTERPRETASI -->
          <section id="bab-1" class="space-y-3 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB I: DEFINISI DAN INTERPRETASI
            </h2>
            <h3 class="font-semibold text-base text-[#E31B23]">Pasal 1 – Definisi</h3>
            <p>Dalam Syarat dan Ketentuan ini, istilah-istilah berikut memiliki makna sebagai berikut:</p>
            <ol class="list-decimal pl-5 space-y-2">
              <li><strong>"Platform"</strong> merujuk pada aplikasi mobile, situs web, dan seluruh layanan digital yang dioperasikan oleh Pengelola Platform.</li>
              <li><strong>"Pengelola"</strong> adalah perusahaan yang memiliki, mengoperasikan, dan bertanggung jawab atas Platform ini.</li>
              <li><strong>"Pengguna"</strong> adalah setiap individu atau badan hukum yang mengakses dan/atau menggunakan layanan Platform.</li>
              <li><strong>"Penjual"</strong> adalah Pengguna yang menawarkan, memasarkan, dan/atau menjual produk melalui Platform.</li>
              <li><strong>"Pembeli"</strong> adalah Pengguna yang mencari, memesan, dan/atau membeli produk melalui Platform.</li>
              <li><strong>"Produk"</strong> adalah barang baru maupun barang bekas yang ditawarkan melalui Platform, termasuk namun tidak terbatas pada elektronik, pakaian, otomotif, properti, dan kategori lainnya.</li>
              <li><strong>"Iklan"</strong> adalah tampilan informasi produk yang dipasang oleh Penjual pada Platform.</li>
              <li><strong>"Transaksi"</strong> adalah kegiatan jual beli yang terjadi antara Penjual dan Pembeli melalui Platform.</li>
              <li><strong>"Rekening Bersama (Rekber)"</strong> adalah fasilitas escrow yang disediakan Platform untuk menjamin keamanan pembayaran transaksi.</li>
              <li><strong>"Reputasi/Rating"</strong> adalah penilaian yang diberikan oleh Pengguna terhadap Penjual maupun Pembeli berdasarkan pengalaman transaksi.</li>
              <li><strong>"Konten"</strong> adalah seluruh informasi, teks, gambar, foto, video, data, dan materi lainnya yang diunggah atau dibagikan di Platform.</li>
            </ol>
          </section>

          <!-- BAB II: KETENTUAN AKUN DAN PENDAFTARAN -->
          <section id="bab-2" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB II: KETENTUAN AKUN DAN PENDAFTARAN
            </h2>
            
            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 2 – Pendaftaran Akun</h3>
              <p>Untuk dapat menggunakan layanan Platform secara penuh, Pengguna wajib membuat akun dengan ketentuan sebagai berikut:</p>
              <ol start="12" class="list-decimal pl-5 space-y-2">
                <li>Pengguna harus berusia minimal 17 (tujuh belas) tahun atau telah memiliki kapasitas hukum penuh untuk membuat perjanjian yang mengikat.</li>
                <li>Pengguna yang berusia di bawah 17 tahun wajib mendapatkan persetujuan dari orang tua atau wali yang sah, dan bertransaksi di bawah pengawasan mereka.</li>
                <li>Setiap Pengguna hanya diperkenankan memiliki satu akun aktif, kecuali terdapat izin tertulis dari Pengelola.</li>
                <li>Pengguna wajib menyediakan informasi yang akurat, lengkap, dan terkini saat pendaftaran, meliputi: nama lengkap, alamat email aktif, nomor telepon yang dapat dihubungi, dan kata sandi yang kuat.</li>
                <li>Pengguna bertanggung jawab penuh atas keamanan dan kerahasiaan kata sandi akun mereka.</li>
                <li>Pengelola berhak menangguhkan atau menghapus akun yang terbukti memberikan informasi palsu, menyesatkan, atau tidak lengkap.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 3 – Verifikasi Identitas &amp; Akun Media Sosial</h3>
              <p>Guna meningkatkan keamanan dan kepercayaan di Platform, berlaku ketentuan verifikasi sebagai berikut:</p>
              <ol start="18" class="list-decimal pl-5 space-y-2">
                <li>Pengelola dapat meminta Pengguna untuk melakukan verifikasi identitas melalui dokumen resmi (KTP, SIM, atau Paspor) sebelum dapat mengakses fitur-fitur tertentu.</li>
                <li>Penjual yang ingin membuka toko resmi (Official Store) wajib melengkapi verifikasi bisnis dengan menyerahkan dokumen legalitas usaha yang berlaku.</li>
                <li>Data identitas yang diberikan akan diproses sesuai dengan Kebijakan Privasi Platform dan peraturan perundang-undangan yang berlaku.</li>
                <li>Verifikasi identitas tidak menjamin keabsahan seluruh konten atau produk yang diunggah oleh Pengguna yang bersangkutan.</li>
                <li><strong>Verifikasi Akun Media Sosial (Instagram):</strong> Penautan dan verifikasi akun media sosial pihak ketiga (seperti Instagram) pada profil Pengguna semata-mata bertujuan untuk memverifikasi dan membuktikan kepemilikan akun tersebut (bahwa pemilik akun Bekasku adalah benar pemilik sah dari akun Instagram yang ditautkan). Verifikasi media sosial ini <strong>BUKAN</strong> merupakan jaminan atau sertifikasi dari Platform bahwa akun tersebut bebas dari potensi penipuan, akun palsu, atau jaminan integritas pihak tersebut di luar pengawasan Platform. Seluruh Pengguna diharapkan senantiasa jeli, cermat, dan berhati-hati saat bertransaksi, <strong>kecuali</strong> untuk akun resmi bertanda <strong>Bekasku+</strong> yang telah melalui proses kurasi dan verifikasi kepatuhan resmi secara menyeluruh langsung oleh pihak internal Bekasku.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 4 – Tanggung Jawab Akun</h3>
              <ol start="22" class="list-decimal pl-5 space-y-2">
                <li>Pengguna bertanggung jawab penuh atas semua aktivitas yang terjadi melalui akun mereka.</li>
                <li>Pengguna wajib segera memberitahukan Pengelola apabila mendeteksi adanya akses tidak sah atau penggunaan akun yang mencurigakan.</li>
                <li>Pengelola tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian Pengguna dalam menjaga keamanan akun.</li>
              </ol>
            </div>
          </section>

          <!-- BAB III: KETENTUAN PENJUAL -->
          <section id="bab-3" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB III: KETENTUAN PENJUAL
            </h2>
            
            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 5 – Hak dan Kewajiban Penjual</h3>
              <p>Penjual yang menggunakan Platform untuk memasarkan produk tunduk pada ketentuan-ketentuan berikut:</p>
              <ol start="25" class="list-decimal pl-5 space-y-2">
                <li>Penjual wajib memastikan bahwa seluruh produk yang dijual adalah produk yang dimiliki secara sah dan tidak dalam sengketa hukum apapun.</li>
                <li>Penjual bertanggung jawab penuh atas keakuratan informasi produk, termasuk deskripsi, kondisi, spesifikasi, dan harga yang dicantumkan dalam iklan.</li>
                <li>Penjual wajib mencantumkan kondisi barang secara jujur: Baru (New), Seperti Baru (Like New), Bekas-Baik (Second-Good), atau Bekas-Cukup (Second-Fair).</li>
                <li>Penjual dilarang memposting produk yang sama secara berulang (spam listing) untuk memanipulasi posisi tampilan di Platform.</li>
                <li>Penjual wajib merespons pertanyaan dan penawaran dari calon Pembeli dalam waktu yang wajar (maksimal 2x24 jam pada hari kerja).</li>
                <li>Penjual wajib memproses pesanan yang telah dikonfirmasi dalam jangka waktu yang disepakati, atau memberitahu Pembeli apabila terdapat kendala.</li>
                <li>Penjual bertanggung jawab atas pengemasan produk yang aman untuk pengiriman guna mencegah kerusakan selama proses pengiriman.</li>
                <li>Penjual tidak diperkenankan mencantumkan informasi kontak pribadi (nomor telepon, email, media sosial) secara eksplisit dalam iklan untuk menghindari transaksi di luar Platform.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 6 – Pengelolaan Iklan</h3>
              <ol start="33" class="list-decimal pl-5 space-y-2">
                <li>Iklan yang dipasang harus relevan dengan kategori yang dipilih dan tidak menyesatkan calon Pembeli.</li>
                <li>Foto produk yang diunggah harus merupakan foto asli produk yang dijual, bukan foto dari internet atau produk milik pihak lain.</li>
                <li>Satu iklan hanya diperbolehkan untuk satu jenis produk atau satu set produk yang dijual bersamaan.</li>
                <li>Penjual wajib segera menonaktifkan atau menghapus iklan apabila produk telah terjual.</li>
                <li>Pengelola berhak menghapus iklan yang melanggar Syarat dan Ketentuan tanpa pemberitahuan sebelumnya.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 7 – Ketentuan Toko dan Reputasi Penjual</h3>
              <ol start="38" class="list-decimal pl-5 space-y-2">
                <li>Penjual akan mendapatkan penilaian (rating bintang 1–5) dan ulasan dari Pembeli setelah transaksi selesai.</li>
                <li>Penjual dapat memperoleh status badge khusus (Verified, Trusted dan Plus) berdasarkan kriteria yang ditetapkan Pengelola.</li>
                <li>Penjual wajib mempertahankan tingkat respons minimal untuk menjaga status aktif toko mereka berdasarkan kriteria yang ditetapkan Pengelola.</li>
                <li>Penjual yang menerima banyak keluhan atau memiliki rating di bawah batas minimum dapat dikenakan pembatasan fitur, penangguhan, atau penghapusan akun.</li>
              </ol>
            </div>
          </section>

          <!-- BAB IV: KETENTUAN PEMBELI -->
          <section id="bab-4" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB IV: KETENTUAN PEMBELI
            </h2>
            
            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 8 – Hak dan Kewajiban Pembeli</h3>
              <ol start="42" class="list-decimal pl-5 space-y-2">
                <li>Pembeli berhak mendapatkan informasi yang jelas, akurat, dan tidak menyesatkan mengenai produk sebelum melakukan pembelian.</li>
                <li>Pembeli wajib membaca deskripsi produk secara teliti, termasuk kondisi barang, sebelum memutuskan untuk membeli.</li>
                <li>Pembeli wajib melakukan pembayaran sesuai mekanisme yang tersedia di Platform dan dilarang melakukan pembayaran di luar sistem Platform.</li>
                <li>Pembeli wajib mengkonfirmasi penerimaan barang dalam sistem Platform setelah barang diterima dan diperiksa.</li>
                <li>Pembeli bertanggung jawab untuk memberikan alamat pengiriman yang lengkap dan akurat.</li>
                <li>Pembeli berhak memberikan ulasan dan penilaian yang jujur terhadap Penjual setelah transaksi selesai.</li>
                <li>Pembeli tidak diperkenankan memberikan ulasan yang bersifat fitnah, menyesatkan, atau mengandung unsur SARA.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 9 – Perlindungan Pembeli</h3>
              <p>Platform berkomitmen memberikan perlindungan kepada Pembeli melalui mekanisme sebagai berikut:</p>
              <ol start="49" class="list-decimal pl-5 space-y-2">
                <li>Sistem Rekening Bersama (Rekber) memastikan dana pembayaran ditahan hingga Pembeli mengkonfirmasi penerimaan barang dalam kondisi sesuai pesanan.</li>
                <li>Pembeli dapat mengajukan klaim atau sengketa apabila barang yang diterima tidak sesuai deskripsi dalam jangka waktu yang ditentukan Platform.</li>
                <li>Platform menyediakan layanan mediasi untuk membantu menyelesaikan sengketa antara Pembeli dan Penjual.</li>
                <li>Fitur "Garansi Uang Kembali" tersedia untuk transaksi yang memenuhi syarat dan ketentuan program perlindungan Pembeli.</li>
              </ol>
            </div>
          </section>

          <!-- BAB V: KETENTUAN TRANSAKSI -->
          <section id="bab-5" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB V: KETENTUAN TRANSAKSI
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 10 – Mekanisme Transaksi</h3>
              <p>Transaksi di Platform dapat dilakukan melalui mekanisme berikut:</p>
              <ol start="53" class="list-decimal pl-5 space-y-2">
                <li><strong>Pembelian Langsung (Buy Now):</strong> Pembeli melakukan pembelian pada harga yang telah ditetapkan Penjual.</li>
                <li><strong>Penawaran Harga (Make Offer / Negosiasi):</strong> Pembeli dapat mengajukan penawaran harga kepada Penjual, yang kemudian dapat diterima, ditolak, atau dinegosiasikan lebih lanjut.</li>
                <li><strong>PnP (Pay and Pick):</strong> Transaksi yang mewajibkan pelunasan pembayaran secara digital di muka sebagai validasi utama sebelum barang diambil secara mandiri di lokasi fisik guna menghilangkan biaya logistik dan menjamin keamanan serah terima.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 11 – Pembayaran</h3>
              <ol start="56" class="list-decimal pl-5 space-y-2">
                <li>Platform menyediakan berbagai metode pembayaran yang aman, antara lain: transfer bank, kartu kredit/debit, dompet digital (e-wallet), dan metode lain yang tersedia.</li>
                <li>Seluruh pembayaran wajib dilakukan melalui sistem Platform. Pembayaran di luar Platform tidak mendapatkan perlindungan dari Pengelola.</li>
                <li>Pengelola berhak mengenakan biaya layanan (service fee) atau biaya transaksi sesuai struktur biaya yang berlaku dan akan diinformasikan kepada Pengguna.</li>
                <li>Dana yang telah dibayarkan akan diteruskan kepada Penjual setelah Pembeli mengkonfirmasi penerimaan barang atau setelah batas waktu konfirmasi otomatis berakhir.</li>
                <li>Biaya pengiriman ditanggung oleh Pembeli kecuali Penjual menawarkan pengiriman gratis (gratis ongkos kirim/gratis ongkir).</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 12 – Pengiriman</h3>
              <ol start="61" class="list-decimal pl-5 space-y-2">
                <li>Penjual wajib mengirimkan barang menggunakan jasa pengiriman yang terdaftar dan tersedia di Platform dalam waktu yang disepakati.</li>
                <li>Penjual wajib menggunakan kemasan yang sesuai untuk menjaga keamanan produk selama pengiriman, terutama untuk barang elektronik, pecah belah, atau barang sensitif lainnya.</li>
                <li>Penjual wajib menginput nomor resi pengiriman ke dalam sistem Platform segera setelah barang dikirimkan.</li>
                <li>Penjual wajib membuat dan menyimpan dokumentasi video yang jelas dan tanpa terputus (uncut) saat proses pengemasan (packing) produk hingga penempelan resi pengiriman, yang memperlihatkan kondisi fisik barang secara detail serta nomor resi pengiriman, sebagai bukti sah apabila terjadi sengketa atau klaim kerusakan/kehilangan di kemudian hari.</li>
                <li>Risiko kerusakan atau kehilangan selama pengiriman menjadi tanggung jawab bersama sesuai kebijakan asuransi pengiriman yang berlaku.</li>
                <li>Untuk transaksi Pay and Pick, Pembeli berhak memeriksa kondisi luar paket sebelum menerima dan menandatangani bukti penerimaan.</li>
                <li>Penjual wajib memberikan informasi akurat dan memeriksa kembali ukuran dimensi serta berat aktual produk sebelum melakukan pengiriman, guna memastikan kesesuaian dengan ketentuan layanan kurir yang dipilih oleh Pembeli. Segala bentuk selisih biaya ongkos kirim, penolakan paket oleh pihak logistik, atau kerugian lain yang timbul akibat ketidaksesuaian ukuran dan berat barang menjadi tanggung jawab penuh Penjual.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 13 – Pembatalan dan Pengembalian</h3>
              <p class="font-semibold text-slate-800">13.1 Pembatalan Transaksi</p>
              <ol start="68" class="list-decimal pl-5 space-y-2">
                <li>Pembeli dapat membatalkan pesanan sebelum Penjual memproses atau mengirimkan barang, dengan alasan yang valid.</li>
                <li>Pembatalan yang diajukan tanpa alasan yang valid atau berulang kali dapat dikenakan sanksi sesuai kebijakan Platform.</li>
                <li>Penjual dapat membatalkan pesanan apabila produk tidak tersedia, namun harus segera memberitahu Pembeli dan proses pembatalan akan dicatat dalam rekam jejak toko.</li>
              </ol>
              
              <p class="font-semibold text-slate-800 pt-2">13.2 Pengembalian Barang (Return) dan Refund</p>
              <ol start="71" class="list-decimal pl-5 space-y-2">
                <li>Pembeli dapat mengajukan pengembalian barang apabila: barang tidak sesuai deskripsi, barang rusak/cacat (yang tidak dijelaskan / dideskripsikan oleh penjual) saat diterima, barang yang diterima berbeda dari yang dipesan, atau barang tidak diterima sama sekali.</li>
                <li><strong>Kewajiban Video Unboxing Pembeli &amp; Video Packing Penjual:</strong> Pengajuan komplain atau klaim pengembalian barang oleh Pembeli wajib diajukan dalam batas waktu maksimal yang ditentukan Platform (maksimal 2x24 jam sejak paket berstatus diterima menurut sistem logistik) dengan <strong>SYARAT MUTLAK menyertakan bukti rekaman Video Unboxing</strong> yang utuh, jelas, dan <strong>tanpa terputus (uncut / tanpa jeda/tanpa editan)</strong> sejak paket masih dalam kondisi tersegel rapat dari kurir, label dan nomor resi pengiriman terbaca jelas, hingga pembukaan kemasan serta pengecekan fisik kondisi barang yang diterima.</li>
                <li><strong>Syarat Penerimaan Komplain:</strong> Agar komplain dapat diterima, diproses, dan dipertimbangkan secara adil oleh Platform, <strong>wajib tersedia bukti dokumentasi video yang valid dari kedua belah pihak</strong>, yaitu rekaman <strong>Video Pengemasan (Packing) dari Penjual</strong> (sebagaimana diatur pada Pasal 12 ayat 64) dan <strong>Video Unboxing dari Pembeli</strong>. Pengajuan komplain tanpa disertai video unboxing yang memenuhi kriteria di atas berhak ditolak oleh Platform demi melindungi hak Penjual dari klaim palsu.</li>
                <li>Apabila klaim pengembalian disetujui, refund akan diproses ke dalam saldo pembeli dalam jangka waktu yang telah ditentukan pengelola.</li>
                <li>Pengembalian barang atas alasan berubah pikiran (change of mind) tanpa cacat produk tidak wajib diterima oleh Penjual, kecuali Penjual secara sukarela menyediakan kebijakan tersebut.</li>
              </ol>
            </div>
          </section>

          <!-- BAB VI: PRODUK YANG DILARANG DAN DIBATASI -->
          <section id="bab-6" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB VI: PRODUK YANG DILARANG DAN DIBATASI
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 14 – Produk yang Dilarang</h3>
              <p>Pengguna dilarang keras untuk menjual, menawarkan, atau mempromosikan produk-produk berikut di Platform:</p>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>Narkotika, psikotropika, dan zat adiktif ilegal beserta paraphernalia-nya.</li>
                <li>Senjata api, senjata tajam ilegal, amunisi, dan bahan peledak.</li>
                <li>Manusia, organ tubuh manusia, dan perdagangan manusia dalam bentuk apapun.</li>
                <li>Satwa liar yang dilindungi atau produk yang berasal darinya (gading, sisik, dll.).</li>
                <li>Barang palsu atau KW yang menggunakan merek dagang terdaftar tanpa izin (barang bajakan).</li>
                <li>Konten pornografi, materi seksual eksplisit, atau produk yang mengeksploitasi anak.</li>
                <li>Dokumen atau identitas palsu, termasuk ijazah, KTP, SIM, atau paspor palsu.</li>
                <li>Akun media sosial, akun game, atau data pribadi orang lain yang diperoleh secara tidak sah.</li>
                <li>Produk yang terbukti melanggar hak kekayaan intelektual pihak lain.</li>
                <li>Bahan kimia berbahaya, zat radioaktif, dan bahan yang dapat membahayakan keselamatan publik.</li>
                <li>Obat-obatan keras yang memerlukan resep dokter tanpa kelengkapan dokumen yang sah.</li>
                <li>Produk rokok dan alkohol yang dijual kepada individu di bawah umur.</li>
                <li>Jasa penipuan, pencucian uang, atau aktivitas keuangan ilegal lainnya.</li>
                <li>Produk atau konten yang mengandung ujaran kebencian, diskriminasi SARA, atau propaganda terorisme.</li>
                <li>Pakaian bekas impor ilegal (balpres) atau segala bentuk produk pakaian bekas yang didatangkan dari luar negeri, sesuai dengan larangan yang tertuang dalam Peraturan Menteri Perdagangan (Permendag) Nomor 47 Tahun 2025 tentang Barang yang Dilarang untuk Diimpor.</li>
              </ul>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 15 – Produk dengan Pembatasan Khusus</h3>
              <p>Produk-produk berikut dapat diperjualbelikan namun tunduk pada persyaratan dan pembatasan tambahan:</p>
              <ol start="75" class="list-decimal pl-5 space-y-2">
                <li>Makanan dan minuman: wajib mencantumkan tanggal kadaluarsa, nomor izin edar (BPOM/P-IRT), dan memenuhi standar kemasan pangan.</li>
                <li>Produk kesehatan dan kosmetik: wajib terdaftar di BPOM dan tidak diperbolehkan mengklaim manfaat medis yang tidak terbukti.</li>
                <li>Elektronik bekas: wajib mencantumkan kondisi aktual, kelengkapan aksesori, dan informasi garansi (jika masih ada).</li>
                <li>Kendaraan bermotor: wajib menyertakan dokumen kendaraan yang lengkap (BPKB, STNK) dan informasi kondisi kendaraan yang akurat.</li>
                <li>Properti: wajib mematuhi peraturan pertanahan dan properti yang berlaku di Indonesia.</li>
                <li>Barang antik dan kolektibel: wajib mencantumkan keterangan keaslian dan provenance yang dapat dipertanggungjawabkan.</li>
              </ol>
            </div>
          </section>

          <!-- BAB VII: KONTEN DAN HAK KEKAYAAN INTELEKTUAL -->
          <section id="bab-7" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB VII: KONTEN DAN HAK KEKAYAAN INTELEKTUAL
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 16 – Konten Pengguna</h3>
              <ol start="81" class="list-decimal pl-5 space-y-2">
                <li>Pengguna bertanggung jawab penuh atas seluruh konten yang diunggah, termasuk foto, deskripsi produk, ulasan, dan komentar.</li>
                <li>Dengan mengunggah konten ke Platform, Pengguna memberikan lisensi non-eksklusif, bebas royalti, dapat dipindahtangankan kepada Pengelola untuk menggunakan, mereproduksi, memodifikasi, dan mendistribusikan konten tersebut dalam rangka pengoperasian Platform.</li>
                <li>Pengguna menjamin bahwa konten yang diunggah tidak melanggar hak cipta, merek dagang, atau hak kekayaan intelektual pihak lain.</li>
                <li>Pengelola berhak menghapus konten yang dianggap melanggar ketentuan ini atau berpotensi merugikan Pengguna lain tanpa pemberitahuan terlebih dahulu.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 17 – Hak Kekayaan Intelektual Platform</h3>
              <ol start="85" class="list-decimal pl-5 space-y-2">
                <li>Seluruh elemen Platform, termasuk namun tidak terbatas pada logo, desain, antarmuka pengguna, kode sumber, dan nama merek, adalah milik eksklusif Pengelola dan dilindungi oleh hukum hak kekayaan intelektual yang berlaku.</li>
                <li>Pengguna dilarang untuk menyalin, memodifikasi, mendistribusikan, atau menggunakan elemen Platform untuk kepentingan komersial tanpa izin tertulis dari Pengelola.</li>
              </ol>
            </div>
          </section>

          <!-- BAB VIII: PRIVASI DAN KEAMANAN DATA -->
          <section id="bab-8" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB VIII: PRIVASI DAN KEAMANAN DATA
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 18 – Pengumpulan dan Penggunaan Data</h3>
              <p>Platform mengumpulkan dan memproses data pribadi Pengguna sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022 dan peraturan turunannya:</p>
              <ol start="87" class="list-decimal pl-5 space-y-2">
                <li>Data yang dikumpulkan meliputi: data identitas, data kontak, data transaksi, data perangkat, data lokasi, dan data perilaku penggunaan Platform.</li>
                <li>Data Pengguna digunakan untuk: pengoperasian layanan Platform, personalisasi pengalaman pengguna, pencegahan penipuan, analisis dan peningkatan layanan, serta kepatuhan terhadap kewajiban hukum.</li>
                <li>Platform tidak menjual data pribadi Pengguna kepada pihak ketiga untuk kepentingan komersial tanpa persetujuan eksplisit Pengguna.</li>
                <li>Data Pengguna dapat dibagikan kepada mitra terpercaya yang mendukung operasional Platform (misalnya: mitra logistik, payment gateway) atas dasar perjanjian kerahasiaan yang ketat.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 19 – Hak Pengguna atas Data Pribadi</h3>
              <ol start="91" class="list-decimal pl-5 space-y-2">
                <li>Pengguna berhak mengakses, memperbarui, memperbaiki, dan menghapus data pribadi mereka melalui pengaturan akun atau dengan menghubungi layanan pelanggan Platform.</li>
                <li>Pengguna berhak menarik persetujuan penggunaan data yang sebelumnya telah diberikan, dengan memahami bahwa hal ini dapat mempengaruhi ketersediaan layanan tertentu.</li>
                <li>Pengguna berhak mengajukan keberatan atas pemrosesan data pribadi yang tidak sesuai dengan ketentuan yang berlaku.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 20 – Keamanan Platform</h3>
              <ol start="94" class="list-decimal pl-5 space-y-2">
                <li>Pengelola menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi data dan transaksi Pengguna dari akses tidak sah.</li>
                <li>Meskipun demikian, Pengelola tidak dapat menjamin keamanan mutlak mengingat sifat internet yang inheren memiliki risiko keamanan.</li>
                <li>Pengguna disarankan untuk tidak membagikan informasi sensitif (kata sandi, kode OTP, data finansial) kepada siapapun, termasuk pihak yang mengaku sebagai staf Platform.</li>
              </ol>
            </div>
          </section>

          <!-- BAB IX: PENYELESAIAN SENGKETA -->
          <section id="bab-9" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB IX: PENYELESAIAN SENGKETA
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 21 – Mekanisme Penyelesaian Sengketa</h3>
              <ol start="97" class="list-decimal pl-5 space-y-2">
                <li>Sengketa antara Pembeli dan Penjual sebaiknya diselesaikan terlebih dahulu melalui komunikasi langsung antara para pihak dalam Platform.</li>
                <li>Apabila tidak tercapai kesepakatan dalam 3 (tiga) hari kerja, salah satu pihak dapat mengajukan permohonan mediasi kepada Tim Resolusi Sengketa Platform.</li>
                <li>Tim Resolusi Sengketa Platform akan memeriksa bukti-bukti yang diajukan oleh kedua belah pihak. Dalam sengketa transaksi pengiriman produk fisik, <strong>Video Packing dari Penjual</strong> dan <strong>Video Unboxing dari Pembeli</strong> merupakan alat bukti primer yang wajib dilampirkan agar komplain dapat dipertimbangkan dan diterima. Ketiadaan bukti video uncut dari salah satu pihak akan menjadi pertimbangan mutlak bagi Tim Resolusi untuk menolak klaim atau memenangkan pihak yang memiliki dokumentasi sah. Tim Resolusi akan memberikan rekomendasi dan keputusan penyelesaian dalam waktu 3–7 hari kerja.</li>
                <li>Keputusan mediasi Platform bersifat rekomendatif dan mengikat dalam lingkup ekosistem Platform. Apabila salah satu pihak tidak puas, dapat menempuh jalur hukum sesuai ketentuan yang berlaku tanpa melibatkan pengelola.</li>
                <li>Untuk sengketa yang melibatkan nilai di atas Rp 5.000.000 (lima juta rupiah), para pihak dapat mengajukan permohonan arbitrase melalui Badan Arbitrase Nasional Indonesia (BANI) atau lembaga arbitrase terpilih lainnya.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 22 – Hukum yang Berlaku</h3>
              <ol start="102" class="list-decimal pl-5 space-y-2">
                <li>Syarat dan Ketentuan ini tunduk dan ditafsirkan berdasarkan hukum Negara Kesatuan Republik Indonesia.</li>
                <li>Segala sengketa yang tidak dapat diselesaikan melalui mediasi akan diselesaikan melalui Pengadilan Negeri Jakarta Selatan atau pengadilan lain yang disepakati.</li>
              </ol>
            </div>
          </section>

          <!-- BAB X: LARANGAN DAN SANKSI -->
          <section id="bab-10" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB X: LARANGAN DAN SANKSI
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 23 – Tindakan yang Dilarang</h3>
              <p>Pengguna dilarang melakukan tindakan-tindakan berikut yang dapat merugikan Platform, Pengguna lain, atau pihak ketiga:</p>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>Membuat akun palsu atau menggunakan identitas orang lain tanpa izin.</li>
                <li>Melakukan manipulasi ulasan, rating, atau testimoni dengan cara apapun.</li>
                <li>Menyebarkan informasi palsu, hoaks, atau konten yang menyesatkan.</li>
                <li>Melakukan tindakan phishing, scam, atau penipuan dalam bentuk apapun.</li>
                <li>Menggunakan Platform untuk aktivitas pencucian uang atau tindak kejahatan finansial.</li>
                <li>Melakukan scraping data, reverse engineering, atau upaya untuk mengakses sistem Platform secara tidak sah.</li>
                <li>Menyebarkan virus, malware, atau kode berbahaya melalui Platform.</li>
                <li>Melakukan spamming pesan kepada Pengguna lain.</li>
                <li>Menggunakan Platform untuk menjual produk dengan mengklaim status resmi atau garansi yang tidak dimiliki.</li>
                <li>Meminta Pengguna lain untuk bertransaksi di luar Platform guna menghindari biaya layanan.</li>
              </ul>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 24 – Sanksi dan Penegakan</h3>
              <p>Terhadap pelanggaran Syarat dan Ketentuan, Pengelola berhak mengambil tindakan sebagai berikut:</p>
              <ol start="104" class="list-decimal pl-5 space-y-2">
                <li>Peringatan tertulis melalui email atau notifikasi dalam Platform.</li>
                <li>Pembatasan akses fitur tertentu untuk sementara waktu.</li>
                <li>Penangguhan akun sementara (suspensi) hingga investigasi selesai.</li>
                <li>Penghapusan iklan atau konten yang melanggar ketentuan.</li>
                <li>Pembekuan dana di akun Pengguna yang sedang dalam investigasi.</li>
                <li>Penghapusan akun secara permanen (banned) untuk pelanggaran berat atau berulang.</li>
                <li>Pelaporan kepada pihak berwajib apabila terdapat indikasi tindak pidana.</li>
              </ol>
            </div>
          </section>

          <!-- BAB XI: PROGRAM DAN FITUR KHUSUS -->
          <section id="bab-11" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB XI: PROGRAM DAN FITUR KHUSUS
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 25 – Program Promosi dan Voucher</h3>
              <ol start="111" class="list-decimal pl-5 space-y-2">
                <li>Platform dapat menyelenggarakan program promosi, diskon, cashback, voucher, dan berbagai penawaran khusus lainnya yang tunduk pada syarat dan ketentuan masing-masing program.</li>
                <li>Voucher dan kode promo memiliki masa berlaku, batasan penggunaan, dan persyaratan minimum transaksi yang harus dipenuhi.</li>
                <li>Pengelola berhak membatalkan atau memodifikasi program promosi kapan saja tanpa pemberitahuan sebelumnya.</li>
                <li>Pengguna dilarang menyalahgunakan program promosi atau mencari celah (exploit) untuk mendapatkan keuntungan yang tidak sah.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 26 – Program Loyalitas dan Koin</h3>
              <ol start="115" class="list-decimal pl-5 space-y-2">
                <li>Platform dapat menyediakan program loyalitas berupa poin, koin, atau reward lainnya yang dapat dikumpulkan dari setiap transaksi.</li>
                <li>Poin/koin yang terkumpul dapat ditukarkan dengan diskon, voucher, atau keuntungan lain sesuai ketentuan program.</li>
                <li>Poin/koin tidak memiliki nilai tunai dan tidak dapat dipindahtangankan antar akun.</li>
                <li>Poin/koin akan hangus apabila akun dinonaktifkan atau dihapus, atau sesuai masa berlaku yang ditentukan.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 27 – Best Deal dan Kampanye</h3>
              <ol start="119" class="list-decimal pl-5 space-y-2">
                <li>Platform dapat menyelenggarakan Best Deal dengan stok dan waktu yang terbatas, dengan harga yang telah ditentukan oleh Platform atau Penjual.</li>
                <li>Partisipasi Penjual dalam Best Deal tunduk pada persetujuan dan ketentuan tambahan dari Pengelola.</li>
                <li>Platform berhak membatalkan pesanan Best Deal apabila terdapat indikasi penyalahgunaan atau habisnya stok.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 28 – Layanan Pengiriman Terintegrasi</h3>
              <ol start="122" class="list-decimal pl-5 space-y-2">
                <li>Platform menyediakan integrasi dengan berbagai mitra jasa pengiriman resmi untuk kemudahan transaksi.</li>
                <li>Pemilihan jasa pengiriman dapat dilakukan oleh Pembeli maupun Penjual sesuai kesepakatan dan ketersediaan layanan.</li>
                <li>Pengelola tidak bertanggung jawab langsung atas keterlambatan atau kerusakan yang disebabkan oleh mitra jasa pengiriman.</li>
                <li>Fitur live tracking pengiriman tersedia untuk memantau status pengiriman secara real-time.</li>
              </ol>
            </div>
          </section>

          <!-- BAB XII: KETENTUAN KHUSUS BARANG BEKAS -->
          <section id="bab-12" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB XII: KETENTUAN KHUSUS BARANG BEKAS
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 29 – Standar Deskripsi Barang Bekas</h3>
              <p>Mengingat karakteristik khusus transaksi barang bekas (second-hand), berlaku ketentuan tambahan berikut:</p>
              <ol start="126" class="list-decimal pl-5 space-y-2">
                <li>Penjual wajib mendeskripsikan kondisi barang secara akurat dan mendetail, termasuk cacat, keausan, atau kerusakan yang ada, meskipun bersifat minor.</li>
                <li>Foto yang diunggah harus menunjukkan kondisi aktual barang dari berbagai sudut, termasuk bagian yang terdapat cacat atau bekas pemakaian.</li>
                <li>
                  Penjual disarankan untuk menggunakan standar kondisi berikut:
                  <ul class="list-none pl-3 mt-1.5 space-y-1 text-slate-700">
                    <li><strong class="text-slate-900">a. 10/10 atau Mint Condition:</strong> Seperti baru, belum pernah digunakan.</li>
                    <li><strong class="text-slate-900">b. 9/10 atau Like New:</strong> Hampir baru, hanya digunakan beberapa kali, tidak ada goresan berarti.</li>
                    <li><strong class="text-slate-900">c. 8/10 atau Excellent:</strong> Kondisi sangat baik, ada sedikit tanda pemakaian yang wajar.</li>
                    <li><strong class="text-slate-900">d. 7/10 atau Good:</strong> Kondisi baik, ada tanda pemakaian yang terlihat namun tidak mengganggu fungsi.</li>
                    <li><strong class="text-slate-900">e. 6/10 atau Fair:</strong> Ada kerusakan atau cacat yang terlihat, namun masih berfungsi normal.</li>
                    <li><strong class="text-slate-900">f. Di bawah 6/10:</strong> Kondisi kurang baik, ada kerusakan yang perlu diinformasikan secara detail.</li>
                  </ul>
                </li>
                <li>Penjual dilarang mengklaim kondisi barang bekas lebih baik dari kondisi aktualnya.</li>
                <li>Pembeli disarankan untuk selalu berkomunikasi dengan Penjual dan meminta informasi tambahan sebelum memutuskan pembelian barang bekas bernilai tinggi.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 30 – Garansi dan Sertifikasi Barang Bekas</h3>
              <ol start="131" class="list-decimal pl-5 space-y-2">
                <li>Penjual yang menawarkan garansi produk bekas wajib mencantumkan syarat dan ketentuan garansi secara jelas.</li>
                <li>Untuk produk elektronik bekas bernilai tinggi, Penjual disarankan untuk menyediakan sertifikasi kondisi dari lembaga resmi apabila tersedia.</li>
                <li>Pengelola dapat menyediakan layanan inspeksi atau sertifikasi produk bekas melalui mitra resmi untuk meningkatkan kepercayaan transaksi.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 37 – Saldo Bekasku</h3>
              <ol start="134" class="list-decimal pl-5 space-y-2">
                <li>Saldo Bekasku adalah fasilitas penampungan sementara atas hak tagih dana hasil penjualan barang yang sah dan/atau dana pengembalian transaksi (refund) yang belum dicairkan oleh Pengguna ke rekening bank terdaftar.</li>
                <li>Saldo Bekasku bukan merupakan instrumen penyimpanan dana (simpanan) sebagaimana diatur dalam Undang-Undang No. 7 Tahun 1992 juncto Undang-Undang No. 10 Tahun 1998 tentang Perbankan.</li>
                <li>Saldo Bekasku bukan merupakan Uang Elektronik sebagaimana dimaksud dalam Peraturan Bank Indonesia No. 23/6/PBI/2021 tentang Penyedia Jasa Pembayaran.</li>
                <li>Saldo Bekasku tidak dapat diisi ulang (top-up) secara mandiri di luar proses transaksi jual beli atau pengembalian dana resmi.</li>
                <li>Saldo Bekasku tidak dapat dipindahtangankan kepada Pengguna lain.</li>
                <li>Saldo Bekasku hanya dapat digunakan untuk bertransaksi dalam ekosistem platform Bekasku (pembelian barang, langganan, dan paket promosi).</li>
                <li>PT Jantaka Ladang Unggul tidak memberikan bunga, imbal hasil, atau keuntungan dalam bentuk apa pun atas saldo yang tersimpan.</li>
                <li>Pengguna berhak mencairkan seluruh saldo kapan saja ke rekening bank atas nama Pengguna yang telah diverifikasi, tanpa biaya administrasi yang tidak wajar.</li>
              </ol>
            </div>
          </section>

          <!-- BAB XIII: TANGGUNG JAWAB DAN BATASAN KEWAJIBAN -->
          <section id="bab-13" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB XIII: TANGGUNG JAWAB DAN BATASAN KEWAJIBAN
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 31 – Batasan Tanggung Jawab Pengelola</h3>
              <ol start="142" class="list-decimal pl-5 space-y-2">
                <li>Platform berperan sebagai marketplace atau wadah pertemuan antara Penjual dan Pembeli. Pengelola bukan merupakan pihak dalam transaksi jual beli yang terjadi antara Penjual dan Pembeli.</li>
                <li>Pengelola tidak bertanggung jawab atas: kualitas, keamanan, legalitas, dan kesesuaian produk yang dijual; kemampuan Penjual untuk menyelesaikan transaksi; atau kemampuan Pembeli untuk melakukan pembayaran.</li>
                <li>Pengelola tidak menjamin bahwa Platform akan selalu tersedia tanpa gangguan, aman dari ancaman siber, atau bebas dari kesalahan teknis.</li>
                <li>Sejauh diizinkan oleh hukum yang berlaku, total kewajiban Pengelola kepada Pengguna tidak akan melebihi nilai transaksi yang disengketakan atau nilai tertinggi yang ditentukan oleh pengadilan yang berwenang.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 32 – Indemnifikasi</h3>
              <ol start="146" class="list-decimal pl-5 space-y-2">
                <li>Pengguna setuju untuk membebaskan, membela, dan memberikan ganti rugi kepada Pengelola, direktur, karyawan, dan agennya dari setiap klaim, kerugian, kerusakan, dan biaya (termasuk biaya hukum) yang timbul dari penggunaan Platform oleh Pengguna atau pelanggaran terhadap Syarat dan Ketentuan ini.</li>
              </ol>
            </div>
          </section>

          <!-- BAB XIV: KETENTUAN UMUM DAN PENUTUP -->
          <section id="bab-14" class="space-y-4 scroll-mt-24">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              BAB XIV: KETENTUAN UMUM DAN PENUTUP
            </h2>

            <div class="space-y-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 33 – Perubahan Syarat dan Ketentuan</h3>
              <ol start="147" class="list-decimal pl-5 space-y-2">
                <li>Pengelola berhak mengubah, merevisi, atau memperbarui Syarat dan Ketentuan ini kapan saja sesuai dengan perkembangan bisnis, teknologi, dan regulasi yang berlaku.</li>
                <li>Perubahan material akan diberitahukan kepada Pengguna melalui email terdaftar, notifikasi dalam aplikasi, atau pengumuman di halaman utama Platform paling lambat 30 (tiga puluh) hari sebelum perubahan berlaku.</li>
                <li>Penggunaan Platform yang berkelanjutan setelah pemberitahuan perubahan dianggap sebagai penerimaan Pengguna terhadap syarat dan ketentuan yang baru.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 34 – Pemisahan Ketentuan</h3>
              <ol start="150" class="list-decimal pl-5 space-y-2">
                <li>Apabila salah satu ketentuan dalam dokumen ini dinyatakan tidak sah atau tidak dapat dilaksanakan oleh pengadilan yang berwenang, ketentuan tersebut akan dianggap terpisah dari ketentuan lainnya dan tidak mempengaruhi keabsahan ketentuan-ketentuan yang tersisa.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 35 – Perjanjian Keseluruhan</h3>
              <ol start="151" class="list-decimal pl-5 space-y-2">
                <li>Syarat dan Ketentuan ini, bersama dengan Kebijakan Privasi, Kebijakan Pengiriman, dan dokumen kebijakan lainnya yang diterbitkan oleh Pengelola, merupakan keseluruhan perjanjian antara Pengguna dan Pengelola terkait penggunaan Platform.</li>
                <li>Syarat dan Ketentuan ini menggantikan seluruh perjanjian, negosiasi, atau komunikasi sebelumnya antara para pihak mengenai hal yang sama.</li>
              </ol>
            </div>

            <div class="space-y-2 pt-2">
              <h3 class="font-semibold text-base text-[#E31B23]">Pasal 36 – Hubungi Kami</h3>
              <p>Untuk pertanyaan, keluhan, atau informasi lebih lanjut mengenai Syarat dan Ketentuan ini, Pengguna dapat menghubungi Tim Layanan Pelanggan Platform melalui:</p>
              <ul class="list-disc pl-5 space-y-1.5 text-slate-700">
                <li><strong>Email Resmi:</strong> <a href="mailto:support@bekasku.id" class="text-[#E31B23] hover:underline font-medium">support@bekasku.id</a></li>
                <li><strong>Live Chat:</strong> Tersedia di aplikasi mobile Bekasku (24 jam)</li>
                <li><strong>Nomor Telepon:</strong> 0821 238 2388 (Senin–Jumat 09.00 - 17.00 WIB)</li>
              </ul>
            </div>

            <!-- Signature Box -->
            <div class="mt-8 pt-6 border-t border-slate-200 bg-slate-50 p-6 rounded-xl space-y-2 text-xs text-slate-600">
              <p class="italic">
                Dengan menggunakan Platform ini, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan yang tercantum di atas.
              </p>
              <div class="pt-2 font-medium text-slate-900">
                <p>Ditetapkan di: Jakarta</p>
                <p>Tanggal Berlaku: 1 Januari 2025</p>
                <p class="text-[#E31B23] font-bold mt-1">Tim Hukum dan Kepatuhan Bekasku</p>
                <p class="text-slate-500 font-normal">PT. Jantaka Ladang Unggul</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>

    <!-- Footer -->
    <footer class="w-full bg-slate-900 text-slate-400 py-8 text-xs text-center border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 space-y-2">
        <p>&copy; {{ new Date().getFullYear() }} Bekasku (PT. Jantaka Ladang Unggul). Seluruh Hak Cipta Dilindungi.</p>
        <div class="flex items-center justify-center gap-4 text-slate-500">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <span>&bull;</span>
          <NuxtLink to="/terms" class="text-white font-medium hover:underline">Syarat &amp; Ketentuan</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ArrowLeft, FileText, Shield, Info } from 'lucide-vue-next';

useHead({
  title: 'Syarat dan Ketentuan — Bekasku',
  meta: [
    {
      name: 'description',
      content: 'Syarat dan Ketentuan resmi penggunaan platform jual beli barang baru dan bekas Bekasku. Berlaku efektif mulai 1 Januari 2025.',
    },
    { property: 'og:title', content: 'Syarat dan Ketentuan — Bekasku' },
    {
      property: 'og:description',
      content: 'Syarat dan Ketentuan resmi penggunaan platform jual beli barang baru dan bekas Bekasku.',
    },
    { property: 'og:type', content: 'website' },
  ],
});

const tableOfContents = [
  { id: 'pendahuluan', title: 'Pendahuluan' },
  { id: 'bab-1', title: 'Bab I: Definisi dan Interpretasi' },
  { id: 'bab-2', title: 'Bab II: Ketentuan Akun & Pendaftaran' },
  { id: 'bab-3', title: 'Bab III: Ketentuan Penjual' },
  { id: 'bab-4', title: 'Bab IV: Ketentuan Pembeli' },
  { id: 'bab-5', title: 'Bab V: Ketentuan Transaksi' },
  { id: 'bab-6', title: 'Bab VI: Produk Dilarang & Dibatasi' },
  { id: 'bab-7', title: 'Bab VII: Konten & Hak Kekayaan Intelektual' },
  { id: 'bab-8', title: 'Bab VIII: Privasi & Keamanan Data' },
  { id: 'bab-9', title: 'Bab IX: Penyelesaian Sengketa' },
  { id: 'bab-10', title: 'Bab X: Larangan & Sanksi' },
  { id: 'bab-11', title: 'Bab XI: Program & Fitur Khusus' },
  { id: 'bab-12', title: 'Bab XII: Ketentuan Khusus Barang Bekas' },
  { id: 'bab-13', title: 'Bab XIII: Tanggung Jawab & Batasan' },
  { id: 'bab-14', title: 'Bab XIV: Ketentuan Umum & Penutup' },
];
</script>
