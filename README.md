# Laskar Pecahan

Game 3D untuk latihan **TKA (Tes Kemampuan Akademik) Matematika SD**, bab **Pecahan**.
Dirancang untuk layar sentuh besar seperti **TV Merah Putih**, tetapi juga bisa dimainkan di laptop, tablet, dan HP.

Anak-anak memilih karakter lucu, lalu bertanding menjawab soal pecahan yang muncul terus-menerus sampai waktu permainan habis. Di akhir ada podium juara dan file **Soal & Pembahasan** yang bisa diunduh untuk belajar ulang.

## Fitur

- **1, 2, atau 4 pemain.** Layar dibagi dua (2 pemain) atau 2×2 (4 pemain). Setiap pemain punya arena 3D, jam, dan soal sendiri. Mendukung multi-sentuh, jadi semua anak bisa menekan bersamaan.
- **4 karakter 3D:** Miko (kucing oren), Pipi (kelinci), Bubu (panda), dan Kiko (katak).
- **Soal tanpa batas, tanpa AI dan tanpa internet.** Soal dibuat dari template dan angka acak, lalu jawabannya dihitung dengan rumus, jadi selalu benar.
- **Urutan soal:** soal biasa → soal konsep → **soal cerita**, berulang. Setiap soal ke-3, 6, 9, … adalah soal cerita.
- **6 sub-bab Pecahan:**
  1. Konsep pecahan
  2. Hubungan bentuk pecahan (desimal, persen, pecahan biasa, pecahan campuran)
  3. Membandingkan dan mengurutkan pecahan
  4. Penjumlahan dan pengurangan
  5. Perkalian dan pembagian
  6. Operasi hitung campuran
- **Pengaturan bisa diubah:** nama kelompok, lama permainan (bawaan 5 menit), waktu tiap soal (bawaan 30 detik), dan pengurangan poin kalau salah (0, −5, atau −10). Jawaban benar selalu +5.
- **Waktu terasa menegangkan:** jam besar, peringatan 1 menit dan 30 detik, hitung mundur 10 detik terakhir, dan musik yang makin cepat.
- **Dua tema suara:** *Petualangan* (chiptune) dan *Ceria Gelembung* (imut, gaya Pou). Semua suara dibuat dengan kode, tanpa file audio. Suara bisa dimatikan.
- **Podium juara** dengan medali, papan nama, dan konfeti.
- **Soal & Pembahasan** yang bisa dibaca di layar atau diunduh (HTML, bisa dicetak atau disimpan sebagai PDF). Ada dua versi: lengkap dengan pembahasan langkah demi langkah, atau lembar latihan dengan kunci jawaban di akhir.

## Versi online

Repositori: https://github.com/Fatihulqolbi/Game-Takal-5. Situs ini statis (HTML/CSS/JS tanpa build), jadi bisa langsung di-hosting di Vercel: **Add New → Project → Import** repositori ini, biarkan *Framework Preset* = **Other**, kosongkan *Build Command*, lalu **Deploy**. Setiap push ke cabang `main` akan memperbarui situsnya otomatis.

## Cara menjalankan

Game ini hanya berupa file HTML, CSS, dan JavaScript biasa. Tidak perlu `npm install`, tidak perlu build, dan tidak perlu server khusus.

### Cara 1: buka langsung (paling mudah)

1. Ekstrak file zip.
2. Klik dua kali `index.html`. Buku **Jejak Mengajar** terbuka sebagai menu utama di browser (disarankan Chrome atau Edge).
3. Buka Bab 1 untuk **Laskar Pecahan** atau Bab 2 untuk **DIMENSIA**, lalu tekan **Main**.

Saat pertama dibuka, komputer perlu internet untuk mengambil library 3D (three.js) dan font. Kalau ingin bisa main tanpa internet, lihat bagian **Mode offline** di bawah.

### Cara 2: lewat server lokal (disarankan untuk uji coba)

