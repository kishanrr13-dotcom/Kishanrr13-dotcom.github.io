/* ============ PowerG — shared site logic ============ */
/* Product data now comes from a published Google Sheet (CSV).
   PASTE your published-CSV link below, between the quotes. */
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFw_90WCARwDbgk_2gBIXbAz3cBNkc5udWZgZcNzPhkivAswT45IPc4bN7p-npmENfF6yHo9bL84d3/pub?gid=0&single=true&output=csv";

let PHONE_DATA = [];

const GADGET_CATEGORIES = ["Phones","Earbuds","Tablets","Laptops","Cameras","TVs","Headphones","Washing Machines","Fans","Coolers","AC"];

const CATEGORY_TILES = [
  {icon:"📱", name:"Phones", live:true},
  {icon:"🎧", name:"Earbuds", live:false},
  {icon:"📲", name:"Tablets", live:false},
  {icon:"💻", name:"Laptops", live:false},
  {icon:"📷", name:"Cameras", live:false},
  {icon:"📺", name:"TVs", live:false},
  {icon:"🎙️", name:"Headphones", live:false},
  {icon:"🧺", name:"Washing Machines", live:false},
  {icon:"🌀", name:"Fans", live:false},
  {icon:"🌬️", name:"Coolers", live:false},
  {icon:"❄️", name:"Air Conditioners", live:false},
  {icon:"🧊", name:"Refrigerators", live:false}
];

const LANG_INDIA = ["English","Hindi","Telugu","Tamil","Malayalam","Kannada","Marathi"];
const LANG_USA = ["English","Spanish"];

const NAV_TEXT = {
  English:{price:"Price Range", gadgets:"Gadgets", compare:"Compare", top:"Top Lists", brand:"Brand"},
  Hindi:{price:"कीमत सीमा", gadgets:"गैजेट्स", compare:"तुलना करें", top:"टॉप लिस्ट", brand:"ब्रांड"}
};

function root(){
  const h = document.getElementById('site-header');
  return h ? (h.dataset.root || './') : './';
}
function pageId(){
  const h = document.getElementById('site-header');
  return h ? (h.dataset.pageid || 'page') : 'page';
}
function currentRegion(){
  const h = document.getElementById('site-header');
  return h ? (h.dataset.region || 'india') : 'india';
}

