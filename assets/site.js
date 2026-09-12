/* ============ Gadgetproof — shared site logic ============ */

const PHONE_DATA = [
  {slug:"poco-m8-power-5g", name:"POCO M8 Power 5G", brand:"POCO", region:"india", price:24390, currency:"₹", blurb:"8000mAh battery, Snapdragon 4 Gen 4", url:"phones/poco-m8-power-5g.html"},
  {slug:"oneplus-n6-5g", name:"OnePlus N6 5G", brand:"OnePlus", region:"india", price:24999, currency:"₹", blurb:"8000mAh, 45W Super Charging", url:"phones/oneplus-n6-5g.html"},
  {slug:"iqoo-z10-turbo-pro", name:"iQOO Z10 Turbo Pro", brand:"iQOO", region:"india", price:23990, currency:"₹", blurb:"Gaming-focused mid-ranger", url:"phones/iqoo-z10-turbo-pro.html"},
  {slug:"motorola-edge-70-fusion", name:"Motorola Edge 70 Fusion", brand:"Motorola", region:"india", price:29190, currency:"₹", blurb:"Slim design, balanced performance", url:"phones/motorola-edge-70-fusion.html"},
  {slug:"realme-p4-pro", name:"realme P4 Pro", brand:"realme", region:"india", price:28999, currency:"₹", blurb:"Vibrant AMOLED, dual camera", url:"phones/realme-p4-pro.html"},
  {slug:"iphone-18-pro-max", name:"iPhone 18 Pro Max", brand:"Apple", region:"usa", price:1299, currency:"$", blurb:"A19 Pro chip, titanium frame", url:"phones/iphone-18-pro-max.html"},
  {slug:"galaxy-s26-ultra", name:"Samsung Galaxy S26 Ultra", brand:"Samsung", region:"usa", price:1399, currency:"$", blurb:"S Pen, Snapdragon 8 Elite Gen 5", url:"phones/galaxy-s26-ultra.html"},
  {slug:"pixel-11-pro-xl", name:"Google Pixel 11 Pro XL", brand:"Google", region:"usa", price:1299, currency:"$", blurb:"48MP redesigned sensor, Tensor G6", url:"phones/pixel-11-pro-xl.html"},
  {slug:"galaxy-z-fold8", name:"Samsung Galaxy Z Fold8", brand:"Samsung", region:"usa", price:1899, currency:"$", blurb:"New wide foldable form factor", url:"phones/galaxy-z-fold8.html"}
];

const GADGET_CATEGORIES = ["Phones","Earbuds","Tablets","Laptops","Cameras","TVs","Headphones","Washing Machines","Fans","Coolers","AC"];

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

/* ================= HEADER ================= */
function renderHeader(){
  const el = document.getElementById('site-header');
  if(!el) return;
  const r = root();
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
      <div class="ad-slot">Ad space</div>
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

  wireHeaderEvents(region);
  startClock();
  renderAuth();
  populateBrandSelect(region);
  renderCompareBar();
}

