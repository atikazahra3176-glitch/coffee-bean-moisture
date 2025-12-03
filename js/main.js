// main.js: load data, initialize chart, map, slicer, cards, and table

let coffeeData = [];
let map;
let markers = {};
let chart;
let dataTable;

async function loadData() {
  const [coffeeRes, geoRes] = await Promise.all([
    fetch('data/coffee_data.json'),
    fetch('data/indonesia_provinces_points.geojson')
  ]);
  coffeeData = await coffeeRes.json();
  const geojson = await geoRes.json();
  initSlicer(coffeeData);
  initMap(geojson);
  initChart();
  populateTable(coffeeData);
  setupControls();
  generateAnalysis();
  updateAll('All');
}

function setupControls() {
  const toggle = document.getElementById('toggleLegend');
  const download = document.getElementById('downloadCsv');
  if (toggle) toggle.addEventListener('click', () => {
    const el = document.getElementById('mapLegend');
    if (!el) return;
    el.style.display = (el.style.display === 'none') ? '' : 'none';
  });
  if (download) download.addEventListener('click', () => downloadCSV());
  makeTableSortable();
}

function initSlicer(data) {
  const sel = document.getElementById('provinceSelect');
  const provinces = data.map(d => d.province).sort();
  provinces.forEach(p => {
    const o = document.createElement('option'); o.value = p; o.textContent = p; sel.appendChild(o);
  });
  sel.addEventListener('change', e => updateAll(e.target.value));
}

function initMap(geojson) {
  map = L.map('map').setView([-2.5, 118], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

  function colorForHumidity(h) {
    // blue low (30) -> red high (90)
    const min = 30, max = 90; const ratio = Math.max(0, Math.min(1, (h - min) / (max - min)));
    const r = Math.round(255 * ratio); const g = Math.round(160 * (1 - ratio)); const b = Math.round(255 * (1 - ratio));
    return `rgb(${r},${g},${b})`;
  }

  geojson.features.forEach(f => {
    const p = f.properties.province;
    const coord = f.geometry.coordinates; // [lon, lat]
    const data = coffeeData.find(d => d.province === p);
    const hum = data ? data.humidity : 0;
    const marker = L.circleMarker([coord[1], coord[0]], {
      radius: 8,
      fillColor: colorForHumidity(hum),
      color: '#333', weight: 0.6, fillOpacity: 0.9
    }).addTo(map);
    marker.bindPopup(`<strong>${p}</strong><br>Humidity: ${hum}%<br>Normal: ${data ? data.normal_pct : '—'}%`);
    marker.on('click', () => {
      document.getElementById('provinceSelect').value = p;
      updateAll(p);
    });
    markers[p] = marker;
  });
  createMapLegend();
}

function createMapLegend() {
  const el = document.getElementById('mapLegend');
  if (!el) return;
  // create gradient legend from low to high humidity
  const levels = [30, 45, 60, 75, 90];
  el.innerHTML = '<strong>Humidity (%)</strong><br/>' + levels.map((v,i)=>{
    // reproduce colorForHumidity from initMap logic (approx)
    const min = 30, max = 90; const ratio = Math.max(0, Math.min(1, (v - min) / (max - min)));
    const r = Math.round(255 * ratio); const g = Math.round(160 * (1 - ratio)); const b = Math.round(255 * (1 - ratio));
    const color = `rgb(${r},${g},${b})`;
    return `<div style="margin-top:6px"><span class=\"legend-swatch\" style=\"background:${color}\"></span> ${v}%</div>`;
  }).join('');
}

function initChart() {
  const ctx = document.getElementById('clusterChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        { label: 'Normal (%)', data: [], backgroundColor: 'rgba(75,192,192,0.8)' },
        { label: 'Over Roast (%)', data: [], backgroundColor: 'rgba(255,99,132,0.8)' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { x: { stacked: false }, y: { beginAtZero: true, max: 100 } }
    }
  });
}

function updateChart(filtered) {
  const labels = filtered.map(d => d.province);
  const normal = filtered.map(d => d.normal_pct);
  const over = filtered.map(d => d.overroast_pct);
  chart.data.labels = labels;
  chart.data.datasets[0].data = normal;
  chart.data.datasets[1].data = over;
  chart.update();
}