function toast(msg){
  let t = document.getElementById('gp-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'gp-toast';
    t.style.cssText = "position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#1a1310;color:#fff;padding:10px 18px;border-radius:20px;font-size:13px;z-index:200;opacity:0;transition:opacity .2s;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>{ t.style.opacity = '0'; }, 2200);
}

/* ================= LOAD DATA FROM GOOGLE SHEET ================= */
function parseCSV(text){
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for(let i=0;i<text.length;i++){
    const c = text[i];
    if(inQuotes){
      if(c === '"'){
        if(text[i+1] === '"'){ field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if(c === '"') inQuotes = true;
      else if(c === ','){ row.push(field); field=''; }
      else if(c === '\n' || c === '\r'){
        if(c === '\r' && text[i+1] === '\n') i++;
        row.push(field); field='';
        if(!(row.length===1 && row[0]==='')) rows.push(row);
        row = [];
      } else field += c;
    }
  }
  if(field.length || row.length){ row.push(field); rows.push(row); }
  return rows;
}

async function loadPhoneData(){
  if(!SHEET_CSV_URL || SHEET_CSV_URL.indexOf('PASTE_YOUR') !== -1){
    console.warn('PowerG: no Google Sheet link set yet in assets/site.js — catalog is empty.');
    return [];
  }
  try{
    const res = await fetch(SHEET_CSV_URL + (SHEET_CSV_URL.includes('?')?'&':'?') + '_=' + Date.now());
    const text = await res.text();
    const rows = parseCSV(text);
    if(rows.length < 2) return [];
    const header = rows[0].map(h=>h.trim().toLowerCase());
    const data = rows.slice(1).filter(r=>r.length>1 && r[0] && r[0].trim()).map(r=>{
      const obj = {};
      header.forEach((h,idx)=> obj[h] = (r[idx]||'').trim());
      const region = (obj.region||'india').toLowerCase().indexOf('usa')!==-1 ? 'usa' : 'india';
      const specs = [1,2,3,4,5,6].map(n=>({label:obj['spec'+n+'_label'], value:obj['spec'+n+'_value']})).filter(s=>s.label && s.value);
      return {
        slug: obj.slug,
        name: obj.name,
        brand: obj.brand || 'Other',
        region: region,
        price: parseFloat(obj.price) || 0,
        currency: obj.currency || (region==='usa' ? '$' : '₹'),
        blurb: obj.blurb || '',
        description: obj.description || obj.blurb || '',
        specs: specs,
        url: 'phones/phone.html?slug=' + encodeURIComponent(obj.slug)
      };
    }).filter(p=>p.slug && p.name);
    return data;
  } catch(err){
    console.error('PowerG: could not load Google Sheet data', err);
    return [];
  }
}

/* ================= HEADER ================= */
function renderHeader(){
  const el = document.getElementById('site-header');
  if(!el) return;
  const region = el.dataset.region || 'india';
  const langList = region === 'usa' ? LANG_USA : LANG_INDIA;

  el.innerHTML = `
  <div class="topbar">
    <div class="topbar-inner">
      <div class="topbar-left">
        <div class="lang-wrap">
          <button class="lang-btn" id="lang-toggle">🌐 <span id="lang-current">English</span> ▾</button>
          <div class="lang-menu" id="lang-menu">
            <div class="lang-group-title">Select language</div>
            ${langList.map(l=>`<button data-lang="${l}">${l}</button>`).join('')}
          </div>
        </div>
        <span class="clock" id="gp-clock"></span>
      </div>
      <div class="auth-wrap" id="auth-wrap"></div>
    </div>
  </div>

  <div class="brandrow">
    <div class="brandrow-inner">
      <div class="brand-title">Power<span class="g">G</span></div>
      <div class="brand-tag">Powerful Gadgets</div>
      <div class="ad-slot"></div>
    </div>
  </div>

  <div class="searchbar-row">
    <div class="searchbar">
      <input type="text" id="gp-search" placeholder="Search phones, brands...">
      <button id="gp-search-btn">Search</button>
    </div>
  </div>

  <nav class="mainnav">
    <div class="mainnav-inner">
      <div class="nav-item">
        <button id="nav-price-btn">${NAV_TEXT.English.price} ▾</button>
        <div class="nav-panel" id="panel-price">
          <div class="range-panel">
            <div class="range-fields">
              <input type="number" id="range-min" placeholder="Min">
              <span>to</span>
              <input type="number" id="range-max" placeholder="Max">
            </div>
            <button class="range-apply" id="range-apply">Apply</button>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <button id="nav-gadgets-btn">${NAV_TEXT.English.gadgets} ▾</button>
        <div class="nav-panel" id="panel-gadgets">
          <div class="gadgets-grid">
            ${GADGET_CATEGORIES.map(c=>`<button data-cat="${c}">${c}</button>`).join('')}
          </div>
        </div>
      </div>
      <div class="nav-item">
        <button id="nav-compare-btn">${NAV_TEXT.English.compare}</button>
      </div>
      <div class="nav-item">
        <button id="nav-top-btn">${NAV_TEXT.English.top} ▾</button>
        <div class="nav-panel toplist-panel" id="panel-top">
          <button data-n="5">Top 5</button>
          <button data-n="10">Top 10</button>
          <button data-n="15">Top 15</button>
          <select class="brand-select" id="brand-select"><option value="">All brands</option></select>
        </div>
      </div>
      <button class="dots-btn" id="dots-btn">⋮</button>
    </div>
  </nav>

  <div class="overlay" id="gp-overlay"></div>
  <div class="mobile-menu" id="mobile-menu">
    <button class="mobile-close" id="mobile-close">✕</button>
    <h4>Price Range</h4>
    <div class="range-fields" style="margin-bottom:10px;">
      <input type="number" id="m-range-min" placeholder="Min" style="width:45%;padding:8px;border:1px solid #f0ddc8;border-radius:6px;">
      <span>to</span>
      <input type="number" id="m-range-max" placeholder="Max" style="width:45%;padding:8px;border:1px solid #f0ddc8;border-radius:6px;">
    </div>
    <button id="m-range-apply" style="background:#e8491d;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-weight:700;">Apply</button>
    <h4>Gadgets</h4>
    ${GADGET_CATEGORIES.map(c=>`<button data-cat="${c}" class="m-cat">${c}</button>`).join('')}
    <h4>More</h4>
    <button id="m-compare-btn">Compare</button>
    <button id="m-top5">Top 5 Phones</button>
    <button id="m-top10">Top 10 Phones</button>
    <button id="m-top15">Top 15 Phones</button>
  </div>
  `;

  if(!document.getElementById('compare-bar')){
    document.body.insertAdjacentHTML('beforeend', `
      <div class="compare-bar" id="compare-bar">
        <span>Compare:</span>
        <div id="compare-chips" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
        <button class="compare-go" id="compare-go">Compare Now</button>
        <button class="compare-clear" id="compare-clear">Clear</button>
      </div>
      <div class="modal-overlay" id="compare-modal">
        <div class="modal-box">
          <button class="modal-close" id="compare-modal-close">✕</button>
          <h2>Comparison</h2>
          <div id="compare-table-wrap"></div>
        </div>
      </div>
    `);
  }

  wireHeaderEvents(region);
  startClock();
  renderAuth();
  renderCompareBar();
}

function wireHeaderEvents(region){
  const q = (s)=>document.querySelector(s);
  const qa = (s)=>document.querySelectorAll(s);

  q('#lang-toggle').onclick = ()=> q('#lang-menu').classList.toggle('open');
  qa('#lang-menu button').forEach(b=>b.onclick = ()=>{
    const lang = b.dataset.lang;
    q('#lang-current').textContent = lang;
    q('#lang-menu').classList.remove('open');
    if(lang !== 'English' && lang !== 'Hindi'){
      toast(lang + ' translation coming soon — showing English for now.');
    } else if(lang === 'Hindi'){
      applyHindiNav();
    } else {
      applyEnglishNav();
    }
  });

  const panels = ['price','gadgets','top'];
  panels.forEach(p=>{
    const btn = q('#nav-'+p+'-btn');
    if(btn) btn.onclick = ()=>{
      qa('.nav-panel').forEach(pn=> pn.id === 'panel-'+p ? pn.classList.toggle('open') : pn.classList.remove('open'));
    };
  });
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.nav-item') && !e.target.closest('.lang-wrap')){
      qa('.nav-panel').forEach(pn=>pn.classList.remove('open'));
      const lm = q('#lang-menu'); if(lm) lm.classList.remove('open');
    }
  });

  const applyRange = (minEl,maxEl)=>{
    const min = parseFloat(minEl.value)||0;
    const max = parseFloat(maxEl.value)||Infinity;
    filterCardsByPrice(min,max);
    closeMobileMenu();
  };
  if(q('#range-apply')) q('#range-apply').onclick = ()=> applyRange(q('#range-min'), q('#range-max'));
  if(q('#m-range-apply')) q('#m-range-apply').onclick = ()=> applyRange(q('#m-range-min'), q('#m-range-max'));

  qa('[data-cat]').forEach(b=>b.onclick = ()=>{
    if(b.dataset.cat === 'Phones'){
      window.location.href = root() + (region==='usa' ? 'usa.html' : 'india.html');
    } else {
      toast(b.dataset.cat + ' section coming soon.');
    }
  });

  qa('#panel-top button[data-n]').forEach(b=>b.onclick = ()=> showTopN(parseInt(b.dataset.n)));
  if(q('#m-top5')) q('#m-top5').onclick = ()=>{ showTopN(5); closeMobileMenu(); };
  if(q('#m-top10')) q('#m-top10').onclick = ()=>{ showTopN(10); closeMobileMenu(); };
  if(q('#m-top15')) q('#m-top15').onclick = ()=>{ showTopN(15); closeMobileMenu(); };

  if(q('#brand-select')) q('#brand-select').onchange = (e)=> filterByBrand(e.target.value);

  if(q('#nav-compare-btn')) q('#nav-compare-btn').onclick = ()=>{
    if(getCompareList().length === 0) toast('Tick the compare box on any 2-3 phones first.');
    else openCompareModal();
  };
  if(q('#m-compare-btn')) q('#m-compare-btn').onclick = ()=>{
    closeMobileMenu();
    if(getCompareList().length === 0) toast('Tick the compare box on any 2-3 phones first.');
    else openCompareModal();
  };

  if(q('#dots-btn')) q('#dots-btn').onclick = ()=>{
    q('#mobile-menu').classList.add('open');
    q('#gp-overlay').classList.add('open');
  };
  if(q('#mobile-close')) q('#mobile-close').onclick = closeMobileMenu;
  if(q('#gp-overlay')) q('#gp-overlay').onclick = closeMobileMenu;
  qa('.m-cat').forEach(b=>b.onclick = ()=>{
    if(b.dataset.cat === 'Phones'){ window.location.href = root() + (region==='usa'?'usa.html':'india.html'); }
    else toast(b.dataset.cat + ' section coming soon.');
    closeMobileMenu();
  });

  const doSearch = ()=>{
    const val = q('#gp-search').value.trim();
    if(!val) return;
    if(document.querySelector('.card-grid')){
      filterCardsByName(val);
    } else {
      window.location.href = root() + (region==='usa'?'usa.html':'india.html') + '?q=' + encodeURIComponent(val);
    }
  };
  if(q('#gp-search-btn')) q('#gp-search-btn').onclick = doSearch;
  if(q('#gp-search')) q('#gp-search').addEventListener('keydown', e=>{ if(e.key==='Enter') doSearch(); });

  if(q('#compare-modal-close')) q('#compare-modal-close').onclick = ()=> q('#compare-modal').classList.remove('open');
  if(q('#compare-go')) q('#compare-go').onclick = openCompareModal;
  if(q('#compare-clear')) q('#compare-clear').onclick = ()=>{ localStorage.removeItem('gp_compare'); renderCompareBar(); };
}

