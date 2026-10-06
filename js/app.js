// --- SPLASH SCREEN: progress dari proses NYATA (font + foto hero), bukan palsu ---
(function splash(){
  var html   = document.documentElement;
  var el     = document.getElementById('splash');
  if(!el) return;
  var fill   = document.getElementById('splashFill');
  var label  = document.getElementById('splashPct');
  var KEY    = 'splash-seen';
  var MIN_MS = 5000;               // durasi minimum tampil (permintaan: 5 detik)
  var MAX_MS = 5600;               // batas keras: tidak akan menjebak pengguna
  var timers = [], raf = null, closing = false;

  function showProgress(p){
    p = Math.max(0, Math.min(100, p));
    if(fill) fill.style.width = p + '%';
    if(label) label.textContent = Math.round(p) + '%';
  }
  function close(immediate){
    if(closing) return;
    closing = true;
    timers.forEach(function(t){ clearTimeout(t); clearInterval(t); });
    if(raf) cancelAnimationFrame(raf);
    showProgress(100);
    if(immediate || reduce) {
      html.classList.remove('splash-on');
      body.classList.add('page-in');
      el.setAttribute('hidden', '');
      return;
    }
    // Animasi keluar: stamp + wipe + kilat.
    // PENTING: splash-on baru dicoret SESUDAH animasi selesai, kalau tidak
    // display:none langsung berlaku dan animasinya tidak akan terlihat.
    el.classList.add('done');
    timers.push(setTimeout(function(){
      html.classList.remove('splash-on');
      el.setAttribute('hidden', '');
      body.classList.add('page-in');
    }, 800));
  }

  var body = document.body;

  // Sudah pernah tampil sesi ini, atau pengguna minta minimal animasi
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch(e){}
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(seen || reduce) { close(true); return; }
  try { sessionStorage.setItem(KEY, '1'); } catch(e){}

  var t0 = Date.now();
  timers.push(setTimeout(close, MAX_MS));   // jaring pengaman utama

  // Dua task nyata: font siap & foto hero ter-decode
  var tasks = [
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
    new Promise(function(res){
      var img = document.querySelector('.hero-photo img');
      if(!img) return res();
      if(img.complete && img.naturalWidth) return res();
      img.addEventListener('load', res, {once:true});
      img.addEventListener('error', res, {once:true});
    })
  ];

  var finished = 0;
  function settle(){
    // Aset sudah siap sebelum durasi minimum tercapai:
    // bar creeps pelan ke 100% (halus, tidak melompat) sampai waktu minimum
    function frame(){
      var elapsed = Date.now() - t0;
      var p = Math.min(100, 92 + (elapsed / MIN_MS) * 8);
      showProgress(p);
      if(elapsed >= MIN_MS) return close();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }
  function bump(){
    finished++;
    // Progress nyata hanya sampai 92%; sisa 8% jadi animasi penutup di settle()
    showProgress(Math.min(92, finished / tasks.length * 92));
    if(finished === tasks.length) settle();
  }
  tasks.forEach(function(t){ Promise.resolve(t).then(bump, bump); });
})();

// Data karya — video lokal dimuat HANYA saat modal dibuka (preload none)
const VIDEOS = [
  // --- EVENT / MDS (Google Drive) ---
  {id:'mds-after-2024', cat:'event', src:'drive', title:'After Movie MDS 2024 — Event Documentation', cover:'assets/img/cover/cover1.png', drive:'https://drive.google.com/file/d/1meFJX04GQ6SRY9vCt75v9KWgn_EeMR4c/preview'},
  {id:'mds-after-2025', cat:'event', src:'drive', title:'After Movie MDS 2025 — Event Documentation', cover:'assets/img/cover/cover-2.png', drive:'https://drive.google.com/file/d/1T4O4YFjvB4RNPhNjyEcfY6MEMG2J55OD/preview'},
  {id:'mds-teaser-2024', cat:'event', src:'drive', title:'Teaser MDS 2024 — Event Teaser', cover:'assets/img/cover/cover5.png', drive:'https://drive.google.com/file/d/17zX6MvYOFZKhzA5GizY_yYrxK6pmJeWq/preview'},
  {id:'mds-teaser-2025', cat:'event', src:'drive', title:'Teaser MDS 2025 — Event Teaser', cover:'assets/img/cover/cover6.png', drive:'https://drive.google.com/file/d/1u8hdjtL_QNnqDUJHjMteLzM-nArYHp93/preview'},
  {id:'short-movie', cat:'drone', src:'drive', title:'Short Movie — Cinematic Short Film', cover:'assets/img/cover/cover-4.png', drive:'https://drive.google.com/file/d/1vDYbFoLAecKBgPEBH0sJlwVDC4U-IUwn/preview'},
  {id:'drone-borobudur', cat:'drone', src:'drive', title:'Pelatihan Drone Borobudur — Public Communications', cover:'assets/img/cover/cover-3.png', drive:'https://drive.google.com/file/d/1jjXDdTJPgKylaT_7iLmnMyLnWPJj7Y7o/preview'},
  // --- LOKAL (sudah dikompres) ---
  {id:'drone-pilot', cat:'drone', src:'local', title:'Drone Pilot — Latihan & Aerial Shot', file:'assets/video/drone-pilot.mp4', cover:'assets/img/poster-video/drone-pilot.jpg', size:'7,2 MB'},
  {id:'tur-virtual', cat:'drone', src:'local', title:'Tur Virtual — Company Profile Area', file:'assets/video/tur-virtual.mp4', cover:'assets/img/poster-video/tur-virtual.jpg', size:'4,1 MB'},
  {id:'ngonten', cat:'k3', src:'local', title:'Ngonten — Behind The Process K3', file:'assets/video/ngonten-k3.mp4', cover:'assets/img/poster-video/ngonten-k3.jpg', size:'5,7 MB'},
  {id:'k3-forklift', cat:'k3', src:'local', title:'Operator Forklift — Tidak Sesederhana Nyetir', file:'assets/video/k3-forklift.mp4', cover:'assets/img/poster-video/k3-forklift.jpg', size:'47 MB'},
  {id:'k3-ketinggian', cat:'k3', src:'local', title:'Kerja di Ketinggian — Kompetensi & Risiko', file:'assets/video/k3-kerja-ketinggian.mp4', cover:'assets/img/poster-video/k3-kerja-ketinggian.jpg', size:'37 MB'},
  {id:'k3-apar', cat:'k3', src:'local', title:'APAR — Tidak Semua Api Sama', file:'assets/video/k3-apar.mp4', cover:'assets/img/poster-video/k3-apar.jpg', size:'29 MB'},
  {id:'k3-komitmen', cat:'k3', src:'local', title:'Komitmen Keselamatan Kerja Proyek', file:'assets/video/k3-komitmen-keselamatan.mp4', cover:'assets/img/poster-video/k3-komitmen-keselamatan.jpg', size:'27 MB'},
  {id:'k3-alatberat', cat:'k3', src:'local', title:'Kenapa Alat Berat Warnanya Kuning?', file:'assets/video/k3-alat-berat-kuning.mp4', cover:'assets/img/poster-video/k3-alat-berat-kuning.jpg', size:'10 MB'},
  {id:'k3-naikjabatan', cat:'k3', src:'local', title:'Naik Jabatan — Proses di Balik Pencapaian', file:'assets/video/k3-naik-jabatan.mp4', cover:'assets/img/poster-video/k3-naik-jabatan.jpg', size:'13 MB'},
  {id:'k3-karier', cat:'k3', src:'local', title:'6 Tahun Kerja, Karier Jalan di Tempat?', file:'assets/video/k3-karier-jalan-ditempat.mp4', cover:'assets/img/poster-video/k3-karier-jalan-ditempat.jpg', size:'12 MB'},
];

const CAT_LABEL = {event:'EVENT', k3:'KONTEN EDUKASI', drone:'DRONE'};

const grid = document.getElementById('videoGrid');
const count = document.getElementById('videoCount');

function renderVideos(filter='semua'){
  grid.innerHTML = '';
  const list = VIDEOS.filter(v => filter==='semua' || v.cat===filter);
  count.textContent = `(${list.length})`;
  list.forEach(v => {
    const el = document.createElement('article');
    el.className = 'vcard';
    el.tabIndex = 0;
    el.innerHTML = `
      <div class="thumb">
        <img src="${v.cover}" alt="${v.title}" loading="lazy" decoding="async">
        <div class="play"><span class="play-btn"><svg class="ic fill"><use href="#i-play"/></svg></span></div>
      </div>
      <div class="vbody">
        <b>${v.title}</b>
        <span class="vtag ${v.src}">${v.src==='local'?'<svg class="ic fill"><use href="#i-play"/></svg> LOKAL':'<svg class="ic"><use href="#i-cloud"/></svg> DRIVE'}</span><span class="vtag cat">${CAT_LABEL[v.cat]}</span>
        ${v.size?`<div class="vsize">${v.size} • klik untuk play</div>`:`<div class="vsize">klik untuk play via Drive</div>`}
      </div>`;
    el.addEventListener('click', () => openVideo(v));
    el.addEventListener('keydown', e => { if(e.key==='Enter') openVideo(v); });
    grid.appendChild(el);
  });
}

document.getElementById('filters').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderVideos(btn.dataset.f);
});