function updateCards(filtered, selectedProvince) {
  const humidityEl = document.getElementById('cardHumidity');
  const normalEl = document.getElementById('cardNormal');
  const overEl = document.getElementById('cardOver');
  const riskEl = document.getElementById('cardRisk');

  if (selectedProvince && selectedProvince !== 'All') {
    const d = filtered[0];
    humidityEl.textContent = d ? `${d.humidity}%` : '—';
    normalEl.textContent = d ? `${d.normal_pct}%` : '—';
    overEl.textContent = d ? `${d.overroast_pct}%` : '—';
    riskEl.textContent = d ? `${((d.humidity*0.5)+(d.overroast_pct*0.5)).toFixed(1)}` : '—';
  } else {
    const avgHum = (filtered.reduce((s,d)=>s+d.humidity,0)/filtered.length).toFixed(1);
    const avgNormal = (filtered.reduce((s,d)=>s+d.normal_pct,0)/filtered.length).toFixed(1);
    const avgOver = (filtered.reduce((s,d)=>s+d.overroast_pct,0)/filtered.length).toFixed(1);
    const risk = (avgHum*0.5 + avgOver*0.5).toFixed(1);
    humidityEl.textContent = `${avgHum}%`;
    normalEl.textContent = `${avgNormal}%`;
    overEl.textContent = `${avgOver}%`;
    riskEl.textContent = `${risk}`;
  }
}