function closeMobileMenu(){
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('gp-overlay').classList.remove('open');
}

function applyHindiNav(){
  const t = NAV_TEXT.Hindi;
  document.getElementById('nav-price-btn').innerHTML = t.price+' ▾';
  document.getElementById('nav-gadgets-btn').innerHTML = t.gadgets+' ▾';
  document.getElementById('nav-compare-btn').innerHTML = t.compare;
  document.getElementById('nav-top-btn').innerHTML = t.top+' ▾';
}
function applyEnglishNav(){
  const t = NAV_TEXT.English;
  document.getElementById('nav-price-btn').innerHTML = t.price+' ▾';
  document.getElementById('nav-gadgets-btn').innerHTML = t.gadgets+' ▾';
  document.getElementById('nav-compare-btn').innerHTML = t.compare;
  document.getElementById('nav-top-btn').innerHTML = t.top+' ▾';
}

/* ================= CLOCK ================= */
function startClock(){
  const el = document.getElementById('gp-clock');
  if(!el) return;
  const update = ()=>{
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateStr = now.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});
    const timeStr = now.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
    el.textContent = `${dateStr} · ${timeStr} (${tz})`;
  };
  update();
  setInterval(update, 30000);
}

/* ================= AUTH ================= */
function renderAuth(){
  const el = document.getElementById('auth-wrap');
  if(!el) return;
  const user = JSON.parse(localStorage.getItem('gp_user') || 'null');
  if(user){
    el.innerHTML = `<span class="user-chip">👋 ${user.name}</span> <button class="signin-btn" id="signout-btn" style="background:none;color:#fff;border:1px solid rgba(255,255,255,.4);">Sign out</button>`;
    document.getElementById('signout-btn').onclick = ()=>{ localStorage.removeItem('gp_user'); renderAuth(); };
  } else {
    el.innerHTML = `<button class="signin-btn" id="signin-btn">Sign in</button>`;
    document.getElementById('signin-btn').onclick = openSignInModal;
  }
}
function openSignInModal(){
  const name = prompt("Continue with Google (demo) — enter your name to continue free:");
  if(name && name.trim()){
    localStorage.setItem('gp_user', JSON.stringify({name:name.trim()}));
    renderAuth();
    toast('Signed in — free, no payment needed.');
  }
}