function wireHeaderEvents(region){
  const q = (s)=>document.querySelector(s);
  const qa = (s)=>document.querySelectorAll(s);

  // language
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

  // nav dropdown toggles (desktop)
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

  // price range apply (desktop + mobile)
  const applyRange = (minEl,maxEl)=>{
    const min = parseFloat(minEl.value)||0;
    const max = parseFloat(maxEl.value)||Infinity;
    filterCardsByPrice(min,max);
    closeMobileMenu();
  };
  if(q('#range-apply')) q('#range-apply').onclick = ()=> applyRange(q('#range-min'), q('#range-max'));
  if(q('#m-range-apply')) q('#m-range-apply').onclick = ()=> applyRange(q('#m-range-min'), q('#m-range-max'));

  // gadgets category clicks
  qa('[data-cat]').forEach(b=>b.onclick = ()=>{
    if(b.dataset.cat === 'Phones'){
      window.location.href = root() + (region==='usa' ? 'usa.html' : 'india.html');
    } else {
      toast(b.dataset.cat + ' section coming soon.');
    }
  });

  // top lists
  qa('#panel-top button[data-n]').forEach(b=>b.onclick = ()=> showTopN(parseInt(b.dataset.n)));
  if(q('#m-top5')) q('#m-top5').onclick = ()=>{ showTopN(5); closeMobileMenu(); };
  if(q('#m-top10')) q('#m-top10').onclick = ()=>{ showTopN(10); closeMobileMenu(); };
  if(q('#m-top15')) q('#m-top15').onclick = ()=>{ showTopN(15); closeMobileMenu(); };

  // brand select
  if(q('#brand-select')) q('#brand-select').onchange = (e)=> filterByBrand(e.target.value);

  // compare nav button -> scroll to compare bar / info
  if(q('#nav-compare-btn')) q('#nav-compare-btn').onclick = ()=>{
    if(getCompareList().length === 0) toast('Tick the compare box on any 2-3 phones first.');
    else openCompareModal();
  };
  if(q('#m-compare-btn')) q('#m-compare-btn').onclick = ()=>{
    closeMobileMenu();
    if(getCompareList().length === 0) toast('Tick the compare box on any 2-3 phones first.');
    else openCompareModal();
  };

  // mobile menu open/close
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

  // search
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

  // compare modal close
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
  const set = (id,txt)=>{ const e=document.getElementById(id); if(e) e.firstChild.textContent = txt+' '; };
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

/* ================= CLOCK (auto, untouchable) ================= */
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

/* ================= AUTH (client-side demo) ================= */
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
function populateBrandSelect(region){
  const sel = document.getElementById('brand-select');
  if(!sel) return;
  const brands = [...new Set(PHONE_DATA.filter(p=>p.region===region).map(p=>p.brand))];
  brands.forEach(b=>{
    const o = document.createElement('option');
    o.value = b; o.textContent = b;
    sel.appendChild(o);
  });
}
function sortCards(order){
  const grid = document.querySelector('.card-grid');
  if(!grid) return;
  const cards = Array.from(grid.querySelectorAll('.card'));
  cards.sort((a,b)=>{
    const pa = parseFloat(a.dataset.price), pb = parseFloat(b.dataset.price);
    return order === 'low' ? pa-pb : pb-pa;
  });
  cards.forEach(c=>grid.appendChild(c));
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
  const fullUrl = url;
  if(navigator.share){
    navigator.share({title: title + ' — Gadgetproof', text: title + ' on Gadgetproof', url: fullUrl}).catch(()=>{});
  } else {
    navigator.clipboard.writeText(fullUrl).then(()=> toast('Link copied to clipboard!'));
  }
}

/* ================= CARD ENHANCEMENT ================= */
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

/* ================= SUGGESTIONS STRIP ================= */
function renderSuggestions(){
  const el = document.getElementById('suggestions-strip');
  if(!el) return;
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
    <div class="section-title">Rate Gadgetproof</div>
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
  el.innerHTML = `Gadgetproof — independent gadget launch coverage. Specs and prices are collected from public sources and may change.`;
  el.setAttribute('style','border-top:1px solid #f0ddc8;padding:26px 20px;color:#7a6a5c;font-size:13px;text-align:center;margin-top:20px;display:block;');
}

/* ================= FILTER/SORT BAR (listing pages) ================= */
function wireFilterSortBar(){
  const sortSel = document.getElementById('sort-select');
  if(sortSel) sortSel.onchange = (e)=> sortCards(e.target.value);
  const brandFilterTop = document.getElementById('filter-brand-select');
  if(brandFilterTop){
    const region = currentRegion();
    const brands = [...new Set(PHONE_DATA.filter(p=>p.region===region).map(p=>p.brand))];
    brands.forEach(b=>{
      const o=document.createElement('option'); o.value=b; o.textContent=b; brandFilterTop.appendChild(o);
    });
    brandFilterTop.onchange = (e)=> filterByBrand(e.target.value);
  }
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', ()=>{
  renderHeader();
  renderFooter();
  enhanceCards();
  wireFilterSortBar();
  renderSuggestions();
  renderComments();
  renderSiteReview();

  // handle ?q= search param on load
  const params = new URLSearchParams(window.location.search);
  if(params.get('q')) filterCardsByName(params.get('q'));
  if(params.get('min') || params.get('max')){
    filterCardsByPrice(parseFloat(params.get('min'))||0, parseFloat(params.get('max'))||Infinity);
  }
});
