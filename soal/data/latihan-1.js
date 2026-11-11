/* Latihan Paket 1: Bilangan & Penyajian Data. Dua cerita (Pak Ari 7 butir, Bu Dina 8 butir); informasi diberikan bertahap per butir.
   Jenis bagian jawaban: angka (dicocokkan angkanya), pg (pilihan ganda), bs (Benar/Salah per pernyataan). */
(function(g){
  const p={
    id:'latihan-1',nama:'Paket 1',jenis:'latihan',ket:'Bilangan, Pengukuran & Penyajian Data',
    soal:[{
      judul:'Taman Pak Ari',
      teks:'Pak Ari memiliki sebuah taman berbentuk segi banyak.',
      butir:[
        {teks:'Gara-gara banyak hewan tak diundang, Pak Ari ingin membuat pagar yang mengelilingi tamannya seperti pada gambar. Ia membuat gerbang kecil dengan panjang 1 m (bagian gerbang tidak dipagar). Membangun taman ini memerlukan 5 bulan. Berapa total panjang pagar Pak Ari?',
         gambar:'img/latihan-1/taman.png',alt:'Taman berbentuk segi banyak dengan sisi 3 m, 3 m, 9 m, 4 m, 4 m, dan 4 m',
         bagian:[{kind:'angka',label:'Panjang pagar',jawab:26,unit:'m'}],
         bahas:'Keliling taman = 3 + 3 + 9 + 4 + 4 + 4 = 27 m.\nGerbang 1 m tidak dipagar, jadi panjang pagar = 27 − 1 = 26 m.'},
        {teks:'Harga pagar siap pasang sekarang Rp 70.000 per meter. Berapa biaya yang harus dikeluarkan Pak Ari?',
         gambar:'img/latihan-1/taman.png',alt:'Denah taman dengan sisi 3 m, 3 m, 9 m, 4 m, 4 m, dan 4 m',
         bagian:[{kind:'angka',label:'Biaya pagar',jawab:1820000,prefix:'Rp'}],
         bahas:'Biaya = 26 × 70.000 = Rp 1.820.000.'},
        {teks:'Setelah 1 tahun, Pak Ari ingin membuat taman tertutup, yaitu taman dengan atap yang bentuknya sama persis dengan luas taman, dan dinding berongga yang menutupinya. Tinggi dinding 10 m. (Ingat, volume = luas alas × tinggi.) Hitung volume ruang taman Pak Ari!',
         gambar:'img/latihan-1/taman.png',alt:'Taman berbentuk segi banyak dengan sisi 3 m, 3 m, 9 m, 4 m, 4 m, dan 4 m',
         bagian:[{kind:'angka',label:'Volume',jawab:340,unit:'m³'}],
         bahas:'Luas alas dihitung dengan membagi taman menjadi dua bagian.\nBagian kiri berbentuk trapesium (sisi sejajar 3 m dan 9 m, tinggi 3 m): (3 + 9) : 2 × 3 = 18 m².\nBagian kanan berbentuk persegi 4 m × 4 m: 4 × 4 = 16 m².\nLuas alas = 18 + 16 = 34 m².\nVolume = luas alas × tinggi = 34 × 10 = 340 m³.'},
        {teks:'Setelah 1 bulan, Pak Ari tidak puas dengan tinggi tamannya, lalu meninggikannya lagi 5 m. Jadi tingginya sekarang 15 m. Berapa total volume ruang taman sekarang?',
         gambar:'img/latihan-1/taman-tinggi-15.png',alt:'Taman tertutup dengan tinggi dinding 15 m',
         bagian:[{kind:'angka',label:'Volume',jawab:510,unit:'m³'}],
         bahas:'Volume = 34 × 15 = 510 m³.'},
        {teks:'Setelah 2 bulan, Pak Ari meninggikan lagi tamannya 2 m. Jadi tingginya sekarang 17 m. Berapa total volume ruang taman sekarang?',
         gambar:'img/latihan-1/taman-tinggi-17.png',alt:'Taman tertutup dengan tinggi dinding 17 m',
         bagian:[{kind:'angka',label:'Volume',jawab:578,unit:'m³'}],
         bahas:'Volume = 34 × 17 = 578 m³.'},
        {teks:'Dari kisah ini, Pak Ari memerlukan waktu 1 tahun dan 8 bulan untuk membangun tamannya sampai jadi taman yang sekarang. Berapa total minggu dari awal membangun sampai jadi? (Anggap 1 bulan = 4 minggu.)',
         gambar:'img/latihan-1/taman-waktu.png',alt:'Garis waktu pembangunan: 5 bulan, 1 tahun, 1 bulan, 2 bulan',
         bagian:[{kind:'angka',label:'Total waktu',jawab:80,unit:'minggu'}],
         bahas:'1 tahun 8 bulan = 12 + 8 = 20 bulan.\n20 × 4 = 80 minggu.'},
        {teks:'Berapa total hari dari awal membangun sampai jadi taman yang sekarang? (1 minggu = 7 hari.)',
         gambar:'img/latihan-1/taman-waktu.png',alt:'Garis waktu pembangunan: 5 bulan, 1 tahun, 1 bulan, 2 bulan',
         bagian:[{kind:'angka',label:'Total waktu',jawab:560,unit:'hari'}],
         bahas:'80 minggu × 7 = 560 hari.'}
      ]},{
      judul:'Pesanan Kue Bu Dina',
      teks:'Bu Dina menerima pesanan kue untuk acara sekolah. Ia memiliki 24 kg tepung.',
      butir:[
        {teks:'Tepung dipakai selama 4 hari seperti pada gambar. Hari Kamis ia memakai seluruh sisanya. Hitung kg tepung tiap hari, lalu pilih urutan dari yang paling sedikit!',
         gambar:'img/latihan-1/tepung.png',alt:'Pemakaian tepung 24 kg: Senin 1/4 bagian, Selasa 0,3 bagian, Rabu 20%, Kamis sisanya',
         bagian:[
          {kind:'angka',label:'Senin',jawab:6,unit:'kg'},{kind:'angka',label:'Selasa',jawab:7.2,unit:'kg'},
          {kind:'angka',label:'Rabu',jawab:4.8,unit:'kg'},{kind:'angka',label:'Kamis',jawab:6,unit:'kg'},
          {kind:'pg',label:'Urutan dari paling sedikit',opsi:['Senin < Rabu < Kamis < Selasa','Rabu < Senin = Kamis < Selasa','Rabu < Selasa < Senin = Kamis','Selasa < Senin = Kamis < Rabu'],benar:1}],
         bahas:'Senin 1/4 × 24 = 6 kg. Selasa 0,3 × 24 = 7,2 kg. Rabu 20% × 24 = 4,8 kg. Kamis memakai sisanya: 24 − 6 − 7,2 − 4,8 = 6 kg.\nUrutan: Rabu (4,8) < Senin = Kamis (6) < Selasa (7,2).'},
        {teks:'Tentukan Benar atau Salah pada setiap pernyataan berikut!',
         bagian:[{kind:'bs',baris:[
          {teks:'Tepung hari Kamis sama banyak dengan hari Senin.',benar:true},
          {teks:'Tepung hari Selasa lebih dari 1/3 seluruh tepung.',benar:false},
          {teks:'Tepung hari Rabu lebih dari 1/5 seluruh tepung.',benar:false}]}],
         bahas:'(i) Benar: Kamis 6 kg dan Senin 6 kg.\n(ii) Salah: 1/3 × 24 = 8 kg, sedangkan Selasa 7,2 kg (kurang dari 8).\n(iii) Salah: 20% = 1/5, jadi tepat sama, bukan lebih.'},
        {teks:'Ternyata 1,5 kg tepung tumpah di hari Selasa. Seluruh tepung yang tersisa dipakai untuk membuat kue bolu, 1 kue bolu memerlukan ¾ kg tepung. Berapa kue bolu yang dibuat?',
         bagian:[{kind:'angka',label:'Kue bolu',jawab:30,unit:'kue'}],
         bahas:'Tepung tersisa 24 − 1,5 = 22,5 kg.\n22,5 : ¾ = 22,5 × 4/3 = 30 kue bolu.'},
        {teks:'Bu Dina juga membuat 45 kue lapis. Bolu dan lapis dikemas dalam dus dengan isi sama, tanpa sisa, dan tiap dus berisi kedua jenis kue. Paling banyak berapa dus yang bisa dibuat? Berapa bolu dan lapis tiap dus?',
         bagian:[{kind:'angka',label:'Banyak dus',jawab:15,unit:'dus'},{kind:'angka',label:'Bolu tiap dus',jawab:2,unit:'kue'},{kind:'angka',label:'Lapis tiap dus',jawab:3,unit:'kue'}],
         bahas:'Dus terbanyak = FPB(30, 45) = 15 dus.\nTiap dus: 30 : 15 = 2 bolu dan 45 : 15 = 3 lapis.'},
        {teks:'Harga kue ada pada gambar. Pilih kalimat matematika yang tepat, lalu hitung pendapatan jika 15 dus terjual tanpa diskon!',
         gambar:'img/latihan-1/harga.png',alt:'Kue bolu Rp 4.500 per buah, kue lapis Rp 3.500 per buah',
         bagian:[{kind:'pg',label:'Kalimat matematika',opsi:['15 × 2 × 4.500 + 3 × 3.500','15 + (2 × 4.500 + 3 × 3.500)','15 × (2 × 4.500 + 3 × 3.500)','(15 × 2 + 3) × (4.500 + 3.500)'],benar:2},
                 {kind:'angka',label:'Pendapatan',jawab:292500,prefix:'Rp'}],
         bahas:'Harga 1 dus = 2 × 4.500 + 3 × 3.500 = 9.000 + 10.500 = Rp 19.500.\nPendapatan 15 dus = 15 × (2 × 4.500 + 3 × 3.500) = 15 × 19.500 = Rp 292.500.'},
        {teks:'Selama memanggang, dua oven berbunyi bersamaan pertama kali pukul 08.00 (lihat gambar). Bu Dina berhenti memanggang sebelum pukul 10.00. Berapa kali oven berbunyi bersamaan, dan kapan yang terakhir?',
         gambar:'img/latihan-1/oven.png',alt:'Oven A berbunyi tiap 12 menit, oven B tiap 18 menit',
         bagian:[{kind:'angka',label:'Banyak bunyi bersamaan (termasuk 08.00)',jawab:4,unit:'kali'},
                 {kind:'pg',label:'Bunyi bersamaan terakhir sebelum 10.00',opsi:['09.48','09.36','10.24','09.12'],benar:0}],
         bahas:'KPK(12, 18) = 36 menit.\nBunyi bersamaan: 08.00, 08.36, 09.12, 09.48. Berikutnya 10.24 sudah lewat pukul 10.00.\nJadi 4 kali, yang terakhir pukul 09.48.'},
        {teks:'Dus dijual selama 4 hari (lihat diagram). Pada hari Selasa dan Kamis, harga dus diberi diskon 10%. Berapa total pendapatan Bu Dina? Jika modalnya Rp 187.500, berapa keuntungannya?',
         gambar:'img/latihan-1/penjualan.png',alt:'Diagram batang dus terjual: Senin 3, Selasa 5, Rabu 2, Kamis 5',
         bagian:[{kind:'angka',label:'Total pendapatan',jawab:273000,prefix:'Rp'},{kind:'angka',label:'Keuntungan',jawab:85500,prefix:'Rp'}],
         bahas:'Hari tanpa diskon (Senin dan Rabu): (3 + 2) × 19.500 = Rp 97.500.\nHari diskon (Selasa dan Kamis): (5 + 5) × 90% × 19.500 = 10 × 17.550 = Rp 175.500.\nTotal = 97.500 + 175.500 = Rp 273.000.\nKeuntungan = 273.000 − 187.500 = Rp 85.500.'},
        {teks:'Berapa rata-rata dus terjual per hari? Agar rata-rata menjadi 4 dus per hari, hari Rabu seharusnya terjual berapa dus?',
         gambar:'img/latihan-1/penjualan.png',alt:'Diagram batang dus terjual: Senin 3, Selasa 5, Rabu 2, Kamis 5',
         bagian:[{kind:'angka',label:'Rata-rata sekarang',jawab:3.75,unit:'dus'},{kind:'angka',label:'Rabu seharusnya',jawab:3,unit:'dus'}],
         bahas:'Rata-rata = (3 + 5 + 2 + 5) : 4 = 15 : 4 = 3,75 dus.\nRata-rata 4 dus selama 4 hari berarti total 4 × 4 = 16 dus.\nRabu = 16 − 3 − 5 − 5 = 3 dus.'}
      ]}]
  };
  (g.SOAL_PAKET=g.SOAL_PAKET||{})[p.id]=p;
  if(typeof module!=='undefined')module.exports=p;
})(typeof window!=='undefined'?window:globalThis);