/* ================= FILTERS ================= */
function filterCardsByPrice(min,max){
  document.querySelectorAll('.card').forEach(c=>{
    const p = parseFloat(c.dataset.price);
    c.style.display = (p>=min && p<=max) ? '' : 'none';
  });
  toast(`Showing phones in this price range.`);
}
function filterByBrand(brand){
  document.querySelectorAll('.card').forEach(c=>{
    c.style.display = (!brand || c.dataset.brand === brand) ? '' : 'none';
  });
}
function filterCardsByName(term){
  term = term.toLowerCase();
  document.querySelectorAll('.card').forEach(c=>{
    const name = (c.dataset.name || c.textContent).toLowerCase();
    c.style.display = name.includes(term) ? '' : 'none';
  });
}
function showTopN(n){
  const cards = Array.from(document.querySelectorAll('.card'));
  cards.forEach((c,i)=>{ c.style.display = i<n ? '' : 'none'; });
  toast(`Showing top ${n}.`);
}
function populateAllBrandSelects(){
  const region = currentRegion();
  const brands = [...new Set(PHONE_DATA.filter(p=>p.region===region).map(p=>p.brand))];
  ['brand-select','filter-brand-select'].forEach(id=>{
    const sel = document.getElementById(id);
    if(!sel) return;
    sel.innerHTML = '<option value="">All brands</option>';
    brands.forEach(b=>{
      const o = document.createElement('option');
      o.value = b; o.textContent = b;
      sel.appendChild(o);
    });
  });
}
function sortCards(order){
  const grids = document.querySelectorAll('.card-grid');
  grids.forEach(grid=>{
    const cards = Array.from(grid.querySelectorAll('.card'));
    if(!cards.length) return;
    cards.sort((a,b)=>{
      const pa = parseFloat(a.dataset.price), pb = parseFloat(b.dataset.price);
      return order === 'low' ? pa-pb : pb-pa;
    });
    cards.forEach(c=>grid.appendChild(c));
  });
}

