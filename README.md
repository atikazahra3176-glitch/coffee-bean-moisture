# Impact of Coffee Bean Moisture Synchroniser

Website interaktif dan responsif yang menampilkan visualisasi data kelembapan udara provinsi Indonesia dan perbandingan kadar air biji kopi (Normal vs Over Roast).

## 🌟 Fitur Utama

- **Slicer (Dropdown)**: Pilih provinsi atau lihat data seluruh Indonesia
- **4 Kartu Metrik**: 
  - Humidity (%)
  - Normal (%)
  - Over Roast (%)
  - Moisture Risk Index
- **Clustered Column Chart**: Perbandingan Normal vs Over Roast per provinsi
- **Shape Map (Leaflet)**: Peta interaktif dengan marker berwarna sesuai kelembapan udara
- **Legenda Peta**: Toggle untuk tampilkan/sembunyikan legenda humidity gradient
- **Tabel Data Filterable**: 
  - Search real-time berdasarkan province atau notes
  - Sort kolom (klik header untuk urutkan ascending/descending)
````markdown
# Impact of Coffee Bean Moisture Synchroniser

Website interaktif dan responsif yang menampilkan visualisasi data kelembapan udara provinsi Indonesia dan perbandingan kadar air biji kopi (Normal vs Over Roast).

## 🌟 Fitur Utama

- **Slicer (Dropdown)**: Pilih provinsi atau lihat data seluruh Indonesia
- **4 Kartu Metrik**: 
  - Humidity (%)
  - Normal (%)
  - Over Roast (%)
  - Moisture Risk Index
- **Clustered Column Chart**: Perbandingan Normal vs Over Roast per provinsi
- **Shape Map (Leaflet)**: Peta interaktif dengan marker berwarna sesuai kelembapan udara
- **Legenda Peta**: Toggle untuk tampilkan/sembunyikan legenda humidity gradient
- **Tabel Data Filterable**: 
  - Search real-time berdasarkan province atau notes
  - Sort kolom (klik header untuk urutkan ascending/descending)
- **Download CSV**: Export data ke file CSV
- **Analisis Kesimpulan**: Jawaban & statistik dataset dengan korelasi humidity vs over-roast

## 🎨 Desain

- Palet warna: **Hijau (#2d5016, #4a7c3d), Pink (#e85d75), dan Cream (#fff8f3)**
- Responsive design (mobile-friendly)
- Smooth animations dan hover effects

## 📊 Dataset

Data mencakup 34 provinsi di Indonesia dengan atribut:
- `province`: Nama provinsi
- `humidity`: Persentase kelembapan udara (%)
- `normal_pct`: Persentase biji kopi normal (%)
- `overroast_pct`: Persentase biji kopi over-roast (%)
- `notes`: Deskripsi karakteristik regional

## 🚀 Cara Menggunakan

### Tanpa Server (Rekomendasi)
1. Buka file `index_local.html` langsung di browser (double-click atau drag ke browser)
2. Semua fitur akan berfungsi offline

### Dengan Server (Opsional)
Jika Anda punya Node.js:
```powershell
npm install
npm start
# Buka http://localhost:8000 di browser
```

Atau gunakan Python:
```powershell
python -m http.server 8000
# Buka http://localhost:8000 di browser
```

## 📁 Struktur Proyek

```
tik fix/
├── index.html              # Landing page / homepage (this file)
├── viz.html                # Visualisasi (server-mode page, was index.html)
├── index_local.html        # Versi lokal (data inline, no server)
├── css/
│   └── styles.css         # Styling utama
├── js/
│   └── main.js            # JavaScript logic
├── data/
│   ├── coffee_data.json   # Dataset 34 provinsi
│   └── indonesia_provinces_points.geojson  # Koordinat peta
├── package.json           # Node dependencies
├── .gitignore
└── README.md
```

## 📝 Kesimpulan Penelitian

**Pertanyaan:** Apakah kadar air biji kopi >1% termasuk kategori over-roasted?

**Jawaban:** **TIDAK**

Berdasarkan analisis dataset:
- Rata-rata persentase Over Roast di seluruh provinsi: **11.0%**
- Jangkauan: **4% - 25%**
- Kadar air >1% adalah kondisi NORMAL dan sehat untuk kopi yang disimpan
- Over-roasting ditentukan oleh tingkat kematangan roasting, BUKAN kadar air penyimpanan
- Kelembapan udara memengaruhi penyimpanan tetapi TIDAK menentukan over-roasting

## 🛠️ Teknologi

- **HTML5** - Struktur markup
- **CSS3** - Styling responsif
- **JavaScript (Vanilla)** - Logic & interaktivitas
- **Chart.js** - Visualisasi chart
- **Leaflet.js** - Peta interaktif
- **jQuery** - DOM manipulation (optional)
- **DataTables** - Table filtering (optional, ada fallback native)

## 📦 Library Eksternal (CDN)

- Chart.js 4.4.0
- Leaflet 1.9.3
- jQuery 3.7.1
- DataTables 1.13.6
- OpenStreetMap Tiles

## 💡 Catatan

- Peta memerlukan koneksi internet untuk meload tile dari OpenStreetMap
- Data bersifat fiktif namun realistis sesuai konteks penelitian
- Search dan sort tabel berfungsi dengan JavaScript native (tidak bergantung pada DataTables)

## 👨‍💻 Author

GitHub: [@atikazahra3176-glitch](https://github.com/atikazahra3176-glitch)

## 📄 Lisensi

MIT License

````