Beberapa browser membatasi file yang dibuka langsung dari folder. Kalau ada yang tidak berjalan, jalankan server lokal dari dalam folder proyek:

```bash
# Pilih salah satu
python -m http.server 8000
# atau
npx serve . -l 8000
```

Lalu buka `http://localhost:8000` di browser. Halaman awal langsung menampilkan buku sebagai menu utama semua game:

- **Bab 1 → Main:** Laskar Pecahan (`pecahan.html`).
- **Bab 2 → Main:** DIMENSIA (`dimensia/index.html`).

Di menu masing-masing game, gunakan **Kembali ke buku** untuk kembali ke babnya.

### Cara 3: online gratis dengan GitHub Pages

1. Buat repository baru di GitHub, misalnya `laskar-pecahan`.
2. Unggah semua isi folder ini. Pastikan `index.html` ada di root repository.

   ```bash
   git init
   git add .
   git commit -m "Laskar Pecahan: game latihan pecahan"
   git branch -M main
   git remote add origin https://github.com/USERNAME/laskar-pecahan.git
   git push -u origin main
   ```

3. Di GitHub buka **Settings → Pages**. Pada *Source* pilih **Deploy from a branch**, pilih branch `main` dan folder `/ (root)`, lalu **Save**.
4. Tunggu 1–2 menit. Game bisa dibuka di `https://USERNAME.github.io/laskar-pecahan/`.

## Memainkan di TV Merah Putih

TV Merah Putih berbasis Android, jadi caranya sama seperti membuka situs web:

1. Buka **Chrome** di TV, lalu masukkan alamat GitHub Pages Anda.
2. Tekan tombol **Layar penuh** di menu game.
3. Supaya mudah dibuka lagi, pilih menu Chrome **⋮ → Tambahkan ke layar utama**.

Kalau koneksi internet di sekolah tidak stabil, gunakan **mode offline** di bawah supaya game tetap jalan.

## Mode offline

Game memakai three.js versi **r128**. Secara bawaan, file ini diambil dari CDN. Supaya bisa dimainkan tanpa internet:

1. Unduh file `three.min.js` versi r128 dari
   `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
2. Simpan di folder `vendor/` dengan nama `three.min.js`.

Jika file ini ada, game akan memakainya. Jika tidak ada, game otomatis mengambil dari CDN. Tanpa internet, font akan diganti font bawaan perangkat, tetapi game tetap berjalan normal.

## Kontrol keyboard (untuk uji coba di laptop)

| Pemain | Pilihan A | B | C | D |
|---|---|---|---|---|
| P1 | `1` | `2` | `3` | `4` |
| P2 | `7` | `8` | `9` | `0` |
| P3 | `Q` | `W` | `E` | `R` |
| P4 | `U` | `I` | `O` | `P` |

## Struktur folder

```
laskar-pecahan/
├── index.html       Buku Jejak Mengajar: menu utama semua game
├── buku.html        Pengalihan alamat buku lama ke index.html
├── pecahan.html     Laskar Pecahan (menu, pilih karakter, persiapan, game, podium)
├── css/
│   └── style.css    Tampilan dan tata letak layar
├── js/
│   ├── soal.js      Bank soal: pembuat soal acak, pilihan jawaban, dan pembahasan
│   ├── grafis3d.js  Karakter 3D, monster slime, dan arena
│   └── game.js      Alur permainan, suara, timer, podium, dan unduhan pembahasan
└── vendor/          (opsional) three.min.js untuk mode offline
```

## Mengubah atau menambah soal

Semua soal ada di `js/soal.js`, di dalam objek `GEN`. Setiap sub-bab (1–6) punya tiga kelompok soal: `biasa`, `konsep`, dan `cerita`. Setiap soal adalah fungsi yang mengembalikan:

- teks soal,
- pilihan jawaban (dibuat oleh `fracOpts`, `rawOpts`, atau `textOpts`),
- daftar langkah pembahasan (`steps`).

Untuk menambah variasi, salin salah satu fungsi soal yang sudah ada, ubah kalimat dan rumusnya, lalu letakkan di kelompok yang sesuai. Ringkasan materi "Ingat ya!" di file pembahasan ada di objek `TIPS`.

Untuk bab baru (misalnya Bangun Datar), tambahkan nomor topik baru di `GEN`, `TOPICS`, dan `TIPS`.

## Buku "Jejak Mengajar" dan game DIMENSIA

`index.html` adalah buku pop-up 3D yang menjadi menu utama semua game dan langsung terbuka di `http://localhost:8000`. Bab 1 membuka Laskar Pecahan (`pecahan.html`), Bab 2 membuka halaman DIMENSIA (`dimensia/index.html`). Halaman DIMENSIA berisi empat pilihan: **Kota Langit** (game baru), **Lab Bebas**, **Petualangan Misi**, dan **Simulasi TKA**.