/* ================= COMPARE ================= */
function getCompareList(){ return JSON.parse(localStorage.getItem('gp_compare')||'[]'); }
function toggleCompare(slug){
  let list = getCompareList();
  if(list.includes(slug)) list = list.filter(s=>s!==slug);
  else {
    if(list.length>=3){ toast('You can compare up to 3 phones.'); return; }
    list.push(slug);
  }
  localStorage.setItem('gp_compare', JSON.stringify(list));
  renderCompareBar();
}
function renderCompareBar(){
  const list = getCompareList();
  const bar = document.getElementById('compare-bar');
  if(!bar) return;
  if(list.length===0){ bar.classList.remove('open'); return; }
  bar.classList.add('open');
  const chipsWrap = document.getElementById('compare-chips');
  chipsWrap.innerHTML = list.map(slug=>{
    const p = PHONE_DATA.find(x=>x.slug===slug);
    return p ? `<span class="chip">${p.name}</span>` : '';
  }).join('');
  document.querySelectorAll('.compare-check input').forEach(cb=>{
    cb.checked = list.includes(cb.dataset.slug);
  });
}
function openCompareModal(){
  const list = getCompareList();
  const phones = list.map(s=>PHONE_DATA.find(p=>p.slug===s)).filter(Boolean);
  const wrap = document.getElementById('compare-table-wrap');
  wrap.innerHTML = `<table class="compare-table">
    <tr><th>Phone</th>${phones.map(p=>`<th>${p.name}</th>`).join('')}</tr>
    <tr><td>Brand</td>${phones.map(p=>`<td>${p.brand}</td>`).join('')}</tr>
    <tr><td>Price</td>${phones.map(p=>`<td>${p.currency}${p.price.toLocaleString()}</td>`).join('')}</tr>
    <tr><td>Highlight</td>${phones.map(p=>`<td>${p.blurb}</td>`).join('')}</tr>
  </table>`;
  document.getElementById('compare-modal').classList.add('open');
}