function populateTable(data) {
  const tbody = document.getElementById('tableBody'); tbody.innerHTML = '';
  data.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${d.province}</td><td>${d.humidity}</td><td>${d.normal_pct}</td><td>${d.overroast_pct}</td><td>${d.notes}</td>`;
    tbody.appendChild(tr);
  });
  // Initialize native search fallback
  initTableSearch();
}

function initTableSearch() {
  const input = document.getElementById('tableSearch');
  if (!input) return;
  input.addEventListener('input', e => {
    const q = (e.target.value || '').toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = text.indexOf(q) >= 0 ? '' : 'none';
    });
  });
}

function updateTableFilter(selected) {
  if (!dataTable) return; // fallback
  // If DataTables were present we'd filter; fallback: native search/filter
  const q = selected === 'All' ? '' : selected.toLowerCase();
  const rows = document.querySelectorAll('#tableBody tr');
  rows.forEach(r => {
    const text = r.textContent.toLowerCase();
    r.style.display = q === '' ? '' : (text.indexOf(q) >= 0 ? '' : 'none');
  });
}

function updateMapHighlight(selected) {
  Object.keys(markers).forEach(p => {
    const m = markers[p];
    if (p === selected) {
      m.setStyle({ radius: 12, weight: 1.2 });
      m.bringToFront();
      m.openPopup();
      map.setView(m.getLatLng(), 6);
    } else {
      m.setStyle({ radius: 8, weight: 0.6 });
      m.closePopup();
    }
  });
  if (selected === 'All') { map.setView([-2.5,118],4); }
}

function updateAll(selected) {
  const filtered = selected === 'All' ? coffeeData.slice() : coffeeData.filter(d => d.province === selected);
  updateChart(filtered);
  updateCards(filtered, selected);
  updateTableFilter(selected);
  updateMapHighlight(selected);
}

function generateAnalysis() {
  // Hitung statistik keseluruhan dataset
  const avgOverroast = (coffeeData.reduce((s,d)=>s+d.overroast_pct,0) / coffeeData.length).toFixed(1);
  const maxOverroast = Math.max(...coffeeData.map(d=>d.overroast_pct));
  const minOverroast = Math.min(...coffeeData.map(d=>d.overroast_pct));
  const maxHumidity = Math.max(...coffeeData.map(d=>d.humidity));
  const minHumidity = Math.min(...coffeeData.map(d=>d.humidity));
  
  // Hitung korelasi antara humidity dan over-roast
  const humidityList = coffeeData.map(d=>d.humidity);
  const overroastList = coffeeData.map(d=>d.overroast_pct);
  const avgHum = humidityList.reduce((s,x)=>s+x,0)/humidityList.length;
  const avgOver = overroastList.reduce((s,x)=>s+x,0)/overroastList.length;
  const numSum = humidityList.reduce((s,h,i)=>s+(h-avgHum)*(overroastList[i]-avgOver),0);
  const denSum = Math.sqrt(humidityList.reduce((s,h)=>s+(h-avgHum)**2,0) * overroastList.reduce((s,o)=>s+(o-avgOver)**2,0));
  const correlation = (numSum / denSum).toFixed(3);
  
  // Provinsi dengan over-roast tertinggi dan terendah
  const maxOverroastProvince = coffeeData.reduce((a,b)=>a.overroast_pct > b.overroast_pct ? a : b);
  const minOverroastProvince = coffeeData.reduce((a,b)=>a.overroast_pct < b.overroast_pct ? a : b);
  
  // Kesimpulan
  const analysisText = document.getElementById('analysisText');
  if (!analysisText) return;
  
  analysisText.innerHTML = `
    <strong>Pertanyaan:</strong> Apakah kadar air biji kopi >1% termasuk kategori over-roasted?<br><br>
    <strong>Jawaban: <span style="color:#dc2626; font-weight:800">TIDAK</span></strong><br><br>
    <strong>Penjelasan Berdasarkan Dataset:</strong><br>
    Dari analisis 34 provinsi di Indonesia, data menunjukkan:<br><br>
    <strong>1. Definisi Over Roasted dalam Konteks Data:</strong><br>
    • Rata-rata persentase biji kopi Over Roast: <strong>${avgOverroast}%</strong><br>
    • Jangkauan: <strong>${minOverroast}% - ${maxOverroast}%</strong> dari total produksi<br>
    • Tertinggi: ${maxOverroastProvince.province} (${maxOverroastProvince.overroast_pct}%)<br>
    • Terendah: ${minOverroastProvince.province} (${minOverroastProvince.overroast_pct}%)<br><br>
    
    <strong>2. Interpretasi Kadar Air >1%:</strong><br>
    Kadar air biji kopi >1% adalah kondisi NORMAL dan sehat untuk kopi yang disimpan. Standar industri kopi mencatat bahwa:<br>
    • Kadar air 11-13% adalah optimal untuk kopi mentah (green beans)<br>
    • Kadar air >1% menunjukkan kopi masih dalam kondisi lembab/fresh<br>
    • Over roasting terjadi pada tingkat kematangan roasting yang berlebihan, BUKAN karena kadar air tinggi<br><br>
    
    <strong>3. Hubungan Kelembapan Udara vs Over Roast:</strong><br>
    Korelasi: <strong>${correlation}</strong> (${Math.abs(correlation) > 0.5 ? 'korelasi kuat' : 'korelasi lemah'})<br>
    • Kelembapan rata-rata: ${(coffeeData.reduce((s,d)=>s+d.humidity,0)/coffeeData.length).toFixed(1)}% (range ${minHumidity}%-${maxHumidity}%)<br>
    • Kelembapan udara memengaruhi penyimpanan, tetapi TIDAK menentukan over roasting<br><br>
    
    <strong>4. Kesimpulan Akhir:</strong><br>
    <strong style="color:#059669">Biji kopi dengan kadar air >1% TIDAK termasuk kategori over-roasted</strong>. Kategori over-roasted ditentukan oleh tingkat matang biji kopi saat proses roasting, bukan oleh kadar air penyimpanan. Kadar air yang lebih tinggi (>1%) justru mengindikasikan kopi yang lebih segar dan lebih baik untuk konsumsi.
  `;
}

function downloadCSV() {
  const headers = ['province','humidity','normal_pct','overroast_pct','notes'];
  const rows = coffeeData.map(d => headers.map(h => `"${String(d[h]).replace(/"/g,'""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'coffee_data.csv'; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function makeTableSortable() {
  const ths = document.querySelectorAll('#dataTable thead th');
  ths.forEach((th, idx) => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const tbody = document.getElementById('tableBody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const asc = th.dataset.order !== 'asc';
      rows.sort((a,b) => {
        const av = a.children[idx].textContent.trim();
        const bv = b.children[idx].textContent.trim();
        const an = parseFloat(av.replace(/[^0-9.-]/g,''));
        const bn = parseFloat(bv.replace(/[^0-9.-]/g,''));
        if (!isNaN(an) && !isNaN(bn)) return asc ? an - bn : bn - an;
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
      tbody.innerHTML = '';
      rows.forEach(r => tbody.appendChild(r));
      ths.forEach(t => delete t.dataset.order);
      th.dataset.order = asc ? 'asc' : 'desc';
    });
  });
}

// load on ready
window.addEventListener('DOMContentLoaded', () => {
  loadData().catch(err => console.error(err));
});