// --- Modal video: src diisi HANYA saat dibuka ---
const modal = document.getElementById('videoModal');
const player = document.getElementById('modalPlayer');
const mTitle = document.getElementById('modalTitle');

function openVideo(v){
  mTitle.textContent = v.title;
  player.innerHTML = '';
  if(v.src === 'local'){
    const vd = document.createElement('video');
    vd.controls = true; vd.playsInline = true; vd.preload = 'metadata';
    vd.poster = v.cover;
    const s = document.createElement('source');
    s.src = v.file; s.type = 'video/mp4';
    vd.appendChild(s);
    player.appendChild(vd);
    vd.play().catch(()=>{});
  } else {
    const f = document.createElement('iframe');
    f.src = v.drive; f.allow = 'autoplay; fullscreen'; f.allowFullscreen = true; f.loading = 'lazy';
    player.appendChild(f);
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeVideo(){
  player.innerHTML = ''; // hentikan buffer/download
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
document.getElementById('modalClose').addEventListener('click', closeVideo);
modal.addEventListener('click', e => { if(e.target === modal) closeVideo(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeVideo(); closePhoto(); }});

// --- Fotografi ---
const PHOTOS = ['DSC03264','DSC03328','DSC03335','DSC04687-2','DSC04688-2','DSC04689-2','DSC05527','DSC05575','DSC05614','DSC06701','DSC06750','DSC06848','DSC06873','DSC06895'];
const photoGrid = document.getElementById('photoGrid');
const extOf = n => n === 'DSC05614' ? 'JPG' : 'jpg';
PHOTOS.forEach((n,i) => {
  const f = document.createElement('figure');
  f.innerHTML = `<img src="assets/img/photo/${n}.${extOf(n)}" alt="Foto ${i+1}" loading="lazy" decoding="async"><figcaption>FOTO #${String(i+1).padStart(2,'0')}</figcaption>`;
  f.addEventListener('click', () => openPhoto(`assets/img/photo/${n}.${extOf(n)}`, `Fotografi #${i+1} — Rizki Hidayat`));
  photoGrid.appendChild(f);
});

const photoModal = document.getElementById('photoModal');
const photoBig = document.getElementById('photoBig');
const photoCap = document.getElementById('photoCap');
function openPhoto(src, cap){
  photoBig.src = src; photoCap.textContent = cap;
  photoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePhoto(){
  photoModal.classList.remove('open');
  photoBig.src = '';
  document.body.style.overflow = '';
}
document.getElementById('photoClose').addEventListener('click', closePhoto);
photoModal.addEventListener('click', e => { if(e.target === photoModal) closePhoto(); });

// --- Poster ---
const POSTERS = [
  ['POSTER MDS fix banget asli ini mah.png','Poster MDS — Main Event'],
  ['POSTER UTAMMA.png','Poster Utama Event'],
  ['Kasendratuwondo.png','Poster Kasendratuwondo'],
  ['Satrunz.png','Poster Satrunz — Musik'],
  ['fallin_ my feellin_.png','Poster Fallin My Feelin'],
];
const posterGrid = document.getElementById('posterGrid');
POSTERS.forEach(([file, cap]) => {
  const f = document.createElement('figure');
  f.innerHTML = `<img src="assets/img/poster/${encodeURIComponent(file)}" alt="${cap}" loading="lazy" decoding="async"><figcaption>${cap}</figcaption>`;
  f.style.cursor = 'zoom-in';
  f.addEventListener('click', () => openPhoto(`assets/img/poster/${encodeURIComponent(file)}`, cap));
  posterGrid.appendChild(f);
});

// --- Nav mobile ---
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.addEventListener('click', e => { if(e.target.tagName==='A') navLinks.classList.remove('open'); });

// --- Spotlight tombol Download CV: cahaya mengikuti kursor ---
document.querySelectorAll('.btn-spot').forEach(function(btn){
  btn.addEventListener('pointermove', function(e){
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    btn.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

renderVideos();

// --- Live Count via Abacus (gratis, tanpa daftar) ---
// Total: +1 tiap kunjungan. Online: estimasi pengunjung aktif 5 menit terakhir
// via bucket waktu (tanpa endpoint decrement). Localhost tidak dihitung.
(function liveCount(){
  const elTotal = document.getElementById('lcTotal');
  const elOnline = document.getElementById('lcOnline');
  if(!elTotal || !elOnline) return;
  const NS = 'rizkihidayat-porto';
  const API = 'https://abacus.jasoncameron.dev';
  const isLocal = ['localhost','127.0.0.1'].includes(location.hostname) || location.protocol === 'file:';
  const fmt = n => Number(n || 0).toLocaleString('id-ID');
  async function api(path){
    const r = await fetch(API + path);
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  function bucketKey(d){
    const m = d.getMinutes() - (d.getMinutes() % 5);
    const p = n => String(n).padStart(2, '0');
    return `online-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(m)}`;
  }
  // Total kunjungan
  (async () => {
    try{
      const d = await api(`/${isLocal ? 'get' : 'hit'}/${NS}/total-kunjungan`);
      elTotal.textContent = fmt(d.value);
      try{ localStorage.setItem('lc-total', d.value); }catch(e){}
    }catch(e){
      try{
        const c = localStorage.getItem('lc-total');
        elTotal.textContent = c ? fmt(c) : '—';
      }catch(err){ elTotal.textContent = '—'; }
    }
  })();
  // Online sekarang (heartbeat 60 detik)
  async function beat(){
    try{
      const now = new Date();
      const cur = bucketKey(now);
      const prev = bucketKey(new Date(now.getTime() - 5 * 60 * 1000));
      const mode = isLocal ? 'get' : 'hit';
      const [c, p] = await Promise.all([
        api(`/${mode}/${NS}/${cur}`),
        api(`/get/${NS}/${prev}`).catch(() => ({value: 0}))
      ]);
      elOnline.textContent = fmt(Math.max(c.value, p.value || 0));
    }catch(e){ /* biarkan angka terakhir tampil */ }
  }
  beat();
  setInterval(beat, 60000);
})();