/* ================= SHARE ================= */
function shareItem(title, url){
  if(navigator.share){
    navigator.share({title: title + ' — PowerG', text: title + ' on PowerG', url: url}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(url).then(()=> toast('Link copied to clipboard!'));
  }
}

/* ================= CARD BUILDING ================= */
function buildCardElement(p){
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.slug = p.slug; card.dataset.name = p.name; card.dataset.price = p.price; card.dataset.brand = p.brand;
  card.innerHTML = `
    <span class="tag">${p.region === 'usa' ? 'USA' : 'India'} · ${p.brand}</span>
    <h3><a href="${root()}${p.url}">${p.name}</a></h3>
    <p>${p.blurb}</p>
    <div class="card-bottom"><div class="price">${p.currency}${p.price.toLocaleString()}</div></div>
  `;
  return card;
}

function enhanceCards(){
  document.querySelectorAll('.card[data-slug]').forEach(card=>{
    const slug = card.dataset.slug;
    const name = card.dataset.name || slug;
    let actions = card.querySelector('.card-actions');
    if(!actions){
      actions = document.createElement('div');
      actions.className = 'card-actions';
      const bottom = card.querySelector('.card-bottom') || card;
      bottom.appendChild(actions);
    }
    actions.innerHTML = `
      <label class="compare-check"><input type="checkbox" class="compare-input" data-slug="${slug}"> Compare</label>
      <button class="icon-btn share-btn" data-slug="${slug}">Share</button>
    `;
    actions.querySelector('.compare-input').onclick = (e)=>{ e.preventDefault(); toggleCompare(slug); };
    actions.querySelector('.share-btn').onclick = (e)=>{
      e.preventDefault(); e.stopPropagation();
      const p = PHONE_DATA.find(x=>x.slug===slug);
      const fullUrl = p ? new URL(root() + p.url, window.location.href).href : window.location.href;
      shareItem(name, fullUrl);
    };
  });
  renderCompareBar();
}

/* ================= CATEGORY GRID ================= */
function renderCategoryGrid(){
  const el = document.getElementById('category-grid');
  if(!el) return;
  el.innerHTML = CATEGORY_TILES.map(c=>`
    <a class="category-tile" href="#" data-cat="${c.name}" data-live="${c.live}">
      <div class="icon">${c.icon}</div>
      <div class="name">${c.name}</div>
      ${c.live ? '' : '<span class="soon">Coming soon</span>'}
    </a>
  `).join('');
  el.querySelectorAll('.category-tile').forEach(t=>{
    t.onclick = (e)=>{
      e.preventDefault();
      if(t.dataset.live === 'true'){
        window.location.href = root() + 'india.html';
      } else {
        toast(t.dataset.cat + ' — coming soon. Tell us below if you need it sooner!');
        document.getElementById('request-box')?.scrollIntoView({behavior:'smooth', block:'center'});
      }
    };
  });
}

/* ================= ENDLESS SCROLL FEED (homepage) ================= */
let feedIndex = 0;
const FEED_BATCH = 4;
function renderEndlessFeed(){
  const el = document.getElementById('endless-feed');
  if(!el) return;
  feedIndex = 0;
  el.innerHTML = '';
  if(PHONE_DATA.length === 0){
    el.innerHTML = '<p style="color:#7a6a5c;grid-column:1/-1;">No products yet — add rows to your Google Sheet and they will show up here automatically.</p>';
    return;
  }
  let sentinel = document.getElementById('feed-sentinel');
  if(!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'feed-sentinel';
    sentinel.className = 'feed-sentinel';
    el.after(sentinel);
  }

  const loadMore = ()=>{
    const next = PHONE_DATA.slice(feedIndex, feedIndex + FEED_BATCH);
    if(next.length === 0){
      renderRequestBox();
      observer.disconnect();
      return;
    }
    next.forEach(p=> el.appendChild(buildCardElement(p)));
    feedIndex += FEED_BATCH;
    enhanceCards();
  };

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(entry.isIntersecting) loadMore(); });
  }, {rootMargin:'200px'});
  observer.observe(sentinel);
}

function renderRequestBox(){
  if(document.getElementById('request-box')) return;
  const box = document.createElement('div');
  box.className = 'request-box';
  box.id = 'request-box';
  box.innerHTML = `
    <h3>That's everything we've listed so far 🎉</h3>
    <p>Looking for a specific gadget — phone, AC, fridge, laptop? Tell us and we'll add it.</p>
    <form id="request-form">
      <input type="text" id="request-input" placeholder="e.g. iPhone 17, Samsung fridge..." required>
      <button type="submit">Request</button>
    </form>
  `;
  document.getElementById('endless-feed').after(box);
  document.getElementById('request-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const val = document.getElementById('request-input').value.trim();
    if(!val) return;
    window.location.href = 'mailto:youremail@example.com?subject=Gadget request&body=' + encodeURIComponent('Please add: ' + val);
    toast('Thanks! Request noted.');
    document.getElementById('request-input').value = '';
  });
}