Semua halaman memakai satu tema: langit biru, garis tinta tebal, tombol *chunky*, dan huruf Baloo 2/Nunito dari `css/style.css`. Kota Langit memuat `css/style.css` langsung; lab DIMENSIA memakai token warna yang sama di `dimensia/css/dimensia.css`. Alamat lama `buku.html` tetap dapat dipakai dan diarahkan ke buku, termasuk nomor babnya.

**DIMENSIA: Kota Langit** (`dimensia/kota-langit.html`) adalah lomba menumpuk bangun ruang (kubus, balok, tabung, prisma segienam) untuk **1, 2, atau 4 pemain**. Masuk lewat Bab 2 di buku, tekan **Mulai Petualangan**, pilih **Main Kota Langit**, pilih jumlah pemain, lalu setiap pemain **memilih robotnya** (tiap robot punya suara sendiri saat diketuk). Setelah itu atur nama kelompok, waktu permainan, waktu soal, tingkat soal, volume, dan penalti.

- **Prinsip keseimbangan:** bangun hanya diam kalau titik tengahnya berada di atas bangun penopangnya. Kalau titik berat gabungan bagian atas keluar dari tumpuannya, bagian itu jatuh (berat dihitung dari lebar × tinggi).
- **Seret dan lepas** bangun ruang yang melayang ke atas menara. Susunan tepat mendapat pujian robot. Jika meleset, coba lagi. Urutan bangun acak sama untuk setiap pemain dalam satu sesi.
- **Prinsip keseimbangan:** bangun hanya bisa diletakkan kalau titik tengahnya di atas tumpuan dan menara tidak terlalu miring. Kalau salah letak, robot memberi peringatan dan bangun kembali ke tangan pemain; tidak ada bangun yang jatuh.
- Setiap pemasangan berhasil ke-**3, 6, 9, ...** memicu **gempa, ekspresi panik, dan soal geometri** di arena pemain itu. Pemain lain tetap dapat membangun dan menjawab secara bersamaan.
- **Penalti pilihan:** tanpa pengurangan, kurangi **3**, atau kurangi **5** bangun teratas jika jawaban salah/waktu soal habis. Maksimal yang dilepas adalah bangun yang masih ada.
- **Soal terus dibuat** dari 24 template dengan angka, bentuk, konteks, dan pilihan acak. Jenisnya PG, PGK beberapa jawaban, dan kategori benar/salah. Ada pembahasan setelah menjawab dan unduhan HTML di akhir sesi.
- **Jenis soal dapat dipilih:** Soal 2D (bangun datar: sisi, keliling, luas, sudut), Soal 3D (bangun ruang: volume, susunan kubus, tampak), atau keduanya.
- Materi: sifat bangun datar/ruang, luas, keliling, volume, sudut, susunan kubus, dan tampak bangun. Cakupan latihan merujuk [matriks TKA Matematika SD](https://pusmendik.kemdikbud.go.id/tka/tka/view/mata-pelajaran-wajib/sd). Soal merupakan latihan yang dibuat aplikasi, bukan salinan bank soal resmi.
- Peringkat dihitung dari **tinggi akhir**, lalu jumlah jawaban benar, lalu susunan tepat. Bila semua sama, nomor pemain menjadi pengurut terakhir. Mode empat pemain menampilkan juara 1–4.
- **Jeda** menghentikan waktu permainan dan waktu setiap soal. Berpindah tab otomatis menjeda permainan. Guncangan dapat dimatikan; preferensi gerakan minimal perangkat juga dihormati.
- **Kembali ke buku** memakai transisi animasi dan membuka bab yang sesuai. Volume DIMENSIA dan Laskar Pecahan dapat diatur; suara diperkuat dengan pembatas dinamika.

Kontrol tambahan:

- Untuk kontrol keyboard, fokuskan pegangan bangun dengan Tab, gunakan panah kiri/kanan untuk menggeser, lalu Enter/Spasi untuk melepaskan.
- Pilihan A–D: P1 `1 2 3 4`, P2 `7 8 9 0`, P3 `Q W E R`, P4 `U I O P`. Pada soal beberapa jawaban, kunci dengan tombol **Kunci jawaban**.
- `Esc` untuk jeda/lanjut.

Lab Bangun Datar 2D (pilih persegi, persegi panjang, segitiga, jajargenjang, trapesium, belah ketupat, segilima, atau segienam; pelajari sisi, keliling, dan luas), Lab Kubus 3D, Petualangan Misi, dan simulasi enam soal ada di halaman DIMENSIA yang sama (`dimensia/index.html`). Tautan langsungnya `index.html?buka=lab:kubus`, `index.html?buka=misi:hitung&lv=2`, atau `index.html?buka=tka:`. Alamat lama `dimensia/lab.html` diarahkan ke halaman itu.

Struktur:

```
dimensia/
├── index.html           Halaman DIMENSIA: robot, Kota Langit, lab, misi, simulasi
├── kota-langit.html     Kota Langit: menu, pengaturan, arena, podium
├── lab.html             Pengalihan alamat lama ke index.html
├── css/menara.css       Tata letak Kota Langit (tema dari ../css/style.css)
├── css/dimensia.css     Tampilan laboratorium
└── js/
    ├── menara-core.js   Aturan susunan, penalti, pengaturan, peringkat
    ├── menara-game.js   Alur permainan, seret multi-sentuh, soal, hasil
    ├── menara-scene.js  Rumah prosedural, kota 3D, kamera, gempa
    ├── menara-audio.js  Musik, hitung mundur, dan efek permainan
    ├── menara-ui.js     Chip dan tombol tambah/kurang di layar persiapan
    ├── soal-menara.js   Generator 24 template soal dan pembahasan
    ├── kubus-data.js    Susunan kubus, proyeksi, pembuat dan validator soal
    ├── poligon-data.js  Bangun datar 2D, rumus keliling & luas, pernyataan PGK, validator
    ├── arena3d.js       Arena kubus 3D, Bedah 3D, Kamera Ajaib
    ├── arena2d.js       Arena bangun datar di kertas berpetak
    ├── robot.js         Robot Orbo, Hexi, Nova, Zipp
    └── main.js          Alur mode, suara, penyimpanan lokal
```

Pemeriksaan pengembang (tanpa `npm install`):

```bash
node --test tests/dimensia.test.cjs
node tests/browser-game.cjs
node tests/browser-game.cjs --extra
```

Tes browser menggunakan Chrome lokal dalam mode headless dan profil sementara. Atur `BROWSER_BIN` jika lokasi Chrome/Edge berbeda. Hasil tangkapan layar QA disimpan di `.qa/`.

## Teknologi

- HTML, CSS, dan JavaScript tanpa framework
- [three.js](https://threejs.org/) r128 untuk grafis 3D
- Web Audio API untuk musik dan efek suara
- Font: Baloo 2 dan Nunito dari Google Fonts

Pengaturan terakhir (lama permainan, nama kelompok, tema suara, dan lain-lain) disimpan di browser perangkat masing-masing.