/* ================= LISTING FEED (india.html / usa.html) ================= */
function renderListingFeed(){
  const el = document.getElementById('listing-feed');
  if(!el) return;
  const region = el.dataset.region;
  const items = PHONE_DATA.filter(p=>p.region===region).sort((a,b)=>a.price-b.price);
  el.innerHTML = '';
  if(items.length === 0){
    el.innerHTML = '<p style="color:#7a6a5c;grid-column:1/-1;">No phones added yet for this region. Add a row to your Google Sheet with region = ' + region + ' and it will appear here.</p>';
    return;
  }
  items.forEach(p=> el.appendChild(buildCardElement(p)));
  enhanceCards();
}

/* ================= PHONE DETAIL (phones/phone.html) ================= */
function renderPhoneDetail(){
  const el = document.getElementById('detail-content');
  if(!el) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const p = PHONE_DATA.find(x=>x.slug === slug);

  if(!p){
    el.innerHTML = `<div class="detail-head"><h1>Product not found</h1><p style="color:#7a6a5c;">This link may be old, or the row hasn't been added to the Google Sheet yet.</p></div>`;
    return;
  }

  document.title = p.name + ' Price & Specs | PowerG';
  const header = document.getElementById('site-header');
  header.dataset.region = p.region;
  header.dataset.pageid = p.slug;
  renderHeader();

  const backPage = p.region === 'usa' ? 'usa.html' : 'india.html';
  el.innerHTML = `
    <div class="detail-head">
      <a class="back-link" href="../${backPage}">← Back to ${p.region==='usa'?'USA':'India'} phones</a>
      <span class="tag">${p.region==='usa'?'USA':'India'} · ${p.brand}</span>
      <h1>${p.name}</h1>
      <div class="detail-price">${p.currency}${p.price.toLocaleString()}</div>
      <div class="detail-actions">
        <button class="icon-btn" id="detail-share-btn">Share this phone</button>
      </div>
    </div>
    <div class="spec-grid">
      ${p.specs.length ? p.specs.map(s=>`<div class="spec-box"><div class="label">${s.label}</div><div class="val">${s.value}</div></div>`).join('') : '<p style="color:#7a6a5c;padding:0 10px;">No detailed specs added yet.</p>'}
    </div>
    <div class="detail-body">
      <p>${p.description}</p>
    </div>
  `;
  document.getElementById('detail-share-btn').onclick = ()=> shareItem(p.name, window.location.href);
}

/* ================= SUGGESTIONS STRIP ================= */
function renderSuggestions(){
  const el = document.getElementById('suggestions-strip');
  if(!el) return;
  if(PHONE_DATA.length === 0){ el.innerHTML=''; return; }
  const mySlug = pageId();
  const pool = PHONE_DATA.filter(p=>p.slug !== mySlug);
  const picks = pool.sort(()=>0.5-Math.random()).slice(0,6);
  el.innerHTML = `<div class="section-title">You might also like</div>
    <div class="suggest-strip">
      ${picks.map(p=>`<a class="suggest-card" href="${root()}${p.url}">
        <div class="src">${p.region==='usa'?'USA':'India'}</div>
        <div class="nm">${p.name}</div>
        <div class="pr">${p.currency}${p.price.toLocaleString()}</div>
      </a>`).join('')}
    </div>`;
}

/* ================= COMMENTS ================= */
function renderComments(){
  const el = document.getElementById('comments-section');
  if(!el) return;
  const key = 'gp_comments_' + pageId();
  const load = ()=> JSON.parse(localStorage.getItem(key) || '[]');
  const save = (list)=> localStorage.setItem(key, JSON.stringify(list));

  const draw = ()=>{
    const list = load();
    el.querySelector('#comments-list').innerHTML = list.length ? list.map(c=>`
      <div class="comment-item"><span class="who">${c.name}</span><span class="when">${c.when}</span><p>${c.text}</p></div>
    `).join('') : '<p style="color:#7a6a5c;font-size:14px;">No comments yet — be the first to share your experience.</p>';
  };

  el.innerHTML = `
    <div class="section-title">Comments & Reviews</div>
    <div class="comment-form">
      <input type="text" id="c-name" placeholder="Your name">
      <textarea id="c-text" placeholder="Share your experience with this phone..."></textarea>
      <button id="c-submit">Post comment</button>
    </div>
    <div id="comments-list" style="margin-top:14px;"></div>
  `;
  draw();
  el.querySelector('#c-submit').onclick = ()=>{
    const name = el.querySelector('#c-name').value.trim() || 'Anonymous';
    const text = el.querySelector('#c-text').value.trim();
    if(!text) return;
    const list = load();
    list.unshift({name, text, when: new Date().toLocaleDateString()});
    save(list);
    el.querySelector('#c-text').value = '';
    draw();
  };
}

/* ================= SITE REVIEW (homepage) ================= */
function renderSiteReview(){
  const el = document.getElementById('site-review-section');
  if(!el) return;
  const key = 'gp_site_reviews';
  const load = ()=> JSON.parse(localStorage.getItem(key) || '[]');
  const save = (l)=> localStorage.setItem(key, JSON.stringify(l));
  const draw = ()=>{
    const list = load();
    el.querySelector('#site-reviews-list').innerHTML = list.length ? list.map(r=>`
      <div class="comment-item"><span class="who">${r.name}</span><span class="when">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)} · ${r.when}</span><p>${r.text}</p></div>
    `).join('') : '<p style="color:#7a6a5c;font-size:14px;">No reviews yet.</p>';
  };
  el.innerHTML = `
    <div class="section-title">Rate PowerG</div>
    <div class="comment-form">
      <input type="text" id="sr-name" placeholder="Your name">
      <select id="sr-stars" style="width:100%;padding:9px;border:1px solid #f0ddc8;border-radius:8px;margin-bottom:8px;">
        <option value="5">★★★★★ Excellent</option>
        <option value="4">★★★★☆ Good</option>
        <option value="3">★★★☆☆ Okay</option>
        <option value="2">★★☆☆☆ Poor</option>
        <option value="1">★☆☆☆☆ Bad</option>
      </select>
      <textarea id="sr-text" placeholder="Tell us what you think of the site..."></textarea>
      <button id="sr-submit">Submit review</button>
    </div>
    <div id="site-reviews-list" style="margin-top:14px;"></div>
  `;
  draw();
  el.querySelector('#sr-submit').onclick = ()=>{
    const name = el.querySelector('#sr-name').value.trim() || 'Anonymous';
    const stars = parseInt(el.querySelector('#sr-stars').value);
    const text = el.querySelector('#sr-text').value.trim();
    if(!text) return;
    const list = load();
    list.unshift({name, stars, text, when: new Date().toLocaleDateString()});
    save(list);
    el.querySelector('#sr-text').value = '';
    draw();
  };
}

/* ================= FOOTER ================= */
function renderFooter(){
  const el = document.getElementById('site-footer');
  if(!el) return;
  el.innerHTML = `PowerG — independent gadget launch coverage. Specs and prices are collected from public sources and may change.`;
  el.setAttribute('style','border-top:1px solid #f0ddc8;padding:26px 20px;color:#7a6a5c;font-size:13px;text-align:center;margin-top:20px;display:block;');
}

/* ================= FILTER/SORT BAR ================= */
function wireFilterSortBar(){
  const sortSel = document.getElementById('sort-select');
  if(sortSel) sortSel.onchange = (e)=> sortCards(e.target.value);
  populateAllBrandSelects();
  const brandFilterTop = document.getElementById('filter-brand-select');
  if(brandFilterTop) brandFilterTop.onchange = (e)=> filterByBrand(e.target.value);
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', async ()=>{
  renderHeader();
  renderFooter();

  PHONE_DATA = await loadPhoneData();

  renderPhoneDetail();
  renderCategoryGrid();
  renderEndlessFeed();
  renderListingFeed();
  wireFilterSortBar();
  enhanceCards();
  renderSuggestions();
  renderComments();
  renderSiteReview();

  const params = new URLSearchParams(window.location.search);
  if(params.get('q')) filterCardsByName(params.get('q'));
  if(params.get('min') || params.get('max')){
    filterCardsByPrice(parseFloat(params.get('min'))||0, parseFloat(params.get('max'))||Infinity);
  }
});
